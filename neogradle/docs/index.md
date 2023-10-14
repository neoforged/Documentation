---
sidebar_position: 0
---

NeoGradle 문서
=========================

:::caution
NeoForged는 최근에 설립된 단체고, 그 문서의 비공식 번역본이기에 문서가 불완전합니다.

NeoGradle의 최초 출시 이전까지는 영문 ForgeGradle 6&5 문서를 대신 운영합니다.
:::

This is the official documentation for [ForgeGradle], a [Gradle] plugin for developing [MinecraftForge] and mods using MinecraftForge.

This documentation is _only_ for ForgeGradle, **this is not a Java, Groovy, or Gradle tutorial**.

If you would like to contribute to the docs, read [Contributing to the Docs][contributing].

Adding the Plugin
-----------------

ForgeGradle uses Gradle 8; it can be added using the `plugins` block in the `build.gradle` by adding the following information to the `settings.gradle`:

```gradle
// In settings.gradle
pluginManagement {
    repositories {
        // ...

        // Add the MinecraftForge maven
        maven { url = 'https://maven.minecraftforge.net/' }
    }
}

plugins {
    // Add toolchain resolver
    id 'org.gradle.toolchains.foojay-resolver-convention' version '0.5.0'
}
```

```gradle
// In build.gradle
plugins {
    // Add the ForgeGradle plugin
    id 'net.minecraftforge.gradle' version '[6.0,6.2)'

    // ...
}
```

[ForgeGradle]: https://github.com/MinecraftForge/ForgeGradle
[Gradle]: https://gradle.org/
[MinecraftForge]: https://github.com/MinecraftForge/MinecraftForge
[contributing]: /contributing
