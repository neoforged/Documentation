NeoGradle 文档 中文翻译
======================

:::info
欢迎访问[NeoForged文档中文翻译官方仓库][translation-repo]，对我们的翻译内容提出意见或建议。
:::

# 前言

:::caution
请注意，由于NeoForged处于创始阶段，本文档可能未紧跟最新版本。

在NeoGradle发布其第一个版本之前，你应该参考ForgeGradle文档。ForgeGradle第6和5版的文档在此处归档。
:::

这里是[ForgeGradle]的官方文档，用于开发[MinecraftForge]以及使用MinecraftForge的模组的一个[Gradle]插件。

该文档 _仅_ 针对ForgeGradle编纂，**而不是一个Java、Groovy或Gradle教程**。

如果你愿意对文档做出贡献，请阅读[向文档做出贡献][contributing]。

添加该插件
---------

ForgeGradle使用Gradle 8；它可以使用`build.gradle`中的`plugins`块添加，方法是将以下信息添加到`settings.gradle`：

```gradle
// 在settings.gradle中
pluginManagement {
    repositories {
        // ...

        // 添加MinecraftForge maven
        maven { url = 'https://maven.minecraftforge.net/' }
    }
}

plugins {
    // 添加toolchain resolver
    id 'org.gradle.toolchains.foojay-resolver-convention' version '0.5.0'
}
```

```gradle
// 在build.gradle中
plugins {
    // 添加ForgeGradle插件
    id 'net.minecraftforge.gradle' version '[6.0,6.2)'

    // ...
}
```

# 目录
- [主页](./index.md)
- [向这篇文档做出贡献](./contributing.md)
- 入门
    - [概述](./gettingstarted/index.md)
- 配置选项
    - [概述](./configuration/index.md)
    - [运行配置](./configuration/runs.md)
    - [进阶主题](./configuration/advanced.md)
- 依赖
    - [概述](./dependencies/index.md)
    - [Jar-in-Jar](./dependencies/jarinjar.md)
- [移植到当前版本](./porting/5.x_to_6.0.md)

[translation-repo]: https://github.com/srcres258/neo-doc
[contributing]: ./contributing.md
[ForgeGradle]: https://github.com/MinecraftForge/ForgeGradle
[Gradle]: https://gradle.org/
[MinecraftForge]: https://github.com/MinecraftForge/MinecraftForge
[contributing]: ./contributing.md
