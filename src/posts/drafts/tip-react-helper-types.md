---
tags:
  - react
  - typescript
title: "Tip: React has Type Helpers"
description: Using React type helpers to clean up boilerplate code and make code more robust.
---

One of the reasons I much prefer React over Vue is the first class support for TypeScript. Ditto, React ships a bunch of helper types for Typescript users to consume.

Here I'm talking about  the two big helper types provided by React.

## Wrapping HTML Elements

Say you are building a component library, and you want to decorate a native HTML element with custom functionality or default styles (see [decorator pattern](https://en.wikipedia.org/wiki/Decorator_pattern)). React provides a neat template type to help building your component properties:

```ts
type DetailedHTMLProps<E extends HTMLAttributes<T>, T> = ClassAttributes<T> & E;
```

Just pass the correct generic parameters `E` and `T`, and you'll expose all the HTML intrinsic properties.  So say you need to passthrough to a `div` element, that would look like:

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

Now, a passthrough like this isn't exactly useful - ideally we would define some reasonable defaults or override select functionality, but allow consumers to control as much of the component as possible.

So I like to use this pattern, making use of Typescript's spread operator and object deconstruction syntax:

```tsx
import clsx from "clsx";

export type IconProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export function Avatar({ className, ...props }: IconProps) {
    return (
        <div aria-label="Silvenga's avatar"
             className={clsx("avatar max-w-[192px] h-[192px] w-full", className)}
             {...props}
             role="img" />
    )
}
```

Note that order here matters, where any duplicate properties defined in `props` will override properties defined before the spread operation (so you typically want the spread operation to be last). The `aria-label` property can be overwritten by consumers, but not the `role` property:

```tsx
<div>
    <Avatar aria-label="Author's avatar" onClick={doSomething} />
</div>
```

But there are cases where you don't want to allow the consumer to fully override properties, but you also want to stay flexible, such as supporting default styles while giving the consumer flexibility to apply custom CSS as needed.

This is where merging comes into play. For this, I like to use `clsx`, a nice helper function that concatenates truthy objects (either strings or arrays) into the standard `className` format.

What's cool about object deconstruction is that you can pick what properties are "deconstructed" and pass the rest into another object using a variation of the spread operator. This avoids accidentally overriding `className` after `className` is set.

## Passing Children

Another common React pattern is passing children into components. A simple component might look like the following:

```tsx
type ContainerProps = {
    children: JSX.Element;
    languageId: string;
    attributes: Attribute[];
    hljs: HLJSApi;
}

function Container({ children, ...props }: ContainerProps) {
    return (
        <figure className="code-fence hljs my-4 rounded overflow-hidden">
            <Header {...props} />
            {children}
        </figure>
    );
}
```

But this is actually quite limiting, as `children` could be of many types e.g. `string`, `JSX.Element`, `number`, or even `undefined`.

Actually, the full list defined by React:

```ts
type ReactNode =
    | ReactElement
    | string
    | number
    | Iterable<ReactNode>
    | ReactPortal
    | boolean
    | null
    | undefined
    | DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_REACT_NODES[
        keyof DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_REACT_NODES
    ];
```

So while we could just use `ReactNode` instead, using the existing type helper would be even better!

```tsx
type PropsWithChildren<P = unknown> = P & { children?: ReactNode | undefined };
```

So something like this:

```tsx
type ContainerProps = {
    languageId: string;
    attributes: Attribute[];
    hljs: HLJSApi;
}

function Container({ children, ...props }: PropsWithChildren<ContainerProps>) {
    return (
        <figure className="code-fence hljs my-4 rounded overflow-hidden">
            <Header {...props} />
            {children}
        </figure>
    );
}
```

And that's all folks, cheers!
