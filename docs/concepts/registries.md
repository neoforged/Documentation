---
sidebar_position: 1
---
# 레지스트리

게임의 각 요소([아이템][item], [블록][block], 엔티티 등)들은 게임에 존재한다고 등록해야 제대로 작동합니다. 그렇지 않으면 게임은 새로 추가된 요소를 알지 못해 예기치 못한 동작을 하거나, 심하면 충돌할 수도 있습니다.

레지스트리는 위 요소들을 등록하는 곳입니다. 각 유형마다 저마다의 레지스트리가 있습니다; 아이템은 아이템 레지스트리가 있고, 블록은 블록 레지스트리가 있습니다. 레지스트리는 이름(아래 참조)을 등록된 객체로 대치시키는 일종의 맵이라고 볼 수 있습니다. 이름은 한 레지스트리 안에선 무조건 고유해야 하지만, 다른 레지스트리에선 같아도 됩니다. 대표적인 예로, 아이템을 가지는 블록은 블록 레지스트와 아이템 레지스트리에서의 이름이 동일합니다.

레지스트리에 등록되는 모든 객체들은 고유한 이름을 가집니다. 이 이름은 [`ResourceLocaiton`][resloc]으로 표현합니다. 예를 들어, 흙 블록의 레지스트리 이름은 `minecraft:dirt`이고, 좀비의 레지스트리 이름은 `minecraft:zombie` 입니다. 모드에서 추가한 요소는 당연히 `minecraft` 말고 다른 네임 스페이스를 사용해야 합니다; 대개 모드 아이디를 사용합니다.

## 바닐라 vs. 모드

네오 포지의 레지스트리 시스템을 이해하기 위해선 먼저 마인크래프트의 레지스트리를 살펴보아야 합니다. 블록 레지스트리를 예로 들겠지만, 다른 레지스트리들도 똑같이 동작합니다.

레지스트리에는 대개 [싱글턴][singleton] 객체를 등록합니다, 다시 말해서 레지스트리에 등록되는 모든 요소는 오직 하나만 존재합니다. 예를 들어, 게임에서 여러번 마주하는 돌 블록은 사실 하나의 돌 블록이 여러번 표시된 것입니다. 돌 블록을 사용하려면 이미 등록된 돌 블록을 참조해야 합니다.

마인크래프트는 모든 블록들을 `Blocks` 클래스에서 등록합니다. 내부적으로 `Registry#register()`를 호출해 각 블록들을 `BuiltInRegistries.BLOCK`에 등록하며, 이후 등록한 블록들이 올바른지, 다 모델은 가지고 있는지 등의 검사를 수행합니다. 

`Blocks` 클래스는 마인크래프트가 일찍 불러오기 때문에 문제 없이 동작하지만, 모드가 추가한 블록들은 그렇지 않아 다른 방법을 사용해야 합니다.

## 객체 등록 방법들

네오 포지는 객체를 등록하는 두 가지 방법을 제공합니다: `DeferredRegister`와 `RegistryEvent` 입니다. 이때 전자는 후자를 감싸는 유틸리티이며, 전자를 사용하는 것이 권장됩니다.

### `DeferredRegister`

`DeferredRegister`는 객체를 어디에, 어떻게 등록하는지 알려주면 알맞은 때에 자동으로 등록하는, 일종의 예약 시스템입니다. 먼저, `DeferredRegister`를 생성하세요:

```java
public static final DeferredRegister<Block> BLOCKS = DeferredRegister.create(
        // 객체를 등록할 레지스트리
        // 마인크래프트 자체의 레지스트리는 BuiltInRegistries에서, 네오 포지의 레지스트리는 NeoForgeRegistries에서 찾을 수 있습니다.
        // 모드도 자체 레지스트리를 추가할 수 있습니다. 이 경우 모드의 소스코드나 문서를 참고하세요.
        BuiltInRegistries.BLOCKS,
        // 우리의 모드 아이디
        ExampleMod.MOD_ID
);
```

We can then add our registry entries as static final fields (see [the article on Blocks][block] for what parameters to add in `new Block()`):

```java
public static final DeferredHolder<Block, Block> EXAMPLE_BLOCK = BLOCKS.register(
        "example_block" // Our registry name.
        () -> new Block(...) // A supplier of the object we want to register.
);
```

The class `DeferredHolder<R, T extends R>` holds our object. The type parameter `R` is the type of the registry we are registering to (in our case `Block`). The type parameter `T` is the type of our supplier. Since we directly register a `Block` in this example, we provide `Block` as the second parameter. If we were to register an object of a subclass of `Block`, for example `SlabBlock`, we would provide `SlabBlock` here instead.

`DeferredHolder<R, T extends R>` is a subclass of `Supplier<T>`. To get our registered object when we need it, we can call `DeferredHolder#get()`. The fact that `DeferredHolder` extends `Supplier` also allows us to use `Supplier` as the type of our field. That way, the above code block becomes the following:

```java
public static final Supplier<Block> EXAMPLE_BLOCK = BLOCKS.register(
        "example_block" // Our registry name.
        () -> new Block(...) // A supplier of the object we want to register.
);
```

Be aware that a few places explicitly require a `Holder` or `DeferredHolder` and will not just accept any `Supplier`. If you need either of those two, it is best to change the type of your `Supplier` back to `Holder` or `DeferredHolder` as necessary.

Finally, since the entire system is a wrapper around registry events, we need to tell the `DeferredRegister` to attach itself to the registry events as needed:

```java
//This is our mod constructor
public ExampleMod(IEventBus modBus) {
    //highlight-next-line
    ExampleBlocksClass.BLOCKS.register(modBus);
    //Other stuff here
}
```

:::info
There are specialized variants of `DeferredRegister`s for blocks and items that provide helper methods, called [`DeferredRegister.Blocks`][defregblocks] and [`DeferredRegister.Items`][defregitems], respectively.
:::

### `RegisterEvent`

`RegisterEvent` is the second way to register objects. This [event][event] is fired for each registry, after the mod constructors (since those are where `DeferredRegister`s register their internal event handlers) and before the loading of configs. `RegisterEvent` is fired on the mod event bus.

```java
@SubscribeEvent
public void register(RegisterEvent event) {
    event.register(
            // This is the registry key of the registry.
            // Get these from BuiltInRegistries for vanilla registries,
            // or from NeoForgeRegistries.Keys for NeoForge registries.
            BuiltInRegistries.BLOCKS,
            // Register your objects here.
            registry -> {
                registry.register(new ResourceLocation(MODID, "example_block_1"), new Block(...));
                registry.register(new ResourceLocation(MODID, "example_block_2"), new Block(...));
                registry.register(new ResourceLocation(MODID, "example_block_3"), new Block(...));
            }
    );
}
```

## Querying Registries

Sometimes, you will find yourself in situations where you want to get a registered object by a given id. Or, you want to get the id of a certain registered object. Since registries are basically maps of ids (`ResourceLocation`s) to distinct objects, i.e. a reversible map, both of these operations work:

```java
BuiltInRegistries.BLOCKS.get(new ResourceLocation("minecraft", "dirt")); // returns the dirt block
BuiltInRegistries.BLOCKS.getKey(Blocks.DIRT); // returns the resource location "minecraft:dirt"

// Assume that ExampleBlocksClass.EXAMPLE_BLOCK.get() is a Supplier<Block> with the id "yourmodid:example_block"
BuiltInRegistries.BLOCKS.get(new ResourceLocation("yourmodid", "example_block")); // returns the example block
BuiltInRegistries.BLOCKS.getKey(ExampleBlocksClass.EXAMPLE_BLOCK.get()); // returns the resource location "yourmodid:example_block"
```

If you just want to check for the presence of an object, this is also possible, though only with keys:

```java
BuiltInRegistries.BLOCKS.containsKey(new ResourceLocation("minecraft", "dirt")); // true
BuiltInRegistries.BLOCKS.containsKey(new ResourceLocation("create", "brass_ingot")); // true only if Create is installed
```

As the last example shows, this is possible with any mod id, and thus a perfect way to check if a certain item from another mod exists.

Finally, we can also iterate over all entries in a registry, either over the keys or over the entries (entries use the Java `Map.Entry` type):

```java
for (ResourceLocation id : BuiltInRegistries.BLOCKS.keySet()) {
    // ...
}
for (Map.Entry<ResourceKey<Block>, Block> entry : BuiltInRegistries.BLOCKS.entrySet()) {
    // ...
}
```

:::note
Query operations always use vanilla `Registry`s, not `DeferredRegister`s. This is because `DeferredRegister`s are merely registration utilities.
:::

:::danger
Query operations are only safe to use after registration has finished. **DO NOT QUERY REGISTRIES WHILE REGISTRATION IS STILL ONGOING!**
:::

## Custom Registries

Custom registries allow you to specify additional systems that addon mods for your mod may want to plug into. For example, if your mod were to add spells, you could make the spells a registry and thus allow other mods to add spells to your mod, without you having to do anything else. It also allows you to do some things, such as syncing the entries, automatically.

Let's start by creating the [registry key][resourcekey] and the registry itself:

```java
// We use spells as an example for the registry here, without any details about what a spell actually is (as it doesn't matter).
// Of course, all mentions of spells can and should be replaced with whatever your registry actually is.
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

Then, tell the game that the registry exists by registering them to the root registry in `NewRegistryEvent`:

```java
@SubscribeEvent
static void registerRegistries(NewRegistryEvent event) {
    event.register(SPELL_REGISTRY);
}
```

You can now register new registry contents like with any other registry, through both `DeferredRegister` and `RegisterEvent`:

```java
public static final DeferredRegister<Spell> SPELLS = DeferredRegister.create("yourmodid", SPELL_REGISTRY);
public static final Supplier<Spell> EXAMPLE_SPELL = SPELLS.register("example_spell", () -> new Spell(...));

// Alternatively:
@SubscribeEvent
public static void register(RegisterEvent event) {
    event.register(SPELL_REGISTRY_KEY, registry -> {
        registry.register(new ResourceLocation("yourmodid", "example_spell"), () -> new Spell(...));
    });
}
```

## Datapack Registries

A datapack registry (also known as a dynamic registry or, after its main use case, worldgen registry) is a special kind of registry that loads data from [datapack][datapack] JSONs (hence the name) at world load, instead of loading them when the game starts. Default datapack registries most notably include most worldgen registries, among a few others.

Datapack registries allow their contents to be specified in JSON files. This means that no code (other than [datagen][datagen] if you don't want to write the JSON files yourself) is necessary. Every datapack registry has a [`Codec`][codec] associated with it, which is used for serialization, and each registry's id determines its datapack path:

- Minecraft's datapack registries use the format `data/yourmodid/registrypath` (for example `data/yourmodid/worldgen/biomes`, where `worldgen/biomes` is the registry path).
- All other datapack registries (NeoForge or modded) use the format `data/yourmodid/registrynamespace/registrypath` (for example `data/yourmodid/neoforge/loot_modifiers`, where `neoforge` is the registry namespace and `loot_modifiers` is the registry path).

Datapack registries can be obtained from a `RegistryAccess`. This `RegistryAccess` can be retrieved by calling `ServerLevel#registryAccess()` if on the server, or `Minecraft.getInstance().getConnection()#registryAccess()` if on the client (the latter only works if you are actually connected to a world, as otherwise the connection will be null). The result of these calls can then be used like any other registry to get specific elements, or to iterate over the contents.

### Custom Datapack Registries

Custom datapack registries do not require a `Registry` to be constructed. Instead, they just need a registry key and at least one [`Codec`][codec] to (de-)serialize its contents. Reiterating on the spells example from before, registering our spell registry as a datapack registry looks something like this:

```java
public static final ResourceKey<Registry<Spell>> SPELL_REGISTRY_KEY = ResourceKey.createRegistryKey(new ResourceLocation("yourmodid", "spells"));

@SubscribeEvent
public static void registerDatapackRegistries(DataPackRegistryEvent.NewRegistry event) {
    event.dataPackRegistry(
            // The registry key.
            SPELL_REGISTRY_KEY,
            // The codec of the registry contents.
            Spell.CODEC,
            // The network codec of the registry contents. Often identical to the normal codec.
            // May be a reduced variant of the normal codec that omits data that is not needed on the client.
            // May be null. If null, registry entries will not be synced to the client at all.
            // May be omitted, which is functionally identical to passing null (a method overload
            // with two parameters is called that passes null to the normal three parameter method).
            Spell.CODEC
    );
}
```

### Data Generation for Datapack Registries

Since writing all the JSON files by hand is both tedious and error-prone, NeoForge provides a [data provider][datagenindex] to generate the JSON files for you. This works for both built-in and your own datapack registries.

First, we create a `RegistrySetBuilder` and add our entries to it (one `RegistrySetBuilder` can hold entries for multiple registries):

```java
new RegistrySetBuilder()
    .add(Registries.CONFIGURED_FEATURE, bootstrap -> {
    // Register configured features through the bootstrap context (see below)
    })
    .add(Registries.PLACED_FEATURE, bootstrap -> {
    // Register placed features through the bootstrap context (see below)
    });
```

The `bootstrap` lambda parameter is what we actually use to register our objects. It has the type `BootstrapContext`. To register an object, we call `#register` on it, like so:

```java
// The resource key of our object.
public static final ResourceKey<ConfiguredFeature<?, ?>> EXAMPLE_CONFIGURED_FEATURE = ResourceKey.create(
    Registries.CONFIGURED_FEATURE,
    new ResourceLocation(MOD_ID, "example_configured_feature")
);

new RegistrySetBuilder()
    .add(Registries.CONFIGURED_FEATURE, bootstrap -> {
        bootstrap.register(
            // The resource key of our configured feature.
            EXAMPLE_CONFIGURED_FEATURE,
            // The actual configured feature.
            new ConfiguredFeature<>(Feature.ORE, new OreConfiguration(...))
        );
    })
    .add(Registries.PLACED_FEATURE, bootstrap -> {
    // ...
    });
```

The `BootstrapContext` can also be used to lookup entries from another registry if needed:

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
            otherRegistry.getOrThrow(EXAMPLE_CONFIGURED_FEATURE), // Get the configured feature
            List.of() // No-op when placement happens - replace with whatever your placement parameters are
        ));
    });
```

Finally, we use our `RegistrySetBuilder` in an actual data provider, and register that data provider to the event:

```java
@SubscribeEvent
static void onGatherData(GatherDataEvent event) {
    event.getGenerator().addProvider(
        // Only run datapack generation when server data is being generated
        event.includeServer(),
        // Create the provider
        output -> new DatapackBuiltinEntriesProvider(
            output,
            event.getLookupProvider(),
            // Our registry set builder to generate the data from.
            new RegistrySetBuilder().add(...),
            // A set of mod ids we are generating. Usually only your own mod id.
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
