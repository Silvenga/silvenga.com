---
title: Notes on OpenVPN Obfuscating
date: 2015-01-24
description: Some notes on how to setup OpenVPN obfuscation using Obfproxy.
aliases: /openvpn-obfuscating/index.html
archived: 2024-06-30
---

> This is a work in progress. I would very much like to make a GUI for the windows version of obfsproxy, and a better wrapper for Ubuntu.

> Below is weekend muse which works, but IMHO rather hackish'ly.

## Server (Ubuntu 14.04 LTS)

`obfsproxy` is included in the default Ubuntu Trusty repos now (although a bit out of date). It contains the pluggable transport `obfs3`.

```bash
apt-get install obfsproxy

# Default OVPN port: 1194
# Obfs3 port: 8443

obfsproxy --log-file obfs.log --log-min-severity=info obfs3 --dest=127.0.0.1:1194 server 0.0.0.0:8443
```

## Client (Windows 8.1)

There isn't any recent packages for Windows, but thankfully the binaries are included by default in the `Tor Browser Bundle` (which I ripped from).

Windows binaries:

https://store.silvenga.com/external/obfsproxy/obfsproxy-win-4.0.3.zip

https://store.silvenga.com/external/obfsproxy/obfsproxy-win-5.0.2.zip

Signature via "Mark Lopez (Authority) 4096R/FEF78709"

https://store.silvenga.com/external/obfsproxy/obfsproxy-win-4.0.3.zip.asc

https://store.silvenga.com/external/obfsproxy/obfsproxy-win-5.0.2.zip.asc

```bash
# Connect via socksv5 127.0.0.1:2194
#  with host server:8443

obfsproxy.exe --log-file=obfsproxy.log --log-min-severity=info obfs3 socks 127.0.0.1:2194
```
