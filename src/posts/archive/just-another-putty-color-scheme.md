---
title: Just Another Putty Color Scheme
date: 2014-08-23
description: Just another color scheme for Putty, designed based on my personal preferences.
aliases: /just-another-putty-color-scheme/index.html
archived: 2024-06-27
---

![Screenshot of the new colors](/posts/archive/content/images/2014/Aug/2014-08-23_19-51-12.png)

Putty is the single best SSH client for Windows. Unfortunately, Putty also has the single worst default color scheme. For example, the default background uses the same color for the black text. Who ever thought that was a good idea? Being the lazy developer that I am, I had to created a custom theme to alleviate these issues.

The hardest issue was the color black couldn't be pure black, white couldn't be pure white. I needed colors that worked in any situation. Not to mention developers do their best work at 1 o'clock in the morning so naturally the theme needed to look good on dimmed screens and couldn't use the universal color: white. This is what I came up with and I dare say the colors look nice. I call it Slight.

Putty themes can be easily imported into the Windows registry. Slight can be download directly from [here](https://gist.github.com/Silvenga/13d2f20d807b4a5c3ce3/raw/slight-putty-theme.reg) or from the source below. Note that you can change the default theme for all new sessions by changing `Slight` to `Default%20Settings`.

```reg
Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\Software\SimonTatham\PuTTY\Sessions\Slight]
"Colour0"="240,240,240"
"Colour1"="255,255,255"
"Colour2"="63,63,65"
"Colour3"="103,103,103"
"Colour4"="0,0,0"
"Colour5"="0,255,0"
"Colour6"="21,23,26"
"Colour7"="85,85,85"
"Colour8"="255,79,79"
"Colour9"="255,85,85"
"Colour10"="4,202,10"
"Colour11"="85,255,85"
"Colour12"="187,187,0"
"Colour13"="255,255,85"
"Colour14"="90,108,237"
"Colour15"="85,85,255"
"Colour16"="187,0,187"
"Colour17"="255,85,255"
"Colour18"="0,187,187"
"Colour19"="85,255,255"
"Colour20"="187,187,187"
"Colour21"="255,255,255"
```
