# Built-In Enchantment Effect Components

Vanilla Minecraft provides mumerous different types of Enchantment Effect Components for use in [enchantment] definitions. This article will explain each, including their usage and in-code definition.

## Attribute Effect Component
The [Attribute Effect Component], `minecraft:attributes`, is used to apply attribute modifiers to the entity who has the item equipped. The JSON format is as follows:
```json5
"minecraft:attributes": [
    {
        "amount": {
            "type": "minecraft:linear",
            "base": 1,
            "per_level_above_first": 1
        },
        "attribute": "namespace:class.attribute_name",
        "id": "examplemod:enchantment.example",
        "operation": "add_multiplied_base"
    }
],
```

The object within the `amount` block is a [Level Based Value], which can be used to have a Value Effect Component that changes the intensity of its effect by level. The `operation` is one of `add_value`, `add_multiplied_base` or `add_multiplied_total`. See [Attribute Operations] for details.

## Value Effect Components
[Value Effect Components] are used for enchantments that alter a numerical value somewhere in the game, and are implemented by the class `EnchantmentValueEffect`. 

Value Effect Components can be set to use any of these operations on their given values:
- `minecraft:set`: Overwrites the given level-based value.
- `minecraft:add`: Adds the specified level-based value to the old one.
- `minecraft:multiply`: Multiplies the specified level-based factor by the old one.
- `minecraft:remove_binomial`: Polls a given (level-based) chance using a binomial distibution. If it works, subtracts 1 from the value. Note that many values are effectively flags, being fully on at 1 and fully off at 0.
- `minecraft:all_of`: Accepts a list of other value effects and applies them in the stated sequence.

The Sharpness enchantment uses `minecraft:damage`, a Value Effect Component, as follows to achieve its effect:
```json5
"effects": {
    "minecraft:damage": [
      {
        "effect": {
          "type": "minecraft:add",
          "value": {
            "type": "minecraft:linear",
            "base": 1.0,
            "per_level_above_first": 0.5
          }
        }
      }
    ]
  }
```

Custom numerical operations for use in Value Enchantment blocks can be added by registering a subclass of `EnchantmentValueEffect` through `BuiltInRegistries.ENCHANTMENT_VALUE_EFFECT_TYPE`.

The `EnchantmentValueEffect#process` method is can be used to adjust values based on the provided numerical operations, like so:
```java
// `valueEffect` is an EnchantmentValueEffect instance.
// `enchantLevel` is an integer representing the level of the enchantment
float baseValue = 1.0;
float modifiedValue = valueEffect.process(enchantLevel, server.random, baseValue);
```

### Vanilla Enchantment Value Effect Component Types
#### Defined as `DataComponentType<EnchantmentValueEffect>`
- `minecraft:crossbow_charge_time`: Modifies the charge-up time of this crossbow in seconds. Used by Quick Charge.
- `minecraft:trident_spin_attack_strength`: Modifies the 'strength' of the spin attack of a trident (see `TridentItem#releaseUsing`). Used by Riptide.

#### Defined as `DataComponentType<List<ConditionalEffect<EnchantmentValueEffect>>>`
Armor related:
- `minecraft:armor_effectiveness`: Determines effectiveness of armor against this weapon on a scale of 0 (no protection) to 1 (normal protection). Used by Breach.
- `minecraft:damage_protection`: Each "point" of damage reduction reduces damage taken while wielding this item by 4%, to a maximum reduction of 80%. Used by Blast Protection, Feather Falling, Fire Protection, Protection, and Projectile Protection.

Attack related:
- `minecraft:damage`: Modifies attack damage with this weapon. Used by Sharpness, Impaling, Bane of Arthropods, Power, and Smite. 
- `minecraft:smash_damage_per_fallen_block`: Adds damage per block fallen to a mace. Used by Density.
- `minecraft:knockback`: Modifies the amount of knockback caused while wielding this weapon, measured in game units. Used by Knockback and Punch.
- `minecraft:mob_experience`: Modifies the amount of experience for killing a mob. Unused.

Durability related:
- `minecraft:item_damage`: Modifies the durability damage taken by the item. Values below 1 act as a chance that the item takes damage. Used by Unbreaking.
- `minecraft:repair_with_xp`: Causes the item to repair itself using XP gain, and determines how effective this is. Used by Mending.

Projectile related:
- `minecraft:ammo_use`: Modifies the amount of ammo used when firing a bow or crossbow. The value is clamped to an integer, so values below 1 will result in 0 ammo use. Used by Infinity.
- `minecraft:projectile_piercing`: Modifies the number of entities pierced by a projectile from this weapon. Used by Piercing.
- `minecraft:projectile_count`: Modifies the number of projectiles spawned when shooting this bow. Used by Multishot.
- `minecraft:projectile_spread`: Modifies the maximum spread of projectiles in degrees from the direction they were fired. Used by Multishot.
- `minecraft:trident_return_acceleration`: Causes the trident to return to its owner, and modifies the acceleration applied to this trident while doing so. Used by Loyalty.

Other:
- `minecraft:block_experience`: Modifies the amount of XP from breaking a block. Used by Silk Touch.
- `minecraft:fishing_time_reduction`: Reduces the time it takes for the bobber to sink while fishing with this rod by the given number of seconds. Used by Lure.
- `minecraft:fishing_luck_bonus`: Modifies the amount of [luck] used in the fishing loot table. Used by Luck of the Sea.

#### Defined as `DataComponentType<List<TargetedConditionalEffect<EnchantmentValueEffect>>>`
- `minecraft:equipmentment_drops`: Modifies the chance of equipment dropping from an entity killed by this weapon. Used by Looting.

## Location Based Effect Components
[Location Based Effect Components] are components that define behavior that requires context from the level. 

Custom `EnchantmentLocationBasedEffect` extensions can be registered through `BuiltInRegistries.ENCHANTMENT_LOCATION_BASED_EFFECT_TYPE`. Overriding `EnchantmentEntityEffect#onChangedBlock` allows for the subclass to do something whenever the wielder's BlockPos changes.

### Vanilla Location Based Effect Component Types
#### Defined as `DataComponentType<List<ConditionalEffect<EnchantmentLocationBasedEffect>>>`
- `minecraft:location_changed`: Runs a Location Based Effect when the wielder's Block Position changes and when this item is equipped. Used by Frost Walker and Soul Speed.

### Entity Effect Components
[Entity Effect Components] are components that contain an `EnchantmentEntityEffect`, and are used to implement enchantments that directly affect an entity or the level.

Custom `EnchantmentEntityEffect` extensions can be registered through `BuiltInRegistries.ENCHANTMENT_ENTITY_EFFECT_TYPE`, and their behavior is dictated by the implementation of their `EnchantmentEntityEffect#apply` method.

Here is an example of the JSON definition of one such component from the Fire Aspect enchantment:
```json5
"minecraft:post_attack": [
    {
        "affected": "victim",
        "effect": {
            "type": "minecraft:ignite",
            "duration": {
                "type": "minecraft:linear",
                "base": 4.0,
                "per_level_above_first": 4.0
            }
        },
        "enchanted": "attacker",
        "requirements": {
            "condition": "minecraft:damage_source_properties",
            "predicate": {
                "is_direct": true
            }
        }
    }
]
```

Here, the Entity Effect Component is `minecraft:post_attack`. Its effect is `minecraft:ignite`, which is implemented by the `Ignite` record. This record's implementation of `EnchantmentEntityEffect#apply` sets the target entity on fire.

### Vanilla Enchantment Entity Effect Component Types
#### Defined as `DataComponentType<List<ConditionalEffect<EnchantmentEntityEffect>>>`
- `minecraft:hit_block`: Runs an entity effect when an entity (for example, a projectile) hits a block. Used by Channeling.
- `minecraft:tick`: Runs an entity effect each tick. Used by Soul Speed.
- `minecraft:projectile_spawned`: Runs an entity effect after a projectile entity has been spawned from a bow or crossbow. Used by Flame.

#### Defined as `DataComponentType<List<TargetedConditionalEffect<EnchantmentEntityEffect>>>`
- `minecraft:post_attack`: Runs an entity effect after an attack damages an entity. Used by Bane of Arthropods, Channeling, Fire Aspect, Thorns, and Wind Burst.

### Vanilla Enchantment Entity Effects
- `minecraft:all_of`: Runs a list of entity effects in sequence.
- `minecraft:apply_mob_effect`: Applies a status effect to the affected mob.
- `minecraft:damage_entity`: Does damage to the affected entity. This stacks with attack damage if in an attacking context.
- `minecraft:damage_item`: Damages this item's durability.
- `minecraft:explode`: Summons an explosion. 
- `minecraft:ignite`: Sets the entity on fire.
- `minecraft:play_sound`: Plays a specified sound.
- `minecraft:replace_block`: Replaces a block at a given offset.
- `minecraft:replace_disk`: Replaces a disk of blocks.
- `minecraft:run_function`: Runs a specified [datapack funcion].
- `minecraft:set_block_properies`: Modifies the block state properties of the specified block.
- `minecraft:spawn_particles`: Spawns a particle.
- `minecraft:summon_entity`: Summons an entity.

For more detail on each of these, please look at the [relevant minecraft wiki page].

## Other Vanilla Enchantment Component Types
### Defined as `DataComponentType<List<ConditionalEffect<DamageImmunity>>>`
- `minecraft:damage_immunity`: Applies immunity to a specified damage type. Used by Frost Walker.

### Defined as `DataComponentType<Unit>`
- `minecraft:prevent_equipment_drop`: Prevents this item from being dropped by a player when dying. Used by Curse of Vanishing.
- `minecraft:prevent_armor_change`: Prevents this item from being unequipped from an armor slot. Used by Curse of Binding.

### Defined as `DataComponentType<List<CrossbowItem.ChargingSounds>>`
- `minecraft:crossbow_charge_sounds`: Determines the sound events that occur when charging a crossbow. Each entry represents one level of the enchantment.

### Defined as `DataComponentType<List<Holder<SoundEvent>>>`
- `minecraft:trident_sound`: Determines the sound events that occur when using a trident. Each entry represents one level of the enchantment.

[enchantment]: index.md
[Value Effect Components]: https://minecraft.wiki/w/Enchantment_definition#Components_with_value_effects
[Entity Effect Components]: https://minecraft.wiki/w/Enchantment_definition#Components_with_entity_effects
[Location Based Effect Components]: https://minecraft.wiki/w/Enchantment_definition#location_changed
[text component]: /docs/resources/client/i18n.md
[Level Based Value]: https://minecraft.wiki/w/Enchantment_definition#Level-based_value
[Attribute Effect Component]: https://minecraft.wiki/w/Enchantment_definition#Attribute_effects