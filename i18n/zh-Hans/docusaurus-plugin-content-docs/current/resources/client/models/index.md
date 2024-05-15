模型是JSON文件，确定方块或物品的视觉形状和纹理。模型由立方体元素组成，每个元素都有自己的大小，然后每个面都被分配一个纹理。

每个物品通过其注册名称被分配一个物品模型。例如，注册名称为 `examplemod:example_item` 的物品将被分配到 `assets/examplemod/models/item/example_item.json` 中的模型。对于方块来说，情况稍微复杂一些，因为它们首先被分配一个方块状态文件。更多信息请参见[下文][bsfile]。

## 规范

_另请参阅：[Minecraft Wiki][mcwiki]上的[模型][mcwikimodel]_

模型是一个具有以下可选属性的JSON文件：

- `loader`：NeoForge添加的。设置自定义模型加载器。有关更多信息，请参阅[自定义模型加载器][custommodelloader]。
- `parent`：设置父模型，格式为相对于 `models` 文件夹的[资源位置][rl]。所有父属性将首先应用，然后被声明模型中设置的属性覆盖。常见的父模型包括：
  - `minecraft:block/block`：所有方块模型的通用父模型。
  - `minecraft:block/cube`：所有使用1x1x1立方体模型的模型的父模型。
  - `minecraft:block/cube_all`：使用相同纹理在所有六个面上的立方体模型变种，例如圆石或木板。
  - `minecraft:block/cube_bottom_top`：使用相同纹理在所有四个水平面上，并在顶部和底部使用单独的纹理的立方体模型变种。常见示例包括砂岩或镶嵌石英。
  - `minecraft:block/cube_column`：具有侧面纹理和底部和顶部纹理的立方体模型变种。示例包括木头原木，以及石英和紫珀柱。
  - `minecraft:block/cross`：使用两个具有相同纹理的平面，一个顺时针旋转45°，另一个逆时针旋转45°，从上方看形成X形（因此得名）。示例包括大多数植物，例如草、树苗和花朵。
  - `minecraft:item/generated`：经典的2D平面物品模型的父模型。大多数物品都使用此模型。由于其四边形是从纹理生成的，因此会忽略 `elements` 块。
  - `minecraft:item/handheld`：用于看起来实际由玩家持有的2D平面物品模型的父模型。主要由工具使用。作为 `item/generated` 的子模型，因此它也会忽略 `elements` 块。
  - `minecraft:builtin/entity`：指定除 `particle` 外没有其他纹理。如果这是父模型，则[`BakedModel#isCustomRenderer()`][iscustomrenderer]将返回 `true`，以允许使用 [`BlockEntityWithoutLevelRenderer`][bewlr]。
  - 方块物品通常（但不总是）使用其对应的方块模型作为父模型。例如，圆石物品模型使用父模型 `minecraft:block/cobblestone`。
- `ambientocclusion`：是否启用[环境光遮蔽][ao]。仅在方块模型上有效。默认为 `true`。如果您的自定义方块模型具有奇怪的阴影，请尝试将其设置为 `false`。
- `render_type`：参见[渲染类型][rendertype]。
- `gui_light`：可以是 `"front"` 或 `"side"`。如果是 `"front"`，光将来自前方，对于平面2D模型很有用。如果是 `"side"`，光将来自侧面，对于3D模型（尤其是方块模型）很有用。默认为 `"side"`。仅在物品模型上有效。
- `textures`：一个子对象，将名称（称为纹理变量）映射到[纹理位置][textures]。然后可以在[elements]中使用纹理变量。它们也可以在元素中指定，但在子模型中保留未指定。
  - 方块模型还应指定一个 `particle` 纹理。当坠落在、穿越或破坏方块时，将使用此纹理。
  - 物品模型还可以使用层纹理，命名为 `layer0`、`layer1` 等，其中具有较高索引的层会呈现在具有较低索引的层上方（例如 `layer1` 将呈现在 `layer0` 上方）。仅在父模型为 `item/generated` 时有效，最多支持5层（`layer0` 到 `layer4`）。
- `elements`：立方体[元素]的列表。
- `overrides`：[覆盖模型][overrides]的列表。仅在物品模型上有效。
- `display`：包含不同[视角]的不同显示选项的子对象，请参见链接的文章以获取可能的键。仅在物品模型上有效，但通常在方块模型中指定，以便物品模型可以继承显示选项。每个视角都是一个可选的子对象，可能包含以下选项，按顺序应用：
  - `translation`：模型的平移，指定为 `[x, y, z]`。
  - `rotation`：模型的旋转，指定为 `[x, y, z]`。
  - `scale`：模型的

缩放，指定为 `[x, y, z]`。
  - `right_rotation`：NeoForge添加的。在缩放后应用的第二个旋转，指定为 `[x, y, z]`。
- `transform`：参见[根变换][roottransforms]。

:::tip
如果您在确定如何精确指定某些内容方面遇到困难，请查看执行类似操作的原版模型。
:::

### 渲染类型

使用可选的 NeoForge 添加的 `render_type` 字段，您可以为模型设置渲染类型。如果未设置（如所有原版模型），游戏将退回到 `ItemBlockRenderTypes` 中硬编码的渲染类型。如果 `ItemBlockRenderTypes` 中也不存在该方块的渲染类型，它将退回到 `minecraft:solid`。原版提供以下默认渲染类型：

- `minecraft:solid`：用于完全实心的方块，例如石头。
- `minecraft:cutout`：用于任何像素完全实心或完全透明的方块，即具有完全不透明或完全透明的像素，例如玻璃。
- `minecraft:cutout_mipped`：`minecraft:cutout` 的变体，将在较大距离上缩小纹理以避免视觉伪影（[mipmapping]）。由于通常不希望物品上使用mipmapping并且可能会导致伪影，因此不会对物品渲染应用mipmapping。例如，用于树叶。
- `minecraft:cutout_mipped_all`：`minecraft:cutout_mipped` 的变体，将mipmapping应用于物品模型。
- `minecraft:translucent`：用于任何像素可能部分透明的方块，例如有色玻璃。
- `minecraft:tripwire`：用于具有被渲染到天气目标的特殊要求的方块，即绊线。

选择正确的渲染类型在某种程度上是一个性能问题。实心渲染比切割渲染快，切割渲染比半透明渲染快。因此，您应该为您的用例指定最严格的适用渲染类型，因为它也将是最快的。

如果愿意，您也可以添加自己的渲染类型。要这样做，请订阅 [mod 总线][modbus] [事件] `RegisterNamedRenderTypesEvent` 并 `#register` 您的渲染类型。`#register` 具有三个或四个参数：

- 渲染类型的名称。将以您的mod id作为前缀。例如，在此处使用 `"my_cutout"` 将为您提供 `examplemod:my_cutout` 作为新的可供您使用的渲染类型（前提是您的mod id为 `examplemod`）。
- 分块渲染类型。可以使用 `RenderType.chunkBufferLayers()` 返回的列表中的任何类型。
- 实体渲染类型。必须是具有 `DefaultVertexFormat.NEW_ENTITY` 顶点格式的渲染类型。
- 可选项：神奇的渲染类型。必须是具有 `DefaultVertexFormat.NEW_ENTITY` 顶点格式的渲染类型。如果将图形模式设置为 _Fabulous!_，则将使用此渲染类型而不是常规实体渲染类型。如果省略，将回退到常规渲染类型。通常建议在渲染类型在某种程度上使用透明度时设置。

### 元素

元素是立方体对象的JSON表示。它具有以下属性：

- `from`：立方体起始角的坐标，指定为 `[x, y, z]`。以1/16方块单位指定。例如，`[0, 0, 0]` 将是“左下”角，`[8, 8, 8]` 将是中心，`[16, 16, 16]` 将是“右上”角。
- `to`：立方体结束角的坐标，指定为 `[x, y, z]`。与 `from` 一样，这是以1/16方块单位指定的。

:::tip
Minecraft中的值在范围 `[-16, 32]` 内。但是，强烈不建议超过 `[0, 16]`，因为这将导致光照和/或剔除问题。
:::

- `neoforge_data`：请参见[额外的面数据][extrafacedata]。
- `faces`：包含最多6个面的数据的对象，分别命名为 `north`、`south`、`east`、`west`、`up` 和 `down`。每个面都具有以下数据：
  - `uv`：面的uv，指定为 `[u1, v1, u2, v2]`，其中 `u1, v1` 是左上角uv坐标，`u2, v2` 是右下角uv坐标。
  - `texture`：面使用的纹理。必须是以 `#` 为前缀的纹理变量。例如，如果您的模型有一个名为 `wood` 的纹理，则可以使用 `#wood` 引用该纹理。在技术上是可选的，如果缺少将使用缺失的纹理。
  - `rotation`：可选。以顺时针90、180或270度旋转纹理。
  - `cullface`：可选。告诉渲染引擎在指定方向上有一个完整方块触碰时跳过渲染面。方向可以是 `north`、`south`、`east`、`west`、`up` 或 `down`。
  - `tint

index`：可选。指定颜色处理程序可能使用的染色索引，有关更多信息，请参见[着色][tinting]。默认为-1，表示不染色。
  - `neoforge_data`：请参见[额外的面数据][extrafacedata]。

此外，它还可以指定以下可选属性：

- `shade`：仅适用于方块模型。可选。此元素的面是否应该有方向相关的阴影。默认为 true。
- `rotation`：对象的旋转，指定为包含以下数据的子对象：
  - `angle`：旋转角度，以度为单位。可以是 -45 到 45，步长为22.5度。
  - `axis`：围绕旋转的轴。目前无法围绕多个轴旋转对象。
  - `origin`：可选。旋转的原点，指定为 `[x, y, z]`。请注意，这些是绝对值，即它们不是相对于立方体位置的。如果未指定，将使用 `[0, 0, 0]`。

#### 额外的面数据

额外的面数据（`neoforge_data`）可以应用于元素和元素的单个面。在所有可用的上下文中，它都是可选的。如果同时指定了元素级和面级额外面数据，则面级数据将覆盖元素级数据。额外的数据可以指定以下数据：

- `color`：使用给定颜色对面进行染色。必须是ARGB值。可以指定为字符串或十进制整数（JSON不支持十六进制文字）。默认为 `0xFFFFFFFF`。如果颜色值是恒定的，可以用作对染色的替代。
- `block_light`：覆盖用于此面的块光照值。默认为0。
- `sky_light`：覆盖用于此面的天空光照值。默认为0。
- `ambient_occlusion`：为此面禁用或启用环境光遮蔽。默认为模型中设置的值。

使用自定义的 `neoforge:item_layers` 加载器，还可以指定要应用于 `item/generated` 模型中所有几何图形的额外面数据。在以下示例中，第1层将以红色染色并以完全亮度发光：

```json5
{
  "loader": "neoforge:item_layers",
  "parent": "minecraft:item/generated",
  "textures": {
    "layer0": "minecraft:item/stick",
    "layer1": "minecraft:item/glowstone_dust"
  },
  "neoforge_data": {
    "1": {
      "color": "0xFFFF0000",
      "block_light": 15,
      "sky_light": 15,
      "ambient_occlusion": false
    }
  }
}
```

### 覆盖模型

物品覆盖可以根据浮点值（称为覆盖值）为物品分配不同的模型。例如，弓和十字弓使用此功能根据它们已经拉开的时间来更改纹理。覆盖模型有模型和代码两个方面。

模型可以指定一个或多个覆盖模型，当覆盖值等于或大于给定的阈值时应使用。例如，弓使用两个不同的属性 `pulling` 和 `pull`。 `pulling` 被视为布尔值，其中1被解释为正在拉动，0被解释为未拉动，而 `pull` 表示弓当前拉伸的程度。然后，它使用这些属性来指定在充能至低于65%时（`pulling` 1，没有 `pull` 值），65%时（`pulling` 1，`pull` 0.65）和90%时（`pulling` 1，`pull` 0.9）使用三种不同的替代模型。如果多个模型适用（因为值不断变大），则匹配列表的最后一个元素，因此请确保您的顺序是正确的。覆盖模型如下所示：
```json5
{
  // other stuff here
  "overrides": [
    {
      // pulling = 1
      "predicate": {
        "pulling": 1
      },
      "model": "item/bow_pulling_0"
    },
    {
      // pulling = 1, pull >= 0.65
      "predicate": {
        "pulling": 1,
        "pull": 0.65
      },
      "model": "item/bow_pulling_1"
    },
    // pulling = 1, pull >= 0.9
    {
      "predicate": {
        "pulling": 1,
        "pull": 0.9
      },
      "model": "item/bow_pulling_2"
    }
  ]
}
```

事情的代码方面相当简单。假设我们想要向我们的物品添加一个名为 `examplemod:property` 的属性，我们会在[客户端][side]的[event handler][eventhandler]中使用以下代码：

```java
@SubscribeEvent
public static void onClientSetup(FMLClientSetupEvent event) {
    event.enqueueWork(() -> { // ItemProperties#register is not threadsafe, so we need to call it on the main thread
        ItemProperties.register(
                // The item to apply the property to.
                ExampleItems.EXAMPLE_ITEM,
                // The id of the property.
                new ResourceLocation("examplemod", "property"),
                // A reference to a method that calculates the override value.
                // Parameters are the used item stack, the level context, the player using the item,
                // and a random seed you can use.
                (stack, level, player, seed) -> someMethodThatReturnsAFloat()
        );
    });
}
```

:::info
原版 Minecraft 仅允许 0 到 1 之间的浮点值。NeoForge 对此进行了补充，以允许任意的浮点值。
:::

### 根变换

在模型的顶层添加 `transform` 属性会告诉加载器在应用 [blockstate 文件][bsfile]（用于方块模型）中的旋转或 `display` 块中的变换（用于物品模型）之前，应该对所有几何图形应用一个变换。这是由 NeoForge 添加的。

根变换可以通过两种方式指定。第一种方式是作为一个名为 `matrix` 的单个属性，其中包含一个 3x4 的变换矩阵（行主序，最后一行被省略），以嵌套的 JSON 数组形式表示。矩阵是按照平移、左旋转、缩放、右旋转和变换原点的顺序组合而成。示例如下：

```json5
{
  // ...
  "transform": {
    "matrix": [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ]
  }
}
```

根据Minecraft译名标准化，以下是翻译后的文档：

第二种方式是指定一个包含以下条目的JSON对象，按以下顺序应用：

- `translation`：相对位移。指定为一个三维向量（`[x, y, z]`），如果缺失默认为`[0, 0, 0]`。
- `rotation` 或 `left_rotation`：在缩放之前应用于平移原点的旋转。默认不旋转。可以用以下方式指定：
  - 一个带有单一轴到旋转映射的JSON对象，例如 `{"x": 90}`
  - 一个包含单一轴到旋转映射的JSON对象的数组，按照指定的顺序应用，例如 `[{"x": 90}, {"y": 45}, {"x": -22.5}]`
  - 一个包含三个值的数组，每个值分别指定每个轴的旋转，例如 `[90, 45, -22.5]`
  - 一个包含四个值的数组，直接指定一个四元数，例如 `[0.38268346, 0, 0, 0.9238795]`（= X轴45度旋转）
- `scale`：相对于平移原点的缩放。指定为一个三维向量（`[x, y, z]`），如果缺失默认为`[1, 1, 1]`。
- `post_rotation` 或 `right_rotation`：在缩放之后应用于平移原点的旋转。默认不旋转。指定方式与`rotation`相同。
- `origin`：用于旋转和缩放的原点。转换也作为最后一步移到这里。指定为一个三维向量（`[x, y, z]`）或使用三个内置值之一 `"corner"`（=`[0, 0, 0]`），`"center"`（=`[0.5, 0.5, 0.5]`）或 `"opposing-corner"`（=`[1, 1, 1]`，默认值）。

## 方块状态文件

参见：[Minecraft Wiki][mcwiki]上的[方块状态文件][mcwikiblockstate]

方块状态文件由游戏用于为不同的[方块状态]分配不同的模型。每个注册到游戏的方块必须有一个确切的方块状态文件。指定方块模型到方块状态有两种相互排斥的方式：通过变体或者多部件。

在`variants`块内，每个方块状态都有一个元素。这是将方块状态与模型相关联的主要方式，被绝大多数方块使用。
- 键是没有方块名的方块状态的字符串表示，例如对于非含水的台阶是`"type=top,waterlogged=false"`，或者对于没有属性的方块是`""`。值得注意的是，未使用的属性可以省略。例如，如果`waterlogged`属性对所选模型无影响，则两个对象`type=top,waterlogged=false`和`type=top,waterlogged=true`可以被合并为一个`type=top`对象。这也意味着对于每个方块，空字符串都是有效的。
- 值要么是单一的模型对象，要么是模型对象的数组。如果使用了模型对象的数组，将从中随机选择一个模型。一个模型对象包含以下数据：
  - `model`：模型文件位置的路径，相对于命名空间的`models`文件夹，例如`minecraft:block/cobblestone`。
  - `x`和`y`：模型在x轴/y轴的旋转。限制为90度的步进。每个都是可选的，默认为0。
  - `uvlock`：旋转模型时是否锁定UV。可选的，默认为false。
  - `weight`：仅在模型对象数组中有用。给对象一个权重，用于选择随机模型对象。可选的，默认为1。

相反，在`multipart`块内，元素根据方块状态的属性组合。这种方法主要被栅栏和围墙使用，它们根据布尔属性启用四个方向的部分。一个多部分元素由两个部分组成：`when`块和`apply`块。

- `when`块指定了一个方块状态的字符串表示，或者一个必须满足元素应用的属性列表。这些列表可以被命名为`"OR"`或`"AND"`，对其内容执行相应的逻辑操作。单个方块状态和列表值都可以通过用`|`分隔它们来指定多个实际值（例如 `facing=east|facing=west`）。
- `apply`块指定了要使用的模型对象或模型对象数组。这与`variants`块的工作方式完全相同。

## 着色

有些方块，如草或树叶，会根据它们的位置和/或属性改变它们的纹理。[模型元素][elements]可以在它们的面上指定一个染色指数，这将允许颜色处理器处理相应的面。代码方面通过两个事件来处理，一个是方块颜色处理器，另一个是物品颜色处理器。它们的工作方式非常相似，让我们先看一下方块处理器：

```java
@SubscribeEvent
public static void registerBlockColorHandlers(RegisterColorHandlersEvent.Block event) {
    // Parameters are the block's state, the level the block is in, the block's position, and the tint index.
    // The level and position may be null.
    event.register((state, level, pos, tintIndex) -> {
            // Replace with your own calculation. See the BlockColors class for vanilla references.
            // All vanilla uses assume alpha 255 (= 1f), but modded consumers may also account
            // for alpha values specified here. Generally, if the tint index is -1,
            // it means that no tinting should take place and a default value should be used instead.
            return 0xFFFFFF;
    });
}
```

物品处理器的工作方式几乎相同，只是命名和lambda参数有所不同：

```java
@SubscribeEvent
public static void registerItemColorHandlers(RegisterColorHandlersEvent.Item event) {
    // Parameters are the item stack and the tint index.
    event.register((stack, tintIndex) -> {
            // Like above, replace with your own calculation. Vanilla values are in the ItemColors class.
            // Also like above, tint index -1 means no tint and should use a default value instead.
            return 0xFFFFFF;
    });
}
```

请注意，`item/generated`模型为其各个层指定了染色指数 - `layer0`有染色指数0，`layer1`有染色指数1，等等。另外，记住方块物品是物品，而不是方块，需要物品颜色处理器来着色。

## 注册额外的模型

一些并未与某个方块或物品有所关联，但在其他上下文（例如[方块实体渲染器][ber]）中仍然需要的模型，可以通过`ModelEvent.RegisterAdditional`来注册：

```java
// Client-side mod bus event handler
@SubscribeEvent
public static void registerAdditional(ModelEvent.RegisterAdditional event) {
    event.register(new ResourceLocation("examplemod", "block/example_unused_model"));
}
```

[ao]: https://en.wikipedia.org/wiki/Ambient_occlusion
[ber]: ../../../blockentities/ber.md
[bewlr]: ../../../items/bewlr.md
[bsfile]: #blockstate-files
[custommodelloader]: modelloaders.md
[elements]: #elements
[event]: ../../../concepts/events.md
[eventhandler]: ../../../concepts/events.md#registering-an-event-handler
[extrafacedata]: #extra-face-data
[iscustomrenderer]: bakedmodel.md#others
[mcwiki]: https://minecraft.wiki
[mcwikiblockstate]: https://minecraft.wiki/w/Tutorials/Models#Block_states
[mcwikimodel]: https://minecraft.wiki/w/Model
[mipmapping]: https://en.wikipedia.org/wiki/Mipmap
[modbus]: ../../../concepts/events.md#event-buses
[overrides]: #overrides
[perspectives]: bakedmodel.md#perspectives
[rendertype]: #render-types
[roottransforms]: #root-transforms
[rl]: ../../../misc/resourcelocation.md
[side]: ../../../concepts/sides.md
[textures]: ../textures.md
[tinting]: #tinting
