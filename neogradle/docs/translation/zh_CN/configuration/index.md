ForgeGradle配置
===============

ForgeGradle有许多配置可以改变开发环境的配置方式。大多数配置都是使用`minecraft`块设置的；然而，其他一些可以在`dependencies`块中指定，或者修改构建的`jar`，例如`reobfJar`。

启用访问转换器
-------------

[访问转换器][at]可以扩大可见性或修改Minecraft类、方法和字段的`final`标志。要在生产环境中启用访问转换器，可以将`accessTransformer`设置为有问题的配置文件：

```gradle
minecraft {
    // ...

    // 添加相对于项目目录的访问转换器文件
    accessTransformer = project.file('src/main/resources/META-INF/accesstransformer.cfg')
}
```

!!! 重要
    虽然开发环境中的访问转换器可以从用户指定的任何位置读取，但在生产中，该文件只能从`META-INF/accesstransformer.cfg`读取。

人类可读的映射
-------------

Minecraft的源代码被混淆了。因此，所有类、方法和字段都具有机器生成的名称，而没有包结构。同时，由于本地变量表的存储方式，函数的局部变量名变成了雪人(`☃`)。使用模糊名称创建模组很困难，因为反向工程很乏味，可能会在不同版本之间更改，并且虽然可能在语言本身中无效，但在字节码中却不是无效的。

为了解决最后两个问题，Forge通过[ForgeAutoRenamingTool][fart]将每个类、方法、字段和参数模糊地映射到一个唯一的标识符，即SRG名称。当游戏由用户客户端运行时，SRG映射在生产中使用。

为了便于开发，ForgeGradle允许用户选择一个映射集来应用于SRG映射之上，我们将其称为人类可读的映射。ForgeGradle知道如何通过`reobf*`任务将模组jar转换为SRG映射，以便在生产中使用。

可以通过设置`minecraft`块中的`mappings`字段来指定所使用的映射集。`mappings`字段接受两个参数：`channel`是映射集的类型，`version`是要应用的映射集的版本。

目前，ForgeGradle中内置了三个默认映射集：

* `official` - 这使用Mojang提供的映射集。这些映射没有参数名称，仅从1.14开始存在。
* `stable` - 这使用MCP生成的映射集。这些通常是不完整的，并且自1.17起不再存在。
* `snapshot` - 这也是MCP生成的映射集，类似于程序的隔夜构建。这些通常也是不完整的，并且从1.17起不再存在。

!!! 注意
    生产中使用的类名从1.17之前的`stable`到1.17之后的`official`。

```gradle
mappings {
    // 将映射设置为在Minecraft 1.19.4中使用来自Mojang的映射。
    mappings channel: 'official', version: '1.19.4'

    // ...
}
```

### Parchment

Parchment是ParchmentMC维护的一个官方项目，它在`official`映射集之上提供开放的、社区源代码的参数名称和javadoc。你可以在[他们的网站][parchment]上学习如何设置和使用Parchment映射。

准备运行任务
-----------

运行任务（`run*`）有两个独立的管道，这取决于它们是通过`gradlew`还是运行配置执行的。默认情况下，有两个任务用于准备工作区以便执行：

首先，有在`run*`任务之前执行的`prepare*`任务，并确保为游戏准备映射文件。`prepare*Compile`任务通常仅作为`run*`任务的依赖项来执行，以确保游戏在运行之前已编译。

如果你的IDE是Eclipse或IntelliJ IDEA，则可以将运行配置配置为在启动游戏之前执行`prepare*`任务，方法是分别将`enableEclipsePrepareRuns`或`enableIdeaPrepareRuns`设置为`true`。这将允许你在IDE启动游戏之前调用自定义Gradle任务。

```gradle
minecraft {
    // ...

    // 为运行配置启用'prepare*'任务
    enableEclipsePrepareRuns true
    enableIdeaPrepareRuns true
}
```

### 复制IDE资源

`copyIdeResources`属性可用于将`processResources`任务配置的资源复制到IDE的资源输出目录。这允许不调用Gradle（IntelliJ配置为使用IDEA运行器或Eclipse）的IDE运行配置使用构建脚本可配置资源。通常，在替换`mods.toml`等文件中的值时，需要启用此属性。
这仅通过`copyEclipseResources`和`copyIntellijResources`任务分别适用于Eclipse和IntelliJ IDEA。

```gradle
minecraft {
    // ...

    // 将文件从'processResources'复制到IDE的资源输出目录
    copyIdeResources true
}
```

### 运行配置文件夹

如果`generateRunFolders`设置为`true`，则可以将运行配置排序到文件夹中。这将读取特定[运行配置][run]中设置的`folderName`属性，以确定组织性的结构。

```gradle
minecraft {
    // ...

    // 如果为true，运行配置将按其'folderName'分组到文件夹中
    generateRunFolders true
}
```

[at]: https://docs.minecraftforge.net/en/latest/advanced/accesstransformers/
[fart]: https://github.com/MinecraftForge/ForgeAutoRenamingTool
[parchment]: https://parchmentmc.org/docs/getting-started
