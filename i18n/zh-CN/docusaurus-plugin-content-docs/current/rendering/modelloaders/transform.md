变换
====

当[`BakedModel`][bakedmodel]被渲染为物品时，它可以根据在哪个变换中渲染它来应用特殊处理。“变换”是指在什么上下文中渲染模型。可能的转换在代码中由`ItemDisplayContext`枚举表示。有两种处理转换的系统：不推荐使用的原版系统，由`BakedModel#getTransforms`、`ItemTransforms`和`ItemTransform`构成；Forge系统，由方法`IForgeBakedModel#applyTransform`实现。原版代码被进行了修补，以便尽可能使用`applyTransform`而不是原版系统。

`ItemDisplayContext`
--------------------

`NONE` - 默认情况下，当未设置上下文时，用于显示实体；当`Block`的`RenderShape`设置为`#ENTITYBLOCK_ANIMATED`时，被Forge使用。

`THIRD_PERSON_LEFT_HAND`/`THIRD_PERSON_RIGHT_HAND`/`FIRST_PERSON_LEFT_HAND`/`FIRST_PERSON_RIGHT_HAND` - 第一人称值表示玩家何时将物品握在自己手中。第三人称值表示当另一个玩家拿着物品，而客户端用第三人称看着它们时。手的含义是不言自明的。

`HEAD` - 表示当任何玩家在头盔槽中佩戴该物品时（例如南瓜）。

`GUI` - 表示当该物品被在一个`Screen`中渲染时。

`GROUND` - 表示该物品在存档中作为一个`ItemEntity`被渲染时。

`FIXED` - 用于物品展示框。

原版的方式
---------

原版处理转换的方式是通过`BakedModel#getTransforms`。此方法返回一个`ItemTransforms`，这是一个简单的对象，包含各种作为`public final`的`ItemTransform`字段。`ItemTransform`表示要应用于模型的旋转、平移和比例。`ItemTransforms`是这些的容器，除了`NONE`之外，每个`ItemDisplayContext`都有一个容器。在原版实现中，为`NONE`调用`#getTransform`会产生默认转换`ItemTransform#NO_TRANSFORM`。

Forge废弃了使用处理转换的整个原版系统，`BakedModel`的大多数实现应该简单地从`BakedModel#getTransforms`中`return ItemTransforms#NO_TRANSFORMS`（这是默认实现）。相反，他们应该实现`#applyTransform`。

Forge的方式
-----------

Forge处理转换的方法是`#applyTransform`，这是一种修补到`BakedModel`中的方法。它取代了`#getTransforms`方法。

#### `BakedModel#applyTransform`

给定一个`ItemDisplayContext`、`PoseStack`和一个布尔值来确定是否对左手应用变换，此方法将生成一个要渲染的`BakedModel`。因为返回的`BakedModel`可以是一个全新的模型，所以这种方法比原版方法（例如，一张手里看起来很平但在地上皱巴巴的纸）更灵活。

[bakedmodel]: ./bakedmodel.md
