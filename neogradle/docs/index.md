---
sidebar_position: 0
---

# NeoGradle Documentation

This is the official documentation for [NeoGradle], a [Gradle] plugin for developing [NeoForge] and mods using NeoForge.

This documentation is _only_ for NeoGradle, **this is not a Java, Groovy, or Gradle tutorial**.

If you would like to contribute to the docs, read [Contributing to the Docs][contributing].

## Adding the Plugin

NeoGradle can be added using the `plugins` block by adding the NeoForged maven to the available plugin repositories:

```gradle
// In settings.gradle
pluginManagement {
    repositories {
        // ...

        // Add the NeoForged maven
        maven { url = 'https://maven.neoforged.net/releases' }
    }
}
```

```gradle
// In build.gradle
plugins {
    // Add the NeoGradle userdev plugin
    id 'net.neoforged.gradle.userdev' version '7.0.93'

    // ...
}
```

:::note
While you can use version ranges for the NeoGradle plugin, it is not recommended to do so, as that may lead to more frequent decompilation and recompilation rounds and possible behavioral changes.  
You can find the latest NeoGradle version on our [Project Listing].
:::

## Adding the NeoForge dependency
In order to get the decompiled Minecraft environment and the NeoForge classes in your development environment, you just need to add the `net.neoforged:neoforge` dependency to a configuration for both a runtime and compile-time dependencies (usually `implementation`):
```gradle
dependencies {
    // highlight-next-line
    implementation 'net.neoforged:neoforge:20.4.162-beta'
}
```

:::note
You can find the latest NeoForge version on our [Project Listing](https://projects.neoforged.net/neoforged/neoforge).
:::

[NeoGradle]: https://github.com/NeoForged/NeoGradle
[Gradle]: https://gradle.org/
[MinecraftForge]: https://github.com/NeoForged/MinecraftForge
[contributing]: /docs/contributing.md
[Project Listing]: https://projects.neoforged.net/neoforged/neogradle
