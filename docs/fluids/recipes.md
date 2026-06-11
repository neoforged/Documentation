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

TODO

[datacomponents]: ../items/datacomponents.md
[datagen]: ../resources/index.md#data-generation
[fluid]: index.md
[ingredient]: ../resources/server/recipes/ingredients.md
[itemstack]: ../items/index.md#itemstacks
[itemstacktemplate]: ../items/index.md#itemstacktemplates
