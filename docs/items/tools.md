---
sidebar_position: 4
---
# Tools

Tools are [items][item] whose primary use is to break [blocks][block]. Many mods add new tool sets (for example copper tools) or new tool types (for example hammers).

## Custom Tool Sets

A tool set typically consists of five items: a pickaxe, an axe, a shovel, a hoe and a sword. (Swords aren't tools in the classical sense, but are included here for consistency as well.) All of those items have their corresponding class: `PickaxeItem`, `AxeItem`, `ShovelItem`, `HoeItem` and `SwordItem`, respectively. The class hierarchy of tools looks as follows:

```text
Item
- DiggerItem
    - AxeItem
    - HoeItem
    - PickaxeItem
    - ShovelItem
- SwordItem
```

Tools are almost completely implemented through seven [data components][datacomponents]:

- `DataComponents#MAX_DAMAGE` and `#DAMAGE` for durability
- `#MAX_STACK_SIZE` to set the stack size to `1`
- `#REPAIRABLE` for reepairing a tool in an anvil
- `#ENCHANTABLE` for the maximum [enchanting][enchantment] value
- `#ATTRIBUTE_MODIFIERS` for attack damage and attack speed
- `#TOOL` for mining information

For `DiggerItem` and `SwordItem`, they are simply delegates that set up the components via the utility record `ToolMaterial`. Note that other items usually considered tools, such as shears, are not included in this hierarchy. Instead, they directly extend `Item` and hold the breaking logic themselves.

To create a standard set of tools using a `DiggerItem` or `SwordItem`, you must first define a `ToolMaterial`. Reference values can be found within the constants in `ToolMaterial`. This example uses copper tools, you can use your own material here and adjust the values as needed.

```java
// We place copper somewhere between stone and iron.
public static final ToolMaterial COPPER_MATERIAL = new ToolMaterial(
        // The tag that determines what blocks this material cannot break. See below for more information.
        MyBlockTags.INCORRECT_FOR_COPPER_TOOL,
        // Determines the durability of the material.
        // Stone is 131, iron is 250.
        200,
        // Determines the mining speed of the material. Unused by swords.
        // Stone uses 4, iron uses 6.
        5f,
        // Determines the attack damage bonus. Different tools use this differently. For example, swords do (getAttackDamageBonus() + 4) damage.
        // Stone uses 1, iron uses 2, corresponding to 5 and 6 attack damage for swords, respectively; our sword does 5.5 damage now.
        1.5f,
        // Determines the enchantability of the material. This represents how good the enchantments on this tool will be.
        // Gold uses 22, we put copper slightly below that.
        20,
        // The tag that determines what items can repair this material.
        Tags.Items.INGOTS_COPPER
);
```

Now that we have our `ToolMaterial`, we can use it for [registering] tools. All tool constructors have the same four parameters.

```java
// ITEMS is a DeferredRegister.Items
public static final DeferredItem<SwordItem> COPPER_SWORD = ITEMS.registerItem(
    "copper_sword",
    props -> new SwordItem(
        // The material to use.
        COPPER_MATERIAL,
        // The type-specific attack damage bonus. 3 for swords, 1.5 for shovels, 1 for pickaxes, varying for axes and hoes.
        3,
        // The type-specific attack speed modifier. The player has a default attack speed of 4, so to get to the desired
        // value of 1.6f, we use -2.4f. -2.4f for swords, -3f for shovels, -2.8f for pickaxes, varying for axes and hoes.
        -2.4f,
        // The item properties.
        props
    )
);

public static final DeferredItem<AxeItem> COPPER_AXE = ITEMS.registerItem("copper_axe", props -> new AxeItem(...));
public static final DeferredItem<PickaxeItem> COPPER_PICKAXE = ITEMS.registerItem("copper_pickaxe", props -> new PickaxeItem(...));
public static final DeferredItem<ShovelItem> COPPER_SHOVEL = ITEMS.registerItem("copper_shovel", props -> new ShovelItem(...));
public static final DeferredItem<HoeItem> COPPER_HOE = ITEMS.registerItem("copper_hoe", props -> new HoeItem(...));
```

### Tags

When creating a `ToolMaterial`, it is assigned a block [tag][tags] containing blocks that will not drop anything if broken with this tool. For example, the `minecraft:incorrect_for_stone_tool` tag contains blocks like Diamond Ore, and the `minecraft:incorrect_for_iron_tool` tag contains blocks like Obsidian and Ancient Debris. To make it easier to assign blocks to their incorrect mining levels, a tag also exists for blocks that need this tool to be mined. For example, the `minecraft:needs_iron_tool` tag contains blocks like Diamond Ore, and the `minecraft:needs_diamond_tool` tag contains blocks like Obsidian and Ancient Debris.

You can reuse one of the incorrect tags for your tool if you're fine with that. For example, if we wanted our copper tools to just be more durable stone tools, we'd pass in `BlockTags#INCORRECT_FOR_STONE_TOOL`.

Alternatively, we can create our own tag, like so:

```java
// This tag will allow us to add these blocks to the incorrect tags that cannot mine them
public static final TagKey<Block> NEEDS_COPPER_TOOL = TagKey.create(BuiltInRegistries.BLOCK.key(), ResourceLocation.fromNamespaceAndPath(MOD_ID, "needs_copper_tool"));

// This tag will be passed into our material
public static final TagKey<Block> INCORRECT_FOR_COPPER_TOOL = TagKey.create(BuiltInRegistries.BLOCK.key(), ResourceLocation.fromNamespaceAndPath(MOD_ID, "incorrect_for_cooper_tool"));
```

And then, we populate our tag. For example, let's make copper able to mine gold ores, gold blocks and redstone ore, but not diamonds or emeralds. (Redstone blocks are already mineable by stone tools.) The tag file is located at `src/main/resources/data/mod_id/tags/block/needs_copper_tool.json` (where `mod_id` is your mod id):

```json5
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

Then, for our tag to pass into the material, we can provide a negative constraint for any tools that are incorrect for stone tools but within our copper tools tag. The tag file is located at `src/main/resources/data/mod_id/tags/block/incorrect_for_cooper_tool.json`:

```json5
{
    "values": [
        "#minecraft:incorrect_for_stone_tool"
    ],
    "remove": [
        "#mod_id:needs_copper_tool"
    ]
}
```

Finally, we can pass our tag into our material instance, as seen above.

If you want to check if a tool can make a block state drop its blocks, call `Tool#isCorrectForDrops`. The `Tool` can be obtained by calling `ItemStack#get` with `DataComponents#TOOL`.

## Custom Tools

Custom tools can be created by adding a `Tool` [data component][datacomponents] (via `DataComponents#TOOL`) to the list of default components on your item via `Item.Properties#component`. `DiggerItem` is an implementation which takes in a `ToolMaterial`, as explained above, to construct the `Tool`, along with a few other basic components such as attributes and durability.

A `Tool` contains a list of `Tool.Rule`s, the default mining speed when holding the tool (`1` by default), and the amount of damage the tool should take when mining a block (`1` by default). A `Tool.Rule` contains three pieces of information: a `HolderSet` of blocks to apply the rule to, an optional speed at which to mine the blocks in the set, and an optional boolean at which to determine whether these blocks can drop from this tool. If the optional are not set, then the other rules will be checked. The default behavior if all rules fail is the default mining speed and that the block cannot be dropped.

:::note
A `HolderSet` can be created from a `TagKey` via `Registry#getOrThrow`.
:::

Creating any tool or multitool-like item (i.e. an item that combines two or more tools into one, e.g. an axe and a pickaxe as one item) does not need to extend any of the existing `DiggerItem`s or `SwordItem`. It simply can be implemented using a combination of the following parts:

- Adding a `Tool` with your own rules by setting `DataComponents#TOOL` via `Item.Properties#component`.
- Adding attributes to the item (e.g. attack damage, attack speed) via `Item.Properties#attributes`.
- Adding item durability via `Item.Properties#durability`.
- Allowing the item to be repaired via `Item.Properties#repariable`.
- Allowing the item to be enchanted via `Item.Properties#enchantable`.
- Overriding `IItemExtension#canPerformAction` to determine what [`ItemAbility`s][itemability] the item can perform.
- Calling `IBlockExtension#getToolModifiedState` if you want your item to modify the block state on right click based on the `ItemAbility`s.
- Adding your tool to some of the `minecraft:enchantable/*` `ItemTags` so that your item can have certain enchantments applied to it.

:::note
The only logic that has no alternative to using a `DiggerItem` or `SwordItem` base is when mobs replace their current held item via `Mob#canReplaceCurrentItem`. Mobs will always check for an instance of `SwordItem`, followed by `BowItem`, `CrossbowItem`, `ArmorItem`, and `DiggerItem`, with all other items not considered for specialized logic.
:::

## `ItemAbility`s

`ItemAbility`s are an abstraction over what an item can and cannot do. This includes both left-click and right-click behavior. NeoForge provides default `ItemAbility`s in the `ItemAbilities` class:

- Digging abilities. These exist for all four `DiggerItem` types as mentioned above, as well as sword and shears digging.
- Axe right-click abilities for stripping (logs), scraping (oxidized copper), and unwaxing (waxed copper).
- Shovel right-click abilities for flattening (dirt paths) and dousing (campfires).
- Shear abilities for harvesting (honeycombs), removing armor (armored wolves), carving (pumpkins), disarming (tripwires), and trimming (stop plants from growing).
- Abilities for sword sweeping, hoe tilling, shield blocking, fishing rod casting, trident throwing, brush brushing, and firestarter lighting.

To create your own `ItemAbility`s, use `ItemAbility#get` - it will create a new `ItemAbility` if needed. Then, in a custom tool type, override `IItemExtension#canPerformAction` as needed.

To query if an `ItemStack` can perform a certain `ItemAbility`, call `IItemStackExtension#canPerformAction`. Note that this works on any `Item`, not just tools.

[block]: ../blocks/index.md
[datacomponents]: datacomponents.md
[enchantment]: ../resources/server/enchantments/index.md#enchantment-costs-and-levels
[item]: index.md
[itemability]: #itemabilitys
[registering]: ../concepts/registries.md#methods-for-registering
[tags]: ../resources/server/tags.md
