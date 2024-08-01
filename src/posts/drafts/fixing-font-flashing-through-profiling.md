---
tags:
  - posts
title: ...
description: ...
draft: "true"
---

## Introduction

A problem I find in 2024, on a lot of web sites, is a flashing behavior of the web fonts. It's only apparent in fast static websites - not [SPA's](https://en.wikipedia.org/wiki/Single-page_application) - so I just haven't needed to care much, when I write frontend code, it's normally for SPA's. If you search around, you'll likely find a bunch of people and SEO content farms claiming [`font-display: optional`](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display) fixes this issue. This might be true for some, but not for my site.

combo of unstyled content (before the primary stylesheet loads, text can be seen briefly on the left) and invisable text (inline svg's render then the font).

it is more efficient to inline fonts

- css is cached (no web request, I'm assuming in memory)
- web font is cached (no web request, assuming from in memory, loaded by the css)
- 