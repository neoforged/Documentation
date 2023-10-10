# 菜单（Menus）

菜单（Menus）是图形用户界面（GUI）的一种后端类型；它们处理与某些代表的数据持有者交互所涉及的逻辑。菜单本身不是数据持有者。它们是允许用户间接修改内部数据持有者状态的视图。因此，数据持有者不应直接耦合到任何菜单，而应传入数据引用以便调用和修改。

## `MenuType`

菜单是动态创建和删除的，因此不是注册表对象。因此，另一种工厂对象被注册，以方便创建和引用菜单的*类型*。对于菜单，其为`MenuType`。

`MenuType`必须被[注册][registered]。

### `MenuSupplier`

`MenuType`是通过将`MenuSupplier`和`FeatureFlagSet`传递给其构造函数来创建的。`MenuSupplier`表示一个函数，该函数接收容器的id和查看菜单的玩家的物品栏，并返回一个新创建的[`AbstractContainerMenu`][acm]。

```java
// 对于某个类型为DeferredRegister<MenuType<?>>的REGISTER
public static final RegistryObject<MenuType<MyMenu>> MY_MENU = REGISTER.register("my_menu", () -> new MenuType(MyMenu::new, FeatureFlags.DEFAULT_FLAGS));

// 在MyMenu，一个AbstractContainerMenu的子类中
public MyMenu(int containerId, Inventory playerInv) {
  super(MY_MENU.get(), containerId);
  // ...
}
```

!!! 注意
    容器id对于单个玩家是唯一的。这意味着，两个不同玩家上的相同容器id将代表两个不同的菜单，即使他们正在查看相同的数据持有者。

`MenuSupplier`通常负责在客户端上创建一个菜单，其中包含用于存储来自服务端数据持有者的同步信息并与之交互的伪数据引用。

### `IContainerFactory`

如果需要有关客户端的其他信息（例如数据持有者在世界中的位置），则可以使用子类`IContainerFactory`。除了容器id和玩家物品栏之外，这还提供了一个`FriendlyByteBuf`，它可以存储从服务端发送的附加信息。`MenuType`可以通过`IForgeMenuType#create`使用`IContainerFactory`创建。

```java
// 对于某个类型为DeferredRegister<MenuType<?>>的REGISTER
public static final RegistryObject<MenuType<MyMenuExtra>> MY_MENU_EXTRA = REGISTER.register("my_menu_extra", () -> IForgeMenuType.create(MyMenu::new));

// 在MyMenuExtra，一个AbstractContainerMenu的子类中
public MyMenuExtra(int containerId, Inventory playerInv, FriendlyByteBuf extraData) {
  super(MY_MENU_EXTRA.get(), containerId);
  // 从buffer中存储附加信息
  // ...
}
```

## `AbstractContainerMenu`

所有菜单都是从`AbstractContainerMenu`继承而来的。菜单包含两个参数，即表示菜单本身类型的[`MenuType`][mt]和表示当前访问者的菜单唯一标识符的容器id。

!!! 重要
    玩家一次只能打开100个唯一的菜单。

每个菜单应该包含两个构造函数：一个用于初始化服务端上的菜单，另一个用于启动客户端上的菜单。用于初始化客户端菜单的构造函数是提供给`MenuType`的构造函数。服务端菜单构造函数包含的任何字段都应该具有客户端菜单构造函数的一些默认值。

```java
// 客户端菜单构造函数
public MyMenu(int containerId, Inventory playerInventory) {
  this(containerId, playerInventory);
}

// 服务端菜单构造函数
public MyMenu(int containerId, Inventory playerInventory) {
  // ...
}
```

每个菜单实现必须实现两个方法：`#stillValid`和[`#quickMoveStack`][qms]。

### `#stillValid`和`ContainerLevelAccess`

`#stillValid`确定菜单是否应该为给定的玩家保持打开状态。这通常指向静态的`#stillValid`，它接受一个`ContainerLevelAccess`、该玩家和该菜单所附的`Block`。客户端菜单必须始终为该方法返回`true`，而静态的`#stillValid`默认为该方法。该实现检查玩家是否在数据存储对象所在的八个方块内。

`ContainerLevelAccess`提供封闭范围内方块的当前存档和位置。在服务端上构建菜单时，可以通过调用`ContainerLevelAccess#create`创建新的访问。客户端菜单构造函数可以传入`ContainerLevelAccess#NULL`，这将不起任何作用。

```java
// 客户端菜单构造函数
public MyMenuAccess(int containerId, Inventory playerInventory) {
  this(containerId, playerInventory, ContainerLevelAccess.NULL);
}

// 服务端菜单构造函数
public MyMenuAccess(int containerId, Inventory playerInventory, ContainerLevelAccess access) {
  // ...
}

// 假设该菜单已绑定到RegistryObject<Block> MY_BLOCK
@Override
public boolean stillValid(Player player) {
  return AbstractContainerMenu.stillValid(this.access, player, MY_BLOCK.get());
}
```

### 数据的同步

一些数据需要同时出现在服务端和客户端上才能显示给玩家。为此，菜单实现了数据同步的基本层，以便在当前数据与上次同步到客户端的数据不匹配时进行同步。对于玩家来说，这是每个tick都会检查的。

Minecraft默认支持两种形式的数据同步：通过`Slot`进行的`ItemStack`同步和通过`DataSlot`进行的整数同步。`Slot`和`DataSlot`是保存对数据存储的引用的视图，假设操作有效，玩家可以在屏幕中修改这些数据存储。这些可以通过`#addSlot`和`#addDataSlot`在菜单的构造函数中添加。

!!! 注意
    由于`Slot`使用的`Container`已被Forge弃用，取而代之的是使用[`IItemHandler`功能][cap]，因此其余解释将围绕使用功能变体：`SlotItemHandler`展开。

`SlotItemHandler`包含四个参数：`IItemHandler`表示物品栈所在的物品栏，该Slot具体表示的物品栈索引，以及该Slot左上角将在屏幕上呈现的相对于`AbstractContainerScreen#leftPos`和`#topPos`的x和y位置。客户端菜单构造函数应该始终提供相同大小的物品栏的空实例。

在大多数情况下，菜单中包含的任何Slot都会首先添加，然后是玩家的物品栏，最后以玩家的快捷栏结束。要从菜单中访问任何单独的`Slot`，必须根据添加Slot的顺序计算索引。

`DataSlot`是一个抽象类，它应该实现getter和setter来引用存储在数据存储对象中的数据。客户端菜单构造函数应始终通过`DataSlot#standalone`提供一个新实例。

每次初始化新菜单时，都应该重新创建上述内容以及Slot。

!!! 警告
    尽管`DataSlot`存储一个整数（int），但由于它在网络上发送数值的方式，它实际上被限制为**short**类型（-32768到32767）。该整数（int）的16个高比特位被忽略。

```java
// 假设我们有一个来自大小为5的数据对象的物品栏
// 假设我们在每次初始化服务端菜单时都构造了一个DataSlot

// 客户端菜单构造函数
public MyMenuAccess(int containerId, Inventory playerInventory) {
  this(containerId, playerInventory, new ItemStackHandler(5), DataSlot.standalone());
}

// 服务端菜单构造函数
public MyMenuAccess(int containerId, Inventory playerInventory, IItemHandler dataInventory, DataSlot dataSingle) {
  // 检查数据物品栏大小是否为某个固定值
  // 然后，为数据物品栏添加Slot
  this.addSlot(new SlotItemHandler(dataInventory, /*...*/));

  // 为玩家物品栏添加Slot
  this.addSlot(new Slot(playerInventory, /*...*/));

  // 为被处理的整数添加Slot
  this.addDataSlot(dataSingle);

  // ...
}
```

#### `ContainerData`

如果需要将多个整数同步到客户端，则可以使用一个`ContainerData`来引用这些整数。此接口用作索引查找，以便每个索引表示不同的整数。如果通过`#addDataSlots`将`ContainerData`添加到菜单中，则也可以在数据对象本身中构造`ContainerData`。该方法为接口指定量的数据创建一个新的`DataSlot`。客户端菜单构造函数应始终通过`SimpleContainerData`提供一个新实例。

```java
// 假设我们有一个大小为3的ContainerData

// 客户端菜单构造函数
public MyMenuAccess(int containerId, Inventory playerInventory) {
  this(containerId, playerInventory, new SimpleContainerData(3));
}

// 服务端菜单构造函数
public MyMenuAccess(int containerId, Inventory playerInventory, ContainerData dataMultiple) {
  // 检查ContainerData大小是否为某个固定值
  checkContainerDataCount(dataMultiple, 3);

  // 为被处理的整数添加Slot
  this.addDataSlots(dataMultiple);

  // ...
}
```

!!! 警告
    由于`ContainerData`委托`DataSlot`，这些整数也被限制为**short**（-32768到32767）。

#### `#quickMoveStack`

`#quickMoveStack`是任何菜单都必须实现的第二个方法。每当物品栈被Shift单击或快速移出其当前Slot，直到物品栈完全移出其上一个Slot，或者物品栈没有其他位置可去时，就会调用此方法。该方法返回正在快速移动的Slot中物品栈的一个副本。

物品栈通常使用`#moveItemStackTo`在Slot之间移动，它将物品栈移动到第一个可用的Slot中。它接受要移动的物品栈、尝试将物品栈移动到的第一个Slot的索引（包括）、最后一个Slot的索引，以及是以从第一个到最后一个（当`false`时）还是从最后一个到第一个（当`true`时）的顺序检查Slot。

在Minecraft的实现中，这种方法的逻辑相当一致：

```java
// 假设我们有一个大小为5的数据物品栏
// 该物品栏有4个输入（索引1 - 4）并输出到一个结果Slot（索引0）
// 我们也有27个玩家物品栏Slot和9个快捷栏Slot
// 这样，真正的Slot索引按如下编排：
//   - 数据物品栏：结果（0），输入（1 - 4）
//   - 玩家物品栏（5 - 31）
//   - 玩家快捷栏（32 - 40）
@Override
public ItemStack quickMoveStack(Player player, int quickMovedSlotIndex) {
  // 快速移动的Slot的物品栈
  ItemStack quickMovedStack = ItemStack.EMPTY;
  // 快速移动的Slot
  Slot quickMovedSlot = this.slots.get(quickMovedSlotIndex) 
  
  // 如果该Slot在合理范围内且不为空
  if (quickMovedSlot != null && quickMovedSlot.hasItem()) {
    // 获取原始物品栈以用于移动
    ItemStack rawStack = quickMovedSlot.getItem();
    // 将Slot物品栈设置为该原始物品栈的副本
    quickMovedStack = rawStack.copy();

    /*
    以下快速移动逻辑可以简化为：如果在数据物品栏中，尝试移动到玩家物品栏/快捷栏，
    反之亦然，对于无法转换数据的容器（例如箱子）。
    */

    // 如果快速移动在数据物品栏的结果Slot上进行
    if (quickMovedSlotIndex == 0) {
      // 尝试将结果Slot移入玩家物品栏/快捷栏
      if (!this.moveItemStackTo(rawStack, 5, 41, true)) {
        // 如果无法移动，就不再进行快速移动
        return ItemStack.EMPTY;
      }

      // 执行Slot的快速移动逻辑
      slot.onQuickCraft(rawStack, quickMovedStack);
    }
    // 否则如果快速移动在玩家物品栏或快捷栏Slot上进行
    else if (quickMovedSlotIndex >= 5 && quickMovedSlotIndex < 41) {
      // 尝试将物品栏/快捷栏Slot移入数据物品栏输入Slot
      if (!this.moveItemStackTo(rawStack, 1, 5, false)) {
        // 如果无法移动且在玩家物品栏Slot内，尝试移入快捷栏
        if (quickMovedSlotIndex < 32) {
          if (!this.moveItemStackTo(rawStack, 32, 41, false)) {
            // 如果无法移动，就不再进行快速移动
            return ItemStack.EMPTY;
          }
        }
        // 否则就尝试将快捷栏移入玩家物品栏Slot
        else if (!this.moveItemStackTo(rawStack, 5, 32, false)) {
          // 如果无法移动，就不再进行快速移动
          return ItemStack.EMPTY;
        }
      }
    }
    // 否则如果快速移动在数据物品栏的输入Slot上进行，尝试将其移入玩家物品栏/快捷栏
    else if (!this.moveItemStackTo(rawStack, 5, 41, false)) {
      // 如果无法移动，就不再进行快速移动
      return ItemStack.EMPTY;
    }

    if (rawStack.isEmpty()) {
      // 如果原始物品栈已完全移出当前Slot，将该Slot置空
      quickMovedSlot.set(ItemStack.EMPTY);
    } else {
      // 否则，通知该Slot物品栈数量已改变
      quickMovedSlot.setChanged();
    }

    /*
    如果菜单不表示可以转换物品栈的容器（例如箱子），则可以删除以下if语句和
    Slot#onTake调用。
    */
    if (rawStack.getCount() == quickMovedStack.getCount()) {
      // 如果原始物品栈不能被移动到另一个Slot，就不再进行快速移动
      return ItemStack.EMPTY;
    }
    // 执行剩余物品栈的移动后逻辑
    quickMovedSlot.onTake(player, rawStack);
  }

  return quickMovedStack; // 返回该Slot物品栈
}
```

## 打开菜单

一旦注册了菜单类型，菜单本身已经完成，并且一个[屏幕（Screen）][screen]已被附加，玩家就可以打开菜单。可以通过在逻辑服务端上调用`NetworkHooks#openScreen`来打开菜单。该方法让玩家打开菜单，服务端端菜单的`MenuProvider`，如果需要将额外数据同步到客户端，还可以选择`FriendlyByteBuf`。

!!! 注意
    只有在使用[`IContainerFactory`][icf]创建菜单类型时，才应使用带有`FriendlyByteBuf`参数的`NetworkHooks#openScreen`。

#### `MenuProvider`

`MenuProvider`是一个包含两个方法的接口：`#createMenu`和`#getDisplayName`，前者创建菜单的服务端实例，后者返回一个包含要传递到[屏幕（Screen）][screen]的菜单标题的组件。`#createMenu`方法包含三个参数：菜单的容器id、打开菜单的玩家的物品栏以及打开菜单的玩家。

使用`SimpleMenuProvider`可以很容易地创建`MenuProvider`，它采用方法引用来创建服务端菜单和菜单标题。

```java
// 在某种实现中
NetworkHooks.openScreen(serverPlayer, new SimpleMenuProvider(
  (containerId, playerInventory, player) -> new MyMenu(containerId, playerInventory),
  Component.translatable("menu.title.examplemod.mymenu")
));
```

### 常见的实现

菜单通常在某种玩家交互时打开（例如，当右键单击方块或实体时）。

#### 方块的实现

方块块通常通过重写`BlockBehaviour#use`来实现菜单。如果在逻辑客户端上，则交互返回`InteractionResult#SUCCESS`。否则，它将打开菜单并返回`InteractionResult#CONSUME`。

应通过重写`BlockBehaviour#getMenuProvider`来实现`MenuProvider`。原版方法使用这个来显示旁观者模式下的菜单。

```java
// 在某个Block的子类中
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

!!! 注意
    这是实现逻辑的最简单的方法，而不是唯一的方法。如果你希望方块仅在特定条件下打开菜单，则需要提前将一些数据同步到客户端，以便在不满足条件的情况下返回`InteractionResult#PASS`或`#FAIL`。

#### 生物的实现

Mob通常通过重写`Mob#mobInteract`来实现菜单。这与方块实现类似，唯一的区别是`Mob`本身应该实现`MenuProvider`以支持旁观者模式下的显示。

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

!!! 注意
    再次说明，这是实现逻辑的最简单的方法，而不是唯一的方法。

[registered]: ../concepts/registries.md#methods-for-registering
[acm]: #abstractcontainermenu
[mt]: #menutype
[qms]: #quickmovestack
[cap]: ../datastorage/capabilities.md#forge-provided-capabilities
[screen]: ./screens.md
[icf]: #icontainerfactory
