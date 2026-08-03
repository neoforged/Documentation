---
description: How to work with fluids in recipe contexts.
sidebar_position: 3
---
# Fluids in Recipes

In many situations, it is desirable for mods to use [fluids][fluid] in recipes. For this use case, NeoForge provides the `FluidStack` and `FluidIngredient` systems. These systems were designed to closely mirror [`ItemStack`s][itemstack] and [`Ingredient`s][ingredient], respectively, so that if you have worked with them before, most concepts shown on this page should be familiar.

## `FluidStack`

Like an `ItemStack`, a `FluidStack` consists of three major components:

- The `Fluid` it represents.
    - While both source and flowing fluids can be used, you should generally only use source (non-flowing) fluids, in order to avoid confusing players.
- The amount.
- The [data components][datacomponents] map.

The way all of them work is generally equivalent to `ItemStack`s. The `Fluid` is the equivalent of what would be the `Item` in the `ItemStack`, and the amount is the equivalent of the count in an `ItemStack`.

:::warning
Unlike with `ItemStack`s, the amount is **required** to be set in `FluidStack`s. The unit of fluids is millibuckets (mB), one bucket (B) consists of 1000 mB; this value is available as a constant at `FluidType.BUCKET_VOLUME`.
:::

Furthermore, similar to `ItemStack`s:

- `FluidStack`s are created by calling `new FluidStack(fluid, amount)` or `new FluidStack(fluid, amount, dataComponents)`.
- `FluidStack`s are mutable.
- `FluidStack#copy()` and `#copyWithAmount()` are available.
- `FluidStack.EMPTY` should be used where an empty or null value is needed.
- `FluidStackTemplate`s are available and used analogously to [`ItemStackTemplate`s][itemstacktemplate] during [datagen][datagen].
- `FluidStackTemplate`s have a JSON representation:

```json5
{
    // The fluid ID. Required.
    "id": "minecraft:water",
    // The fluid stack amount. 1000 is one bucket.
    "amount": 1000,
    // A map of data components. Optional, defaults to an empty map.
    "components": {
        "minecraft:enchantment_glint_override": true
    }
}
```

## `FluidIngredient`

`FluidIngredient`s are to `Fluid`s and `FluidStack`s what `Ingredient`s are to `Item`s and `ItemStack`s. Analogously, they implement `Predicate<FluidStack>`, and `#test(FluidStack)` can be called to check whether a particular `FluidStack` matches the `FluidIngredient`.

Like with item `Ingredient`s, to create a simple `FluidIngredient`, call an overload of `FluidIngredient#of()`:

- `FluidIngredient.of()` returns an empty fluid ingredient.
- `FluidIngredient.of(Fluids.WATER, Fluids.LAVA)` returns a fluid ingredient that accepts water or lava. The parameter is a vararg (`Fluid...`), meaning any amount of `Fluid`s may be supplied.
- `FluidIngredient.of(Stream.of(Fluids.WATER))` works the same as the previous method, except that it accepts a `Stream<Fluid>` instead of a `Fluid...`.
- `FluidIngredient.of(new FluidStack(Fluids.WATER), new FluidStack(Fluids.LAVA))` is the same as the `Fluid...` variant, but with a `FluidStack...` instead. This is provided as a convenience method that extracts the `Fluid` from the `FluidStack`. If you also want to match data components, use `DataComponentFluidIngredient` instead (see below).
- `FluidIngredient.of(BuiltInRegistries.FLUID.getOrThrow(Tags.Fluids.WATER))` returns an ingredient that accepts any fluid from the specified [tag].

And again like with item `Ingredient`s, there's a few specialized implementations:

- `CustomDisplayFluidIngredient.of(FluidIngredient.of(Fluids.WATER), SlotDisplay.Empty.INSTANCE)` returns an ingredient with a custom [`SlotDisplay`][slotdisplay] you provide to determine how the slot gets consumed for rendering on the client.
- `CompoundFluidIngredient.of(FluidIngredient.of(Fluids.WATER))` returns an ingredient with child ingredients, passed in the constructor (vararg parameter). The ingredient matches if any of its children matches.
- `DataComponentFluidIngredient.of(true, new FluidStack(Fluids.WATER))` returns an ingredient that, in addition to the fluid, also matches the data component. The boolean parameter denotes strict matching (true) or partial matching (false). Strict matching means the data components must match exactly, while partial matching means the data components must match, but other data components may also be present. Additional overloads of `#of` exist that allow specifying multiple `Fluid`s, or provide other options.
- `DifferenceFluidIngredient.of(FluidIngredient.of(BuiltInRegistries.FLUID.getOrThrow(Tags.Fluids.WATER)), FluidIngredient.of(BuiltInRegistries.FLUID.getOrThrow(Tags.Fluids.LAVA)))` returns an ingredient that matches everything in the first ingredient that doesn't also match the second ingredient.
- `IntersectionFluidIngredient.of(FluidIngredient.of(BuiltInRegistries.FLUID.getOrThrow(Tags.Fluids.WATER)), FluidIngredient.of(BuiltInRegistries.FLUID.getOrThrow(Tags.Fluids.LAVA)))` returns an ingredient that matches everything that matches both sub-ingredients.

### Custom Fluid Ingredients

Modders can add their own fluid ingredient types by subclassing `FluidIngredient`. To mirror [the example on the Ingredients page][customingredients], let's add a fluid ingredient type that only passes if the `FluidStack` is in the given tag and has the provided enchantments:

```java
public class MinEnchantedFluidIngredient extends FluidIngredient {
    private final TagKey<Fluid> tag;
    private final Map<Holder<Enchantment>, Integer> enchantments;
    // The codec for serializing the ingredient.
    public static final MapCodec<MinEnchantedFluidIngredient> CODEC = RecordCodecBuilder.mapCodec(inst -> inst.group(
        TagKey.codec(Registries.FLUID).fieldOf("tag").forGetter(e -> e.tag),
        Codec.unboundedMap(Enchantment.CODEC, Codec.INT)
            .optionalFieldOf("enchantments", Map.of())
            .forGetter(e -> e.enchantments)
    ).apply(inst, MinEnchantedFluidIngredient::new));
    // Create a stream codec for the ingredient. For our use case, creating one from the regular codec will suffice.
    public static final StreamCodec<RegistryFriendlyByteBuf, MinEnchantedFluidIngredient> STREAM_CODEC =
        ByteBufCodecs.fromCodecWithRegistries(CODEC.codec());

    // Constructor that initializes the fields. You may also use a #of() pattern or similar instead.
    public MinEnchantedFluidIngredient(TagKey<Fluid> tag, Map<Holder<Enchantment>, Integer> enchantments) {
        this.tag = tag;
        this.enchantments = enchantments;
    }

    // Check if the passed FluidStack matches our requirements.
    @Override
    public boolean test(FluidStack stack) {
        return stack.is(tag) && enchantments.keySet()
                .stream()
                .allMatch(ench -> stack.getOrDefault(DataComponents.ENCHANTMENTS, ItemEnchantments.EMPTY)
                        .getLevel(ench) >= enchantments.get(ench));
    }

    // Determines whether this fluid ingredient performs data component matching (false) or not (true).
    // Also determines whether a stream codec is used for syncing, more on this later.
    // We query enchantments on the stack, therefore our ingredient is not simple.
    @Override
    public boolean isSimple() {
        return false;
    }

    // Returns a stream of fluids that match this ingredient. Mostly for display purposes.
    // See the Ingredient docs for things to consider here, they apply 1:1.
    @Override
    protected Stream<Holder<Fluid>> generateFluids() {
        return BuiltInRegistries.FLUID.getOrThrow(tag).stream();
    }

    // FluidIngredient requires implementations of hashCode() and equals().
    @Override
    public int hashCode() {
        return Objects.hash(tag, enchantments);
    }

    @Override
    public boolean equals(Object o) {
        if (o == this) return true;
        if (!(o instanceof MinEnchantedFluidIngredient that)) return false;
        return Objects.equals(this.tag, that.tag)
            && Objects.equals(this.enchantments, that.enchantments);
    }
}
```

We then register a `FluidIngredientType` like so:

```java
public static final DeferredRegister<FluidIngredientType<?>> FLUID_INGREDIENT_TYPES =
        DeferredRegister.create(NeoForgeRegistries.Keys.FLUID_INGREDIENT_TYPE, ExampleMod.MOD_ID);

public static final Supplier<FluidIngredientType<MinEnchantedFluidIngredient>> MIN_ENCHANTED =
        FLUID_INGREDIENT_TYPES.register("min_enchanted",
                // The stream codec parameter is optional, a stream codec will be created from the codec
                // using ByteBufCodecs#fromCodec or #fromCodecWithRegistries if the stream codec isn't specified.
                () -> new FluidIngredientType<>(
                    MinEnchantedFluidIngredient.CODEC,
                    MinEnchantedFluidIngredient.STREAM_CODEC));
```

Finally, we also need to override `#getType` in our ingredient class:

```java
public class MinEnchantedFluidIngredient extends FluidIngredient {
    // other stuff here

    @Override    
    public FluidIngredientType<?> getType() {
        return MIN_ENCHANTED.get();
    }
}
```

### JSON Representation

Like everything else about `FluidIngredient`s, their representation in JSON also mirrors item `Ingredient`s. To use our own ingredient as an example:

```json5
{
    "neoforge:fluid_ingredient_type": "examplemod:min_enchanted",
    "tag": "c:water",
    "enchantments": {
        "minecraft:sharpness": 4
    }
}
```

The "regular" fluid ingredients mirror vanilla as well by not specifying a `type` at all and instead being serialized as a string:

```
"minecraft:water" // fluid
"#c:water"        // fluid tag
```

These "regular" fluid ingredients are represented in code as `SimpleFluidIngredient`s.

[customingredients]: ../resources/server/recipes/ingredients.md#custom-ingredient-types
[datacomponents]: ../items/datacomponents.md
[datagen]: ../resources/index.md#data-generation
[fluid]: index.md
[ingredient]: ../resources/server/recipes/ingredients.md
[itemstack]: ../items/index.md#itemstacks
[itemstacktemplate]: ../items/index.md#itemstacktemplates
[tag]: ../resources/server/tags.md
[slotdisplay]: ../resources/server/recipes/custom.md#slot-displays
