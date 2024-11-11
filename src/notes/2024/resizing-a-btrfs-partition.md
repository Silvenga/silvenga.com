---
title: Resizing a BTRFS Partition
description: Since it's not entirely obvious, these are my notes on expanding a BTRFS partition for a KVM guest.
---

Since it's not entirely obvious, these are my notes on expanding a BTRFS partition for a KVM guest.

On the shutdown guest, resize the virtual disk:

```bash
qemu-img resize vm.qcow2 180G
```

Then after booting the guest, resize the last partition:

```bash
parted /dev/vda
```

```output
Warning: Not all of the space available to /dev/vda appears to be used, you can fix the GPT to use all of the space (an extra 310378496 blocks) or continue with the current setting?
Fix/Ignore? fix

(parted) resizepart 3 100%
Warning: Partition /dev/vda3 is being used. Are you sure you want to continue?
Yes/No? yes

(parted) print

Model: Virtio Block Device (virtblk)
Disk /dev/vda: 193GB
Sector size (logical/physical): 512B/512B
Partition Table: gpt
Disk Flags:

Number  Start   End     Size    File system  Name     Flags
 1      1049kB  2097kB  1049kB               primary  bios_grub
 2      2097kB  1074MB  1072MB  ext4         primary
 3      1074MB  193GB   192GB   btrfs        primary
```

> In theory, resizing the partition on a mounted system is safe, given the filesystem doesn't know that this space exists yet.

And finally, perform a live resize of the BTRFS filesystem:

```bash
btrfs filesystem resize max /
```

And done!

```output
lsblk

NAME   MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
vda    254:0    0  180G  0 disk
├─vda1 254:1    0    1M  0 part
├─vda2 254:2    0 1022M  0 part /boot
└─vda3 254:3    0  179G  0 part /mnt/swap
                                /
```
