# Enchantments

Enchantments are special effects that can be applied to tools and other items. As of 1.21, enchantments are stored on items as [Data Components], are defined in JSON, and are comprised of Enchantment Effect Components.

A new enchantment can be added by creating a JSON file in your namespace's `enchantment` datapack subfolder. For example, to create an enchantment called `examplemod:example_enchant`, one would create a file `data/examplemod/enchantment/example_enchantment.json`. 

The JSON format for Enchantments is summarized on the [Enchantment definition Minecraft wiki page].

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

### Testing For Enchantment Effect Components
Whether a given item stack has a specific Enchantment Effect Component can be tested for with `EnchantmentHelper#has`.

## Specialized Enchantment Effect Component Types
Vanilla uses a few specific classes when building its enchantment effect component types to achieve the customizability present in the vanilla enchantment effect components.

### Value Effects
[Value Effects] are used for enchantments that change some numerical value to a different degree depending on the enchantment's level, and are implemented by the class `EnchantmentValueEffect`. Enchantments like Knockback, Looting, an Sharpness use this kind of component.

A vanilla-conforming way to adjust values based on custom Value Effect components is to invoke one of the overloads of `EnchantmentHelper#runIterationOnItem`. This function accepts a function that runs once for each enchantment on the item stack -- in this case, using the `Enchantment#applyEffects` method  
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
[Value Effects]: https://minecraft.wiki/w/Enchantment_definition#Value_effects
[Entity Effects]: https://minecraft.wiki/w/Enchantment_definition#Entity_effects
[Location Based Effects]: https://minecraft.wiki/w/Enchantment_definition#Location-based_effects