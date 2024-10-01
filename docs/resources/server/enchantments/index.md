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

Vanilla defines various [built-in enchantment effect components], which are used to implement all vanilla enchantments.

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

### `ConditionalEffect`
Wrapping the type in `ConditionalEffect<?>` allows the Enchantment Effect Component to take effect based on conditions informed by a `LootContext`. 

Specifically, each `ConditionalEffect` contains another effect component, along with an `Optional<LootItemCondition>`. Since `LootItemContext` is a `Predicate<LootContext>`, it can be tested against a specified `LootContext` using `LootItemContext#test`.

`ConditionalEffect` wraps this behavior, allowing one to simply call `ConditionalEffect#matches(LootContext context)` to determine if the effect should be allowed to run.

Vanilla adds an additional helper method to further streamline the process of checking these conditions: `Enchantment#applyEffects()`. This method takes a `List<ConditionalEffect<T>>`, evaluates the conditions, and runs a `Consumer<T>` on each `T` contained by a `ConditionalEffect` whose condition was met. Since many of Vanilla Enchantment Effect Components are defined as `List<ConditionalEffect<?>>`, these can be directly plugged into the helper method like so:
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
public static final DeferredHolder<DataComponentType<?>, DataComponentType<ConditionalEffect<ExampleData>>> EXAMPLE_CONDITIONAL_EFFECT =
    ENCHANTMENT_COMPONENT_TYPES.register("example_conditional",
        () -> DataComponentType.ConditionalEffect<ExampleData>>builder()
            .persistent(ConditionalEffect.codec(Unit.CODEC, LootContextParamSets.EMPTY))
            .build());
```
The parameters to `ConditionalEffect.codec` are the codec for the generic `ConditionalEffect<T>`, followed by some `LootContextParamSets` entry.

### Using Enchantment Effect Components
Here is a full example using vanilla helper methods to work with a custom Enchantment Effect Component.

<Tabs>
  <TabItem value="useexample" label="Example">

```java
// Define an example data-bearing record.
public record Increment(int value){
    public static final Codec<BoundEntity> CODEC = RecordCodecBuilder.create((instance) ->
            instance.group(
                    Codec.INT.fieldOf("value").forGetter(Increment::value),
            ).apply(instance, Increment::new)
    );

    public int add(int x){
        return value() + x;
    }
}
```

```java
// Register an Enchantment Effect Component to carry this record.
public static final DeferredHolder<DataComponentType<?>, DataComponentType<ConditionalEffect<Increment>>> INCREMENT =
    ENCHANTMENT_COMPONENT_TYPES.register("increment",
        () -> DataComponentType.ConditionalEffect<Increment>>builder()
            .persistent(ConditionalEffect.codec(Increment.CODEC, LootContextParamSets.EMPTY))
            .build());
```

```java
// Somewhere in game logic where an `itemStack` is available.
// `unmodifiedValue` is an integer.
MutableInt mutableValue = new MutableInt(unmodifiedValue);
EnchantmentHelper.runIterationOnItem(itemStack, (enchantmentHolder, enchantLevel) -> Enchantment.applyEffects(
    enchantmentHolder.value().getEffects(INCREMENT.value()),
    // Isolates the ConditionalEffect<Increment> from the provided holder and wraps it in a list for applyEffects.

    Enchantment.damageContext(server, enchantLevel, target, damageSource), 
    // Produces a LootContext. 
    // Other contexts from the Enchantment class include itemContext, locationContext, entityContext, and blockHitContext.

    (exampleData) -> mutableValue.setValue(exampleData.add(mutableValue.getValue()))
    // Runs for each successful <ConditionalEffect<T>>.
    // `exampleData` is an Increment instance.
    // This line actually performs the value adjustment.
    // Each time it runs, mutableValue is set to (exampleData's value) + mutableValue + enchantLevel.
));

// Use mutableValue elsewhere in your game logic.
```
</TabItem>

<TabItem value="explainer" label="Explanation">
Consider an Enchantment Effect Component called `INCREMENT`, defined as `List<ConditionalEffect<Increment>>`. Let the `Increment` object it contains be a wrapper around an integer that defined a method `add(int x)`, which adds its internal value to the provided integer and returns the result. Imagine that you want to use this object to increase the count of another integer value within your item's `use` method -- say, to increase the number of times it performs some repeated effect.

First, invoke one of the overloads of `EnchantmentHelper#runIterationOnItem`. This function accepts an `EnchantmentHelper.EnchantmentVisitor`, which is a functional interface that accepts an enchantment and its level, and is invoked on all of the enchantments that the given itemstack has. While any consumer of those two values will work, the `Enchantment` class provides a handy function that fits this interface (and is used often by vanilla) -- `Enchantment#applyEffects`. This method is used as above to test the conditions of the `ConditionalEffect`s.

To actually perform the adjustment, use the provided `Increment#add` method.

Note that in this example, the level of the enchantment does not affect the outcome. This can be changed by using `enchantLevel` somewhere in the `Consumer<T>` lambda expression (the last line with code in the example). Any other information stored in the `ItemStack` can also be accessed from here, so other Data Components could be used to inform how the adjustment goes.
</TabItem>
</Tabs>

## Enchantment Data Generation
Enchantment JSON files can be created automatically using the [data generation] system by passing a `RegistrySetBuilder` into `DatapackBuiltInEntriesProvider`. The JSON will be placed in `<project root>/src/generated/data/<modid>/enchantment/<path>.json`.

For more information on how `RegistrySetBuilder` and `DatapackBuiltinEntriesProvider` work, please see the article on [Data Generation for Datapack Registries]. 

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
[Attribute Operations]: https://minecraft.wiki/w/Attribute#Operations
[data generation]: /docs/resources/#data-generation
[Data Generation for Datapack Registries]: https://docs.neoforged.net/docs/concepts/registries/#data-generation-for-datapack-registries
[luck]: https://minecraft.wiki/w/Luck
[datapack function]: https://minecraft.wiki/w/Function_(Java_Edition)
[relevant minecraft wiki page]: https://minecraft.wiki/w/Enchantment_definition#Entity_effects
[built-in enchantment effect components]: builtin.md