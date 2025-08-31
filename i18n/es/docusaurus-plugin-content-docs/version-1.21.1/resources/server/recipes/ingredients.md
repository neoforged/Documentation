# Ingredients

`Ingredient`s are used in [recipes] to check whether a given [`ItemStack`][itemstack] is a valid input for the recipe. For this purpose, `Ingredient` implements `Predicate<ItemStack>`, and `#test` can be called to confirm if a given `ItemStack` matches the ingredient.

Unfortunately, many internals of `Ingredient` are a mess. NeoForge works around this by ignoring the `Ingredient` class where possible, instead introducing the `ICustomIngredient` interface for custom ingredients. This is not a direct replacement for regular `Ingredient`s, but we can convert to and from `Ingredient`s using `ICustomIngredient#toVanilla` and `Ingredient#getCustomIngredient`, respectively.

## Built-In Ingredient Types

The simplest way to get an ingredient is using the `Ingredient#of` helpers. Several variants exist:

- `Ingredient.of()` returns an empty ingredient.
- `Ingredient.of(Blocks.IRON_BLOCK, Items.GOLD_BLOCK)` returns an ingredient that accepts either an iron or a gold block. The parameter is a vararg of [`ItemLike`s][itemlike], which means that any amount of both blocks and items may be used.
- `Ingredient.of(new ItemStack(Items.DIAMOND_SWORD))` returns an ingredient that accepts an item stack. Be aware that counts and data components are ignored.
- `Ingredient.of(Stream.of(new ItemStack(Items.DIAMOND_SWORD)))` returns an ingredient that accepts an item stack. Like the previous method, but with a `Stream<ItemStack>` for if you happen to get your hands on one of those.
- `Ingredient.of(ItemTags.WOODEN_SLABS)` returns an ingredient that accepts any item from the specified [tag], for example any wooden slab.

Additionally, NeoForge adds a few additional ingredients:

- `BlockTagIngredient.of(BlockTags.CONVERTABLE_TO_MUD)` returns an ingredient similar to the tag variant of `Ingredient.of()`, but with a block tag instead. This should be used for cases where you'd use an item tag, but there is only a block tag available (for example `minecraft:convertable_to_mud`).
- `CompoundIngredient.of(Ingredient.of(Items.DIRT))` returns an ingredient with child ingredients, passed in the constructor (vararg parameter). The ingredient matches if any of its children matches.
- `DataComponentIngredient.of(true, new ItemStack(Items.DIAMOND_SWORD))` returns an ingredient that, in addition to the item, also matches the data component. The boolean parameter denotes strict matching (true) or partial matching (false). Strict matching means the data components must match exactly, while partial matching means the data components must match, but other data components may also be present. Additional overloads of `#of` exist that allow specifying multiple `Item`s, or provide other options.
- `DifferenceIngredient.of(Ingredient.of(ItemTags.PLANKS), Ingredient.of(ItemTags.NON_FLAMMABLE_WOOD))` returns an ingredient that matches everything in the first ingredient that doesn't also match the second ingredient. The given example only matches planks that can burn (i.e. all planks except crimson planks, warped planks and modded nether wood planks).
- `IntersectionIngredient.of(Ingredient.of(ItemTags.PLANKS), Ingredient.of(ItemTags.NON_FLAMMABLE_WOOD))` returns an ingredient that matches everything that matches both sub-ingredients. The given example only matches planks that cannot burn (i.e. crimson planks, warped planks and modded nether wood planks).

Keep in mind that the NeoForge-provided ingredient types are `ICustomIngredient`s and must call `#toVanilla` before using them in vanilla contexts, as outlined in the beginning of this article.

## Custom Ingredient Types

It is possible for modders to add their custom ingredient types through the `ICustomIngredient` system. For the sake of example, let's make an enchanted item ingredient that accepts an item tag and a map of enchantments to min levels:

```java
public class MinEnchantedIngredient implements ICustomIngredient {
    private final TagKey<Item> tag;
    private final Map<Holder<Enchantment>, Integer> enchantments;
    // The codec for serializing the ingredient.
    public static final MapCodec<MinEnchantedIngredient> CODEC = RecordCodecBuilder.mapCodec(inst -> inst.group(
            TagKey.codec(Registries.ITEM).fieldOf("tag").forGetter(e -> e.tag),
            Codec.unboundedMap(Enchantment.CODEC, Codec.INT)
                    .optionalFieldOf("enchantments", Map.of())
                    .forGetter(e -> e.enchantments)
    ).apply(inst, MinEnchantedIngredient::new));
    // Create a stream codec from the regular codec. In some cases, it might make sense to define
    // a new stream codec from scratch.
    public static final StreamCodec<RegistryFriendlyByteBuf, MinEnchantedIngredient> STREAM_CODEC =
            ByteBufCodecs.fromCodecWithRegistries(CODEC.codec());

    // Allow passing in a pre-existing map of enchantments to levels.
    public MinEnchantedIngredient(TagKey<Item> tag, Map<Holder<Enchantment>, Integer> enchantments) {
        this.tag = tag;
        this.enchantments = enchantments;
    }

    public MinEnchantedIngredient(TagKey<Item> tag) {
        this(tag, new HashMap<>());
    }

    // Make this chainable for easy use.
    public MinEnchantedIngredient with(Holder<Enchantment> enchantment, int level) {
        enchantments.put(enchantment, level);
        return this;
    }

    // Check if the passed ItemStack matches our ingredient by verifying the item is in the tag
    // and by testing for presence of all required enchantments with at least the required level.
    @Override
    public boolean test(ItemStack stack) {
        return stack.is(tag) && enchantments.keySet()
                .stream()
                .allMatch(ench -> stack.getEnchantmentLevel(ench) >= enchantments.get(ench));
    }

    // Determines whether this ingredient performs NBT or data component matching (false) or not (true).
    // Also determines whether a stream codec is used for syncing, more on this later.
    // We query enchantments on the stack, therefore our ingredient is not simple.
    @Override
    public boolean isSimple() {
        return false;
    }

    // Returns a stream of items that match this ingredient. Mostly for display purposes.
    // There's a few good practices to follow here:
    // - Always include at least one item stack, to prevent accidental recognition as empty.
    // - Include each accepted Item at least once.
    // - If #isSimple is true, this should be exact and contain every item stack that matches.
    //   If not, this should be as exact as possible, but doesn't need to be super accurate.
    // In our case, we use all items in the tag, each with the required enchantments.
    @Override
    public Stream<ItemStack> getItems() {
        // Get a list of item stacks, one stack per item in the tag.
        List<ItemStack> stacks = BuiltInRegistries.ITEM
                .getOrCreateTag(tag)
                .stream()
                .map(ItemStack::new)
                .toList();
        // Enchant all stacks with all enchantments.
        for (ItemStack stack : stacks) {
            enchantments
                    .keySet()
                    .forEach(ench -> stack.enchant(ench, enchantments.get(ench)));
        }
        // Return stream variant of the list.
        return stacks.stream();
    }
}
```

Custom ingredients are a [registry], so we must register our ingredient. We do so using the `IngredientType` class provided by NeoForge, which is basically a wrapper around a [`MapCodec`][codec] and optionally a [`StreamCodec`][streamcodec].

```java
public static final DeferredRegister<IngredientType<?>> INGREDIENT_TYPES =
        DeferredRegister.create(NeoForgeRegistries.Keys.INGREDIENT_TYPE, ExampleMod.MOD_ID);

public static final Supplier<IngredientType<MinEnchantedIngredient>> MIN_ENCHANTED =
        INGREDIENT_TYPES.register("min_enchanted",
                // The stream codec parameter is optional, a stream codec will be created from the codec
                // using ByteBufCodecs#fromCodec or #fromCodecWithRegistries if the stream codec isn't specified.
                () -> new IngredientType<>(MinEnchantedIngredient.CODEC, MinEnchantedIngredient.STREAM_CODEC));
```

When we have done that, we also need to override `#getType` in our ingredient class:

```java
public class MinEnchantedIngredient implements ICustomIngredient {
    // other stuff here

    @Override    
    public IngredientType<?> getType() {
        return MIN_ENCHANTED;
    }
}
```

And there we go! Our ingredient type is ready to use.

## JSON Representation

Due to vanilla ingredients being pretty limited and NeoForge introducing a whole new registry for them, it's also worth looking at what the built-in and our own ingredients look like in JSON.

Ingredients that specify a `type` are generally assumed to be non-vanilla. For example:

```json5
{
    "type": "neoforge:block_tag",
    "tag": "minecraft:convertable_to_mud"
}
```

Or another example using our own ingredient:

```json5
{
    "type": "examplemod:min_enchanted",
    "tag": "c:swords",
    "enchantments": {
        "minecraft:sharpness": 4
    }
}
```

If the `type` is unspecified, then we have a vanilla ingredient. Vanilla ingredients can specify one of two properties: `item` or `tag`.

An example for a vanilla item ingredient:

```json5
{
    "item": "minecraft:dirt"
}
```

An example for a vanilla tag ingredient:

```json5
{
    "tag": "c:ingots"
}
```

[codec]: ../../../datastorage/codecs.md
[itemlike]: ../../../items/index.md#itemlike
[itemstack]: ../../../items/index.md#itemstacks
[recipes]: index.md
[registry]: ../../../concepts/registries.md
[streamcodec]: ../../../networking/streamcodecs.md
[tag]: ../tags.md
