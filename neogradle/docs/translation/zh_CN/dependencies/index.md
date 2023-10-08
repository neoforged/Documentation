依赖
====

依赖关系不仅用于开发模组之间的互操作性或为游戏添加额外的库，还决定了为哪个版本的Minecraft开发。这将提供关于如何修改`repositories`和`dependencies`块以将依赖项添加到开发环境的快速概述。

> 这不会深入解释Gradle的概念。强烈建议你在继续之前阅读[Gradle依赖管理指南][guide]。

`minecraft`
-----------

`minecraft`依赖项指定要使用的Minecraft版本，并且必须包含在`dependencies`块中。除了具有组`net.minecraft`的artifact外，任何artifact都将应用随依赖项提供的任何补丁。这通常只指定`net.minecraftforge:forge` artifact。

```gradle
dependencies {
    // Forge artifact的版本遵循格式'<mc_version>-<forge_version>'
    // 'mc_version' 是要加载的Minecraft的版本（例如，1.19.4）
    // 'forge_version'对于那个Minecraft版本想要的Forge的版本（例如，45.0.23）
    // 原版可用'net.minecraft:joined:<mc_version>'编译作为替代
    minecraft 'net.minecraftforge:forge:1.19.4-45.0.23'
}
```

模组依赖
--------

在一个典型的开发环境中，Minecraft被降级为中间映射，用于生产，然后转换为模组指定的任何[人类可读的映射][mappings]。模组artifact在构建时会被混淆为生产映射（SRG），因此无法直接用作Gradle依赖项。

因此，在添加到预期配置之前，所有模组依赖项都需要用`fg.deobf`包装。

```gradle
dependencies {
    // 假设我们已经指定了'minecraft'依赖

    // 假设我们有某个可从一个指定仓库获取的artifact 'examplemod'
    implementation fg.deobf('com.example:examplemod:1.0')
}
```

### 本地模组依赖

如果你试图依赖的模组在Maven存储库上不可用（例如，[Maven Central][central]、[CurseMaven]、[Modrinth]），你可以使用[平坦目录][flat directory]添加模组依赖：

```gradle
repositories {
    // 将项目目录中的'libs'文件夹添加为一个平坦目录
    flatDir {
        dir 'libs'
    }
}

dependencies {
    // ...

    // 给定某个<group>:<name>:<version>:<classifier (default None)>
    //   具有指定的扩展名<ext (默认为jar)>
    // 平坦目录中的项目将按以下顺序解决：
    // - <name>-<version>.<ext>
    // - <name>-<version>-<classifier>.<ext>
    // - <name>.<ext>
    // - <name>-<classifier>.<ext>

    // 如果明确指定了一个分类器（classifier）
    //  具有分类器的artifact将具有优先级：
    // - examplemod-1.0-api.jar
    // - examplemod-api.jar
    // - examplemod-1.0.jar
    // - examplemod.jar
    implementation fg.deobf('com.example:examplemod:1.0:api')
}
```

!!! 注意
    组名称可以是任何内容，但对于平坦目录条目，不能为空，因为解析artifact文件时不会检查这些条目。

非Minecraft依赖
---------------

在开发环境中，Forge默认不会加载非Minecraft依赖项。为了让Forge识别非Minecraft依赖项，必须将它们添加到`minecraftLibrary`配置中。`minecraftLibrary`的工作原理类似于Gradle中的`implementation`配置，在编译时和运行时应用。

```gradle
dependencies {
    // ...

    // 假设有一个非Minecraft库'dummy-lib'
    minecraftLibrary 'com.dummy:dummy-lib:1.0'
}
```

> 默认情况下，添加到开发环境中的非Minecraft依赖项不会包含在构建的artifact中！你必须使用[Jar-In-Jar][jij]在构建时将依赖项包含在artifact中。

[guide]: https://docs.gradle.org/8.1.1/userguide/dependency_management.html
[mappings]: ../configuration/index.md#human-readable-mappings

[central]: https://central.sonatype.com/
[CurseMaven]: https://cursemaven.com/
[Modrinth]: https://docs.modrinth.com/docs/tutorials/maven/

[flat]: https://docs.gradle.org/8.1.1/userguide/declaring_repositories.html#sub:flat_dir_resolver

[jij]: ./jarinjar.md
