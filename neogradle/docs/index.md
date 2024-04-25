NeoGradle 文档
=========================

:::注意
请注意，鉴于NeoForged的最近创建，本文档可能不是最新的。

在NeoGradle发布其首个版本之前，您应该参考ForgeGradle的文档。版本6和5的ForgeGradle文档已存在这里。
:::

这是[ForgeGradle]官方文档，一个用于使用MinecraftForge开发[MinecraftForge]和mods的[Gradle]插件。

这份文档 _仅_ 适用于ForgeGradle，**这不是Java、Groovy或Gradle教程**。

如果您想为文档贡献内容，请阅读[为文档做贡献][contributing]。

添加插件
-----------------

ForgeGradle 使用 Gradle 8；它可以通过在 `build.gradle` 的 `plugins` 区块中添加以下信息到 `settings.gradle` 来添加：

```gradle
// 在 settings.gradle 中
pluginManagement {
    repositories {
        // ...

        // 添加 MinecraftForge maven
        maven { url = 'https://maven.minecraftforge.net/' }
    }
}

plugins {
    // 添加工具链解析器
    id 'org.gradle.toolchains.foojay-resolver-convention' version '0.5.0'
}
```

```gradle
// 在 build.gradle 中
plugins {
    // 添加 ForgeGradle 插件
    id 'net.minecraftforge.gradle' version '[6.0,6.2)'

    // ...
}
```

[ForgeGradle]: https://github.com/MinecraftForge/ForgeGradle
[Gradle]: https://gradle.org/
[MinecraftForge]: https://github.com/MinecraftForge/MinecraftForge
[contributing]: /contributing
