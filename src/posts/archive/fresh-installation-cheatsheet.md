---
title: Fresh Installation Cheatsheet
description: A personal cheatsheat for some things to do when installing Windows fresh.
aliases: /fresh-installation-cheatsheet/index.html
archived: 2024-06-30
---

```ps1
$apps = @(
    "A278AB0D.MarchofEmpires",
    "9E2F88E3.Twitter",
    "Facebook.Facebook",
    "king.com.CandyCrushSodaSaga",
    "Microsoft.MicrosoftSolitaireCollection",
    "Microsoft.SkypeApp",
    "Microsoft.MinecraftUWP",
    "Microsoft.MicrosoftOfficeHub",
    "Microsoft.BingWeather",
    "Microsoft.BingNews",
    "Microsoft.Getstarted",
    "Microsoft.OneConnect",
    "Microsoft.MSPaint",
    "Microsoft.Print3D"
)

Get-AppxPackage | Where-Object { $_.Name -in $apps } | Remove-AppxPackage
```

Remove UWP pre-installed bloat. Note, this needs to run after the apps are installed, else they wont be removed.
