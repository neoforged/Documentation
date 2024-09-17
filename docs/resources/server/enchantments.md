# Enchantments

Enchantments are enchancements that can be applied to tools and other items. As of 1.21, enchantments are stored on items as [Data Components], are defined in JSON, and are comprised of Enchantment Components.

A new enchantment can be added by creating a JSON file in your namespace's `enchantment` datapack subfolder. For example, to create an enchantment called `examplemod:example_enchant`, one could create the file `data/examplemod/enchantment/example_enchantment.json`. Enchantments added this way are automatically registered into the game as part of the data pack loading process.

The JSON format for Enchantments is summarized on the [Enchantment definition Minecraft wiki page].

## Enchantment Components
Enchantment Components are specially-registered [Data Components] that determine what an enchantment does. Enchantment Component Types must be [registered] to `BuiltInRegistries.ENCHANTMENT_EFFECT_COMPONENT_TYPE`.
:::note
There are many already existing Enchantment Component Types in vanilla that can be used to create enchantment logic.
:::

For simple enchantments that act as a marker for custom logic, `DataComponentType<Unit>` may be sufficient. Such a component type could be registered, for example, using a DeferredRegister:
```java
// In some registration class
public static final DeferredRegister<DataComponentType<?>> ENCHANTMENT_COMPONENT_TYPES = DeferredRegister.create(BuiltInRegistries.ENCHANTMENT_EFFECT_COMPONENT_TYPE, "examplemod");

public static final DeferredHolder<DataComponentType<?>, DataComponentType<Unit>> EXAMPLE =
    ENCHANTMENT_COMPONENT_TYPES.register("example",
        () -> DataComponentType.<Unit>builder()
            .persistent(Unit.CODEC)
            .build());
```

### Testing For Enchantment Components
To check if an enchantment component is present on a given item stack, one must first get the item's `minecraft:enchantment` component. The value of this component is an `ItemEnchantments` instance containing a set of all the Enchantments on the item, which can be acquired using `ItemEnchantments#keySet()`. The enchantment components of a given enchantment can then be acquired using the `Enchantment::effects()` method:
```java

for(Enchantment enchant : stack.get(DataComponents.ENCHANTMENTS).keySet()){
    DataComponentMap enchantment_components = enchant.value().effects();
    if(enchantment_components.has(MY_ENCHANTMENT_COMPONENT_TYPE_HOLDER)){
            // Do something!
    }
}
```

## Specialized Enchantment Component Types
Vanilla uses a few specific classes when building its enchantment component types to achieve the customizability present in the vanilla enchantment components.

### `ConditionalEffect`
Wrapping the type in `List<ConditionalEffect<?>>` permits the use of [predicates] when defining enchantments. This allows some effects to activate situationally. Most vanilla enchantments use this.
Registering such an effect can be done as follows:
```java
public static final DeferredHolder<DataComponentType<?>, DataComponentType<List<ConditionalEffect<Unit>>>> EXAMPLE_CONDITIONAL_EFFECT =
    ENCHANTMENT_COMPONENT_TYPES.register("example_conditional",
        () -> DataComponentType.<List<ConditionalEffect<Unit>>>builder()
            .persistent(ConditionalEffect.codec(Unit.CODEC, LootContextParamSets.EMPTY).listOf())
            .build());
```
The parameters to `ConditionalEffect.codec` are the codec for the template type of the `ConditionalEffect<T>`, followed by some `LootContextParamSets` item. There are many of these to choose from, so choose carefully.

### Value Effects
[Value Effects] are used for enchantments that change some numerical value to a different degree depending on the enchantment's level, and are implemented by the class `EnchantmentValueEffect`. Enchantments like Knockback, Looting, an Sharpness use this kind of component.

A vanilla-conforming way to adjust values based on custom Value Effect components is to invoke one of the overloads of `EnchantmentHelper#runIterationOnItem` and pass in a lambda that alters a `MutableFloat` or similar mutable object based on the results:
```java
MutableFloat mutable_value = new MutableFloat(unmodified_value);
EnchantmentHelper.runIterationOnItem(item_stack, (enchantment, enchant_level) -> Enchantment.applyEffects(
    enchantment.value().getEffects(MY_ENCHANTMENT_COMPONENT_TYPE_HOLDER.value()),
    // Provide a loot context,
    (value_effect) -> mutable_value.setValue(value_effect.process(enchant_level, server.random, mutable_value.getValue()))
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
[Enchantment definition Minecraft wiki page]: https://minecraft.wiki/w/Enchantment_definition
[registered]: /docs/concepts/registries
[predicates]: https://minecraft.wiki/w/Predicate
[Value Effects]: https://minecraft.wiki/w/Enchantment_definition#Value_effects
[Entity Effects]: https://minecraft.wiki/w/Enchantment_definition#Entity_effects
[Location Based Effects]: https://minecraft.wiki/w/Enchantment_definition#Location-based_effects