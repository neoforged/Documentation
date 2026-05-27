---
sidebar_position: 1
---

# Resource Metadata

`.mcmeta` file extensions can hold JSON metadata for any asset or data object within the game. These are most commonly used to define information for a pack and how textures are applied; however, they can be used on any file by adding a `.mcmeta` to the end of the filename (e.g., `apple.png` has a resource metadata `apple.png.mcmeta`).

:::note

While the JSON objects within data packs can have resource metadata, it goes unused since the metadata could be within the JSON file itself.

:::

## Metadata Sections

The JSON metadata object is broken into sections, where the key represents the section type, and the value is the data for that section. In the codebase, this is known as the `MetadataSectionType`, taking in the `String` key, and the [`Codec`][codec] to serialize the value.

Vanilla and NeoForge currently provides the following metadata sections:

| Section                          | Class                                                         | On                      | For                                                           |
|:--------------------------------:|:-------------------------------------------------------------:|:-----------------------:|:--------------------------------------------------------------|
| `pack`                           | `PackMetadataSection`                                         | `pack.mcmeta`           | [Pack information][pack]                                      |
| `features`                       | `FeatureFlagsMetadataSection`                                 | `pack.mcmeta`           | [Enabling experimental features][features]                    |
| `filter`                         | `ResourceFilterSection`                                       | `pack.mcmeta`           | Filtering files for packs applied after this pack             |
| `overlays` / `neoforge:overlays` | `OverlayMetadataSection` / `GeneratingOverlayMetadataSection` | `pack.mcmeta`           | Sub-packs applied over the main pack for the given conditions |
| `language`                       | `LanguageMetadataSection`                                     | `pack.mcmeta`           | Additional languages, only for resource packs                 |
| `animation`                      | `AnimationMetadataSection`                                    | `.png.mcmeta` (Texture) | [Animated atlas textures][animation]                          |
| `gui`                            | `GuiMetadataSection`                                          | `.png.mcmeta` (Texture) | [GUI sprite textures][texture]                                |
| `texture`                        | `TextureMetadataSection`                                      | `.png.mcmeta` (Texture) | [Textures][texture]                                           |
| `villager`                       | `VillagerMetadataSection`                                     | `.png.mcmeta` (Texture) | Villager hat visibility                                       |

:::note

The `PackMetadataSection` is not required for the main mod `pack.mcmeta` as NeoForge generates it synthetically. However, it is required for any bundled packs added through the `AddPackFindersEvent` mod bus event.

:::

Obtaining the data within the metadata section requires access to the file's `Resource` obtained from the `ResourceManager`, calling `Resource#metadata` to get the `ResourceMetadata`, followed by `ResourceMetadata#getSection` with the `MetadataSectionType`.

```java
// For some `ResourceManager` resourceManager

// Get the metadata for the topmost resource
Optional<AnimationMetadataSection> waterStillMetadata = resourceManager.getResource(
    // Identifier must specify exact path to the backing resource resource.
    Identifier.fromNamespaceAndPath("minecraft", "textures/block/water_still.png")
).flatMap(resource -> {
    try {
        // Get the metadata for the resource if present, otherwise an empty optional.
        return resource.metadata().getSection(AnimationMetadataSection.TYPE);
    } catch (IOException e) {
        // If an exception is thrown trying to read the metadata file.
        return Optional.empty();
    }
});

// Get the metadata of every resource for the identifier
List<AnimationMetadataSection> waterStillsMetadata = resourceManager.getResourceStack(
    // Identifier must specify exact path to the backing resource resource.
    Identifier.fromNamespaceAndPath("minecraft", "textures/block/water_still.png")
).map(resource -> {
    try {
        // Get the metadata for the resource if present, otherwise an empty optional.
        return resource.metadata().getSection(AnimationMetadataSection.TYPE);
    } catch (IOException e) {
        // If an exception is thrown trying to read the metadata file.
        return Optional.empty();
    }
}).filter(Optional::isPresent).map(Optional::get);
```

The client `ResourceManager` can be obtained via `Minecraft#getResourceManager`. The server, on the other hand, does not expose the `ResourceManager` outside of `MinecraftServer#reloadResources`. The only way to make use of it is as part of a `PreparableReloadListener`.

### Custom Sections

A custom metadata section only requires creating the object, the `Codec` to serialize and deserialize the object, and the `MetadataSectionType` to read from the `mcmeta`.

```java
public record ExampleMetadataSection(String value) {
    public static final Codec<ExampleMetadataSection> CODEC = Codec.STRING.xmap(ExampleMetadataSection::new, ExampleMetadataSection::value);

    public static final MetadataSectionType<ExampleMetadataSection> TYPE = new MetadataSectionType<>(
        // The key for the section in the .mcmeta, should be prefixed with your mod id.
        "examplemod:example_section",
        // The codec to serialize and deserialize the section data.
        CODEC
    );
}
```

With that, the metadata section can be added to the `.mcmeta` for an object:

```json5
// In 'assets/examplemod/textures/block/example_block.png.mcmeta'
{
    "examplemod:example_section": "Hello world!"
}
```

And can be obtained like any other metadata section using the type.

## Data Generation

Vanilla provides data generation for `pack.mcmeta` through `PackMetadataGenerator`. Metadata for any other file needs a custom `DataProvider`.

### `PackMetadataGenerator`

`PackMetadataGenerator` is used to generate the `pack.mcmeta` for the mod or its bundled subpacks. Metadata sections are added through the `add` method, taking in the `MetadataSectionType` and its value. `PackMetadataGenerator` also provides `forFeaturePack` to generate `pack.mcmeta` with a `PackMetadataSection`, and optionally a `FeatureFlagsMetadataSection`:

```java
@SubscribeEvent // on the mod event bus
public static void gatherData(GatherDataEvent.Client event) {
    event.createProvider(PackMetadataGenerator::new)
        // Can chain multiple `add` calls.
        .add(
            // The metadata section to add.
            LanguageMetadataSection.TYPE,
            // The value of the metadata section.
            Map.of(
                "hello_world",
                new LanguageInfo(
                    "Programmer's Land",
                    "Hello world!",
                    false
                )
            )
        );
}
```

### Other Resource Metadata

Resource metadata on other files requires a custom `DataProvider`:

```java
public class ResourceMetadataProvider implements DataProvider {

    private final PackOutput output;
    private final Map<Path, ResourceMetadata> metadata;

    public ResourceMetadataProvider(PackOutput output) {
        this.output = output;
        this.metadata = new HashMap<>();
    }

    protected void add() {
        // Add metadata here.
        this.textureMetadata(Identifier.fromNamespaceAndPath(
            "examplemod", "block/example_texture"
        ))
            // Can chain multiple `add` calls.
            .add(
                // The metadata section to add.
                TextureMetadataSection.TYPE
                // The value of the metadata section.
                new TextureMetadataSection(
                    true, TextureMetadataSection.DEFAULT_CLAMP, MipmapStrategy.AUTO, TextureMetadataSection.DEFAULT_ALPHA_CUTOFF_BIAS
                )
            ).add(
                ExampleMetadataSection.TYPE,
                new ExampleMetadataSection("Hello world!")
            );
    }

    protected ResourceMetadata textureMetadata(Identifier resource) {
        return this.metadata(
            PackOutput.Target.RESOURCE_PACK,
            "textures",
            resource.withSuffix(".png")
        );
    }

    protected ResourceMetadata metadata(PackOutput.Target type, String directory, Identifier resource) {
        return this.metadata.computeIfAbsent(
            this.output.createPathProvider(type, directory).file(resource, "mcmeta"),
            p -> new ResourceMetadata()
        );
    }

    @Override
    public CompletableFuture<?> run(CachedOutput cache) {
        Executor executor = Util.backgroundExecutor().forName("serializeMetadata");
        return CompletableFuture.allOf(
            this.metadata.entrySet().stream().map(entry -> CompletableFuture.runAsync(() -> {
                    JsonObject result = new JsonObject();
                    entry.getValue().sections().forEach((type, data) -> result.add(type, data.get()));
                    return result;
                }, executor).thenComposeAsync(json -> DataProvider.saveStable(cache, json, entry.getKey()), executor)
            ).toArray(CompletableFuture[]::new)
        );
    }

    @Override
    public final String getName() {
        return "Resource Metadata";
    }

    public record ResourceMetadata(Map<String, Supplier<JsonElement>> sections) {

        public ResourceMetadata() {
            this(new HashMap<>());
        }

        public <T> ResourceMetadata add(MetadataSectionType<T> type, T value) {
            this.sections.put(type.name(), () -> type.codec().encodeStart(JsonOps.INSTANCE, value).getOrThrow(IllegalArgumentException::new).getAsJsonObject());
            return this;
        }
    }
}
```

Which can then be added to the gather data event:

```java
@SubscribeEvent // on the mod event bus
public static void gatherData(GatherDataEvent.Client event) {
    event.createProvider(ResourceMetadataProvider::new);
}
```

[animation]: client/textures.md#animated-textures
[codec]: ../datastorage/codecs.md
[features]: ../advanced/featureflags.md#feature-packs
[pack]: index.md#packmcmeta
[texture]: client/textures.md#texture-metadata
