---
title: PSA - What KeebMonkey PC Status Monitor Hides
description: A dive into the KeebMonkey PC Status Monitor software and what is hidden.
---

## PSA - What KeebMonkey PC Status Monitor Hides

TLDR: Hidden inside of the _KeebMonkey PC Status Monitor_ software are binaries of Aida64 and a Aida64 product key in violation of FinalWire's (Aida64's developers) licensing agreements. The software is purposefully obfuscated, making reverse engineering difficult. The software has a high degree of access to the operating system, nefarious things could be hidden in the software that would be difficult to find.

I personally will no longer be using this software (which renders the hardware useless, unfortunately) due to the ethical, legal, and security concerns of continuing to use this software. But that's just my opinion, take it with a grain of salt.

----
### Reverse Engineering

I'm a software engineer specializing in .NET, my day job is in security which involves decompiling libraries. I purchased the [_KeebMonkey PC Status Monitor_](https://www.keebmonkey.com/products/keebmonkey-pc-status-monitor) with the goal of reverse engineering the serial protocol and building custom software for myself (so I didn't need to rely on unsigned, questionable software running with elevated rights).

There are two version of the KeebMonkey software that I've found, different builds from different locations:

- [35inchENG.rar (Alibaba Cloud)](https://kbmscreen.oss-us-east-1.aliyuncs.com/35inchENG.rar)
- [KeebMonkey PC Status Monitor.zip (Digital Ocean)](https://sfo3.digitaloceanspaces.com/drivers/KeebMonkey%20PC%20Status%20Monitor.zip)

Both were considered going forward.

I first noticed that the KeebMonkey  software was a .NET Framework style executable, which is generally easy to reverse engineer due to the way .NET allows "linking" with compiled binaries. So I fired up my decompiler and started looking around. Rather obviously, the symbols where obfuscated (the building blocks of code).

Normally, when decompiled, .NET symbols would look like this (from the BCL):

![Normal](/posts/archive/content/images/2021/1HFeEKd.png)

But the KeebMonkey software looked liked this:

![Obfuscated](/posts/archive/content/images/2021/4VMMEzi.png)

(The Chinese characters are randomly generated and have no meaning)

---

### That's Odd?

My first question is - why is this obfuscated, why make it hard to interoperate with your hardware? To me, since this software is questionable in terms of significant intellectual property to hide from competitors, this was a red flag. I had to look deeper, what could this software be doing (with administrator rights)?

I looked first at the size of the application. 57 MB (26 MB in newer builds) is honestly insane for a small/pure .NET application without many visual assets. What could be taking up that size?

In .NET, developers may choose to embed non-code as "resource streams" - designed normally to embed small images and sounds. These are the resources found in the KeebMonkey software (no, the names aren't very helpful):

![Resource Streams](/posts/archive/content/images/2021/DOL3yDu.png)

Minus the boring details, the resource `s.resources` was massive ([extracting code](https://imgur.com/lBOJrd3)). Extracting the "resource streams" produces the following (using the GNU `file` utility to read "magic" headers):

```powershell
ls | % { file $_.Name }
```

```output
aida64; PE32 executable for MS Windows (GUI) Intel 80386 32-bit
aida641; ASCII text, with CRLF line terminators
GeForce_Bold; TrueType font data
kerneld; PE32 executable for MS Windows (native) Intel 80386 32-bit
kerneld1; PE32+ executable for MS Windows (native) Mono/.Net assembly
pkey; ASCII text, with very long lines, with CRLF line terminators
zh_CN; XML document text
```

Downloading the trial of `aida64` (and using the above), the original names aren't a massive leap in logic.
```powershell
ls | select name
```

```output
Name
----
aida64.exe
aida64.ini
GeForce_Bold.ttf
kerneld.x32
kerneld.x64
pkey.txt
zh_CN.xml
```

I was curious of `pkey`, but a quick Google'ing confirmed my suspicions that it was a license file generated from a product key. Ultimately launching `aida64.exe` (after removing the `aida64.ini` file, since it causes Aida64 to hide itself) results in a non-trial version of Aida64 launching.

![Aida64 licensed](/posts/archive/content/images/2021/O2bkdTu.png)

### Looking Deeper

My first question now, why would KeebMonkey ship a license key to end-users? KeebMonkey would be practically giving end-users Aida64 licenses. Why would Aida64 allow that? The answer is simple, Aida64 doesn't allow this:

https://www.aida64.com/licensing

> **AIDA64 Business License** This is a business license that permits the product to be used on the local network of a company or institution on a given number of PCs. It only allows the use of the product on computers in the possession of the company or institution.

Ignoring the "KeebMonkey's potential breach of FinalWire's license agreements", my next question was if these keys were legitimate in the first place, since Aida64 keys are relatively easy to pirate. Of course, we should assume the license is legitimate, since only FinalWire knows if this key is legitimate. That said, there are some red flags:

- Publicly, Aida64 isn't available with a 5 year maintenance license, [FinalWire's online purchase system doesn't allow for lengths that long](https://imgur.com/cYdjC0J.png), only lengths of 2 years.
- Aida64 API [doesn't allow for this license to be renewed](https://imgur.com/AjtA4Dj.png) or extend.

Of course, these red flags could mean nothing, I don't personally know enough about the volume licensing deals with FinalWire.

---

### With a Grain of Salt

My personal conclusion (with a huge grain of salt):
- The _KeebMonkey PC Status Monitor_ software is purposefully obfuscated, making reverse engineering difficult.
- The _KeebMonkey PC Status Monitor_ software has a high degree of access to the operating system, nefarious things could be hidden in the software that would be difficult to find.
- Hidden inside of the _KeebMonkey PC Status Monitor_ software are binaries of Aida64 and a Aida64 product key in violation of FinalWire's (Aida64's developers) licensing agreements that are publicly viewable. The license used with Aida64 is questionable, and may be pirated.

---

### Bonus

I noticed the _KeebMonkey PC Status Monitor_ software uses binary serialization to load saved data, would could execute arbitrary code on load. This isn't great, since this renders elevation of privilege attacks trivial (assuming access to the saved files).

Arguably, the risks are low. But not something any developer should be using in 2021 ([docs](https://docs.microsoft.com/en-us/dotnet/standard/serialization/binaryformatter-security-guide)). This speaks more to quality than anything else. So ¯\\_(ツ)_/¯
