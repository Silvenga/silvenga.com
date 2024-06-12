---
title: Virtual Disk Service Stalled
description: My journey in troubleshooting Virtual Disk Service issues.
aliases: /virtual-disk-service-stalled/index.html
---

## Introduction

I had this really odd problem that's been plaguing me for months on a newly installed Windows 2016 dedicated machine. Random services and tools either stopped functioning or froze/stalled for minutes at a time. I really thought that I either had a corrupted installation (`sfc` couldn't detect anything) or I configured something  horribly wrong. So, as a last ditch effort before completely re-installing the machine, I finally took some time one night to perform a root cause analysis and to hopefully find a solution. What precedes is that night.

## All the Issues

At first I noticed that I was having issues connecting to the Windows SNMP (Simple Network Management Protocol) service which I use to monitor all my servers. My SNMP monitoring system would timeout connecting to the service 99% of the time. This was very odd, and the patterns didn't present in a way that would scream networking issues. I checked all the common causes (VPN issues, monitoring host, DNS, etc), but came up empty. Attempting to restart the service resulted it hanging until I rebooted. Not really caring, I continued on thinking it was network related - my VPN always had Window issues (architecture portable != OS portable).

![Task Manager](/posts/archive/content/images/2017/7/task-manager.png)

Later I noticed that Windows Updates were taking forever, so wanting to know the bottleneck, I checked the Resource Monitor. No resource issues that I could find, however, no IO stats were showing either and no disks were shown under the Storage section. To double check this oddity, I enabled IO performance stats within [Task Manager](https://blogs.technet.microsoft.com/canitpro/2013/12/02/step-by-step-enabling-disk-performance-counters-in-windows-server-2012-r2-task-manager/) - this should pull from the same location as the Resource Monitor (IIRC). The Task Manager also failed to get disk information for me - as well as the Server Manager, which I tried later. At this point I was really questioning the integrity of this server, but ran a `fsck` check anyway (I didn't really think it would help, but why not?). After the reboot, nothing came up, this had no impact on my issue.

Oddly all these issues basically revolved around disk issues, time to check that part of the system? Now, I'm running this particular server in a software RAID-1 (it's a cheap server) using the same method I wrote about [here](https://silvenga.com/raid1-windows-server-2016/). This is definitely not a standard solution in the Windows land, but I've tested this method in my testbed, and have never any had issues. I truly didn't believe this to be the problem, but I fired up Disk Management just to poke around. The message `Connecting to Virtual Disk Service...` greeted me and wouldn't leave (yes, the Virtual Disk service was enabled and running, I restarted it to make sure).

## The Ultimate Solution

This is when the pieces started to fit together - something that the Virtual Disk service accessed was having issues. I bet if I waited long enough, whatever thing that was stalling the service would timeout. I opted to test this by opening the Task Manager and waiting for the IO stats to display. Behold, my patience was rewarded! Now to isolate the root cause...

I remembered back to earlier this year, when installing Windows onto this server. The SuperMicro IPMI management interface would keep on crashing or stopped responding to commands (again, this is a cheap dedi) - this kept on causing the Windows installer to fail. As a side note, I will never use SuperMicro again for personal projects, just a horrible experience (go HPE!).

I hypothesized that perhaps one of the IPMI interface's virtual disk drives were causing issues with Windows (like not responding to requests). I tried to check either of the drive's properties using Explorer (This PC), I was rewarded with Explorer freezing and ultimately crashing. Lovely, but at least I was on the right path about the IPMI...

![device manager](/posts/archive/content/images/2017/7/device-manager.png)

Immediately, I opened up the Device Manager and proceeded to disable anything AMI (SuperMicro's vendor). Device Manager did stall, but after a couple of minutes of waiting I was prompted to reboot to complete my modifications - which I proceeded to do smugly.

Almost like magic, all my issues just disappeared! No more SNMP timeouts, IO stats started working, Disk Management worked, Windows updates wouldn't hang, and I swear the whole OS felt just a bit faster.

Life is good.
