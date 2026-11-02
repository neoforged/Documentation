import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem'

# Biome

A biome is a region in a world with distinct geographical features, plants, mobs, temperatures, humidity levels, colors, and more. Biomes separate every generated world into different environments, such as forests, deserts, and oceans.

The biome of a location is determined during world generation rather than by the current environment, even if all blocks in a large area are altered to imitate the terrain of other biomes.



## Generating your own biome

Before we get started this documentation is for creating your own custom biome not modifying an existing biome. For modifying an existing biome please refer to [Biome Modifiers][biomemodifiers]. 

A new biome can be added by creating a JSON file in your namespace's `worldgen/biome` subfolder. So for example, if you want to add a biome named `example_biome` for a mod id `examplemod`, it will be located at `data/examplemod/worldgen/biome/example_biome.json`. A biome's ID will be related to the `biome` directory, so for our example, it would be `examplemod:example_biome`. name can be chosen, and the biome will automatically be picked up by the game. Java code is only needed if you want to add additional Environment Attributes.

## Specification

A biome JSON file may contain the following entries:

- `has_precipitation`: Determines whether the biome has precipitation. Boolean; if true this biome will have rain/snow depending on the `temperature`
- `temperature`: Controls the gameplay features like grass and foliage color if not explicitly defined. Also, will determine whether it rains or snows when `has_precipitation` is `true`. It can also determine generation of some features.
- `temerature_modifier`: Modifies temperature before calculating the height adjusted temperature. Accepts `none` or `frozen`. Optional, defaults to `none`. If `frozen`, makes some places' temperature high enough to rain (0.2).
- `downfall`: Controls grass and foliage temperature if not explicitly defined.
- `effects`: The object holding several ambient effects in this biome.
    - `water_color`: [String RGB color format](#string-rgb-color) for water block color. Normal value is `4159204`.
    - `foliage_color`: [String RGB color format](#string-rgb-color) for tree leaves and vines. Optional, if absent the value depends on `temperature` and `downfall`.
    - `dry_foliage_color`: [String RGB color format](#string-rgb-color) for leaf litter color.  Optional, if absent the value depends on `temperature` and `downfall`.
    - `grass_color`: [String RGB color format](#string-rgb-color) for grass blocks, short grass, tall grass, ferns, tall ferns, and sugar cane. Optional, if absent the value depends on `temperature` and `downfall`.
    - `grass_color_modifier`: Some biomes have specific multiplier hard coded for the grass color this is to select one of those modifiers. Accepts `none`, `dark_forest` or `swamp`. Optional, defaults to `none`. Not recommended for mod makes to make their own hard coded values like this. 
- `attributes`: Map of environment attributes applying to biome. There are tons of environment attributes provided by minecraft and mod can create their own with Java code. Optional;
- `carvers`: Any number of carvers, can take tag with `#`, an array containing IDs or a singular value of carver. Required but can be empty. Can also be created through JSON files.
- `features`: List of generation steps (can be empty). Usually contains 11 steps but any amount is possible. Each entry on the list can be any number of placed features (can take tags, list of id or whole JSON object of placed feature). Placed features are feature to be placed during generation step. The same placed features in the same step in two biomes cannot be in different orders.
These generation steps are also referred to by name for structure generation. They are in order
    - `RAW_GENERATION`: Used by small end island feature in vanilla.
    - `LAKES`: Used by lava lakes and small ponds in vanilla.
    - `LOCAL_MODIFICATIONS`: Used by amethyst geodes and icebergs in vanilla.
    - `UNDERGROUND_STRUCTURES`: Used by dungeons and fossils in vanilla.
    - `SURFACE_STRUCTURES`: Used by desert well.
    - `STRONGHOLDS`: Not used.
    - `UNDERGROUND_ORES`: Used for ores, dirt/gravel/stone patches, and/gravel/clay disks.
    - `UNDERGROUND_DECORATION`: Used for infested block blobs, nether gravel and blackstone blobs, and all nether ore blobs.
    - `FLUID_SPRINGS`: Used for water and lava springs.
    - `VEGETAL_DECORATION`: Used for trees, bamboo, cacti, kelp, and other ground and ocean vegetation.
    - `TOP_LAYER_MODIFICATION`: Used for surface freezing.

:::caution
In feature step, all feature IDs need to be ordered consistently across biomes. For example, in the `UNDERGROUND_ORES` step of `minecraft:plains`, `ore_dirt` is before `ore_gravel`. In other biome's `UNDERGROUND_ORES` step, if both `ore_dirt` and `ore_gravel` as present, `ore_gravel` cannot be before `ore_dirt`.
:::

### String RGB color
A `String RGB color` is a format of metadata for color formatting. It can take one of the following format
- int value for color representing hex color. Example `4159204` is color for water in plains biome.
- An RGB list for color in format like `[0,0,0]` for black.
- A 6 digit hexadecimal value as string for example `#77e68f` for greenish tint.

## Data Generation

Biomes can be [datagenned][datagen] as using an `DatapackBuiltinEntriesProvider`. An `DatapackBuiltinEntriesProvider` accepts a `RegistrySetBuilder` with `ResourceKey` and bootstrap method to generate the JSON entries.

To Start, create an instance of `DatapackBuiltinEntriesProvider` within `GatherDataEvents`:

```java
@SubscribeEvent
public static void gatherData(GatherDataEvent.Client event) {
    event.createProvider(MyDatapackProvider::new);
}
```

Then we construct class `MyDatapackProvider` you can name it anything. To define all our datapack related entries.

```java
public class MyDatapackProvider extends DatapackBuiltinEntriesProvider {
  public static final RegistrySetBuilder BUILDER = new RegistrySetBuilder()
          .add(Registries.BIOME, MyBiomes::bootstrap)
          // Other datagenable entries
          .add(...);
  
  public YourDatapackProvider(PackOutput output, CompletableFuture<HolderLookup.Provider> registries) {
    // The set below can take multiple mod id if you are trying to generate datagen for multiple mods or something like a test instance
    super(output, registries, BUILDER, Set.of(YourModID,...));
  }
}
```

Now we can actually start generating Biomes. `MyBiome` class needs 2 thing to define the biome a `ResourceKey<Biome>` and `bootstrap` method

```java
//Class example
public class MyBiomes {
    public static final ResourceKey<Biome> EXAMPLE_BIOME = ResourceKey.create(Registries.BIOME, Identifier.fromNamespaceAndPath(MyModID, "example_biome"));

    public static void bootstrap(BootstrapContext<Biome> context) {
        // 2nd parameter of the method defines all the Biome Specifications (see above). There are a lot of helpers provided by minecraft in `OverworldBiomes`, `NetherBiomes`, `EndBiomes` classes
        context.register(EXAMPLE_BIOME, ...);
    }
}
```

[biomemodifiers]: ./biomemodifier.md
[datagen]: ../resources/index.md#data-generation