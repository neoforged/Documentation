烘焙模型（`BakedModel`）
=======================

`BakedModel`是对普通模型加载器调用`UnbakedModel#bake`或对自定义模型加载器调用`IUnbakedGeometry#bake`的结果。与`UnbakedModel`或`IUnbakedGeometry`不同，`BakedModel`纯粹代表一种没有任何物品或方块概念的形状，而不是抽象的。它表示已经优化并简化为可以（几乎）进入GPU的几何体。它还可以处理物品或方块的状态以更改模型。

在大多数情况下，实际上没有必要手动实现此接口。相反，可以使用现有的实现之一。

### `getOverrides`

返回要用于此模型的[`ItemOverrides`][overrides]。仅当此模型被渲染为物品时才使用此选项。

### `useAmbientOcclusion`

如果模型在存档中渲染为方块，则有问题的方块不会发出任何光，并且环境光遮挡处于启用状态。这将导致使用[环境光遮挡](ambocc)来渲染模型。

### `isGui3d`

如果模型被渲染为物品栏中的物品，在地面上被渲染为实体，在物品框架上，等等，这会使模型看起来“扁平”。在GUI中，这也会禁用照明。

### `isCustomRenderer`

!!! 重要
    除非你知道自己在做什么，否则只需`return false`然后继续其他事项。

将其渲染为物品时，返回`true`将导致模型不被渲染，转而回到`BlockEntityWithoutLevelRenderer#renderByItem`。对于某些原版物品，如箱子和旗帜，此方法被硬编码为将数据从物品复制到`BlockEntity`中，然后使用`BlockEntityRenderer`来渲染BE以代替物品。对于所有其他物品，它将使用由`IClientItemExtensions#getCustomRenderer`提供的`BlockEntityWithoutLevelRenderer`实例。有关详细信息，请参阅[BlockEntityWithoutLevelRenderer][bewlr]页。

### `getParticleIcon`

粒子应使用的任何纹理。对于方块，它将在实体掉落在其上或其被破坏时显示。对于物品，它将在报废或被吃掉时显示。

!!! 重要
    由于模型数据可能会对特定模型的渲染方式产生影响，因此不推荐使用不带参数的原版方法，而推荐使用`#getParticleIcon(ModelData)`。

### <s>`getTransforms`</s>

此方法被废弃，推荐实现`#applyTransform`。如果实现了`#applyTransform`，则该默认实现是足够的。参见[变换][transform]。

### `applyTransform`

参见[变换][transform]。

### `getQuads`

这是`BakedModel`的主要方法。它返回一个`BakedQuad`的列表：包含将用于渲染模型的低级顶点数据的对象。如果模型被呈现为方块，那么传入的`BlockState`是非空的。如果模型被呈现为物品，则从`#getOverrides`返回的`ItemOverrides`负责处理物品的状态，并且`BlockState`参数将为`null`。

传入的`Direction`用于面剔除。如果正在渲染的另一个方块的给定边上的块是不透明的，则不会渲染与该边关联的面。如果该参数为`null`，则返回与边不关联的所有面（其永远不会被剔除）。

`rand`参数是Random的一个实例。

它还接受一个非null的`ModelData`实例。这可用于在通过`ModelProperty`渲染特定模型时定义额外数据。例如，一个这样的属性是`CompositeModel$Data`，用于使用`forge:composite`模型加载器存储模型的任何附加子模型数据。

请注意，此方法经常被调用：对于*一个存档中的每个方块*，非剔除面和支持的方块渲染层的每个组合（任何位置从0到28次）调用一次。这给方法应该尽可能快，并且可能需要大量缓存。

[overrides]: ./itemoverrides.md
[ambocc]: https://en.wikipedia.org/wiki/Ambient_occlusion
[bewlr]: ../../items/bewlr.md
[transform]: ./transform.md
