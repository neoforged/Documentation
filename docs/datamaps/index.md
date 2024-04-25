# 数据映射

注册表数据映射包含可附加到注册表对象的数据驱动、可重载的对象。
这个系统允许更容易地数据驱动游戏行为，因为它们提供了如同步或冲突解决等功能，从而带来更好、更可配置的用户体验。

你可以将标签看作注册表对象 ➜ 布尔映射，而数据映射则是更灵活的注册表对象 ➜ 对象映射。

数据映射可以附加到静态的内置注册表和动态的数据驱动的数据包注册表上。

数据映射支持通过使用 `/reload` 命令或任何其他重新加载服务器资源的方法来重新加载。

## 注册
数据映射类型应该静态创建，然后注册到 `RegisterDataMapTypesEvent`（在 [mod事件总线](../concepts/events)上触发）。`DataMapType` 可以使用 `DataMapType$Builder` 通过 `DataMapType#builder` 创建。

构建器提供了一个 `synced` 方法，可以用来标记数据映射为同步并将其发送给客户端。

一个简单的 `DataMapType` 有两个泛型参数：`R`（数据映射所针对的注册表的类型）和 `T`（被附加的值）。因此，可以将附加到 `Item` 的 `SomeObject` 的数据映射表示为 `DataMapType<Item, SomeObject>`。

数据映射使用 [编解码器](../datastorage/codecs.md) 进行序列化和反序列化。

以以下表示数据映射值的记录为例：
```java
public record DropHealing(
        float amount, float chance
) {
    public static final Codec<DropHealing> CODEC = RecordCodecBuilder.create(in -> in.group(
            Codec.FLOAT.fieldOf("amount").forGetter(DropHealing::amount),
            Codec.floatRange(0, 1).fieldOf("chance").forGetter(DropHealing::chance)
    ).apply(in, DropHealing::new));
}
```

:::warning
值 (`T`) 应为 *不可变* 对象，否则如果对象附加到标签内的所有条目，则可能导致奇怪的行为（因为不会创建副本）。
:::

为了本例的目的，我们将使用此数据映射在玩家丢弃物品时治疗玩家。
`DataMapType` 可以这样创建：
```java
public static final DataMapType<Item, DropHealing> DROP_HEALING = DataMapType.builder(
        new ResourceLocation("mymod:drop_healing"), Registries.ITEM, DropHealing.CODEC
).build();
```
然后使用 `RegisterDataMapTypesEvent#register` 注册到 `RegisterDataMapTypesEvent`。

## 同步
同步的数据映射将会将其值同步到客户端。可以使用 `DataMapType$Builder#synced(Codec<T> networkCodec, boolean mandatory)` 标记数据映射为同步。  
然后将使用 `networkCodec` 同步数据映射的值。  
如果 `mandatory` 标志设置为 `true`，则不支持数据映射的客户端（包括 Vanilla 客户端）将无法连接到服务器，反之亦然。另一方面，非强制性的数据映射是可选的，因此它不会阻止任何客户端加入。

:::tip
单独的网络编解码器允许包大小更小，因为你可以选择发送哪些数据以及以什么格式发送。否则可以使用默认编解码器。
:::

## JSON结构和位置
数据映射从位于 `mapNamespace/data_maps/registryNamespace/registryPath/mapPath.json` 的JSON文件加载，其中：
- `mapNamespace` 是数据映射ID的命名空间
- `mapPath` 是数据映射ID的路径
- `registryNamespace` 是注册表ID的命名空间；如果命名空间是 `minecraft`，则此值将被省略
- `registryPath` 是注册表ID的路径

更多信息，请[查看专用页面](./structure.md)。

## 使用
由于数据映射可以用于任何注册表，因此可以通过 `Holder` 查询它们，而不是通过实际的注册表对象。
你可以使用 `Holder#getData(DataMapType)` 查询数据映射值。如果该对象没有附加值，方法将返回 `null`。

:::note
只有引用持有者会在该方法中返回值。`直接` 持有者 **不会**。通常，你只会遇到引用持有者（它们由 `Registry#wrapAsHolder`、`Registry#getHolder` 或不同的 `builtInRegistryHolder` 方法返回）。
:::

为了继续上面的示例，我们可以如下实现我们预期的行为：
```java
public static void onItemDrop(final ItemTossEvent event) {
    final ItemStack stack = event.getEntity().getItem();
    // ItemStack 有一个 getItemHolder 方法，它将返回一个指向堆叠物的物品的 Holder<Item>
    //高亮下一行
    final DropHealing value = stack.getItemHolder().getData(DROP_HEALING);
    // 由于 getData 如果物品没有附加 drop healing 值将返回 null，我们保护它不为 null
    if (value != null) {
        // 这里我们简单地使用值
        if (event.getPlayer().level().getRandom().nextFloat() > value.chance()) {
            event.getPlayer().heal(value.amount());
        }
    }
}
```

## 高级数据映射
高级数据映射是具有额外功能的数据映射。即，通过移除器合并值和选择性地移除它们的能力。对于值类似于集合（如 `Map` 或 `List`）的数据映射，强烈推荐实现某种形式的合并和移除器。

`AdvancedDataMapType` 除了 `T` 和 `R` 之外还有一个泛型：`VR extends DataMapValueRemover<R, T>`。这个额外的泛型允许你通过提高类型安全性来生成移除对象。

### 创建
你可以使用 `AdvancedDataMapType#builder` 创建 `AdvancedDataMapType`。与普通构建器不同，该方法返回的构建器将有两个额外的方法（`merger` 和 `remover`），并且它将返回一个 `AdvancedDataMapType`。注册方法保持不变。

### 合并器
高级数据映射可以通过 `AdvancedDataMapType#merger` 提供一个 `DataMapValueMerger`。这个合并器将用于处理尝试将值附加到同一对象的数据包之间的冲突。
合并器将给出两个冲突的值及其来源（作为 `Either<TagKey<R>, ResourceKey<R>>`，因为值可以附加到标签内的所有条目，而不仅仅是个别条目），并期望返回实际附加的值。
通常，合并器应简单地合并值，并且除非必要（即如果合并不可能），否则不应执行“硬”覆盖。如果一个包想要绕过合并器，它可以通过指定对象级别的 `replace` 字段来实现。

假设我们有一个将整数附加到物品的数据映射的情况：
```java
public class IntMerger implements DataMapValueMerger<Item, Integer> {
    @Override
    public Integer merge(Registry<Item> registry, Either<TagKey<Item>, ResourceKey<Item>> first, Integer firstValue, Either<TagKey<Item>, ResourceKey<Item>> second, Integer secondValue) {
        //高亮下一行
        return firstValue + secondValue;
    }
}
```
如果两个数据包附加到同一对象，则上述合并器将合并值。所以如果第一个包将值 `12` 附加到 `minecraft:carrot`，第二个包将值 `15` 附加到 `minecraft:carrot`，最终的值将是 `27`。然而，如果第二个包指定对象级别的 `replace` 字段，最终值将是 `15`，因为不会调用合并器。

NeoForge 为合并列表、集合和映射提供了一些默认的合并器，位于 `DataMapValueMerger` 中。

默认合并器（`DataMapValueMerger#defaultMerger`）具有你期望的普通数据包的典型行为，其中最新的值（来自最高的数据包）将覆盖之前的值。

### 移除器
高级数据映射可以通过 `AdvancedDataMapType#remover` 提供一个 `DataMapValueRemover`。移除器将允许选择性地移除数据映射值，有效地进行分解。
虽然默认情况下一个数据包只能移除附加到注册表条目的整个对象，但有了移除器，它可以只从附加对象中移除特定的值（即，在映射的情况下，只移除具有给定键的项，或在列表的情况下，只移除具有特定属性的项）。

传递给构建器的编解码器将解码移除器实例。然后这些移除器将给出当前附加的值及其来源，并期望创建一个新对象来替换旧值。
或者，一个空的 `Optional` 将导致值被完全移除。

一个从基于 `Map` 的数据映射中移除具有特定键的值的移除器示例：
```java
public record MapRemover(String key) implements DataMapValueRemover<Item, Map<String, String>> {
    public static final Codec<MapRemover> CODEC = Codec.STRING.xmap(MapRemover::new, MapRemover::key);
    
    @Override
    public Optional<Map<String, String>> remove(Map<String, String> value, Registry<Item> registry, Either<TagKey<Item>, ResourceKey<Item>> source, Item object) {
        final Map<String, String> newMap = new HashMap<>(value);
        newMap.remove(key);
        return Optional.of(newMap);
    }
}
```

考虑到上述移除器，我们将字符串映射到物品的字符串。考虑以下数据映射 JSON 文件：
```js
{
    "values": {
        //高亮开始
        "minecraft:carrot": {
            "somekey1": "value1",
            "somekey2": "value2"
        }
        //高亮结束
    }
}
```
该文件将映射 `[somekey1=value1, somekey2=value2]` 附加到 `minecraft:carrot` 物品。现在，另一个数据包可以在其上面移除具有 `somekey1` 键的值，如下所示：
```js
{
    "remove": {
        // 由于移除器被解码为字符串，我们可以在这里使用字符串作为值。如果它被解码为对象，我们将需要使用一个对象。
        //高亮下一行
        "minecraft:carrot": "somekey1"
    }
}
```
在读取和应用第二个数据包后，附加到 `minecraft:carrot` 物品的新值将是 `[somekey2=value2]`。

## 数据生成
数据映射可以通过 `DataMapProvider` [生成](../datagen)。
你应该扩展这个类，然后覆盖 `generate` 方法来创建你的条目，类似于标签生成。

考虑到起始的掉落治疗示例，我们可以如下生成一些值：
```java
public class DropHealingGen extends DataMapProvider {

    public DropHealingGen(PackOutput packOutput, CompletableFuture<HolderLookup.Provider> lookupProvider) {
        super(packOutput, lookupProvider);
    }

    @Override
    protected void gather() {
        // 在下面的示例中，我们不需要强制替换任何值，因为默认行为是没有提供合并器，所以第三个参数可以是 false。

        // 如果你为你的数据映射提供了合并器，那么第三个参数将导致旧值被覆盖（如果设置为 true），而不调用合并器
        builder(DROP_HEALING)
                // 始终给掉落任何 minecraft:fox_food 标签项的实体 12 心
                .add(ItemTags.FOX_FOOD, new DropHealing(12, 1f), false)
                // 有 10% 的几率治疗掉落金合欢船的实体一点
                .add(Items.ACACIA_BOAT.builtInRegistryHolder(), new DropHealing(1, 0.1f), false);
    }
}
```

:::tip
如果你想将值附加到可选依赖项添加的对象，有 `add` 重载接受原始 `ResourceLocation`。在这种情况下，你还应该通过 var-args 参数提供[一个加载条件](../resources/server/conditional)，以避免崩溃。
:::
