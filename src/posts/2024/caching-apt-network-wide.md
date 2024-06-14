---
tags:
  - posts
  - linux
  - apt
  - old-notes-as-posts
title: Caching Apt - Network Wide
description: How I setup Apt to use a caching proxy (e.g. apt-cacher-ng) with a safe fallback.
---
## Introduction

On a network with many servers, the amount of traffic from updates can actually start to add up - but I think more importantly, we should endeavor to reduce the load on community mirrors, ran mostly by volunteers. The standard method of caching in Apt is using something like the [Apt-Cacher NG](https://www.unix-ag.uni-kl.de/~bloch/acng/) project, acting as a forward HTTP proxy.

Although, critically, it's best to treat the local Apt cache as strictly "best-effort" - so we want to make sure that Apt can still function when the cache is having issues. This is my setup that I typically employ to support a graceful failure mode.

## Configurating Apt

Assuming we already have an `apt-cacher-ng` host on the network (there's a bunch of containerized examples), the next step is to configure Apt to use this proxy - and there's only 3 files to add.

For configuration (easily managed by infustructure-as-code), I use a defaults file at `/etc/default/apt-proxy-checker`, containing:

```bash
APT_PROXY_ENABLED=1
APT_PROXY_HOST=<apt-cacher-ng address>
APT_PROXY_PORT=<apt-cacher-ng port>
```

This file is ultimately sourced by a script that is ran by Apt, to dynamically calculate the proxy to use (if any). I stick this script in path `/usr/local/bin/apt-proxy-checker.sh` with the contents:

```bash
#!/bin/bash

source /etc/default/apt-proxy-checker

if [[ $APT_PROXY_ENABLED == "1" ]] && nc -w1 -z $APT_PROXY_HOST $APT_PROXY_PORT &>/dev/null; then
    echo "http://$APT_PROXY_HOST:$APT_PROXY_PORT"
else
    echo "DIRECT"
fi
```

And of course, make the script executable:

```bash
chmod 755 /usr/local/bin/apt-proxy-checker.sh
```

Apt expects a string to be returned by this script - either the literal `DIRECT` or a proxy (in this case, an HTTP proxy). The script uses the [Netcat](https://nc110.sourceforge.io/) project to first attempt to open a socket to `apt-cacher-ng` - acting as a kind of cheap health check. If routable and `apt-cacher-ng` responses, then it's assumed a cache can be used.

To instruct Apt to use this script, I add the configuration `/etc/apt/apt.conf.d/10apt-cache` with the contents:

```ini
Acquire::HTTP::ProxyAutoDetect "/usr/local/bin/apt-proxy-checker.sh";
Acquire::HTTPS::Proxy "false";
```

Note that Apt (and really a lot of Linux) loads configurations in lexical order, so it's best practice to prefix the human readable file names with some number - to ensure ordering. A low number like `10` allows for other configurations to override this one if needed (e.g. by use the number `90`).

And that's it.
