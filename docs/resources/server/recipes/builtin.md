# Built-In Recipe Types

Minecraft provides a variety of recipe types and serializers out of the box for you to use. This article will explain each recipe type, as well as how to generate them.

## Crafting

Crafting recipes are typically made in crafting tables, crafters, or in modded crafting tables or machines. Their recipe type is `minecraft:crafting`.

### Shaped Crafting

Some of the most important recipes - such as the crafting table, sticks, or most tools - are created through shaped recipes. These recipes are defined by a crafting pattern or shape (hence "shaped") in which the items must be inserted. Let's have a look at what an example looks like:

```json5
{
  "type": "minecraft:crafting_shaped",
  "category": "equipment",
  "pattern": [
    "XXX",
    " # ",
    " # "
  ],
  "key": {
    "#": {
      "item": "minecraft:stick"
    },
    "X": {
      "item": "minecraft:iron_ingot"
    }
  },
  "result": {
    "count": 1,
    "id": "minecraft:iron_pickaxe"
  }
}
```

Let's digest this line for line:

- `type`: This is the id of the shaped recipe serializer, `minecraft:crafting_shaped`.
- `category`: This optional field defines the category in the crafting book.
- `key` and `pattern`: Together, these define how the items must be put into the crafting grid.
  - The pattern defines up to three lines of up to three-wide strings that define the shape. All lines must be the same length, i.e. the pattern must form a rectangular shape. Spaces can be used to denote slots that should stay empty.
  - The key associates the characters used in the pattern with [ingredients][ingredient]. In the above example, all `X`s in the pattern must be iron ingots, and all `#`s must be sticks.
- `result`: The result of the recipe. This is [an item stack's JSON representation][itemjson].
- Not shown in the example is the `group` key. This optional string property creates a group in the recipe book. Recipes in the same group will be displayed as one in the recipe book.

And then, let's have a look at how you'd generate this recipe:

```java
// We use a builder pattern, therefore no variable is created. Create a new builder by calling
// ShapedRecipeBuilder#shaped with the recipe category (found in the RecipeCategory enum)
// and a result item, a result item and count, or a result item stack.
ShapedRecipeBuilder.shaped(RecipeCategory.COMBAT, Items.IRON_PICKAXE)
        // Create the lines of your pattern. Each call to #pattern adds a new line.
        // Patterns will be validated, i.e. their shape will be checked.
        .pattern("XXX")
        .pattern(" # ")
        .pattern(" # ")
        // Create the keys for the pattern. All non-space characters used in the pattern must be defined.
        // This can either accept Ingredients, TagKey<Item>s or ItemLikes, i.e. items or blocks.
        .define('X', Items.IRON_INGOT)
        .define('#', Items.STICK)
        // Creates the recipe advancement. While not mandated by the consuming background systems,
        // the recipe builder will crash if you omit this. The first parameter is the advancement name,
        // and the second one is the condition. Normally, you want to use the has() shortcut for the condition.
        // Multiple advancement requirements can be added by calling #unlockedBy multiple times.
        .unlockedBy("has_iron_ingot", has(Items.IRON_INGOT))
        // Stores the recipe in the passed RecipeOutput, to be written to disk.
        // If you want to add conditions to the recipe, those can be set on the output.
        .save(output);
```

Additionally, you can call `#group` to set the recipe book group.

### Shapeless Crafting

Unlike shaped crafting recipes, shapeless crafting recipes do not care about the order the ingredients are passed in. As such, there is no pattern and key, instead there is just a list of ingredients:

```json5
{
  "type": "minecraft:crafting_shapeless",
  "category": "misc",
  "ingredients": [
    {
      "item": "minecraft:brown_mushroom"
    },
    {
      "item": "minecraft:red_mushroom"
    },
    {
      "item": "minecraft:bowl"
    }
  ],
  "result": {
    "count": 1,
    "id": "minecraft:mushroom_stew"
  }
}
```

Like before, let's digest this line for line:

- `type`: This is the id of the shapeless recipe serializer, `minecraft:crafting_shapeless`.
- `category`: This optional field defines the category in the crafting book.
- `ingredients`: A list of [ingredients][ingredient]. The list order is preserved in code for recipe viewing purposes, but the recipe itself accepts the ingredients in any order.
- `result`: The result of the recipe. This is [an item stack's JSON representation][itemjson].
- Not shown in the example is the `group` key. This optional string property creates a group in the recipe book. Recipes in the same group will be displayed as one in the recipe book.

And then, let's have a look at how you'd generate this recipe:

```java
// We use a builder pattern, therefore no variable is created. Create a new builder by calling
// ShapelessRecipeBuilder#shapeless with the recipe category (found in the RecipeCategory enum)
// and a result item, a result item and count, or a result item stack.
ShapelessRecipeBuilder.shapeless(RecipeCategory.COMBAT, Items.IRON_PICKAXE)
        // Add the recipe ingredients. This can either accept Ingredients, TagKey<Item>s or ItemLikes.
        // Overloads also exist that additionally accept a count, adding the same ingredient multiple times.
        .requires(Blocks.BROWN_MUSHROOM)
        .requires(Blocks.RED_MUSHROOM)
        .requires(Items.BOWL)
        // Creates the recipe advancement. While not mandated by the consuming background systems,
        // the recipe builder will crash if you omit this. The first parameter is the advancement name,
        // and the second one is the condition. Normally, you want to use the has() shortcut for the condition.
        // Multiple advancement requirements can be added by calling #unlockedBy multiple times.
        .unlockedBy("has_mushroom_stew", has(Items.MUSHROOM_STEW))
        .unlockedBy("has_bowl", has(Items.BOWL))
        .unlockedBy("has_brown_mushroom", has(Blocks.BROWN_MUSHROOM))
        .unlockedBy("has_red_mushroom", has(Blocks.RED_MUSHROOM))
        // Stores the recipe in the passed RecipeOutput, to be written to disk.
        // If you want to add conditions to the recipe, those can be set on the output.
        .save(output);
```

Additionally, you can call `#group` to set the recipe book group.

### Special Crafting

In some cases, outputs must be created dynamically from inputs. Most of the time, this is to set data components on the output by copying or calculating their values from the input stacks. These recipes usually only specify the type and hardcode everything else. For example:

```java
{
  "type": "minecraft:crafting_special_armordye"
}
```

This recipe, which is for leather armor dyeing, just specifies the type and hardcodes everything else - most notably the color calculation, which would be hard to express in JSON. Minecraft prefixes all special crafting recipes with `crafting_special_`, however this practice is not necessary to follow.

Generating this recipe looks as follows:

```java
// The parameter of #special is a Function<CraftingBookCategory, Recipe<?>>.
// All vanilla special recipes use a constructor with one CraftingBookCategory parameter for this.
SpecialRecipeBuilder.special(ArmorDyeRecipe::new)
        // This overload of #save allows us to specify a name. It can also be used on shaped or shapeless builders.
        .save(output, "armor_dye");
```

Vanilla provides the following special crafting serializers (mods may add more):

- `minecraft:crafting_special_armordye`: For dyeing leather armor and other dyeable items.
- `minecraft:crafting_special_bannerduplicate`: For duplicating banners.
- `minecraft:crafting_special_bookcloning`: For copying written books. This increases the resulting book's generation property by one.
- `minecraft:crafting_special_firework_rocket`: For crafting firework rockets.
- `minecraft:crafting_special_firework_star`: For crafting firework stars.
- `minecraft:crafting_special_firework_star_fade`: For applying a fade to a firework star.
- `minecraft:crafting_special_mapcloning`: For copying filled maps. Also works for treasure maps.
- `minecraft:crafting_special_mapextending`: For extending filled maps.
- `minecraft:crafting_special_repairitem`: For repairing two broken items into one.
- `minecraft:crafting_special_shielddecoration`: For applying a banner to a shield.
- `minecraft:crafting_special_shulkerboxcoloring`: For coloring a shulker box while preserving its contents.
- `minecraft:crafting_special_suspiciousstew`: For crafting suspicious stews depending on the input flower.
- `minecraft:crafting_special_tippedarrow`: For crafting tipped arrows depending on the input potion.
- `minecraft:crafting_decorated_pot`: For crafting decorated pots from sherds.

## Furnace-like Recipes

All recipes made in furnaces (type `minecraft:smelting`), smokers (`minecraft:smoking`), blast furnaces (`minecraft:blasting`) and campfires (`minecraft:campfire_cooking`) use the same format:

```json5
{
  "type": "minecraft:smelting",
  "category": "food",
  "cookingtime": 200,
  "experience": 0.1,
  "ingredient": {
    "item": "minecraft:kelp"
  },
  "result": {
    "id": "minecraft:dried_kelp"
  }
}
```

Let's digest this line by line:

- `type`: This is the id of the recipe serializer, `minecraft:smelting`. This may be different depending on what kind of furnace-like recipe you're making.
- `category`: This optional field defines the category in the crafting book.
- `cookingtime`: This field determines how long the recipes needs to be processed, in ticks. All vanilla furnace recipes use 200, smokers and blast furnaces use 100, and campfires use 600. However, this can be any value you want.
- `experience`: Determines the amount of experience rewarded when making this recipe. This field is optional, and no experience will be awarded if it is omitted.
- `ingredient`: The input [ingredient] of the recipe.
- `result`: The result of the recipe. This is [an item stack's JSON representation][itemjson].

Datagen for these recipes looks like this:

```java
// Use #smoking for smoking recipes, #blasting for blasting recipes, and #campfireCooking for campfire recipes.
// All of these builders work the same otherwise.
SimpleCookingRecipeBuilder.smelting(
        // Our input ingredient.
        Ingredient.of(Items.KELP),
        // Our recipe category.
        RecipeCategory.FOOD,
        // Our result item. May also be an ItemStack.
        Items.DRIED_KELP,
        // Our experience reward
        0.1f,
        // Our cooking time.
        200
)
        // The recipe advancement, like with the crafting recipes above.
        .unlockedBy("has_kelp", has(Blocks.KELP))
        // This overload of #save allows us to specify a name.
        .save(p_301191_, "dried_kelp_smelting");
```

## Stonecutting

TODO

## Smithing

TODO

[ingredient]: ingredients.md
[itemjson]: ../../../items/index.md#json-representation
