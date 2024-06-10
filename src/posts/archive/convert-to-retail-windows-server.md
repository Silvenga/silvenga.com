---
title: Convert Windows 2016 Eval to Retail
description: How to convert a Windows Server 2016 trial installation to full retail.
---

![Command line, using DISM to convert to retail.](/posts/archive/content/images/2017/dism.png)

Using your retail key with the ISO's downloaded from Microsoft's "Evaluation Center" should be easy right? You paid for a license so you should be able to just activate a trial... Turns out it's not that simple. You actually need to change your server edition from ServerBlahEvalEdition to whatever edition you have a key for using `dism`.

```bat
DISM /Online /Set-Edition:ServerDatacenter /ProductKey:<key for blah>
```

This command is going to yell at you for not accepting the EULA, so the final command looks like this:

```bat
DISM /Online /Set-Edition:ServerDatacenter /ProductKey:<key for blah> /AcceptEula
```

From what I gather the `Set-Edition` option can be either of the following:

```
ServerDatacenter
ServerStandard
ServerDatacenterCor
ServerStandardCor
```

![DISM running cleanup during reboot.](/posts/archive/content/images/2017/dism-cleanup.png)

The command takes a good 10 minutes to run (looks like it stalls), then asks to reboot to cleanup. Afterwards, you should be activated and ready.

For extra credit, you can activate VM's running on a Datacenter host by using AVMA keys (Automatic Virtual Machine Activation). The commands would look like this:

```bat
DISM /Online /Set-Edition:ServerDatacenterCor /AcceptEula /ProductKey:TMJ3Y-NTRTM-FJYXT-T22BY-CWG3J
DISM /Online /Set-Edition:ServerStandardCor /AcceptEula /ProductKey:C3RCX-M6NRP-6CXC9-TW2F2-4RHYD
```

Have Fun!
