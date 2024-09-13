import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Biome Modifiers

Biome Modifiers are a data-driven system that allows for changing many aspects of a biome. Ranging from injecting or removing PlacedFeatures, adding or deleting mob spawns, changing the climate, and adjusting foliage and water color. NeoForge provides several default Biome Modifiers that covers the majority of use cases for both players and modders.

### Recommended Section To Read:

- Players or Pack Makers:
  - '[Applying Biome Modifiers](#Applying-Biome-Modifiers)'
  - '[Built-in Neoforge Biome Modifiers](#Builtin-Neoforge-Biome-Modifiers)'


- Modders doing simple additions or removal biome modifications:
  - '[Applying Biome Modifiers](#Applying-Biome-Modifiers)'
  - '[Built-in Neoforge Biome Modifiers](#Builtin-Neoforge-Biome-Modifiers)'
  - '[Datagenning Biome Modifiers](#Datagenning-Biome-Modifiers)'


- Modders who want to do custom or complex biome modifications:
  - '[Applying Biome Modifiers](#Applying-Biome-Modifiers)'
  - '[Creating Custom Biome Modifiers](#Creating-Custom-Biome-Modifiers)'
  - '[Datagenning Biome Modifiers](#Datagenning-Biome-Modifiers)'


## Applying Biome Modifiers:

Biome Modifiers are like a set of modifications to apply to a biome when the game loads. To have NeoForge load a Biome Modifier JSON file into the game, the file will need to be under `data/<modid>/neoforge/biome_modifier/<path>.json` folder in the mod's resources or in a datapack. Then once NeoForge loads the Biome Modifier, it'll read its instructions and apply the described modifications to all target biomes when the world is loaded up. Pre-existing Biome Modifiers from mods can be overridden by datapacks having a new JSON file at the exact same location and name.

The JSON file can be created by hand following the examples in the '[Built-in NeoForge Biome Modifiers](#Builtin-Neoforge-Biome-Modifiers)' section or be datagenned as shown in the '[Datagenning Biome Modifiers](#Datagenning-Biome-Modifiers)' section.

## Builtin Neoforge Biome Modifiers:

### None

This Biome Modifier has no operation and will do no modification. Pack makers and players can use this in a datapack to disable mods' Biome Modifiers by overriding their Biome Modifier jsons with the below:

```json5
{
  "type": "neoforge:none"
}
```

### Add Features

This Biome Modifier type adds features (such as trees or ores) to biomes so that they can spawn during world generation. The modifier takes in the `Biome` id or tag of the biomes the features are added to, a `PlacedFeature` id or tag of the features to add to the selected biomes, and the [`GenerationStep.Decoration`](#The-available-values-for-the-Decoration-steps) the features will be generated within.

<Tabs>
  <TabItem value="json" label="JSON" default>

```json5
{
    "type": "neoforge:add_features",

    // Can either be an id "minecraft:plains"
    // List of ids ["minecraft:plains", "minecraft:badlands", ...]
    // Or a tag "#c:is_overworld"
    "biomes": "#namespace:your_biome_tag",

    // Can either be an id "examplemod:add_features_example"
    // List of ids ["examplemod:add_features_example", "minecraft:ice_spike", ...]
    // Or a tag "#examplemod:placed_feature_tag"
    "features": "namespace:your_feature",

    // See GenerationStep.Decoration enum in code for a list of valid enum names.
    // The Decoration step section further down also has the list of values for reference.
    "step": "underground_ores"
}
```

  </TabItem>
  <TabItem value="datagen" label="Datagen">

```java
// Assume we have some PlacedFeature EXAMPLE_PLACED_FEATURE

// Define keys for datapack registry objects

public static final ResourceKey<BiomeModifier> ADD_FEATURES_EXAMPLE =
    ResourceKey.create(
        NeoForgeRegistries.Keys.BIOME_MODIFIERS, // The registry this key is for
        ResourceLocation.fromNamespaceAndPath(MOD_ID, "add_features_example") // The registry name
    );

// For some RegistrySetBuilder BUILDER
//   being passed to DatapackBuiltinEntriesProvider
//   in a listener for GatherDataEvent
BUILDER.add(NeoForgeRegistries.Keys.BIOME_MODIFIERS, bootstrap -> {
    // Lookup any necessary registries
    // Static registries only need to be looked up if you need to grab the tag data
    HolderGetter<Biome> biomes = bootstrap.lookup(Registries.BIOME);
    HolderGetter<PlacedFeature> placedFeatures = bootstrap.lookup(Registries.PLACED_FEATURE);

    // Register the Biome Modifiers

    bootstrap.register(ADD_FEATURES_EXAMPLE,
        new AddFeaturesBiomeModifier(
            // The biome(s) to generate within
            HolderSet.direct(biomes.getOrThrow(Biomes.PLAINS)),
            // The feature(s) to generate within the biomes
            HolderSet.direct(placedFeatures.getOrThrow(EXAMPLE_PLACED_FEATURE)),
            // The generation step
            GenerationStep.Decoration.LOCAL_MODIFICATIONS
        )
    );
})
```

  </TabItem>
</Tabs>


:::warning
- Avoid using Biome Modifiers to add vanilla placed features to biomes, as this may cause a feature cycle violation (the game will crash if two biomes have the same two features in their feature lists but in different orders within same GenerationStep). Placed features can be referenced in biome jsons or added via Biome Modifiers, but should not be used in both. Make a new copy of a vanilla Placed Feature is ideal for adding it safely to biomes.

- Avoid adding the same placed feature with more than one Biome Modifier, as this can cause feature cycle violations.
:::

### Remove Features

This Biome Modifier type removes features (such as trees or ores) from biomes so that they will no longer spawn during world generation. The modifier takes in the `Biome` id or tag of the biomes the features are removed from, a `PlacedFeature` id or tag of the features to remove from the selected biomes, and the [`GenerationStep.Decoration`](#The-available-values-for-the-Decoration-steps)s that the features will be removed from.

<Tabs>
  <TabItem value="json" label="JSON" default>

```json5
{
    "type": "neoforge:remove_features",

    // Can either be an id "minecraft:plains"
    // List of ids ["minecraft:plains", "minecraft:badlands", ...]
    // Or a tag "#c:is_overworld"
    "biomes": "#namespace:your_biome_tag",

    // Can either be an id "minecraft:plains"
    // List of ids ["minecraft:plains", "minecraft:badlands", ...]
    // Or a tag "#c:is_overworld"
    "features": "namespace:problematic_feature",
  
    // Optional field specifying a GenerationStep or list of GenerationSteps to remove features from, defaults to all if not specified.
    // See GenerationStep.Decoration enum in code for a list of valid enum names.
    // The Decoration step section further down also has the list of values for reference.
    "steps": [ "underground_ores", "underground_ores" ] 
}
```

  </TabItem>
  <TabItem value="datagen" label="Datagen">

```java
// Define keys for datapack registry objects

public static final ResourceKey<BiomeModifier> REMOVE_FEATURES_EXAMPLE =
    ResourceKey.create(
        NeoForgeRegistries.Keys.BIOME_MODIFIERS, // The registry this key is for
        ResourceLocation.fromNamespaceAndPath(MOD_ID, "remove_features_example") // The registry name
    );

// For some RegistrySetBuilder BUILDER
//   being passed to DatapackBuiltinEntriesProvider
//   in a listener for GatherDataEvent
BUILDER.add(NeoForgeRegistries.Keys.BIOME_MODIFIERS, bootstrap -> {
    // Lookup any necessary registries
    // Static registries only need to be looked up if you need to grab the tag data
    HolderGetter<Biome> biomes = bootstrap.lookup(Registries.BIOME);
    HolderGetter<PlacedFeature> placedFeatures = bootstrap.lookup(Registries.PLACED_FEATURE);

    // Register the Biome Modifiers

    bootstrap.register(REMOVE_FEATURES_EXAMPLE,
        new RemoveFeaturesBiomeModifier(
            // The biome(s) to remove from
            biomes.getOrThrow(Tags.Biomes.IS_OVERWORLD),
            // The feature(s) to remove from the biomes
            HolderSet.direct(placedFeatures.getOrThrow(OrePlacements.ORE_DIAMOND)),
            // The generation steps to remove from
            Set.of(
                GenerationStep.Decoration.LOCAL_MODIFICATIONS,
                GenerationStep.Decoration.UNDERGROUND_ORES
            )
        )
    );
})
```

  </TabItem>
</Tabs>


### Add Spawns 

This Biome Modifier type adds mob spawns to biomes. The modifier takes in the `Biome` id or tag of the biomes the spawning information are added to and the `SpawnerData` of the mobs to add. Each `SpawnerData` contains the mob id, the spawn weight, and the minimum/maximum number of mobs to spawn at a given time.

**NOTE:** If you are a modder adding a new mob, make sure the mob has a spawn restriction registered to RegisterSpawnPlacementsEvent event.

<Tabs>
  <TabItem value="json" label="JSON" default>

```json5
{
    "type": "neoforge:add_spawns",

    // Can either be an id "minecraft:plains"
    // List of ids ["minecraft:plains", "minecraft:badlands", ...]
    // Or a tag "#c:is_overworld"
    "biomes": "#namespace:biome_tag", 
  
    // Can be either a single object or a list of objects
    "spawners": [
      {
        "type": "namespace:entity_type", // Type of mob to spawn
        "weight": 100, // int, spawn weighting
        "minCount": 1, // int, minimum pack size
        "maxCount": 4 // int, maximum pack size
      },
      {
        "type": "minecraft:ghast",
        "weight": 1,
        "minCount": 5,
        "maxCount": 10
      }
    ]
}
```

  </TabItem>
  <TabItem value="datagen" label="Datagen">

```java
// Assume we have some EntityType EXAMPLE_ENTITY

// Define keys for datapack registry objects

public static final ResourceKey<BiomeModifier> ADD_SPAWNS_EXAMPLE =
    ResourceKey.create(
        NeoForgeRegistries.Keys.BIOME_MODIFIERS, // The registry this key is for
        ResourceLocation.fromNamespaceAndPath(MOD_ID, "add_spawns_example") // The registry name
    );

// For some RegistrySetBuilder BUILDER
//   being passed to DatapackBuiltinEntriesProvider
//   in a listener for GatherDataEvent
BUILDER.add(NeoForgeRegistries.Keys.BIOME_MODIFIERS, bootstrap -> {
    // Lookup any necessary registries
    // Static registries only need to be looked up if you need to grab the tag data
    HolderGetter<Biome> biomes = bootstrap.lookup(Registries.BIOME);

    // Register the Biome Modifiers

    bootstrap.register(ADD_SPAWNS_EXAMPLE,
        new AddSpawnsBiomeModifier(
            // The biome(s) to spawn the mobs within
            HolderSet.direct(biomes.getOrThrow(Biomes.PLAINS)),
            // The spawners of the entities to add
            List.of(
                new SpawnerData(EXAMPLE_ENTITY, 100, 1, 4),
                new SpawnerData(EntityType.GHAST, 1, 5, 10)
            )
        )
    );
})
```

  </TabItem>
</Tabs>


### Remove Spawns

This Biome Modifier type removes mob spawns from biomes. The modifier takes in the `Biome` id or tag of the biomes the spawning information are removed from and the `EntityType` id or tag of the mobs to remove.

<Tabs>
  <TabItem value="json" label="JSON" default>

```json5
{
    "type": "neoforge:remove_spawns",

    // Can either be an id "minecraft:plains"
    // List of ids ["minecraft:plains", "minecraft:badlands", ...]
    // Or a tag "#c:is_overworld"
    "biomes": "#namespace:biome_tag",

    // Can either be an id "minecraft:ghast"
    // List of ids ["minecraft:ghast", "minecraft:skeleton", ...]
    // Or a tag "#minecraft:skeletons"
    "entity_types": "#namespace:entitytype_tag"
}
```

  </TabItem>
  <TabItem value="datagen" label="Datagen">

```java
// Define keys for datapack registry objects

public static final ResourceKey<BiomeModifier> REMOVE_SPAWNS_EXAMPLE =
    ResourceKey.create(
        NeoForgeRegistries.Keys.BIOME_MODIFIERS, // The registry this key is for
        ResourceLocation.fromNamespaceAndPath(MOD_ID, "remove_spawns_example") // The registry name
    );

// For some RegistrySetBuilder BUILDER
//   being passed to DatapackBuiltinEntriesProvider
//   in a listener for GatherDataEvent
BUILDER.add(NeoForgeRegistries.Keys.BIOME_MODIFIERS, bootstrap -> {
    // Lookup any necessary registries
    // Static registries only need to be looked up if you need to grab the tag data
    HolderGetter<Biome> biomes = bootstrap.lookup(Registries.BIOME);
    HolderGetter<EntityType<?>> entities = bootstrap.lookup(Registries.ENTITY_TYPE);

    // Register the Biome Modifiers

    bootstrap.register(REMOVE_SPAWNS_EXAMPLE,
        new RemoveSpawnsBiomeModifier(
            // The biome(s) to remove the spawns from
            biomes.getOrThrow(Tags.Biomes.IS_OVERWORLD),
            // The entities to remove spawns for
            entities.getOrThrow(EntityTypeTags.SKELETONS)
        )
    );
})
```

  </TabItem>
</Tabs>


### Add Spawn Costs

Allows for adding new Spawn Costs to biomes. Spawn Costs are a newer way of making mobs spawn spread out in a biome to reduce clustering. It works by having the entities give off a `charge` that surrounds them and adds up with other entity's `charge`. Then when spawning, it looks for a spot where the total `charge` field at the location multiplied by the spawning entity's `charge` value is less than the spawning entity's `energy_budget`. This is an advanced way of spawning mobs so it is a good idea to reference the Soul Sand Valley Biome for existing values to borrow.

The modifier takes in the `Biome` id or tag of the biomes the spawn costs are added to, the `EntityType` id or tag of the mobs to add spawn costs for, and the `MobSpawnSettings.MobSpawnCost` of the mob. The `MobSpawnCost` contains the energy budget, which indicates the maximum number of entities that can spawn in a location based upon the charge provided for each entity spawned.

**NOTE:** If you are a modder adding a new mob, make sure the mob has a spawn restriction registered to RegisterSpawnPlacementsEvent event.

<Tabs>
  <TabItem value="json" label="JSON" default>

```json5
{
    "type": "neoforge:add_spawn_costs",
    // Can either be an id "minecraft:plains"
    // List of ids ["minecraft:plains", "minecraft:badlands", ...]
    // Or a tag "#c:is_overworld"
    "biomes": "#c:is_overworld",
    // Can either be an id "minecraft:ghast"
    // List of ids ["minecraft:ghast", "minecraft:skeleton", ...]
    // Or a tag "#minecraft:skeletons"
    "entity_types": "#minecraft:skeletons",
    "spawn_cost": {
        // The energy budget
        "energy_budget": 1.0,
        // The amount of charge each entity takes up from the budget
        "charge": 0.1
    }
}
```

  </TabItem>
  <TabItem value="datagen" label="Datagen">

```java
// Define keys for datapack registry objects

public static final ResourceKey<BiomeModifier> ADD_SPAWN_COSTS_EXAMPLE =
    ResourceKey.create(
        NeoForgeRegistries.Keys.BIOME_MODIFIERS, // The registry this key is for
        ResourceLocation.fromNamespaceAndPath(MOD_ID, "add_spawn_costs_example") // The registry name
    );

// For some RegistrySetBuilder BUILDER
//   being passed to DatapackBuiltinEntriesProvider
//   in a listener for GatherDataEvent
BUILDER.add(NeoForgeRegistries.Keys.BIOME_MODIFIERS, bootstrap -> {
    // Lookup any necessary registries
    // Static registries only need to be looked up if you need to grab the tag data
    HolderGetter<Biome> biomes = bootstrap.lookup(Registries.BIOME);
    HolderGetter<EntityType<?>> entities = bootstrap.lookup(Registries.ENTITY_TYPE);

    // Register the Biome Modifiers

    bootstrap.register(ADD_SPAWN_COSTS_EXAMPLE,
        new AddSpawnCostsBiomeModifier(
            // The biome(s) to add the spawn costs to
            biomes.getOrThrow(Tags.Biomes.IS_OVERWORLD),
            // The entities to add the spawn costs for
            entities.getOrThrow(EntityTypeTags.SKELETONS),
            new MobSpawnSettings.MobSpawnCost(
                1.0, // The energy budget
                0.1  // The amount of charge each entity takes up from the budget
            )
        )
    );
})
```

  </TabItem>
</Tabs>


### Remove Spawn Costs

Allows for removing a Spawn Cost from a biome. Spawn Costs are a newer way of making mobs spawn spread out in a biome to reduce clustering. The modifier takes in the `Biome` id or tag of the biomes the spawn costs are removed from and the `EntityType` id or tag of the mobs to remove the spawn cost for.

<Tabs>
  <TabItem value="json" label="JSON" default>

```json5
{
    "type": "neoforge:remove_spawn_costs",
    // Can either be an id "minecraft:plains"
    // List of ids ["minecraft:plains", "minecraft:badlands", ...]
    // Or a tag "#c:is_overworld"
    "biomes": "#c:is_overworld",
    // Can either be an id "minecraft:ghast"
    // List of ids ["minecraft:ghast", "minecraft:skeleton", ...]
    // Or a tag "#minecraft:skeletons"
    "entity_types": "#minecraft:skeletons"
}
```

  </TabItem>
  <TabItem value="datagen" label="Datagen">

```java
// Define keys for datapack registry objects

public static final ResourceKey<BiomeModifier> REMOVE_SPAWN_COSTS_EXAMPLE =
    ResourceKey.create(
        NeoForgeRegistries.Keys.BIOME_MODIFIERS, // The registry this key is for
        ResourceLocation.fromNamespaceAndPath(MOD_ID, "remove_spawn_costs_example") // The registry name
    );

// For some RegistrySetBuilder BUILDER
//   being passed to DatapackBuiltinEntriesProvider
//   in a listener for GatherDataEvent
BUILDER.add(NeoForgeRegistries.Keys.BIOME_MODIFIERS, bootstrap -> {
    // Lookup any necessary registries
    // Static registries only need to be looked up if you need to grab the tag data
    HolderGetter<Biome> biomes = bootstrap.lookup(Registries.BIOME);
    HolderGetter<EntityType<?>> entities = bootstrap.lookup(Registries.ENTITY_TYPE);

    // Register the Biome Modifiers

    bootstrap.register(REMOVE_SPAWN_COSTS_EXAMPLE,
        new RemoveSpawnCostsBiomeModifier(
            // The biome(s) to remove the spawnc costs from
            biomes.getOrThrow(Tags.Biomes.IS_OVERWORLD),
            // The entities to remove spawn costs for
            entities.getOrThrow(EntityTypeTags.SKELETONS)
        )
    );
})
```

  </TabItem>
</Tabs>


### Add Legacy Carvers

This Biome Modifier type allows adding Carver Caves and Ravines to biomes. (Think of what caves looked like pre-Caves and Cliffs update) This CANNOT add Noise Caves to biomes because Noise Caves are baked into the dimension's Noise Setting system and not actually tied to biomes. The legacy carvers are specifically Ravines and Carver Caves.

<Tabs>
  <TabItem value="json" label="JSON" default>

```json5
{
    "type": "neoforge:add_carvers",
    // Can either be an id "minecraft:plains"
    // List of ids ["minecraft:plains", "minecraft:badlands", ...]
    // Or a tag "#c:is_overworld"
    "biomes": "minecraft:plains",
    // Can either be an id "examplemod:add_carvers_example"
    // List of ids ["examplemod:add_carvers_example", "minecraft:canyon", ...]
    // Or a tag "#examplemod:configured_carver_tag"
    "carvers": "examplemod:add_carvers_example",
    // See GenerationStep.Carving in code for a list of valid enum names.
    // Only `air` and `liquid` are available.
    "step": "air"
}
```

  </TabItem>
  <TabItem value="datagen" label="Datagen">

```java
// Assume we have some ConfiguredWorldCarver EXAMPLE_CARVER

// Define keys for datapack registry objects

public static final ResourceKey<BiomeModifier> ADD_CARVERS_EXAMPLE =
    ResourceKey.create(
        NeoForgeRegistries.Keys.BIOME_MODIFIERS, // The registry this key is for
        ResourceLocation.fromNamespaceAndPath(MOD_ID, "add_carvers_example") // The registry name
    );

// For some RegistrySetBuilder BUILDER
//   being passed to DatapackBuiltinEntriesProvider
//   in a listener for GatherDataEvent
BUILDER.add(NeoForgeRegistries.Keys.BIOME_MODIFIERS, bootstrap -> {
    // Lookup any necessary registries
    // Static registries only need to be looked up if you need to grab the tag data
    HolderGetter<Biome> biomes = bootstrap.lookup(Registries.BIOME);
    HolderGetter<ConfiguredWorldCarver<?>> carvers = bootstrap.lookup(Registries.CONFIGURED_CARVER);

    // Register the Biome Modifiers

    bootstrap.register(ADD_CARVERS_EXAMPLE,
        new AddCarversBiomeModifier(
            // The biome(s) to generate within
            HolderSet.direct(biomes.getOrThrow(Biomes.PLAINS)),
            // The carver(s) to generate within the biomes
            HolderSet.direct(carvers.getOrThrow(EXAMPLE_CARVER)),
            // The generation step
            GenerationStep.Carving.AIR
        )
    );
})
```

  </TabItem>
</Tabs>

### Removing Legacy Carvers

This Biome Modifier type allows removing Carver Caves and Ravines from biomes. (Think of what caves looked like pre-Caves and Cliffs update) This CANNOT remove Noise Caves to biomes because Noise Caves are baked into the dimension's Noise Setting system and not actually tied to biomes. The legacy carvers are specifically Ravines and Carver Caves.

<Tabs>
  <TabItem value="json" label="JSON" default>

```json5
{
    "type": "neoforge:remove_carvers",
    // Can either be an id "minecraft:plains"
    // List of ids ["minecraft:plains", "minecraft:badlands", ...]
    // Or a tag "#c:is_overworld"
    "biomes": "#c:is_overworld",
    // Can either be an id "minecraft:cave"
    // List of ids ["minecraft:cave", "minecraft:canyon", ...]
    // Or a tag "#examplemod:configured_carver_tag"
    "carvers": "minecraft:cave",
    // Can either be a single step "air"
    // Or a list ["air", "liquid"]
    // See GenerationStep.Carving for a list of valid enum names.
    "steps": [
        "air",
        "liquid"
    ]
}
```

  </TabItem>
  <TabItem value="datagen" label="Datagen">

```java
// Define keys for datapack registry objects

public static final ResourceKey<BiomeModifier> REMOVE_CARVERS_EXAMPLE =
    ResourceKey.create(
        NeoForgeRegistries.Keys.BIOME_MODIFIERS, // The registry this key is for
        ResourceLocation.fromNamespaceAndPath(MOD_ID, "remove_carvers_example") // The registry name
    );

// For some RegistrySetBuilder BUILDER
//   being passed to DatapackBuiltinEntriesProvider
//   in a listener for GatherDataEvent
BUILDER.add(NeoForgeRegistries.Keys.BIOME_MODIFIERS, bootstrap -> {
    // Lookup any necessary registries
    // Static registries only need to be looked up if you need to grab the tag data
    HolderGetter<Biome> biomes = bootstrap.lookup(Registries.BIOME);
    HolderGetter<ConfiguredWorldCarver<?>> carvers = bootstrap.lookup(Registries.CONFIGURED_CARVER);

    // Register the Biome Modifiers

    bootstrap.register(REMOVE_CARVERS_EXAMPLE,
        new AddFeaturesBiomeModifier(
            // The biome(s) to remove from
            biomes.getOrThrow(Tags.Biomes.IS_OVERWORLD),
            // The carver(s) to remove from the biomes
            HolderSet.direct(carvers.getOrThrow(Carvers.CAVE)),
            // The generation steps to remove from
            Set.of(
                GenerationStep.Carving.AIR,
                GenerationStep.Carving.LIQUID
            )
        )
    );
})
```

  </TabItem>
</Tabs>

### The available values for the Decoration steps

The `step` field in many of these JSONs are referring to GenerationStep.Decoration enum. This enum has the steps listed out in this order which is the same order that the game uses for generating during worldgen. Try to put features in the stage that makes the most sense for them.

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
|     `fluid_springs`      | The small Lavafalls and Waterfalls comes from features in this stage.                   |
|   `vegetal_decoration`   | Nearly all plants (flowers, trees, vines, and more) are added to this stage.            |
| `top_layer_modification` | Last to run. Used for placing Snow and Ice on the surface of cold biomes.               |


## Datagenning Biome Modifiers:

A `BiomeModifier` JSON can be created with [data generation][datagen] by passing a `RegistrySetBuilder` to `DatapackBuiltinEntriesProvider`. The JSON will be placed at `data/<modid>/neoforge/biome_modifier/<path>.json`.

```java
// Define keys for datapack registry objects

public static final ResourceKey<BiomeModifier> EXAMPLE_MODIFIER =
    ResourceKey.create(
        NeoForgeRegistries.Keys.BIOME_MODIFIERS, // The registry this key is for
        ResourceLocation.fromNamespaceAndPath(MOD_ID, "example_modifier") // The registry name
    );

// For some RegistrySetBuilder BUILDER
// being passed to DatapackBuiltinEntriesProvider
// in a listener for GatherDataEvent
BUILDER.add(NeoForgeRegistries.Keys.BIOME_MODIFIERS, bootstrap -> {
    // Lookup any necessary registries
    // Static registries only need to be looked up if you need to grab the tag data
    HolderGetter<Biome> biomes = bootstrap.lookup(Registries.BIOME);

    // Register the Biome Modifiers

    bootstrap.register(EXAMPLE_MODIFIER,
        new ExampleBiomeModifier(
            biomes.getOrThrow(Tags.Biomes.IS_OVERWORLD),
            20
        )
    );
})
```

```json5
// In data/examplemod/neoforge/biome_modifier/example_modifier.json
{
    // The registy key of the MapCodec for the modifier
    "type": "examplemod:example_biome_modifier",
    // All additional settings are applied to the root object
    "biomes": "#c:is_overworld",
    "value": 20
}
```

## Creating Custom Biome Modifiers:

### The `BiomeModifier` Implementation

Under the hood, Biome Modifiers are made up of three parts:

- The [datapack registered][datareg] `BiomeModifier` used to modify the biome builder.
- The [statically registered][staticreg] `MapCodec` that encodes and decodes the modifiers.
- The JSON that constructs the `BiomeModifier`, using the registered id of the `MapCodec` as the indexable type.

A `BiomeModifier` contains two methods: `#modify` and `#codec`. `modify` takes in the current `Biome` being constructor, the modifier `BiomeModifier.Phase`, and the builder of the biome to modify. Every `BiomeModifier` is called once per `Phase` to organize when certain modifications to the biome should occur:

| Phase               | Description                                                              |
|:-------------------:|:-------------------------------------------------------------------------|
| `BEFORE_EVERYTHING` | A catch-all for everything that needs to run before the standard phases. |
| `ADD`               | Adding features, mob spawns, etc.                                        |
| `REMOVE`            | Removing features, mob spawns, etc.                                      |
| `MODIFY`            | Modifying single values (e.g., climate, colors).                         |
| `AFTER_EVERYTHING`  | A catch-all for everything that needs to run after the standard phases.  |

All Biome Modifiers contain a `type` key that references the id of the `MapCodec` used for the Biome Modifier. The `codec` takes in the `MapCodec` that encodes and decodes the modifiers. This `MapCodec` is [statically registered][staticreg], with its id used as the type of the Biome Modifier.

```java
public record ExampleBiomeModifier(HolderSet<Biome> biomes, int value) implements BiomeModifier {
    
    @Override
    public void modify(Holder<Biome> biome, Phase phase, ModifiableBiomeInfo.BiomeInfo.Builder builder) {
        if (phase == /* Pick the phase that best matches what your want to modify */) {
            // Modify the 'builder', checking any information about the biome itself
        }
    }

    @Override
    public MapCodec<? extends BiomeModifier> codec() {
        return EXAMPLE_BIOME_MODIFIER.value();
    }
}

// In some registration class
private static final DeferredRegister<MapCodec<? extends BiomeModifier>> REGISTRAR =
    DeferredRegister.create(NeoForgeRegistries.Keys.BIOME_MODIFIER_SERIALIZERS, MOD_ID);

public static final Holder<MapCodec<? extends BiomeModifier>> EXAMPLE_BIOME_MODIFIER =
    REGISTRAR.register("example_biome_modifier", () -> RecordCodecBuilder.mapCodec(instance ->
        instance.group(
            Biome.LIST_CODEC.fieldOf("biomes").forGetter(ExampleBiomeModifier::biomes),
            Codec.INT.fieldOf("value").forGetter(ExampleBiomeModifier::value)
        ).apply(instance, ExampleBiomeModifier::new)
    ));
```

[datareg]: ../concepts/registries.md#datapack-registries
[staticreg]: ../concepts/registries.md#methods-for-registering
[datagen]: ../resources/index.md#data-generation