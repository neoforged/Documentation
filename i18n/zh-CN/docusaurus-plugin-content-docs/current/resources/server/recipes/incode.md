非数据包配方
===========

并不是所有的配方都足够简单或迁移到使用数据驱动的配方。一些子系统仍然需要在代码库中进行修补，以提供对添加新配方的支持。

酿造配方
-------

酿造是代码中为数不多的仍然存在的配方之一。酿造配方是作为`PotionBrewing`中的引导程序的一部分添加的，用于容器、容器配方和药水混合物。为了扩展现有系统，Forge允许通过在`FMLCommonSetupEvent`中调用`BrewingRecipeRegistry#addRecipe`来添加酿造配方。

:::danger
    `BrewingRecipeRegistry#addRecipe`必须在同步工作队列中通过`#enqueueWork`调用，因为该方法不是线程安全的。
:::

默认实现接受标准实现的输入成分、催化剂成分和物品栈输出。此外，还可以提供一个`IBrewingRecipe`实例来执行转换。

### IBrewingRecipe

`IBrewingRecipe`是一个伪[`Recipe`][recipe]接口，用于检查输入和催化剂是否有效，并在有效时提供相关输出。它分别通过`#isInput`、`#isIngredient`和`#getOutput`提供。输出方法可以访问输入和催化剂物品栈来构建结果。

!!! 重要
    在`ItemStack`或`CompoundTag`之间复制数据时，请确保使用它们各自的`#copy`方法来创建唯一的实例。

没有类似原版的包装来添加额外的药水容器或药水混合物。需要添加一个新的`IBrewingRecipe`实现来复制此行为。

铁砧配方
-------

铁砧负责接收损坏的输入，并给定一些材料或类似的输入，消除输入结果上的一些损坏。因此，它的系统不是简易地被数据驱动。然而，当用户具有所需的经验等级时，由于铁砧配方是具有一定数量的材料等于一定输出的输入，因此可以通过`AnvilUpdateEvent`对其进行修改以创建伪配方系统。这接受了输入和材料，并允许模组开发者指定输出、经验等级成本和用于输出的材料数量。该事件还可以通过[取消][cancel]来阻止任何输出。

```java
// 检查左边和右边的物品是否正确
// 当正确时，设置输出，经验等级消耗，以及材料数量
public void updateAnvil(AnvilUpdateEvent event) {
  if (event.getLeft().is(...) && event.getRight().is(...)) {
    event.setOutput(...);
    event.setCost(...);
    event.setMaterialCost(...);
  }
}
```

该更新事件必须被[绑定][attached]到Forge事件总线。

织布机配方
---------

织布机负责将染料和图案（从织布机或物品上）应用到旗帜上。虽然旗帜和染料必须分别为`BannerItem`或`DyeItem`，但可以在织布机中创建和应用自定义图案。旗帜图案可以通过[注册][registering]一个`BannerPattern`来创建。

!!! 重要
    `minecraft:no_item_required`标签中的`BannerPattern`在织布机中作为一个选项出现。不在此标签中的图案必须有一个附带的`BannerPatternItem`才能与关联的标签一起使用。

```java
private static final DeferredRegister<BannerPattern> REGISTER = DeferredRegister.create(Registries.BANNER_PATTERN, "examplemod");

// 接受要通过网络发送的图案名称
public static final BannerPattern EXAMPLE_PATTERN = REGISTER.register("example_pattern", () -> new BannerPattern("examplemod:ep"));
```

[recipe]: ./custom.md#recipe
[cancel]: ../../../concepts/events.md#canceling
[attached]: ../../../concepts/events.md#creating-an-event-handler
[registering]: ../../../concepts/registries.md#registries-that-arent-forge-registries
