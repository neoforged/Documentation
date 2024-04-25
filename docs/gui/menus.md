根据您的要求，这里是对上述Markdown文档进行的中文翻译，尽量使语言流畅且专业：

---

# 菜单

菜单是图形用户界面（GUI）后端的一种类型，它们处理与某些数据持有者交互的逻辑。菜单本身并不持有数据。它们是视图，允许用户间接修改内部数据持有者的状态。因此，数据持有者不应直接与任何菜单耦合，而是传递数据引用以调用和修改。

## `MenuType`

菜单是动态创建和删除的，因此它们不是注册对象。因此，另一个工厂对象被注册以便轻松创建和引用菜单的*类型*。对于一个菜单，这些就是`MenuType`。

`MenuType`必须[注册]。

### `MenuSupplier`

通过将`MenuSupplier`和`FeatureFlagSet`传递给其构造函数来创建`MenuType`。`MenuSupplier`代表一个函数，它接受容器的id和查看菜单的玩家的库存，返回一个新创建的[`AbstractContainerMenu`][acm]。

```java
// 对于某个DeferredRegister<MenuType<?>> REGISTER
public static final RegistryObject<MenuType<MyMenu>> MY_MENU = REGISTER.register("my_menu", () -> new MenuType(MyMenu::new, FeatureFlags.DEFAULT_FLAGS));

// 在MyMenu中，一个AbstractContainerMenu子类
public MyMenu(int containerId, Inventory playerInv) {
  super(MY_MENU.get(), containerId);
  // ...
}
```

:::note
容器标识符对每个玩家是唯一的。这意味着在两个不同的玩家上相同的容器id将代表两个不同的菜单，即使他们正在查看同一个数据持有者。
:::

`MenuSupplier`通常负责在客户端创建菜单，使用虚拟数据引用来存储和交互服务器数据持有者同步的信息。

### `IContainerFactory`

如果客户端需要额外的信息（例如，数据持有者在世界中的位置），则可以使用子类`IContainerFactory`。除了容器id和玩家库存外，这还提供了一个`FriendlyByteBuf`，可以存储从服务器发送的额外信息。可以通过`IForgeMenuType#create`使用`IContainerFactory`创建`MenuType`。

```java
// 对于某个DeferredRegister<MenuType<?>> REGISTER
public static final RegistryObject<MenuType<MyMenuExtra>> MY_MENU_EXTRA = REGISTER.register("my_menu_extra", () -> IForgeMenuType.create(MyMenu::new));

// 在MyMenuExtra中，一个AbstractContainerMenu子类
public MyMenuExtra(int containerId, Inventory playerInv, FriendlyByteBuf extraData) {
  super(MY_MENU_EXTRA.get(), containerId);
  // 存储缓冲区的额外数据
  // ...
}
```

## `AbstractContainerMenu`

所有菜单都继承自`AbstractContainerMenu`。一个菜单需要两个参数，[`MenuType`][mt]，代表菜单本身的类型，以及容器id，代表当前访问者的菜单的唯一标识符。

:::caution
玩家一次最多只能打开100个唯一的菜单。
:::

每个菜单应包含两个构造函数：一个用于在服务器上初始化菜单，另一个用于在客户端初始化菜单。用于初始化客户端菜单的构造函数是提供给`MenuType`的。

```java
// 客户端菜单构造函数
public MyMenu(int containerId, Inventory playerInventory) {
  this(containerId, playerInventory);
}

// 服务器菜单构造函数
public MyMenu(int containerId, Inventory playerInventory) {
  // ...
}
```

每个菜单实现必须实现两个方法：`#stillValid`和[`#quickMoveStack`][qms]。

### `#stillValid`和`ContainerLevelAccess`

`#stillValid`

确定是否应该为给定玩家保持菜单打开。这通常指向静态的`#stillValid`，它需要一个`ContainerLevelAccess`、玩家和菜单所附属的`Block`。客户端菜单必须始终为此方法返回`true`，这是静态`#stillValid`的默认设置。此实现检查玩家是否在数据存储对象所在位置的八个方块范围内。

`ContainerLevelAccess`提供了当前级别和块所在位置的封闭范围。在服务器上构造菜单时，可以通过调用`ContainerLevelAccess#create`创建新的访问权限。客户端菜单构造函数可以传递`ContainerLevelAccess#NULL`，这将不做任何事。

```java
// 客户端菜单构造函数
public MyMenuAccess(int containerId, Inventory playerInventory) {
  this(containerId, playerInventory, ContainerLevelAccess.NULL);
}

// 服务器菜单构造函数
public MyMenuAccess(int containerId, Inventory playerInventory, ContainerLevelAccess access) {
  // ...
}

// 假设此菜单附属于RegistryObject<Block> MY_BLOCK
@Override
public boolean stillValid(Player player) {
  return AbstractContainerMenu.stillValid(this.access, player, MY_BLOCK.get());
}
```

### 数据同步

需要在服务器和客户端上存在某些数据才能显示给玩家。为此，菜单实现了基本的数据同步层，以便每当当前数据与上次同步到客户端的数据不匹配时进行检查。对于玩家来说，这每个游戏刻都会检查。

Minecraft默认支持两种数据同步形式：通过`Slot`的`ItemStack`和通过`DataSlot`的整数。`Slot`和`DataSlot`是持有可以在屏幕上被玩家修改的数据存储引用的视图，前提是动作有效。这些可以通过在构造函数中的`#addSlot`和`#addDataSlot`添加到菜单中。

:::note
由于NeoForge不推荐使用`Container`，转而使用[`IItemHandler`能力][cap]，下文将围绕使用这种能力的变体：`SlotItemHandler`进行解释。
:::

`SlotItemHandler`包含四个参数：代表堆栈所在库存的`IItemHandler`，此槽特别代表的堆栈的索引，以及槽在屏幕上相对于`AbstractContainerScreen#leftPos`和`#topPos`的左上位置的x和y位置。客户端菜单构造函数应始终提供一个相同大小的空库存实例。

在大多数情况下，首先添加菜单包含的任何槽，然后是玩家的库存，最后是玩家的快捷栏。要从菜单访问任何单独的`Slot`，必须根据添加槽的顺序计算索引。

`DataSlot`是一个抽象类，应实现getter和setter以引用数据存储对象中存储的数据。客户端菜单构造函数应始终通过`DataSlot#standalone`提供一个新实例。

这些，连同槽一起，应在每次初始化新菜单时重新创建。

:::caution
尽管`DataSlot`存储一个整数，但由于其通过网络发送值的方式，它实际上限制为一个**短整型**（-32768至32767）。整数的16个高阶位被忽略。
:::

```java
// 假设我们有一个大小为5的数据对象库存
// 假设每次服务器菜单初始化时都构建了一个DataSlot

// 客户端菜单构造函数
public MyMenuAccess(int containerId, Inventory playerInventory) {
  this(containerId, playerInventory, new ItemStackHandler(5), DataSlot.standalone());
}

// 服务器菜单构造函数
public MyMenuAccess(int containerId, Inventory playerInventory, IItemHandler dataInventory, DataSlot dataSingle) {
  // 检查数据库存大小是否为某个固定值
  // 然后，为数据库存添加槽位
  this.addSlot(new SlotItemHandler(dataInventory, /*...*/));

  // 为玩家库存添加槽位
  this.addSlot(new Slot(playerInventory, /*...*/));

  // 为处理的整数添加数据槽位
  this.addDataSlot(dataSingle);

  // ...
}
```

#### `ContainerData`

如果需要将多个整数同步到客户端，可以使用`ContainerData`来引用这些整数。这个接口功能类似于索引查找，其中每个索引代表一个不同的整数。如果将`ContainerData`通过`#addDataSlots`方法添加到菜单中，则可以直接在数据对象本身中构建`ContainerData`。该方法为接口指定的数据量创建新的`DataSlot`。客户端菜单构造函数应始终通过`SimpleContainerData`提供新实例。

```java
// 假设我们有一个大小为3的ContainerData

// 客户端菜单构造函数
public MyMenuAccess(int containerId, Inventory playerInventory) {
  this(containerId, playerInventory, new SimpleContainerData(3));
}

// 服务器菜单构造函数
public MyMenuAccess(int containerId, Inventory playerInventory, ContainerData dataMultiple) {
  // 检查ContainerData大小是否为某个固定值
  checkContainerDataCount(dataMultiple, 3);

  // 为处理的整数添加数据槽位
  this.addDataSlots(dataMultiple);

  // ...
}
```

:::caution
由于`ContainerData`委托给`DataSlot`，这些也被限制为一个**短整型**（-32768至32767）。
:::

#### `#quickMoveStack`

`#quickMoveStack`是任何菜单必须实现的第二个方法。每当一个堆栈被快速移动或通过Shift点击从其当前槽中移出时，就会调用此方法，直到堆栈完全移出其前一个槽或没有其他地方可以放置堆栈为止。该方法返回被快速移动的槽中的堆栈副本。
 
通常使用 `#moveItemStackTo` 在插槽之间移动堆叠物品，该方法将堆叠物品移动到第一个可用的插槽。它接受要移动的堆叠物品、要尝试将堆叠物品移动到的第一个插槽索引（包括）、最后一个插槽索引（不包括），以及是否从第一个到最后一个插槽进行检查（当为 `false` 时）或从最后一个到第一个插槽进行检查（当为 `true` 时）。

在 Minecraft 的各种实现中，该方法在逻辑上相当一致：

```java
// 假设我们有一个大小为 5 的数据存储库
// 存储库有 4 个输入插槽（索引 1 - 4），输出到一个结果插槽（索引 0）
// 我们还有 27 个玩家存储库插槽和 9 个快捷栏插槽
// 因此，实际插槽的索引如下：
//   - 数据存储库：结果（0）、输入（1 - 4）
//   - 玩家存储库（5 - 31）
//   - 玩家快捷栏（32 - 40）
@Override
public ItemStack quickMoveStack(Player player, int quickMovedSlotIndex) {
  // 快速移动的插槽堆叠物品
  ItemStack quickMovedStack = ItemStack.EMPTY;
  // 快速移动的插槽
  Slot quickMovedSlot = this.slots.get(quickMovedSlotIndex) 
  
   // 如果插槽在有效范围内且插槽不为空
  if (quickMovedSlot != null && quickMovedSlot.hasItem()) {
    // 获取要移动的原始堆叠物品
    ItemStack rawStack = quickMovedSlot.getItem(); 
    // 将插槽堆叠设置为原始堆叠的副本
    quickMovedStack = rawStack.copy();

    /*
    以下快速移动逻辑可以简化为在数据存储库中，尝试移动到玩家存储库/快捷栏，反之亦然，对于无法转换数据的容器（例如箱子）。
    */

    // 如果快速移动在数据存储库结果插槽上执行
    if (quickMovedSlotIndex == 0) {
      // 尝试将结果插槽移动到玩家存储库/快捷栏
      if (!this.moveItemStackTo(rawStack, 5, 41, true)) {
        // 如果无法移动，不再快速移动
        return ItemStack.EMPTY;
      }

      // 对结果插槽快速移动执行逻辑
      slot.onQuickCraft(rawStack, quickMovedStack);
    }
    // 否则如果快速移动在玩家存储库或快捷栏插槽上执行
    else if (quickMovedSlotIndex >= 5 && quickMovedSlotIndex < 41) {
      // 尝试将玩家存储库/快捷栏插槽移动到数据存储库输入插槽
      if (!this.moveItemStackTo(rawStack, 1, 5, false)) {
        // 如果无法移动且在玩家存储库插槽中，尝试移动到快捷栏
        if (quickMovedSlotIndex < 32) {
          if (!this.moveItemStackTo(rawStack, 32, 41, false)) {
            // 如果无法移动，不再快速移动
            return ItemStack.EMPTY;
          }
        }
        // 否则尝试将快捷栏移动到玩家存储库插槽
        else if (!this.moveItemStackTo(rawStack, 5, 32, false)) {
          // 如果无法移动，不再快速移动
          return ItemStack.EMPTY;
        }
      }
    }
    // 否则如果快速移动在数据存储库输入插槽上，则尝试移动到玩家存储库/快捷栏
    else if (!this.moveItemStackTo(rawStack, 5, 41, false)) {
      // 如果无法移动，不再快速移动
      return ItemStack.EMPTY;
    }

    if (rawStack.isEmpty()) {
      // 如果原始堆叠完全移出插槽，则将插槽设置为空堆叠
      quickMovedSlot.set(ItemStack.EMPTY);
    } else {
      // 否则，通知插槽堆叠数量已更改
      quickMovedSlot.setChanged();
    }

    /*
    如果菜单不表示可以转换堆叠的容器（例如箱子），则可以删除以下 if 语句和 Slot#onTake 调用。
    */
    if (rawStack.getCount() == quickMovedStack.getCount()) {
      // 如果原始堆叠无法移动到另一个插槽，则不再快速移动
      return ItemStack.EMPTY;
    }
    // 执行堆叠剩余部分后移动的逻辑
    quickMovedSlot.onTake(player, rawStack);
  }

  return quickMovedStack; // 返回插槽堆叠
}
```

## 打开菜单

一旦菜单类型已注册，菜单本身已完成，并且 [screen] 已附加，玩家就可以打开菜单。可以通过在逻辑服务器上调用 `NetworkHooks#openScreen` 来打开菜单。该方法接受打开菜单的玩家、服务器端菜单的 `MenuProvider`，以及可选的 `FriendlyByteBuf`，如果需要向客户端同步额外数据。

:::note
只有在使用 [`IContainerFactory`][icf] 创建菜单类型时，才应使用带有 `FriendlyByteBuf` 参数的 `NetworkHooks

#openScreen`。
:::

#### `MenuProvider`

`MenuProvider` 是一个包含两个方法的接口：`#createMenu`，用于创建菜单的服务器实例，以及 `#getDisplayName`，返回包含菜单标题的组件以传递给 [screen]。`#createMenu` 方法包含三个参数：菜单的容器 ID、打开菜单的玩家的库存，以及打开菜单的玩家。

可以使用 `SimpleMenuProvider` 轻松创建 `MenuProvider`，它接受一个方法引用来创建服务器菜单和菜单的标题。

```java
// 在某些实现中
NetworkHooks.openScreen(serverPlayer, new SimpleMenuProvider(
  (containerId, playerInventory, player) -> new MyMenu(containerId, playerInventory),
  Component.translatable("menu.title.examplemod.mymenu")
));
```

### 常见实现

通常通过某种玩家交互方式（例如右键单击方块或实体）打开菜单。

#### 方块实现

方块通常通过覆盖 `BlockBehaviour#use` 来实现菜单。如果在逻辑客户端上，交互返回 `InteractionResult#SUCCESS`。否则，打开菜单并返回 `InteractionResult#CONSUME`。

`MenuProvider` 应该通过覆盖 `BlockBehaviour#getMenuProvider` 来实现。原版方法使用此方法在旁观模式下查看菜单。

```java
// 在某个 Block 子类中
@Override
public MenuProvider getMenuProvider(BlockState state, Level level, BlockPos pos) {
  return new SimpleMenuProvider(/* ... */);
}

@Override
public InteractionResult use(BlockState state, Level level, BlockPos pos, Player player, InteractionHand hand, BlockHitResult result) {
  if (!level.isClientSide && player instanceof ServerPlayer serverPlayer) {
    NetworkHooks.openScreen(serverPlayer, state.getMenuProvider(level, pos));
  }
  return InteractionResult.sidedSuccess(level.isClientSide);
}
```

:::note
这是实现逻辑的最简单方法，不是唯一的方法。如果希望方块仅在满足某些条件时打开菜单，则需要事先将一些数据同步到客户端，以返回 `InteractionResult#PASS` 或 `#FAIL`，如果条件不满足。
:::

#### 生物实现

生物通常通过覆盖 `Mob#mobInteract` 来实现菜单。这与方块实现类似，唯一的区别是生物本身应该实现 `MenuProvider` 以支持旁观模式查看。

```java
public class MyMob extends Mob implements MenuProvider {
  // ...

  @Override
  public InteractionResult mobInteract(Player player, InteractionHand hand) {
    if (!this.level.isClientSide && player instanceof ServerPlayer serverPlayer) {
      NetworkHooks.openScreen(serverPlayer, this);
    }
    return InteractionResult.sidedSuccess(this.level.isClientSide);
  }
}
```

:::note
再次强调，这是实现逻辑的最简单方法，不是唯一的方法。
:::

[registered]: ../concepts/registries.md#methods-for-registering
[acm]: #abstractcontainermenu
[mt]: #menutype
[qms]: #quickmovestack
[cap]: ../datastorage/capabilities.md#neoforge-provided-capabilities
[screen]: ./screens.md
[icf]: #icontainerfactory
