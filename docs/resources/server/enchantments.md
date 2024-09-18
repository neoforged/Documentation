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

### Value Effect Components
[Value Effect Components] are used for enchantments that alter a numerical value somewhere in the game, and are implemented by the class `EnchantmentValueEffect`. Enchantments like Knockback, Looting, and Sharpness use this kind of component. 

Value Effect Components can be set to use any of these operations on their given values:
- `minecraft:set`: Overwrites the value.
- `minecraft:add`: Adds the specified value to the old one.
- `minecraft:multiply`: Multiplies the specified factor by the old one.
- `minecraft:remove_binomial`: Polls a given probability using a binomial distibution. If it works, subtracts 1 from the value. Note that many values are effectively flags, being fully on at 1 and fully off at 0.
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

The object within the `value` block is a [Level Based Value], which can be used to have a Value Effect Component that changes the intensity of its effect by level. In this case, level 1 Sharpness increases damage dealt by 1, and each additional level adds another 0.5. See the wiki link for a full list of the available values.

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

### Entity Effects
[Entity Effects] are used for enchantments that cause special effects to either the wielder or (if applicable) the target of an attack when the enchanted item is used to attack another entity. Enchantments like Flame, Fire Aspect, and Channeling use this kind of component.

Custom `EnchantmentEntityEffect` extensions can be registered through `BuiltInRegistries.ENCHANTMENT_ENTITY_EFFECT_TYPE`.

### Location Based Effects
[Location Based Effects] are used for effects that need to reference specific places in the world relative to the player. Frost Walker is a prime example of a Location Based Effect, and Entity Effects are a subclass of Location Based Effects.

Custom `EnchantmentLocationBasedEffect` extensions can be registered through `BuiltInRegistries.ENCHANTMENT_LOCATION_BASED_EFFECT_TYPE`. Overriding `EnchantmentEntityEffect#onChangedBlock` allows for the subclass to do something whenever the wielder's BlockPos changes.

[Data Components]: /docs/items/datacomponents
[Codec]: /docs/datastorage/codecs
[Enchantment definition Minecraft wiki page]: https://minecraft.wiki/w/Enchantment_definition
[registered]: /docs/concepts/registries
[predicates]: https://minecraft.wiki/w/Predicate
[Value Effect Components]: https://minecraft.wiki/w/Enchantment_definition#Value_effects
[Entity Effects]: https://minecraft.wiki/w/Enchantment_definition#Entity_effects
[Location Based Effects]: https://minecraft.wiki/w/Enchantment_definition#Location-based_effects
[text component]: /docs/resources/client/i18n.md
[Level Based Value]: https://minecraft.wiki/w/Enchantment_definition#Level-based_value