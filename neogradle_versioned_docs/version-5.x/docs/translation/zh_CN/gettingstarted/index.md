入门ForgeGradle
===============

如果你以前从未使用过ForgeGradle，以下是设置开发环境所需的最低信息量。

#### 先决条件

* Java开发包（JDK）的安装

Minecraft版本      | Java开发包版本
:---:              | :---:
1.12 - 1.16        | [JDK 8][jdk8]
1.17               | [JDK 16][jdk16]
1.18 - 1.19        | [JDK 17][jdk17]

* 熟练使用一款集成开发环境（IDE）。
    * 建议使用一款集成了Gradle功能的IDE。

## 安装ForgeGradle

1. 首先从MinecraftForge下载[Modder Development Kit（MDK）][mdk]的一个副本，并将zip解压到一个空目录中。
1. 在你选择的IDE中打开提取MDK的目录。如果你的IDE集成了Gradle，请将其作为Gradle项目导入。
1. 为你的模组自定义你的Gradle构建脚本：
    1. 将`archivesBaseName`设置为所需的mod id。此外，用该mod id替换所有出现的`examplemod`。
    1. 将`group`更改为所需的程序包名称。请确保遵循现有的[命名约定][group]。
    1. 更改`version`编号以反映你的模组的当前版本。强烈建议使用[Forge对语义版本控制的扩展][semver]。


!!! 重要
    确保对mod id的任何更改都反映在mods.toml和模组主类中。有关更多信息，请参阅Forge文档上的[规划你的模组结构][structuring]。

4. 使用IDE重新加载或刷新Gradle项目。如果你的IDE没有集成Gradle，请从项目目录中的shell运行以下命令：

```sh
./gradlew build --refresh-dependencies
```

5. 如果你的IDE是Eclipse、IntelliJ IDEA或Visual Studio Code，则可以分别使用以下命令之一生成运行配置：

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

你可以使用生成的运行配置之一来运行客户端、服务端等。

!!! 提示
    如果你的IDE没有被列出，你仍然可以使用`./gradlew run*`（例如，`runClient`、`runServer`、`runData`）。你也可以将这些命令与支持的IDE一起使用。

恭喜你，现在你已经建立了一个开发环境！


[jdk8]: https://adoptium.net/temurin/releases/?version=8
[jdk16]: https://adoptium.net/temurin/releases/?version=16
[jdk17]: https://adoptium.net/temurin/releases/?version=17

[mdk]: https://files.minecraftforge.net/
[group]: https://docs.oracle.com/javase/tutorial/java/package/namingpkgs.html
[semver]: https://docs.minecraftforge.net/en/latest/gettingstarted/versioning/
[structuring]: https://docs.minecraftforge.net/en/latest/gettingstarted/structuring/
