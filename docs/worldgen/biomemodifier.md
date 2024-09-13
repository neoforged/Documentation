# Biome Modifiers

Biome Modifiers are a data-driven system that allows for changing many aspects of a biome. Ranging from injecting or removing PlacedFeatures, adding or deleting mob spawns, changing the climate, and adjusting foliage and water color. NeoForge provides several default Biome Modifiers that covers the majority of use cases for both players and modders.

For players and pack makers, you will want to see the '[Applying Biome Modifiers](#Applying-Biome-Modifiers)' section and '[Built-in Neoforge Biome Modifiers](#Builtin-Neoforge-Biome-Modifiers)' section.

For modders looking to do basic goals, you will want to see the [#Applying-Biome-Modifiers](#Applying-Biome-Modifiers) section, [#Builtin-Neoforge-Biome-Modifiers](#Builtin-Neoforge-Biome-Modifiers) section, and possibly the [#Datagenning-Biome-Modifiers](#Datagenning-Biome-Modifiers) section if you prefer to datagen.

For modders looking to do advance custom Biome Modifiers, check out the [#Applying-Biome-Modifiers](#Applying-Biome-Modifiers) section and [#Creating-Custom-Biome-Modifiers](#Creating-Custom-Biome-Modifiers) section.

## Applying Biome Modifiers:

To apply a Biome Modifier, the JSON file will need to be under `data/<modid>/neoforge/biome_modifier/<path>.json` folder in the mod's resources or in a datapack. Neoforge will automatically detect and load the Biome Modifier and apply it to the game. Existing Biome Modifiers can be overridden by having a new JSON file at the exact same location and name.

The JSON file can be created by hand following the examples in [#Builtin-Neoforge-Biome-Modifiers](#Builtin-Neoforge-Biome-Modifiers) section or be datagenned as shown in [#Datagenning-Biome-Modifiers](#Datagenning-Biome-Modifiers) section.

## Builtin Neoforge Biome Modifiers:

### None

A no-op Biome Modifier type, whose jsons have the following format:
```json5
{
  "type": "neoforge:none"
}
```

This allows pack devs or server operators to disable mods' Biome Modifiers by overriding their Biome Modifier jsons with the above.

### Add Features

This Biome Modifier type adds placed features to biomes. The modifier takes in the `Biome` id or tag of the biomes the features are added to, a `PlacedFeature` id or tag of the features to add to the selected biomes, and the [`GenerationStep.Decoration`](#The-available-values-for-the-Decoration-steps) the features will be generated within.

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

### Remove Features

This Biome Modifier type removes features from biomes. The modifier takes in the `Biome` id or tag of the biomes the features are removed from, a PlacedFeature id or tag of the features to remove from the selected biomes, and the [`GenerationStep.Decoration`](#The-available-values-for-the-Decoration-steps)s that the features will be removed from.

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
    "features": "namespace:your_feature",
  
    // Optional field specifying a GenerationStep or list of GenerationSteps to remove features from, defaults to all if not specified.
    // See GenerationStep.Decoration enum in code for a list of valid enum names.
    // The Decoration step section further down also has the list of values for reference.
    "steps": [ "underground_ores", "underground_ores" ] 
}
```

### Add Spawns 

This Biome Modifier type adds mob spawns to biomes. The modifier takes in the `Biome` id or tag of the biomes the spawning information are added to and the `SpawnerData` of the mobs to add. Each `SpawnerData` contains the mob id, the spawn weight, and the minimum/maximum number of mobs to spawn at a given time.

```json5
{
    "type": "forge:add_spawns",

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

### Remove Spawns

This Biome Modifier type removes mob spawns from biomes. The modifier takes in the `Biome` id or tag of the biomes the spawning information are removed from and the `EntityType` id or tag of the mobs to remove.

```json5
{
    "type": "forge:remove_spawns",

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

### Add Spawn Costs

Allows for adding new Spawn Costs to biomes. Spawn Costs are a newer way of making mobs spawn spread out in a biome to reduce clustering. The modifier takes in the `Biome` id or tag of the biomes the spawn costs are added to, the `EntityType` id or tag of the mobs to add spawn costs for, and the `MobSpawnSettings.MobSpawnCost` of the mob. The `MobSpawnCost` contains the energy budget, which indicates the maximum number of entities that can spawn in a location based upon the charge provided for each entity spawned.

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

### Remove Spawn Costs

Allows for removing a Spawn Cost from a biome. Spawn Costs are a newer way of making mobs spawn spread out in a biome to reduce clustering. The modifier takes in the `Biome` id or tag of the biomes the spawn costs are removed from and the `EntityType` id or tag of the mobs to remove the spawn cost for.

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

### Add Legacy Carvers

This Biome Modifier type allows adding old caves and ravines to biomes. This CANNOT add Noise Caves to biomes because Noise Caves are baked into the dimension's Noise Setting system and not actually tied to biomes. The legacy carvers are specifically ravines and old caves.

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

### Removing Legacy Carvers

This Biome Modifier type allows removing old caves and ravines from biomes. This CANNOT remove Noise Caves to biomes because Noise Caves are baked into the dimension's Noise Setting system and not actually tied to biomes. The legacy carvers are specifically ravines and old caves.

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

### Word of Warning

- Avoid using Biome Modifiers to add vanilla placed features to biomes, as this may cause a feature cycle violation (the game will crash if two biomes have the same two features in their feature lists but in different orders within same GenerationStep). Placed features can be referenced in biome jsons or added via Biome Modifiers, but should not be used in both. Make a new copy of a vanilla Placed Feature is ideal for adding it safely to biomes.


- Avoid adding the same placed feature with more than one Biome Modifier, as this can cause feature cycle violations.

### The available values for the Decoration steps

The `step` field in many of these JSONs are referring to GenerationStep.Decoration enum. This enum has the steps listed out in this order which is the same order that the game uses for generating during worldgen:

    raw_generation
    lakes
    local_modifications
    underground_structures
    surface_structures
    strongholds
    underground_ores
    underground_decoration
    fluid_springs
    vegetal_decoration
    top_layer_modification


## Datagenning Biome Modifiers:

A `BiomeModifier` can be with [data generation][datagen] by passing a `RegistrySetBuilder` to `DatapackBuiltinEntriesProvider`. Biome Modifiers are located within `data/<modid>/neoforge/biome_modifier/<path>.json` All Biome Modifiers contain a `type` key that references the id of the `MapCodec` used for the Biome Modifier. All other settings provided by the Biome Modifier are added as additional keys on the root object.

```java
// Define keys for datapack registry objects

public static final ResourceKey<BiomeModifier> EXAMPLE_MODIFIER =
    ResourceKey.create(
        NeoForgeRegistries.Keys.BIOME_MODIFIERS, // The registry this key is for
        ResourceLocation.fromNamespaceAndPath(MOD_ID, "example_modifier") // The registry name
    );

// For some RegistrySetBuilder BUILDER
//   being passed to DatapackBuiltinEntriesProvider
//   in a listener for GatherDataEvent
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

### Datagenning Existing Biome Modifiers

NeoForge provides some basic Biome Modifiers for common usecases. The datagen implementation will be shown. All Biome Modifiers can be found in `BiomeModifiers`.

### `AddFeaturesBiomeModifier`

`AddFeaturesBiomeModifier` adds features, such as ore generation, to biomes. The modifier takes in the `Biome` id or tag of the biomes the features are added to, a `PlacedFeature` id or tag of the features to add to the selected biomes, and the [`GenerationStep.Decoration`](#The-available-values-for-the-Decoration-steps) the features will be generated within.

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

### `RemoveFeaturesBiomeModifier`

`RemoveFeaturesBiomeModifier` removes features from biomes. The modifier takes in the `Biome` id or tag of the biomes the features are removed from, a `PlacedFeature` id or tag of the features to remove from the selected biomes, and the [`GenerationStep.Decoration`](#The-available-values-for-the-Decoration-steps)`s that the features will be removed from.

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

### `AddSpawnsBiomeModifier`

`AddSpawnsBiomeModifier` adds mob spawning information to be used by `NaturalSpawner` to biomes. The modifier takes in the `Biome` id or tag of the biomes the spawning information are added to and the `SpawnerData` of the mobs to add. Each `SpawnerData` contains the mob id, the spawn weight, and the minimum/maximum number of mobs to spawn at a given time.

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

### `RemoveSpawnsBiomeModifier`

`RemoveSpawnsBiomeModifier` removes mob spawning information from biomes. The modifier takes in the `Biome` id or tag of the biomes the spawning information are removed from and the `EntityType` id or tag of the mobs to remove.

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

### `AddCarversBiomeModifier`

`AddCarversBiomeModifier` adds carvers, such as caves, to biomes. The modifier takes in the `Biome` id or tag of the biomes the carvers are added to, a `ConfiguredWorldCarver` id or tag of the carvers to add to the selected biomes, and the `GenerationStep.Carving` the carvers will be generated within.

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

### `RemoveCarversBiomeModifier`

`RemoveCarversBiomeModifier` removes carvers from biomes. The modifier takes in the `Biome` id or tag of the biomes the carvers are removed from, a `ConfiguredWorldCarver` id or tag of the carvers to remove from the selected biomes, and the `GenerationStep.Carving`s that the carvers will be removed from.

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

### `AddSpawnCostsBiomeModifier`

`AddSpawnCostsBiomeModifier` adds spawn costs for mobs to biomes. The modifier takes in the `Biome` id or tag of the biomes the spawn costs are added to, the `EntityType` id or tag of the mobs to add spawn costs for, and the `MobSpawnSettings.MobSpawnCost` of the mob. The `MobSpawnCost` contains the energy budget, which indicates the maximum number of entities that can spawn in a location based upon the charge provided for each entity spawned.

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

### `RemoveSpawnCostsBiomeModifier`

`RemoveSpawnsBiomeModifier` removes spawn costs for mobs from biomes. The modifier takes in the `Biome` id or tag of the biomes the spawn costs are removed from and the `EntityType` id or tag of the mobs to remove the spawn cost for.

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

## Creating Custom Biome Modifiers:

Biome Modifiers are made up of three parts:

- The [datapack registered][datareg] `BiomeModifier` used to modify the biome builder.
- The [statically registered][staticreg] `MapCodec` that encodes and decodes the modifiers.
- The JSON that constructs the `BiomeModifier`, using the registered id of the `MapCodec` as the indexable type.

### The `BiomeModifier` Implementation

A `BiomeModifier` contains two methods: `#modify` and `#codec`. `modify` takes in the current `Biome` being constructor, the modifier `BiomeModifier.Phase`, and the builder of the biome to modify. Every `BiomeModifier` is called once per `Phase` to organize when certain modifications to the biome should occur:

| Phase               | Description                                                              |
|:-------------------:|:-------------------------------------------------------------------------|
| `BEFORE_EVERYTHING` | A catch-all for everything that needs to run before the standard phases. |
| `ADD`               | Adding features, mob spawns, etc.                                        |
| `REMOVE`            | Removing features, mob spawns, etc.                                      |
| `MODIFY`            | Modifying single values (e.g., climate, colors).                         |
| `AFTER_EVERYTHING`  | A catch-all for everything that needs to run after the standard phases.  |

`codec` takes in the `MapCodec` that encodes and decodes the modifiers. This `MapCodec` is [statically registered][staticreg], with its id used as the type of the Biome Modifier.

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