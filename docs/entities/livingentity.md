---
sidebar_position: 4
---
# Living Entities, Mobs & Players

Living entities are a big subgroup of [entities] that all inherit from the common `LivingEntity` superclass. These include mobs (through the `Mob` subclass), players (through the `Player` subclass) and armor stands (through the `ArmorStand` subclass).

Living entities have a number of additional properties that regular entities do not have. These include [attributes], [mob effects][mobeffects], damage tracking and more.

## Health, Damage and Healing

_See also: [Attributes][attributes]._

One of the most notable features that sets living entities apart from others is the fully-fleshed health system. Living entities generally have a max health, a current health and sometimes things such as armor or natural regeneration.

By default, max health is determined by the `minecraft:generic.max_health` [attribute][attributes], and the current health is set to the same value when [spawning]. When the entity is damaged by calling [`Entity#hurt`][hurt] on it, the current health is decreased according to the damage calculations. Many entities, such as zombies, will by default then remain at that reduced health value, while some, such as players, can heal these lost hit points again.

To get or set the max health value, the attribute is read or written directly, like so:

```java
// Get the attribute map of our entity.
AttributeMap attributes = entity.getAttributes();

// Get the max health of our entity.
float maxHealth = attributes.getValue(Attributes.MAX_HEALTH);
// Shortcut for the above.
maxHealth = entity.getMaxHealth();

// Setting the max health must either be done by getting the AttributeInstance and calling #setBaseValue, or by
// adding an attribute modifier. We will do the former here. Please refer to the Attributes article for more details.
attributes.getInstance(Attributes.MAX_HEALTH).setBaseValue(50);
```

When [taking damage][damage], living entities will apply some additional calculations, such as considering the `minecraft:generic.armor` attribute (except for [damage types][damagetypes] that are in the `minecraft:bypasses_armor` [tag][tags]) as well as the `minecraft:generic.absorption` attribute. Living entities can also override `#onDamageTaken` to perform post-attack behavior; it is only called if the final damage value is greater than zero.

### Damage Events

Due to the complexity of the damage pipeline, there are multiple events for you to hook into, which are fired in the order they are listed in. This is generally intended for damage modifications you want to do to entities that are not (or not necessarily) your own, i.e. if you want to modify damage done to entities from Minecraft or other mods, or if you want to modify damage done to any entity, which may or may not be your own.

Common to all these events is the `DamageContainer`. A new `DamageContainer` is instantiated at the start of the attack, and discarded after the attack has finished. It contains the original [`DamageSource`][damagesources], the original damage amount, and a list of all individual modifications - armor, absorption, [enchantments], [mob effects][mobeffects], etc. The `DamageContainer` is passed to all events listed below, and you can check what modifications have already been done to make your own changes as necessary.

#### `EntityInvulnerabilityCheckEvent`

This event allows mods to both bypass and add invulnerabilities for an entity. This event is also fired for non-living entities. You would use this event to make an entity immune to an attack, or strip away an existing immunity it may have.

For technical reasons, hooks to this event should be deterministic and only depend on the damage type. This means that random chances for invulnerabilities, or invulnerabilities that only apply up to a certain damage amount, should instead be added in `LivingIncomingDamageEvent` (see below).

#### `LivingIncomingDamageEvent`

This event is called only on the server side and should be used for two main use cases: dynamically cancelling the attack, and adding reduction modifier callbacks.

Dynamically cancelling attacks is basically adding a non-deterministic invulnerability, for example a random chance to cancel damage, an invulnerability depending on the time of day or the amount of damage taken, etc. Consistent invulnerabilities should be performed via `EntityInvulnerabilityCheckEvent` (see above).

Reduction modifier callbacks allow you to modify a part of the performed damage reduction. For example, it would allow you to reduce the effect of armor damage reduction by 50%. This would then also propagate correctly to mob effects, which then have a different damage amount to work with, etc. A reduction modifier callback can be added like so:

```java
@SubscribeEvent
public static void decreaseArmor(LivingIncomingDamageEvent event) {
    // We only apply this decrease to players and leave zombies etc. unchanged
    if (event.getEntity() instanceof Player) {
        // Add our reduction modifier callback.
        event.getDamageContainer().addModifier(
                // The reduction to target. See the DamageContainer.Reduction enum for possible values.
                DamageContainer.Reduction.ARMOR,
                // The modification to perform. Gets the damage container and the base reduction as inputs,
                // and outputs the new reduction. Both input and output reductions are floats.
                (container, baseReduction) -> baseReduction * 0.5f
        );
    }
}
```

Callbacks are applied in the order they are added. This means that callbacks added in an event handler with higher [priority] will be run first.

#### `LivingShieldBlockEvent`

This event can be used to fully customize shield blocking. This includes introducing additional shield blocking, preventing shield blocks, modifying the vanilla shield block check, changing the damage done to the shield or the attacking item, changing the view arc of the shield, allowing projectiles but blocking melee attacks (or vice versa), block attacks passively (i.e. without using the shield), block only a percentage of damage, etc.

Note that this event is not designed for immunities or attack cancellations that are outside the scope of "shield-like" items.

#### `LivingArmorHurtEvent`

This event should be pretty self-explanatory. It is fired when armor damage from an attack is calculated, and can be used to modify how much durability damage (if any at all) is done to which armor piece.

#### `LivingDamageEvent.Pre`

This event is called immediately before the damage is done. The `DamageContainer` is fully populated, the final damage amount is available, and the event can no longer be canceled as the attack is considered successful by this point.

#### `LivingDamageEvent.Post`

This event is called after the damage has been done, absorption has been reduced, the combat tracker has been updated, and stats and game events have been handled. It is not cancellable, as the attack has already happened. This event would commonly be used for post-attack effects. Note that the event is fired even if the damage amount is zero, so check that value accordingly if needed.

## Mob Effects

_See [Mob Effects & Potions][mobeffects]._

## Equipment

_See [Containers on Entities][containers]._

## AI and Navigation

One of the `Mob` subclass's main features is the AI system, as this is of course not applicable to players or armor stands. It tells the mob where to go, what to do and whom to attack.

There are two implementations of this system: the goal system and the brain system. Both of these systems then use a subclass of `PathNavigation` to calculate the path to their desired position.

### Goals

:::info
This section is a work in progress.
:::

### Brains

:::info
This section is a work in progress.
:::

### Navigation

:::info
This section is a work in progress.
:::

[attributes]: attributes.md
[containers]: ../blockentities/container.md
[damage]: index.md#damaging-entities
[damagesources]: ../resources/server/damagetypes.md#creating-and-using-damage-sources
[damagetypes]: ../resources/server/damagetypes.md
[enchantments]: ../resources/server/enchantments/index.md
[entities]: index.md
[hurt]: index.md#damaging-entities
[mobeffects]: ../items/mobeffects.md
[priority]: ../concepts/events.md#priority
[spawning]: spawning.md
[tags]: ../resources/server/tags.md
