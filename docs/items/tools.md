# Tools

Tools are [items][item] whose primary use is to break [blocks][block]. Many mods add new tool sets (for example copper tools) or new tool types (for example hammers).

## Custom Tool Sets

A tool set typically consists of five items: a pickaxe, an axe, a shovel, a hoe and a sword. (Swords aren't tools in the classical sense, but are included here for consistency as well.) All of those items have their corresponding class: `PickaxeItem`, `AxeItem`, `ShovelItem`, `HoeItem` and `SwordItem`, respectively. The class hierarchy of tools looks as follows:

```text
Item
- TieredItem
  - DiggerItem
    - AxeItem
    - HoeItem
    - PickaxeItem
    - ShovelItem
  - SwordItem
```

`TieredItem` is a class that contains helpers for items with a certain `Tier` (read on). `DiggerItem` contains helpers for items that are designed to break blocks. Note that other items usually considered tools, such as shears, are not included in this hierarchy. Instead, they directly extend `Item` and hold the breaking logic themselves.

To create a standard set of tools, you must first define a `Tier`. For reference values, see Minecraft's `Tiers` enum. This example uses copper tools, you can use your own material here and adjust the values as needed.

```java
// We place copper somewhere between stone and iron.
public static final Tier COPPER_TIER = new SimpleTier(
        // Determines the level of this tool. Since this is an int, there is no good way to place our tool between stone and iron.
        // NeoForge introduces the TierSortingRegistry to solve this problem, see below for more information. Use a best-effort approximation here.
        // Stone is 1, iron is 2.
        1,
        // Determines the durability of the tier.
        // Stone is 131, iron is 250.
        200,
        // Determines the mining speed of the tier. Unused by swords.
        // Stone uses 4, iron uses 6.
        5f,
        // Determines the attack damage bonus. Different tools use this differently. For example, swords do (getAttackDamageBonus() + 4) damage.
        // Stone uses 1, iron uses 2, corresponding to 5 and 6 attack damage for swords, respectively; our sword does 5.5 damage now.
        1.5f,
        // Determines the enchantability of the tier. This represents how good the enchantments on this tool will be.
        // Gold uses 22, we put copper slightly below that.
        20,
        // The tag that determines what blocks this tool can break. See below for more information.
        MyBlockTags.NEEDS_COPPER_TOOL,
        // Determines the repair ingredient of the tier. Use a supplier for lazy initializing.
        () -> Ingredient.of(Tags.Items.INGOTS_COPPER)
);
```

Now that we have our `Tier`, we can use it for registering tools. All tool constructors have the same four parameters.

```java
//ITEMS is a DeferredRegister<Item>
public static final Supplier<SwordItem> COPPER_SWORD = ITEMS.register("copper_sword", () -> new SwordItem(
        // The tier to use.
        COPPER_TIER,
        // The type-specific attack damage bonus. 3 for swords, 1.5 for shovels, 1 for pickaxes, varying for axes and hoes.
        3,
        // The type-specific attack speed modifier. The player has a default attack speed of 4, so to get to the desired
        // value of 1.6f, we use -2.4f. -2.4f for swords, -3f for shovels, -2.8f for pickaxes, varying for axes and hoes.
        -2.4f,
        // The item properties. We don't need to set the durability here because TieredItem handles that for us.
        new Item.Properties()
));
public static final Supplier<AxeItem> COPPER_AXE = ITEMS.register("copper_axe", () -> new AxeItem(...));
public static final Supplier<PickaxeItem> COPPER_PICKAXE = ITEMS.register("copper_pickaxe", () -> new PickaxeItem(...));
public static final Supplier<ShovelItem> COPPER_SHOVEL = ITEMS.register("copper_shovel", () -> new ShovelItem(...));
public static final Supplier<HoeItem> COPPER_HOE = ITEMS.register("copper_hoe", () -> new HoeItem(...));
```

### Tags

When creating a `Tier`, it is assigned a block tag containing blocks that need this tool (or a better one) to be broken. For example, the `minecraft:needs_iron_tool` tag contains Diamond Ores (among others), and the `minecraft:needs_diamond_tool` tag contains blocks like Obsidian and Ancient Debris.

You can reuse one of these tags for your tool if you're fine with that. For example, if we wanted our copper tools to just be more durable stone tools, we'd pass in `BlockTags.NEEDS_STONE_TOOL`.

Alternatively, we can create our own tag, like so:

```java
public static final TagKey<Block> NEEDS_COPPER_TOOL = TagKey.create(BuiltInRegistries.BLOCK.key(), new ResourceLocation(MOD_ID, "needs_copper_tool"));
```

And then, we populate our tag. For example, let's make copper able to mine gold ores, gold blocks and redstone ore, but not diamonds or emeralds. (Redstone blocks are already mineable by stone tools.) The tag file is located at `src/main/resources/data/mod_id/tags/blocks/needs_copper_tool.json` (where `mod_id` is your mod id):

```json
{
  "values": [
    "minecraft:gold_block",
    "minecraft:raw_gold_block",
    "minecraft:gold_ore",
    "minecraft:deepslate_gold_ore",
    "minecraft:redstone_ore",
    "minecraft:deepslate_redstone_ore"
  ]
}
```

Finally, we can pass our tag into our tier creation, as seen above.

### `TierSortingRegistry`

In order to make the game actually pick up your tier as between two others, you must register it to the `TierSortingRegistry`. This must happen before item registration, a `static` initializer in the same class as your tier definition is a good spot for that. If you do not add your tier to the registry, it will fall back to what vanilla would do.

```java
public static final Tier COPPER_TIER = new SimpleTier(...);

static {
    TierSortingRegistry.registerTier(
            COPPER_TIER,
            //The name to use for internal resolution. May use the Minecraft namespace if appropriate.
            new ResourceLocation("minecraft", "copper"),
            //A list of tiers that are considered lower than the type being added. For example, stone is lower than copper.
            //We don't need to add wood and gold here because those are already lower than stone.
            List.of(Tiers.STONE),
            //A list of tiers that are considered higher than the type being added. For example, iron is higher than copper.
            //We don't need to add diamond and netherite here because those are already higher than iron.
            List.of(Tiers.IRON)
    );
}
```

If you want to check if a tier is applicable for a block state, you can call `TierSortingRegistry#isCorrectTierForDrops`.

## Custom Tool Types

Custom tool types can be created by extending `DiggerItem` (or `TieredItem` if you are making custom weapon types). They don't need too big of a setup, it is an item class like any other, with all implications that has.

One thing worth noting is the parameters of `DiggerItem`. The first four parameters are the same as for its subclasses (see the explanation for `SwordItem` above), while the fifth parameter is the `mineable` tag for the tool type. Generally, the format here is `<mod_id>:mineable/<tool_type>`, though `forge` can be used as the namespace too if you expect other mods to add similar tools. For example, [Farmer's Delight][farmersdelight] uses a `forge:mineable/knives` tag.

## `ToolAction`s

`ToolAction`s are an abstraction over what a tool can and cannot do. This includes both left-click and right-click behavior. NeoForge provides default `ToolAction`s in the `ToolActions` class:

- Digging actions. These exist for all four `DiggerItem` types as mentioned above, as well as sword and shears digging.
- Axe right-click actions for stripping (logs), scraping (oxidized copper) and unwaxing (waxed copper).
- Shear actions for harvesting (honeycombs), carving (pumpkins) and disarming (tripwires).
- Actions for shovel flattening (dirt paths), sword sweeping, hoe tilling, shield blocking, and fishing rod casting.

To create your own `ToolAction`s, use `ToolAction#get` - it will create a new `ToolAction` if needed. Then, in a custom tool type, override `IItemExtension#canPerformAction` as needed.

To query if an `ItemStack` can perform a certain `ToolAction`, call `IItemStackExtension#canPerformAction`. Note that this works on any `Item`, not just tools.

[block]: ../blocks/index.md
[farmersdelight]: https://www.curseforge.com/minecraft/mc-mods/farmers-delight
[item]: index.md
