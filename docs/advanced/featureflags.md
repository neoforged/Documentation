# Feature Flags

Feature Flags are a system which allow developers to gate a set of features behind some set of required flags, that being registered elements, gameplay mechanics, data pack entries or some other unique system to your mod.

A common use case would be gating experimental features/elements behind a experimental flag, allowing users to easily switch them on and play around with them before they are finalized.

### Creating a Feature Flag

To create new Feature Flags, a JSON file needs to be created and referenced in your `neoforge.mods.toml` file with the `featureFlags` entry inside of your `[[mods]]` block. The specified path must be relative to the `resources` directory:
```toml
# In neoforge.mods.toml:
[[mods]]
    # The file is relative to the output directory of the resources, or the root path inside the jar when compiled
    # The 'resources' directory represents the root output directory of the resources
    featureFlags="feature_flags.json"
```

The definition of the entry consists of a list of Feature Flag names, which will be loaded and registered during game initialization.
```json5
{
    "flags": [
        // Identifier of a Feature Flag to be registered
        "examplemod:experimental"
    ]
}
```

### Retrieving the Feature Flag

The registered Feature Flag can be retrieved via `FeatureFlagRegistry.getFlag(ResourceLocation)`. This can be done at any time during your mods initialization and is recommended to be stored somewhere for future use, rather than looking up the registry each time you require your flag.

```java
// Look up the 'examplemod:experimental' Feature Flag
public static final FeatureFlag EXPERIMENTAL = FeatureFlags.REGISTRY.getFlag(ResourceLocation.fromNamespaceAndPath("examplemod", "experimental"));
```

### Feature Elements

`FeatureElement`s are registry values which can be given a set of required flags. These values are only made available to players when the respective required flags matches that of the levels enabled flags.

When a given element is disabled it is fully hidden from a players view and all interactions are skipped over. Do note however these disabled elements will still exist in the registry but are functionally unusable.

The following is a complete list of all registries which directly implement the `FeatureElement` system.
- Item
- Block
- EntityType
- MenuType
- Potion
- MobEffect

**Flagging elements**

In order to flag a given `FeatureElement` as requiring your Feature Flag, you simply pass it and any other desired flags into the respective registration method.

- `Item`: `Item.Properties#requiredFeatures`
- `Block`: `BlockBehaviour.Properties#requiredFeatures`
- `EntityType`: `EntityType.Builder#requiredFeatures`
- `MenuType`: `IMenuTypeExtension#create`
- `Potion`: `Potion#requiredFeatures`
- `MobEffect`: `MobEffect#requiredFeatures`

```java
// These elements will only become available once the 'EXPERIMENTAL' flag is enabled

// Item
DeferredRegister.Items ITEMS = DeferredRegister.createItems("examplemod");
DeferredItem<Item> EXPERIMENTAL_ITEM = ITEMS.registerSimpleItem("experimental", new Item.Properties()
    .requiredFeatures(EXPERIMENTAL) // mark as requiring the 'EXPERIMENTAL' flag
);

// Block
DeferredRegister.Blocks BLOCKS = DeferredRegister.createBlocks("examplemod");
// Do note that 'BlockBehaviour.Properties#ofFullCopy' and 'BlockBehaviour.Properties#ofLegacyCopy' will copy over the required features
// Meaning that in 1.21.3 doing 'BlockBehaviour.Properties.ofFullCopy(Blocks.PALE_OAK_WOOD)' would have your block require the 'WINTER_DROP' flag
DeferredBlock<Block> EXPERIMENTAL_BLOCK = BLOCKS.registerSimpleBlock("experimental", BlockBehaviour.Properties.of()
    .requiredFeatures(EXPERIMENTAL) // mark as requiring the 'EXPERIMENTAL' flag
);

// BlockItems are special in that the required features are inherited from its respective Block
// the same is also true for SpawnEggItems and its respective EntityType
DeferredItem<BlockItem> EXPERIMENTAL_BLOCK_ITEM = ITEMS.registerSimpleBlockItem(EXPERIMENTAL_BLOCK);

// EntityType
DeferredRegister<EntityType<?>> ENTITY_TYPES = DeferredRegister.create(Registries.ENTITY_TYPE, "examplemod");
DeferredHolder<EntityType<?>, EntityType<ExperimentalEntity>> EXPERIMENTAL_ENTITY = ENTITY_TYPES.register("experimental", registryName -> EntityType.Builder.of(ExperimentalEntity::new, MobCategory.AMBIENT)
    .requiredFeatures(EXPERIMENTAL) // mark as requiring the 'EXPERIMENTAL' flag
    .build(ResourceKey.create(Registries.ENTITY_TYPE, registryName))
);

// MenuType
DeferredRegister<MenuType<?>> MENU_TYPES = DeferredRegister.create(Registries.MENU, "examplemod");
DeferredHolder<MenuType<?>, MenuType<ExperimentalMenu>> EXPERIMENTAL_MENU = MENU_TYPES.register("experimental", () -> IMenuTypeExtension.create(
    ExperimentalMenu::new,
    EXPERIMENTAL // mark as requiring the 'EXPERIMENTAL' flag
));

// MobEffect
DeferredRegister<MobEffect> MOB_EFFECTS = DeferredRegister.create(Registries.MOB_EFFECT, "examplemod");
DeferredHolder<MobEffect, ExperimentalMobEffect> EXPERIMENTAL_MOB_EEFECT = MOB_EFFECTS.register("experimental", registryName -> new ExperimentalMobEffect(MobEffectCategory.NEUTRAL, CommonColors.WHITE)
    .requiredFeatures(EXPERIMENTAL) // mark as requiring the 'EXPERIMENTAL' flag
);

// Potion
DeferredRegister<Potion> POTIONS = DeferredRegister.create(Registries.POTION, "examplemod");
DeferredHolder<Potion, ExperimentalPotion> EXPERIMENTAL_POTION = POTIONS.register("experimental", registryName -> new ExperimentalPotion(registryName.toString(), new MobEffectInstance(EXPERIMENTAL_MOB_EEFECT))
    .requiredFeatures(EXPERIMENTAL) // mark as requiring the 'EXPERIMENTAL' flag
);
```

**Validating enabled status**

In order to validate if features should be enabled or not, you must first acquire the set of enabled features. This can be retrieved in a variety of ways but the common and recommended method is `LevelReader#enabledFeatures`.  

```java
level.enabledFeatures(); // from a 'LevelReader' instance
entity.level().enabledFeatures(); // from a 'Entity' instance

// Client Side
minecraft.getConnection().enabledFeatures();

// Server Side
server.getWorldData().enabledFeatures();
```

To validate if any arbitrary `FeatureFlagSet` is enabled, simply pass the enabled features to `FeatureFlagSet#isSubsetOf`.

To validate if any given `FeatureElement` is enabled, simply invoke `FeatureElement#isEnabled`.

:::note
`ItemStack` has a speciality `isItemEnabled(FeatureFlagSet)` method, This is so that empty stacks are treated as enabled even if the required features for backing `Item` does not match the enabled features.

It is recommended to make use of this speciality over `Item#isEnabled` where possible.
:::

```java
requiredFeatures.isSubsetOf(enabledFeatures);
featureElement.isEnabled(enabledFeatures);
itemStack.isItemEnabled(enabledFeatures);
```

### Feature Packs

Feature Packs are a type of pack which not only loads resources and/or data but also has the ability to toggle on a given set of Feature Flags.

These flags are defined in the `pack.mcmeta` JSON file at the root of this pack, which follows the below format.
```json5
{
    "features": [
        "enabled": [
            // Identifier of a Feature Flag to be enabled
            // Must be a valid registered flag
            "examplemod:experimental"
        ]
    ]
}
```

There are a couple methods in which you can provide a feature pack to your users.

Installing these packs differs depending on if its being installed into a single player world or a server.

**External**

External packs are provided to your users in datapack form.

**Installing into a single player world**
1. Create a new world.
2. Navigate to the datapack selection screen.
3. Drag and drop the datapack zip file onto game window.
4. Move the newly available datapack over to the `Selected` packs list.
5. Confirm changes by clicking `Done`.

The game will now warn you about any newly selected experimental features, potential bugs, issues and crashes.
You can confirm these changes by clicking `Proceed` or `Details` to see an extensive list of all selected packs and which features they would enable.

:::note
External Feature Packs do not show up in the Experiments screen.

To disable these packs after enabling them, navigate back into the datapacks screen and move the external packs back into `Available` from `Selected`.

The Experiments screen only allows toggling on or off Built-In Feature Packs.
:::

**Installing into a server**

Enabling Feature Packs can only be done during initial world creation, and cannot be disabled once enabled.

1. Create the directory `./world/datapacks`
2. Upload the datapack zip file into the newly created directory
3. Open your servers `server.properties` file
4. Add the datapack zip file name (excluding `.zip`) to `initial-enabled-packs` (separating each pack by a `,`)

The Feature Pack is now installed and enabled

**Built-In**

Built-In packs are bundled with your mod and are made available to the game using the `AddPackFindersEvent` event.
```java
@SubscribeEvent
public static void addFeaturePacks(final AddPackFindersEvent event) {
    event.addPackFinders(
            // 'packLocation': Path relative to your mods 'resources' pointing towards this pack
            ResourceLocation.fromNamespaceAndPath("examplemod", "data/examplemod/datapacks/experimental"),
            
            // 'packType': What kind of resources are contained within this pack
            // 'CLIENT_RESOURCES' for packs with client assets (resource packs)
            // 'SERVER_DATA' for packs with server data (data packs)
            PackType.SERVER_DATA,
            
            // 'packNameDisplay': Display name shown in the Experiments screen
            Component.literal("ExampleMod: Experiments"),
            
            // 'packSource': In order for this pack to load and enable feature flags this *MUST* be 'FEATURE'
            // any of 'PackSource' type is invalid here
            PackSource.FEATURE,
            
            // 'alwaysActive': If 'true' this pack is always active and cannot be disabled, should always be 'false' for feature packs
            false,
            
            // 'packPosition': Priority to load resources from this pack in
            // 'TOP' this pack will be prioritized over other packs
            // 'BOTTOM' other packs will be prioritized over this pack 
            Pack.Position.TOP
    );
}
```

**Enabling on a single player world**

1. Create a new world.
2. Navigate to the experiments screen.
3. Toggle on the desired packs.
4. Confirm changes by clicking `Done`.

**Enabling on a server**
1. Open your servers `server.properties` file
2. Add the feature pack id to `initial-enabled-packs` (separating each pack by a `,`)
    - The pack id is defined by the `packLocation` value when registering the `pack finder`.
    - `mod/<namespace>:<path>`, e.g. `mod/examplemod:data/examplemod/datapacks/experimental`

**Generating Packs**

Feature Packs can be fully generated during regular mod data gen. This is best used in combination with Built-In packs, but it is safe to zip up the generated result and share it as a External Pack. Just don't also bundle it as a Built-In pack.

```java
@SubscribeEvent
public static void gatherData(final GatherDataEvent event) {
    var generator = event.getGenerator();
    
    // The generate a Feature Pack you must first obtain a pack generator instance for the desired pack.
    // generator.getBuiltinDatapack(<shouldGenerate>, <namespace>, <path>);
    // this will generate the feature pack into the following path
    // ./data/<namespace>/datapacks/<path>
    var featurePack = generator.getBuiltinDatapack(true, "examplemod", "experimental");
    
    // Do take note of the generated pack location, as this is where Built-In packs should point their `packLocation` towards.
    
    // register a provider to generate the `pack.mcmeta` file
    featurePack.addProvider(output -> PackMetadataGenerator.forFeaturePack(
            output,
            
            // Description displayed in the Experiments screen
            Component.literal("Enabled experimental features for ExampleMod"),
            
            // Set of Feature Flags this pack should enable
            FeatureFlagSet.of(EXPERIMENTAL)
    ));
    
    // register additional providers (recipes, loot tables) to `featurePack` to write any generated resources into this pack, rather than the root pack
}
```