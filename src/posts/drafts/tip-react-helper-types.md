---
tags:
  - posts
title: ...
description: ...
draft: "true"
---

One of the reasons I much prefer React over Vue is the first class support for TypeScript. Ditto, React ships a bunch of helper types for Typescript users to consume.

## Decorating HTML Elements

Say you are building a component library, and you just want the thinnest abstraction since you don't want to implement every property on the native element (or worse, close the abstraction).

React provides a neat template type to help building your component properties:

```ts
type DetailedHTMLProps<E extends HTMLAttributes<T>, T> = ClassAttributes<T> & E;
```

Just pass the correct generic parameters `E` and `T`, and you'll expose all the HTML Intrinsic properties.  So say you need to passthrough to a `div` element, that would look like:

```ts
React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
```

Now that we have a property bag of every possible property that `div` supports, we can use the spread operator to apply one or more of these properties onto our internal `div`:

```tsx
function CardProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export function Card(props: CardProps) {
    return (
        <div {...props} />
    )
}
```

Now, a passthrough like this isn't exactly useful - we want to support selective overriding and 

Once we've defined our component properties we introduce additional TypeScript language features, such as the spread operator (`...`)  and the object destruction assignment syntax.

```tsx
import clsx from "clsx";

export type IconProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export function Avatar({ className, ...props }: IconProps) {
    return (
        <div role="img"
            aria-label="Silvenga's avatar"
            className={clsx("avatar max-w-[192px] h-[192px] w-full", className)}
            {...props} />
    )
}
```

## Passing Children

## Passing Refs
