---
tags:
  - posts
  - ceph
title: "Tip: Ceph Ports"
description: An attempt to find a combined list of Ceph ports.
---

I've been migrating from Salt to Ansible (hopefully a post at some point), so I'm taking the chance to harden existing Ceph deployments.

Here are my notes on which ports are needed, on which hosts, for which services.

| Port        | Protocol | Destination (Service) | Source Network  | Notes                                                                                                                                                                                                                             |
| ----------- | -------- | --------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3300        | tcp      | `mon`                 | Public, Cluster | Messenger v1 protocol (Legacy). Clients and all Ceph daemons connect here.                                                                                                                                                        |
| 6789        | tcp      | `mon`                 | Public, Cluster | Messenger v2 protocol (IANA-assigned). Clients and all Ceph daemons connect here.                                                                                                                                                 |
| 6800 - 7568 | tcp      | `osd`, `mgr`, `mds`   | Public, Cluster | All these services can be collocated on the same host, so they take the next available port. Technically the `mgr` doesn't need to be accessible from Public, but it's practical.                                                 |
| 8443        | tcp      | `mgr`                 | Cluster         | Ceph dashboard. HTTPS by default (self-signed certificate). Requires authentication.                                                                                                                                              |
| 3000        | tcp      | `grafana`             | Cluster         | Grafana. HTTPS by default (self-signed certificate). Must be accessible by the `mgr` by IP address. Dashboard users can use a reverse proxy ([docs](https://docs.ceph.com/en/squid/mgr/dashboard/#alternative-url-for-browsers)). |
| 9283        | tcp      | `mgr`                 | Cluster         | Prometheus scraping endpoint.                                                                                                                                                                                                     |
| 9093-9094   | tcp      | `alertmanager`        | Cluster         | [Prometheus Alert manager](https://github.com/prometheus/alertmanager).                                                                                                                                                           |
| 9095        | tcp      | `prometheus`          | Cluster         | Must be accessible by Grafana.                                                                                                                                                                                                    |
| 9100        | tcp      | `node-exporter`       | Cluster         | Typically runs on all hosts. Scraped by `prometheus`.                                                                                                                                                                             |
| 2049        | tcp      | `nfs`                 | Public          | Trusting the docs here, I've never deployed `nfs` before.                                                                                                                                                                         |
| 8000        | tcp      | `rgw`                 | Public, Cluster | Typically set during creation.                                                                                                                                                                                                    |
| 8765        | tcp      | All                   | Cluster         | Used by `cephadm` to discover which services are running on each host.                                                                                                                                                            |

Cheers!
