资源
====

资源是游戏使用的额外数据，存储在数据文件中，而不是代码中。Minecraft有两个主要的资源系统：一个在逻辑客户端上，用于模型、纹理和本地化等视觉效果，称为`assets`（资源），另一个在用于游戏的逻辑服务端上，如配方和战利品表，称为`data`（数据）。[资源包（Resource pack）][respack]控制前者，而[数据包（Datapack）][datapack]控制后者。

在默认的模组开发工具包中，assets和data目录位于项目的`src/main/resources`目录下。

如果启用了多个资源包或数据包，它们会被合并。通常，堆栈顶部包中的文件会覆盖下面的文件；但是，对于某些文件，例如本地化文件和标签，数据实际上是按内容合并的。模组在其`resources`目录中定义资源和数据包，但它们被视为“模组资源”包的子集。不能禁用模组资源包，但它们可以被其他资源包覆盖。可以使用原版的`/datapack`命令禁用模组数据包。

所有资源都应该有遵循蛇形命名法（Snake Case）的路径和文件名（小写，使用“_”表示单词边界），这在1.11及更高版本中得到了强制执行。

`ResourceLocation`
------------------

Minecraft使用`ResourceLocation`识别资源。`ResourceLocation`包含两部分：命名空间和路径。它通常指向`assets/<namespace>/<ctx>/<path>`处的资源，其中`ctx`是特定于上下文的路径片段，取决于`ResourceLocation`的使用方式。当从字符串中写入/读取为`ResourceLocation`时，它被视为`<namespace>:<path>`。如果省略了`<namespace>:`，那么当字符串被读取为`ResourceLocation`时，命名空间将始终默认为`minecraft`。模组应该将其资源放入与其mod id同名的命名空间中（例如，id为`examplemod`的模组应该分别将其资源放置在`assets/examplemod`和`data/examplemod`中，指向这些文件的`ResourceLocation`看起来像`examplemod:<path>`。）。这不是要求，并且在某些情况下，可能希望使用不同的（或者甚至不止一个）命名空间。`ResourceLocation`也在资源系统之外使用，因为它们恰好是唯一标识对象（例如[注册表][]）的好方法。

[respack]: ../resources/client/index.md
[datapack]: ../resources/server/index.md
[registries]: ./registries.md
