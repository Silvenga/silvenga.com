Title: Ceph Feature Missmatch with Kubernetes
Description: Getting Ceph to place nice with Kubernetes.
---

^^^
![Kubernetes + Ceph](/content/images/2017/kubernetes-plus-ceph.png)
^^^ Source: [habrahabr.ru](https://habrahabr.ru/company/flant/blog/329666/)

I needed a better backing storage system for my Kubernetes cluster - I am done with NFS (so many problems). In the end I decided I'll go for a Ceph cluster after being rather impressed by the feature set.

So I got a Luminous Ceph cluster deployed and everything was working (after fighting with the beta external storage features, no more custom Kube Controllers, yay!). Then I tried to actually get a test deployment up, but I kept on seeing the following errors on my nodes:

```log
libceph: mon0 172.16.0.104:6789 feature set mismatch, my 106b84a842a42 < server's 40106b84a842a42, missing 400000000000000
```

I originally thought it was due to running Luminous (the ceph provisioner that I was using targeted Jewel) so I created my own image with Luminous binaries. Same message as before, no change from what I could tell. My next idea was the image format was to new (stupid thought in retrospective, *shrug*). No change on that error message.

Looking deeper into the error message (which I should have done before). This error occurred from a monitor after image construction, but before image mount. The error was complaining that the feature flag `400000000000000` was missing support by my client. This feature turns out to mean basically `CRUSH_TUNABLES5` with the following requirements (Google is great at this):

```log
v10.0.2 (jewel) or later
Linux kernel version v4.5 or later (for the file system and RBD kernel clients)
```

And that's my problem. I'm assuming that Kubernetes is using the kernel module to mount rbd's, but my nodes are running Ubuntu 16.04 with the following kernel:

```log
4.4.0-96-generic #119-Ubuntu SMP Tue Sep 12 14:59:54 UTC 2017 x86_64 x86_64 x86_64 GNU/Linux
```

This leaves me with 3 options to fix this:

* Upgrade the kernel (I rather not)
* Get Kubernetes to not use kernel rbd (not sure where to even start)
* Update the feature flags to not require flag `400000000000000`

Turns out the last one is really easy to do, Ceph really is enterprise ready. Running the following on a node finally got my image to mount within a pod.

```bash
ceph osd crush tunables hammer
```

Hammer (`CRUSH_V4`) being the version of CRUSH before Jewel (`CRUSH_TUNABLES5`).

http://docs.ceph.com/docs/master/rados/operations/crush-map