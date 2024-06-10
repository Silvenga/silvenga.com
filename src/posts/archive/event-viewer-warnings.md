---
title: WHEA Event Viewer Warnings
description: A corrected hardware error has occurred...
---

I've been trying to debug any problem that makes my daily driver PC unstable. Previously, I debugged a [crash in KeePass]({{ "/posts/archive/keepass-crash.md" | inputPathToUrl }}) occurring whenever my machine went into power savings. It turned out the crash was from from an audio driver (this will be important later).

A couple days later, I started seeing the following error, one or two an hour.

```
A corrected hardware error has occurred.

Component: PCI Express Root Port
Error Source: Advanced Error Reporting (PCI Express)

Primary Bus:Device:Function: 0x0:0x1:0x0
Secondary Bus:Device:Function: 0x0:0x0:0x0
Primary Device Name:PCI\VEN_8086&DEV_4C01&SUBSYS_86941043&REV_01
Secondary Device Name:
```

But while debugging a DNS issue on my network (which was from a bad Domain Controller I had to decommission), I noticed the same error was now spamming my Event Logs - hundreds a minute, completely making my Event Viewer logs useless. So after fixing my DNS issue (It's always DNS) I started looking into this issue.

At first Google search, this warning is just informative... which, is fine... doesn't help me though. So I looked a little deeper.

Vendor `ven_8086` is apparently Intel, device `DEV_4C01` is just the Intel Chipset (so not helpful), and the sub-system `SUBSYS_86941043` is the USB controller. A USB controller having an issue, now that's interesting...

In an attempt to removal as many variables as I could with debugging KeePass crashing from an audio change, I disabled the `USB Audio` feature on my Asus motherboard... Could that be related?

Yes, re-enabling USB audio removed this error from my Event Logs. It makes a bit of sense, I guess...
