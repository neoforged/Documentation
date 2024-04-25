## 注册方块实体

方块实体的创建和移除是动态的，因此它们本身不是注册对象。要创建一个`BlockEntity`，你需要扩展`BlockEntity`类。相应地，另一个对象被注册以方便创建和引用动态对象的*类型*。对于`BlockEntity`，这些类型被称为`BlockEntityType`。

`BlockEntityType`可以像其他注册对象一样被[注册][registration]。使用`BlockEntityType.Builder#of`来构建`BlockEntityType`，它接受两个参数：一个`BlockEntityType.BlockEntitySupplier`，它接受一个`BlockPos`和`BlockState`来创建新的`BlockEntity`实例，以及一个可变数量的`Block`，这些方块可以附加到此`BlockEntity`。

```java
// 对于某个DeferredRegister<BlockEntityType<?>> REGISTER
public static final RegistryObject<BlockEntityType<MyBE>> MY_BE = REGISTER.register("mybe", () -> BlockEntityType.Builder.of(MyBE::new, validBlocks).build(null));

// 在MyBE中，一个BlockEntity子类
public MyBE(BlockPos pos, BlockState state) {
  super(MY_BE.get(), pos, state);
}
```

## 创建方块实体

要创建一个`BlockEntity`并将其附加到一个`Block`，你的`Block`子类必须实现`EntityBlock`接口。必须实现方法`EntityBlock#newBlockEntity(BlockPos, BlockState)`并返回你的`BlockEntity`的新实例。

## 存储你的方块实体内的数据

为了保存数据，覆盖以下两个方法：
```java
BlockEntity#saveAdditional(CompoundTag tag)

BlockEntity#load(CompoundTag tag)
```
这些方法在包含`BlockEntity`的`LevelChunk`从标签加载/保存时调用。使用这些方法读写你的方块实体类中的字段。

:::note
每当你的数据发生变化时，你需要调用`BlockEntity#setChanged`；否则，在级别保存时可能会跳过包含你的`BlockEntity`的`LevelChunk`。
:::

:::danger
调用`super`方法非常重要！

标签名`id`、`x`、`y`、`z`、`ForgeData`和`ForgeCaps`由`super`方法保留。
:::

## `BlockEntities` 的定时器

如果你需要一个定时的方块实体，例如跟踪熔炼过程中的进度，那么必须在`EntityBlock`内实现并覆盖另一个方法：`EntityBlock#getTicker(Level, BlockState, BlockEntityType)`。这可以实现不同的定时器，取决于用户所在的逻辑侧，或者只实现一个通用定时器。无论哪种情况，都必须返回一个`BlockEntityTicker`。由于这是一个功能接口，它可以仅采用表示定时器的方法：

```java
// 在某个Block子类内
@Nullable
@Override
public <T extends BlockEntity> BlockEntityTicker<T> getTicker(Level level, BlockState state, BlockEntityType<T> type) {
  return type == MyBlockEntityTypes.MYBE.get() ? MyBlockEntity::tick : null;
}

// 在MyBlockEntity内
public static void tick(Level level, BlockPos pos, BlockState state, MyBlockEntity blockEntity) {
  // 执行任务
}
```

:::note
这个方法每个tick都会被调用；因此，你应该避免在这里进行复杂的计算。如果可能，你应该每X个ticks进行更复杂的计算。（一秒钟内的ticks数量可能低于20，但不会更高）
:::

## 将数据同步到客户端

有三种方法可以将数据同步到客户端：在LevelChunk加载时同步，在方块更新时同步，以及使用自定义网络消息同步。

### 在LevelChunk加载时同步

为此，你需要覆盖
```java
BlockEntity#getUpdateTag()

IForgeBlockEntity#handleUpdateTag(CompoundTag tag)
```
第一个方法收集应该发送到客户端的数据，而第二个方法处理这些数据。如果你的`BlockEntity`不包含太多数据，你可能可以使用[存储你的方块实体内的数据][storing-data]部分中的方法。

:::caution
同步过多/无用的方块实体数据可能导致网络拥塞。你应该优化你的网络使用，只在客户端需要时发送客户端需要的信息。例如，通常没有必要在更新标签中发送方块实体的库存，因为这可以通过其[`AbstractContainerMenu`][menu]同步。
:::

### 在方块更新时同步

这种方法有点复杂，但你只需覆盖两个或三个方法。这里是它的一个小示例实现：
```java
@Override
public CompoundTag getUpdateTag() {
  CompoundTag tag = new CompoundTag();
  // 将你的数据写入标签
  return tag;
}

@Override
public Packet<ClientGamePacketListener> getUpdatePacket() {
  // 从#getUpdateTag获取标签
  return ClientboundBlockEntityDataPacket.create(this);
}

// 可以覆盖IForgeBlockEntity#onDataPacket。默认情况下，这将推迟到#load。
```
静态构造函数`ClientboundBlockEntityDataPacket#create`接受：

* `BlockEntity`。
* 一个可选的函数，从`BlockEntity`获取`CompoundTag`。默认情况下，这使用`BlockEntity#getUpdateTag`。

现在，要发送数据包，服务器上必须给出更新通知。
```java
Level#sendBlockUpdated(BlockPos pos, BlockState oldState, BlockState newState, int flags)
```
`pos`应该是你的`BlockEntity`的位置。
对于`oldState`和`newState`，你可以传递该位置当前的`BlockState`。
`flags`是一个位掩码，应包含`2`，这将同步更改到客户端。有关更多信息以及其他标志，请参阅`Block`。标志`2`等同于`Block#UPDATE_CLIENTS`。

### 使用自定义网络消息同步

这种同步方式可能是最复杂的，但通常是最优化的，因为你可以确保只有你需要同步的数据实际上被同步。你应该首先查看[`Networking`][networking]部分，特别是[`SimpleImpl`][simple_impl]，然后再尝试这种方式。一旦你创建了自定义网络消息，你可以使用`SimpleChannel#send(PacketDistributor$PacketTarget, MSG)`将其发送给加载了`BlockEntity`的所有用户。

:::caution
进行安全检查非常重要，当消息到达玩家时，`BlockEntity`可能已经被销毁/替换！你还应该检查块是否已加载（`Level#hasChunkAt(BlockPos)`）。
:::

[registration]: ../concepts/registries.md#methods-for-registering
[storing-data]: #storing-data-within-your-blockentity
[menu]: ../gui/menus.md
[networking]: ../networking/index.md
[simple_impl]: ../networking/simpleimpl.md
