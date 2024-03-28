# Attributes

The attribute system is a system to provide values that are modifiable by multiple other things.
Attributes can be used in a mod compatible way to change attack damage, maximum health and other things without each mod setting the value to something they expect and instead use modifications to e.g. add 2 hearts.

## Existing Attributes

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
| `JUMP_STRENGTH`               | how high the entity jumps. Only applicable for horse like mobs (including mules and camels). |

NeoForge adds the following attributes:

| Attribute              | Description                                                            |
|------------------------|------------------------------------------------------------------------|
| `SWIM_SPEED`           | how fast the entity swims                                              |
| `NAMETAG_DISTANCE`     | how far the nametag can be seen for this entity                        |
| `ENTITY_GRAVITY`       | how fast the entity accelerates when not on ground                     |
| `BLOCK_REACH`          | how far the player can interact with the world                         |
| `ENTITY_REACH`         | how far the player can interact with entities                          |
| `STEP_HEIGHT_ADDITION` | how high the entity can walk up blocks in addition to Entity#maxUpStep |

## Attribute, AttributeInstance and AttributeModifier

Attributes have to be [registered][registration] and are used to look up the current `AttributeInstance` for a given LivingEntity. The `AttributeInstance` holds all `AttributeModifier` currently active on the entity.
AttributeModifiers require a UUID that should be unique to this modifier. It's used to ensure that an `AttributeModifier` can only be applied once to a LivingEntity. If you want to keep track of that modifier to remove it at a later point, then you should generate a random one once and then hardcode it. If you don't need to keep track of the modifier, it is sufficient to use a random UUID.
They also require an Operation and an amount to perform the calculation. How the calculation works can be read in the next section.
```java
double maxHealth = livingentity.getAttribute(Attributes.MAX_HEALTH).getValue()
```

### Calculation

AttributeInstances can have 3 different operations, `ADDITION`, `MULTIPLY_BASE` and `MULTIPLY_TOTAL`.
```
value = (base + sum(addition))*(1+sum(multiply_base))*(1+z1)*(1+z2)[...]
```
The base value is set by the attributes default, but is sometimes set by the entity in some other events(e.g. Wolf taming).
z1 and z2 are two multiply_total modifiers and more are calculated the same way.

## Using AttributeModifiers

AttributeModifiers can be applied for held items and worn armor.
Changing the AttributeModifier for custom Items can be achieved by overriding IForgeItem#getAttributeModifiers. You can also apply AttributeModifiers to ItemStacks by calling ItemStack#addAttributeModifier.
Another way to apply AttributeModifiers is by adding them with a `MobEffect`. For that you can call `MobEffect#addAttributeModifier` on the MobEffect to add AttributeModifiers when this MobEffect is applied. The applied AttributeModifier has an effect of x*(1+amplifier) with x being the amplifier value that was passed into `MobEffect#addAttributeModifier`.
Attribute Modifiers can also be added and removed from/to LivingEntities directly:
```java
livingEntity.getAttribute(Attributes.MAX_HEALTH).addPermanentModifier(new AttributeModifier("health upgrade", 10, AttributeModifier.Operation.ADDITION));
livingEntity.getAttribute(Attributes.MAX_HEALTH).addTransientModifier(new AttributeModifier("health upgrade", 10, AttributeModifier.Operation.ADDITION));
livingEntity.getAttribute(Attributes.MAX_HEALTH).removeModifier(UUID.fromString("556E1665-8B10-40C8-8F9D-CF9B1667F295"));
```
Transient modifiers are modifiers that are not serialized and saved, permanent modifiers are saved.

[registration]: ../concepts/registries.md