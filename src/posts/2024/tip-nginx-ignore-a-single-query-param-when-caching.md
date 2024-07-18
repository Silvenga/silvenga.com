---
tags:
  - posts
  - linux
  - nginx
title: "Tip: Ignore a Single Query Parameter when Caching with Nginx"
description: A possible method of ignoring a part of the query string when caching with Nginx.
---

Since it's not entirely obvious, this is how you can ignore a subset of the query string when using Nginx as a cache for an upstream server (think legacy cache-busting behavior, which can make a Nginx cache ineffective).

First off is the [`proxy_cache_key`](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_cache_key) directive, which defaults to the value of `$scheme$proxy_host$uri$is_args$args`. This is ultimately the value that is hashed by Nginx as the lookup key for the cached result. So naturally, any change to this key will result in a separate canonical cache.

> `$is_args` resolves to the literal `?` or empty string, so you can basically consider this key to be equal to `$scheme$proxy_host$request_uri`

But let's say we want to ignore a value e.g. say `?random=2d027f03-54aa-4713-b67a-1d11a3025f59`, but don't want to take the draconic approach of asking Nginx to completely ignore the query string. For this, I think the easiest solution is to use Nginx [maps](https://nginx.org/en/docs/http/ngx_http_map_module.html) and regex.

```ini
# Maps need to be under the http context.
http {

    # The input to the map is $args, which might be an empty string.
    map $args $cache_args {
        # Kind of scary, explained later.
        "~*^(.*?)?&?tag=[^&]*?(&.*)?$" $1$2;
        # If the above regex fails to match, assume the $args as unchanged.
        default $args;
    }
}
```

Let's break down that scary regex.

![A regex expression that is color coded with the different sections](/posts/2024/images/regex-highlighted.png "I'm so sorry to screen readers, I have no idea how to make this accessible.")

- (Purple) The first section isn't regex, but it does enable regex within the map pattern selector. The `*` part declares this regex should be done case-insensitive. RFC does say that URL's should be case-sensitive, but most systems follow [Postel's law](https://en.wikipedia.org/wiki/Robustness_principle), as case may change going through multiple proxies.
- (Yellow) Just specifying that this regex must eat the whole input, or none of the input.
- (Green) Group 1 (aka `$1`) - basically eat everything, non-greedily, before our "query parameter to remove". The non-greedy `*?` is mostly a micro-optimization to avoid regex backtracking.
- (Red) Group 2 (aka `$2`) - basically eat everything after the "query parameter to remove".
- (Gray) The actual "query parameter to remove" - basically eat the literal `random=`, and then any input that is not `&`.

So this regex ultimately will produce 2 groups, ignoring the part of the query string we want to ignore.

![A query string with the regex groups applied, color coded](/posts/2024/images/regex-groups.png "I reaaly should learn to use a vector editor, and not Microsoft Word...")

So the end result of `$cache_args` will either be `$args$`  or the concatenation of `$1$2`, or the green and red groups.

After we have our new normalized query string, it can be used in the cache key. A complete config might look like:

```ini
http {

    map $args $cache_args {
        "~*^(.*?)?&?tag=[^&]*?(&.*)?$" $1$2;
        default $args;
    }

    server {
        location / {
            proxy_pass http://upstream:80;
            proxy_cache main;
            proxy_cache_min_uses 0;
            proxy_cache_lock on;

            # Set the cache key to use our possibly modified $cache_args.
            proxy_cache_key $scheme$proxy_host$uri$is_args$cache_args;

            add_header X-Cache-Status $upstream_cache_status;
            add_header X-Cache-Key $uri$is_args$cache_args;
        }
    }
}
```

> Here I'm using the `X-Cache-Key` response header to help test my regex. For this to be a success, `X-Cache-Key` should be the exact same URL that Nginx receives, minus that one query parameter `random=`.
