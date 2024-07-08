# Recipes

Recipes are a way to transform a set of objects into other objects within a Minecraft world. Although Minecraft uses this system purely for item transformations, the system is built in a way that allows any kind of objects - blocks, entities, etc. - to be transformed. Almost all recipes use recipe data files; a "recipe" is assumed to be a data-driven recipe in this article unless explicitly stated otherwise.

Recipe data files are located at `data/<namespace>/recipes/<path>.json`. For example, the recipe `minecraft:diamond_block` is located at `data/minecraft/recipes/diamond_block.json`.

## Terminology

- A **recipe JSON**, or **recipe file**, is a JSON file that is loaded and stored by the `RecipeManager`. It contains info such as the recipe type, the inputs and outputs, as well as additional information (e.g. processing time).
- A **`Recipe`** holds in-code representations of all JSON fields, alongside the matching logic ("Does this input match the recipe?") and some other properties.
- A **`RecipeInput`** is a type that provides inputs to a recipe. Comes in several subclasses, e.g. `CraftingInput` or `SingleRecipeInput` (for furnaces and similar).
- A **recipe ingredient**, or just **ingredient**, is a single input for a recipe (whereas the `RecipeInput` generally represents a collection of multiple ingredients). Ingredients are a very powerful system and as such outlined [in their own article][ingredients].
- The **`RecipeManager`** is a singleton field on the server that holds all loaded recipes.
- A recipe's **`RecipeType`** is the registered recipe type.
- **Recipe serializers** were separate serializers for recipes. One recipe type could have multiple recipe serializers (e.g. the `minecraft:crafting` type had `minecraft:crafting_shapeless` and `minecraft:crafting_shapeless` serializers, plus the special serializers). These have been replaced by **recipe [codecs][codec]** (`Codec<Recipe<?>>`), but the old name is still used sometimes.
- A **recipe [advancement]** is an advancement responsible for unlocking a recipe in the recipe book. They are not required, and generally neglected by players in favor of recipe viewer mods, however the [recipe data provider][recipeprovider] generates them for you, so it's recommended to just roll with it.

## JSON Specification

The contents of recipe files vary greatly depending on the selected type. Common to all recipe files are the following two properties:

```json5
{
  // The recipe type. This maps to an entry in the recipe serializer registry.
  "type": "minecraft:crafting_shaped",
  // A list of data load conditions. Optional, NeoForge-added. See the Conditions article for more information.
  "neoforge:conditions": [ /*...*/ ]
}
```

A full list of types provided by Minecraft can be found in the [Built-In Recipe Types article][builtin]. Mods can also [define their own recipe types][customrecipes].

## Using Recipes

Recipes are loaded, stored and obtained via the `RecipeManager` class, which is in turn obtained via `ServerLevel#getRecipeManager` or - if you don't have a `ServerLevel` available - `ServerLifecycleHooks.getCurrentServer()#getRecipeManager`. Be aware that all recipe code can only run on the server, as the client generally doesn't know about recipes.

The easiest way to get a recipe is by ID:

```java
RecipeManager recipes = serverLevel.getRecipeManager();
// RecipeHolder<?> is a record of the recipe id and the recipe itself.
Optional<RecipeHolder<?>> optional = recipes.byId(ResourceLocation.withDefaultNamespace("diamond_block"));
optional.map(RecipeHolder::value).ifPresent(recipe -> {
        // Do whatever you want to do with the recipe here. Be aware that the recipe may be of any type.
});
```

A more practically applicable method is constructing a `RecipeInput` and trying to get a matching recipe. In this example, we will be creating a `CraftingInput` containing one diamond block using `CraftingInput#of`. This will create a shapeless input, a shaped input would instead use `CraftingInput#ofPositioned`, and other inputs would use other `RecipeInput`s (for example, furnace recipes will generally use `new SingleRecipeInput`).

```java
RecipeManager recipes = serverLevel.getRecipeManager();
// Construct a RecipeInput, as required by the recipe. For example, construct a CraftingInput for a crafting recipe.
// The parameters are width, height and items, respectively.
CraftingInput input = CraftingInput.of(1, 1, List.of(Items.DIAMOND_BLOCK));
// The generic wildcard on the recipe holder should then extend Recipe<CraftingInput>.
// This allows for more type safety later on.
Optional<RecipeHolder<? extends Recipe<CraftingInput>>> optional = recipes.getRecipeFor(
        // The recipe type to get the recipe for. In our case, we use the crafting type.
        RecipeTypes.CRAFTING,
        // Our recipe input.
        input,
        // Our level context.
        serverLevel
);
// This should yield the diamond block -> 9 diamonds recipe (unless a datapack changes that recipe).
optional.map(RecipeHolder::value).ifPresent(recipe -> {
        // Do whatever you want here. Note that the recipe is now a Recipe<CraftingInput> instead of a Recipe<?>.
});
```

Alternatively, you can also get yourself a potentially empty list of recipes that match your input, this is especially useful for cases where it can be reasonably assumed that multiple recipes match:

```java
RecipeManager recipes = serverLevel.getRecipeManager();
CraftingInput input = CraftingInput.of(1, 1, List.of(Items.DIAMOND_BLOCK));
// These are not Optionals, and can be used directly. However, the list may be empty, indicating no matching recipes.
List<RecipeHolder<? extends Recipe<CraftingInput>>> list = recipes.getRecipesFor(
        // Same parameters as above.
        RecipeTypes.CRAFTING, input, serverLevel
);
```

Once we have our correct recipe inputs, we also want to get the recipe outputs. This is done by calling `Recipe#assemble`:

```java
RecipeManager recipes = serverLevel.getRecipeManager();
CraftingInput input = CraftingInput.of(...);
Optional<RecipeHolder<? extends Recipe<CraftingInput>>> optional = recipes.getRecipeFor(...);
// Use ItemStack.EMPTY as a fallback.
ItemStack result = optional
        .map(RecipeHolder::value)
        .map(e -> e.assemble(input, serverLevel.registryAccess()))
        .orElse(ItemStack.EMPTY);
```

If necessary, it is also possible to iterate over all recipes of a type. This is done like so:

```java
RecipeManager recipes = serverLevel.getRecipeManager();
// Like before, pass the desired recipe type.
List<RecipeHolder<?>> list = recipes.getAllRecipesFor(RecipeTypes.CRAFTING);
```

## Other Recipe Mechanisms

Some mechanisms in vanilla are generally considered recipes, but are implemented differently in code. This is generally either due to legacy reasons, or because the "recipes" are constructed from other data (e.g. [tags]).

:::warning
Recipe viewer mods will generally not pick up these recipes. Support for these mods must be added manually, please see the corresponding mod's documentation for more information.
:::

### Anvil Recipes

Anvils have two input slots and one output slot. The only vanilla use case is tool repairing and combining, and thus no recipe files are provided. However, the system can be built upon using `AnvilUpdateEvent`. This [event] allows getting the input (left input slot) and material (right input slot) and allows setting an output item stack, as well as the experience cost and the number of materials to consume. The process can also be prevented as a whole by [canceling][cancel] the event.

```java
// This example allows repairing a stone pickaxe with a full stack of dirt, consuming half the stack, for 3 levels.
@SubscribeEvent
public static void onAnvilUpdate(AnvilUpdateEvent event) {
    ItemStack left = event.getLeft();
    ItemStack right = event.getRight();
    if (left.is(Items.STONE_PICKAXE) && right.is(Items.DIRT) && right.getCount() >= 64) {
        event.setOutput(Items.STONE_PICKAXE);
        event.setMaterialCost(32);
        event.setCost(3);
    }
}
```

### Brewing

See [the Brewing chapter in the Mob Effects & Potions article][brewing].

## Custom Recipes

TODO

Every recipe definition is made up of three components: the `Recipe` implementation which holds the data and handles the execution logic with the provided inputs, the `RecipeType` which represents the category or context the recipe will be used in, and the `RecipeSerializer` which handles decoding and network communication of the recipe data. How one chooses to use the recipe is up to the implementor.

### Recipe

TODO

The `Recipe` interface describes the recipe data and the execution logic. This includes matching the inputs and providing the associated result. As the recipe subsystem performs item transformations by default, the inputs are supplied through a `Container` subtype.

:::caution
The `Container`s passed into the recipe should be treated as if its contents were immutable. Any mutable operations should be performed on a copy of the input through `ItemStack#copy`.
:::

To be able to obtain a recipe instance from the manager, `#matches` must return true. This method checks against the provided container to see whether the associated inputs are valid. `Ingredient`s can be used for validation by calling `Ingredient#test`.

If the recipe has been chosen, it is then built using `#assemble` which may use data from the inputs to create the result.

:::tip
`#assemble` should always produce a unique `ItemStack`. If unsure whether `#assemble` does so, call `ItemStack#copy` on the result before returning.
:::

Most of the other methods are purely for integration with the recipe book.

```java
public record ExampleRecipe(Ingredient input, int data, ItemStack output) implements Recipe<Container> {
    // Implement methods here
}
```

:::note
While a record is used in the above example, it is not required to do so in your own implementation.
:::

### RecipeType

TODO

`RecipeType` is responsible for defining the category or context the recipe will be used within. For example, if a recipe was going to be smelted in a furnace, it would have a type of `RecipeType#SMELTING`. Being blasted in a blast furnace would have a type of `RecipeType#BLASTING`.

If none of the existing types match what context the recipe will be used within, then a new `RecipeType` must be registered.

The `RecipeType` instance must then be returned by `Recipe#getType` in the new recipe subtype.

```java
// For some RegistryObject<RecipeType> EXAMPLE_TYPE
// In ExampleRecipe
@Override
public RecipeType<?> getType() {
  return EXAMPLE_TYPE.get();
}
```

### RecipeSerializer

TODO

A `RecipeSerializer` is responsible for decoding JSONs and communicating across the network for an associated `Recipe` subtype. Each recipe decoded by the serializer is saved as a unique instance within the `RecipeManager`. A `RecipeSerializer` must be registered.

Only two methods need to be implemented for a `RecipeSerializer`:

| Method         | Description                                                     |
|----------------|-----------------------------------------------------------------|
| `codec`        | A [map codec][codec] used to read and write the recipe to disk. |
| `streamCodec`  | A stream codec used to send the recipe through the network.     |

The `RecipeSerializer` instance must then be returned by `Recipe#getSerializer` in the new recipe subtype.

```java
// For some DeferredHolder<RecipeSerializer<?>, ExampleRecipeSerializer> EXAMPLE_SERIALIZER
// In ExampleRecipe
@Override
public RecipeSerializer<?> getSerializer() {
  return EXAMPLE_SERIALIZER.get();
}
```

:::tip
There are some useful codecs to make reading and writing data for recipes easier. `Ingredient`s have `#CODEC`, `#CODEC_NONEMPTY`, and `#CONTENTS_STREAM_CODEC` while `ItemStack`s can use `#STRICT_CODEC` and `#STREAM_CODEC`.
:::

### Building the JSON

TODO

Custom Recipe JSONs are stored in the same place as other recipes. The specified `type` should represent the registry name of the **recipe serializer**. Any additional data is specified by the serializer during decoding.

```json5
{
    // The custom serializer registry name
    "type": "examplemod:example_serializer",
    "input": {
        // Some ingredient input
    },
    "data": 0, // Some data wanted for the recipe
    "output": {
        // Some stack output
    }
}
```

### Non-Item Logic

TODO

If items are not used as part of the input or result of a recipe, then the normal methods provided in [`RecipeManager`][manager] will not be useful. Instead, an additional method for testing a recipe's validity and/or supplying the result should be added to the custom `Recipe` instance. From there, all the recipes for that specific `RecipeType` can be obtained via `RecipeManager#getAllRecipesFor` and then checked and/or supplied the result using the newly implemented methods.

```java
// In some Recipe subimplementation ExampleRecipe

// Checks the block at the position to see if it matches the stored data
boolean matches(Level level, BlockPos pos);

// Creates the block state to set the block at the specified position to
BlockState assemble(HolderLookup.Provider lookupProvider);

// In some manager class
public Optional<ExampleRecipe> getRecipeFor(Level level, BlockPos pos) {
  return level.getRecipeManager()
    .getAllRecipesFor(exampleRecipeType) // Gets all recipes
    .stream() // Looks through all recipes for types
    .filter(recipe -> recipe.matches(level, pos)) // Checks if the recipe inputs are valid
    .findFirst(); // Finds the first recipe whose inputs match
}
```

### Data Generation

TODO

### Extending the Crafting Grid Size

The `ShapedRecipePattern` class, responsible for holding the in-memory representation of shaped crafting recipes, has a hardcoded limit of 3x3 slots, hindering mods that want to add larger crafting tables while reusing the vanilla shaped crafting recipe type. To solve this problem, NeoForge patches in a static method called `ShapedRecipePattern#setCraftingSize(int width, int height)` that allows increasing the limit. The biggest value wins here, so for example if one mod added a 4x6 crafting table and another added a 6x5 crafting table, the resulting values would be 6x6.

:::danger
`ShapedRecipePattern#setCraftingSize` is not thread-safe. It must be wrapped in an `event#enqueueWork` call.
:::

[advancement]: ../advancements.md
[brewing]: ../../../items/mobeffects.md
[builtin]: builtin.md
[cancel]: ../../../concepts/events.md#cancellable-events
[codec]: ../../../datastorage/codecs.md
[customrecipes]: #custom-recipes
[event]: ../../../concepts/events.md
[ingredients]: ingredients.md
[manager]: #using-recipes
[recipeprovider]: datagen.md
[tags]: ../tags.md
