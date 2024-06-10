---
title: The Perfect Singleton Implementation in Java
date: 2014-05-01
description: Randomly, a Java singleton implementation.
archived: 2018-01-13
---

For the longest time I've read books describing ways to implement the Singleton pattern. Many of these used some type of thread synchronization and was generally hacky. I've found the perfect solution and alternative.

```java
package com.silvenga.singleton;

import java.util.Random;

public class RandomSingleton

	// Basic interface for a Singleton
	public static Random getInstance() {

		// Return the instance of Random created in RandomContainer
		return Container.randomInstance;
	}

	// We use an enum for lazy loading. Load a new instance once and only when needed
	// Making a Singleton this way prevents any attempt of making multiple instances
	private static enum Container {

		// Required to prevent compiler optimization
		INSTANCE;

		// When the Enum is first accessed it will create
		// a static instance of Random
		private static Random randomInstance = new Random();
	}
}
```
