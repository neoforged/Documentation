# Block Entities

Block entities allow the storage of data on blocks in cases where [block states][blockstates] are not suited. This is especially the case for data with a non-finite amount of options, such as inventories. Block entities are stationary and bound to a block, but otherwise share many similarities with entities, hence the name.

:::note
If you have a finite and reasonably small amount (= a few hundred at most) of possible states for your block, you might want to consider using [block states][blockstates] instead.
:::

## Creating and Registering Block Entities

Like entities and unlike blocks, the `BlockEntity` class represents the block entity instance, not the [registered][registration] singleton object. The singleton is expressed through the `BlockEntityType<?>` class instead. We will need both to create a new block entity.

Let's begin by creating our block entity class:

```java
public class MyBlockEntity extends BlockEntity {
    public MyBlockEntity(BlockPos pos, BlockState state) {
        super(type, pos, state);
    }
}
```

As you may have noticed, we pass an undefined variable `type` to the super constructor. Let's leave that undefined variable there for a moment and instead move to registration.

Registration happens in a similar fashion to entities. We create an instance of the associated singleton class `BlockEntityType<?>` and register it to the block entity type registry, like so:

```java
public static final DeferredRegister<BlockEntityType<?>> BLOCK_ENTITY_TYPES =
        DeferredRegister.create(Registries.BLOCK_ENTITY_TYPE, ExampleMod.MOD_ID);

public static final Supplier<BlockEntityType<MyBlockEntity>> MY_BLOCK_ENTITY =
        BLOCK_ENTITY_TYPES.register(
                "my_block_entity",
                // The block entity type, created using a builder.
                () -> BlockEntityType.Builder.of(
                        // The supplier to use for constructing the block entity instances.
                        MyBlockEntity::new,
                        // A vararg of blocks that can have this block entity.
                        // This assumes the existence of the referenced blocks as DeferredBlock<Block>s.
                        MyBlocks.MY_BLOCK_1, MyBlocks.MY_BLOCK_2
                )
                // Build using null; vanilla does some datafixer shenanigans with the parameter that we don't need.
                .build(null);
        );
```

Now that we have our block entity type, we can use it in place of the `type` variable we left earlier:

```java
public class MyBlockEntity extends BlockEntity {
    public MyBlockEntity(BlockPos pos, BlockState state) {
        super(MY_BLOCK_ENTITY.get(), pos, state);
    }
}
```

Finally, we need to modify the block class associated with the block entity. This means that we will not be able to attach block entities to simple instances of `Block`, instead, we need a subclass:

```java
// The important part is implementing the EntityBlock interface and overriding the #newBlockEntity method.
public class MyEntityBlock extends Block implements EntityBlock {
    // Constructor deferring to super.
    public MyEntityBlock(BlockBehaviour.Properties properties) {
        super(properties);
    }

    // Return a new instance of our block entity here.
    @Override
    public BlockEntity newBlockEntity(BlockPos pos, BlockState state) {
        return new MyBlockEntity(pos, state);
    }
}
```

And then, you of course need to use this class as the type in your block registration.

:::info
The reason for this rather confusing setup process is that `BlockEntityType.Builder#of` expects a `BlockEntityType.BlockEntitySupplier<T extends BlockEntity>`, which is basically a `BiFunction<BlockPos, BlockState, T extends BlockEntity>`. As such, having a constructor we can directly reference using `::new` is highly beneficial. However, we also need to provide the constructed block entity type to the default and only constructor of `BlockEntity`, so we need to pass references around a bit.
:::

## Storing Data

One of the main purposes of `BlockEntity`s is to store data. Data storage on block entities can happen in two ways: directly reading and writing [NBT][nbt], or using [data attachments][dataattachments]. This section will cover reading and writing NBT directly; for data attachments, please refer to the linked article.

Data can be read from and written to a `CompoundTag` using the `#loadAdditional` and `#saveAdditional` methods, respectively. These methods are called when the block entity is synced to disk or over the network.

```java
public class MyBlockEntity extends BlockEntity {
    // This can be any value of any type you want, so long as you can somehow serialize it to NBT.
    // We will use an int for the sake of example.
    private int value;

    public MyBlockEntity(BlockPos pos, BlockState state) {
        super(MY_BLOCK_ENTITY.get(), pos, state);
    }

    // Read values from the passed CompoundTag here.
    @Override
    public void loadAdditional(CompoundTag tag, HolderLookup.Provider registries) {
        super.loadAdditional(tag, registries);
        value = tag.getInt("value");
    }

    // Save values into the passed CompoundTag here.
    @Override
    public void saveAdditional(CompoundTag tag, HolderLookup.Provider registries) {
        super.saveAdditional(tag, registries);
        tag.putInt("value", value);
    }
}
```

In both methods, it is important that you call super, as that adds basic information such as the position. The tag names `id`, `x`, `y`, `z`, `NeoForgeData` and `neoforge:attachments` are reserved by the super methods, and as such, you should not use them yourself.

:::info
It is expected that Mojang will adapt the [Data Components][datacomponents] system to also work with block entities sometime during the next few updates. Once that happens, both saving to NBT and data attachments will be removed in favor of data components.
:::

## Ticking `BlockEntities`

If you need a ticking `BlockEntity`, for example to keep track of the progress during a smelting process, another method must be implemented and overridden within `EntityBlock`: `EntityBlock#getTicker(Level, BlockState, BlockEntityType)`. This can implement different tickers depending on which logical side the user is on, or just implement one general ticker. In either case, a `BlockEntityTicker` must be returned. Since this is a functional interface, it can just take in a method representing the ticker instead:

```java
// Inside some Block subclass
@Nullable
@Override
public <T extends BlockEntity> BlockEntityTicker<T> getTicker(Level level, BlockState state, BlockEntityType<T> type) {
  return type == MyBlockEntityTypes.MYBE.get() ? MyBlockEntity::tick : null;
}

// Inside MyBlockEntity
public static void tick(Level level, BlockPos pos, BlockState state, MyBlockEntity blockEntity) {
  // Do stuff
}
```

:::note
This method is called each tick; therefore, you should avoid having complicated calculations in here. If possible, you should make more complex calculations every X ticks. (The amount of ticks in a second may be lower then 20 (twenty) but won't be higher)
:::

## Synchronizing the Data to the Client

There are three ways of syncing data to the client: synchronizing on chunk load, on block updates, and with a custom network message.

### Synchronizing on LevelChunk Load

For this you need to override
```java
BlockEntity#getUpdateTag(HolderLookup.Provider registries)

IBlockEntityExtension#handleUpdateTag(CompoundTag tag, HolderLookup.Provider registries)
```

The first method collects the data that should be sent to the client while the second one processes that data. If your `BlockEntity` doesn't contain much data, you might be able to use the methods out of the [Storing Data within your `BlockEntity`][storing-data] section.

:::caution
Synchronizing excessive/useless data for block entities can lead to network congestion. You should optimize your network usage by sending only the information the client needs when the client needs it. For instance, it is more often than not unnecessary to send the inventory of a block entity in the update tag, as this can be synchronized via its [`AbstractContainerMenu`][menu].
:::

### Synchronizing on Block Update

This method is a bit more complicated, but again you just need to override two or three methods. Here is a tiny example implementation of it:

```java
// In some subclass of BlockEntity
@Override
public CompoundTag getUpdateTag(HolderLookup.Provider registries) {
  CompoundTag tag = new CompoundTag();
  //Write your data into the tag
  return tag;
}

@Override
public Packet<ClientGamePacketListener> getUpdatePacket() {
  // Will get tag from #getUpdateTag
  return ClientboundBlockEntityDataPacket.create(this);
}

// Can override IBlockEntityExtension#onDataPacket. By default, this will defer to  BlockEntity#loadWithComponents.
```
The static constructors `ClientboundBlockEntityDataPacket#create` takes:

- The `BlockEntity`.
- An optional function to get the `CompoundTag` from the `BlockEntity` and a `RegistryAccess`. By default, this uses `BlockEntity#getUpdateTag`.

Now, to send the packet, an update notification must be given on the server.

```java
Level#sendBlockUpdated(BlockPos pos, BlockState oldState, BlockState newState, int flags)
```

- The `pos` should be your `BlockEntity`'s position.
- For `oldState` and `newState`, you can pass the current `BlockState` at that position.
- `flags` is a bitmask that should contain `2`, which will sync the changes to the client. See `Block` for more info as well as the rest of the flags. The flag `2` is equivalent to `Block#UPDATE_CLIENTS`.

### Synchronizing Using a Custom Network Message

This way of synchronizing is probably the most complicated but is usually the most optimized, as you can make sure that only the data you need to be synchronized is actually synchronized. You should first check out the [`Networking`][networking] section and especially [`PayloadRegistrar`][payload] before attempting this. Once you've created your custom network message, you can send it to all users that have the `BlockEntity` loaded with `PacketDistrubtor#sendToPlayersTrackingChunk`.

:::caution
It is important that you do safety checks, the `BlockEntity` might already be destroyed/replaced when the message arrives at the player! You should also check if the chunk is loaded (`Level#hasChunkAt(BlockPos)`).
:::

[blockstates]: ../blocks/states.md
[dataattachments]: ../datastorage/attachments.md
[datacomponents]: ../items/datacomponents.md
[nbt]: ../datastorage/nbt.md
[menu]: ../gui/menus.md
[networking]: ../networking/index.md
[payload]: ../networking/payload.md
[registration]: ../concepts/registries.md#methods-for-registering
[storing-data]: #storing-data-within-your-blockentity
