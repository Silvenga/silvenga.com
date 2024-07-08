---
tags:
  - ubuntu
title: "Tip: Quite Ubuntu's Login Message"
description: Remove the annoying messages from Canonical, without .hushlogin.
---

When logging into an Ubuntu server you're normally greeted with the so called "Message of the Day" (`motd`). This was mostly fine, but lately Canonical has felt the need to advertise their products:

![A motd with multiple ads about different products](/posts/2024/images/annoying-motd.png "Like, come on!")

Yes, the standard `touch ~/.hushlogin` of course works, but this removes everything and disables the "Last login" message, which I find useful. No, I think the better approach is to disable specific parts of the message.

Ultimately, this message is controlled by login executing the scripts in the `/etc/update-motd.d` directory.

```bash
cd /etc/update-motd.d
ls -las
```

```output
total 56
0 drwxr-xr-x 1 root root  410 Jul  8 02:16 .
0 drwxr-xr-x 1 root root 3198 Jul  8 02:14 ..
4 -rwxr-xr-x 1 root root 1220 Oct 15  2021 00-header
4 -rw-r--r-- 1 root root 1151 Jan  2  2024 10-help-text
4 lrwxrwxrwx 1 root root   46 Jul  6 15:28 50-landscape-sysinfo -> /usr/share/landscape/landscape-sysinfo.wrapper
8 -rw-r--r-- 1 root root 5023 Oct 15  2021 50-motd-news
4 -rwxr-xr-x 1 root root   84 Feb 19  2022 85-fwupd
4 -rw-r--r-- 1 root root  218 Jul 14  2021 90-updates-available
4 -rw-r--r-- 1 root root  296 Apr 30 20:35 91-contract-ua-esm-status
4 -rw-r--r-- 1 root root  558 Apr 18  2022 91-release-upgrade
4 -rwxr-xr-x 1 root root  165 Feb 19  2021 92-unattended-upgrades
4 -rwxr-xr-x 1 root root  379 Mar 30  2022 95-hwe-eol
4 -rwxr-xr-x 1 root root  111 Aug 17  2020 97-overlayroot
4 -rwxr-xr-x 1 root root  142 Nov 26  2020 98-fsck-at-reboot
4 -rwxr-xr-x 1 root root  144 Nov 26  2020 98-reboot-required
```

Silencing these scripts is as simple as removing the execution bit.

This is what I use these days.

```bash
chmod -x \
    10-help-text \
    50-landscape-sysinfo \
    50-motd-news \
    90-updates-available \
    91-contract-ua-esm-status \
    91-release-upgrade
```
