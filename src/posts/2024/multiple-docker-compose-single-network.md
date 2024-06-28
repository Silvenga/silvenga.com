---
tags:
  - posts
  - docker
title: "Multiple Docker Compose's in a Single Network"
description: Using a single Docker network across multiple docker-compose files - and a little about using a DNS resolver container as well.
---
## Quick Introduction

Even after using Docker/Containers for years, it's not entirely obvious in how to join many Docker Compose projects using a single Docker network. For a while I was abusing the default bridge network - but given the limitations (e.g. container name resolution is disabled) it was starting to get annoying.

So this is a quick walk-though in creating a network manually, and then using that network within multiple docker-compose projects.

**To the CLI!**

## Create the Network

First we can create a network. In my case, I'm calling it `internal`:

```bash
docker network create \
    internal \
    --subnet=172.24.0.0/24 \
    --driver=bridge \
    --gateway 172.24.0.1 \
    --ip-range 172.24.0.128/25
```

The subnet was picked randomly by myself, really any can be used, just make sure there's no subnet overlapping on your network. I'm specifying a `ip-range` because I want to host a DNS container in this network (and DNS clients typically need a explicit IP address) - `172.24.0.128/25` is just a subset of the `172.24.0.0/24`. The driver is likely always going to be `brdige`, but if you need to vlan or bridge with the host's network, you might use a different driver.

What's nice about manually created networks, everything you would expect to work, just works e.g. container name resolution. There's no default limitations like the default `bridge` network.

## Configure Docker Compose

Now specifying this manually created network is rather straight forward, there's two sections involved that would be set on each Docker Compose projects you have.

**First**, on the top-level of the `docker-compose.yaml` file, specify the manually created network (again `internal` in this example). To tell docker-compose to suppress the default managing of the network, `external: true` is used.

```yaml
services: {}
networks:
  internal:
    external: true
```

And **second**, on the container's themselves, specify the manually created network, and this can be done in two ways:

Using YAML list syntax:

```yaml
services:
  container-name:
    networks:
      - internal
```

Or using YAML object syntax (need if you are going to further configure the network for this container).

```yaml
services:
  container-name:
    networks:
      internal:
        ipv4_address: 172.24.0.2
```

Note that here I'm specifying a static IP address for the container. If no address is specified, a dynamic IP address will be assigned based on your IP range when creating the network (still a static IP address, just dynamically assigned by Docker, e.g. DHCP isn't being used here).

## An Example

So at the end of the day, if I was setting up a DNS server within my docker network, my Docker Compose would look like:

```yaml
services:
  unbound:
    image: ghcr.io/crazy-max/unbound:latest
    labels:
      com.centurylinklabs.watchtower.enable: "true"
    expose:
      - 53/tcp
      - 53/udp
    volumes:
      - "./config:/config:ro"
    networks:
      internal:
        ipv4_address: 172.24.0.2
    restart: unless-stopped
    user: "0:0"

networks:
  internal:
    external: true
```

> I'm forcing running as `root` here just so I can bind to port `53`, as remember, there's no Docker port mapping, like we would see if we exposed ports to our Docker host. It feels a bit nasty, but that's how port allocations work on Linux.

And say I want to have my Warrior container using this DNS server, I have another `docker-compose.yaml` file with this:

```yaml
services:
  warrior:
    image: atdr.meo.ws/archiveteam/warrior-dockerfile:latest
    labels:
      com.centurylinklabs.watchtower.enable: "true"
    environment:
      DOWNLOADER: silvenga
      CONCURRENT_ITEMS: 2
      SELECTED_PROJECT: auto
    expose:
      - 8001
    mem_limit: 1g
    cpu_count: 2
    networks:
      - internal
    dns:
      - 172.24.0.2
    restart: unless-stopped

networks:
  internal:
    external: true
```

I'm also configuring my warrior container to use the DNS container above (with the static IP address of `172.42.0.2`).

> Warrior is a daemon you can run locally, it helps the Archive.org project get around rate limiting issues with their WayBackMachine. While I'm always happy to donate some of my bandwidth to archiving projects - warrior likes to each RAM, depending on what the current project is - so I explicitly limit the RAM for system stability.

## Bonus: Traefik

[Traefik](https://doc.traefik.io/traefik/) (Pronounced "Traffic") is a common ingress container for Docker - it can automatically find your containers and act as a reverse proxy for them. This is really cool when you combine Traefik's native Let's Encrypt support and any containers you want to host on the same HTTPS port.

A common problem when using `traefik` occurs when you have multiple Docker Composes, normally each compose project creates an isolated network - so different container projects can't really talk to each other - and this messes up Traefik (since Traefik is also running in a separate network).

The equally common solution has been to use the bridge network mode:

```yaml
network_mode: bridge
```

But as I've mentioned before, this has limitations, and is kind of a hack. If we configure Traefik to use a manually created network, we get the bests of both worlds.

I use the following `traefik` compose on many of my external servers.

```yaml
services:
  traefik:
    image: traefik:latest
    command:
      # - --log.level=DEBUG
      - --providers.docker=true
      - --providers.docker.exposedByDefault=false
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
      - --providers.file.filename=/opt/traefik-tls.yaml
      - --providers.file.watch=true
    ports:
      - 80:80
      - 443:443
    networks:
      - internal
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./data/certs:/etc/secrets/certs:ro
      - ./data/traefik-tls.yaml:/opt/traefik-tls.yaml:ro
    labels:
      com.centurylinklabs.watchtower.enable: "true"
      traefik.enable: true
      traefik.http.routers.http-catchall.rule: hostregexp(`{host:.+}`)
      traefik.http.routers.http-catchall.entrypoints: web
      traefik.http.routers.http-catchall.middlewares: redirect-to-https@docker
      traefik.http.middlewares.redirect-to-https.redirectscheme.scheme: https
    dns:
      - 172.24.0.2

networks:
  internal:
    external: true
```

Using the manually created Docker network does clean up the standard `traefik` deployment.

> When joining Traefik to the same network as all your containers, you might want to enable `providers.docker.exposedByDefault = false` to prevent containers from being accidentally exposed.
