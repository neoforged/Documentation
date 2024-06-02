# Entities

Entities are actors that can interact with the world in a variety of ways. Entities comprise mobs, projectiles, rideable objects, and even players. Each entity is comprised of multiple systems that may not seem understandable at first glance. This section will breakdown some of the key components related to constructing an entity and making it behave as the modder intends.

## A Quick Summary

Entities, in their simplest and most trivial form, are made up of four parts:

- The [`EntityType` registry object][entitytype]
    - The default properties that all entities have
- An [`Entity` subclass][entity]
    - The logic to execute when this entity ticks or is interacted with
- An [`EntityRenderer` subclass][entityrenderer]
    - How the entity is rendered in-game
- A [summoning method][summon]
    - How the entity is spanwed into a level

An entity may require more parts depending on the subclass of `Entity` and `EntityRenderer` used (e.g., [`LivingEntity` or `Mob`][living]).

:::warning
The simplest and most trivial entity does absolutely nothing. Most users will only need to extend a subclass of `Entity` and `EntityRenderer`. However, understanding the underlying principles is necessary to more effectively create entities and avoid hard to diagnose bugs.
:::

## `EntityType`: The Grounding Principle

An `EntityType` is the singleton that defines what an entity is. Multiple entities within the world can be associated with one `EntityType`. The `EntityType` also links an [`EntityRenderer`][entityrenderer] to its corresponding `Entity` class. It also defines default properties that all entities with this type has. The `EntityType` must be [registered].

An `EntityType` can be constructed via `EntityType.Builder#of`. This method takes in two parameters: an `EntityType.EntityFactory` that [constructs a default `Entity` instance][entity], and a [`MobCategory`][mobcategory] indicating the entity type. The `EntityType` can be built via `EntityType.Builder#build` by passing in `null` as the argument.

:::info
The `String` in the `build` method represents the registry name of the `EntityType` and is used when dealing with data fixers. The reason we pass in `null` is that data fixers go unused in mod development. If a value is passed in, then Vanilla's data fixer will continually throw a warning when loading the game as there is no definition within an applicable schema.
:::

```java
// For some entity
public static class ExampleEntity extends Entity {

    // This is the constructor definition for use in 'EntityType.EntityFactory'
    public ExampleEntity(EntityType<? extends ExampleEntity> type, Level level) {
        super(type, level);
        // ...
    }

    // ...
}

// In some class that holds registry objects
public static final DeferredRegister<EntityType<?>> REGISTRAR = DeferredRegister.create(Registries.ENTITY_TYPE, MOD_ID);

public static final DeferredHolder<EntityType<?>, EntityType<ExampleEntity>> EXAMPLE_ENITTY = REGISTRAR.register(
    "example_entity",
    () -> EntityType.Builder.of(
            ExampleEntity::new // The constructor definition,
            MobCategory.MISC // Category for entities that do not generally extend 'Mob'
        ).build(null) // String value goes unused
);
```

:::note
The builder contains many methods that will be further discussed in other sections to help with understanding. An example for applying each to an `EntityType` will be provided there.
:::

### Entity Dimensions

TODO

### Entity Attachments

TODO

## Everything Revolves Around `Entity`

TODO

### To Pick or Not to Pick

TODO

### Reading and Writing Data

TODO

### Synchronizing to the Client

TODO (Move to its own page)

## Summoning an Entity

TODO

### `LevelWriter#addFreshEntity`

TODO

### `SpawnerData`

TODO

#### `MobSpawnCost`

TODO

[entitytype]: #entitytype-the-grounding-principle
[entity]: #everything-revolves-around-entity
[entityrenderer]: ./renderer.md
[summon]: #summoning-an-entity
[registered]: ../concepts/registries.md#methods-for-registering
<!-- Replace with living entity docs -->
[living]: #
[mobcategory]: #
