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
Enchantment Effect Components are specially-registered [Data Components] that determine what an enchantment does. Enchantment Effect Component Types must be [registered] to `BuiltInRegistries.ENCHANTMENT_EFFECT_COMPONENT_TYPE`, but are otherwise identical to other Data Components. For example, one could register an Enchantment Effect Component that can store an `ExampleEffectData` object as follows:

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
Wrapping the type in `ConditionalEffect<?>` permits the use of [predicates] when defining enchantments. This allows some effects to activate situationally. Most vanilla enchantments use this.
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
[Value Effect Components] are used for enchantments that alter a numerical value somewhere in the game, and are implemented by the class `EnchantmentValueEffect`. Enchantments like Knockback, Looting, and Sharpness use this kind of component. 

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

One way to adjust values based on custom Value Effect components is to invoke one of the overloads of `EnchantmentHelper#runIterationOnItem`. This function accepts an `EnchantmentHelper.EnchantmentVisitor`, which is a functional interface that accepts an enchantment and its level, and is invoked on all of the enchantments that the given itemstack has. While any consumer of those two values will work, the `Enchantment` class provides a handy function that fits this interface (and is used often by vanilla) -- `Enchantment#applyEffects`. This function takes a `List<ConditionalEffect<EnchantmentValueEffect>>`, a `LootContext`, and a function that consumes a value effect. The function verifies that all of the `ConditionalEffect`s are satisfied given the provided `LootContext`, and if so, invokes the provided function.

To actually perform the adjustment, use `EnchantmentValueEffect#process`, which takes the enchantment level, a random value (in case the binomial_random Level Based Value was asked for), and a float, then returns the adjusted float based on the settings provided to the `EnchantmentValueEffect` instance. A convenient trick is to invoke this method inside a lambda argument to the aforementioned `Enchantment#applyEffects` method, and to have it update a `MutableFloat` with the value to allow it to escape the lambda and be put to use elsewhere.

```java
MutableFloat mutableValue = new MutableFloat(unmodified_value);
EnchantmentHelper.runIterationOnItem(itemStack, (enchantment, enchantLevel) -> Enchantment.applyEffects(
    enchantment.value().getEffects(MY_ENCHANTMENT_COMPONENT_TYPE_HOLDER.value()),
    // Provide a loot context,
    (valueEffect) -> mutableValue.setValue(valueEffect.process(enchantLevel, server.random, mutableValue.getValue()))
));
```

Custom numerical operations for use in Value Enchantment blocks can be added by registering a subclass of `EnchantmentValueEffect` through `BuiltInRegistries.ENCHANTMENT_VALUE_EFFECT_TYPE`.

### Entity Effect Components
[Entity Effect Components] are components that contain an `EnchantmentEntityEffect`, and are used to implement enchantments that directly affect an entity or the level. Enchantments like Flame, Fire Aspect, and Channeling use this kind of component. 

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

### Location Based Effects
[Location Based Effect Components] are like Entity Effect Components, but they instead contain Location Based Effects. These are used for effects that need to reference specific places in the world relative to the wielder. Frost Walker is a prime example of an enchantment implemented using a Location Based Effect Component. Entity Effects are a subclass of Location Based Effects.

Custom `EnchantmentLocationBasedEffect` extensions can be registered through `BuiltInRegistries.ENCHANTMENT_LOCATION_BASED_EFFECT_TYPE`. Overriding `EnchantmentEntityEffect#onChangedBlock` allows for the subclass to do something whenever the wielder's BlockPos changes.

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
[Value Effect Components]: https://minecraft.wiki/w/Enchantment_definition#Value_effects
[Entity Effects Components]: https://minecraft.wiki/w/Enchantment_definition#Entity_effects
[Location Based Effect Components]: https://minecraft.wiki/w/Enchantment_definition#Location-based_effects
[text component]: /docs/resources/client/i18n.md
[Level Based Value]: https://minecraft.wiki/w/Enchantment_definition#Level-based_value
[Attribute Effect Component]: https://minecraft.wiki/w/Enchantment_definition#Attribute_effects
[Attribute Operations]: https://minecraft.wiki/w/Attribute#Operations
[data generation]: /docs/resources/#data-generation
[Data Generation for Datapack Registries]: https://docs.neoforged.net/docs/concepts/registries/#data-generation-for-datapack-registries