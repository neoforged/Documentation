# Items

Along with blocks, items are a key component of Minecraft. While blocks make up the world around you, items exist within inventories.

## What Even Is an Item?

Before we get further into creating items, it is important to understand what an item actually is, and what distinguishes it from, say, a [block][block]. Let's illustrate this using an example:

- In the world, you encounter a dirt block and want to mine it. This is a **block**, because it is placed in the world. (Actually, it is not a block, but a blockstate. See the [Blockstates article][blockstates] for more detailed information.)
- Once you have mined the block, it is removed (= replaced with an air block) and the dirt drops. The dropped dirt is an item **entity**. This means that like other entities (pigs, zombies, arrows, etc.), it can inherently be moved by things like water pushing on it, or burned by fire and lava.
- Once you pick up the dirt item entity, it becomes an **item stack** in your inventory. An item stack is, simply put, an instance of an item with some extra information, such as the stack size.
- Item stacks are backed by their corresponding **item** (which is what we're creating). Items hold information that is the same across all items (for example, every iron sword has a max durability of 250), while item stacks hold information that can be different between two similar items (for example, one iron sword has 100 uses left, while another iron sword has 200 uses left).

## Creating an Item

Now that we understand what an item is, let's create one!

Like with basic blocks, for basic items that need no special functionality (think sticks, sugar, etc.), the `Item` class can be used directly. To do so, during registration, instantiate `Item` with a `Item.Properties` parameter. This `Item.Properties` parameter can be created using `Item.Properties#of`, and it can be customized by calling its methods:

- `stacksTo` - Sets the max stack size of this item. Defaults to 64. Used e.g. by ender pearls or other items that only stack to 16.
- `durability` - Sets the durability of this item. Defaults to 0, which means "no durability". For example, iron tools use 250 here. Note that setting the durability automatically locks the stack size to 1.
- `craftRemainder` - Sets the crafting remainder of this item. Vanilla uses this for filled buckets that leave behind empty buckets after crafting.
- `fireResistant` - Makes item entities that use this item immune to fire and lava. Used by various netherite items.
- `setNoRepair` - Disables anvil and crafting grid repairing for this item. Unused in vanilla.
- `rarity` - Sets the rarity of this item. Currently, this simply changes the item's color. `Rarity` is an enum consisting of the four values `COMMON` (white, default), `UNCOMMON` (yellow), `RARE` (aqua) and `EPIC` (light purple). Be aware that mods may add more rarity types.
- `requiredFeatures` - Sets the required feature flags for this item. This is mainly used for vanilla's feature locking system in minor versions. It is discouraged to use this, unless you're integrating with a system locked behind feature flags by vanilla.
- `food` - Sets the [`FoodProperties`][food] of this item.

For examples, or to look at the various values used by Minecraft, have a look at the `Items` class.

### Food

The `Item` class provides default functionality for food items, meaning you don't need a separate class for that. To make your item edible, all you need to do is set the `FoodProperties` on it through the `food` method in `Item.Properties`.

`FoodProperties` are created using a `FoodProperties.Builder`. You can then set various properties on it:

- `nutrition` - Probably the most obvious part. Sets how many hunger points are restored. Counts in half hunger points, so for example, Minecraft's steak restores 8 hunger points.
- `saturationMod` - The saturation modifier used in calculating the [saturation value][hunger] restored when eating this food. The calculation is `min(2 * nutrition * saturationMod, playerNutrition)`, meaning that using `0.5` will make the effective saturation value the same as the nutrition value.
- `meat` - Whether this item should be considered meat or not. Used e.g. for determining if healing dogs with this food is possible.
- `alwaysEat` - Whether this item can always be eaten, even if the hunger bar is full. `false` by default, `true` for golden apples and other items that provide bonuses beyond just filling the hunger bar.
- `fast` - Whether fast eating should be enabled for this food. `false` by default, `true` for dried kelp in vanilla.
- `effect` - Adds a `MobEffectInstance` to apply when eating this item. The second parameter denotes the probability of the effect being applied; for example, Rotten Flesh has an 80% chance of applying the Hunger effect when eaten. This method comes in two variants, one that takes in a supplier (for your own effects) and one that directly takes a `MobEffectInstance` (for vanilla effects).
- `build` - Once you've set everything you want to set, call `build` to get a `FoodProperties` object for further use.

For examples, or to look at the various values used by Minecraft, have a look at the `Foods` class.

### More Functionality

Directly using `Item` only allows for very basic items. If you want to add functionality, for example right-click interactions, a custom class that extends `Item` is required. The `Item` class has many methods that can be overridden to do different things; see the classes `Item` and `IItemExtension` for more information. See also the [Interaction Pipeline][interactionpipeline] for where to begin for right-click behavior.

### Resources

If you register your item and get your item (via `/give` or through a [creative tab][creativetabs]), you will find it to be missing a proper model and texture. This is because textures and models  are handled by Minecraft's resource system.

To apply a simple texture to an item, you must add an item model JSON and a texture PNG. See the section on [resources] for more information.

## `ItemStack`s

Like with blocks and blockstates, most places where you'd expect an `Item` actually use an `ItemStack` instead. `ItemStack`s represent a stack of one or multiple items in a container, e.g. an inventory. Again like with blocks and blockstates, methods should be overridden by the `Item` and called on the `ItemStack`, and many methods in `Item` get an `ItemStack` instance passed in.

An `ItemStack` consists of three major parts:

- The `Item` it represents, obtainable through `itemstack.getItem()`.
- The stack size, typically between 1 and 64, obtainable through `itemstack.getCount()` and changeable through `itemstack.setCount(int)` or `itemstack.shrink(int)`.
- The extra NBT data, where stack-specific data is stored. Obtainable through `itemstack.getTag()`, or alternatively through `itemstack.getOrCreateTag()` which accounts for no tag existing yet. A variety of other NBT-related methods exist as well, the most important being `hasTag()` and `setTag()`.

To create a new `ItemStack`, call `new ItemStack(Item)`, passing in the backing item. By default, this uses a count of 1 and no NBT data; there are constructor overloads that accept a count and NBT data as well if needed.

If you want to represent that a stack has no item, use `ItemStack.EMPTY`. If you want to check whether an `ItemStack` is empty, call `itemstack.isEmpty()`.

## Creative Tabs

By default, your item will only be available through `/give` and not appear in the creative inventory. Let's change that!

The way you get your item into the creative menu depends on what tab you want to add it to.

### Existing Creative Tabs

An item can be added to an existing `CreativeModeTab` via the `BuildCreativeModeTabContentsEvent`, which is fired on the [mod event bus][modbus], only on the [logical client][sides]. Add items by calling `event#accept`.

```java
//MyItemsClass.MY_ITEM is a Supplier<? extends Item>, MyBlocksClass.MY_BLOCK is a Supplier<? extends Block>
@SubscribeEvent
public static void buildContents(BuildCreativeModeTabContentsEvent event) {
    // Is this the tab we want to add to?
    if (event.getTabKey() == CreativeModeTabs.INGREDIENTS) {
        event.accept(MyItemsClass.MY_ITEM);
        event.accept(MyBlocksClass.MY_BLOCK); // Accepts an ItemLike. This assumes that MY_BLOCK has a corresponding item.
    }
}
```

The event also provides some extra information, such as `getFlags()` to get the list of enabled feature flags, or `hasPermissions()` to check if the player has permissions to view the operator items tab.

:::note
This method is for adding your items to Minecraft's tabs, or to other mods' tabs. To add items to your own tabs, see below.
:::

### Custom Creative Tabs

`CreativeModeTab`s are a registry, meaning custom `CreativeModeTab`s must be [registered][registering]. Creating a creative tab uses a builder system, the builder is obtainable through `CreativeModeTab#builder`. The builder provides options to set the title, icon, default items, and a number of other properties. In addition, NeoForge provides additional methods to customize the tab's image, label and slot colors, where the tab should be ordered, etc.

```java
//CREATIVE_MODE_TABS is a DeferredRegister<CreativeModeTab>
public static final Supplier<CreativeModeTab> EXAMPLE_TAB = CREATIVE_MODE_TABS.register("example", () -> CreativeModeTab.builder()
    //Set the title of the tab. Don't forget to add a translation!
    .title(Component.translatable("itemGroup." + MOD_ID + ".example"))
    //Set the icon of the tab.
    .icon(() -> new ItemStack(MyItemsClass.EXAMPLE_ITEM.get()))
    //Add your items to the tab.
    .displayItems((params, output) -> {
        output.accept(MyItemsClass.MY_ITEM);
        output.accept(MyBlocksClass.MY_BLOCK); // Accepts an ItemLike. This assumes that MY_BLOCK has a corresponding item.
    })
    .build()
);
```

[block]: ../blocks/index.md
[blockstates]: ../blocks/states.md
[creativetabs]: #creative-tabs
[food]: #food
[hunger]: https://minecraft.wiki/w/Hunger#Mechanics
[interactionpipeline]: interactionpipeline.md
[modbus]: ../concepts/events.md#mod-event-bus
[registering]: ../concepts/registries.md#methods-for-registering
[sides]: ../concepts/sides.md
