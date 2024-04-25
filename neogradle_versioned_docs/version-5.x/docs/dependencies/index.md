依赖关系
============

依赖关系不仅用于开发模组之间的互操作性或向游戏添加额外的库，而且还决定了要为哪个版本的Minecraft开发。这里会简要介绍如何修改`repositories`和`dependencies`块来向你的开发环境添加依赖。

> 这不会深入解释Gradle概念。在继续之前，强烈推荐阅读[Gradle依赖管理指南][guide]。

`minecraft`
-----------

`minecraft`依赖项指定要使用的Minecraft版本，必须包含在`dependencies`块中。任何非`net.minecraft`组的工件都将应用随依赖项提供的任何补丁。这通常仅指定`net.minecraftforge:forge`工件。

```gradle
dependencies {
    // Forge工件的版本格式为'<mc_version>-<forge_version>'
    // 'mc_version' 是要加载的Minecraft版本（例如，1.19.4）
    // 'forge_version' 是该Minecraft版本所需的Forge版本（例如，45.0.23）
    // 正版可以使用'net.minecraft:joined:<mc_version>'来编译
    minecraft 'net.minecraftforge:forge:1.19.4-45.0.23'
}
```

模组依赖项
----------------

在典型的开发环境中，Minecraft的代码会去混淆到中间映射，这些映射用于生产，然后转换成模组开发者指定的任何[可读的映射][mappings]。构建的模组工件在生产中被混淆为SRG映射，因此不能直接用作Gradle依赖。

因此，所有模组依赖项在添加到预定配置之前都需要用`fg.deobf`进行包装。

```gradle
dependencies {
    // 假设我们已经指定了`minecraft`依赖项

    // 假设我们有一些可以从指定仓库获得的`examplemod`工件
    implementation fg.deobf('com.example:examplemod:1.0')
}
```

### 本地模组依赖项

如果你试图依赖的模组没有在maven仓库（例如，[Maven Central][central]、[CurseMaven]、[Modrinth]）上可用，你可以使用[平面目录][flat]添加模组依赖项：

```gradle
repositories {
    // 将项目目录中的`libs`文件夹添加为平面目录
    flatDir {
        dir 'libs'
    }
}

dependencies {
    // ...

    // 假定有某个<group>:<name>:<version>:<classifier (默认None)>
    //   且扩展名为<ext (默认jar)>
    // 平面目录中的工件将按以下顺序解析：
    // - <name>-<version>.<ext>
    // - <name>-<version>-<classifier>.<ext>
    // - <name>.<ext>
    // - <name>-<classifier>.<ext>

    // 如果显式指定了分类器
    //  带有分类器的工件将获得优先权：
    // - examplemod-1.0-api.jar
    // - examplemod-api.jar
    // - examplemod-1.0.jar
    // - examplemod.jar
    implementation fg.deobf('com.example:examplemod:1.0:api')
}
```

:::注意
组名可以是任何东西，但对于平面目录项来说不能是空的，因为在解析工件文件时不会检查它。
:::

非Minecraft依赖项
--------------------------

Forge默认情况下不会在开发环境中加载非Minecraft依赖项。要让Forge识别非Minecraft依赖项，它们必须被添加到`minecraftLibrary`配置中。`minecraftLibrary`的工作方式类似于Gradle中的`implementation`配置，在编译时和运行时被应用。

```gradle
dependencies {
    // ...

    // 假设有一些非Minecraft库'dummy-lib'
    minecraftLibrary 'com.dummy:dummy-lib:1.0'
}
```

> 默认情况下，添加到开发环境中的非Minecraft依赖项将不会包含在构建的工件中！你必须使用[Jar-In-Jar][jij]在构建时，在工件中包含这些依赖项。

[guide]: https://docs.gradle.org/7.6/userguide/dependency_management.html
[mappings]: ../configuration/index.md#human-readable-mappings
[central]: https://central.sonatype.com/
[CurseMaven]: https://cursemaven.com/
[Modrinth]: https://docs.modrinth.com/docs/tutorials/maven/
[flat]: https://docs.gradle.org/7.6/userguide/declaring_repositories.html#sub:flat_dir_resolver
[jij]: ./jarinjar.md
