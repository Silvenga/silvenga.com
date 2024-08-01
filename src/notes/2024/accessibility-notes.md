---
tags:
  - web-dev
  - ux
title: UX and Accessibility
description: My personal notes regarding UX and accessibility.
---

> This is a living note, but consider this a tertiary source at best. I would love to know if any of this is wrong.

These are my personal notes around accessibility (a11y). I'll hopefully remember to complete this...

## Navigation

### Banners

Apply the ARIA role `banner` to the top-level navigation container that are repeated across multiple pages - e.g. the primary navbar.

```html
<nav role="banner"></nav>
```

Optionally, this role is assumed by specification if the content is in a `header` container which is not a child of a section container (e.g. `section`, `main`, etc.).

```html
<body>
  <header>
    <nav></nav>
  </header>
</body>
```

### Shortcuts

Provide "skip links", visible to screen-readers, to allow users to navigate past uninteresting content.

```html
<h2>Table of Contents</h2>
<a class="sr-only" href="#after-toc">Skip table of contents</a>
<div id="after-toc"></div>
```

> I've seen recommendations to add "skip links" to skip past common content across multiple pages e.g. the primary navbar.
