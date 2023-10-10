物品
====

与方块一样，物品也是大多数模组的关键组成部分。方块在构成了你身边的存档的同时，物品也存在于物品栏中。

创建一个物品
-----------

### 基础物品

对于不需要特殊功能的简单物品（比如木棍或糖），不必自定义一个类。你可以通过使用`Item$Properties`对象实例化`Item`类来创建一个物品。这个`Item$Properties`对象可以通过调用其构造函数生成并通过调用其方法进行自定义。例如：

|      方法          |                  描述                         |
|:------------------:|:----------------------------------------------|
| `requiredFeatures` | 设置在所添加到的`CreativeModeTab`中查看此物品所需的`FeatureFlag`。 |
| `durability`       | 设置该物品的最大耐久。如果超过`0`，两个物品属性“damaged”和“damage”会被添加。 |
| `stacksTo`         | 设置最大物品栈大小。你不能拥有一件既有耐久又可堆叠的物品。 |
| `setNoRepair`      | 使此物品无法修复，即使它是有耐久的。 |
| `craftRemainder`   | 设置该物品的容器物品，即熔岩桶在使用后将空桶还给你的方式。 |

上面的方法是可链接的，这意味着它们`return this`以便于串行调用它们。

### 进阶物品

如上所述设置物品属性的方式仅适用于简单物品。如果你想要更复杂的物品，你应该继承`Item`类并重写其方法。

## 创造模式物品栏

可以通过[模组事件总线][modbus]上的`BuildCreativeModeTabContentsEvent`将物品添加到`CreativeModeTab`。可以通过`#accept`添加物品，而无需任何其他配置。

```java
// 已在模组事件总线上注册
// 假设我们有一个名为ITEM的RegistryObject<Item>和一个名为BLOCK的RegistryObject<Block>
@SubscribeEvent
public void buildContents(BuildCreativeModeTabContentsEvent event) {
  // 添加到ingredients创造模式物品栏
  if (event.getTabKey() == CreativeModeTabs.INGREDIENTS) {
    event.accept(ITEM);
    event.accept(BLOCK); // 接受一个ItemLike，假设方块已注册其物品
  }
}
```

你还可以通过`FeatureFlagSet`中的`FeatureFlag`或一个用于确定玩家是否有权查看管理员创造模式物品栏的boolean值来启用或禁用物品。

### 自定义创造模式物品栏

自定义`CreativeModeTab`必须[已被注册][registering]。生成器可以通过`CreativeModeTab#builder`创建。选项卡可以设置标题、图标、默认物品和许多其他属性。此外，Forge还提供了额外的方法来定制标签的图像、标签和插槽颜色，以及选项卡的排序位置等。

```java
// 假设我们有一个名为REGISTRAR的DeferredRegister<CreativeModeTab>
// 假设我们有一个名为ITEM的RegistryObject<Item>和一个名为BLOCK的RegistryObject<Block>
public static final RegistryObject<CreativeModeTab> EXAMPLE_TAB = REGISTRAR.register("example", () -> CreativeModeTab.builder()
  // 设置所要展示的页的名称
  .title(Component.translatable("item_group." + MOD_ID + ".example"))
  // 设置页图标
  .icon(() -> new ItemStack(ITEM.get()))
  // 为物品栏页添加默认物品
  .displayItems((params, output) -> {
    output.accept(ITEM.get());
    output.accept(BLOCK.get());
  })
  .build()
);
```

注册一个物品
-----------

物品必须经过[注册][registering]后才能发挥作用。

[modbus]: ../concepts/events.md#mod-event-bus
[registering]: ../concepts/registries.md#methods-for-registering
