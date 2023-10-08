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

[at]: https://docs.minecraftforge.net/en/latest/advanced/accesstransformers/
[fart]: https://github.com/MinecraftForge/ForgeAutoRenamingTool
[parchment]: https://parchmentmc.org/docs/getting-started
