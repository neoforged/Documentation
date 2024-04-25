ForgeGradle入门
================================

如果你以前从未使用过ForgeGradle，这里有一些设置开发环境所需的最少内容。

#### 先决条件

* Java开发工具包（JDK）的安装

Minecraft版本        | Java开发工具包版本
:---:                | :---:
1.12 - 1.16          | [JDK 8][jdk8]
1.17                 | [JDK 16][jdk16]
1.18 - 1.19          | [JDK 17][jdk17]

* 熟悉一个集成开发环境（IDE）
    * 最好使用带有某种形式的Gradle集成的IDE

## 设置ForgeGradle

1. 首先从MinecraftForge下载[模组开发套件（MDK）][mdk]的副本，并将zip解压到一个空目录中。
1. 在你选择的IDE中打开你解压MDK的目录。如果你的IDE与Gradle集成，将其作为一个Gradle项目导入。
1. 自定义你的Gradle构建脚本以适合你的模组：
    1. 将`archivesBaseName`设置为所需的模组ID。此外，将所有出现的`examplemod`替换为模组ID。
    1. 更改`group`为你想要的包名。确保遵循现有的[命名惯例][group]。
    1. 将`version`号更改为反映你的模组的当前版本。强烈建议使用[Forge对语义版本控制的扩展][semver]。

:::警告
确保对模组ID的任何更改都反映在mods.toml和主模组类中。有关更多信息，请参阅Forge文档上的[结构化你的模组][structuring]。
:::

4. 使用你的IDE重新加载或刷新你的Gradle项目。如果你的IDE没有Gradle集成，以上一个shell在你项目的目录下运行以下命令:

```sh
./gradlew build --refresh-dependencies
```

5. 如果你的IDE是Eclipse、IntelliJ IDEA或Visual Studio Code，你可以使用下列命令之一生成运行配置：

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

:::提示
如果你的IDE未被列出，你仍然可以使用`./gradlew run*`（例如，`runClient`, `runServer`, `runData`）运行配置。你也可以在支持的IDE中使用这些命令。
:::

恭喜你，现在你已经设置了一个开发环境！

[jdk8]: https://adoptium.net/temurin/releases/?version=8
[jdk16]: https://adoptium.net/temurin/releases/?version=16
[jdk17]: https://adoptium.net/temurin/releases/?version=17

[mdk]: https://files.minecraftforge.net/
[group]: https://docs.oracle.com/javase/tutorial/java/package/namingpkgs.html
[semver]: https://docs.minecraftforge.net/en/latest/gettingstarted/versioning/
[structuring]: https://docs.minecraftforge.net/en/latest/gettingstarted/structuring/
