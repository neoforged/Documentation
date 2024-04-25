# 开始使用 NeoForge

本节包含有关如何设置 NeoForge 工作区以及如何运行和测试您的模组的信息。

## 先决条件

- 熟悉 Java 编程语言，特别是其面向对象、多态、泛型和功能性特征。
- 安装 Java 17 开发工具包（JDK）和 64 位 Java 虚拟机（JVM）。NeoForge 推荐并官方支持 [Microsoft 的 OpenJDK 构建][jdk]，但其他 JDK 也应该可以工作。

:::warning
确保您正在使用 64 位 JVM。检查的一种方式是在终端运行 `java -version`。使用 32 位 JVM 可能会出现问题，因为很多东西已经不再支持 32 位 JVM 了。
:::

- 熟悉您选择的集成开发环境（IDE）。
   - NeoForge 官方支持 [IntelliJ IDEA][intellij] 和 [Eclipse][eclipse]，这两者都集成了 Gradle 支持。但是，可以使用任何 IDE，从 Netbeans 或 Visual Studio Code 到 Vim 或 Emacs 都可以。
- 熟悉 [Git][git] 和 [GitHub][github]。技术上这不是必需的，但它会让您的生活变得更加轻松。

## 设置工作区

- 打开 [Mod Developer Kit (MDK)][mdk] GitHub 仓库，点击“使用此模板”并将新创建的仓库克隆到您的本地机器。
   - 如果您不想使用 GitHub，或者想获取旧提交或非默认分支的模板（例如，对于旧版本），您也可以下载仓库的 ZIP 文件（在代码 -> 下载 ZIP 下）并解压。
- 打开您的 IDE 并导入 Gradle 项目。Eclipse 和 IntelliJ IDEA 会为您自动完成此操作。如果您使用的 IDE 不支持此操作，您也可以通过 `gradlew` 终端命令来完成。
   - 首次进行此操作时，Gradle 将下载 NeoForge 的所有依赖项，包括 Minecraft 本身，并对其进行反编译。这可能需要相当长的时间（取决于您的硬件和网络强度，最多可达一个小时）。
   - 每当您对 Gradle 文件进行更改时，需要重新加载 Gradle 更改，可以通过您的 IDE 中的“重新加载 Gradle”按钮或再次通过 `gradlew` 终端命令来完成。

## 自定义您的模组信息

您的模组的许多基本属性都可以在 `gradle.properties` 文件中更改。这包括模组名称或模组版本等基本事项。有关更多信息，请参阅 `gradle.properties` 文件中的注释，或查看 [关于 `gradle.properties` 文件的文档][properties]。

如果您想进一步修改构建过程，可以编辑 `build.gradle` 文件。NeoGradle，NeoForge 的 Gradle 插件，提供了几个配置选项，其中一些选项通过 `build.gradle` 文件中的注释进行了解释。有关完整文档，请参阅 [NeoGradle 文档][neogradle]。

:::warning
只有在您知道自己在做什么时才编辑 `build.gradle` 和 `settings.gradle` 文件。所有基本属性都可以通过 `gradle.properties` 设置。
:::

## 构建和测试您的模组

要构建您的模组，请运行 `gradlew build`。这将在 `build/libs` 中输出一个名为 `<archivesBaseName>-<version>.jar` 的文件。`<archivesBaseName>` 和 `<version>` 是通过 `build.gradle` 设置的属性，默认为 `gradle.properties` 文件中的 `mod_id` 和 `mod_version` 值；如果需要，这可以在 `build.gradle` 中更改。然后可以将生成的 JAR 文件放置在启用 NeoForge 的 Minecraft 设置的 `mods` 文件夹中，或

上传到模组分发平台。

要在测试环境中运行您的模组，您可以使用生成的运行配置或使用相关任务（例如 `gradlew runClient`）。这将从相应的运行目录（例如 `runs/client` 或 `runs/server`）启动 Minecraft，以及任何指定的源集。默认 MDK 包括 `main` 源集，因此在 `src/main/java` 中编写的任何代码都将被应用。

### 服务器测试

如果您正在运行一个专用服务器，无论是通过运行配置还是 `gradlew runServer`，服务器将立即关闭。您需要通过编辑运行目录中的 `eula.txt` 文件来接受 Minecraft EULA。

一旦接受，服务器将加载并在 `localhost`（或默认的 `127.0.0.1`）下可用。然而，您仍然无法加入，因为服务器默认会进入在线模式，这需要认证（开发玩家没有）。要解决此问题，请再次停止您的服务器并将 `server.properties` 文件中的 `online-mode` 属性设置为 `false`。现在，启动您的服务器，您应该能够连接。

:::tips
您应该始终在专用服务器环境中测试您的模组。这包括[仅客户端模组][client]，因为这些在服务器上加载时不应做任何事情。
:::

[client]: ../concepts/sides.md
[eclipse]: https://www.eclipse.org/downloads/
[git]: https://www.git-scm.com/
[github]: https://github.com/
[intellij]: https://www.jetbrains.com/idea/
[jdk]: https://learn.microsoft.com/en-us/java/openjdk/download#openjdk-17
[mdk]: https://github.com/neoforged/MDK
[neogradle]: https://docs.neoforged.net/neogradle/docs/
[properties]: modfiles.md#gradleproperties
