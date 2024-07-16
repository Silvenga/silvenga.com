---
tags:
  - posts
  - linux
  - storage
title: Configuring HDD Power Management using hdparm
description: A quick write-up of using hdparm to configure the different power saving options.
---
## Introduction

While waiting for a server to rebalance a BTRFS volume, I was poking around syslog and saw a message that `smartd` [had to spin up a disk](https://smartmontools-support.narkive.com/Cx2nm0TB/check-power-on-status):

```plaintext
smartd[8077]: Device: /dev/sdb [SAT], CHECK POWER STATUS spins up disk (0x81 -> 0xff)
```

This server's disks really shouldn't be spinning down to save power - and it's really odd that the disks even think they are idle, especially during a rebalance operation. This also happens to be a new (to the server) disk, replaced after a previous failure a couple months ago. Maybe the disk has some odd power management setting?

## Using Hdparm

There's technically two methods that hard drives use to save power in the ATA specification:

- Advanced Power Management (APM) - which is basically when the drive spins down to take a nap (saving power).
- Automatic acoustic management (AAM) - which is when the drive slows down the RPM of the platters/head to reduce noise. Of course, noise is just energy, so this has the side benefit of saving power.

> I didn't know this until I started researching for this post - while AAM is in the ATA specification, support was apparently removed by Seagate and Western Digital, even if their spec-sheets may talk about it - [Citation appears needed though](https://en.wikipedia.org/wiki/Automatic_acoustic_management#History). This wouldn't be the first time the HDD vendors fudged specs.

For servers, using either method may impact performance, so it's typical for both to be disabled (which is my current goal here).

### APM Level

There are two commands provided by `hdparm` related to APM. First is configuring the APM level using the `-B` flag.

Reading the current level can be done without passing any values:

```bash
hdparm -B /dev/sda
```

```output
/dev/sda:
 APM_level      = off
```

Writing values uses the same flag. For example, to disable APM:

```bash
hdparm -B 255 /dev/sdb
```

Different values have different impacts on performance:

| Value   | Impact                                                                                                                                                                                                        |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1-127   | Most power savings, lower is more aggressive. Values in this range allow the disk to spin-down.                                                                                                               |
| 128-254 | Prioritize performance , higher values allow for greater performance at the cost of power usage. Values in this range disallow spin-down of the disk (so no latency penalty as the drive spins up on access). |
| 255     | Disable APM completely. The [man page](https://linux.die.net/man/8/hdparm) notes that some drives do not support disabling APM, "but many do".                                                                |

Unfortunately, my "sleeping on the job" Seagate enterprise drive reports that setting an APM level isn't supported, so the `-B` flag won't be useful for me.

```bash
hdparm -B /dev/sdb
```

```output
/dev/sdb:
 APM_level      = not supported
```

### APM Spin-down Timeout

This leads us to the second command using the `-S` flag. This configures the spin-down (standby) timeout. To disable spin-down, a value of 0 can be used:

```bash
hdparm -S 0 /dev/sda
```

> Unfortunately, there's no method to read the current value configured.

Thankfully, my drive does support this command:

```bash
hdparm -S 0 /dev/sdb
```

```output
/dev/sdb:
 setting standby to 0 (off)
```

### AAM Mode

And finally, for completeness, there's the `-M` flag that controls the AAM setting. Same as `-B`, specifying no value outputs the current configuration of the drive:

```bash
hdparm -M /dev/sda
```

According to the [man page](https://linux.die.net/man/8/hdparm), only three values are really relevant:

| Value | Impact                   |
| ----- | ------------------------ |
| 0     | Disables AAM completely. |
| 128   | "Quite" mode.            |
| 254   | "Fast" mode.             |

So to disable AAM, a value of `0` can be used:

```bash
hdparm -M 0 /dev/sda

# Or if 0 isn't supported:
hdparm -M 254 /dev/sda
```

I get a lot of "vendor specific" vibes here, there's not a huge amount of information about it, and I've never delt with a HDD that actually supported controlling this setting, so I don't know what impact it has.

My drive reports "not supported", although it reports supporting AAM. So `:shrug:` I guess?

```bash
hdparm -M /dev/sdb
```

```output
/dev/sdb:
 acoustic      = not supported
```
