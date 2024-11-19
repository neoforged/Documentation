---
sidebar_position: 2
---
# Data and Networking

One of the most important use cases of entities is to store data of some sort. All entities store some default data, such as their type and their position. This article will explain how to add your own data, as well as how to synchronize that data.

The most simple way to add data is as a field in your `Entity` class. You can then interact with this data in any way you wish. However, this quickly becomes very annoying as soon as you have to synchronize that data.

As such, vanilla introduces a few systems to help with that. These systems generally exist in parallel and can be replaced with one another, this is due to legacy reasons.

## `SynchedEntityData`

`SynchedEntityData` is a system used for both storing and syncing values over the network. It is split into three classes:

- `EntityDataSerializer`s are basically wrappers around a [`StreamCodec`][streamcodec].
    - They are a registry, meaning that if you want to add new `EntityDataSerializer`s, they must be added by [registration].
    - Minecraft defines various default `EntityDataSerializer`s in the `EntityDataSerializers` class.
- `EntityDataAccessor`s are held by the entity and used to get and set the data values.
- `SynchedEntityData` itself holds all `EntityDataAccessor`s for an entity, and automatically calls on the `EntityDataSerializer`s to sync values as needed.

To get started, create an `EntityDataAccessor` in your entity class:

```java
public class MyEntity extends Entity {
    // The generic type must match the one of the second parameter below.
    public static final EntityDataAccessor<Integer> MY_DATA =
        SynchedEntityData.defineId(
            // The class of the entity.
            MyEntity.class,
            // The entity data accessor type.
            EntityDataSerializers.INT
        );
}
```

We must then define default values in the `defineSynchedData` method, like so:

```java
public class MyEntity extends Entity {
    public static final EntityDataAccessor<Integer> MY_DATA = SynchedEntityData.defineId(MyEntity.class, EntityDataSerializers.INT);

    @Override
    protected void defineSynchedData(SynchedEntityData.Builder builder) {
        // Our default value is zero.
        builder.define(MY_DATA, 0);
    }
}
```

Finally, we can get and set entity data like so (assuming we're in a method within `MyEntity`):

```java
int data = this.getEntityData().get(MY_DATA);
this.getEntityData().set(MY_DATA, 1);
```

## `readAdditionalSaveData` and `addAdditionalSaveData`

This method works by loading/saving your values from/to an [NBT tag][nbt], like so:

```java
// Assume that an `int data` exists in the class.
@Override
protected void readAdditionalSaveData(CompoundTag tag) {
    this.data = tag.getInt("my_data");
}

@Override
protected void addAdditionalSaveData(CompoundTag tag) {
    tag.putInt("my_data", this.data);
}
```

## Custom Spawn Data

In some cases, there is custom data needed for your entity on the client when it is spawned, but that same data doesn't change over time. When this is the case, you can implement the `IEntityWithComplexSpawn` interface on your entity and use its two methods `#writeSpawnData` and `#readSpawnData` to write/read data to/from the network buffer.

Additionally, you can send your own packets upon spawning. To do so, override `IEntityExtension#sendPairingData` and send your packets there like any other packet. Please refer to the [Networking articles][networking] for more information.

## Custom Network Messages

Of course, you can also always opt to use a custom packet to send additional information when needed. Please refer to the [Networking articles][networking] for more information.

[nbt]: ../datastorage/nbt.md
[networking]: ../networking/index.md
[registration]: ../concepts/registries.md#methods-for-registering
[streamcodec]: ../networking/streamcodecs.md
