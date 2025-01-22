---
tags:
  - linux
  - ceph
title: Reinstalling a Ceph OSD Host
description: Reinstall a Ceph OSD host, managed by cephadm, without data movement.
---

For a long time it was possible to use `ceph-volume lvm activate --all` to reactivate an OSD after reinstalling a OSD host or moving a disk between hosts. This nifty feature unfortunately doesn't work when managing the cluster via `orch` module (`ceph-volume` isn't typically installed among other reasons).

So, here's me documenting the new way (mostly for myself).

> There's no need to remove the host from Ceph and it's fine if the host's IP address changes.

First, before removing the host, set `noout` to avoid data movement as the crush map is going to blip during the reinstall.

```bash
ceph osd set noout
```

Now the reinstall or image the OSD host and install all the normal prerequisites for a `orch` managed host (e.g. `docker` and `lvm2`).

Of course, remember to copy the `orch` SSH key!

```bash
ceph cephadm get-pub-key > ceph.pub
ssh-copy-id -f -i ceph.pub root@<host>
```

If the IP address changed, update the host (this is just an upsert).

```bash
ceph orch host add <host>
```

Then you can use `orch` to "activate" the OSD's on our reinstalled host.

```bash
ceph cephadm osd activate <host>
```

> At the time of writing, there appears to be a bug where I've needed to reboot the OSD host as the `osd` services crashed on startup the first time (it looks like a race condition around activating).

And that's it - the OSD's should be deployed with the same OSD id as before (read from the drive). The crush map should also be restored to it's original state, so it's time to unset `noout`!

```bash
ceph osd unset noout
```

Cheers!
