---
sidebar_position: 5
---
# Attributes

Attributes are special properties of [living entities][livingentity] that determine basic properties such as max health, speed or armor. All attributes are stored as double values and synced automatically. Vanilla offers a wide range of default attributes, and you can also add your own.

Due to legacy implementations, not all attributes work with all entities. For example, flying speed is ignored by ghasts, and jump strength only affects horses, not players.

## Built-In Attributes

### Minecraft

The following attributes are in the `minecraft` namespace, and their in-code values can be found in the `Attributes` class.

| Name                             | In Code                          | Range          | Default Value | Usage                                                                                                                                                                 |
|----------------------------------|----------------------------------|----------------|---------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `armor`                          | `ARMOR`                          | `[0,30]`       | 0             | The armor value of the entity. A value of 1 means half a chestplate icon above the hotbar.                                                                            |
| `armor_toughness`                | `ARMOR_TOUGHNESS`                | `[0,20]`       | 0             | The armor toughness value of the entity. See [Armor Toughness][toughness] on the [Minecraft Wiki][wiki] for more information.                                         |
| `attack_damage`                  | `ATTACK_DAMAGE`                  | `[0,2048]`     | 2             | The base attack damage done by the entity, without any weapon or similar item.                                                                                        |
| `attack_knockback`               | `ATTACK_KNOCKBACK`               | `[0,5]`        | 0             | The extra knockback dealt by the entity. Knockback additionally has a base strength not represented by this attribute.                                                |
| `attack_speed`                   | `ATTACK_SPEED`                   | `[0,1024]`     | 4             | The attack cooldown of the entity. Higher numbers mean more cooldown, setting this to 0 effectively re-enables pre-1.9 combat.                                        |
| `block_break_speed`              | `BLOCK_BREAK_SPEED`              | `[0,1024]`     | 1             | How fast the entity can mine blocks, as a multiplicative modifier. See [Mining Speed][miningspeed] for more information.                                              |
| `block_interaction_range`        | `BLOCK_INTERACTION_RANGE`        | `[0,64]`       | 4.5           | The interaction range in which the entity can interact with blocks, in blocks.                                                                                        |
| `burning_time`                   | `BURNING_TIME`                   | `[0,1024]`     | 1             | A multiplier for how long the entity will burn when ignited.                                                                                                          |
| `explosion_knockback_resistance` | `EXPLOSION_KNOCKBACK_RESISTANCE` | `[0,1]`        | 0             | The explosion knockback resistance of the entity. This is a value in percent, i.e. 0 is no resistance, 0.5 is half resistance, and 1 is full resistance.              |
| `entity_interaction_range`       | `ENTITY_INTERACTION_RANGE`       | `[0,64]`       | 3             | The interaction range in which the entity can interact with other entities, in blocks.                                                                                |
| `fall_damage_multiplier`         | `FALL_DAMAGE_MULTIPLIER`         | `[0,100]`      | 1             | A multiplier for fall damage taken by the entity.                                                                                                                     |
| `flying_speed`                   | `FLYING_SPEED`                   | `[0,1024]`     | 0.4           | A multiplier for flying speed. This is not actually used by all flying entities, and ignored by e.g. ghasts.                                                          |
| `follow_range`                   | `FOLLOW_RANGE`                   | `[0,2048]`     | 32            | The distance in blocks that the entity will target/follow the player.                                                                                                 |
| `gravity`                        | `GRAVITY`                        | `[1,1]`        | 0.08          | The gravity the entity is influenced by, in blocks per tick squared.                                                                                                  |
| `jump_strength`                  | `JUMP_STRENGTH`                  | `[0,32]`       | 0.42          | The jump strength of the entity. Higher value means higher jumping.                                                                                                   |
| `knockback_resistance`           | `KNOCKBACK_RESISTANCE`           | `[0,1]`        | 0             | The knockback resistance of the entity. This is a value in percent, i.e. 0 is no resistance, 0.5 is half resistance, and 1 is full resistance.                        |
| `luck`                           | `LUCK`                           | `[-1024,1024]` | 0             | The luck value of the entity. This is used when rolling [loot tables][loottables] to give bonus rolls or otherwise modify the resulting items' quality.               |
| `max_absorption`                 | `MAX_ABSORPTION`                 | `[0,2048]`     | 0             | The max absorption (yellow hearts) of the entity. A value of 1 means half a heart.                                                                                    |
| `max_health`                     | `MAX_HEALTH`                     | `[1,1024]`     | 20            | The max health of the entity. A value of 1 means half a heart.                                                                                                        |
| `mining_efficiency`              | `MINING_EFFICIENCY`              | `[0,1024]`     | 0             | How fast the entity can mine blocks, as an additive modifier, only if the used tool is correct. See [Mining Speed][miningspeed] for more information.                 |
| `movement_efficiency`            | `MOVEMENT_EFFICIENCY`            | `[0,1]`        | 0             | A linearly-interpolated movement speed bonus applied to the entity when it is walking on blocks that have a slowdown, such as soul sand.                              |
| `movement_speed`                 | `MOVEMENT_SPEED`                 | `[0,1024]`     | 0.7           | The movement speed of the entity. Higher value means faster.                                                                                                          |
| `oxygen_bonus`                   | `OXYGEN_BONUS`                   | `[0,1024]`     | 0             | An oxygen bonus for the entity. The higher this is, the longer it takes for the entity to start drowning.                                                             |
| `safe_fall_distance`             | `SAFE_FALL_DISTANCE`             | `[-1024,1024]` | 3             | The fall distance for the entity that is safe, i.e. the distance in which no fall damage is taken.                                                                    |
| `scale`                          | `SCALE`                          | `[0.0625,16]`  | 1             | The scale at which the entity is rendered.                                                                                                                            |
| `sneaking_speed`                 | `SNEAKING_SPEED`                 | `[0,1]`        | 0.3           | A movement speed multiplier applied to the entity when it is sneaking.                                                                                                |
| `spawn_reinforcements`           | `SPAWN_REINFORCEMENTS_CHANCE`    | `[0,1]`        | 0             | The chance for zombies to spawn other zombies. This is only relevant on hard difficulty, as zombie reinforcements do not occur on normal difficulty or lower.         |
| `step_height`                    | `STEP_HEIGHT`                    | `[0,10]`       | 0.6           | The step height of the entity, in blocks. If this is 1, the player can walk up 1-block ledges like they were slabs.                                                   |
| `submerged_mining_speed`         | `SUBMERGED_MINING_SPEED`         | `[0,20]`       | 0.2           | How fast the entity can mine blocks, as a multiplicative modifier, only if the entity is underwater. See [Mining Speed][miningspeed] for more information.            |
| `sweeping_damage_ratio`          | `SWEEPING_DAMAGE_RATIO`          | `[0,1]`        | 0.6           | The amount of damage done by sweep attacks, in percent of the main attack. This is a value in percent, i.e. 0 is no damage, 0.5 is half damage, and 1 is full damage. |
| `water_movement_efficiency`      | `WATER_MOVEMENT_EFFICIENCY`      | `[0,1]`        | 0             | A movement speed multiplier that is applied when the entity is underwater.                                                                                            |

:::warning
Some attribute caps are set relatively arbitrarily by Mojang. This is especially notable for armor, which is capped at 30. This is mitigated by some mods that change these values.
:::

### NeoForge

The following attributes are in the `neoforge` namespace, and their in-code values can be found in the `NeoForgeMod` class.

| Name               | In Code            | Range      | Default Value | Usage                                                                                                                                                |
|--------------------|--------------------|------------|---------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| `creative_flight`  | `CREATIVE_FLIGHT`  | `[0,1]`    | 0             | Determines whether creative flight for the entity is enabled (\> 0) or disabled (\<\= 0).                                                            |
| `nametag_distance` | `NAMETAG_DISTANCE` | `[0,64]`   | 64            | How far the nametag of the entity will be visible, in blocks.                                                                                        |
| `swim_speed`       | `SWIM_SPEED`       | `[0,1024]` | 1             | A movement speed multiplier that is applied when the entity is underwater. This is applied independently from `minecraft:water_movement_efficiency`. |

## Default Attributes

When creating a `LivingEntity`, it is required to register a set of default attributes for them. When an entity is [spawned][spawning] in, its default attributes are set on it. Default attributes are registered in the [`EntityAttributeCreationEvent`][event] like so:

```java
@SubscribeEvent
public static void createDefaultAttributes(EntityAttributeCreationEvent event) {
    event.put(
        // Your entity type.
        MY_ENTITY.get(),
        // An AttributeSupplier. This is typically created by calling LivingEntity#createLivingAttributes,
        // setting your values on it, and calling #build. You can also create the AttributeSupplier from scratch
        // if you want, see the source of LivingEntity#createLivingAttributes for an example.
        LivingEntity.createLivingAttributes()
            // Add an attribute with its default value.
            .add(Attributes.MAX_HEALTH)
            // Add an attribute with a non-default value.
            .add(Attributes.MAX_HEALTH, 50)
            // Build the AttributeSupplier.
            .build()
    );
}
```

:::tip
Some classes have specialized versions of `LivingEntity#createLivingAttributes`. For example, the `Monster` class has a method named `Monster#createMonsterAttributes` that can be used instead.
:::

## Querying Attributes

:::info
This section is a work in progress.
:::

## Attribute Modifiers

:::info
This section is a work in progress.
:::

## Custom Attributes

:::info
This section is a work in progress.
:::

[event]: ../concepts/events.md
[livingentity]: livingentity.md
[loottables]: ../resources/server/loottables/index.md
[miningspeed]: ../blocks/index.md#mining-speed
[spawning]: spawning.md
[toughness]: https://minecraft.wiki
[wiki]: https://minecraft.wiki
