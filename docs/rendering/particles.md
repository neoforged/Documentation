# Client Particles

A `Particle` defines the client representation of what is spawned in the world and displayed to the player. Most properties and basic physics are controlled by fields such as `gravity`, `lifetime`, `hasPhysics`, `friction`, etc. The only two methods that are commonly overridden are `tick` and `move`, both of which do exactly as their name implies. As such, most custom particles are often short, consisting only a of a constructor that sets the desired fields with the occasional override in the two methods.

There are two methods for constructing a particle: subclassing `SingleQuadParticle`, which blits a look-facing texture to the screen; and subclassing `Particle`, which gives full control of the [features] being submitted for rendering.

:::note
NeoForge currently does not have support for custom `Particle` subclasses.
:::

## A Single Quad

Particles that extend `SingleQuadParticle` draw a single quad with some atlas sprite to the screen. There are many helpers provided in the class, from setting the size of the particle (via the `quadSize` field or `scale` method), to tinting the texture (via `setColor` and `setAlpha`). However, the two most important things about a quad particle is the `TextureAtlasSprite` used as the texture, and where that sprite is obtained and rendered through `SingleQuadParticle.Layer`.

First, the `TextureAtlasSprite` is passed into the constructor, either as itself or more likely a `SpriteSet`, representing the texture over its lifetime. Initially, the sprite is set to the protected `sprite` field, but it can be updated during `tick` by calling `setSprite` or `setSpriteFromAge`, respectively.

:::note
If the `age` or `lifetime` field is updated in the particle constructor, `setSpriteFromAge` should be called to display the appropriate texture.
:::

Then, during the [feature submission process][features], the `SingleQuadParticle.Layer` determines what atlas to use along with the pipeline used to draw the quad to the screen. Vanilla provides three layers by default:

| Layer         | Texture Atlas | For                               |
|:-------------:|:-------------:|:----------------------------------|
| `TERRAIN`     | Blocks        | Particles that use block textures |
| `OPAQUE`      | Particles     | Particles with no transparency    |
| `TRANSLUCENT` | Particles     | Particles with transparency       |

Custom layers can be easily created by calling the constructor.

```java
public class MyQuadParticle extends SingleQuadParticle {

    public static final SingleQuadParticle.Layer EXAMPLE_LAYER = new SingleQuadParticle.Layer(
        // Whether the particle will have textures that are not fully opaque.
        true,
        // The texture atlas used to get the sprite from.
        // This should match `TextureAtlasSprite#atlasLocation`.
        TextureAtlas.LOCATION_PARTICLES,
        // The render pipeline used to draw the particle.
        // Custom render pipelines should be based from `RenderPipelines#PARTICLE_SNIPPET`
        // to specify the available uniforms and samplers.
        RenderPipelines.WEATHER_DEPTH_WRITE
    );

    private final SpriteSet spriteSet;

    // First four parameters are self-explanatory.
    // The sprite set or atlas sprite are typically given through the provider, see below.
    // Additional parameters can be added as needed e.g., xd/yd/zd.
    public MyQuadParticle(ClientLevel level, double x, double y, double z, SpriteSet spriteSet) {
        // Initial sprite set in constructor
        super(level, x, y, z, spriteSet.first());
        this.spriteSet = spriteSet;
        this.gravity = 0; // Our particle floats in midair now, because why not.
    }

    @Override
    public void tick() {
        // Let super handle movement.
        // You may replace this with your own movement if needed.
        // You may also override move() if you only want to modify the built-in movement.
        super.tick();

        // Set the sprite for the current particle age, i.e. advance the animation.
        this.setSpriteFromAge(this.spriteSet);
    }

    @Override
    protected abstract SingleQuadParticle.Layer getLayer() {
        // Sets the layer used to get and submit the texture.
        return EXAMPLE_LAYER;
    }
}
```

:::warning
Particles whose `SingleQuadParticle.Layer` uses the `TextureAtlas#LOCATION_PARTICLES` must have an associated [particle description][description]. Otherwise, the textures required by the particle will not be added to the atlas.
:::

## `ParticleProvider`

Once a particle for some particle type has been created, the particle type must be linked through a `ParticleProvider`. `ParticleProvider` is a client-only class responsible for actually creating our `Particle`s from the `ParticleEngine` via `createParticle`. While more elaborate code can be included here, many particle providers are as simple as this:

```java
// The generic type of ParticleProvider must match the type of the particle type this provider is for.
public class MyQuadParticleProvider implements ParticleProvider<SimpleParticleType> {

    // A set of particle sprites.
    private final SpriteSet spriteSet;

    // The registration function passes a SpriteSet, so we accept that and store it for further use.
    // If your particle does not require a SpriteSet, this constructor can be omitted.
    public MyParticleProvider(SpriteSet spriteSet) {
        this.spriteSet = spriteSet;
    }

    // This is where the magic happens. We return a new particle each time this method is called!
    // The type of the first parameter matches the generic type passed to the super interface.
    @Override
    @Nullable
    public Particle createParticle(SimpleParticleType particleType, ClientLevel level, double x, double y, double z, double xd, double yd, double zd, RandomSource random
    ) {
        // We don't use the type, speed deltas, or engine random.
        return new MyQuadParticle(level, x, y, z, this.spriteSet);
    }
}
```

Your particle provider must then be associated with the particle type in the [client-side][side] [mod bus][modbus] [event] `RegisterParticleProvidersEvent`:

```java
@SubscribeEvent // on the mod event bus only on the physical client
public static void registerParticleProviders(RegisterParticleProvidersEvent event) {
    // There are multiple ways to register providers, all differing in the functional type they provide in the
    // second parameter. For example, #registerSpriteSet represents a Function<SpriteSet, ParticleProvider<?>>:
    event.registerSpriteSet(MyParticleTypes.MY_QUAD_PARTICLE.get(), MyQuadParticleProvider::new);

    // #registerSpecial, on the other hand, maps to a ParticleProvider<?>.
    // This should be used if the sprite is not obtained from the particle description.
}
```

:::warning
If `registerSpriteSet` is used, then the particle type must also have an associated [particle description][description]. Otherwise, an exception will be thrown stating it 'Failed to load description'.
:::

## Spawning Particles

As a reminder from before, the server only knows [`ParticleType`s][particletype] and [`ParticleOption`s][options], while the client works directly with `Particle`s provided by `ParticleProvider`s that are associated with a `ParticleType`. Consequently, the ways in which particles are spawned are vastly different depending on the side you are on.

- **Common code**: Call `Level#addParticle` or `Level#addAlwaysVisibleParticle`. This is the preferred way of creating particles that are visible to everyone.
- **Client code**: Use the common code way. Alternatively, create a `new Particle()` with the particle class of your choice and call `Minecraft.getInstance().particleEngine#add(Particle)` with that particle. Note that particles added this way will only display for the client and thus not be visible to other players.
- **Server code**: Call `ServerLevel#sendParticles`. Used in vanilla by the `/particle` command.

[description]: ../resources/client/particles.md
[event]: ../concepts/events.md
[features]: feature.md
[modbus]: ../concepts/events.md#event-buses
[options]: ../resources/client/particles.md#custom-particletypes
[particletype]: ../resources/client/particles.md#registering-particles
[registry]: ../concepts/registries.md#methods-for-registering
[side]: ../concepts/sides.md
