# Biome

A biome is a region in a world with distinct geographical features, plants, mobs, temperatures, humidity levels, colors, and more. Biomes separate every generated world into different environments, such as forests, deserts, and oceans.

# Generating your own biome

A new biome can be added by creating a JSON file in your namespace's `worldgen/biome` subfolder. So for example, if you want to add a biome named `example_biome` for a mod id `examplemod`, it will be located at `data/examplemod/worldgen/biome/example_biome.json`. A biome's ID will be related to the `biome` directory, so for our example, it would be `examplemod:example_biome`. name can be chosen, and the biome will automatically be picked up by the game. Java code is needed if you want to add additional Environment Attributes, custom carvers, custom features etc.

# Specification

A biome JSON file may contain the following entries:

- `has_precipitation`: Determines whether the biome has precipitation. Boolean; if true this biome will have rain/snow depending on the `temperature`. 
- `temperature`: Controls the gameplay features like grass and foliage color if not overridden by effects (see below). Also, will determine whether it rains or snows when `has_precipitation` is `true`. It can also determine generation of some features. It snows if temperature is below 0.15 and rains if the temperature is above 0.15. It also affects surface generation in some capacity.   
  - `temerature_modifier`: Modifies temperature before calculating the height adjusted temperature. Accepts `none` or `frozen`. Optional, defaults to `none`. If `frozen`, makes some places' temperature high enough to rain (0.2) by layering an additional noise map and making some areas rainy.
- `downfall`: Controls grass and foliage temperature if not overridden by effects (see below).
- `effects`: Contains `BiomeSpecialEffects` which is a holder for color of water, foliage and grass.
    - `water_color`: Color for water block color. Water value is `4159204` for plains biome is. Can take integer corresponding to hex color, RGB value as a list like [0,0,0] or hexadecimal value as string `#77e68f`.
    - `foliage_color`: Color for tree leaves and vines. Optional, if absent the value depends on `temperature` and `downfall`. Can take integer corresponding to hex color, RGB value as a list like [0,0,0] or hexadecimal value as string `#77e68f`.
    - `dry_foliage_color`: Color for leaf litter color.  Optional, if absent the value depends on `temperature` and `downfall`. Can take integer corresponding to hex color, RGB value as a list like [0,0,0] or hexadecimal value as string `#77e68f`.
    - `grass_color`: Color for grass blocks, short grass, tall grass, ferns, tall ferns, and sugar cane. Optional, if absent the value depends on `temperature` and `downfall`. Can take integer corresponding to hex color, RGB value as a list like [0,0,0] or hexadecimal value as string `#77e68f`.
    - `grass_color_modifier`: Some biomes have specific multiplier hard coded for the grass color this is to select one of those modifiers. Accepts `none`, `dark_forest` or `swamp`. Optional, defaults to `none`. It can be extended using [extensible enum][enumextension].
- `attributes`: Map of environment attributes applying to biome. There are tons of environment attributes provided by minecraft and mod can create their own with Java code. Optional;
- `carvers`: Any number of carvers, can take tag with `#`, an array containing IDs or a singular value of carver. Required but can be empty. Can be created through JSON files.
- `features`: List of generation steps (can be empty). Usually contains 11 steps but can be more. Each entry on the list can be any number of placed features (can take tags, list of id or whole JSON object of placed feature). Placed feature determines where a Configured feature should be attempted to be placed using placement modifiers.

## Available Values for Decoration Steps

The `step` or `steps` fields in many of the aforementioned JSONs are referring to the `GenerationStep.Decoration` enum. This enum has the steps listed out in the following order, which is the same order that the game uses for generating during worldgen. Try to put features in the step that makes the most sense for them.

|           Step           | Description                                                                             |
|:------------------------:|:----------------------------------------------------------------------------------------|
|     `raw_generation`     | First to run. This is used for special terrain-like features such as Small End Islands. |
|         `lakes`          | Dedicated to spawning pond-like feature such as Lava Lakes.                             |
|  `local_modifications`   | For modifications to terrain such as Geodes, Icebergs, Boulders, or Dripstone.          |
| `underground_structures` | Used for small underground structure-like features such as Dungeons or Fossils.         |
|   `surface_structures`   | For small surface only structure-like features such as Desert Wells.                    |
|      `strongholds`       | Dedicated for Stronghold structures. No feature is added here in unmodified Minecraft.  |
|    `underground_ores`    | The step for all Ores and Veins to be added to. This includes Gold, Dirt, Granite, etc. |
| `underground_decoration` | Used typically for decorating caves. Dripstone Cluster and Sculk Vein are here.         |
|     `fluid_springs`      | The small Lavafalls and Waterfalls come from features in this stage.                    |
|   `vegetal_decoration`   | Nearly all plants (flowers, trees, vines, and more) are added to this stage.            |
| `top_layer_modification` | Last to run. Used for placing Snow and Ice on the surface of cold biomes.               |

:::warning
Care should be taken when adding vanilla `PlacedFeature`s to biomes, as doing so may cause what is known as a feature cycle violation (two biomes having the same two features in their feature lists, but in different orders within the same `GenerationStep`), leading to a crash. For similar reasons, you should not use the same `PlacedFeature` in more than one biome modifier.

Vanilla `PlacedFeature`s can be referenced in biome JSONs or added via biome modifiers, but should not be used in both. If you still need to add them this way, making a copy of the vanilla `PlacedFeature` under your own namespace is the easiest solution to avoid these problems.
:::

# Data Generation

Biomes can be [datagenned][datagen] as using an [Custom Datapack Registries][datapackregistries].
To Start, create an instance of `RegistrySetBuilder` within `GatherDataEvents`:

```java
@SubscribeEvent
public static void gatherData(GatherDataEvent.Client event) {
    event.createDatapackRegistryObjects(
            new RegistrySetBuilder().add(
                    Registries.BIOME,
                    MyBiome::bootstap
            )
    );
}
```

Now we can actually start generating Biomes. Creating a biome registry requires 2 components to define the biome a `ResourceKey<Biome>` and `Biome` definition.

```java
//Class example
public class MyBiomes {
    public static final ResourceKey<Biome> EXAMPLE_BIOME = ResourceKey.create(Registries.BIOME, Identifier.fromNamespaceAndPath(MyModID, "example_biome"));

    public static void bootstrap(BootstrapContext<Biome> context) {
      var placedFeatures = context.lookup(Registries.PLACED_FEATURE);
      var carvers = context.lookup(Registries.CARVER);
        // There are a lot of helpers provided by minecraft in `OverworldBiomes`, `NetherBiomes`, `EndBiomes` classes
        context.register(EXAMPLE_BIOME, OverworldBiomes.theVoid(placedFeatures, carvers));
    }
}
```

# Modifying existing biomes

For modifying an existing biome please refer to [Biome Modifiers][biomemodifiers].

[biomemodifiers]: ./biomemodifier.md
[datagen]: ../resources/index.md#data-generation
[enumextension]: ../advanced/extensibleenums.md
[datapackregistries]: ../concepts/registries.md#custom-datapack-registries