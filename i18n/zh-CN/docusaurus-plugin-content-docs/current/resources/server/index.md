数据包
======
在1.13中，Mojang在游戏基底中添加了[数据包][datapack]。它们允许通过`data`目录修改逻辑服务端的文件。这包括进度、战利品表（loot_tables）、结构、配方、标签等。Forge和你的模组也可以有数据包。因此，任何用户都可以修改该目录中定义的所有配方、战利品表和其他数据。

### 创建一个数据包
数据包存储在项目资源的`data`目录中。
你的模组可以有多个数据域，因为你可以添加或修改现有的数据包，比如原版的、Forge的或其他模组的。
然后，你可以按照[此处][createdatapack]的步骤创建任何数据包。

附加阅读：[资源位置][resourcelocation]

[datapack]: https://minecraft.fandom.com/wiki/Data_pack
[createdatapack]: https://minecraft.fandom.com/wiki/Tutorials/Creating_a_data_pack
[resourcelocation]: ../../concepts/resources.md#ResourceLocation
