---
title: Lazy View - A jQuery Plugin
date: 2014-06-22
description: Let content flow in via another jQuery plugin.
archived: 2018-01-13
---

I hate slow websites. A month or so ago I had to log onto Delta.com. I was largely unimpressed with the speed in which it loaded. I could wait for seconds until text would appear. I would wait even longer for the site to become responsive.

![Slow Site](/posts/archive/content/images/2014/Jun/slow-website.jpg)

This is what I hate about browsing the Internet. A user should not have to wait for a page to download. So I made it my life mission to optimise this blog. I am currently averaging 600ms from start to ready. This is largely impressive (top 5% of load times) for a dynamic site such as my own.

I've gotten to the point on this blog's design that I cannot make loading any faster. My next step is to make loading appear faster to the user.

This lead me to create a jQuery plugin that I call Lazy View. With this plugin, elements will fade into view as the user moves around the page.

## Plugin Usage

[Download](https://github.com/Silvenga/jquery-lazyView/archive/master.zip)

[Github](https://github.com/Silvenga/jquery-lazyView)

```html
!-- This is a jquery plugin - we need jquery > 2.1 -->
<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>

<!-- Off load the animations to CSS so we can get hardware acceleration -->
<link rel="stylesheet" type="text/css" href="jquery.lazyView.min.css" />
<!-- The lazyView script -->
<script src="jquery.lazyView.min.js"></script>
<script>
   $(document).ready(function() {
      // Select the HTML portion to lazyView.
      // To ensure a smooth transition set the element's visibility to hidden
      // LazyView will make the selected element visible when complete with setup
      $('body').lazyView();
   });
</script>
```

## Demo

[Github Page](https://silvenga.github.io/jquery-lazyView/)
