---
title: Package Console Powershell Cheat Sheet
date: 2016-08-19
description: A personal cheat sheet on using PowerShell commands via the Package Console.
aliases: /package-console-powershell-cheat-sheet/index.html
---

![Visual Studio plus Powershell](/posts/archive/content/images/2017/vs-plus-ps.png)

A cheat sheet of all the cool things that knowing PowerShell can help with when dealing with Visual Studio's Package Console.

```ps1
Get-Package -ProjectName {From Project} | Install-Package -ProjectName {Target Project} -IgnoreDependencies
```

Copy packages from one project to another.


```ps1
Get-Package -ProjectName {From Project} | % { Install-Package -ProjectName {Target Project} -IgnoreDependencies -Version $_.Version.ToString() $_.Id }
```

Same as above, but if you care about versions.


```ps1
("xunit","autofixture", "nsubstitute", "fluentassertions") | %{ Install-Package $_ -DependencyVersion Highest }
```

Batch install packages.

```ps1
Get-Project -All | Install-Package Microsoft.Net.Compilers
```

Install package onto all projects.

```ps1
Get-Package -Updates | ?{$_.Id -ne "refit"} | Update-Package
```

Filter package upgrades.
