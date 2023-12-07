# Data Attachments

The data attachment system allows mods to attach and store additional data on block entities, chunks, entities, and item stacks.

_To store additional level data, you can use [SavedData](saveddata)._

## Creating an attachment type

To use the system, you need to register an `AttachmentType`.
The attachment type contains:
- a default value supplier to create the instance when the data is first accessed, or to compare stacks that have the data and stacks that don't have it;
- an optional serializer if the attachment should be persisted;
- additional configuration options for the attachment, for example the `copyOnDeath` flag.

:::danger
If you don't provide a serializer, the attachment will not be saved to disk.
If your data attachment disappears when you reload the world, you probably forgot to provide a serializer.
:::

There are a few ways to provide an attachment serializer: directly implementing `IAttachmentSerializer`, implementing `INBTSerializable` and using the static `AttachmentSerializer.serializable()` method to create the builder, or providing a codec to the builder. (This latter option is not recommended for item stacks due to relatively slowness).

In any case, we recommend using a `DeferredRegister` for registration:
```java
// Create the DeferredRegister for attachment types
private static final DeferredRegister<AttachmentType<?>> ATTACHMENT_TYPES = DeferredRegister.create(NeoForgeRegistries.Keys.ATTACHMENT_TYPES, MOD_ID);

// Serialization via INBTSerializable
private static final Supplier<AttachmentType<ItemStackHandler>> HANDLER = ATTACHMENT_TYPES.register(
        "handler", () -> AttachmentType.serializable(() -> new ItemStackHandler(1)).build());
// Serialization via codec
private static final Supplier<AttachmentType<Integer>> MANA = ATTACHMENT_TYPES.register(
        "mana", () -> AttachmentType.builder(() -> 0).serialize(Codec.INT).build());
// No serialization
private static final Supplier<AttachmentType<SomeCache>> SOME_CACHE = ATTACHMENT_TYPES.register(
        "some_cache", () -> AttachmentType.builder(() -> new SomeCache()).build()
);

// Don't forget to register the DeferredRegister to your mod bus:
ATTACHMENT_TYPES.register(modBus);
```

## Using the attachment type

Once the attachment type is registered, it can be used on any holder object.
Calling `getData` if no data is present will attach a new default instance.

```java
// Get the ItemStackHandler if it already exists, else attach a new one:
ItemStackHandler stackHandler = stack.getData(HANDLER);
// Get the current player mana if it is available, else attach 0:
int playerMana = player.getData(MANA);
// And so on...
```

If attaching a default instance is not desired, a `hasData` check can be added:
```java
// Check if the stack has the HANDLER attachment before doing anything.
if (stack.hasData(HANDLER)) {
    ItemStackHandler stackHandler = stack.getData(HANDLER);
    // Do something with stack.getData(HANDLER).
}
```

The data can also be updated with `setData`:
```java
// Increment mana by 10.
player.setData(MANA, player.getData(MANA) + 10);
```

Usually, block entities and chunks need to be marked as dirty when they are modified (with `setChanged` and `setUnsaved(true)`). This is done automatically for calls to `setData`:
```java
chunk.setData(MANA, chunk.getData(MANA) + 10); // will call setUnsaved automatically
```
but if you modify some data that you obtained from `getData` then you must mark block entities and chunks as dirty explicitly:
```java
var mana = chunk.getData(MUTABLE_MANA);
mana.set(10);
chunk.setUnsaved(true); // must be done manually because we did not use setData
```

## Sharing data with the client
Currently, only serializable item stack attachments are synced with the client.
This is done automatically.

To sync block entity, chunk, or entity attachments, you need to [send a packet to the client][network] yourself.

## Copying data on player death
By default, entity data attachments are not copied on player death.
To automatically copy an attachment on player death, set `.copyOnDeath()` in the attachment builder.

More complex handling can be implemented via `PlayerEvent.Clone` by reading the data from the original entity and assigning it to the new entity. In this event, the `#isWasDeath` method can be used to distinguish between respawning after death and returning from the End. This is important because the data will already exist when returning from the End, so care has to be taken to not duplicate values in this case.

[network]: ../networking/index.md