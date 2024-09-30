# Enchantments

Enchantments are special effects that can be applied to tools and other items. As of 1.21, enchantments are stored on items as [Data Components], are defined in JSON, and are comprised of Enchantment Effect Components.

A new enchantment can be added by creating a JSON file in your namespace's `enchantment` datapack subfolder. For example, to create an enchantment called `examplemod:example_enchant`, one would create a file `data/examplemod/enchantment/example_enchantment.json`. 

## Enchantment JSON Format
- `description`: The [text component] that will be used as the in-game name of the enchantment.
- `supported_items`: The items or item tag that this enchantment can be applied to.
- `primary_items`: (Optional) The items or item tag that this enchantment appears for in the enchanting table. If left unspecified, this is the same as `supported_items`.
- `exclusive_set`: One or a list of enchantments or enchantment tags that defines mutually exclusive (or 'incompatible') enchantments to this one.
- `weight`: The likelihood that this enchantment will appear in the Enchanting Table from 1 to 1024.
- `max_level`: The maximum level of this enchantment from 1 to 255.
- `min_cost`: The minimum cost of this enchantment in levels. The actual cost will be randomized between this and `max_cost`.
    - `base`: The base cost of the enchantment at level 1.
    - `per_level_above_first`: The cost increase per enchantment level.
- `max_cost`: The maximum cost of this enchantment.
    - `base`: As above.
    - `per_level_above_first`: As above.
- `anvil_cost`: The cost this enchantment adds to repairing an item in the Anvil in levels. This cost is multiplied by enchantment level and halved if the enchant is on a book.
- `slots`: (Optional) A list of slot groups this enchantment provides effects in. Can include any of: `any`, `hand`, `mainhand`, `offhand`, `armor`, `feet`, `legs`, `chest`, `head`, `body`
- `effects`: The effects this enchantment provides as a map of Enchantment Effect Components.

## Enchantment Effect Components
Enchantment Effect Components are specially-registered [Data Components] that determine how an enchantment functions. Enchantment Effect Component Types must be [registered] to `BuiltInRegistries.ENCHANTMENT_EFFECT_COMPONENT_TYPE`, but are otherwise identical to other Data Components. For example, one could register an Enchantment Effect Component that can store an `ExampleEffectData` object as follows:

```java
// In some registration class
public static final DeferredRegister<DataComponentType<?>> ENCHANTMENT_COMPONENT_TYPES = DeferredRegister.create(BuiltInRegistries.ENCHANTMENT_EFFECT_COMPONENT_TYPE, "examplemod");

public static final DeferredHolder<DataComponentType<?>, DataComponentType<ExampleEffectData>> EXAMPLE =
    ENCHANTMENT_COMPONENT_TYPES.register("example",
        () -> DataComponentType.<ExampleEffectData>builder()
            .persistent(ExampleEffectData.CODEC)
            .build());
```

### `ConditionalEffect`
Wrapping the type in `ConditionalEffect<?>` permits the use of [predicates] when defining enchantments. This allows some effects to activate situationally.
Registering such an effect can be done as follows:
```java
public static final DeferredHolder<DataComponentType<?>, DataComponentType<ConditionalEffect<Unit>>> EXAMPLE_CONDITIONAL_EFFECT =
    ENCHANTMENT_COMPONENT_TYPES.register("example_conditional",
        () -> DataComponentType.ConditionalEffect<Unit>>builder()
            .persistent(ConditionalEffect.codec(Unit.CODEC, LootContextParamSets.EMPTY))
            .build());
```
The parameters to `ConditionalEffect.codec` are the codec for the template type of the `ConditionalEffect<T>`, followed by some `LootContextParamSets` item. There are many of these to choose from, so choose carefully.

Whether a given item stack has a specific Enchantment Effect Component can be tested for with `EnchantmentHelper#has`.


### Attribute Effect Component
The [Attribute Effect Component], `minecraft:attributes`, is used to apply attribute modifiers to the entity who has the item equipped. The JSON format is as follows:
```json
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

### Value Effect Components
[Value Effect Components] are used for enchantments that alter a numerical value somewhere in the game, and are implemented by the class `EnchantmentValueEffect`. 

Value Effect Components can be set to use any of these operations on their given values:
- `minecraft:set`: Overwrites the given level-based value.
- `minecraft:add`: Adds the specified level-based value to the old one.
- `minecraft:multiply`: Multiplies the specified level-based factor by the old one.
- `minecraft:remove_binomial`: Polls a given (level-based) chance using a binomial distibution. If it works, subtracts 1 from the value. Note that many values are effectively flags, being fully on at 1 and fully off at 0.
- `minecraft:all_of`: Accepts a list of other value effects and applies them in the stated sequence.

An example from Vanilla is `minecraft:damage`, which allows for an enchantment to modify the attack damage done to an entity when an enchanted item is used as a weapon. The Sharpness enchantment uses this component as follows to achieve its effect:
```json
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

#### Using Enchantment Value Effect Components
One way to adjust values based on custom Value Effect components is to invoke one of the overloads of `EnchantmentHelper#runIterationOnItem`. This function accepts an `EnchantmentHelper.EnchantmentVisitor`, which is a functional interface that accepts an enchantment and its level, and is invoked on all of the enchantments that the given itemstack has. While any consumer of those two values will work, the `Enchantment` class provides a handy function that fits this interface (and is used often by vanilla) -- `Enchantment#applyEffects`. This function takes a `List<ConditionalEffect<EnchantmentValueEffect>>`, a `LootContext`, and a function that consumes a value effect. The function verifies that all of the `ConditionalEffect`s are satisfied given the provided `LootContext`, and if so, invokes the provided function.

To actually perform the adjustment, use `EnchantmentValueEffect#process`, which takes the enchantment level, a random value (in case the binomial_random Level Based Value was asked for), and a float, then returns the adjusted float based on the settings provided to the `EnchantmentValueEffect` instance. A convenient trick is to invoke this method inside a lambda argument to the aforementioned `Enchantment#applyEffects` method, and to have it update a `MutableFloat` with the value to allow it to escape the lambda and be put to use elsewhere.

```java
MutableFloat mutableValue = new MutableFloat(unmodifiedValue);
EnchantmentHelper.runIterationOnItem(itemStack, (enchantment, enchantLevel) -> Enchantment.applyEffects(
    enchantment.value().getEffects(MY_ENCHANTMENT_COMPONENT_TYPE_HOLDER.value()),
    // Provide a loot context,
    (valueEffect) -> mutableValue.setValue(valueEffect.process(enchantLevel, server.random, mutableValue.getValue()))
));
```

Custom numerical operations for use in Value Enchantment blocks can be added by registering a subclass of `EnchantmentValueEffect` through `BuiltInRegistries.ENCHANTMENT_VALUE_EFFECT_TYPE`.

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

### Entity Effect Components
[Entity Effect Components] are components that contain an `EnchantmentEntityEffect`, and are used to implement enchantments that directly affect an entity or the level.

Custom `EnchantmentEntityEffect` extensions can be registered through `BuiltInRegistries.ENCHANTMENT_ENTITY_EFFECT_TYPE`, and their behavior is dictated by the implementation of their `EnchantmentEntityEffect#apply` method.

Here is an example of the JSON definition of one such component from the Fire Aspect enchantment:
```json
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

### Location Based Effects
[Location Based Effect Components] are like Entity Effect Components, but they instead contain Location Based Effects. These are used for effects that need to reference specific places in the world relative to the wielder. Entity Effects are a subclass of Location Based Effects.

Custom `EnchantmentLocationBasedEffect` extensions can be registered through `BuiltInRegistries.ENCHANTMENT_LOCATION_BASED_EFFECT_TYPE`. Overriding `EnchantmentEntityEffect#onChangedBlock` allows for the subclass to do something whenever the wielder's BlockPos changes.

### Vanilla Location Based Effect Component Types
#### Defined as `DataComponentType<List<ConditionalEffect<EnchantmentLocationBasedEffect>>>`
- `minecraft:location_changed`: Runs a Location Based Effect when the wielder's Block Position changes and when this item is equipped. Used by Frost Walker and Soul Speed.

### Other Vanilla Enchantment Component Types
#### Defined as `DataComponentType<List<ConditionalEffect<DamageImmunity>>>`
- `minecraft:damage_immunity`: Applies immunity to a specified damage type. Used by Frost Walker.

#### Defined as `DataComponentType<Unit>`
- `minecraft:prevent_equipment_drop`: Prevents this item from being dropped by a player when dying. Used by Curse of Vanishing.
- `minecraft:prevent_armor_change`: Prevents this item from being unequipped from an armor slot. Used by Curse of Binding.

#### Defined as `DataComponentType<List<CrossbowItem.ChargingSounds>>`
- `minecraft:crossbow_charge_sounds`: Determines the sound events that occur when charging a crossbow. Each entry represents one level of the enchantment.

#### Defined as `DataComponentType<List<Holder<SoundEvent>>>`
- `minecraft:trident_sound`: Determines the sound events that occur when using a trident. Each entry represents one level of the enchantment.

## Enchantment Data Generating
Enchantment JSON files can be created automatically using the [data generation] system by passing a `RegistrySetBuilder` into `DatapackBuiltInEntriesProvider`. The JSON will be placed in `<project root>/src/generated/data/<modid>/enchantment/<path>.json`.

For more information on how RegistrySetBuilder and DatapackBuiltinEntriesProvider work, please see the article on [Data Generation for Datapack Registries]. 

```java
// This RegistrySetBuilder should be passed into a DatapackBuiltinEntriesProvider in your GatherDataEvent handler.
public static RegistrySetBuilder BUILDER = new RegistrySetBuilder();

// Define the ResourceKey for our enchantment.
static ResourceKey<Enchantment> EXAMPLE_ENCHANTMENT_KEY = ResourceKey.create(
        Registries.ENCHANTMENT,
        ResourceLocation.fromNamespaceAndPath("examplemod", "example_enchantment")
);

// Specify the enchantment definition of for our enchantment. 
static Enchantment.EnchantmentDefinition EXAMPLE_ENCHANTMENT_DEFINITION = new Enchantment.EnchantmentDefinition(
    HolderSet.direct(...), // A HolderSet of Items that the enchantment will be compatible with.
    Optional.empty(), // An Optional HolderSet of Items that the enchantment considers "primary".
    30, // The weight of the enchantment.
    3, // The maximum number of levels.
    new Enchantment.Cost(3, 1), // The minimum cost of the enchantment. The first parameter is base cost, the second is cost per level.
    new Enchantment.Cost(4, 2), // The maximum cost of the enchantment. As above.
    2, // The anvil cost of the enchantment.
    List.of(EquipmentSlotGroup.ANY) // A list of EquipmentSlotGroups that this enchantment has effects in.
);

// Add the enchantment itself to the builder.
BUILDER.add(
    Registries.ENCHANTMENT,
    bootstrap -> bootstrap.register(
        EXAMPLE_ENCHANTMENT_KEY,
        new Enchantment(
                Component.literal("Example Enchantment"), // The Text Component that specifies the enchantment's name.
                EXAMPLE_ENCHANTMENT_DEFINITION,
                HolderSet.empty(), // A HolderSet of incompatible other enchantments.
                DataComponentMap.builder() // A DataComponentMap of the Enchantment Effect Components associated with this enchantment and their values.
                    .set(MY_ENCHANTMENT_EFFECT_COMPONENT_TYPE, new ExampleData())
                    .build()
        )
    )
);

```

This will produce the following JSON data when the data generator runs:

```json
{
  "anvil_cost": 2,
  "description": "Example Enchantment",
  "effects": {
    <effect components>
  },
  "max_cost": {
    "base": 4,
    "per_level_above_first": 2
  },
  "max_level": 3,
  "min_cost": {
    "base": 3,
    "per_level_above_first": 1
  },
  "slots": [
    "any"
  ],
  "supported_items": <supported item list>,
  "weight": 30
}
```


[Data Components]: /docs/items/datacomponents
[Codec]: /docs/datastorage/codecs
[Enchantment definition Minecraft wiki page]: https://minecraft.wiki/w/Enchantment_definition
[registered]: /docs/concepts/registries
[predicates]: https://minecraft.wiki/w/Predicate
[Value Effect Components]: https://minecraft.wiki/w/Enchantment_definition#Components_with_value_effects
[Entity Effect Components]: https://minecraft.wiki/w/Enchantment_definition#Components_with_entity_effects
[Location Based Effect Components]: https://minecraft.wiki/w/Enchantment_definition#location_changed
[text component]: /docs/resources/client/i18n.md
[Level Based Value]: https://minecraft.wiki/w/Enchantment_definition#Level-based_value
[Attribute Effect Component]: https://minecraft.wiki/w/Enchantment_definition#Attribute_effects
[Attribute Operations]: https://minecraft.wiki/w/Attribute#Operations
[data generation]: /docs/resources/#data-generation
[Data Generation for Datapack Registries]: https://docs.neoforged.net/docs/concepts/registries/#data-generation-for-datapack-registries
[luck]: https://minecraft.wiki/w/Luck
[datapack function]: https://minecraft.wiki/w/Function_(Java_Edition)
[relevant minecraft wiki page]: https://minecraft.wiki/w/Enchantment_definition#Entity_effects