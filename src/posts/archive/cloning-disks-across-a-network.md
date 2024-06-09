---
title: Cloning Disks across a Network
description: How to clone disks across a network.
---

I was migrating one dedicated server to dedicated another in a different data center. I immediately reached for [Clonezilla](https://clonezilla.org/), as my general "disk cloner". Turns out that my data center provider limit their KVM network to ~400KiB/s, so actually booting Clonezilla into RAM look over an hour, for each server...

After using the standard `remote_source`/`remote_dest` options, I discovered that Clonezilla reads complete junk from my disks (root on btrfs RAID + luks) for some completely unknown reason (even with block copying enabled). I assumed it was from my somewhat exotic disk setup. Either way, that completely nixed Clonezilla from my list of options.

Reaching into my toolbox left me with `dd`. I've never `dd` over a network, but it seems rather trivial. In theory, I'll just [bit bang](https://en.wikipedia.org/wiki/Bit_banging) blocks from one server to another.

So I booted both systems into a PXE rescue RAM disk and installed [`tmux`](https://man7.org/linux/man-pages/man1/tmux.1.html) as my screen tool. Ultimately, the command I used (on the target machine) was:


```bash
ssh root@host dd if=/dev/sdb bs=16M | dd of=/dev/sdb bs=16M status=progress
```

My disks were encrypted, so I figured that compression wouldn't be the most useful thing to do - I suspected I might be hitting SSH crypto limits alone (which is single threaded, if I remember correctly).

The command saturates my 1Gbps link at around 80%. Running two in parallel appears to make the transfer network bound.
