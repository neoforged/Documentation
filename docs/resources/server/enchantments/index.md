import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Enchantments

Enchantments are special effects that can be applied to tools and other items. As of 1.21, enchantments are stored on items as [Data Components], are defined in JSON, and are comprised of so-called enchantment effect components. During the game, the enchantments on a particular item are contained within the `DataComponentTypes.ENCHANTMENT` component, in an `ItemEnchantment` instance.

A new enchantment can be added by creating a JSON file in your namespace's `enchantment` datapack subfolder. For example, to create an enchantment called `examplemod:example_enchant`, one would create a file `data/examplemod/enchantment/example_enchantment.json`. 

## Enchantment JSON Format

```json5
{
  // The text component that will be used as the in-game name of the enchantment.
  // Can be a translation key or a literal string. 
  // Remember to translate this if you use a translation key!
  "description": {
    "translate": "enchantment.examplemod.enchant_name"
  },
  
  // Which items this enchantment can be applied to.
  // Can be either an item id, such as "minecraft:trident",
  // or a list of item ids, such as ["examplemod:red_sword", "examplemod:blue_sword"]
  // or an item tag, such as "#examplemod:enchantable/enchant_name".
  // Note that this doesn't cause the enchantment to appear for these items in the enchanting table.
  "supported_items": "#examplemod:enchantable/enchant_name",

  // (Optional) Which items this enchantment appears for in the enchanting table.
  // Can be an item, list of items, or item tag.
  // If left unspecified, this is the same as `supported_items`.
  "primary_items": [
    "examplemod:item_a",
    "examplemod:item_b"
  ],

  // (Optional) Which enchantments are incompatible with this one.
  // Can be an enchantment id, such as "minecraft:sharpness",
  // or a list of enchantment ids, such as ["minecraft:sharpness", "minecraft:fire_aspect"],
  // or enchantment tag, such as "#examplemod:exclusive_to_enchant_name".
  // Incompatible enchantments will not be added to the same item by vanilla mechanics.
  "exclusive_set": "#examplemod:exclusive_to_enchant_name",
  
  // The likelihood that this enchantment will appear in the Enchanting Table. 
  // Bounded by [1, 1024].
  "weight": 6,
  
  // The maximum level this enchantment is allowed to reach.
  // Bounded by [1, 255].
  "max_level": 3,
  
  // The maximum cost of this enchantment, measured in "enchanting power". 
  // This corresponds to, but is not equivalent to, the threshold in levels the player needs to meet to bestow this enchantment.
  // See below for details.
  // The actual cost will be between this and the min_cost.
  "max_cost": {
    "base": 45,
    "per_level_above_first": 9
  },
  
  // Specifies the minimum cost of this enchantment; otherwise as above.
  "min_cost": {
    "base": 2,
    "per_level_above_first": 8
  },

  // The cost that this enchantment adds to repairing an item in an anvil in levels. The cost is multiplied by enchantment level.
  // If an item has a DataComponentTypes.STORED_ENCHANTMENTS component, the cost is halved. In vanilla, this only applies to enchanted books.
  // Bounded by [1, inf).
  "anvil_cost": 2,
  
  // (Optional) A list of slot groups this enchantment provides effects in. 
  // A slot group is defined as one of the possible values of the EquipmentSlotGroup enum.
  // In vanilla, these are: `any`, `hand`, `mainhand`, `offhand`, `armor`, `feet`, `legs`, `chest`, `head`, and  `body`.
  "slots": [
    "mainhand"
  ],

  // The effects that this enchantment provides as a map of enchantment effect components (read on).
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
}
```

### Enchantment Costs

The `max_cost` and `min_cost` fields specify boundaries for how much enchanting power is needed to create this enchantment. There is a somewhat convoluted procedure to actually make use of these values, however.

First, the table takes into account the return value of `IBlockStateExtension#getEnchantPowerBonus()` for the surrounding blocks. From this, it derives a 'base cost' for each slot. This cost is shown in-game as the green numbers besides the enchantments in the menu. For each enchantment, the base cost is modified twice by a random value derived from the item's enchantability (its return value from `IItemStackExtension#getEnchantmentValue()`), like so:

`(Modified Cost) = (Base Cost) + random.nextInt(e / 4 + 1) + random.nextInt(e / 4 + 1)`, where `e` is the enchantability score.

This modified cost is adjusted up or down by a random 15%, and then is finally used to choose an enchantment. 

In practical terms, this means that the cost values in your enchantment definition might be above 30, sometimes far above. For example, with an enchantability 10 item, the table could produce enchantments up to 1.15 * (30 + 2 * (10 / 4) + 1) = 40 cost. 

## Enchantment Effect Components

Enchantment effect components are specially-registered [Data Components] that determine how an enchantment functions. The type of the component defines its effect, while the data it contains is used to inform or modify that effect. For instance, the `minecraft:damage` component modifies the damage that a weapon deals by an amount determined by its data.

Vanilla defines various [built-in enchantment effect components], which are used to implement all vanilla enchantments.

### Custom Enchantment Effect Components

Enchantment effect component types must be [registered] to `BuiltInRegistries.ENCHANTMENT_EFFECT_COMPONENT_TYPE`, which takes a `DataComponentType<?>`. For example, you could register an enchantment effect component that can store an `ExampleEffectData` object as follows:

```java
// In some registration class
public static final DeferredRegister<DataComponentType<?>> ENCHANTMENT_COMPONENT_TYPES = DeferredRegister.create(BuiltInRegistries.ENCHANTMENT_EFFECT_COMPONENT_TYPE, "examplemod");

public static final DeferredHolder<DataComponentType<?>, DataComponentType<ExampleEffectData>>> EXAMPLE =
    ENCHANTMENT_COMPONENT_TYPES.register("example",
        () -> DataComponentType.<ExampleEffectData>builder()
            .persistent(ExampleEffectData.CODEC)
            .build());
```

There are no inheritance requirements on the data held by an enchantment effect component, but it may be helpful to refer to vanilla to ensure compatibility with the vanilla helper methods.

### `ConditionalEffect`
Wrapping the type in `ConditionalEffect<?>` allows the enchantment effect component to take effect based on conditions informed by a [LootContext]. 

Specifically, each `ConditionalEffect` contains another effect component, along with an `Optional<LootItemCondition>`. Since `LootItemContext` is a `Predicate<LootContext>`, it can be tested against a specified `LootContext` using `LootItemContext#test`.

`ConditionalEffect` wraps this behavior, allowing one to simply call `ConditionalEffect#matches(LootContext context)` to determine if the effect should be allowed to run.

Vanilla adds an additional helper method to further streamline the process of checking these conditions: `Enchantment#applyEffects()`. This method takes a `List<ConditionalEffect<T>>`, evaluates the conditions, and runs a `Consumer<T>` on each `T` contained by a `ConditionalEffect` whose condition was met. Since many vanilla enchantment effect components are defined as a `List<ConditionalEffect<?>>`, these can be directly plugged into the helper method like so:

```java
// `enchant` is an Enchantment instance.
// `lootContext` is a LootContext instance.
Enchantment.applyEffects(
    enchant.getEffects(EnchantmentEffectComponents.KNOCKBACK), // Or whichever other List<ConditionalEffect<T>> you want
    lootContext,
    (effectData) -> // Use the effectData (in this example, an EnchantmentValueEffect) however you want.
);
```

Registering a custom `ConditionalEffect`-wrapped enchantment effect component type can be done as follows:

```java
public static final DeferredHolder<DataComponentType<?>, DataComponentType<ConditionalEffect<ExampleData>>> EXAMPLE_CONDITIONAL_EFFECT =
    ENCHANTMENT_COMPONENT_TYPES.register("example_conditional",
        () -> DataComponentType.ConditionalEffect<ExampleData>builder()
            .persistent(ConditionalEffect.codec(Unit.CODEC, LootContextParamSets.EMPTY))
            .build());
```
The parameters to `ConditionalEffect.codec` are the codec for the generic `ConditionalEffect<T>`, followed by some `LootContextParamSets` entry.

### Using Enchantment Effect Components

Here is a full example using vanilla helper methods to work with a custom enchantment effect component.

```java
// Define an example data-bearing record.
public record Increment(int value) {
    public static final Codec<BoundEntity> CODEC = RecordCodecBuilder.create(instance ->
            instance.group(
                    Codec.INT.fieldOf("value").forGetter(Increment::value),
            ).apply(instance, Increment::new)
    );

    public int add(int x) {
        return value() + x;
    }
}
```

```java
// Register an enchantment effect component to carry this record.
public static final DeferredHolder<DataComponentType<?>, DataComponentType<ConditionalEffect<Increment>>> INCREMENT =
    ENCHANTMENT_COMPONENT_TYPES.register("increment",
        () -> DataComponentType.<ConditionalEffect<Increment>>builder()
            .persistent(ConditionalEffect.codec(Increment.CODEC, LootContextParamSets.EMPTY))
            .build());
```

```java
// Somewhere in game logic where an `itemStack` is available.
// `unmodifiedValue` is an integer.
MutableInt mutableValue = new MutableInt(unmodifiedValue);
EnchantmentHelper.runIterationOnItem(itemStack, (enchantmentHolder, enchantLevel) -> Enchantment.applyEffects(
    // Isolates the ConditionalEffect<Increment> from the provided holder and wraps it in a list for applyEffects.
    enchantmentHolder.value().getEffects(INCREMENT.value()),

    // Produces a LootContext. Other context helpers from the Enchantment class
    // include itemContext, locationContext, entityContext, and blockHitContext.
    Enchantment.damageContext(server, enchantLevel, target, damageSource), 
    
    // Runs for each successful <ConditionalEffect<T>>.
    // `exampleData` is an Increment instance.
    // This line actually performs the value adjustment.
    // Each time it runs, mutableValue is set to (exampleData's value) + mutableValue + enchantLevel.
    exampleData -> mutableValue.setValue(exampleData.add(mutableValue.getValue()))
));

// Use mutableValue elsewhere in your game logic.
```

We define an enchantment effect component called `INCREMENT` as `List<ConditionalEffect<Increment>>`. The `Increment` object it contains is a wrapper around an integer that defines a method `add(int x)`, which adds its internal value to the provided integer and returns the result. Imagine that you want to use this object to increase the count of another integer value within your item's `use` method -- say, to increase the number of times it performs some repeated effect.

First, invoke one of the overloads of `EnchantmentHelper#runIterationOnItem`. This function accepts an `EnchantmentHelper.EnchantmentVisitor`, which is a functional interface that accepts an enchantment and its level, and is invoked on all of the enchantments that the given itemstack has (essentially a `BiConsumer<Enchantment, Integer>`). While any consumer of those two values will work, the `Enchantment` class provides a handy function that fits this interface (and is used often by vanilla) -- `Enchantment#applyEffects`. This method is used as above to test the conditions of the `ConditionalEffect`s.

To actually perform the adjustment, use the provided `Increment#add` method.

Note that in this example, the level of the enchantment does not affect the outcome. This can be changed by using `enchantLevel` somewhere in the `Consumer<T>` lambda expression (the last line with code in the example). Any other information stored in the `ItemStack` can also be accessed from here, so other Data Components could be used to inform how the adjustment goes.

## Enchantment Data Generation

Enchantment JSON files can be created automatically using the [data generation] system by passing a `RegistrySetBuilder` into `DatapackBuiltInEntriesProvider`. The JSON will be placed in `<project root>/src/generated/data/<modid>/enchantment/<path>.json`.

For more information on how `RegistrySetBuilder` and `DatapackBuiltinEntriesProvider` work, please see the article on [Data Generation for Datapack Registries]. 

<Tabs>
  <TabItem value="datagen" label="Datagen">

```java
// Define the ResourceKey for our enchantment.
static ResourceKey<Enchantment> EXAMPLE_ENCHANTMENT_KEY = ResourceKey.create(
        Registries.ENCHANTMENT,
        ResourceLocation.fromNamespaceAndPath("examplemod", "example_enchantment")
);

// Specify the enchantment definition of for our enchantment. 
static Enchantment.EnchantmentDefinition EXAMPLE_ENCHANTMENT_DEFINITION = new Enchantment.EnchantmentDefinition(
    HolderSet.direct(...), // A HolderSet of Items that the enchantment will be compatible with.
    Optional.empty(), // An Optional<HolderSet> of items that the enchantment considers "primary".
    30, // The weight of the enchantment.
    3, // The maximum number of levels.
    new Enchantment.Cost(3, 1), // The minimum cost of the enchantment. The first parameter is base cost, the second is cost per level.
    new Enchantment.Cost(4, 2), // The maximum cost of the enchantment. As above.
    2, // The anvil cost of the enchantment.
    List.of(EquipmentSlotGroup.ANY) // A list of EquipmentSlotGroups that this enchantment has effects in.
);

// This RegistrySetBuilder should be passed into a DatapackBuiltinEntriesProvider in your GatherDataEvent handler.
RegistrySetBuilder BUILDER = new RegistrySetBuilder();
BUILDER.add(
    Registries.ENCHANTMENT,
    bootstrap -> bootstrap.register(
        EXAMPLE_ENCHANTMENT_KEY,
        new Enchantment(
                Component.literal("Example Enchantment"), // The Text Component that specifies the enchantment's name.
                EXAMPLE_ENCHANTMENT_DEFINITION,
                HolderSet.empty(), // A HolderSet of incompatible other enchantments.
                DataComponentMap.builder() // A DataComponentMap of the enchantment effect components associated with this enchantment and their values.
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
[Attribute Operations]: https://minecraft.wiki/w/Attribute#Operations
[data generation]: /docs/resources/#data-generation
[Data Generation for Datapack Registries]: https://docs.neoforged.net/docs/concepts/registries/#data-generation-for-datapack-registries
[relevant minecraft wiki page]: https://minecraft.wiki/w/Enchantment_definition#Entity_effects
[built-in enchantment effect components]: builtin.md
[LootContext]: /docs/resources/server/loottables/#loot-context