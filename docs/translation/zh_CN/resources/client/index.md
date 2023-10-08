资源包
======

[资源包][respack]允许通过`assets`目录自定义客户端资源。这包括纹理、模型、声音、本地化和其他。你的模组（以及Forge本身）也可以有资源包。因此，任何用户都可以修改该目录中定义的所有纹理、模型和其他资源。

### 创建一个资源包
资源包存储在项目的资源中。`assets`目录包含该包的内容，而该包本身则由`assets`文件夹旁边的`pack.mcmeta`定义。
你的模组可以有多个资源域，因为你可以添加或修改现有的资源包，比如原版的、Forge的或其他模组的。
然后，你可以按照[在Minecraft Wiki][createrespack]中找到的步骤创建任何资源包。

附加阅读：[资源位置][resourcelocation]

[respack]: https://minecraft.fandom.com/wiki/Resource_Pack
[createrespack]: https://minecraft.fandom.com/wiki/Tutorials/Creating_a_resource_pack
[resourcelocation]: ../../concepts/resources.md#ResourceLocation
