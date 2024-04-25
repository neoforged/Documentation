ForgeGradle文档
=========================

这是[ForgeGradle]的官方文档，ForgeGradle是一个用于使用MinecraftForge开发[MinecraftForge]和模组的[Gradle]插件。

这份文档 _仅_ 针对ForgeGradle，**这不是Java、Groovy或Gradle教程**。

如果你想为文档做出贡献，请阅读[为文档做贡献][contributing]。

添加插件
-----------------

通过在可用的插件仓库中添加MinecraftForge maven，可以使用`plugins`代码块添加ForgeGradle：

```gradle
// 在settings.gradle文件中
pluginManagement {
    repositories {
        // ...

        // 添加MinecraftForge maven
        maven { url = 'https://maven.minecraftforge.net/' }
    }
}

[ForgeGradle]: https://github.com/MinecraftForge/ForgeGradle
[Gradle]: https://gradle.org/
[MinecraftForge]: https://github.com/MinecraftForge/MinecraftForge
[contributing]: /docs/contributing.md
