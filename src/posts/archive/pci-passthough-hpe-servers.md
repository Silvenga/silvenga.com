---
title: Hypervisor PCI Passthrough on Modern HPE Servers
description: Getting iLO to play nice with Hyper-V Discrete Device Assignment
aliases: /pci-passthough-hpe-servers/index.html
---

[[toc]]

## The Problem

On my Gen8 HPE Proliants, I run a hyperconvergence, hybrid OS infrastructure, mixing the best of Windows and Linux. My hypervisor of choice is Hyper-V, mainly so I can get TPM protected, full disk encryption (which, incredibly, every Linux distro is still lacking!) to allow unattended rolling cluster updates. Anything I can do to reduce the amount of required maintenance, since everyone is applying security updates monthly, right?

Lately I've been building out my NAS, a 75TiB raw Ceph cluster (unattended rolling reboots is a theme here :D), and I've been doing disk level passthrough of my disks to my Ceph nodes. Anyone familiar with Hyper-V can likely see the problem - Ceph really likes to see the real disk, and Hyper-V's disk abstraction hides a lot of data (IMO, this is the correct implementation, but that's another topic). Everything from write caching to SMART data is just not exposed to the guest VM's.

The latter, the missing SMART data is my main concern right now. As my spindles age, they are going to start having more and more problems. For example, just last week, two drives started throwing write errors, one of which started dropping off my SAS controller!

Wouldn't it be awesome if I could expose my HBA PCI SAS controller to the Ceph VM? Let the VM handle writes directly, without getting Hyper-V involved?

Why, yes. That would be awesome!

## The Solution?

Hyper-V is a type-1 hypervisor, meaning the hypervisor runs directly on hardware, with the management OS running in a VM. The management OS executes within the root partition and gets special treatment like full access to most resources, this includes disks, network adapters, and PCI cards. When you perform disk level passthrough, you have to unmount the disk from the management OS (e.g., offline the disk in Windows terminology). Effectively, the SATA/SAS controller is still shared with the management OS, which means the guest VM's cannot take full control.

Of course, there are a lot of things that can't be effectively shared between multiple OS's, like graphics cards or Wi-Fi cards. For these cases, type-1 hypervisors normally a PCI passthrough feature, allowing you to assign a complete device to a single VM.

Hey, isn't that's called DDA (Discrete Device Assignment) in Hyper-V? Why, yes it is. With DDA I should be able to passthrough my HBA card directly to Ceph. This is super trivial, so let's try that really quick, there's even a little script that shows compatibility!

```powershell
Start-BitsTransfer https://github.com/MicrosoftDocs/Virtualization-Documentation/raw/live/hyperv-tools/DiscreteDeviceAssignment/SurveyDDA.ps1 SurveyDDA.ps1
.\SurveyDDA.ps1
```

```output
Generating a list of PCI Express endpoint devices
...
HP H220 Host Bus Adapter
BIOS requires that this device remain attached to BIOS-owned memory.  Not assignable.
```

Uhm... that's annoying...

## What's Wrong?

First things, what does this message even mean?

Well, all modern OS's (Windows Server 2016+ and modern versions of the Linux kernel) will respect a portion of memory that the BIOS flags before the handover to the OS. This is called the RMRR (Reserved memory Region Reporting) portion of memory. This portion of memory may exist for each device enumerated.

When the hypervisor attaches a PCI device to a VM, it will setup a translation from the abstraction sandbox (the VM) to the physical hardware in memory (also called DMA, direct memory access). Translations to devices that have a RMRR aren't allowed (my understanding is that this 1) breaks VT-d spec and 2) breaks the hypervisor abstraction).

Basically, the BIOS reserved a portion of memory it controls, that the OS shouldn't touch. This disallows assigning a PCI device to a VM (using DMA).

> Additional reading:
> - https://www.kernel.org/doc/Documentation/Intel-IOMMU.txt
> - https://software.intel.com/content/www/us/en/develop/articles/intel-virtualization-technology-for-directed-io-vt-d-enhancing-intel-platforms-for-efficient-virtualization-of-io-devices.html

## Why Doesn't the BIOS want to Share?

So, RMRR only describes the error message. But why is the BIOS setting up RMRR in the first place?

Well, the answer to that came from an observation here at the Spiceworks community:  https://community.spiceworks.com/topic/2250178-passthrough-p420i-to-virtual-machine-on-gen8-hpe

Disabling iLO (Integrated Lights-Out, HPE's IPMI) apparently makes PCI passthrough work.

Going deeper, this BIOS controlled RMRR comes from the HPE "Sea of Sensors" found HPE servers (with Gen8 being the first generation to have this feature). HPE's marketing aside, functionally, iLO inserts itself into almost every component, to gather metrics, health information, and to provide an inventory. iLO handles this at the BIOS level, using RMRR to handle the data for each device. Disabling iLO will of course disable these sensors, removing the RMRR, allowing DMA once again.

But disabling the iLO sucks, I strongly consider that a non-solution to getting SMART stats into my Ceph cluster.

## The Real Solution

I searched for hours for a solution to this. Dozens of posts on forums, and no one had a solution. Mostly blame for the hardware, blame of "Sea of Sensors", blame against Hyper-V. No solution!

 Eventually, I found a little luck. Deep in HPE's support archive, there's a customer advisory from 2016 talking about an error message from KVM.

> Device is ineligible for IOMMU domain attach due to platform RMRR requirement. Contact your platform vendor.
> https://support.hpe.com/hpesc/public/docDisplay?docId=emr_na-c04781229

That sounds a lot like the error from Hyper-V...

It turns out, there are a huge amount of BIOS settings not exposed in the BIOS options. One of these settings is around enabling/disabling RMRR on each PCI slot. The only way to modify these settings is by using XML and the `conrep` interface (a binary that interacts with the BIOS ROM directly).

> Note: I'm doing this in Windows, since a lot of people think this is Linux only.
> Under Ubuntu, the `hp-scripting-tools` package provides `conrep`.

Let's do that now:

```powershell
# Download and install the tools:
Start-BitsTransfer https://downloads.hpe.com/pub/softlib2/software1/pubsw-windows/p230763598/v138934/HPEBIOSCmdlets-x64.msi HPEBIOSCmdlets-x64.msi
msiexec /i HPEBIOSCmdlets-x64.msi /qn
```

After we install the scripting tools, we can use `conrep`.

```powershell
# Let conrep load the required driver:
cp "C:\Program Files\Hewlett Packard Enterprise\PowerShell\Modules\HPEBIOSCmdlets\Tools\ConfigurationData\winpe50\hpsstkio\hpsstkio.sys" "C:\Windows\System32\drivers\hpsstkio.sys"

$conrep = "C:\Program Files\Hewlett Packard Enterprise\PowerShell\Modules\HPEBIOSCmdlets\Tools\ConfigurationData\conrep.exe"

# Save the current settings (-s)
# Using the schema (-x)
# To the file existing-settings.xml (-f)
& $conrep -s -x "C:\Program Files\Hewlett Packard Enterprise\PowerShell\Modules\HPEBIOSCmdlets\Tools\ConfigurationData\conrep.xml" -f C:\existing-settings.xml
```

Here `conrep.xml` is just a schema for the basic settings in the BIOS. Looking at the file, there's a bunch of settings:

```powershell
cat C:\existing-settings.xml
```

```output
<Conrep version="4.7.1.0" originating_platform="ProLiant DL380p Gen8" originating_family="P70" originating_romdate="05/24/2019" originating_processor_manufacturer="Intel">
  <Section name="IMD_ServerName" helptext="LCD Display name for this server"><Line0>GH2</Line0></Section>
  <Section name="IPL_Order" helptext="Current Initial ProgramLoad device boot order."><Index0>00</Index0><Index1>01</Index1><Index2>03</Index2><Index3>02</Index3><Index4>04</Index4><Index5>05</Index5><Index6>ff</Index6><Index7>ff</Index7><Index8>ff</Index8><Index9>ff</Index9><Index10>ff</Index10><Index11>ff</Index11><Index12>ff</Index12><Index13>ff</Index13><Index14>ff</Index14><Index15>ff</Index15></Section>
...
```

Some interesting stuff!

Less obvious is that there are other schemas you can use to read and modify the BIOS settings with. In my case, I needed the RMRD schema:

```powershell
Start-BitsTransfer https://downloads.hpe.com/pub/softlib2/software1/pubsw-linux/p1472592088/v95853/conrep_rmrds.xml conrep_rmrds.xml
cat conrep_rmrds.xml
```

```output
...
This is the input file for CONREP describing Reserved Memory Region Device Scope(RMRDS) entries.
Endpoints_Included = All endpoints in slot should be included in Reserved Memory Region Device Scope entries (default for all slots)
Endpoints_Excluded = All endpoints in slot should be excluded from Reserved Memory Region Device Scope entries
...
```

Modifying these settings is as simple as reading the existing settings (using the RMRDS schema), modifying the resulting XML, and uploading the XML back the the BIOS ROM. I hope the XML is rather self-explanatory, just switch `Endpoints_Included` to `Endpoints_Excluded` for the PCI slot you want to PCI passthough.

> Note: Disabling RMRR will effectively hide the slot from iLO. Meaning no metrics, no temperature data, no health information.

```powershell
& $conrep -s -x conrep_rmrds.xml -f rmrds.xml
& $conrep -l -x conrep_rmrds.xml -f rmrds.xml
```

Where `-l` means "load".

You can even just modify part of the XML, and upload that, which is easier to automate.

```powershell
'<Conrep><Section name="RMRDS_Slot2" helptext=".">Endpoints_Excluded</Section></Conrep>' | Out-File override-rmrds.xml
& $conrep -l -x conrep_rmrds.xml -f override-rmrds.xml
```

Reboot, and the PCI slot should be RMRR free!
