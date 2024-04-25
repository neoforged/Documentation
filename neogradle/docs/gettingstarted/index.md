开始使用ForgeGradle
============================

如果你之前从未使用过ForgeGradle，这里是建立开发环境所需的最少的信息。

#### 前提条件

* Java开发工具包（JDK）的安装

Minecraft版本 | Java开发工具包版本
:---:          | :---:
1.12 - 1.16    | [JDK 8][jdk8]
1.17           | [JDK 16][jdk16]
1.18 - 1.19    | [JDK 17][jdk17]

* 熟悉集成开发环境（IDE）
    * 最好使用具有某种形式的Gradle集成的IDE

## 设置ForgeGradle

1. 首先从MinecraftForge下载[模组开发套件（MDK）][mdk]，将zip文件解压到一个空的目录中。
1. 使用你选择的IDE打开MDK解压的目录。如果你的IDE有Gradle集成，将其作为Gradle项目导入。
1. 自定义你的Gradle构建脚本以适应你的模组：
    1. 将`archivesBaseName`设置为所需的模组ID。此外，替换所有出现的`examplemod`为你的模组ID。
    1. 更改`group`为你想要的包名称。确保遵循现有的[命名约定][group]。
    1. 更改`version`号以反映你模组的当前版本。强烈推荐使用[Forge关于语义版本控制的扩展][semver]。


:::警告
确保对模组ID的任何更改都反映在mods.toml和主要模组类中。有关更多信息，请查看Forge文档上的[构建你的模组][structuring]。
:::

2. 使用IDE重新加载或刷新你的Gradle项目。如果你的IDE没有Gradle集成，运行以下命令在项目目录中的shell中：

```sh
./gradlew build --refresh-dependencies
```

5. 如果你的IDE是Eclipse、IntelliJ IDEA或Visual Studio Code，你可以使用以下命令生成运行配置，分别是：

#### Eclipse

```sh
./gradlew genEclipseRuns
```

#### IntelliJ IDEA

```sh
./gradlew genIntellijRuns
```

#### Visual Studio Code

```sh
./gradlew genVSCodeRuns
```

你可以使用生成的运行配置来运行客户端、服务器等。

:::小贴士
如果你的IDE未列出，你仍然可以使用`./gradlew run*` (例如，`runClient`, `runServer`, `runData`)来运行配置。这些命令也可以在支持的IDE中使用。
:::

恭喜你，现在你已经建立了一个开发环境！

[jdk8]: https://adoptium.net/temurin/releases/?version=8
[jdk16]: https://adoptium.net/temurin/releases/?version=16
[jdk17]: https://adoptium.net/temurin/releases/?version=17

[mdk]: https://files.minecraftforge.net/
[group]: https://docs.oracle.com/javase/tutorial/java/package/namingpkgs.html
[semver]: https://
