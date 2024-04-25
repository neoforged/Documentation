# 物品

除了方块外，物品是 Minecraft 的关键组成部分。方块构成了你周围的世界，而物品存在于物品栏中。

## 物品到底是什么？

在我们进一步创建物品之前，了解物品究竟是什么，以及它与方块的区别是什么，是非常重要的。让我们通过一个例子来说明这一点：

- 在游戏世界中，你遇到了一个泥土方块并想要挖掘它。这是一个 **方块**，因为它被放置在世界中。（实际上，它不是一个方块，而是一个方块状态。请参阅 [方块状态文章][blockstates] 以获取更详细的信息。）
  - 并非所有方块在破坏时都会掉落自己（例如树叶），有关更多信息，请参阅 [战利品表][loottables] 文章。
- 一旦你 [挖掘了方块][breaking]，它就会被移除（即被替换为空气方块），并且泥土掉落。掉落的泥土是一个 **物品实体**。这意味着像其他实体（猪、僵尸、箭等）一样，它可以被水推动，或者被火和岩浆燃烧。
- 一旦你捡起泥土物品实体，它就会成为你物品栏中的一个 **物品堆叠**。物品堆叠简单地说就是一个物品的实例，带有一些额外的信息，比如堆叠大小。
- 物品堆叠由它们对应的 **物品**（我们正在创建的东西）支持，物品持有所有物品之间相同的信息（例如，每把铁剑的最大耐久度为 250），而物品堆叠持有在两个类似物品之间可能不同的信息（例如，一把铁剑剩余 100 次使用，而另一把铁剑剩余 200 次使用）。有关通过物品和物品堆叠执行的操作和通过物品堆叠执行的操作的更多信息，请继续阅读。
  - 物品与物品堆叠之间的关系大致与 [方块][block] 和 [方块状态][blockstates] 之间的关系相同，即方块状态始终由方块支持。这不是一个非常准确的比较（物品堆叠不是单例，例如），但它可以给出一个关于这里概念的好基本理解。

## 创建一个物品

现在我们了解了物品是什么，让我们创建一个吧！

与基本方块一样，对于不需要特殊功能的基本物品（如棍子、糖等），可以直接使用 `Item` 类。为此，在注册期间，使用 `Item.Properties` 参数实例化 `Item`。可以使用 `Item.Properties#of` 创建此 `Item.Properties` 参数，并通过调用其方法来自定义它：

- `stacksTo` - 设置此物品的最大堆叠大小。默认为 64。例如末影珍珠或其他只能堆叠到 16 的物品使用了这个值。
- `durability` - 设置此物品的耐久度。默认为 0，表示“无耐久度”。例如，铁制工具在此处使用了 250。请注意，设置耐久度会自动将堆叠大小锁定为 1。
- `craftRemainder` - 设置此物品的制作剩余物品。Vanilla 在制作后留下空桶时使用了这个值。
- `fireResistant` - 使使用此物品的物品实体对火和岩浆免疫。许多下界物品都使用了这个。
- `setNoRepair` - 禁用此物品的铁砧和合成网格修复。Vanilla 中未使用。
- `rarity` - 设置此物品的稀有度。当前，这只是改变物品的颜色。`Rarity` 是一个由四个值 `COMMON`（白色，默认）、`UNCOMMON`（黄色）、`RARE`（青色）和 `EPIC`（浅紫色） 组成的枚举。请注意，模组可能会添加更多的稀有度类型。
- `requiredFeatures` - 设置此物品所需的功能标志。这主要用于小版本中 Vanilla 的功能锁定系统。除非你要集成 Vanilla 中由功能标志锁定的系统，否则不建议使用这个。
- `food` - 设置此物品的 [`FoodProperties`][food]。

有关示例，或查看 Minecraft 中使用的各种值，请查看 `Items` 类。

### 食物

`Item` 类提供了食物物品的默认功能，这意味着你不需要单独的类来处理。要使你的物品可食用，你只需要通过 `Item.Properties` 的 `food` 方法设置其上的 `FoodProperties`。

使用 `FoodProperties.Builder` 创建 `FoodProperties`。然后，你可以在其上设置各种属性：

- `nutrition` - 可能是最明显的部分。设置恢复多少饥饿点。以半个饥饿点为单位计数，所以例如，Minecraft 的牛排恢复了 8 个饥饿点。
- `saturationMod` - 用于计算 [进食][hunger] 时恢复的饱和度值的饱和度修

饰符。计算公式为 `min(2 * nutrition * saturationMod, playerNutrition)`，这意味着使用 `0.5` 将使有效的饱和度值与营养值相同。
- `meat` - 是否应将此物品视为肉类。用于确定是否可以使用此食物治愈狗。
- `alwaysEat` - 此物品是否始终可以食用，即使饥饿条已满。默认为 `false`，例如金苹果等提供了除填充饥饿条之外的奖励的物品为 `true`。
- `fast` - 是否为此食物启用快速进食。默认为 `false`，例如 Vanilla 中的干海带为 `true`。
- `effect` - 在吃这个物品时添加一个 [`MobEffectInstance`][mobeffectinstance]。第二个参数表示应用效果的概率；例如，腐肉在被吃时有 80% 的几率（= 0.8）应用饥饿效果。这个方法有两个变体；你应该使用一个带有提供者的（另一个直接使用了一个 mob 效果实例，并因为类加载问题而被 NeoForge 废弃）。
- `build` - 一旦你设置了你想设置的所有内容，调用 `build` 获取一个用于进一步使用的 `FoodProperties` 对象。

有关示例，或查看 Minecraft 中使用的各种值，请查看 `Foods` 类。

要获取物品的 `FoodProperties`，请调用 `Item#getFoodProperties(ItemStack, LivingEntity)`。这可能返回 null，因为并非每个物品都是可食用的。要确定物品是否可食用，请调用 `Item#isEdible()` 或对 `getFoodProperties` 调用的结果进行空检查。

### 更多功能

直接使用 `Item` 仅允许非常基本的物品。如果你想添加功能，例如右键交互，需要一个扩展 `Item` 的自定义类。`Item` 类有许多可以重写以执行不同操作的方法；有关更多信息，请参阅类 `Item` 和 `IItemExtension`。

物品的两种最常见用途是左键单击和右键单击。对于左键单击，请参阅 [破坏方块][breaking] 和 攻击实体（工作中）。对于右键单击，请参阅 [交互管道][interactionpipeline]。

### `DeferredRegister.Items`

所有注册表都使用 `DeferredRegister` 来注册它们的内容，物品也不例外。然而，由于添加新物品是大量模组中一个至关重要的功能，NeoForge 提供了 `DeferredRegister.Items` 帮助类，它扩展了 `DeferredRegister<Item>` 并提供了一些特定于物品的辅助程序：

```java
public static final DeferredRegister.Items ITEMS = DeferredRegister.createItems(ExampleMod.MOD_ID);

public static final Supplier<Item> EXAMPLE_ITEM = ITEMS.registerItem(
        "example_item",
        Item::new, // 将属性传递给工厂。
        new Item.Properties() // 要使用的属性。
);
```

在内部，这只是通过将属性参数应用于提供的物品工厂（通常是构造函数）来调用 `ITEMS.register("example_item", () -> new Item(new Item.Properties()))`。

如果你想使用 `Item::new`，可以完全省略工厂，并使用 `simple` 方法变体：

```java
public static final Supplier<Item> EXAMPLE_ITEM = ITEMS.registerSimpleItem(
        "example_item",
        new Item.Properties() // 要使用的属性。
);
```

这和上一个示例的效果完全相同，但稍微更短一些。当然，如果你想使用 `Item` 的子类而不是 `Item` 本身，则必须使用前一种方法。

这两种方法也有省略 `new Item.Properties()` 参数的重载：

```java
public static final Supplier<Item> EXAMPLE_ITEM = ITEMS.registerItem("example_item", Item::new);
// Variant that also omits the Item::new parameter
public static final Supplier<Item> EXAMPLE_ITEM = ITEMS.registerSimpleItem("example_item");
```

最后，还有块项目的快捷方式：

```java
public static final Supplier<BlockItem> EXAMPLE_BLOCK_ITEM = ITEMS.registerSimpleBlockItem("example_block", ExampleBlocksClass.EXAMPLE_BLOCK, new Item.Properties());
// Variant that omits the properties parameter:
public static final Supplier<BlockItem> EXAMPLE_BLOCK_ITEM = ITEMS.registerSimpleBlockItem("example_block", ExampleBlocksClass.EXAMPLE_BLOCK);
// Variant that omits the name parameter, instead using the block's registry name:
public static final Supplier<BlockItem> EXAMPLE_BLOCK_ITEM = ITEMS.registerSimpleBlockItem(ExampleBlocksClass.EXAMPLE_BLOCK, new Item.Properties());
// Variant that omits both the name and the properties:
public static final Supplier<BlockItem> EXAMPLE_BLOCK_ITEM = ITEMS.registerSimpleBlockItem(ExampleBlocksClass.EXAMPLE_BLOCK);
```

:::note
如果您将注册的方块保存在单独的类中，则应该在项目类之前对方块类进行类加载。
:::

### 资源

如果你注册了你的物品并获得了你的物品（通过 `/give` 命令或通过 [创造模式标签][creativetabs]），你会发现它缺少正确的模型和纹理。这是因为纹理和模型是由 Minecraft 的资源系统处理的。

要为物品应用一个简单的纹理，你必须添加一个物品模型 JSON 文件和一个纹理 PNG 文件。有关更多信息，请参阅 [资源][resources] 部分。

## `ItemStack`（物品堆叠）

与方块和方块状态一样，大多数情况下你期望使用一个 `Item` 实际上都是使用 `ItemStack`。`ItemStack` 表示容器中一个或多个物品的堆叠，例如一个物品栏。与方块和方块状态一样，方法应该被 `Item` 重写，并在 `ItemStack` 上调用，`Item` 中的许多方法都会传入一个 `ItemStack` 实例。

`ItemStack` 由三个主要部分组成：

- 它所表示的 `Item`，可通过 `itemstack.getItem()` 获取。
- 堆叠大小，通常在 1 和 64 之间，通过 `itemstack.getCount()` 获取，通过 `itemstack.setCount(int)` 或 `itemstack.shrink(int)` 可更改。
- 额外的 [NBT][nbt] 数据，其中存储了堆叠特定的数据。可通过 `itemstack.getTag()` 获取，或者通过 `itemstack.getOrCreateTag()` 获取，它考虑了尚不存在标签的情况。还存在许多其他与 NBT 相关的方法，最重要的是 `hasTag()` 和 `setTag()`。
  - 值得注意的是，带有空 NBT 的 `ItemStack` 与根本没有 NBT 的 `ItemStack` 不同。这意味着它们不会堆叠，尽管它们在功能上是等效的。

要创建一个新的 `ItemStack`，请调用 `new ItemStack(Item)`，传入支持的物品。默认情况下，这使用数量为 1 和没有 NBT 数据；如果需要，有接受数量和 NBT 数据的构造函数重载。

`ItemStack` 是可变对象（见下文），但有时需要将它们视为不可变的。如果你需要修改一个被视为不可变的 `ItemStack`，可以使用 `itemstack.copy()` 克隆堆栈。

如果要表示堆叠没有物品，可以使用 `ItemStack.EMPTY`。要检查一个 `ItemStack` 是否为空，请调用 `itemstack.isEmpty()`。

### `ItemStack` 的可变性

`ItemStack` 是可变对象。这意味着如果你调用例如 `setCount`、`setTag` 或 `getOrCreateTag`，`ItemStack` 本身将被修改。Vanilla 广泛使用了 `ItemStack` 的可变性，许多方法依赖于它。例如，`itemstack.split(int)` 从调用者堆栈中分离给定数量的堆栈，同时修改调用者并在过程中返回一个新的 `ItemStack`。

然而，当处理多个 `ItemStack` 时，有时可能会出现问题。最常见的情况是处理库存槽时，因为你必须考虑到当前由光标选择的 `ItemStack`，以及你正在尝试插入/提取的 `ItemStack`。

:::tip
如果不确定，最好安全起见并对堆栈进行 `#copy()`。
:::

## 创造模式标签

默认情况下，你的物品只能通过 `/give` 命令获得，并不会出现在创造模式的物品栏中。让我们来改变这一点吧！

将你的物品添加到创造模式菜单中的方式取决于你想要添加到哪个标签。

### 现有的创造模式标签

:::note
这种方法用于将你的物品添加到 Minecraft 的标签，或其他模组的标签中。要将物品添加到你自己的标签中，请参见下文。
:::

可以通过 `BuildCreativeModeTabContentsEvent` 将物品添加到现有的 `CreativeModeTab` 中，该事件在 [模组事件总线][modbus] 上触发，仅在 [逻辑客户端][sides] 上触发。通过调用 `event#accept` 来添加物品。

```java
//MyItemsClass.MY_ITEM 是 Supplier<? extends Item>，MyBlocksClass.MY_BLOCK 是 Supplier<? extends Block>
@SubscribeEvent
public static void buildContents(BuildCreativeModeTabContentsEvent event) {
    // 这是我们要添加到的标签吗？
    if (event.getTabKey() == CreativeModeTabs.INGREDIENTS) {
        event.accept(MyItemsClass.MY_ITEM);
        // 接受一个 ItemLike。这假设 MY_BLOCK 有一个相应的物品。
        event.accept(MyBlocksClass.MY_BLOCK);
    }
}
```

事件还提供了一些额外信息，例如 `getFlags()` 来获取已启用的功能标志列表，或 `hasPermissions()` 来检查玩家是否有权限查看操作员物品标签。

### 自定义创造模式标签

`CreativeModeTab` 是一个注册表，意味着自定义的 `CreativeModeTab` 必须被 [注册][registering]。创建创造模式标签使用一个构建器系统

，该构建器通过 `CreativeModeTab#builder` 获得。构建器提供了设置标题、图标、默认物品以及许多其他属性的选项。此外，NeoForge 还提供了额外的方法来自定义标签的图像、标签和槽颜色，标签应该排序在哪里等等。

```java
//CREATIVE_MODE_TABS 是 DeferredRegister<CreativeModeTab>
public static final Supplier<CreativeModeTab> EXAMPLE_TAB = CREATIVE_MODE_TABS.register("example", () -> CreativeModeTab.builder()
    // 设置标签的标题。不要忘记添加一个翻译！
    .title(Component.translatable("itemGroup." + MOD_ID + ".example"))
    // 设置标签的图标。
    .icon(() -> new ItemStack(MyItemsClass.EXAMPLE_ITEM.get()))
    // 将你的物品添加到标签中。
    .displayItems((params, output) -> {
        output.accept(MyItemsClass.MY_ITEM);
        // 接受一个 ItemLike。这假设 MY_BLOCK 有一个相应的物品。
        output.accept(MyBlocksClass.MY_BLOCK);
    })
    .build()
);
```

[block]: ../blocks/index.md
[blockstates]: ../blocks/states.md
[breaking]: ../blocks/index.md#breaking-a-block
[creativetabs]: #creative-tabs
[food]: #food
[hunger]: https://minecraft.wiki/w/Hunger#Mechanics
[interactionpipeline]: interactionpipeline.md
[loottables]: ../resources/server/loottables.md
[mobeffectinstance]: mobeffects.md#mobeffectinstances
[modbus]: ../concepts/events.md#event-buses
[nbt]: ../datastorage/nbt.md
[registering]: ../concepts/registries.md#methods-for-registering
