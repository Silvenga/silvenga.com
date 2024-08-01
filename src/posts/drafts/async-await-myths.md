---
tags:
  - posts
  - javascript
  - typescript
  - dotnet
title: Async/Await Myths
description: How async/await works, and clickbaity myths so I can justify writing actually useful stuff.
draft: "true"
---
## Introduction

I think language support for async/await continues to confuse a lot of developers, on all levels of experience. It actually kind of supprised me how old async/await actually is.

- C# version 5 added support for async/await in 2012.
- TypeScript, with help from Anders Hejlsberg, lead architect of C#, introduced async/await in 2015, with the newly released version 1.7.
- JavaScript got support with the release of ECMAScript 2017, likely taking inspiration from the wildly successful TypeScript (citation needed). Soon after, baseline status was reached the same year in 2017.

While C#'s async/await implementation can be traced all the way back to research papers in the 90's, I think the modern syntax iteration is much more important to concentrate on (which helps to avoid a language war, _me talking to any Java developer_ 😅).

## Myths

### Async/Await Makes Code Faster

### Async/Await Makes Code Run in Parallel
