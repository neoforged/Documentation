# Chunk Generation

A chunk is not generated in one pass. Instead, generation is split into 12 stages, each represented by a `ChunkStatus` in `net.minecraft.world.level.chunk.status`. A chunk moves through the stages in a fixed order, and what a modder can read or modify depends on the stage currently running. The stages are, in order: `EMPTY`, `STRUCTURE_STARTS`, `STRUCTURE_REFERENCES`, `BIOMES`, `NOISE`, `SURFACE`, `CARVERS`, `FEATURES`, `INITIALIZE_LIGHT`, `LIGHT`, `SPAWN` and `FULL`. They are registered to the `minecraft:chunk_status` registry (`BuiltInRegistries#CHUNK_STATUS`) using lowercase names, for example `structure_starts`.

Every chunk before `FULL` is a `ProtoChunk`. At `FULL`, the chunk is converted into a `LevelChunk`, which is the chunk players and entities interact with.

## Generation and Loading

What each stage needs is defined in `ChunkPyramid`. `ChunkPyramid#GENERATION_PYRAMID` is used for new chunks, and runs all stages. `ChunkPyramid#LOADING_PYRAMID` is used for chunks loaded from disk. In the loading pyramid, only `STRUCTURE_STARTS` (which only calls `ServerLevel#onStructureStartsAvailable` for the saved structure starts), `INITIALIZE_LIGHT`, `LIGHT` and `FULL` do any work. The other stages pass the chunk through unchanged.

This page describes the generation pyramid.

## Dependencies and Write Radius

Each stage is a `ChunkStep`, which declares the task to run along with the following:

- **Dependencies:** The minimum `ChunkStatus` that the surrounding chunks must have reached before the stage runs on the chunk being generated. Dependencies are given per chessboard (Chebyshev) distance: distance 0 is the chunk being generated, distance 1 is the ring of 8 chunks around it, and distance N is the ring of chunks N chunks away. Every stage after `EMPTY` requires the chunk itself to have reached the previous status.
- **Write radius:** The maximum distance, in chunks, from the chunk being generated at which blocks may be set. The limit applies to the x and z axes separately. A value of -1 means that no blocks may be set through the region at all.

Most stages run against a `WorldGenRegion`, a `WorldGenLevel` centered on the chunk being generated. The region enforces the declared dependencies and write radius:

- `WorldGenRegion#getChunk` throws a `ReportedException` ("Requested chunk unavailable during world generation") if the chunk is farther away than the dependency radius, or if a status later than the one guaranteed at that distance is requested. Methods such as `#getBlockState`, `#getFluidState` and heightmap queries go through `#getChunk`, so reading outside of the range crashes.
- Reading blocks from a neighbor that is only guaranteed to be at an earlier status does not crash. The neighbor returns whatever it has so far. For example, a neighbor that has only reached `BIOMES` has no terrain blocks yet.
- `WorldGenRegion#setBlock` does not throw when the position is outside of the write radius. Instead, it logs the error "Detected setBlock in a far chunk" and returns `false`, and the block is not placed. In a development environment run from an IDE, the game additionally pauses for a breakpoint.
- Asking a `ProtoChunk` for its biomes (`#getNoiseBiome`) before it has reached `BIOMES` throws an `IllegalStateException`.

:::tip
Use the `WorldGenLevel` that is passed to the code during generation. Do not retrieve chunks through the `ServerLevel`.
:::

The following table summarizes the requirements of each stage in the generation pyramid:

| Stage                  | Dependencies (distance: status)                              | Write Radius |
|------------------------|--------------------------------------------------------------|--------------|
| `STRUCTURE_STARTS`     | 0: `EMPTY`                                                   | -1           |
| `STRUCTURE_REFERENCES` | 0-8: `STRUCTURE_STARTS`                                      | -1           |
| `BIOMES`               | 0: `STRUCTURE_REFERENCES`; 1-8: `STRUCTURE_STARTS`           | -1           |
| `NOISE`                | 0-1: `BIOMES`; 2-8: `STRUCTURE_STARTS`                       | 0            |
| `SURFACE`              | 0: `NOISE`; 1: `BIOMES`; 2-8: `STRUCTURE_STARTS`             | 0            |
| `CARVERS`              | 0: `SURFACE`; 1-8: `STRUCTURE_STARTS`                        | 0            |
| `FEATURES`             | 0-1: `CARVERS`; 2-8: `STRUCTURE_STARTS`                      | 1            |
| `INITIALIZE_LIGHT`     | 0: `FEATURES`                                                | -1           |
| `LIGHT`                | 0-1: `INITIALIZE_LIGHT`                                      | -1           |
| `SPAWN`                | 0: `LIGHT`; 1: `BIOMES`                                      | -1           |
| `FULL`                 | 0: `SPAWN`                                                   | -1           |

The 8 chunk distance matches `ChunkStatus#MAX_STRUCTURE_DISTANCE`.

## The Stages

### `EMPTY`

The starting point of every chunk. The chunk holds no data, and the task of this stage does nothing.

### `STRUCTURE_STARTS`

If structure generation is enabled in the world settings, `ChunkGenerator#createStructures` decides which structures start in the chunk, and stores their `StructureStart`s, including their bounding boxes, in the chunk. Afterward, `ServerLevel#onStructureStartsAvailable` is called.

No `WorldGenRegion` is created for this stage. The generator receives the chunk itself, but no access to neighboring chunks, and no blocks can be set.

### `STRUCTURE_REFERENCES`

`ChunkGenerator#createReferences` loops over all chunks in the 17x17 area around the chunk being generated. For every valid structure start whose bounding box intersects the chunk, a reference to that start is added to the chunk.

Because the search area extends 8 chunks in each direction, a structure start can only be referenced from chunks within 8 chunks of its own chunk, and can therefore only place blocks in those chunks. No blocks can be set in this stage.

### `BIOMES`

`ChunkGenerator#createBiomes` fills the chunk's biomes from the biome source. Biomes are stored per chunk section in a 4x4x4 grid, so there is one biome per 4x4x4 block cell. These cells are addressed by quart positions (see `QuartPos`). No blocks can be set.

### `NOISE`

`ChunkGenerator#fillFromNoise` places the base terrain. For `NoiseBasedChunkGenerator`, this is the default block and default fluid of the noise settings (for example, stone and water in the Overworld), shaped by the noise router, including aquifers and noise caves.

This is the first stage that places blocks. The write radius is 0, so only the chunk being generated can be modified.

### `SURFACE`

`ChunkGenerator#buildSurface` builds the surface of the terrain. For `NoiseBasedChunkGenerator`, this applies the surface rules of the noise settings, for example grass blocks and dirt, or sand in deserts. The write radius is 0.

### `CARVERS`

`ChunkGenerator#applyCarvers` carves into the terrain. For `NoiseBasedChunkGenerator`, it goes through every chunk in the 17x17 area. The carvers of that chunk's biome may start there (see `ConfiguredWorldCarver`), but each carver only carves into the chunk being generated. Carved positions are recorded in the chunk's `CarvingMask`. The write radius is 0.

Neighboring chunks are only guaranteed to be at `STRUCTURE_STARTS`, so a carver must not rely on the terrain of neighboring chunks. Carvers can be added to or removed from biomes using [biome modifiers][biomemodifier].

### `FEATURES`

First, the final heightmaps are primed (see [Heightmaps][heightmaps]). Then, `ChunkGenerator#applyBiomeDecoration` goes through the `GenerationStep.Decoration` steps in order. In each decoration step, the following happens:

1. The pieces of all structures referenced by the chunk whose `Structure#step` is the current decoration step are placed. The pieces are clipped to the chunk being generated, which is a 16x16 column box.
1. The placed features of the current decoration step are placed, using the features of the biomes found in the surrounding 3x3 chunks.

Features may write blocks in a 3x3 chunk area, so the write radius is 1. This is the last stage that places blocks. While a structure or feature is being placed, `WorldGenRegion#setCurrentlyGenerating` is set to its key, so that the "far chunk" error message names it.

A custom feature placed in this stage can therefore read and write blocks in the 3x3 area around the chunk being decorated. Chunks 2 to 8 chunks away are only guaranteed to be at `STRUCTURE_STARTS`, so reading blocks there returns incomplete data, and reading blocks more than 8 chunks away crashes. Features can be added to or removed from biomes using [biome modifiers][biomemodifier].

### `INITIALIZE_LIGHT` and `LIGHT`

`INITIALIZE_LIGHT` initializes the light sources and attaches the light engine to the chunk. From this stage on, block changes on the `ProtoChunk` also notify the light engine. `LIGHT` then calculates the light using the light engine, which requires the neighboring chunks to have been initialized. Neither stage can set blocks.

### `SPAWN`

Unless the chunk is being upgraded below the old world bottom (see `BelowZeroRetrogen`), `ChunkGenerator#spawnOriginalMobs` is called. For `NoiseBasedChunkGenerator`, this spawns the initial mobs of the chunk using the biome at the top of the chunk's corner column, unless the noise settings disable mob generation. The mob spawns of a biome can be changed using [biome modifiers][biomemodifier].

NeoForge patches `WorldGenRegion#addFreshEntity` so that a `Mob` whose spawn was cancelled (`Mob#isSpawnCancelled`) is not added. No blocks can be set.

### `FULL`

On the main thread, the `ProtoChunk` is converted into a `LevelChunk`. If the chunk was already a `LevelChunk` wrapped in an `ImposterProtoChunk`, the wrapped `LevelChunk` is used instead. Entities stored in the `ProtoChunk` are added to the level, and block entities and ticks are registered.

NeoForge fires `ChunkEvent.Load` here on the [NeoForge event bus][events] (`NeoForge#EVENT_BUS`). `ChunkEvent.Load#isNewChunk` returns whether the chunk is newly generated instead of loaded from disk as a full chunk. After this stage, the chunk is the normal chunk players interact with.

## Heightmaps

When a block is set on a `ProtoChunk`, the heightmaps that are updated depend on the chunk's current persisted status:

- If the persisted status is `SURFACE` or earlier, the worldgen heightmaps `OCEAN_FLOOR_WG` and `WORLD_SURFACE_WG` are updated.
- If the persisted status is `CARVERS` or later, the final heightmaps `OCEAN_FLOOR`, `WORLD_SURFACE`, `MOTION_BLOCKING` and `MOTION_BLOCKING_NO_LEAVES` are updated.

While a chunk is being generated, its persisted status is the previous one. Block writes during `NOISE`, `SURFACE` and `CARVERS` therefore update the worldgen heightmaps, while block writes during `FEATURES` update the final heightmaps. At the start of `FEATURES`, `Heightmap#primeHeightmaps` computes the four final heightmaps, so that they are available before anything is placed.

[biomemodifier]: biomemodifier.md
[heightmaps]: #heightmaps
[events]: ../concepts/events.md
