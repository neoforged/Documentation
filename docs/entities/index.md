---
sidebar_position: 1
---
# Entities

Entities are in-world objects that can interact with the world in a variety of ways. Common example include mobs, projectiles, rideable objects, and even players. Each entity consists of multiple systems that may not seem understandable at first glance. This section will break down some of the key components related to constructing an entity and making it behave as the modder intends.

## Terminology

A simple entity is made up of three parts:

- The [`Entity`][entity] subclass, which holds most of our entity's logic
- The [`EntityType`][type], which is [registered][registration] and holds some common properties, and
- The [`EntityRenderer`][renderer], which is responsible for displaying the entity in-game

More complex entities may require more parts. For example, many of the more complex `EntityRenderer`s use an underlying `EntityModel` instance. Or, a naturally spawning entity will need some sort of [spawn mechanism][spawning].

## `EntityType`

The relationship between `EntityType`s and `Entity`s is similar to that of [`Item`s][item] and [`ItemStack`s][itemstack]. Like `Item`s, `EntityType`s are singletons that are registered to their corresponding registry (the entity type registry) and hold some values common to all entities of that type, while `Entity`s, like `ItemStack`s, are "instances" of that singleton type that hold data specific to that one entity instance. However, the key difference here is that most of the behavior is not defined in the singleton `EntityType`, but rather in the instantiated `Entity` class itself.

Let's create our `EntityType` registry and register an `EntityType` for it, assuming we have a class `MyEntity` that extends `Entity` (see [below][entity] for more information). All methods on `EntityType.Builder`, except for the `#build` call at the end, are optional.

```java
public static final DeferredRegister<EntityType<?>> ENTITY_TYPES =
    DeferredRegister.create(Registries.ENTITY_TYPE, ExampleMod.MOD_ID);

public static final Supplier<EntityType<MyEntity>> MY_ENTITY = ENTITY_TYPES.register(
    "my_entity",
    // The entity type, created using a builder.
    () -> EntityType.Builder.of(
        // An EntityType.EntityFactory<T>, where T is the entity class used - MyEntity in this case.
        // You can think of it as a BiFunction<EntityType<T>, Level, T>.
        // This is commonly a reference to the entity constructor.
        MyEntity::new,
        // The MobCategory our entity uses. This is mainly relevant for spawning.
        // See below for more information.
        MobCategory.MISC
    )
    // The width and height, in blocks. The width is used in both horizontal directions.
    // This also means that non-square footprints are not supported. Default is 0.6f and 1.8f.
    .sized(1.0f, 1.0f)
    // The spawn dimensions. This is used by mobs that spawn in varying sizes.
    // In vanilla, these are only slimes and magma cubes, both of which use 4.0f.
    .spawnDimensionsScale(4.0f)
    // The eye height, in blocks from the bottom of the size. Defaults to height * 0.85.
    // This must be called after #sized to have an effect.
    .eyeHeight(0.5f)
    // Disables the entity being summonable via /summon.
    .noSummon()
    // Prevents the entity from being saved to disk.
    .noSave()
    // Makes the entity fire immune.
    .fireImmune()
    // Makes the entity immune to damage from a certain block. Vanilla uses this to make
    // foxes immune to sweet berry bushes, withers and wither skeletons immune to wither roses,
    // and polar bears, snow golems and strays immune to powder snow.
    .immuneTo(Blocks.POWDER_SNOW)
    // Disables a rule in the spawn handler that limits the distance at which entities can spawn.
    // This means that no matter the distance to the player, this entity can spawn.
    // Vanilla enables this for pillagers and shulkers.
    .canSpawnFarFromPlayer()
    // The range in which the entity is kept loaded by the client, in chunks.
    // Vanilla values for this vary, but it's often something around 8 or 10. Defaults to 5.
    .clientTrackingRange(8)
    // How often update packets are sent for this entity, in once every x ticks. This is set to higher values
    // for entities that have predictable movement patterns, for example projectiles. Defaults to 3.
    .updateInterval(10)
    // Build the entity type. The parameter is a string used for datafixing; mods generally
    // do not utilize this and can safely pass null here instead.
    .build(null)
);
```

:::warning
Sometimes, there may be generic bounds errors with the entity type and the entity constructor. If this happens, the easiest solution is often to use an explicit generic type for `EntityType.Builder#of`, like so:

```java
() -> EntityType.Builder.<MyEntity>of(...)
```
:::

### `MobCategory`

_See also [Natural Spawning][mobspawn]._

An entity's `MobCategory` determines some properties for the entity, which are related to [spawning and despawning][mobspawn]. Vanilla adds a total of eight `MobCategory`s by default:

| Name                         | Spawn Cap | Examples                                                                                                                       |
|------------------------------|-----------|--------------------------------------------------------------------------------------------------------------------------------|
| `MONSTER`                    | 70        | Various monsters                                                                                                               |
| `CREATURE`                   | 10        | Various animals                                                                                                                |
| `AMBIENT`                    | 15        | Bats                                                                                                                           |
| `AXOLOTS`                    | 5         | Axolotls                                                                                                                       |
| `UNDERGROUND_WATER_CREATURE` | 5         | Glow Squids                                                                                                                    |
| `WATER_CREATURE`             | 5         | Squids, Dolphins                                                                                                               |
| `WATER_AMBIENT`              | 20        | Fish                                                                                                                           |
| `MISC`                       | N/A       | All non-living entities, e.g. projectiles; using this `MobCategory` will make the entity unable to be spawned naturally at all |

There are also some other properties that are only set on one or two `MobCategory`s each:

- `isFriendly`: Set to false for `MONSTER`, and true for all others.
- `isPersistent`: Set to true for `CREATURE` and `MISC`, and false for all others.
- `despawnDistance`: Set to 64 for `WATER_AMBIENT`, and 128 for all others.

:::info
`MobCategory` is an [extensible enum][extenum], meaning that you can add custom entries to it. If you do so, you will also have to add some spawning mechanism for entities of this custom `MobCategory`.
:::

## The Entity Class

To begin, we create an `Entity` subclass. Alongside a constructor, `Entity` (which is an abstract class) defines three required methods that we are required to implement. These will be explained in the [Data and Networking article][data], in order to not further bloat this article.

```java
public class MyEntity extends Entity {
    // We inherit this constructor without the bound on the generic wildcard.
    // The bound is needed for registration below, so we add it here.
    public MyEntity(EntityType<? extends MyEntity> type, Level level) {
        super(type, level);
    }

    // See the Data and Networking article for information about these methods.
    @Override
    protected void readAdditionalSaveData(CompoundTag compoundTag) {}

    @Override
    protected void addAdditionalSaveData(CompoundTag compoundTag) {}

    @Override
    protected void defineSynchedData(SynchedEntityData.Builder builder) {}
}
```

:::info
While `Entity` can be extended directly, it often makes sense to use one of its many subclasses as a base instead. See the [entity class hierarchy][hierarchy] for more information.
:::

If required (e.g. because you're spawning entities from code), you can also add custom constructors. These generally hardcode the entity type as a reference to the registered object, like so:

```java
public MyEntity(Level level, double x, double y, double z) {
    // Delegates to the factory constructor, using the EntityType we registered before.
    this(MY_ENTITY.get(), level);
    this.setPos(x, y, z);
}
```

And now, we are free to do basically whatever we want with our entity. The following subsections will display a variety of common entity use cases.

### Data Storage on Entities

_See [Entities/Data and Networking][data]._

### Rendering Entities

_See [Entities/Entity Renderers][renderer]._

### Spawning Entities

If we now boot up the game now and enter a world, we have exactly one way of spawning: through the [`/summon`][summon] command (assuming `EntityType.Builder#noSummon` was not called).

Obviously, we want to add our entities some other way. The easiest way to do so is through the `LevelWriter#addFreshEntity` method. This method simply accepts an `Entity` instance and adds it to the world, like so:

```java
// In some method that has a level available
MyEntity entity = new MyEntity(level, 100.0, 200.0, 300.0);
level.addFreshEntity(entity);
```

This will be used for pretty much all non-living entities. Players should obviously not be spawned yourself, and `Mob`s have [their own ways of spawning][mobspawn] (though they can also be added via `#addFreshEntity`).

### Damaging Entities

_See also [Left-Clicking an Item][leftclick]._

While not all entities have the concept of hit points, they can still all receive damage. This is not only used by things like mobs and players: If you cast your mind to item entities (dropped items), they too can take damage from sources like fire or cacti, in which case they are usually deleted immediately.

Damaging an entity is possible by calling `Entity#hurt`. `Entity#hurt` takes two arguments: the [`DamageSource`][damagesource] and the damage amount, as a float in half hearts. For example, calling `entity.hurt(entity.damageSources().wither(), 4.25)` will cause a little over two hearts of wither damage.

In turn, entities can also modify the behavior in `#hurt` by overriding it. For example, we could make our entity take double damage from fire, and no damage from any other source, like so:

```java
@Override
// The boolean return value determines whether the entity was actually damaged or not.
public boolean hurt(DamageSource damageSource, float amount) {
    if (damageSource.is(DamageTypeTags.IS_FIRE)) {
        return super.hurt(damageSource, amount * 2);
    } else {
        return false;
    }
}
```

It is also possible to modify damage done to entities that do not belong to you, i.e. those added by Minecraft or other mods, through events. These events contain a lot of code specific to `LivingEntity`s; as such, their documentation resides in the [Damage Events section][damageevents] within the [Living Entities article][livingentity].

### Ticking Entities

Quite often, you will want your entity to do something (e.g. move) every tick. This logic is split across several methods:

- `#tick`: This is the central tick method, and the one you will want to override in 99% of cases.
    - By default, this forwards to `#baseTick`, however this is overridden by almost every subclass.
- `#baseTick`: This method handles updating some values common to all entities, including the "on fire" state, freezing from powder snow, the swimming state, and passing through portals.
    - By default, `Entity#tick` will forward to this method.
- `#rideTick`: This method is called for passengers of other entities, for example for players riding horses, or any entity that rides another entity due to use of the `/ride` command.
    - By default, this does some checks and then calls `#tick`. Skeletons and players override this method for special handling of riding entities.

Additionally, the entity has a field called `tickCount`, which is the time, in ticks, that the entity has existed in the level, and a boolean field named `firstTick`, which should be self-explanatory. For example, if you wanted to [spawn a particle][particle] every 5 ticks, you could use the following code:

```java
@Override
public void tick() {
    // Always call super unless you have a good reason not to.
    super.tick();
    // Run this code once every 5 ticks, and make sure we spawn the particle on the server.
    if (this.tickCount % 5 == 0 && !level().isClientSide()) {
        level().addParticle(...);
    }
}
```

### Picking Entities

_See also [Middle-Clicking][middleclick]._

Picking is the process of selecting the thing that the player is currently looking at, as well as subsequently picking the associated item. The result of middle-clicking, known as the "pick result", can be modified by your entity (be aware that the `Mob` class will select the correct spawn egg for you):

```java
@Override
@Nullable
public ItemStack getPickResult() {
    // Assumes that MY_CUSTOM_ITEM is a DeferredItem<?>, see the Items article for more information.
    return new ItemStack(MY_CUSTOM_ITEM.get());
}
```

Your entity can also be disabled from picking entirely like so:

```java
@Override
public boolean isPickable() {
    // Additional checks may be performed here if needed.
    return false;
}
```

If you want to do the picking (i.e. ray casting) yourself, you can call `Entity#pick` on the entity that you want to start the ray cast from. This will return a [`HitResult`][hitresult] that you can further check for what exactly has been hit by the ray cast.

### Entity Attachments

_Not to be confused with [Data Attachments][dataattachments]._

:::info
This section is a work in progress.
:::

## Entity Class Hierarchy

Due to the many different types of entities, there is a complex hierarchy of subclasses of `Entity`. These are important to know about when choosing what class to extend when making your own entity, as you will be able to save a lot of work by reusing their code.

Direct subclasses of `Entity` include:

- `Projectile`: The base class for various projectiles, including arrows, fireballs, snowballs, fireworks and similar entities. Read more about them [below][projectile].
- `LivingEntity`: The base class for anything "living", in the sense of it having things like hit points, equipment, [mob effects][mobeffect] and some other properties. Includes things such as monsters, animals, villagers, and players. Read more about them in the [Living Entities article][livingentity].
- `VehicleEntity`: The base class for boats and minecarts. While these entities loosely share the concept of hit points with `LivingEntity`s, they do not share many other properties with them and are as such kept separated.
- `BlockAttachedEntity`: The base class for entities that are immobile and attached to blocks. Includes leash knots, item frames and paintings.
- `Display`: The base class for the various map-maker display entities.

Several entities are also direct subclasses of `Entity`, simply because there was no other fitting superclass. Prominent examples include `ItemEntity` (dropped items), `LightningBolt`, `ExperienceOrb` and `PrimedTnt`.

### Projectiles

Projectiles are a subgroup of entities. Common to them is that they fly in one direction until they hit something, and that they have an owner assigned to them (e.g. a player or a skeleton would be the owner of an arrow, or a ghast would be the owner of a fireball).

There are three big subgroups of projectiles:

- Arrows: Represented by the `AbstractArrow` superclass, this group covers the different kinds of arrows, as well as the trident. An important common property is that they will not fly straight, but are affected by gravity.
- Throwables: Represented by the `ThrowableProjectile` superclass, this group covers things like eggs, snowballs and ender pearls. Like arrows, they are affected by gravity, but unlike arrows, they will not inflict damage upon hitting the target. They are also all spawned by using the corresponding item.
- Hurting Projectiles: Represented by the `AbstractHurtingProjectile` superclass, this group covers wind charges, fireballs and wither skulls. These are damaging projectiles unaffected by gravity.

Other projectiles that directly extend `Projectile` include fireworks, fishing bobbers and shulker bullets.

A new projectile can be created by extending `Projectile` or a fitting subclass, and then overriding the methods required for adding your functionality. Common methods to override would be `#shoot`, which calculates and sets the correct velocity on the projectile; `#onHit`, `#onHitEntity` and `#onHitBlock`, which do exactly what you'd expect; and `#getOwner` and `#setOwner`, which get and set the owning entity, respectively.

[block]: ../blocks/index.md
[damageevents]: livingentity.md#damage-events
[damagesource]: ../resources/server/damagetypes.md#creating-and-using-damage-sources
[data]: data.md
[dataattachments]: ../datastorage/attachments.md
[entity]: #the-entity-class
[extenum]: ../advanced/extensibleenums.md
[hierarchy]: #entity-class-hierarchy
[hitresult]: ../items/interactions.md#hitresults
[item]: ../items/index.md
[itemstack]: ../items/index.md#itemstacks
[leftclick]: ../items/interactions.md#left-clicking-an-item
[livingentity]: livingentity.md
[middleclick]: ../items/interactions.md#middle-clicking
[mobeffect]: ../items/mobeffects.md
[mobspawn]: livingentity.md#spawning
[particle]: ../resources/client/particles.md
[projectile]: #projectiles
[registration]: ../concepts/registries.md#methods-for-registering
[renderer]: renderer.md
[spawning]: #spawning-entities
[summon]: https://minecraft.wiki/w/Commands/summon
[type]: #entitytype
