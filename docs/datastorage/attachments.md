# 数据附件

数据附件系统允许模组在方块实体、区块、实体和物品堆叠上附加和存储额外数据。

_要存储额外的关卡数据，您可以使用 [SavedData](saveddata)。_

## 创建附件类型

要使用系统，您需要注册一个 `AttachmentType`。
附件类型包含以下配置：
- 当数据第一次被访问时创建实例的默认值供应器。也用于比较有数据的堆叠和没有数据的堆叠。
- 如果附件需要持久化，则需要一个可选的序列化器。
- （如果配置了序列化器）`copyOnDeath` 标志，用于在死亡时自动复制实体数据（见下文）。
- （高级）（如果配置了序列化器）自定义 `comparator`，用于检查两个物品堆叠的数据是否相同。

:::tip
如果您不希望您的附件持久化，不要提供序列化器。
:::

有几种方法提供附件序列化器：直接实现 `IAttachmentSerializer`，实现 `INBTSerializable` 并使用静态的 `AttachmentSerializer.serializable()` 方法创建构建器，或向构建器提供编解码器。

:::warning
避免使用编解码器序列化物品堆叠附件，因为它相对较慢。
:::

无论哪种方式，附件 **必须被注册** 到 `NeoForgeRegistries.ATTACHMENT_TYPES` 注册表中。以下是一个示例：
```java
// 为附件类型创建 DeferredRegister
private static final DeferredRegister<AttachmentType<?>> ATTACHMENT_TYPES = DeferredRegister.create(NeoForgeRegistries.ATTACHMENT_TYPES, MOD_ID);

// 通过 INBTSerializable 序列化
private static final Supplier<AttachmentType<ItemStackHandler>> HANDLER = ATTACHMENT_TYPES.register(
        "handler", () -> AttachmentType.serializable(() -> new ItemStackHandler(1)).build());
// 通过编解码器序列化
private static final Supplier<AttachmentType<Integer>> MANA = ATTACHMENT_TYPES.register(
        "mana", () -> AttachmentType.builder(() -> 0).serialize(Codec.INT).build());
// 无序列化
private static final Supplier<AttachmentType<SomeCache>> SOME_CACHE = ATTACHMENT_TYPES.register(
        "some_cache", () -> AttachmentType.builder(() -> new SomeCache()).build()
);

// 在您的 mod 构造函数中，不要忘记将 DeferredRegister 注册到您的 mod 总线：
ATTACHMENT_TYPES.register(modBus);
```

## 使用附件类型

一旦附件类型注册后，它可以在任何持有对象上使用。
如果没有数据，调用 `getData` 将附加一个新的默认实例。

```java
// 如果已存在 ItemStackHandler，则获取它，否则附加一个新的：
ItemStackHandler stackHandler = stack.getData(HANDLER);
// 获取当前玩家的法力值（如果有），否则附加 0：
int playerMana = player.getData(MANA);
// 等等...
```

如果不希望附加一个默认实例，可以添加一个 `hasData` 检查：
```java
// 检查堆叠是否有 HANDLER 附件，然后再进行任何操作。
if (stack.hasData(HANDLER)) {
    ItemStackHandler stackHandler = stack.getData(HANDLER);
    // 对 stack.getData(HANDLER) 做些什么。
}
```

数据也可以用 `setData` 更新：
```java
// 将法力值增加 10。
player.setData(MANA, player.getData(MANA) + 10);
```

:::important
通常，当修改方块实体和区块时需要将其标记为脏数据（使用 `setChanged` 和 `setUnsaved(true)`）。这对于 `setData` 的调用是自动完成的：
```java
chunk.setData(MANA, chunk.getData(MANA) + 10); // 将自动调用 setUnsaved
```
但如果您修改了从 `getData` 获取的数据（包括新创建的默认实例），则必须显式地将方块实体和区块标记为脏数据：
```java
var mana = chunk.getData(MUTABLE_MANA);
mana.set(10);
chunk.setUnsaved(true); // 必须手动完成，因为我们没有使用 setData
```
:::

## 与客户端共享数据
目前，只有可序列化的物品堆叠附件在客户端和服务器之间同步。
这是自动完成的。

要将方块实体、区块或实体附件同步到客户端，你需要自己[向客户端发送数据包][network]。
对于区块，您可以使用 `ChunkWatchEvent.Sent` 来知道何时向玩家发送区块数据。

## 在玩家死亡时复制数据
默认情况下，实体数据附件在玩家死亡时不会被复制。
要在玩家死亡时自动复制附件，请在附件构建器中设置 `.copyOnDeath()`。

更复杂的处理可以通过 `PlayerEvent.Clone` 实现，通过从原始实体中读取数据并将其分配给新实体。在此事件中，可以使用 `#isWasDeath` 方法区分死亡后重生和从末地返回。这很重要，因为从末地返回时数据已经存在，因此要注意在这种情况下不要重复值。

例如：
```java
NeoForge.EVENT_BUS.register(PlayerEvent.Clone.class, event -> {
    if (event.isWasDeath() && event.getOriginal().hasData(MY_DATA)) {
        event.getEntity().getData(MY_DATA).fieldToCopy = event.getOriginal().getData(MY_DATA).fieldToCopy;
    }
});
```

[network]: ../networking/index.md
