import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Enchantments

Enchantments are special effects that can be applied to tools and other items. As of 1.21, enchantments are stored on items as [Data Components], are defined in JSON, and are comprised of Enchantment Effect Components. During the game, the enchantments on a particular item are contained within the `DataComponentTypes.ENCHANTMENT` component, in an `ItemEnchantment` instance.

A new enchantment can be added by creating a JSON file in your namespace's `enchantment` datapack subfolder. For example, to create an enchantment called `examplemod:example_enchant`, one would create a file `data/examplemod/enchantment/example_enchantment.json`. 

## Enchantment JSON Format
```json5
{
    "description": {
        "translate": "enchantment.examplemod."
    },
    // The text component that will be used as the in-game name of the enchantment.
    // Can be a translation key or a literal string. 
    
    "supported_items": "#examplemod:enchantable/example",
    // The items or item tag that this enchantment can be applied to.

    "primary_items": [
        "examplemod:item_a",
        "examplemod:item_b"
    ],
    // (Optional) The items or item tag that this enchantment appears for in the enchanting table. 
    // If left unspecified, this is the same as `supported_items`.

    "exclusive_set": "#examplemod:exclusive_to_example",
    // An enchantment tag or list of enchantments that are incompatible with this one.
    // Incompatible enchantments will not be added to the same item by vanilla mechanics.

    "weight": 6,
    // The likelihood that this enchantment will appear in the Enchanting Table. 
    // Bounded by [1, 1024].

    "max_level": 3,
    // The maximum level this enchantment is allowed to reach.
    // Bounded by [1, 255].

    "max_cost": {
        "base": 45,
        "per_level_above_first": 9
    },
    // The maximum cost of this enchantment in levels. 
    // The actual cost during a particular enchantment session will be randomized between this and `min_cost`.
    // Blocks that override IBlockExtension#getEnchantPowerBonus() add their bonus to the player's levels to determine if the player meets an enchantment's cost.
    // Therefore, costs above 30 require the use of bookshelves or other enchantment boosting blocks to be obtainable in survival.

    "min_cost": {
        "base": 2,
        "per_level_above_first": 8
    },
    // Specifies the minimum cost of this enchantment; see above.

    "anvil_cost": 2,
    // The cost that this enchantment adds to repairing an item in an anvil in levels. The cost is multiplied by enchantment level.
    // If an item has a DataComponentTypes.STORED_ENCHANTMENTS component, the cost is halved. In vanilla, this only applies to enchanted books.
    // Bounded by [1, inf).

    "slots": [
        "mainhand"
    ],
    // (Optional) A list of slot groups this enchantment provides effects in. 
    // A slot group is defined as one of the possible values of the EquipmentSlotGroup enum.
    // In vanilla, these are: `any`, `hand`, `mainhand`, `offhand`, `armor`, `feet`, `legs`, `chest`, `head`, and  `body`.

    "effects": {
    "examplemod:custom_effect": [
      {
        "effect": {
          "type": "minecraft:add",
          "value": {
            "type": "minecraft:linear",
            "base": 1,
            "per_level_above_first": 1
          }
        }
      }
    ]
  }
  // The effects that this enchantment provides as a map of Enchantment Effect Components.
}
```

## Enchantment Effect Components
Enchantment Effect Components are specially-registered [Data Components] that determine how an enchantment functions. The type of the component defines its effect, while the data it contains is used to inform or modify that effect. For instance, the `minecraft:damage` component modifies the damage that a weapon deals by an amount determined by its data.

Vanilla defines its Enchantment Effect Components within `net.minecraft.world.item.enchantment.EnchantmentEffectComponents`. 

### Attribute Effect Component
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

### Value Effect Components
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

### Location Based Effect Components
[Location Based Effect Components] are components that define behavior that requires context from the level. 

Custom `EnchantmentLocationBasedEffect` extensions can be registered through `BuiltInRegistries.ENCHANTMENT_LOCATION_BASED_EFFECT_TYPE`. Overriding `EnchantmentEntityEffect#onChangedBlock` allows for the subclass to do something whenever the wielder's BlockPos changes.

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

### Custom Enchantment Effect Components
Enchantment Effect Component Types must be [registered] to `BuiltInRegistries.ENCHANTMENT_EFFECT_COMPONENT_TYPE`, which takes a `DataComponentType<?>`. For example, one could register an Enchantment Effect Component that can store an `ExampleEffectData` object as follows:

```java
// In some registration class
public static final DeferredRegister<DataComponentType<?>> ENCHANTMENT_COMPONENT_TYPES = DeferredRegister.create(BuiltInRegistries.ENCHANTMENT_EFFECT_COMPONENT_TYPE, "examplemod");

public static final DeferredHolder<DataComponentType<?>, DataComponentType<ExampleEffectData>> EXAMPLE =
    ENCHANTMENT_COMPONENT_TYPES.register("example",
        () -> DataComponentType.<ExampleEffectData>builder()
            .persistent(ExampleEffectData.CODEC)
            .build());
```

There are no inheritance requirements on the data held by an Enchantment Effect Component, but it may be helpful to refer to vanilla to ensure compatibility with the vanilla helper methods.

#### `ConditionalEffect`
Wrapping the type in `ConditionalEffect<?>` allows the Enchantment Effect Component to take effect based on conditions informed by a `LootContext`. Specifically, each `ConditionalEffect` contains another effect component, along with an `Optional<LootItemCondition>`. Since `LootItemContext` is a `Predicate<LootContext>`, it can be tested against a specified `LootContext` using `LootItemContext#test`.

`ConditionalEffect` wraps this behavior, allowing one to simply call `ConditionalEffect#matches(LootContext context)` to determine if the effect should be allowed to run.

Vanilla adds an additional helper method to further streamline the process of checking these conditions: `Enchantment#applyEffects()`. This method takes a `List<ConditionalEffect<T>>` evaluates the conditions, and runs a `Consumer<T>` on each `T` contained by a `ConditionalEffect` whose condition was met. Since many of Vanilla Enchantment Effect Components are defined as `List<ConditionalEffect<?>>`, these can be directly plugged into the helper method like so:
```java
// `enchant` is an Enchantment instance.
// `lootContext` is a LootContext instance.
Enchantment.applyEffects(
    enchant.getEffects(EnchantmentEffectComponents.KNOCKBACK), // Or whichever other List<ConditionalEffect<T>> you want
    lootContext,
    (effectData) -> // Use the effectData (in this example, an EnchantmentValueEffect) however you want.
)
```

Registering a custom `ConditionalEffect`-wrapped Enchantment Effect Component Type can be done as follows:
```java
public static final DeferredHolder<DataComponentType<?>, DataComponentType<ConditionalEffect<Unit>>> EXAMPLE_CONDITIONAL_EFFECT =
    ENCHANTMENT_COMPONENT_TYPES.register("example_conditional",
        () -> DataComponentType.ConditionalEffect<Unit>>builder()
            .persistent(ConditionalEffect.codec(Unit.CODEC, LootContextParamSets.EMPTY))
            .build());
```
The parameters to `ConditionalEffect.codec` are the codec for the generic `ConditionalEffect<T>`, followed by some `LootContextParamSets` entry.

### Using Enchantment Effect Components
Here is a full example using vanilla helper methods to adjust a custom `float` value based on one or more `List<ConditionalEffect<EnchantmentValueComponent>>`s that may or may not be present on an item.

First, invoke one of the overloads of `EnchantmentHelper#runIterationOnItem`. This function accepts an `EnchantmentHelper.EnchantmentVisitor`, which is a functional interface that accepts an enchantment and its level, and is invoked on all of the enchantments that the given itemstack has. While any consumer of those two values will work, the `Enchantment` class provides a handy function that fits this interface (and is used often by vanilla) -- `Enchantment#applyEffects`. This method is used as above to test the conditions of the `ConditionalEffect`s.

To actually perform the adjustment, use `EnchantmentValueEffect#process`, as mentioned in the Enchantment Value Effect Components section.

Each time that a relevant `EnchantmentValueComponent` has its condition met, the value is adjusted again, which allows modifiers to stack -- both additive and multiplicative.

```java
MutableFloat mutableValue = new MutableFloat(unmodifiedValue);
EnchantmentHelper.runIterationOnItem(itemStack, (enchantmentHolder, enchantLevel) -> Enchantment.applyEffects(
    enchantmentHolder.value().getEffects(MY_ENCHANTMENT_COMPONENT_TYPE_HOLDER.value()),
    // Isolates the List<ConditionalEffect<EnchantmentValueEffect>> from the provided holder.

    Enchantment.damageContext(server, enchantLevel, target, damageSource), 
    // Produces a LootContext. 
    // Other contexts from the Enchantment class include itemContext, locationContext, entityContext, and blockHitContext.

    (valueEffect) -> mutableValue.setValue(valueEffect.process(enchantLevel, server.random, mutableValue.getValue()))
    // Runs for each successful <ConditionalEffect<T>>.
    // `valueEffect` is an EnchantmentValueEffect instance.
    // This line actually performs the value adjustment.
));

// Use mutableValue somewhere.
```

Here is a full example of 

## Enchantment Data Generating
Enchantment JSON files can be created automatically using the [data generation] system by passing a `RegistrySetBuilder` into `DatapackBuiltInEntriesProvider`. The JSON will be placed in `<project root>/src/generated/data/<modid>/enchantment/<path>.json`.

For more information on how RegistrySetBuilder and DatapackBuiltinEntriesProvider work, please see the article on [Data Generation for Datapack Registries]. 

<Tabs>
  <TabItem value="datagen" label="Datagen">

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
</TabItem>

  <TabItem value="json" label="JSON" default>

```json5
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
</TabItem>
</Tabs>

[Data Components]: /docs/items/datacomponents
[Codec]: /docs/datastorage/codecs
[Enchantment definition Minecraft wiki page]: https://minecraft.wiki/w/Enchantment_definition
[registered]: /docs/concepts/registries
[Predicate]: https://minecraft.wiki/w/Predicate
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