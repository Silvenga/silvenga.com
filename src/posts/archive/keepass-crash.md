---
title: KeePass Random Crashing
description: A red herring to the root cause.
aliases: /keepass-crash/index.html
---

A couple months ago I noticed a really annoying problem, multiple times a day, my password manager KeePass would crash. The first thing I enabled was WER (Windows Error Reporting), so that I could gleam some information from the full memory dumps.

KeePass is a managed .NET application (.NET Framework to be specific), so debugging a crash should be relatively easy as all the necessary symbols should exist in the deployed application. But Looking at the dumps, it was immediately obvious that the crash was occurring outside of managed .NET.

Running Visual Studio's memory dump debugger in mixed mode produced the following stack:

```
MMDevAPI!CDeviceEnumerator::OnPropertyValueChanged+0x1d3
MMDevAPI!CLocalEndpointEnumerator::OnMediaNotification+0x118
MMDevAPI!CMediaNotifications::OnMediaNotificationWorkerHandler+0x24e
ntdll!TppSimplepExecuteCallback+0xa3
ntdll!TppWorkerThread+0x8f6
kernel32!BaseThreadInitThunk+0x1d
ntdll!RtlUserThreadStart+0x28
```

The exception was:

```
Access violation reading location 0x0000000000000038
```

Looking at other .NET threads, nothing managed was really executing - which is kind of odd - is this a rare .NET Framework runtime bug? The module at the top of the stack is `MMDevAPI.dll`, which, with a quick Google search, is a library used by the `Core Audio` subsystem in Windows. Just odd... so this crash of the .NET Framework runtime was being triggered by an audio device change event, and some audio device is a little broken?

Well, I poked around, trying to figure out what could trigger an audio change - the KeePass crash would occur when the system idle'd - which suggested to me a power save feature was kicking in (triggering an audio subsystem change).

It turned out I could reproduce this crash by disconnecting my USB audio DAC (Steel Series headphones). So, the USB bus likely entered some power saving mode (disconnecting my DAC), causing an audio subsystem change, which triggered an event that the .NET Framework runtime was listening for, and while .NET was enumerating audio device, some audio device threw-up. That makes sense, so time to look at all the audio devices loaded and see if any of them have a buggy driver.

The first driver that I suspected was problematic was Steam's remote audio virtual audio device - it has this odd property where the Microphone has both audio and microphone device drivers installed concurrently...

But alas, no, ultimately the problem child was Asus's Sonic Studio drivers. As soon as I deleted the driver/driver package from Windows and rebooted, KeePass wouldn't crash with my original repo-case.
