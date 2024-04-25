依赖项
====

依赖项不仅用于开发模组间的互操作性或向游戏添加额外的库，而且还决定了要为哪个版本的Minecraft进行开发。这将提供如何修改 `repositories` 和 `dependencies` 块以将依赖项添加到您的开发环境的快速概述。

> 这将不会深入解释 Gradle 概念。强烈建议在继续之前阅读 [Gradle 依赖管理指南][guide]。

`minecraft`
-----------

`minecraft` 依赖项指定了要使用的 Minecraft 版本，并且必须包含在 `dependencies` 块中。任何非 `net.minecraft` 组的工件都将应用随依赖项提供的任何补丁。这通常只指定 `net.minecraftforge:forge` 工件。

```gradle
dependencies {
    // Forge 工件的版本形式为 '<mc_version>-<forge_version>'
    // 'mc_version' 是要加载的 Minecraft 版本（例如，1.19.4）
    // 'forge_version' 是该 Minecraft 版本所需的 Forge 版本（例如，45.0.23）
    // Vanilla 可以使用 'net.minecraft:joined:<mc_version>' 来编译
    minecraft 'net.minecraftforge:forge:1.19.4-45.0.23'
}
```

Mod 依赖项
----------

在典型的开发环境中，Minecraft 被反混淆到中间映射中，用于生产，然后转换为模组制作者指定的任何[人类可读映射][mappings]。构建的 Mod 工件被混淆到生产映射（SRG）中，因此不能直接用作 Gradle 依赖项。

因此，所有 Mod 依赖项在添加到预期配置之前都需要用 `fg.deobf` 包装。

[guide]: https://docs.gradle.org/current/userguide/dependency_management.html
[mappings]: https://github.com/MinecraftForge/MCPConfig

```gradle
dependencies {
    // 假设我们已经指定了 'minecraft' 依赖项

    // 假设我们有一些可以从指定仓库获得的工件 'examplemod'
    implementation fg.deobf('com.example:examplemod:1.0')
}
```

### 本地 Mod 依赖项

如果你试图依赖的 mod 不在 maven 仓库中可用（例如，[Maven Central][central]、[CurseMaven]、[Modrinth]），你可以使用 [flat directory] 来添加 mod 依赖项：

```gradle
repositories {
    // 将项目目录中的 'libs' 文件夹添加为扁平目录
    flatDir {
        dir 'libs'
    }
}

dependencies {
    // ...

    // 给定某些 <group>:<name>:<version>:<classifier (默认无)>
    //   带有扩展名 <ext (默认 jar)>
    // 扁平目录中的工件将按以下顺序解析：
    // - <name>-<version>.<ext>
    // - <name>-<version>-<classifier>.<ext>
    // - <name>.<ext>
    // - <name>-<classifier>.<ext>

    // 如果明确指定了分类器
    //  带有分类器的工件将优先：
    // - examplemod-1.0-api.jar
    // - examplemod-api.jar
    // - examplemod-1.0.jar
    // - examplemod.jar
    implementation fg.deobf('com.example:examplemod:1.0:api')
}
```

:::note
组名可以是任何东西，但对于扁平目录条目必须非空，因为在解析工件文件时不会检查它们。
:::

非 Minecraft 依赖项
-------------------

Forge 在开发环境中默认不加载非 Minecraft 的依赖项。要让 Forge 识别非 Minecraft 依赖项，它们必须被添加到 `minecraftLibrary` 配置中。`minecraftLibrary` 的工作方式与 Gradle 中的 `implementation` 配置类似，在编译时间和运行时间都会应用。

```gradle
dependencies {
    // ...

    // 假设有一些非 Minecraft 库 'dummy-lib'
    minecraftLibrary 'com.dummy:dummy-lib:1.0'
}
```

> 默认情况下，添加到开发环境中的非 Minecraft 依赖项不会包含在构建的工件中！你必须使用 [Jar-In-Jar][jij] 在构建时将依赖项包含在工件内。

:::note
你创建的 Mod 在分发时，必须确保所有的依赖项都遵循其相应的许可协议，并且你在你的模组中包含它们时也符合这些许可。
:::

[guide]: https://docs.gradle.org/8.1.1/userguide/dependency_management.html
[mappings]: ../configuration/index.md#human-readable-mappings

[central]: https://central.sonatype.com/
[CurseMaven]: https://cursemaven.com/
[Modrinth]: https://docs.modrinth.com/docs/tutorials/maven/

[flat]: https://docs.gradle.org/8.1.1/userguide/declaring_repositories.html#sub:flat_dir_resolver

[jij]: ./jarinjar.md
