---
sidebar_position: 0
---

# NeoGradle Documentation

This is the official documentation for [NeoGradle], a [Gradle] plugin for developing [NeoForge] and mods using NeoForge.

This documentation is _only_ for NeoForge, **this is not a Java, Groovy/Kotlin, or Gradle tutorial**.

If you would like to contribute to the docs, read [Contributing to the Docs][contributing].

## Adding the Plugin

NeoGradle can be added using the `plugins` block in `build.gradle` by adding the NeoForged maven to the available plugin repositories in `settings.gradle`:

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
    id 'net.neoforged.gradle.userdev' version '7.0.120'

    // ...
}
```

:::note
While you can use version ranges for the NeoGradle plugin, it is not recommended to do so, as that may lead to more frequent decompilation and recompilation rounds and possible behavioral changes. You can find the latest NeoGradle version on our [Project Listing][gradlelisting].
:::

## Adding the NeoForge dependency

In order to get the decompiled Minecraft environment and the NeoForge classes in your development environment, you just need to add the `net.neoforged:neoforge` dependency to a configuration for both a runtime and compile-time dependencies (usually `implementation`):

```gradle
dependencies {
    // highlight-next-line
    implementation 'net.neoforged:neoforge:20.6.43-beta'
}
```

:::note
[NeoForge's MDK][mdk] sets the NeoForge version via [gradle.properties][properties]. You can find the latest NeoForge version on our [Project Listing][neolisting].
:::

[NeoGradle]: https://github.com/neoforged/NeoGradle
[Gradle]: https://gradle.org/
[NeoForge]: https://github.com/neoforged/NeoForge
[contributing]: /contributing
[gradlelisting]: https://projects.neoforged.net/neoforged/neogradle
[neolisting]: https://projects.neoforged.net/neoforged/neoforge
[mdk]: https://github.com/neoforged/MDK
[properties]: https://github.com/neoforged/MDK/blob/a52ce16c8a1dd2d656edac482376f33385fe912c/gradle.properties#L19
