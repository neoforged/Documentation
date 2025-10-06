# Particle Descriptions

Particle descriptions are JSON files in the `assets/<namespace>/particles` directory and has the same name as the [particle type][particletype]. The description takes in a list of textures relative to `assets/<namespace>/textures/particles`.

A particle description looks something like this:

```json5
{
    // A list of textures that will be played in order. Will loop if necessary.
    // Texture locations are relative to the textures/particle folder.
    "textures": [
        // Points to `assets/examplemod/textures/particle/my_particle_0.png`
        "examplemod:my_particle_0",
        "examplemod:my_particle_1",
        "examplemod:my_particle_2",
        "examplemod:my_particle_3"
    ]
}
```

During resource reload, the `ParticleResources` loads all particle descriptions and stitches the textures into a `TextureAtlas#LOCATION_PARTICLES` atlas. Then, a `SpriteSet` is created for each description containing the list of `TextureAtlasSprite`s specified.

## Using the Description

To allow a [particle] to make use of its description, the `ParticleType` must be associated with a `ParticleProvider` that takes in the `SpriteSet` using the [client-side][side] [mod bus][modbus] [event] `RegisterParticleProvidersEvent`:

```java
public class MyParticleProvider implements ParticleProvider<SimpleParticleType> {

    private final SpriteSet spriteSet;

    // Take in the sprite set provided by the `ParticleResources`.
    public MyParticleProvider(SpriteSet spriteSet) {
        this.spriteSet = spriteSet;
    }

    // ...
}

// In some client-only event handler

@SubscribeEvent // on the mod event bus only on the physical client
public static void registerParticleProviders(RegisterParticleProvidersEvent event) {
    // #registerSpriteSet MUST be used when dealing with particle descriptions.
    event.registerSpriteSet(MyParticleTypes.MY_PARTICLE.get(), MyParticleProvider::new);
}
```

:::warning
If a particle description is created for a particle type with no associated `ParticleProvider` via `RegisterParticleProvidersEvent#registerSpriteSet`, then a 'Redundant texture list' message will be logged.
:::

### Datagen

Particle definition files can also be [datagenned][datagen] by extending `ParticleDescriptionProvider` and overriding the `#addDescriptions()` method:

```java
public class MyParticleDescriptionProvider extends ParticleDescriptionProvider {
    // Get the parameters from `GatherDataEvent.Client`.
    public MyParticleDescriptionProvider(PackOutput output) {
        super(output);
    }

    // Assumes that all the referenced particles actually exists. Replace "examplemod" with your mod id.
    @Override
    protected void addDescriptions() {
        // Adds a single sprite particle definition with the file at
        // assets/examplemod/textures/particle/my_single_particle.png.
        spriteSet(MyParticleTypes.MY_SINGLE_PARTICLE.get(), ResourceLocation.fromNamespaceAndPath("examplemod", "my_single_particle"));
        // Adds a multi sprite particle definition, with a vararg parameter. Alternatively accepts an iterable.
        spriteSet(MyParticleTypes.MY_MULTI_PARTICLE.get(),
            ResourceLocation.fromNamespaceAndPath("examplemod", "my_multi_particle_0"),
            ResourceLocation.fromNamespaceAndPath("examplemod", "my_multi_particle_1"),
            ResourceLocation.fromNamespaceAndPath("examplemod", "my_multi_particle_2")
        );
        // Alternative for the above, appends "_<index>" to the base name given, for the given amount of textures.
        spriteSet(MyParticleTypes.MY_ALT_MULTI_PARTICLE.get(),
            // The base name.
            ResourceLocation.fromNamespaceAndPath("examplemod", "my_multi_particle"),
            // The number of textures.
            3,
            // Whether to reverse the list, i.e. start at the last element instead of the first.
            false
        );
    }
}
```

Don't forget to add the provider to the `GatherDataEvent.Client`:

```java
@SubscribeEvent // on the mod event bus
public static void gatherData(GatherDataEvent.Client event) {
    event.createProvider(MyParticleDescriptionProvider::new);
}
```

[datagen]: ../index.md#data-generation
[event]: ../../concepts/events.md
[modbus]: ../../concepts/events.md#event-buses
[particle]: ../../rendering/particles.md
[particletype]: ../../rendering/particles.md#registering-particles
[side]: ../../concepts/sides.md
