---
tags:
  - posts
  - fail2ban
  - ufw
  - old-notes-as-posts
title: Fail2ban Repeat UFW Offenders
description: A post about a fail2ban jail for repeated UFW nucenses.
---
## The Jail

[Fail2Ban](https://github.com/fail2ban/fail2ban) is a great project, completely recommended for any public facing server. For the likewise, this is a [UFW](https://help.ubuntu.com/community/UFW) jail to block repeated UFW offenders.

Create a file `/etc/fail2ban/filter.d/ufw-blocked.conf` with:

```ini
[Definition]
failregex = ^.*\[UFW BLOCK\] .+ SRC=<HOST> DST=.*$
ignoreregex =
```

And update `/etc/fail2ban/jail.local` with something like the following:

```ini
[DEFAULT]
bantime = 1h
bantime.increment = true
bantime.rndtime = 3600
ignoreip = 127.0.0.1/8 ::1 10.0.0.0/8 172.16.0.0/12 192.168.0.0/16

[ufw-blocked]
enabled = true
logpath = /var/log/ufw.log
banaction = iptables-allports
```

And make sure `fail2ban` gets the new configuration:

```bash
systemctl restart fail2ban
```

## Why?

The idea is that anyone port scanning is up to no good, so just block everything (see `iptables-allports`) until they go away - might also make the server a bit more stealthy. To be honest, I likely just added this to make the UFW logs less spammy.
