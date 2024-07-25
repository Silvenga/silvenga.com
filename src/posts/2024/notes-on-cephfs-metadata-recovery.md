---
tags:
  - ceph
title: Notes on CephFS Metadata Recovery, Learning from Failure
description: My notes after a recent CephFS outage where the MDS journals were corrupted and needed to be recovered.
---

These are notes of a recent CephFS failure and recovery - hopefully useful as a learning example. Of course, consult the Ceph docs and Ceph experts before doing anything. Also, take this all with a grain of salt, as my notes during this process weren't exactly great - I had to stitch together what commands were used, and their likely output, for some. Some information here is likely incorrect too.

> Above all, consider this disaster recovery attempt to be dangerous, even though it was successful. It was only attempted as up-to-date backups existed (although, restoring the backups would likely take over a week) and involve [SneakerNet](https://what-if.xkcd.com/31/).

## The Issue

In this Ceph cluster, there are 3 MDS's - normally two are active, with one on standby. This multi-MDS setup is mostly to improve throughput, as many of the directories contained many small files that weren't a good fit for `radosgw`. This cluster has been online for at least 5 years and typically not a problem (Ceph likes to be left alone to do it's own thing). The failure domain was the loss of a physical node.

### A Yellow Cluster

At first, warnings were emitted from Ceph due to slow MDS operations. At the time, it was assumed to be related to a `snaptrim` operation, after a large amount of data was deleted (about 2TiB, a week ago).

> Historically, snapshots were scheduled to hedge one's bets against crypto-lockers (it was believed to be cheap insurance). Due to the size of the cluster, a single offsite-backup could take weeks to complete (we really depended on [Restic's](https://github.com/restic/restic) deduplication here). The plan was to move Restic to backing up snapshots directly (so the snapshots could be fully atomic). That's still on a TODO list somewhere. The data isn't massively important, but it would be expensive to re-build.

The performance impact of snapshots was a well-known issue. There were past attempts to reduce the impact of snapshot trimming, but ultimately the snapshot frequency was reduced. But, to be honest, the snapshots weren't considered during the cleanup of massive amounts of data - it wasn't obvious at the time that there could be a delayed hit in stability.

So, at this time, the performance issues was considered benign, an expected side-effect that would just cause a day or so of slowness. The alerts were silenced.

### The Cluster Turns Red

Then alerts were emitted from different K8s nodes. A massive spike in processes, along with high IO-waits were reported. One of the K8s nodes even completely locked up and required a forceful reboot. This wasn't great, but the K8s cluster was designed to be highly available. Again, the assumption was this was a transient issue, the cluster would calm down in a few hours. Availability of services wasn't critical at this time.

Then, things started to get worse. One MDS crashed with an assert failure, then the standby crashed when attempting take over the workloads. CephFS was now running on a single MDS, and standbys couldn't replay the central journal. This issue was attributed, incorrectly, to the extreme slowness of the cluster - causing replaying to timeout (this isn't even a thing, no idea where this idea came from).

The goal at this point was to go full speed and complete the `snaptrim` as quickly as possible, so the workloads that relied on CephFS (vs `radosgw` or `rbd`) were scaled down. A deeper analysis would be performed the next day.

For now, the cluster would be in single MDS mode:

```bash
ceph fs set cephfs max_mds 1
```

### Corruption Found

The next morning came, and the cluster was still very much unhappy. The `snaptrim` operation was still progressing (it actually made no measurable progress, which is still something that needs to be looked at). At this point, the MDS was complaining about caps not being released. After failing to evict the problem clients, it was time for the emergency breaks.

First was to stop all CephFS workloads, to hopefully keep data loss to a minimum:

```bash
ceph fs set cephfs refuse_client_session true
```

But now, the MDS was found to be completely locked up and required a forceful restart. Checking CephFS health returned confusing results.

```bash
ceph fs status
```

```output
cephfs - 0 clients
======
RANK  STATE           MDS                 ACTIVITY     DNS    INOS   DIRS   CAPS
 0    replay (laggy)  cephfs.sm1.esxjag   Reqs: 0/s    0      0      0      0
      POOL         TYPE     USED  AVAIL
cephfs_metadata  metadata  3130M  14.5T
  cephfs_data      data     188T  14.5T
   STANDBY MDS
cephfs.sm2.zzbbbo
cephfs.sm3.fkndkn
```

What was taking this MDS so long to replay the journal? There wasn't any evidence of operations occurring from the replay itself (although, there was a lot of noise). Looking directly at the MDS daemon logs, it was discovered that the daemon was simply crashing during the replay with a debug assert.

```plaintext
debug     -1> 2024-07-24T18:44:52.674+0000 7f7878c22700 -1 /home/jenkins-build/build/workspace/ceph-build/ARCH/x86_64/AVAILABLE_ARCH/x86_64/AVAILABLE_DIST/centos8/DIST/centos8/MACHINE_SIZE/gigantic/release/18.2.2/rpm/el8/BUILD/ceph-18.2.2/src/osdc/Journaler.cc: In function 'bool Journaler::try_read_entry(ceph::bufferlist&)' thread 7f7878c22700 time 2024-07-24T18:44:52.676027+0000
/home/jenkins-build/build/workspace/ceph-build/ARCH/x86_64/AVAILABLE_ARCH/x86_64/AVAILABLE_DIST/centos8/DIST/centos8/MACHINE_SIZE/gigantic/release/18.2.2/rpm/el8/BUILD/ceph-18.2.2/src/osdc/Journaler.cc: 1256: FAILED ceph_assert(start_ptr == read_pos)
 ceph version 18.2.2 (531c0d11a1c5d39fbfe6aa8a521f023abf3bf3e2) reef (stable)
 1: (ceph::__ceph_assert_fail(char const*, char const*, int, char const*)+0x135) [0x7f788aa32e15]
 2: /usr/lib64/ceph/libceph-common.so.2(+0x2a9fdb) [0x7f788aa32fdb]
 3: (Journaler::try_read_entry(ceph::buffer::v15_2_0::list&)+0x132) [0x55555847ef32]
 4: (MDLog::_replay_thread()+0xda) [0x555558436bea]
 5: (MDLog::ReplayThread::entry()+0x11) [0x5555580e52d1]
 6: /lib64/libpthread.so.0(+0x81ca) [0x7f78897d81ca]
 7: clone()
debug      0> 2024-07-24T18:44:52.674+0000 7f7878c22700 -1 *** Caught signal (Aborted) **
 in thread 7f7878c22700 thread_name:md_log_replay
 ceph version 18.2.2 (531c0d11a1c5d39fbfe6aa8a521f023abf3bf3e2) reef (stable)
 1: /lib64/libpthread.so.0(+0x12d20) [0x7f78897e2d20]
 2: gsignal()
 3: abort()
 4: (ceph::__ceph_assert_fail(char const*, char const*, int, char const*)+0x18f) [0x7f788aa32e6f]
 5: /usr/lib64/ceph/libceph-common.so.2(+0x2a9fdb) [0x7f788aa32fdb]
 6: (Journaler::try_read_entry(ceph::buffer::v15_2_0::list&)+0x132) [0x55555847ef32]
 7: (MDLog::_replay_thread()+0xda) [0x555558436bea]
 8: (MDLog::ReplayThread::entry()+0x11) [0x5555580e52d1]
 9: /lib64/libpthread.so.0(+0x81ca) [0x7f78897d81ca]
 10: clone()
```

It wasn't known at this point, but this debug assert signaled much larger problems (foreshadowing!).

## The Recovery

### First the Journal

It was obvious why at this point why all the MDS daemons were crashing, and it was a mistake to not dive deeper at that point (logs were also misread, so that didn't help either). It turns out this `ceph_assert(start_ptr == read_pos)` assert definitely indicated a much larger issue with the journal (and it was incorrectly attributed to slowness of the cluster).

So now it was known that the journal was corrupt, somewhere. The hope was, since most of the data was effectively cold/warm'ish, so it should be relatively safe to truncate the journal. All recent data should be easily rebuilt.

First, shut down everything to avoid making the issue worse:

```bash
ceph fs set cephfs down false
```

> All these commands come from the Ceph docs: [Advanced: Metadata repair tools — Ceph Documentation](https://docs.ceph.com/en/latest/cephfs/disaster-recovery-experts/)
> Unfortunately, some of the docs are a bit old, and some of the commands did change or are no-longer valid.

Then a backup of the current journal:

```bash
cephfs-journal-tool --rank=cephfs:all journal export cephfs-backup.bin
# There was an error message about a 200KiB chunk of the journal being corrupted (again, grain of salt, this is all from memory).

# And because a sparce file of 2.2TiB scared me. I was running on a small bastion/admin VM that had a 30GiB disk attached.
tar cSzf cephfs-backup.bin.tgz cephfs-backup.bin
```

> I really appreciated the CLI output about how to properly compress the backup! Dealing with sparse files can be problematic. It was compressed from 2.2TiB down to 37MiB.

The next step was to attempt to replay the good parts of the journal into `rados`. Again, the assumption was that there wasn't a huge amount of data movement, so there would be minimal data-loss, any data that was lost would be easily rebuilt.

```bash
cephfs-journal-tool --rank=cephfs:all event recover_dentries summary
```

```output
2024-07-24T14:19:01.862-0500 7fc6d28d9f40 -1 Bad entry start ptr (0x0) at 0x2bcecfff34f

Events by type:
  OPEN: 22236
  SESSION: 2380
  SUBTREEMAP: 127
  TABLECLIENT: 2
  TABLESERVER: 6
  UPDATE: 6370
Errors: 0
```

Fingers-crossed, now the journal can be truncated, and hopefully, with a forward scrub, everything would be okay.

```bash
cephfs-journal-tool --rank=cephfs:all journal reset
```

```output
old journal was 3009983615217~476725910
new journal start will be 3010461696000 (1354873 bytes past old end)
writing journal head
writing EResetJournal entry
done
```

> It should be noted that `--yes-i-really-really-mean-it` doesn't exist anymore. There is a `--force` flag, but that appears to just emit the `EResetJournal` entry.

Following the docs, a session table reset was next:

```bash
cephfs-table-tool all reset session
```

```output
{
    "0": {
        "data": {},
        "result": 0
    }
}
```

I believe there was also a reset of the other tables, but I'm not quite sure the order (my notes became out-of-order at some point).

```bash
cephfs-table-tool all reset snap
cephfs-table-tool all reset inode
```

Then a reset of the metadata:

```bash
ceph fs reset cephfs --yes-i-really-mean-it
```

All looked good at this point. It was time to bring the MDS daemons back up.

### Rebuilding the Metadata Pool

Nope! Once the daemons were started, they immediately crashed, but this time, they emitted errors around corrupted dentries (directory entity):

```output
[ERR] : MDS abort because newly corrupt dentry to be committed: [dentry #0x1/blah [415,head] auth (dversion lock) pv=748 v=746 ino=0x10001b5fc8f state=1073741824 | inodepin=1 0x55725e85a000]
```

While this was definitely concerning, but at least progress was being made. Looking at the logs, the MDS daemon was successfully reading the journal, but now there was inconsistencies. This was more in-line with my experiences with Ceph (vs silent errors from before).

After a lot more debugging and research (including reading the code). It looked like the safest next step was to rebuild the metadata pool. I've done this once in the past to restore a much older version of Ceph (related to a kernel swap bug that caused Ceph to consider objects to be corrupted), but I haven't done this recently.

So following the docs, first to reset the metadata pool:

```bash
cephfs-data-scan init --force-init
```

And then the "very long" process of rebuilding the metadata. Doing some testing on throughput, running with 4 workers was quite slow - and some reports of using 4 workers on a small cluster could take days to recover.

So 24 workers were selected, and the bastion host was scaled up to 16 cores and 8GiB of RAM.

> Each command was ran in a separate `tmux` session. I wanted the output of each command separately.

```bash
cephfs-data-scan scan_extents --worker_n 0 --worker_m 24
cephfs-data-scan scan_extents --worker_n 1 --worker_m 24
cephfs-data-scan scan_extents --worker_n 2 --worker_m 24
cephfs-data-scan scan_extents --worker_n 3 --worker_m 24

cephfs-data-scan scan_extents --worker_n 4 --worker_m 24
cephfs-data-scan scan_extents --worker_n 5 --worker_m 24
cephfs-data-scan scan_extents --worker_n 6 --worker_m 24
cephfs-data-scan scan_extents --worker_n 7 --worker_m 24

cephfs-data-scan scan_extents --worker_n 8 --worker_m 24
cephfs-data-scan scan_extents --worker_n 9 --worker_m 24
cephfs-data-scan scan_extents --worker_n 10 --worker_m 24
cephfs-data-scan scan_extents --worker_n 11 --worker_m 24

cephfs-data-scan scan_extents --worker_n 12 --worker_m 24
cephfs-data-scan scan_extents --worker_n 13 --worker_m 24
cephfs-data-scan scan_extents --worker_n 14 --worker_m 24
cephfs-data-scan scan_extents --worker_n 15 --worker_m 24

cephfs-data-scan scan_extents --worker_n 16 --worker_m 24
cephfs-data-scan scan_extents --worker_n 17 --worker_m 24
cephfs-data-scan scan_extents --worker_n 18 --worker_m 24
cephfs-data-scan scan_extents --worker_n 19 --worker_m 24

cephfs-data-scan scan_extents --worker_n 20 --worker_m 24
cephfs-data-scan scan_extents --worker_n 21 --worker_m 24
cephfs-data-scan scan_extents --worker_n 22 --worker_m 24
cephfs-data-scan scan_extents --worker_n 23 --worker_m 24
```

The process of scanning for extents took about 8 hours, with around 3k reads/second hitting the cluster. Ultimately, scaling up the bastion host wasn't needed, each worker was rather light-weight. The bottleneck appeared to be the OSD's, they were at around 50% utilized (IOPS).

A few inconsistencies were reported, but nothing of note or unexpected (forgot to add those warnings to my notes).

The next step was to rebuild the metadata inodes and insert them into the metadata pool.

```bash
cephfs-data-scan scan_inodes --worker_n 0 --worker_m 24
cephfs-data-scan scan_inodes --worker_n 1 --worker_m 24
cephfs-data-scan scan_inodes --worker_n 2 --worker_m 24
cephfs-data-scan scan_inodes --worker_n 3 --worker_m 24

cephfs-data-scan scan_inodes --worker_n 4 --worker_m 24
cephfs-data-scan scan_inodes --worker_n 5 --worker_m 24
cephfs-data-scan scan_inodes --worker_n 6 --worker_m 24
cephfs-data-scan scan_inodes --worker_n 7 --worker_m 24

cephfs-data-scan scan_inodes --worker_n 8 --worker_m 24
cephfs-data-scan scan_inodes --worker_n 9 --worker_m 24
cephfs-data-scan scan_inodes --worker_n 10 --worker_m 24
cephfs-data-scan scan_inodes --worker_n 11 --worker_m 24

cephfs-data-scan scan_inodes --worker_n 12 --worker_m 24
cephfs-data-scan scan_inodes --worker_n 13 --worker_m 24
cephfs-data-scan scan_inodes --worker_n 14 --worker_m 24
cephfs-data-scan scan_inodes --worker_n 15 --worker_m 24

cephfs-data-scan scan_inodes --worker_n 16 --worker_m 24
cephfs-data-scan scan_inodes --worker_n 17 --worker_m 24
cephfs-data-scan scan_inodes --worker_n 18 --worker_m 24
cephfs-data-scan scan_inodes --worker_n 19 --worker_m 24

cephfs-data-scan scan_inodes --worker_n 20 --worker_m 24
cephfs-data-scan scan_inodes --worker_n 21 --worker_m 24
cephfs-data-scan scan_inodes --worker_n 22 --worker_m 24
cephfs-data-scan scan_inodes --worker_n 23 --worker_m 24
```

> If I recall correctly, this set of commands were significantly faster, taking around an hour.

After the inode scan completed, it was onto scanning for links. This step was even faster, taking maybe 10 minutes.

But then scanning for links crashed:

```bash
cephfs-data-scan scan_links
```

```output
2024-07-24T22:50:14.484-0500 7f21faf39400 -1 datascan.scan_links: Remove duplicated ino 0x0x100017faef3 from 0x4/100017faef3

2024-07-24T22:50:14.484-0500 7f21faf39400 -1 datascan.scan_links: Remove duplicated ino 0x0x10001981523 from 0x4/10001981523

...

2024-07-24T22:50:18.280-0500 7f21faf39400 -1 datascan.scan_links: Unexpected error reading dentry 0x4/100017faef3: (2) No such file or directory
```

I noticed the error was referring to a dentry for a temporary folder, with a lot of inodes removed from it. I suspect a minor bug in `scan_links`, as the second attempt succeeded, no more duplicate inodes were reported.

```output
2024-07-24T22:52:43.183-0500 7f529b5ea400 -1 mds.0.snap  updating last_snap 1 -> 414
```

Everything was looking good. To finalize, a cleanup was executed:

```bash
cephfs-data-scan cleanup cephfs_data
```

> This actually took at least 8 hours to run, which was unexpected, but now was not the time to rush stuff.

Now it was time to bring the MDS daemons online, and to check for consistency before allowing clients to connect. This would also repair recursive stats.

```bash
# Allow a MDS daemon to join rank 0, and clear the "damaged" error.
ceph mds repaired 0
```

Woot! The MDS daemon successfully started... _and then stopped_.

_Ooops_, forgot to re-enable CephFS:

```bash
ceph fs set cephfs down false
```

After this, a MDS immediately became `active` and the damaged error was cleared.

![Tony stark with a "whew" caption](/posts/2024/images/tony-stark-phew.gif "Whew indead.")

The daemon did report issues however:

```output
...
[ERR] : bad backtrace on directory inode 0x4
[ERR] : unmatched fragstat on 0x1, inode has f(v1 m2024-03-26T15:43:42.419967+0000 2=1+1), dirfrags have f(v0 m2024-03-26T15:43:42.419967+0000 7=0+7)
[ERR] : inconsistent rstat on inode 0x100, inode has n(v1), directory fragments have n(v0 rc2098-01-01T06:00:00.000000+0000 b2649901515 637=54+583)
...
```

But none of this was unexpected. A scrub was needed to fix back traces and recursive statistics:

```bash
ceph tell mds.cephfs:0 scrub start / recursive,repair,force
```

Ultimately, the forward scrub completed after a few minutes.

```plaintext
[WRN] : bad backtrace on inode 0x10001b5b2f5(/lost+found/10001b5b2f5), rewriting it
[WRN] : bad backtrace on inode 0x10001b5caaf(/lost+found/10001b5caaf), rewriting it
[WRN] : bad backtrace on inode 0x10001b8c8de(/lost+found/10001b8c8de), rewriting it
[WRN] : bad backtrace on inode 0x10001b0034c(/lost+found/10001b0034c), rewriting it
[WRN] : bad backtrace on inode 0x10001b00330(/lost+found/10001b00330), rewriting it
[WRN] : bad backtrace on inode 0x10001c53395(/lost+found/10001c53395), rewriting it
[WRN] : bad backtrace on inode 0x10001c31bdf(/lost+found/10001c31bdf), rewriting it
...
```

> Only 8 files (all temp) were relocated to `lost+found`. Woot!

At this point, the clients were re-enabled, and a second MDS daemon was added as rank `1`:

```bash
ceph fs set cephfs refuse_client_session false
ceph fs set cephfs max_mds 2
```

The CephFS volume was mounted on a different node and `ncdu` was used to do some spot-checking.

Everything looked to be in-order!

```output
RANK  STATE          MDS            ACTIVITY     DNS    INOS   DIRS   CAPS
 0    active  cephfs.sm1.esxjag  Reqs:    1 /s   377k   374k  33.7k  87.8k
 1    active  cephfs.sm2.zzbbbo  Reqs:    0 /s   559    562    322    445
      POOL         TYPE     USED  AVAIL
cephfs_metadata  metadata  3092M  14.5T
  cephfs_data      data     188T  14.5T
   STANDBY MDS
cephfs.sm3.fkndkn
```

## Post-Mortem

After some analysis of the logs, we think the problem lies in a perfect storm of three causes:

- The cluster was under heavy-load due to a `snaptrim` operation.
- The active-MDS's were having trouble doing anything, including rebalancing each other. This caused a surge in CephFS clients, and existing clients that couldn't release their caps.
- A bug, likely from the extreme conditions, allowed a corrupt commit to occur against the MDS journal. This lead to MDS crashes.

While the cluster is now healthy, more research and testing around mitigating snapshot trimming impacts is needed. Also, more (better?) monitoring of MDS slow requests needs to be done. I originally assumed these slow requests were transient, likely related to not meeting RAM and CPU recommendations. But after more research, some of these slow requests might be hidden symptoms of other issues.

Either way, while I think this might have been caused by a Ceph bug, I'm impressed that this normally catastrophic failure was fixable, and the fixes executed in under 24 hours.

This experience, although scarry, ultimately increased my trust in Ceph, just a little bit more.

### Lessons Learned

Here's a list of lessons learned here. I'll hopefully update this over time, as more research and testing is done.

#### MDS Rebalancing

Looking back through the reasons for slow MDS requests, they appear related to multi-active MDS balancing, looking like this:

```plaintext
slow request 3843.743516 seconds old, received at 2024-07-25T14:05:02.870581+0000: client_request(client.636427651:129593 getattr AsXsFs #0x100001c0cf8 2024-07-25T14:05:02.867524+0000 caller_uid=0, caller_gid=0{}) currently failed to authpin, subtree is being exported
```

Some of these slow requests I found were over 18 hours old. Reading other accounts of slow MDS, there are reports that MDS can deadlock when exporting a subtree (which, if I'm reading docs correctly, is when a subtree is being rebalanced to another MDS).

Ultimately, MDS balancing seems cool, but has several reported problems. Upstream appears to be disabling balancing by default (after reef). For existing clusters, the following disables balancing:

```bash
ceph config set mds mds_bal_interval 0
```

I have observed that when rebalancing, the relevant MDS ranks can become unresponsive to even disabling the rank - requiring failing the MDS.

```bash
ceph mds fail cephfs.sm1.esxjag
```

Reading the mailing list archives, these experiences don't appear abnormal.

#### Pausing Snapshot Trimming

I don't think it's documented anywhere, but Ceph does have a way to disable `snaptrim`, I didn't know about this until I found it during some mailing list searches. This doesn't appear to interrupt running `snaptrim` operations, but does prevent new one's from executing (e.g. you might need to restart OSD's to cancel running operations).

```bash
ceph osd set nosnaptrim
ceph osd unset nosnaptrim
```
