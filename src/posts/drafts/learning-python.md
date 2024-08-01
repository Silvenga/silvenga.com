---
tags:
  - posts
  - python
  - dotnet
title: My Experience Learning Python
description: Learning Python as a .NET developer.
draft: "true"
---
## Throwing Exceptions

In C#, we would have something like:

```csharp
if (error) {
  throw new Exception("An error occured!");
}
```

```python
if error:
    raise ValueError("An error occurred.")
```

[Manually raising (throwing) an exception in Python - Stack Overflow](https://stackoverflow.com/a/24065533/2001966)
