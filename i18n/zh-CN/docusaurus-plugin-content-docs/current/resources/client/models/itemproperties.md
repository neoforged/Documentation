物品属性
========

物品属性是将物品的“属性”公开给模型系统的一种方式。一个例子是弓，其中最重要的特性是弓被拉了多远。然后，这些信息用于选择弓的模型，创建拉动弓的动画。

物品属性为其注册的每个`ItemStack`分配一个特定的`float`值，原版物品模型定义可以使用这些值来定义“覆盖”，其中物品默认为某个模型，但如果覆盖匹配，则覆盖该模型并使用另一个模型。它们之所以有用，主要是因为它们是连续的。例如，弓使用物品属性来定义其拉动动画。物品模型由'float'数字谓词决定，它不受限制，但通常在`0.0F`和`1.0F`之间。这允许资源包为拉弓动画添加他们想要的任意多个模型，而不是在动画中为他们的模型设置四个“槽”。指南针和时钟也是如此。

向物品添加属性
-------------

`ItemProperties#register`用于向某个物品添加属性。`Item`参数是要附加属性的物品（例如`ExampleItems#APPLE`）。`ResourceLocation`参数是所要赋予属性的名称（例如`new ResourceLocation("pull")`）。`ItemPropertyFunction`是一个函数接口，它接受`ItemStack`、它所在的`ClientLevel`（可以为null）、持有它的`LivingEntity`（可以是null）和包含持有实体的id的`int`（可能是`0`），返回属性的`float`值。对于修改后的物品属性，建议将模组的mod id用作命名空间（例如`examplemod:property`，而不仅仅是`property`，因为这实际上意味着`minecraft:property`）。这些操作应在`FMLClientSetupEvent`中完成。
还有另一个方法`ItemProperties#registerGeneric`用于向所有物品添加属性，并且它不将`Item`作为其参数，因为所有物品都将应用此属性。

:::note
    使用`FMLClientSetupEvent#enqueueWork`执行这些任务，因为`ItemProperties`中的数据结构不是线程安全的。
:::

:::caution
    Mojang反对使用`ItemPropertyFunction`而推荐使用`ClampedItemPropertyFunction`子接口，该子接口将结果夹在`0`和`1`之间。
:::

覆盖的使用
---------

覆盖的格式可以在[wiki][format]上看到，一个很好的例子可以在`model/item/bow.json`中找到。为了参考，这里是一个具有`examplemod:power`属性的物品的假设例子。如果值不匹配，则默认为当前模型，但如果有多个匹配，则会选择列表中的最后一个匹配。

:::note
    predicate适用于*大于或等于*给定值的所有值。
:::

```js
{
  "parent": "item/generated",
  "textures": {
    // Default
    "layer0": "examplemod:items/example_partial"
  },
  "overrides": [
    {
      // power >= .75
      "predicate": {
        "examplemod:power": 0.75
      },
      "model": "examplemod:item/example_powered"
    }
  ]
}
```

下面是支持代码中的一个假设片段。与旧版本（低于1.16.x）不同，这只需要在客户端完成，因为服务端上不存在`ItemProperties`。

```java
private void setup(final FMLClientSetupEvent event)
{
  event.enqueueWork(() ->
  {
    ItemProperties.register(ExampleItems.APPLE, 
      new ResourceLocation(ExampleMod.MODID, "pulling"), (stack, level, living, id) -> {
        return living != null && living.isUsingItem() && living.getUseItem() == stack ? 1.0F : 0.0F;
      });
  });
}
```

[format]: https://minecraft.wiki/w/Tutorials/Models#Item_models
