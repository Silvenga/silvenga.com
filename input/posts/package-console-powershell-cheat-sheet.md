Title: Package Console Powershell Cheat Sheet
Published: 19 Aug 16
---

A cheat sheet of all the cool things that knowing PowerShell can help with when dealing with Visual Studio's Package Console. 

> Copy packages from one project to another.

```
Get-Package -ProjectName {From Project} | Install-Package -ProjectName {Target Project} -IgnoreDependencies
```

> Same as above, but if you care about versions
```
Get-Package -ProjectName {From Project} | % { Install-Package -ProjectName {Target Project} -IgnoreDependencies -Version $_.Version.ToString() $_.Id }
```

> Batch install packages

```
("xunit","autofixture", "nsubstitute", "fluentassertions") | %{ Install-Package $_ -DependencyVersion Highest }
```

> Install package onto all projects

```
Get-Project -All | Install-Package Microsoft.Net.Compilers
```

> Filter package upgrades

```
Get-Package -Updates | ?{$_.Id -ne "refit"} | Update-Package
```
