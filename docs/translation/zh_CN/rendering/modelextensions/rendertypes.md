渲染类型
=======

在JSON的顶层添加`render_type`条目会向加载器建议模型应该使用什么渲染类型。如果未指定，加载器将选择所使用的渲染类型，通常会回到`ItemBlockRenderTypes#getRenderLayers()`返回的渲染类型。

自定义模型加载器可能会完全忽略此字段。

!!! 注意
    自1.19以来，这比不推荐的通过`ItemBlockRenderTypes#setRenderLayer()`为方块设置适用渲染类型的方法更可取。

具有玻璃纹理的透明方块的模型示例

```js
{
  "render_type": "minecraft:cutout",
  "parent": "block/cube_all",
  "textures": {
    "all": "block/glass"
  }
}
```

原版值
------

Forge提供了以下具有相应区块和实体渲染类型的选项（`NamedRenderTypeManager#preRegisterVanillaRenderTypes()`）：

* `minecraft:solid`
    * 区块渲染类型：`RenderType#solid()`
    * 实体渲染类型：`ForgeRenderTypes#ITEM_LAYERED_SOLID`
    * 用于完全固体方块（即石头）
* `minecraft:cutout`
    * 区块渲染类型：`RenderType#cutout()`
    * 实体渲染类型：`ForgeRenderTypes#ITEM_LAYERED_CUTOUT`
    * 用于任何给定像素完全透明或完全不透明的方块（即玻璃方块）
* `minecraft:cutout_mipped`
    * 区块渲染类型：`RenderType#cutoutMipped()`
    * 实体渲染类型：`ForgeRenderTypes#ITEM_LAYERED_CUTOUT`
    * 方块和实体渲染类型不同，因为实体渲染类型上的mipmapping使物品看起来很奇怪
    * 用于任何给定像素是完全透明或完全不透明的方块，并且纹理应在较大距离上缩小（[mipmapping]）以避免视觉伪影（即树叶）
* `minecraft:cutout_mipped_all`
    * 区块渲染类型：`RenderType#cutoutMipped()`
    * 实体渲染类型：`ForgeRenderTypes#ITEM_LAYERED_CUTOUT_MIPPED`
    * 在类似于`minecraft:cutout_mipped`的情况下使用，此时物品表示也应应用mipmapping
* `minecraft:translucent`
    * 区块渲染类型：`RenderType#translucent()`
    * 实体渲染类型：`ForgeRenderTypes#ITEM_LAYERED_TRANSLUCENT`
    * 用于任何给定像素可能部分透明的方块（即彩色玻璃）
* `minecraft:tripwire`
    * 区块渲染类型：`RenderType#tripwire()`
    * 实体渲染类型：`ForgeRenderTypes#ITEM_LAYERED_TRANSLUCENT`
    * 区块和实体渲染类型不同，因为绊线渲染类型作为实体渲染类型不可行
    * 用于具有渲染到天气渲染目标（即绊线）的特殊要求的块

自定义值
--------

要在模型中指定的自定义命名渲染类型可以在`RegisterNamedRenderTypesEvent`中注册。此事件在模组事件总线上激发。

自定义命名渲染类型由两个或三个组件组成：

* 区块渲染类型-可以使用`RenderType.chunkBufferLayers()`返回的列表中的任何类型
* 具有`DefaultVertexFormat.NEW_ENTITY`顶点格式的渲染类型（“实体渲染类型”）
* 具有`DefaultVertexFormat.NEW_ENTITY`顶点格式的渲染类型，用于当*Fabulous!*图形模式被选择时（可选）

当使用此命名渲染类型的区块被渲染为块几何体的一部分时，将使用区块渲染类型。
当使用此命名渲染类型的物品在Fast和Fancy图形模式（物品栏、地面、物品框架等）中渲染时，将使用需求实体渲染类型。
选择*Fabulous!*图形模式时，可选实体渲染类型的使用方式与需求实体渲染类型相同。如果需求实体渲染类型在*Fabulous!*图形模式下不起作用（通常仅适用于半透明渲染类型），则需要使用此渲染类型。

```java
public static void onRegisterNamedRenderTypes(RegisterNamedRenderTypesEvent event)
{
  event.register("special_cutout", RenderType.cutout(), Sheets.cutoutBlockSheet());
  event.register("special_translucent", RenderType.translucent(), Sheets.translucentCullBlockSheet(), Sheets.translucentItemSheet());
}
```

然后，这些可以在JSON中寻址为`<your_mod_id>:special_cutout`和`<your_mod_id>:special_translucent`。

[mipmapping]: https://en.wikipedia.org/wiki/Mipmap