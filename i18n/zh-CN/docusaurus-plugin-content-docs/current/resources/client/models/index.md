模型
====

[模型系统][models]是Minecraft赋予方块和物品形状的方式。通过模型系统，方块和物品被映射到它们的模型，这些模型定义了它们的外观。模型系统的主要目标之一是不仅允许纹理，还允许资源包更改方块/物品的整个形状。事实上，任何添加物品或方块的模组也包含用于其方块和物品的迷你资源包。

模型文件
-------

模型和纹理通过[`ResourceLocation`][resloc]链接，但使用`ModelResourceLocation`存储在`ModelManager`中。模型通过方块或物品的注册表名称在不同位置引用，具体取决于它们是引用[方块状态][statemodel]还是[物品模型][itemmodels]。方块将使其`ModelResourceLocation`代表其注册表名称及其当前[`BlockState`][state]的字符串化版本，而物品将使用其注册表名称后跟`inventory`。

:::caution
    JSON模型只支持长方体元素；没有办法表达三角楔或类似的东西。要有更复杂的模型，必须使用另一种格式。
:::

### 纹理

纹理和模型一样，包含在资源包中，并被称为`ResourceLocation`。在《我的世界》中，[UV坐标][UV] (0,0)表示**左上角**。UV*总是*从0到16。如果纹理较大或较小，则会缩放坐标以进行拟合。纹理也应该是正方形的，纹理的边长应该是2的幂，否则会破坏mipmapping（例如1x1、2x2、8x8、16x16和128x128是好的。不建议使用5x5和30x30，因为它们不是2的幂。5x10和4x8会完全断裂，因为它们不是正方形的。）。只有当纹理是[动画化的][animated]时，纹理才应该不是正方形。

[models]: https://minecraft.wiki/w/Tutorials/Models#File_path
[resloc]: ../../../concepts/resources.md#resourcelocation
[statemodel]: https://minecraft.wiki/w/Tutorials/Models#Block_states
[itemmodels]: https://minecraft.wiki/w/Tutorials/Models#Item_models
[state]: ../../../blocks/states.md
[uv]: https://en.wikipedia.org/wiki/UV_mapping
[animated]: https://minecraft.wiki/w/Resource_Pack?so=search#Animation
