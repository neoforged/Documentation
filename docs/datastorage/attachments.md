The Attachments System
=====================

Data attachments allow storing and retrieving data on objects in an easy way.

NeoForge adds data attachment support to BlockEntities, Entities, ItemStacks and Chunks. This will be explained in more detail in the following sections.

Creating your own Attachment
----------------------------

Your attachment type has to be [registered][registry]. Attachments can be serializable, which means that they'll be saved and read from disk, when the objects leaves and enters the world. To serialize the attachment it has to either implement `INBTSerializable`, or you have to call `AttachmentType.Builder#serilize` with a `Codec` or an `IAttachmentSerializer`.

:::caution
`Codec`s shouldn't be used for Attachments on ItemStacks, as the serialization will happen often and Codecs are slower compared to the other options.
:::

`AttachmentType.Builder#copyOnDeath` can be called to persist the data across player respawns or entity transformations like Skeleton to Stray when in Powder Snow.

Using Attachment Data
--------------------------------------------

Unlike Levels, Entities, and ItemStacks, LevelChunks and BlockEntities are only written to disk when they have been marked as dirty. A attachment implementation with persistent state for a LevelChunk or a BlockEntity should therefore ensure that whenever its state changes, its owner is marked as dirty.

To get the attachment data you call `IAttachmentHolder#getData` on the object. It will either return the value present in the object or a new instance created by the defaultValueSupplier of the `AttachmentType`.
To set the attachment data you call `IAttachmentHolder#setData` on the object. Objects that have to be marked dirty, will have `setChanged` called on them to ensure no data loss.

Synchronizing Data with Clients
-------------------------------

By default, attachment data is not sent to clients. In order to change this, the mods have to manage their own synchronization code using packets.

There are three different situations in which you may want to send synchronization packets, all of them optional:

1. When the entity spawns in the level, or the block is placed, you may want to share the initialization-assigned values with the clients.
2. When the stored data changes, you may want to notify some or all of the watching clients.
3. When a new client starts viewing the entity or block, you may want to notify it of the existing data.

Refer to the [Networking][network] page for more information on implementing network packets.

[registry]: ../concepts/registries.md
[network]: ../networking/index.md
