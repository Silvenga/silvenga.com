---
tags:
  - posts
  - ubuntu
title: "Tip: Switch to the Ubuntu HWE Kernel"
description: How to switch from the default Ubuntu kernel to the HWE kernel for fun and profit.
---
## Prefix

For Ubuntu 22.04, the kernel originally shipped was `5.15`. The latest version as of writing was `5.15.0-112` - or the 112's release on the `5.15` branch.

You can see what kernel is installed by asking Apt:

```bash
apt-cache policy linux-generic
```

Most (All?) Apt based Linux distributions ship the Linux kernel as a Apt package. Likewise, in Ubuntu, the `linux-generic` meta-package that that keeps the kernel up-to-date. Typically, Ubuntu uses a certain kernel branch, and releases updates based on that branch.

> Everything after the dash in the Apt version is typically reserved for the maintainer (Canonical in this case), to prevent "overloading" the version from upstream. Strictly, the `-112` is unrelated to the actual kernel versions (e.g. `5.15`).

While running the "out-of-the-box" kernel is going to be as stable as you can be, it'll lack a lot of features found in more modern kernels. This is especially important for "in-tree" modules - or modules that are developed within the [Linux repository](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/). One such module is BTRFS, and since BTRFS development is almost completely on upstream (e.g. on `linux-next`), features and performance improvements are unlikely to happen if you're on an old kernel branch (e.g. `5.15`).

To avoid needing to compile your own kernels (entering into the realm of "you really need to know what you're doing, unstable"), Ubuntu packages the so called HWE kernel ("Hardware Enablement", which is just a bad name). This HWE kernel package provides a newer kernel (sometimes much newer) - although, not typically "bleeding-edge", but this works for most users.

Working with HWE kernels of course comes with it's own problems, so the risk needs to be managed. In my experience, HWE kernels have been stable - with only a few problems over the years (e.g. kernel panic with LUKS, TPM detection problems, live-patch support slow, to name a few). I would personally recommend using HWE kernels, especially if you need a newer feature (I don't recommend building modules out-of-tree where portability becomes a problem).

> In Ubuntu 22.04 (Ubuntu 24.04 has no HWE kernel as of writing), Canonical moved to a [rolling-release model](https://ubuntu.com/about/release-cycle#ubuntu-kernel-release-cycle) - meaning a shorter support window, but newer kernels overtime. Below illustrates weighing stability/support with getting the newer stuff faster. [Image source](https://ubuntu.com/about/release-cycle).

![](/posts/2024/images/example-hwe-support-lifecycle.png)

## Actually Switching to HWE

Switching to the HWE kernel is trivially easy. You just need to install the `apt install linux-generic-hwe-22.04` meta-package (of course, using the package based on your distribution):

```bash
apt-get install linux-generic-hwe-22.04
```

Grub will detect the new kernel and update the boot-menus and set the default kernel to whatever is latest. At this point, you can reboot to load the new kernel.

After rebooting, cleaning up (aka, removing the "stock" kernel):

```bash
apt-get remove --autoremove linux-generic linux-headers-generic linux-image-generic 
```

That'll free up a good 500MiB if diskspace too - the only reason to keep the old kernel around is if you want a backup you can load if the HWE gives you problems (preventing boot). As a worse case, you can always reinstall `linux-generic` and remove `linux-generic-hwe-22.04` to restore the original configuration.
