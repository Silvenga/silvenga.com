Title: Missing Dependencies With Alpine Docker Images
Description: Missing dependencies when upgrading some Alpine package.
---

![Alpine + Docker = Awsome](/content/images/2018/docker+alpine.png)

I have a lot of Docker images using Alpine Linux as a base. This is awesome when trying to get the most streamlined images possible. 24MB for a complete image is amazing!

```log
# docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
tordocker_tor       latest              199b9631b0fd        5 minutes ago       24.2MB
```

Soooo, lately, I've been seeing a lot of packages that I try upgrading are now broken with my Dockerfiles (even the same version is of working images fails now). Below is an extremely simple of the Dockerfile I use for my TOR relay node.

```Dockerfile
FROM alpine:3.6

RUN apk add 'gettext=0.19.8.1-r1' --no-cache
RUN apk add 'tor=0.3.1.9-r0' --no-cache \
    --repository http://dl-cdn.alpinelinux.org/alpine/edge/community

ADD entry.sh /entry.sh
ADD torrc.template.ini torrc.template.ini

CMD ["/bin/sh", "entry.sh"]
```

This Docker image does not build correctly complaining about missing dependencies - in fact, `apk` is complaining about not have libraries normally found in OpenSSL (`libcrypto.so` and `libssl.so`).

```log
ERROR: unsatisfiable constraints:
  so:libcrypto.so.42 (missing):
    required by:
                 tor-0.3.1.9-r0[so:libcrypto.so.42]
                 tor-0.3.1.9-r0[so:libcrypto.so.42]
                 tor-0.3.1.9-r0[so:libcrypto.so.42]
                 tor-0.3.1.9-r0[so:libcrypto.so.42]
                 tor-0.3.1.9-r0[so:libcrypto.so.42]
  so:libssl.so.44 (missing):
    required by: tor-0.3.1.9-r0[so:libssl.so.44]
                 tor-0.3.1.9-r0[so:libssl.so.44]
                 tor-0.3.1.9-r0[so:libssl.so.44]
                 tor-0.3.1.9-r0[so:libssl.so.44]
                 tor-0.3.1.9-r0[so:libssl.so.44]
```

So standard troubleshooting time, let's try to install OpenSSL (even though `apk` should have pulled that in).

```log
/ # apk --update add openssl
fetch http://dl-cdn.alpinelinux.org/alpine/v3.6/main/x86_64/APKINDEX.tar.gz
fetch http://dl-cdn.alpinelinux.org/alpine/v3.6/community/x86_64/APKINDEX.tar.gz
(1/3) Installing libcrypto1.0 (1.0.2n-r0)
(2/3) Installing libssl1.0 (1.0.2n-r0)
(3/3) Installing openssl (1.0.2n-r0)
Executing busybox-1.26.2-r5.trigger
OK: 7 MiB in 14 packages
/ # apk add 'tor=0.3.1.9-r0' --update --repository http://dl-cdn.alpinelinux.org/alpine/edge/community
fetch http://dl-cdn.alpinelinux.org/alpine/edge/community/x86_64/APKINDEX.tar.gz
fetch http://dl-cdn.alpinelinux.org/alpine/v3.6/main/x86_64/APKINDEX.tar.gz
fetch http://dl-cdn.alpinelinux.org/alpine/v3.6/community/x86_64/APKINDEX.tar.gz
ERROR: unsatisfiable constraints:
  so:libcrypto.so.42 (missing):
    required by: tor-0.3.1.9-r0[so:libcrypto.so.42] tor-0.3.1.9-r0[so:libcrypto.so.42] tor-0.3.1.9-r0[so:libcrypto.so.42] tor-0.3.1.9-r0[so:libcrypto.so.42] tor-0.3.1.9-r0[so:libcrypto.so.42]
  so:libssl.so.44 (missing):
    required by: tor-0.3.1.9-r0[so:libssl.so.44] tor-0.3.1.9-r0[so:libssl.so.44] tor-0.3.1.9-r0[so:libssl.so.44] tor-0.3.1.9-r0[so:libssl.so.44] tor-0.3.1.9-r0[so:libssl.so.44]
```

Hmmm... no effect - well that sucks. 

So, after I spent a little more time looking into this problem (basically going through the changes on source control). I discovered that many Alpine maintainer are recompiling their projects to target LibreSSL. With that knowledge I went searching for where LibreSSL was hiding these days in the Alpine repositories - and alas I found the missing libraries in the `edge/main` repository.

Below is a fixed Dockerfile:

```Dockerfile
FROM alpine:3.6

RUN apk add 'gettext=0.19.8.1-r1' --no-cache
RUN apk add 'tor=0.3.1.9-r0' --no-cache \
    --repository http://dl-cdn.alpinelinux.org/alpine/edge/community \
    --repository http://dl-cdn.alpinelinux.org/alpine/edge/main

ADD entry.sh /entry.sh
ADD torrc.template.ini torrc.template.ini

CMD ["/bin/sh", "entry.sh"]
```

Notice that I added `--repository http://dl-cdn.alpinelinux.org/alpine/edge/main` as a source to the problematic line. So, yeah, working images again!