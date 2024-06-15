---
tags:
  - posts
  - cephfs
title: Ceph's handle_auth_bad_method Error is Weird 
description: Weird cause for Ceph's handle_auth_bad_method error.
---

I was pulling my hair out trying to mount a Ceph RBD to my Mastodon server (I added a Mastodon rely and was running out of host SSD space).

```bash
[root@fe1] /root # ceph auth import -i ceph.mastodon.keyring
2024-06-14T20:47:15.748-0500 6ffc5743d4c0 -1 monclient(hunting): handle_auth_bad_method server allowed_methods [2] but i only support [2]
```

Two doesn't equal two?

No, ultimately the error was a typo in my client-id... so you might get this error if you attempt to authenticate with a user that doesn't exist!
