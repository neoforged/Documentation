Forge入门
=========

如果你之前从未制作过一个Forge模组，本节将提供设置Forge开发环境所需的最少信息。其余的文档是关于从这里开始的内容。

先决条件
--------

* 安装Java 17开发包（JDK）和64位JVM。Forge推荐并官方支持[Eclipse Temurin][jdk]。

    :::danger
        确保你正在使用64位的JVM。一种检查方式是在终端中运行`java -version`。使用32位的JVM会导致在使用[ForgeGradle]的过程中出现问题。
    :::

* 熟练使用一款集成开发环境（IDE）。
    * 建议使用一款集成了Gradle功能的IDE。

从零开始模组开发
----------------

1. 从[Forge文件站][files]下载Mod开发包（MDK）。点击“Mdk”，等待一段时间之后点击右上角的“Skip”按钮。如果可能的话，推荐下载最新版本的Forge。
1. 解压所下载的MDK到一个空文件夹中。它会成为你的模组的目录，且现在应该已包含一些gradle文件和一个含有example模组的`src`子目录。

    :::caution
        许多文件可以在不同的模组中重复使用。这些文件是：

        * `gradle`子目录
        * `build.gradle`
        * `gradlew`
        * `gradlew.bat`
        * `settings.gradle`

        `src`子目录不需要跨工作区进行复制；但是，如果稍后创建java（`src/main/java`）和resource（`src/main/resources`），则可能需要刷新Gradle项目。
    :::

1. 打开你选择的IDE：
    * Forge只明确支持在Eclipse和IntelliJ IDEA上进行开发，但还有其他针对Visual Studio代码的运行配置。无论如何，从Apache NetBeans到Vim/Emacs的任何开发环境都可被使用。
    * Eclipse和IntelliJ IDEA的Gradle集成，都是已默认安装和启用的，将在导入或打开时处理其余的初始工作区设置。这包括从Mojang、MinecraftForge等下载必要的软件包。如果你使用Visual Studio，则需要安装“Gradle for Java”插件。
    * Gradle将需要被调用来重新评估项目中对其相关文件的几乎所有更改（如`build.gradle`、`settings.gradle`等等）。有些IDE带有“刷新”按钮来完成此操作；然而，它也可以通过在终端上运行`gradlew`来完成。
1. 为你选择的IDE生成运行配置:
    * **Eclipse**: 运行`genEclipseRuns`任务。
    * **IntelliJ IDEA**: 运行`genIntellijRuns`任务。如果发生了"module not specified"错误，请将[`ideaModule`属性][config]设置为你的'main'模块（通常为`${project.name}.main`）。
    * **Visual Studio Code**: 运行`getVSCodeRuns`任务。
    * **Other IDEs**: 你可以通过`gradle run*`来直接运行这些配置（如`runClient`、`runServer`、`runData`、`runGameTestServer`）。这对于已提供支持的IDE同样有效。

自定义你的模组信息
-----------------

编辑`build.gradle`文件以自定义你的模组的构建方式（如文件名称、artifact版本等等）。

:::note
    除非你知道你在做什么，否则**不要**编辑`settings.gradle`。该文件指定[ForgeGradle]所上传的仓库。
:::

### 建议的`build.gradle`自定义项目

#### Mod Id替换

将包括[mods.toml和主mod文件][modfiles]在内的所有出现的examplemo替换为你的模组的mod id。这还包括通过设置`base.archivesName`（通常设置为你的mod id）来更改你构建的文件的名称。

```gradle
// 在某个build.gradle文件中
base.archivesName = 'mymod'
```

#### Group Id

`group`属性应该设置为你的顶级程序包，其应为你拥有的域名或你的电子邮件地址：

类型          | 值                | 顶级程序包
:---:         | :---:             | :---
域名          | example.com       | `com.example`
子域名        | example.github.io | `io.github.example`
电子邮箱地址  | example@gmail.com | `com.gmail.example`

```gradle
// 在某个build.gradle文件中
group = 'com.example'
```

java源文件（`src/main/java`）中的包现在也应该符合这种结构，更深层的包表示mod id：

```text
com
- example (在group属性中所指定的顶级程序包)
  - mymod (mod id)
    - MyMod.java (重命名后的ExampleMod.java)
```

#### 版本

将`version`属性设置为你的模组的当前版本。我们推荐采用[Maven版本号命名格式][mvnver]。

```gradle
// 在某个build.gradle文件中
version = '1.19.4-1.0.0.0'
```

### 额外配置

额外配置可在[ForgeGradle]文档中找到。

构建并测试你的模组
-----------------

1. 要构建你的模组，请运行`gradlew build`。这将在`build/libs`输出一个默认名为`[archivesBaseName]-[version].jar`的文件。这个文件可以被放在已安装了Forge的Minecraft的`mods`文件夹中，也可以被分发。
1. 要在测试环境中运行你的模组，你既可以使用已生成的运行配置，也可以运行功能类似的Gradle任务（例如`gradlew runClient`）。这将使用任何所指定的源码集从run文件夹中启动Minecraft。默认的MDK包括`main`源码集，因此任何在`src/main/java`中编写的源代码都会被应用。
1. 如果你想要运行dedicated服务端，无论是通过运行配置，还是通过`gradlew runServer`，服务端都会立刻宕机。你需要通过编辑run文件夹中的`eula.txt`文件同意Minecraft EULA。一旦同意后，服务器就会加载，之后就可以通过直连`localhost`进行访问了。

:::caution
    在服务端环境测试你的模组是必要的。这包括[只针对客户端的模组][client]，因为在加载到服务端后它们不应该做任何事。
:::

[jdk]: https://adoptium.net/temurin/releases?version=17 "Eclipse Temurin 17 Prebuilt Binaries"
[ForgeGradle]: https://docs.minecraftforge.net/en/fg-6.x

[files]: https://files.minecraftforge.net "Forge Files distribution site"
[config]: https://docs.minecraftforge.net/en/fg-6.x/configuration/runs/

[modfiles]: ./modfiles.md
[packaging]: ./structuring.md#packaging
[mvnver]: ./versioning.md
[client]: ../concepts/sides.md#writing-one-sided-mods
