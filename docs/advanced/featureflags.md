# Feature Flags

Feature Flags allow developers to lock a set of features behind a set of flags, requiring the user to enable them during world creation.

:::note
Once enabled for a given world, these flags can not be disabled.
:::

### Creating a Feature Flag

To create new Featre Flags, a JSON file needs to be created and referenced in your `neoforge.mods.toml` file with the `featureFlags` entry inside of your `[[mods]]` block. The specified path must be relative to the `resources` directory:
```toml
# In neoforge.mods.toml:
[[mods]]
    ## The file is relative to the output directory of the resources, or the root path inside the jar when compiled
    ## The 'resources' directory represents the root output directory of the resources
    featureFlags="feature_flags.json"
```

The definition of the entry consists of a list of Feature Flag names, which will be loaded and registered during game initialization.
```json5
{
    "flags": [
        // Identifier of a Feature Flag to be registered
        "EXAMPLEMOD:MY_FLAG",

        // E.g. 'experimental' flag for the 'examplemod' mod
        "examplemod:experimental"
    ]
}
```

### Retrieving the Feature Flag

The registered Feature Flag can be retrieved via `FeatureFlagRegistry.getFlag(ResourceLocation)`. This can be done at any time during your mods initialization and is recommended to be stored somewhere for future use, rather than looking up the registry each time you require your flag.

```java
@Mod(...)
public class MyMod {
    // Look up the 'examplemod:experimental' Feature Flag
    public static final FeatureFlag EXPERIMENTAL = FeatureFlags.REGISTRY.getFlag(ResourceLocation.fromNamespaceAndPath("examplemod", "experimental"));
}
```

### Feature Elements

You can mark any `FeatureElement` as requiring your Feature Flag by providing it to the necessery `requiredFeatures(FeatureFlag...)` method during registration.

- `Item` / `Block` / `EntityType` elements this would be on the on your `Item.Properties` / `BlockBehaviour.Properties` `EntityType.Builder` instance.
- `Potion` / `MobEffect` elements this is set directly on the respective element `Potion#requiredFeatures` / `MobEffect#requiredFeatures`.
- `MenuType` you pass your flags directly into `IMenuTypeExtension#create`.

In order to check if a given `FeatureElement` is enabled, you must first acquire the set of enabled features. This can be retrieved in a variety of ways but the common method is `LevelReader#enabledFeatures`.

Once you have acquired a set of enabled features, validating a elements enabled state is as simple as invoking `FeatureElement#isEnabled` and passing in your enabled feature set.

:::note
`ItemStack`s have a speciality `isItemEnabled(FeatureFlagSet)` method, This is so that empty stacks are treated as enabled even if the backing `Item` does not meet its required set of flags, and is recommended to be used over `Item#isEnabled` if possible.
:::

### Feature Packs

In order for your Feature Flag to show up in the experiments screen and allow users to toggle it on, you must provide a Feature Pack which enables the desired set of flags.

:::note
Feature Packs are a type of datapack which can enable as many flags as desired, and are special in which they can only be enabled via the Experiments screen and can not be disabled once the world is loaded.
:::

Feature Packs can be provided in 1 of the following ways

- External DataPack: You provide the datapack zip file for users to download and install into the `datapacks` directory.

- Built-In Feature Pack: The `AddPackFindersEvent` can be used to register built-in feature packs, these packs are bundled with your mod but not enabled unless users request it during world creation.
```java
@Mod(...)
public class MyMod {
    public MyMod(IEventBus modBus) {
        modBus.addListener(AddPackFindersEvent.class, event -> event.addPackFinders(
                // packLocation | Path pointing to this feature pack, relative to your mods 'resources'
                ResourceLocation.fromNamespaceAndPath("examplemod", "feature_packs/experimental"),
                // packType | 'CLIENT_RESOURCES' for packs with only client resources, 'SERVER_DATA' otherwise
                PackType.SERVER_DATA,
                // packNameDisplay | Display name shown in the Experiments screen
                Component.literal("ExampleMod: Experiments"),
                // packSource | This *MUST* be 'FEATURE' in order for this pack source to load and enable feature flags
                PackSource.FEATURE,
                // alwaysActive | 'true' this pack is always active and cannot be disabled, always 'false' for feature packs
                false,
                // packPosition | 'TOP' to load data first and overwrite standard packs, 'BOTTOM' to allow other packs to overrite us
                Pack.Position.TOP
        ));
    }
}
```

To specify which flags are enabled, your feature pack must provide the following in its `pack.mcmeta` JSON file.
```json5
{
    "features": [
        "enabled": [
            // Identifier of a Feature Flag to be enabled
            "EXAMPLEMOD:MY_FLAG",

            // E.g. 'experimental' flag for the 'examplemod' mod
            "examplemod:experimental"
        ]
    ]
}
```

Built-in packs however, can have this generated for you during datagen and is the recommended method for built-in packs.

```java
@Mod(...)
public class MyMod {
    public static final FeatureFlag EXPERIMENTAL = FeatureFlags.REGISTRY.getFlag(ResourceLocation.fromNamespaceAndPath("examplemod", "experimental"));

    public MyMod(IEventBus modBus) {
        modBus.addListener(GatherDataEvent.class, event -> {
            var generator = event.getGenerator();
            
            // generator.getBuiltinDatapack(true, "<providerPrefix>", "<path>");
            // will be generated into './data/<providerPrefix>/datapacks/<path>/'
            // E.g. './data/examplemod/datapacks/experimental/'
            var myFeaturePack = generator.getBuiltinDatapack(true, "examplemod", "experimental");
            myFeaturePack.addProvider(output -> PackMetadataGenerator.forFeaturePack(
                    output,
                    // description | Description shown in the experiments screen
                    Component.literal("Enables experimental features for ExampleMod"),
                    // flags | Set of flags this pack should enable
                    FeatureFlagSet.of(EXPERIMENTAL)
            ));

            // register any experimental data providers (recipes, loot tables) to 'myFeaturePack'
            // to generate them into the built-in feature pack
        });
    }
}
```