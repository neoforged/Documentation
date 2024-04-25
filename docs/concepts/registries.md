# 注册

注册是将模组中的对象（如[物品][item]、[方块][block]、实体等）加入游戏并使其被游戏识别的过程。注册这些对象非常重要，因为如果不注册，游戏将无法识别这些对象，这将导致无法解释的行为和崩溃。

简而言之，注册表是围绕映射注册名称（下面将说明）到注册对象的映射的封装，这些注册对象通常称为注册表项。注册名在同一注册表中必须唯一，但同一注册名可以出现在多个注册表中。最常见的例子是方块（在`BLOCKS`注册表中）具有与其同名的物品形式（在`ITEMS`注册表中）。

每个注册对象都有一个唯一的名称，称为其注册名称。名称表示为[`ResourceLocation`][resloc]。例如，泥土方块的注册名称为`minecraft:dirt`，僵尸的注册名称为`minecraft:zombie`。当然，模组化对象不会使用`minecraft`命名空间；而是使用它们的模组ID。

## 原版与模组化

为了理解NeoForge的注册系统中所做的一些设计决策，我们首先看看Minecraft是如何处理这一问题的。我们将使用方块注册表作为例子，因为大多数其他注册表的工作方式相同。

注册表通常注册[单例][singleton]。这意味着所有注册表项实际上只存在一次。例如，你在游戏中看到的所有石块实际上都是同一个石块，被多次显示。如果你需要石块，可以通过引用已注册的方块实例来获取它。

Minecraft在`Blocks`类中注册所有方块。通过`register`方法，调用`Registry#register()`，其中第一个参数是方块注册表`BuiltInRegistries.BLOCK`。所有方块注册完成后，Minecraft会根据方块列表进行各种检查，例如验证所有方块是否已加载模型的自检。

这一切之所以能够工作，是因为`Blocks`类在Minecraft中足够早地被类加载。模组并不会被Minecraft自动类加载，因此需要一些变通方法。

## 注册方法

NeoForge提供了两种注册对象的方式：`DeferredRegister`类和`RegisterEvent`。请注意，前者是后者的封装，并且为了防止错误，推荐使用。

### `DeferredRegister`

我们首先创建我们的`DeferredRegister`：

```java
public static final DeferredRegister<Block> BLOCKS = DeferredRegister.create(
        // 我们想要使用的注册表。
        // Minecraft的注册表可以在BuiltInRegistries中找到，NeoForge的注册表可以在NeoForgeRegistries中找到。
        // 模组也可以添加它们自己的注册表，具体请参考各个模组的文档或源代码。
        BuiltInRegistries.BLOCKS,
        // 我们的模组ID。
        ExampleMod.MOD_ID
);
```

然后，我们可以将我们的注册表项添加为静态最终字段（有关在`new Block()`中添加什么参数，请参阅[关于方块的文章][block]）：

```java
public static final DeferredHolder<Block, Block> EXAMPLE_BLOCK = BLOCKS.register(
        "example_block" // 我们的注册名称。
        () -> new Block(...) // 我们想要注册的对象的供应商。
);
```

`DeferredHolder<R, T extends R>`类持有我们的对象。类型参数`R`是我们正在注册到的注册表的类型（在这个例子中是`Block`）。类型参数`T`是我们供应商的类型。由于我们在这个例子中直接注册了一个`Block`，我们提供了`Block`作为第二个参数。如果我们

要注册一个`Block`的子类的对象，例如`SlabBlock`，我们将在此提供`SlabBlock`。

`DeferredHolder<R, T extends R>`是`Supplier<T>`的子类。当我们需要时可以调用`DeferredHolder#get()`来获取我们注册的对象。`DeferredHolder`扩展`Supplier`的事实也允许我们使用`Supplier`作为我们字段的类型。这样，上面的代码块变为以下内容：

```java
public static final Supplier<Block> EXAMPLE_BLOCK = BLOCKS.register(
        "example_block" // 我们的注册名称。
        () -> new Block(...) // 我们想要注册的对象的供应商。
);
```

请注意，有些地方明确要求使用`Holder`或`DeferredHolder`，而不仅仅接受任何`Supplier`。如果你需要其中的两者之一，最好将你的`Supplier`的类型更改回`Holder`或`DeferredHolder`。

最后，由于整个系统是围绕注册事件的封装，我们需要告诉`DeferredRegister`根据需要将自己附加到注册事件上：

```java
// 这是我们的模组构造函数
public ExampleMod(IModEventBus bus) {
    // 高亮下一行
    ExampleBlocksClass.BLOCKS.register(bus);
    // 这里还有其他内容
}
```

:::info
有针对方块和物品的`DeferredRegister`的特化变体，它们提供辅助方法，分别称为[`DeferredRegister.Blocks`][defregblocks]和[`DeferredRegister.Items`][defregitems]。
:::

### `RegisterEvent`

`RegisterEvent`是注册对象的第二种方式。这个[事件][event]在模组构造函数之后（因为这是`DeferredRegister`注册它们内部事件处理器的地方）和加载配置之前为每个注册表触发。`RegisterEvent`在模组事件总线上触发。

```java
@SubscribeEvent
public void register(RegisterEvent event) {
    event.register(
            // 这是注册表的注册键。
            // 从BuiltInRegistries获取vanilla注册表的，
            // 或从NeoForgeRegistries.Keys获取NeoForge注册表的。
            BuiltInRegistries.BLOCKS,
            // 在这里注册你的对象。
            registry -> {
                registry.register(new ResourceLocation(MODID, "example_block_1"), new Block(...));
                registry.register(new ResourceLocation(MODID, "example_block_2"), new Block(...));
                registry.register(new ResourceLocation(MODID, "example_block_3"), new Block(...));
            }
    );
}
```

## 查询注册表

有时候，你可能会发现自己处于想要通过给定ID获取注册对象的情况，或者你想要获取某个注册对象的ID。由于注册表本质上是ID（`ResourceLocation`）到独立对象的映射，即可逆映射，这两种操作都是可行的：

```java
BuiltInRegistries.BLOCKS.get(new ResourceLocation("minecraft", "dirt")); // 返回泥土方块
BuiltInRegistries.BLOCKS.getKey(Blocks.DIRT); // 返回资源位置"minecraft:dirt"

// 假设ExampleBlocksClass.EXAMPLE_BLOCK.get()是具有ID"yourmodid:example_block"的Supplier<Block>
BuiltInRegistries.BLOCKS.get(new ResourceLocation("yourmodid", "example_block")); // 返回示例方块
BuiltInRegistries.BLOCKS.getKey(ExampleBlocksClass.EXAMPLE_BLOCK.get()); // 返回资源位置"yourmodid:example_block"
```

如果你只是想检查是否存在某个对象，这也是可能的，尽管只能用键：

```java
BuiltInRegistries.BLOCKS.containsKey(new ResourceLocation("minecraft", "dirt")); // true
BuiltInRegistries.BLOCKS.containsKey(new ResourceLocation("create", "brass_ingot")); // 如果安装了Create则为true
```

正如最后一个示例所示，这适用于任何模组ID，因此是检查另一个模组中是否存在某个物品的完美方式。

最后，我们还可以迭代注册表中的所有条目，无论是键还

是条目（条目使用Java的`Map.Entry`类型）：

```java
for (ResourceLocation id : BuiltInRegistries.BLOCKS.keySet()) {
    // ...
}
for (Map.Entry<ResourceLocation, Block> entry : BuiltInRegistries.BLOCKS.entrySet()) {
    // ...
}
```

:::note
查询操作始终使用vanilla `Registry`，而不是`DeferredRegister`。这是因为`DeferredRegister`只是注册工具。
:::

:::danger
查询操作只有在注册完成后才安全使用。**不要在注册仍在进行时查询注册表！**
:::

## 自定义注册表

自定义注册表允许你指定其他模组可能想要接入的附加系统。例如，如果你的模组要添加效果，你可以使效果成为一个注册表，从而允许其他模组添加效果到你的模组中，而无需你做任何其他事情。它还允许你自动执行一些操作，如同步条目。

让我们从创建[注册表键][resourcekey]和注册表本身开始：

```java
// 我们在这里使用效果作为注册表的例子，不涉及效果实际是什么（因为这不重要）。
// 当然，所有提到的效果都可以并且应该替换为你的注册表实际是什么。
public static final ResourceKey<Registry<Spell>> SPELL_REGISTRY_KEY = ResourceKey.createRegistryKey(new ResourceLocation("yourmodid", "spells"));
public static final Registry<YourRegistryContents> SPELL_REGISTRY = new RegistryBuilder<>(SPELL_REGISTRY_KEY)
        // If you want to enable integer id syncing, for networking.
        // These should only be used in networking contexts, for example in packets or purely networking-related NBT data.
        .sync(true)
        // The default key. Similar to minecraft:air for blocks. This is optional.
        .defaultKey(new ResourceLocation("yourmodid", "empty"))
        // Effectively limits the max count. Generally discouraged, but may make sense in settings such as networking.
        .maxId(256)
        // Build the registry.
        .create();
```

然后，通过将注册表注册到 `NewRegistryEvent` 中的根注册表来告诉游戏注册表存在：

```java
@SubscribeEvent
static void registerRegistries(NewRegistryEvent event) {
    event.register(SPELL_REGISTRY);
}
```

现在，您可以像使用任何其他注册表一样，通过`DeferredRegister`和`RegisterEvent`注册新的注册表内容：
```java
public static final DeferredRegister<Spell> SPELLS = DeferredRegister.create("yourmodid", SPELL_REGISTRY);
public static final Supplier<Spell> EXAMPLE_SPELL = SPELLS.register("example_spell", () -> new Spell(...));

// Alternatively:
@SubscribeEvent
public static void register(RegisterEvent event) {
    event.register(SPELL_REGISTRY, registry -> {
        registry.register(new ResourceLocation("yourmodid", "example_spell"), () -> new Spell(...));
    });
}
```

# 数据包注册表

数据包注册表（也称为动态注册表或世界生成注册表）是一种特殊的注册表，它在世界加载时从数据包 JSON 文件中加载数据，而不是在游戏启动时加载。默认的数据包注册表主要包括大多数世界生成注册表和其他一些注册表。

数据包注册表允许通过 JSON 文件指定其内容。这意味着除了数据生成工具外，不需要任何代码（如果你不想自己编写 JSON 文件的话）。每个数据包注册表都有一个与之关联的编解码器（`Codec`），用于序列化，每个注册表的 ID 决定了其数据包路径：

- Minecraft 的数据包注册表使用格式 `data/yourmodid/registrypath`（例如 `data/yourmodid/worldgen/biomes`，其中 `worldgen/biomes` 是注册表路径）。
- 所有其他数据包注册表（NeoForge 或模组化的）使用格式 `data/yourmodid/registrynamespace/registrypath`（例如 `data/yourmodid/neoforge/loot_modifiers`，其中 `neoforge` 是注册表命名空间，`loot_modifiers` 是注册表路径）。

可以从 `RegistryAccess` 获取数据包注册表。如果在服务器上，可以通过调用 `ServerLevel#registryAccess()` 来检索此 `RegistryAccess`；如果在客户端，可以通过调用 `Minecraft.getInstance().connection#registryAccess()` 来检索（后者仅在实际连接到世界时有效，否则连接将为 null）。然后可以像使用任何其他注册表一样使用这些调用的结果来获取特定元素或遍历内容。

### 自定义数据包注册表

自定义数据包注册表不需要构建 `Registry`。相反，它们只需要一个注册表键和至少一个编解码器（`Codec`）来序列化和反序列化其内容。根据之前的法术示例，将我们的法术注册表注册为数据包注册表的过程如下所示：

```java
public static final ResourceKey<Registry<Spell>> SPELL_REGISTRY_KEY = ResourceKey.createRegistryKey(new ResourceLocation("yourmodid", "spells"));

@SubscribeEvent
public static void registerDatapackRegistries(DataPackRegistryEvent.NewRegistry event) {
    event.dataPackRegistry(
            // 注册表键。
            SPELL_REGISTRY_KEY,
            // 注册表内容的编解码器。
            Spell.CODEC,
            // 网络编解码器。通常与普通编解码器相同。
            // 可能是普通编解码器的简化版本，省略了客户端不需要的数据。
            // 可能为 null。如果为 null，则注册表条目根本不会同步到客户端。
            // 可以省略，这在功能上与传递 null 相同（调用了一个带有两个参数的方法重载，该重载向普通的三参数方法传递 null）。
            Spell.CODEC
    );
}
```

### 数据包注册表的数据生成

由于手工编写所有 JSON 文件既繁琐又容易出错，NeoForge 提供了一个数据提供器来为你生成 JSON 文件。这适用于内置的和你自己的数据包注册表。

首先，我们创建一个 `RegistrySetBuilder` 并向其添加条目（一个 `RegistrySetBuilder` 可以包含多个注册表的条目）：

```java
new RegistrySetBuilder()
    .add(Registries.CONFIGURED_FEATURE, bootstrap -> {
    // 通过引导上下文注册配置特性。
    })
    .add(Registries.PLACED_FEATURE, bootstrap -> {
    // 通过引导上下文注册放置特性。
    });
```

`bootstrap` lambda 参数是我们实际用来注册对象的。要注册一个对象，我们这样调用 `#register`：

```java
// 我们对象的资源键。
public static final ResourceKey<ConfiguredFeature<?, ?>> EXAMPLE_CONFIGURED_FEATURE = ResourceKey.create(
    Registries.CONFIGURED_FEATURE,
    new ResourceLocation(MOD_ID, "example_configured_feature

")
);

new RegistrySetBuilder()
    .add(Registries.CONFIGURED_FEATURE, bootstrap -> {
        bootstrap.register(
            // 我们配置特性的资源键。
            EXAMPLE_CONFIGURED_FEATURE,
            // 实际的配置特性。
            new ConfiguredFeature<>(Feature.ORE, new OreConfiguration(...))
        );
    })
    .add(Registries.PLACED_FEATURE, bootstrap -> {
    // ...
    });
```

如果需要，`BootstrapContext`（在 1.20.4 及以下版本中名称误写为 `BootstapContext`）还可以用来从另一个注册表查找条目：

```java
public static final ResourceKey<ConfiguredFeature<?, ?>> EXAMPLE_CONFIGURED_FEATURE = ResourceKey.create(
    Registries.CONFIGURED_FEATURE,
    new ResourceLocation(MOD_ID, "example_configured_feature")
);
public static final ResourceKey<PlacedFeature> EXAMPLE_PLACED_FEATURE = ResourceKey.create(
    Registries.PLACED_FEATURE,
    new ResourceLocation(MOD_ID, "example_placed_feature")
);

new RegistrySetBuilder()
    .add(Registries.CONFIGURED_FEATURE, bootstrap -> {
        bootstrap.register(EXAMPLE_CONFIGURED_FEATURE, ...);
    })
    .add(Registries.PLACED_FEATURE, bootstrap -> {
        HolderGetter<ConfiguredFeature<?, ?>> otherRegistry = bootstrap.lookup(Registries.CONFIGURED_FEATURE);
        bootstrap.register(EXAMPLE_PLACED_FEATURE, new PlacedFeature(
            otherRegistry.getOrThrow(EXAMPLE_CONFIGURED_FEATURE), // 获取配置特性
            List.of() // 放置发生时无操作 - 替换为你的放置参数
        ));
    });
```

最后，我们在实际的数据提供器中使用我们的 `RegistrySetBuilder` 并将该数据提供器注册到事件中：

```java
@SubscribeEvent
static void onGatherData(GatherDataEvent event) {
    event.getGenerator().addProvider(
        // 仅在生成服务器数据时运行数据包生成
        event.includeServer(),
        // 创建提供器
        output -> new DatapackBuiltinEntriesProvider(
            output,
            event.getLookupProvider(),
            // 我们的注册表集生成器来生成数据。
            new RegistrySetBuilder().add(...),
            // 我们正在生成的模组 ID 集合。通常只有你自己的模组 ID。
            Set.of("yourmodid")
        )
    );
}
```

[block]: ../blocks/index.md
[blockentity]: ../blockentities/index.md
[codec]: ../datastorage/codecs.md
[datagen]: #data-generation-for-datapack-registries
[datagenindex]: ../resources/index.md#data-generation
[datapack]: ../resources/server/index.md
[defregblocks]: ../blocks/index.md#deferredregisterblocks-helpers
[defregitems]: ../items/index.md#deferredregisteritems
[event]: ./events.md
[item]: ../items/index.md
[resloc]: ../misc/resourcelocation.md
[resourcekey]: ../misc/resourcelocation.md#resourcekeys
[singleton]: https://en.wikipedia.org/wiki/Singleton_pattern
