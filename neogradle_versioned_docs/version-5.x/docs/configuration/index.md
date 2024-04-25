ForgeGradle配置
==========================

ForgeGradle具有许多配置，可以改变开发环境的设置。大多数配置使用`minecraft`代码块设置；然而，还有一些可以在`dependencies`代码块中指定，或者修改构建好的`jar`文件，例如`reobfJar`。

启用访问转换器
----------------------------

[访问转换器][at]可以扩大Minecraft类、方法和字段的可见性或修改`final`标志。要在开发环境中启用访问转换器，可以设置`accessTransformer`到相关的配置文件：

```gradle
minecraft {
    // ...

    // 添加一个相对于项目目录的访问转换器文件
    accessTransformer = project.file('src/main/resources/META-INF/accesstransformer.cfg')
}
```

:::警告
虽然开发环境中的访问转换器可以从用户指定的任何地方读取，在开发环境中，文件只能从`META-INF/accesstransformer.cfg`读取。
:::

可读的映射
-----------------------

Minecraft的源代码是混淆的。因此，所有的类、方法和字段都有机器生成的名称，没有包结构。与此同时，函数局部变量名称由于Local Variable Table的存储方式，被转化为雪人（☃）。使用混淆名创建模组是困难的，因为给它们做逆向工程是乏味的，可能在版本之间变化，并且可能导致在语言本身中是无效的，但在字节码中不是。

为了解决后两个问题，Forge通过[ForgeAutoRenamingTool][fart]将每个类、方法、字段和参数模糊地映射到一个唯一的标识符，即SRG名称。SRG映射在用户客户端运行游戏时用于开发。

为了便于开发，ForgeGradle允许用户选择一个映射集，在SRG映射的基础上应用，这里我们称之为可读的映射。ForgeGradle知道如何将模组jar转换为用于开发的SRG映射，通过`reobf*`任务。

可以通过在`minecraft`代码块中设置`mappings`字段来指定使用的映射集。`mappings`字段接受两个参数：`channel`，它是映射集的类型，以及`version`，它是要应用的映射集的版本。

目前，默认内置到ForgeGradle中有三个映射集：

* `official` - 使用由Mojang提供的映射集。这些映射没有参数名称，且只存在于1.14及更高版本。
* `stable` - 使用由MCP生成的映射集。这些通常是不完整的，从1.17版本开始就不再存在了。
* `snapshot` - 也是由MCP生成的映射集，类似于程序的每日版本。这些也通常是不完整的，从1.17版本开始就不再存在了。

:::注意
开发中使用的类名来自1.17之前的`stable`，从1.17开始来自`official`。
:::

```gradle
mappings {
    // 设置映射，使用Mojang为Minecraft 1.19.4版本提供的映射。
    mappings channel: 'official', version: '1.19.4'

    // ...
}
```

### Parchment

Parchment是由ParchmentMC维护的官方项目，在`official`映射集的基础上提供开放的、社区来源的参数名称和javadocs。你可以在[他们的网站][parchment]上了解如何设置和使用parchment映射集。

[at]: https://docs.minecraftforge.net/en/latest/advanced/accesstransformers/
[fart]: https://github.com/MinecraftForge/ForgeAutoRenamingTool
[parchment]: https://parchmentmc.org/docs/getting-started
