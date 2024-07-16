# Ingredients

`Ingredient`s are used in [recipes] to check whether a given [`ItemStack`][itemstack] is a valid input for the recipe. For this purpose, `Ingredient` implements `Predicate<ItemStack>`, and `#test` can be called to confirm if a given `ItemStack` matches the ingredient.

The `Ingredient` class is final, which has several drawbacks for us. Most notably, this makes it impossible to extend `Ingredient` for custom ingredient types. NeoForge works around this by introducing the `ICustomIngredient` interface. This is not a direct replacement for regular `Ingredient`s, but we can convert to and from `Ingredient`s using `ICustomIngredient#toVanilla` and `Ingredient#getCustomIngredient`, respectively.

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

TODO

[itemlike]: ../../../items/index.md#itemlike
[itemstack]: ../../../items/index.md#itemstacks
[recipes]: index.md
[tag]: ../tags.md
