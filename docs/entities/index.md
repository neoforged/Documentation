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

TODO

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
<!-- Replace with living entity docs -->
[living]: #
