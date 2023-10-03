Attributes
==========

Attributes are ways to modify specific values for living entities in a mod compatible way. 

Existing Attributes
-----------
Vanilla adds the following attributes:

| Attribute                     | Description                                                                                  |
|-------------------------------|----------------------------------------------------------------------------------------------|
| `MAX_HEALTH`                  | how much health the entity has                                                               |
| `FOLLOW_RANGE`                | how far the entity can track something                                                       |
| `KNOCKBACK_RESISTANCE`        | how strong knockback is reduced. Ranged between 0 and 1, 1 cancelling all knockback.         |
| `MOVEMENT_SPEED`              | how fast the entity moves                                                                    |
| `FLYING_SPEED`                | The flying speed of the entity. Not applicable to players who fly with the elytra            |
| `ATTACK_DAMAGE`               | how much damage the entity deals when attacking                                              |
| `ATTACK_KNOCKBACK`            | how much knockback the entity causes when physically attacking                               |
| `ATTACK_SPEED`                | how many full damage attack the entity deals per second                                      |
| `ARMOR`                       | how many armor points the entity has and how resistant it is to attacks                      |
| `ARMOR_TOUGHNESS`             | how resistant the entity is to strong attacks                                                |
| `LUCK`                        | changes the chance for treasure, junk and normal fishing loottables                          |
| `SPAWN_REINFORCEMENTS_CHANCE` | how likely a zombie spawns reinforcements when attacked                                      |
| `JUMP_STRENGTH`               | how high the entity jumps. Only applicable for horse like more (including mules and camels). |

NeoForge adds the following attributes:

| Attribute              | Description                                                            |
|------------------------|------------------------------------------------------------------------|
| `SWIM_SPEED`           | how fast the entity swims                                              |
| `NAMETAG_DISTANCE`     | how far the nametag can be seen for this entity                        |
| `ENTITY_GRAVITY`       | how fast the entity accelerates when not on ground                     |
| `BLOCK_REACH`          | how far the player can interact with the world                         |
| `ENTITY_REACH`         | how far the player can interact with entities                          |
| `STEP_HEIGHT_ADDITION` | how high the entity can walk up blocks in addition to Entity#maxUpStep |

Attribute, AttributeInstance and AttributeModifier
-----------

Attributes have to be [registered][registration] and are used to look up the current `AttributeInstance` for a given LivingEntity. The `AttributeInstance` holds all `AttributeModifier` currently active on the entity.
AttributeModifiers require a UUID that should be unique to this modifier. It's used to ensure that an `AttributeModifier` can only be applied once to a LivingEntity. You should generate a random one once and then hardcode it. They also require an Operation and an amount to perform the calculation. How the calculation works can be read in the next section.
The value of an `Attribute` for a given `LivingEntity` can be obtained by the `AttributeMap` for the LivingEntity and getting the `AttributeInstance` from it and then calling `AttributeInstance#getValue`.

Operations
-----------

AttributeInstances can have 3 different operations, `ADDITION`, `MULTIPLY_BASE` and `MULTIPLY_TOTAL`.
First the default value is used and all `ADDITION`-Modifiers are added to it. This is the base value.
`MULTIPLY_BASE`-Modifiers are applied next, they multiply the base value with 1 + the sum of the `MULTIPLY_BASE` modifiers.
`MULTIPLY_TOTAL`-Modifiers are applied last, they multiply the value created with 1+modifier each.

Applying AttributeModifier
-----------

AttributeModifiers can be applied for held items and worn armor.
Changing the AttributeModifier for custom Items can be achieved by overriding IForgeItem#getAttributeModifiers. You can also apply AttributeModifiers to ItemStacks by calling ItemStack#addAttributeModifier.
Attribute Modifiers can also be added and removed to LivingEntities directly by obtaining the `AttributeMap` with `LivingEntity#getAttributes` and getting the AttributeInstance with `AttributeMap#getInstance`. You can then remove and add them with the methods present on the AttributeInstance.

[registration]: ../concepts/registries.md