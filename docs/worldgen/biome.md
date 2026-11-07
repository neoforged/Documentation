import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Biome

A biome is a region in a world with distinct geographical features, plants, mobs, temperatures, humidity levels, colors, and more. Biomes separate every generated world into different environments, such as forests, deserts, and oceans.

# Generating your own biome

A new biome can be added by creating a JSON file in your namespace's `worldgen/biome` subfolder. So for example, if you want to add a biome named `example_biome` for a mod id `examplemod`, it will be located at `data/examplemod/worldgen/biome/example_biome.json`. A biome's ID will be related to the `biome` directory, so for our example, it would be `examplemod:example_biome`. name can be chosen, and the biome will automatically be picked up by the game. Java code is needed if you want to add additional Environment Attributes, custom carvers, custom features etc. Can be datagenned using [Datapack Registry][datapackregistries] as shown in [Data generation section](#data-generation).

# Specification

A biome JSON file has the following entries:

- `has_precipitation`: Determines whether the biome has precipitation. Boolean; if true this biome will have rain/snow depending on the `temperature`. 
- `temperature`: Controls the gameplay features like grass and foliage color if not overridden by effects (see below). Also, will determine whether it rains or snows when `has_precipitation` is `true`. It can also determine generation of some features. It snows if temperature is below 0.15 and rains if the temperature is above 0.15. It also affects surface generation in some capacity.   
  - `temerature_modifier`: Modifies temperature before calculating the height adjusted temperature. Accepts `none` or `frozen`. Optional, defaults to `none`. If `frozen`, it layers an additional noise map and making some areas rainy.
- `downfall`: Controls grass and foliage tints if not overridden by effects (see below).
- `effects`: The colors and overrides for water, foliage, and grass tints.
    - `water_color`: Tint applied to water block. Water value is `#3f76e4` for vanilla biome. Can take integer corresponding to hex color like `0`, RGB value as a list like [0,0,0] or hexadecimal value as string `#ffffff`.
    - `foliage_color`: Color for tree leaves and vines. Optional, if absent the value depends on `temperature` and `downfall`. Can take integer corresponding to hex color, RGB value as a list like [0,0,0] or hexadecimal value as string `#77e68f`.
    - `dry_foliage_color`: Color for leaf litter color.  Optional, if absent the value depends on `temperature` and `downfall`. Can take integer corresponding to hex color, RGB value as a list like [0,0,0] or hexadecimal value as string `#77e68f`.
    - `grass_color`: Color for grass blocks, short grass, tall grass, ferns, tall ferns, and sugar cane. Optional, if absent the value depends on `temperature` and `downfall`. Can take integer corresponding to hex color, RGB value as a list like [0,0,0] or hexadecimal value as string `#77e68f`.
    - `grass_color_modifier`: Some biomes have specific multiplier hard coded for the grass color this is to select one of those modifiers. Accepts `none`, `dark_forest` or `swamp`. Optional, defaults to `none`. It can be extended using [extensible enum][enumextension].
- `attributes`: Map of environment attributes applying to biome. nvironment attributes are a set of properties or modifications that affect the environment, whether visual or gameplay. All environment attributes have a default value, which can be overwritten or modified by the Dimension types, Biome definitions, timelines, or weather.List of all vanilla attributes can be found in [Minecraft wiki][enviromentattributelist]. You can also add your own environment attributes more details is given in [Enviroment Attribute section](#environment-attribute).
- `carvers`: Any number of carvers, can take tag with `#`, an array containing IDs or a singular value of carver. Required but can be empty. Can be created through JSON files or datagen.
- `features`: List of generation steps (can be empty). Usually contains 11 steps but can be more. Each entry on the list can be any number of placed features (can take tags, list of id or whole JSON object of placed feature). Placed feature determines where a Configured feature should be attempted to be placed using placement modifiers. See also [List of Generation steps][] 
- `creature_spawn_probability`: Higher value results in more creatures spawned in world generation. Optional, must be between [0,1).
- `spawn_costs`: In vanilla warped forest and soul sand valley biomes introduced a new mechanic to limit the amount of mobs that naturally spawn in them. It takes on a value for each block in the biome. Certain mobs increase that value by some number divided by their distance to the block. If a new spawn attempt would bring the "potential" of the spawning block above a certain threshold, the spawn attempt is canceled. This results in mobs not spawning too close to one another in these biomes, and new spawns in the area are completely blocked long before the full mobcap is ever reached. This all is decided by this parameter. Required, but can be empty. Only mobs listed here use the spawn cost mechanism. It is a map of entity type and spawnCostObject. Spawn cost object will contain:
    - `energy_budget`: New mob's maximum potential.
    - `charge`: New mob charge.
Mathematically mob will only spawn if the below condition is true
`sum(existing mob's charge / distance to mob) * new mob's charge < energy_buget`
- `spawners`: Entity spawning settings. Required, but can be empty. It is a Map of mob category and list of Spawner data. If a certain `mob_category` is missing then mobs in this category do not spawn.
    - `mob_category`: The key must be one of `monster`, `creature`, `ambient`, `water_creature`, `underground_water_creature`, `water_ambient`, `misc`, or `axolotls`. A list of spawner data objects, one for each mob which should spawn in this biome.
    - `spawner_data`: The spawner data for a single mob is:
        - `type`: The identifier of entity_type
        - `weight`: How often this mob should spawn, higher values produce more spawns.
        - `minCount`: The minimum count of mobs to spawn in a pack. Must be greater than 0.
        - `maxCount`: The maximum count of mobs to spawn in a pack. Must be greater than 0. And must be not less than `minCount`.

Example of a spawners object is 

```json
"spawners": {
        "monster": [
            {
                "weight": 10,
                "type": "minecraft:zombie",
                "minCount": 1,
                "maxCount": 2
            }
        ]
    }
```

:::warning
Care should be taken when adding vanilla `PlacedFeature`s to biomes, as doing so may cause what is known as a feature cycle violation (two biomes having the same two features in their feature lists, but in different orders within the same `GenerationStep`), leading to a crash. For similar reasons, you should not use the same `PlacedFeature` in more than one biome modifier.

Vanilla `PlacedFeature`s can be referenced in biome JSONs or added via biome modifiers, but should not be used in both. If you still need to add them this way, making a copy of the vanilla `PlacedFeature` under your own namespace is the easiest solution to avoid these problems.
:::

# Data Generation

<Tabs>
<TabItem value="json" label="JSON" default>

```json5
{
    "temperature": 0.5,
    "downfall": 0.5,
    "has_precipitation": false,
    "effects": {},
    "creature_spawn_probability": 0.2,
    "spawners": {
        "monster": [
            {
                "weight": 10,
                "type": "minecraft:zombie",
                "minCount": 1,
                "maxCount": 2
            }
        ]
    },
    "spawn_costs": {},
    "carvers": [],
    "features": []
}
```

</TabItem>

<TabItem value="datagen" label="Datagen">

Biomes can be [datagenned][datagen] as using a [Custom Datapack Registries][datapackregistries].
To Start, create an instance of `RegistrySetBuilder` within `GatherDataEvents` or you can use existing one you have:

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
public class MyBiomes {
    public static final ResourceKey<Biome> EXAMPLE_BIOME = ResourceKey.create(Registries.BIOME, Identifier.fromNamespaceAndPath(MyModID, "example_biome"));

    public static void bootstrap(BootstrapContext<Biome> context) {
      // lookup for all existing placed features and carver to be given to BiomeGenerationSettings.Builder
      var placedFeatures = context.lookup(Registries.PLACED_FEATURE);
      var carvers = context.lookup(Registries.CARVER);
        // There are a lot of helpers provided by minecraft in `OverworldBiomes`, `NetherBiomes`, `EndBiomes` classes
        context.register(EXAMPLE_BIOME, (new Biome.BiomeBuilder())
                .hasPrecipitation(...)
                .temperature(...)
                .downfall(...)
                // for setting environment attributes
                .setAttribute(...)
                // For 'effect' color overrides
                .specialEffects((new BiomeSpecialEffects.Builder()).build())
                // for creature spawning logic
                .mobSpawnSettings((new MobSpawnSettings.Builder()).build())
                // for generation of features and carvers
                .generationSettings(new BiomeGenerationSettings.Builder(placedFeatures, carvers).addFeature(...).build())
                .build()
        );
    }
}
```

</TabItem>
</Tabs>

# Modifying Existing Biomes

FModifying an existing biome can be done via [Biome Modifiers][biomemodifiers] hich are further explained in their own section.

# Environment Attribute

Environment attributes control various visual and gameplay features depending on the dimension, biome, time, and weather.

The environment attributes are of 3 types.
- `gameplay`: Responsible for changes in gameplay behavior like `bees_stay_in_hive`, `water_evaporates`, `villager_activity` etc.
- `audio`: Responsible for audio related behavior like `ambient_sounds`, `background_music`, `music_volume` etc.
- `visual`: Responsible for visual behavior like `water_fog_end_distance`, `sunrise_sunset_color`, `sky_color` etc.
  
Dimension types and biome definitions can overwrite and modify environment attributes using the format below.

```json5
  "attributes_id": value depending on the attribute type
```
or 

```json5
  "attributes_id" : {
    "modifier": Modifier type. Available types depend on the value type of the attribute.,
    "argument": Argument of the modifier. Valid values depend on the modifier.
  }
```

For more details check [Minecraft wiki](https://minecraft.wiki/w/Environment_attribute#Modifiers)

You can create your own by registering it

```java
    public static final DeferredRegister<EnvironmentAttribute<?>> ENVIRONMENT_ATTRIBUTES = DeferredRegister.create(modId, Registries.ENVIRONMENT_ATTRIBUTE);
    
    public static final Supplier<EnvironmentAttribute<...>> MY_ENVIROMENT_ATTRIBUTE = ENVIRONMENT_ATTRIBUTES.register("gameplay/my_enviroment_attribute", () -> ...)
```

[biomemodifiers]: ./biomemodifier.md
[datagen]: ../resources/index.md#data-generation
[enviromentattributelist]: https://minecraft.wiki/w/Environment_attribute#List_of_attributes
[listofgenerationsteps]: biomemodifier.md#available-values-for-decoration-steps
[enumextension]: ../advanced/extensibleenums.md
[datapackregistries]: ../concepts/registries.md#custom-datapack-registries