# AGENTS.md

This project contains both the posts/notes and the harness that converts these resources into a static website to be
published.

## Goals

- Static content first: The site is published fully static.
    - No dynamic server-side rendering, no client-side hydration.
    - Assets are bundled efficiently for aggressive client/CDN caching.
- Accessible: The site is usable with a keyboard, a screen reader, and no JS. Accessibility is a feature.
    - Decorative elements degrade to a working fallback from assistive tech and interactive controls are labeled.
    - Dark and light modes by default, respecting user choice.
- JS Optional: JS is always optional (progressive enhancement), but may add additional features.
    - While the site targets modern browsers, it only requires modern HTML and CSS processing to be readable.
- Performant: The site loads fast with minimal JS and CSS.
- Durable: A growing site that withstands entropy. The content should outlive the infrastructure.
    - Posts have canonical URLs that do not change. Moved posts redirect.
    - The site embraces Markdown with sensible extensions when the limit of standard Markdown is reached. Portability of
      the content is important.
- A citizen of the web: The site embraces the modern web to be searchable and delightful.
    - Metadata is complete - title, description, Open Graph, RSS, sitemap, etc.
    - Content that would pollute search indexes opt-out of indexing.

## Constraints

- Do not modify human written posts/notes without explicit direction from the User. Raise issues, but do not
  automatically correct issues.
- Do not break URLs. A permalink change is a breaking change.
