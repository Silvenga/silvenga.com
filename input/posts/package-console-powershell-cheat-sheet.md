Title: Package Console Powershell Cheat Sheet
Published: 19 Aug 16
Description: A personal cheat sheet on using PowerShell commands via the Package Console.
---

A cheat sheet of all the cool things that knowing PowerShell can help with when dealing with Visual Studio's Package Console. 

> Copy packages from one project to another.

```ps1
Get-Package -ProjectName {From Project} | Install-Package -ProjectName {Target Project} -IgnoreDependencies
```

> Same as above, but if you care about versions
```ps1
Get-Package -ProjectName {From Project} | % { Install-Package -ProjectName {Target Project} -IgnoreDependencies -Version $_.Version.ToString() $_.Id }
```

> Batch install packages

```ps1
("xunit","autofixture", "nsubstitute", "fluentassertions") | %{ Install-Package $_ -DependencyVersion Highest }
```

> Install package onto all projects

```ps1
Get-Project -All | Install-Package Microsoft.Net.Compilers
```

> Filter package upgrades

```ps1
Get-Package -Updates | ?{$_.Id -ne "refit"} | Update-Package
```
