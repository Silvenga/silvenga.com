---
title: Ceph and Deep-Scrubs
description: How deep-scrubs work, and how to correctly set their interval.
aliases: /ceph-and-deep-scrubs/index.html
---

## Introduction

I manage a 192TB Ceph cluster consisting mostly out of spinning rust. It's a weird cluster, lot's of PG's, as the cluster is storing millions and millions of tiny files in radosgw. To ensure all the PG's can be recovered in under a day, the pool's PG's are way higher then traditional recommendations - but that also means deep scrubbing is becoming a bit problematic (lot's of PG's per OSD and spinning rust is slow).

So here's how to correctly configure the deep scrub interval... (it's not documented anywhere)

## How Deep Scrubbing Works

So, Ceph has two scrubbing operations. A normal scrub and a **deep**-scrub.

Normal scrubs are quick since they are only checking the consistency of a given PG's metadata (not the PG's correctness ). From my mailing list travels, Ceph developers have not observed any performance impact of these quick scrubs - so it's easy to ignore them (but don't).

Then there's deep scrubbing, which is designed to catch bit-rot (aka, the correctness of the PG's), it's naturally a data intensive operation. On my SAS drives, I see Ceph deep-scrubbing at about 20MB/s, for a 50GB PG, that's 42 minutes of deep scrubbing - in my case, eating 40% of my IOPS. It's not inconceivable that every OSD in the cluster could be deep-scrubbing something at the same time.

Thankfully, Ceph has several knobs we can tweak to reduce this impact:

### [`osd_deep_scrub_interval`](https://docs.ceph.com/en/reef/rados/configuration/osd-config-ref/#confval-osd_deep_scrub_interval "Permalink to this definition")

Default: `604800` (7 days)

This one seems like an obvious first thing to look at, and you would be right. But it's a little nuanced.

The value is the number of seconds before a deep-scrub is mandated (bypasses load restrictions). That said, deep-scrubs will **still** happen before this interval - see `osd_deep_scrub_randomize_ratio`.

### [`osd_scrub_min_interval`](https://docs.ceph.com/en/reef/rados/configuration/osd-config-ref/#confval-osd_scrub_min_interval "Permalink to this definition")

Default: `86400` (1 day)

The _normal_ interval for normal scrubs and a percentage of deep-scrubs (see `osd_deep_scrub_randomize_ratio`).

To me, when I see a min/max interval, I think something is going to be randomly executed between those two temporal lines. No, that's not how Ceph uses this option.

Ceph delays normal scrubs (never deep-scrubs) if the load of the node is too high (defaults to 0.5 load, normalized for CPU count), but normally schedules normal scrubs at `random(osd_scrub_min_interval, osd_scrub_min_interval + (osd_scrub_min_interval * osd_scrub_interval_randomize_ratio))`. Which means that considering the default `osd_scrub_min_interval` value of 1 day, normal scrubs will be spread between 1 day and 1.5 days.

### [`osd_scrub_max_interval`](https://docs.ceph.com/en/reef/rados/configuration/osd-config-ref/#confval-osd_scrub_max_interval "Permalink to this definition")

Default: `604800` (7 days)

The _mandatory_ interval for normal scrubs. See `osd_scrub_min_interval`.

### [`osd_scrub_interval_randomize_ratio`](https://docs.ceph.com/en/reef/rados/configuration/osd-config-ref/#confval-osd_scrub_interval_randomize_ratio "Permalink to this definition")

Default: `0.5` (50%)

A ratio used to spread out scrubs, between `osd_scrub_min_interval` and `osd_scrub_min_interval * osd_scrub_interval_randomize_ratio`. The option `osd_scrub_max_interval` has no impact to this window of possible times.

### [`osd_deep_scrub_randomize_ratio`](https://access.redhat.com/documentation/en-us/red_hat_ceph_storage/3/html/configuration_guide/osd_configuration_reference)

Default: `0.15` (15%)

Completely not related to `osd_scrub_interval_randomize_ratio` and not documented on the official docs, but it's been around since 2015 (Hammer), I found it in this [PR](https://github.com/ceph/ceph/pull/6550).

> Add the option `osd_deep_scrub_randomize_ratio` which defines the rate at which scrubs will randomly turn into deep scrubs.

You might ask why you would want normal, quick scrubs that normally happen once a week, to magically become deep-scrubs. I definitely did...

It makes sense if you consider what `osd_deep_scrub_interval` means, it means after _this_ value, _mandate_ a deep-scrub. So you'll end up in a position where all your deep-scrubs will run at the same time. You'll also notice that there's no version of the `osd_scrub_interval_randomize_ratio` for deep-scrubs. So, at the end of the day, Ceph is using the existing plumping of the normal scrub, to prevent the [thundering herd problem](https://en.wikipedia.org/wiki/Thundering_herd_problem).

The default value of 15% will turn 15% of normal scrubs into deep-scrubs. Meaning, with the default `osd_scrub_min_interval`, 15% of the cluster's deep-scrubs will execute each 1.25 days on average. The math gets a little complicated after that (at least for someone who's mostly forgotten statistics), but I _think_ the work is generally spread out in my experience.

So that means `osd_deep_scrub_interval` **and** the `osd_scrub_min_interval` are important regarding deep-scrubbing.

## How to Set a Deep-Scrub Interval

> Note that this is in the `global` namespace, **not** the `osd` namespace. This is important because the monitors that emit the [PG_NOT_DEEP_SCRUBBED](https://docs.ceph.com/en/quincy/rados/operations/health-checks/#pg-not-deep-scrubbed "Permalink to this heading") warning based on this _OSD_ setting, so it needs to match between the `osd` and `mon` namespaces, or just use `global`.

```bash
# Schedule the next normal scrub in between 1-7 days.
ceph config set global osd_scrub_min_interval 86400 # 1 day
ceph config set global osd_scrub_interval_randomize_ratio 7 # 700%

# No more delays, normal scrub after 14 days.
ceph config set global osd_scrub_max_interval 1209600 # 14 days

# No more waiting on a random 15% chance to deep-scrub, just deep-scrub.
ceph config set global osd_deep_scrub_interval 2419200 # 28 days
```

I've also seen docs/been told I need to restart the monitors and OSD's after these settings - that doesn't seem correct these days with the central Ceph configuration store.
