# Registries

Registration is the process of taking the objects of a mod (such as [items][item], [blocks][block], entities, etc.) and making them known to the game. Registering things is important, as without registration the game will simply not know about these objects, which will cause unexplainable behaviors and crashes.

A registry is, simply put, a wrapper around a map that maps registry names (read on) to registered objects, often called registry entries. Registry names must be unique within the same registry, but the same registry name may be present in multiple registries. The most common example for this are blocks (in the `BLOCKS` registry) that have an item form with the same registry name (in the `ITEMS` registry).

Every registered object has a unique name, called its registry name. The name is represented as a [`ResourceLocation`][resloc]. For example, the registry name of the dirt block is `minecraft:dirt`, and the registry name of the zombie is `minecraft:zombie`. Modded objects will of course not use the `minecraft` namespace; their mod id will be used instead.

## Vanilla vs. Modded

To understand some of the design decisions that were made in NeoForge's registry system, we will first look at how Minecraft does this. We will use the block registry as an example, as most other registries work the same way.

Registries generally register [singletons][singleton]. This means that all registry entries exist exactly once. For example, all stone blocks you see throughout the game are actually the same stone block, displayed many times. If you need the stone block, you can get it by referencing the registered block instance.

Minecraft registers all blocks in the `Blocks` class. Through the `register` method, `Registry#register()` is called, with the block registry at `BuiltInRegistries.BLOCK` being the first parameter. After all blocks are registered, Minecraft performs various checks based on the list of blocks, for example the self check that verifies that all blocks have a model loaded.

The main reason all of this works is that `Blocks` is classloaded early enough by Minecraft. Mods are not automatically classloaded by Minecraft, and thus workarounds are needed.

## Methods for Registering

NeoForge offers two ways to register objects: the `DeferredRegister` class, and the `RegisterEvent`. Note that the former is a wrapper around the latter, and is thus recommended in order to prevent mistakes.

### `DeferredRegister`

We begin by creating our `DeferredRegister`:

```java
public static final DeferredRegister<Block> BLOCKS = DeferredRegister.create(
        // The registry we want to use.
        // Minecraft's registries can be found in BuiltInRegistries, NeoForge's registries can be found in NeoForgeRegistries.
        // Mods may also add their own registries, refer to the individual mod's documentation or source code for where to find them.
        BuiltInRegistries.BLOCKS,
        // Our mod id.
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

:::note
Some modders prefer to keep their `DeferredRegister`s in the same class as their registered objects. Others prefer keeping all `DeferredRegister`s in a separate class for readability. This is mostly a design decision, however if you decide to do the latter, make sure to classload the classes the objects are in, for example through an empty static method.
:::

`DeferredHolder<R, T extends R>` is a subclass of `Supplier<T>`. To get our registered object when we need it, we can call `DeferredHolder#get()`. The fact that `DeferredHolder` extends `Supplier` also allows us to use `Supplier` as the type of our field. That way, the above code block becomes the following:

```java
public static final Supplier<Block> EXAMPLE_BLOCK = BLOCKS.register(
        "example_block" // Our registry name.
        () -> new Block(...) // A supplier of the object we want to register.
);
```

Be aware that a few places explicitly require a `DeferredHolder` and will not just accept any `Supplier`. If you need a `DeferredHolder`, it is best to change the type of your `Supplier` back to `DeferredHolder`.

Finally, since the entire system is a wrapper around registry events, we need to tell the `DeferredRegister` to attach itself to the registry events as needed:

```java
//This is our mod constructor
public ExampleMod(IModEventBus bus) {
    ExampleBlocksClass.BLOCKS.register(bus);
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
            // Get these from Registries for vanilla registries, or from NeoForgeRegistries.Keys for NeoForge registries.
            Registries.BLOCKS,
            // Register your objects here.
            registry -> {
                registry.register(new ResourceLocation(MODID, "example_block_1"), new Block(...));
                registry.register(new ResourceLocation(MODID, "example_block_2"), new Block(...));
                registry.register(new ResourceLocation(MODID, "example_block_3"), new Block(...));
            }
    );
}
```

## Custom Registries

Custom registries allow you to specify additional systems that addon mods for your mod may want to plug into. For example, if your mod were to add spells, you could make the spells a registry and thus allow other mods to add spells to your mod, without you having to do anything else. It also allows you to do some things, such as syncing the entries, automatically.

Let's start by creating the [registry key][resourcekey] and the registry itself:

```java
// We use spells as an example for the registry here, without any details about what a spell actually is (as it doesn't matter).
// Of course, all mentions of spells can and should be replaced with whatever your registry actually is.
public static final ResourceKey<Registry<Spell>> SPELL_REGISTRY_KEY = ResourceKey.createRegistryKey(new ResourceLocation("yourmodid", "spells"));
public static final Registry<YourRegistryContents> SPELL_REGISTRY = new RegistryBuilder<>(SPELL_REGISTRY_KEY)
        // If you want the registry to sync its values.
        .sync(true)
        // The default key. Similar to minecraft:air for blocks.
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
    event.register(SPELL_REGISTRY, registry -> {
        registry.register(new ResourceLocation("yourmodid", "example_spell"), () -> new Spell(...));
    });
}
```

## Datapack Registries

A datapack registry (also known as a dynamic registry or, after its main use case, worldgen registry) is a special kind of registry that loads data from [datapack][datapack] JSONs (hence the name) at world load, instead of loading them when the game starts. Default datapack registries include most worldgen registries, as well as any custom registry (see below) that is marked as a datapack registry.

Datapack registries allow their contents to be specified in JSON files. This means that no code (other than [datagen][datagen] if you don't want to write the JSON files yourself) is necessary. Every datapack registry has a [`Codec`][codec] associated with it, which is used for serialization, and each registry's id determines its datapack path:

- Minecraft's datapack registries use the format `data/yourmodid/registrypath` (for example `data/yourmodid/worldgen/biomes`, where `worldgen/biomes` is the registry path).
- All other datapack registries (NeoForge or modded) use the format `data/yourmodid/registrynamespace/registrypath` (for example `data/yourmodid/neoforge/loot_modifiers`, where `neoforge` is the registry namespace and `loot_modifiers` is the registry path).

Datapack registries can be obtained from a `RegistryAccess`. This `RegistryAccess` can be retrieved by calling `ServerLevel#registryAccess()` if on the server, by calling `Minecraft.getInstance().connection#registryAccess()` if on the client, or from a `RegistryOps`.

### `RegistryOps`

`RegistryOps` is a special [`DynamicOps`][dynamicops] made specifically for (de)serializing datapack registries. It provides additional registry context and enables the use of special codecs that can only be used with `RegistryOps`. Data generation of datapack registry elements must always be done through `RegistryOps` to convert elements to `JsonElement`s.

A `RegistryOps` can be created via `RegistryOps.create(JsonElement.INSTANCE, RegistryAccess.builtinCopy())`. `RegistryAccess.builtinCopy()` creates a set of writable datapack registries, which is necessary for datagenning unregistered objects. All data generation done in a `GatherDataEvent` handler must use the same `RegistryAccess` and `RegistryOps` instances, otherwise obscure errors will occur.

### `Holder`s

As mentioned before, (normal) registries rely on `DeferredHolder`s, which are a special kind of `Holder`. A `Holder` vaguely resembles a `Pair<K, V>` that either starts with a key and has a value bound later, or starts with a value and may have a key bound later. Datapack registries extensively rely on (non-deferred) `Holder`s to reference registry elements of other registries. For example, `Biome`s refer to `Holder<PlacedFeature>`s, and `PlacedFeature`s refer to `Holder<ConfiguredFeature>`s.

During data generation, we can use `RegistryOps#registry` to get a registry, and `Registry#getOrCreateHolderOrThrow()` to produce key-only reference holders (we only need the key in this case, since holder codecs only encode keys when using a `RegistryOps` in order to prevent circular dependencies).

### `JsonCodecProvider`

NeoForge provides a data provider for datapack registry elements that, given a registry key and a map of objects to generate, generates all JSON files for the objects in the map.

```java
@SubscribeEvent
static void onGatherData(GatherDataEvent event) {
    DataGenerator generator = event.getDataGenerator();
    ExistingFileHelper existingFileHelper = event.getExistingFileHelper();
    RegistryOps<JsonElement> registryOps = RegistryOps.create(JsonElement.INSTANCE, RegistryAccess.builtinCopy());
    
    Map<ResourceLocation, PlacedFeature> map = Map.of(
        // Whatever entries you want. For example:
        new ResourceLocation("yourmodid", "sponge_everywhere"), new PlacedFeature(...)
    );
    
    JsonCodecProvider provider = JsonCodecProvider.forDatapackRegistry(
            generator,
            existingFileHelper,
            "yourmodid",
            registryOps,
            // The registry you want to generate in.
            Registry.PLACED_FEATURE_REGISTRY,
            // The elements to generate.
            map
    );
    
    generator.addProvider(event.includeServer(), provider);
}
```

### Custom Datapack Registries

Custom datapack registries are created through `RegistryBuilder` like all other registries, but are registered to `DataPackRegistryEvent.NewRegistry` instead of `NewRegistryEvent`. Reiterating the spells example from before, registering our spell registry as a datapack registry looks something like this:

```java
@SubscribeEvent
static void registerDatapackRegistries(DataPackRegistryEvent.NewRegistry event) {
    event.register(
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

[block]: ../blocks/index.md
[blockentity]: ../blockentities/index.md
[codec]: ../datastorage/codecs.md
[datagen]: ../datagen/index.md
[datapack]: ../resources/server/index.md
[defregblocks]: ../blocks/index.md#deferredregisterblocks
[defregitems]: ../items/index.md#deferredregisteritems
[dynamicops]: ../datastorage/codecs.md#dynamicops
[event]: ./events.md
[item]: ../items/index.md
[resloc]: ../misc/resourcelocation.md
[resourcekey]: ../misc/resourcelocation.md#resourcekeys
[singleton]: https://en.wikipedia.org/wiki/Singleton_pattern
