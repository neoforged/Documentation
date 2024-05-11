非数据包配方
====================

并非所有配方都足够简单或已迁移到使用数据驱动的配方。一些子系统仍需要在代码库中进行修补，以支持添加新的配方。

酿造配方
---------------

酿造是仍然存在于代码中的少数配方之一。酿造配方作为`PotionBrewing`内的引导程序的一部分添加，用于其容器、容器配方和药水混合。为了扩展现有系统，Forge允许通过在`FMLCommonSetupEvent`中调用`BrewingRecipeRegistry#addRecipe`来添加酿造配方。

:::caution
`BrewingRecipeRegistry#addRecipe`必须在同步工作队列中通过`#enqueueWork`调用，因为该方法不是线程安全的。
:::

默认实现接受一个输入成分，一个催化剂成分，和一个堆叠输出以进行标准实现。此外，也可以提供一个`IBrewingRecipe`实例来执行转换。

### IBrewingRecipe

`IBrewingRecipe`是一种伪[`Recipe`][recipe]接口，它检查输入和催化剂是否有效，并在满足条件时提供相关的输出。这通过`#isInput`、`#isIngredient`和`#getOutput`实现。输出方法可以访问输入和催化剂堆叠以构造结果。

:::caution
在`ItemStack`或`CompoundTag`之间复制数据时，确保使用它们各自的`#copy`方法创建唯一的实例。
:::

没有类似于原版的添加额外药水容器或药水混合的包装器。需要添加一个新的`IBrewingRecipe`实现来复制这种行为。

铁砧配方
-------------

铁砧负责接受一个受损的输入，给出一些材料或类似的输入，减少输入结果上的一些损伤。因此，其系统不容易被数据驱动。然而，因为铁砧配方是一个输入物品加上一些数量的材料等于一些输出物品，当用户有足够的经验等级时，它可以通过`AnvilUpdateEvent`修改为创建一个伪配方系统。这取决于输入和材料，并允许开发者指定输出、经验等级成本，以及用于输出的材料数量。事件还可以通过[取消][cancel]来阻止任何输出。

```java
// Checks whether the left and right items are correct
// When true, sets the output, level experience cost, and material amount
public void updateAnvil(AnvilUpdateEvent event) {
  if (event.getLeft().is(...) && event.getRight().is(...)) {
    event.setOutput(...);
    event.setCost(...);
    event.setMaterialCost(...);
  }
}
```

更新事件必须[附加]到Forge事件总线上。

织布机配方
------------

织布机负责将染料和图案（来自织布机或来自物品）应用于旗帜。虽然旗帜和染料必须分别是`BannerItem`或`DyeItem`，但可以在织布机中创建和应用自定义图案。可以通过[注册]一个`BannerPattern`来创建旗帜图案。

:::caution
在`minecraft:no_item_required`标签中的`BannerPattern`会作为一个选项出现在织布机中。不在此标签中的图案必须有一个相应的`BannerPatternItem`，并且有一个相关联的标签，才能使用。
:::

```java
private static final DeferredRegister<BannerPattern> REGISTER = DeferredRegister.create(Registries.BANNER_PATTERN, "examplemod");

// Takes in the pattern name to send over the network
public static final BannerPattern EXAMPLE_PATTERN = REGISTER.register("example_pattern", () -> new BannerPattern("examplemod:ep"));
```

[recipe]: ./custom.md#recipe
[cancel]: ../../../concepts/events.md#cancellable-events
[attached]: ../../../concepts/events.md#registering-an-event-handler
[registering]: ../../../concepts/registries.md
