## 工具与护甲

工具是其主要用途是破坏[方块][block]的[物品][item]。许多模组添加了新的工具套装（例如铜工具）或新的工具类型（例如锤子）。

## 自定义工具套装

工具套装通常包含五种物品：镐、斧、铲、锄和剑。（剑在传统意义上不是工具，但为了保持一致性也包括在内。）所有这些物品都有对应的类：`PickaxeItem`、`AxeItem`、`ShovelItem`、`HoeItem` 和 `SwordItem`。工具的类层次结构如下所示：

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

`TieredItem` 是一个包含了特定 `Tier`（详见下文）的辅助类。`DiggerItem` 包含了设计用于破坏方块的物品的辅助功能。请注意，其他通常被认为是工具的物品，例如剪刀，不包含在此层次结构中。它们直接扩展了 `Item`，并自行处理破坏逻辑。

要创建标准工具套装，首先必须定义一个 `Tier`。有关参考值，请参阅 Minecraft 的 `Tiers` 枚举。以下示例使用铜工具，你可以在此处使用你自己的材料并根据需要调整值。

```java
// 我们将铜放在石头和铁之间。
public static final Tier COPPER_TIER = new SimpleTier(
        // 确定此工具的等级。由于这是一个整数，没有很好的方法将我们的工具放在石头和铁之间。
        // 石头是 1，铁是 2。
        1,
        // 确定等级的耐久性。
        // 石头是 131，铁是 250。
        200,
        // 确定等级的挖掘速度。剑不使用此值。
        // 石头使用 4，铁使用 6。
        5f,
        // 确定攻击伤害加成。不同的工具使用不同的方式。例如，剑会造成 (getAttackDamageBonus() + 4) 的伤害。
        // 石头使用 1，铁使用 2，对应于剑的 5 和 6 攻击伤害；现在我们的剑造成 5.5 伤害。
        1.5f,
        // 确定等级的附魔能力。这代表了此工具上附魔的好坏程度。
        // 金使用 22，我们将铜稍微低于这个值。
        20,
        // 确定此工具可以破坏的方块的标签。详见下文。
        MyBlockTags.NEEDS_COPPER_TOOL,
        // 确定等级的修复原料。使用 Supplier 进行延迟初始化。
        () -> Ingredient.of(Tags.Items.INGOTS_COPPER)
);
```

现在我们有了我们的 `Tier`，我们可以用它来注册工具。所有工具的构造函数都有相同的四个参数。

```java
// ITEMS 是一个 DeferredRegister<Item>
public static final Supplier<SwordItem> COPPER_SWORD = ITEMS.register("copper_sword", () -> new SwordItem(
        // 要使用的等级。
        COPPER_TIER,
        // 类型特定的攻击伤害加成。剑为 3，铲为 1.5，镐为 1，斧和锄有所不同。
        3,
        // 类型特定的攻击速度修正。玩家的默认攻击速度为 4，所以我们使用 -2.4f 来达到期望的值 1.6f。
        // 剑为 -2.4f，铲为 -3f，镐为 -2.8f，斧和锄有所不同。
        -2.4f,
        // 物品属性。我们不需要在这里设置耐久性，因为 TieredItem 会为我们处理。
        new Item.Properties()
));
public static final Supplier<AxeItem> COPPER_AXE = ITEMS.register("copper_axe", () -> new AxeItem(...));
public static final Supplier<PickaxeItem> COPPER_PICKAXE = ITEMS.register("copper_pickaxe", () -> new PickaxeItem(...));
public static final

 Supplier<ShovelItem> COPPER_SHOVEL = ITEMS.register("copper_shovel", () -> new ShovelItem(...));
public static final Supplier<HoeItem> COPPER_HOE = ITEMS.register("copper_hoe", () -> new HoeItem(...));
```

### 标签

创建 `Tier` 时，它被分配了一个包含需要此工具（或更好的工具）才能破坏的方块[标签][tags]。例如，`minecraft:needs_iron_tool` 标签包含了钻石矿石（以及其他方块），而 `minecraft:needs_diamond_tool` 标签包含了方块如黑曜石和远古残骸。

如果你满意的话，你可以重用这些标签中的一个来制作你的工具。例如，如果我们想要我们的铜工具只是更耐用的石头工具，我们可以传入 `BlockTags.NEEDS_STONE_TOOL`。

或者，我们可以创建自己的标签，操作如下：

```java
public static final TagKey<Block> NEEDS_COPPER_TOOL = TagKey.create(BuiltInRegistries.BLOCK.key(), new ResourceLocation(MOD_ID, "needs_copper_tool"));
```

然后，我们填充我们的标签。例如，让铜能够开采金矿石、金块和红石矿石，但不能开采钻石或绿宝石。 （红石块已经可以被石头工具开采了。）标签文件位于 `src/main/resources/data/mod_id/tags/blocks/needs_copper_tool.json`（其中 `mod_id` 是你的模组 ID）：

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

最后，我们可以像上面看到的那样将我们的标签传递给我们的等级创建。

### `TierSortingRegistry`

为了使游戏真正选择你的等级位于另外两个等级之间，你必须将其注册到 `TierSortingRegistry`。这必须在物品注册之前发生，将 `static` 初始化器放在与你的等级定义相同的类中是一个不错的选择。如果你不将你的等级添加到注册表中，它将退回到原版所做的操作。

```java
public static final Tier COPPER_TIER = new SimpleTier(...);

static {
    TierSortingRegistry.registerTier(
            COPPER_TIER,
            // 用于内部解析的名称。如果适用，可以使用 Minecraft 命名空间。
            new ResourceLocation("minecraft", "copper"),
            // 被认为低于正在添加的类型的一系列等级。例如，石头低于铜。
            // 我们不需要在这里添加木头和金，因为这些已经低于石头了。
            List.of(Tiers.STONE),
            // 被认为高于正在添加的类型的一系列等级。例如，铁高于铜。
            // 我们不需要在这里添加钻石和下界合金，因为这些已经高于铁了。
            List.of(Tiers.IRON)
    );
}
```

可以将其他等级的 ID 传递到这些列表中，作为 `Tier` 的替代或补充。例如，假设我们想要使我们的材料被认为比铁和 [Mekanism 工具][mektools] 的钨更弱，我们可以这样做：

```java
public static final Tier COPPER_TIER = new SimpleTier(...);

static {
    TierSortingRegistry.registerTier(
            COPPER_TIER,
            new ResourceLocation("minecraft", "copper"),
            List.of(Tiers.STONE),
            // 我们可以在这里混合和匹配 Tiers 和 ResourceLocations。
            List.of(Tiers.IRON, new ResourceLocation("mekanism", "osmium"))
    );
}
```

## 工具与护甲

工具是主要用于破坏[方块][block]的[物品][item]。许多模组添加了新的工具套装（例如铜工具）或新的工具类型（例如锤子）。

### 自定义工具套装

工具套装通常由五种物品组成：镐、斧、铲、锄和剑。（剑在传统意义上不是工具，但为了保持一致性，也包括在内。）所有这些物品都有各自对应的类：`PickaxeItem`、`AxeItem`、`ShovelItem`、`HoeItem` 和 `SwordItem`。工具的类层次结构如下所示：

```
Item
- TieredItem
  - DiggerItem
    - AxeItem
    - HoeItem
    - PickaxeItem
    - ShovelItem
  - SwordItem
```

`TieredItem` 是一个包含某个 `Tier` 的辅助类（详见下文）。`DiggerItem` 包含了用于破坏方块的物品的辅助方法。请注意，其他通常被视为工具的物品（如剪刀）不包括在这个层次结构中。相反，它们直接扩展 `Item` 并自行处理破坏逻辑。

要创建标准的工具套装，首先必须定义一个 `Tier`。参考 Minecraft 的 `Tiers` 枚举获取参考值。以下示例使用铜工具，你可以在此处使用你自己的材料并根据需要调整值。

```java
// 我们将铜放在石头和铁之间。
public static final Tier COPPER_TIER = new SimpleTier(
        // 确定此工具的等级。由于这是一个整数，因此没有好的方法将我们的工具放置在石头和铁之间。
        // NeoForge 引入了 TierSortingRegistry 来解决这个问题，有关更多信息，请参见下文。在此处尽力估计。
        // 石头为 1，铁为 2。
        1,
        // 确定等级的耐久度。
        // 石头为 131，铁为 250。
        200,
        // 确定等级的挖掘速度。斧头不使用此项。
        // 石头使用 4，铁使用 6。
        5f,
        // 确定攻击伤害奖励。不同的工具使用方式不同。例如，剑会造成 (getAttackDamageBonus() + 4) 的伤害。
        // 石头使用 1，铁使用 2，对应于剑的伤害分别为 5 和 6；我们的剑现在造成 5.5 的伤害。
        1.5f,
        // 确定等级的附魔性。这代表了这个工具上附魔的好坏程度。
        // 金使用 22，我们稍微低于这个值。
        20,
        // 决定这个工具可以破坏哪些方块的标签。更多信息请参见下文。
        MyBlockTags.NEEDS_COPPER_TOOL,
        // 确定等级的修复材料。使用供应商进行延迟初始化。
        () -> Ingredient.of(Tags.Items.INGOTS_COPPER)
);
```

现在我们有了我们的 `Tier`，我们可以在注册工具时使用它。所有工具构造函数都具有相同的四个参数。

```java
// ITEMS 是一个 DeferredRegister<Item>
public static final Supplier<SwordItem> COPPER_SWORD = ITEMS.register("copper_sword", () -> new SwordItem(
        // 要使用的等级。
        COPPER_TIER,
        // 类型特定的攻击伤害奖励。剑为 3，铲子为 1.5，镐子为 1，斧头和锄头的值各不相同。
        3,
        // 类型特定的攻击速度修饰符。玩家的默认攻击速度为 4，所以要达到期望的值 1.6f，我们使用 -2.4f。对于剑，值为 -2.4f，铲子为 -3f，镐子为 -2.8f，斧头和锄头的值各不相同。
        -2.4f,
        // 物品属性。我们不需要在此设置耐久度，因为 TieredItem 会为我们处理。
        new Item.Properties()
));
public static final Supplier<AxeItem> COPPER_AXE = ITEMS.register("copper_axe", () -> new AxeItem(...));
public static final Supplier<PickaxeItem> COPPER_PICKAXE = ITEMS.register("copper_pickaxe", () -> new PickaxeItem(...));
public static final Supplier<ShovelItem> COPPER

_SHOVEL = ITEMS.register("copper_shovel", () -> new ShovelItem(...));
```

### 工具动作

工具动作是工具能够执行和不能执行的操作的抽象。这包括左键和右键行为。NeoForge 在 `ToolActions` 类中提供了默认的 `ToolAction`：

- 挖掘动作。这些适用于上文提到的所有四种 `DiggerItem` 类型，以及剑和剪刀挖掘。
- 斧头右键动作用于去皮（原木）、刮（氧化铜）和去蜡（蜡质铜）。
- 剪刀动作用于收获（蜜蜂巢）、雕刻（南瓜）和解除武装（绊线）。
- 铲子平整（土径）、剑扫射、锄头耕作、盾牌阻挡和钓鱼竿抛出的动作。

要创建自己的 `ToolAction`，请使用 `ToolAction#get` - 它会在需要时创建一个新的 `ToolAction`。然后，在自定义工具类型中根据需要覆盖 `IItemExtension#canPerformAction`。

要查询一个 `ItemStack` 是否可以执行某个 `ToolAction`，请调用 `IItemStackExtension#canPerformAction`。请注意，这适用于任何 `Item`，而不仅仅是工具。

### 护甲

与工具类似，护甲也使用一个等级系统（尽管不同）。工具中称为 `Tier` 的东西在护甲中称为 `ArmorMaterial`。就像上面一样，这个例子展示了如何添加铜护甲；这可以根据需要进行调整。有关原始数值，请参见 `ArmorMaterials` 枚举。

```java
// 我们将铜放在锁链甲和铁之间。
public static final ArmorMaterial COPPER_ARMOR_MATERIAL = new ArmorMaterial() {
    // 护甲材料的名称。主要用于确定护甲纹理的位置。应包含一个前导的模组标识符以确保唯一性，否则当两个模组尝试添加相同的护甲材料时可能会出现问题。（如果省略模组标识符，则将使用 "minecraft" 命名空间。）
    @Override
    public String getName() {
        return "modid:copper";
    }

    // StringRepresentable 的重写。通常应与 getName() 返回相同的值。
    @Override
    public String getSerializedName() {
        return getName();
    }

    // 确定此护甲材料的耐久度，具体取决于护甲部件是什么。
    // ArmorItem.Type 是四个值的枚举：HELMET、CHESTPLATE、LEGGINGS 和 BOOTS。
    // Vanilla 护甲材料通过使用一个基础值并将其与类型特定的常量相乘来确定这一点。
    // 这些常量是 13（BOOTS）、15（LEGGINGS）、16（CHESTPLATE）和 11（HELMET）。
    // 锁链甲和铁都使用 15 作为基础值，所以我们也使用它。
    @Override
    public int getDurabilityForType(ArmorItem.Type type) {
        return switch (type) {
            case HELMET -> 11 * 15;
            case CHESTPLATE -> 16 * 15;
            case LEGGINGS -> 15 * 15;
            case BOOTS -> 13 * 15;
        };
    }

    // 确定此护甲材料的防御值，具体取决于护甲部件是什么。
    @Override
    public int getDurabilityForType(ArmorItem.Type type) {
        return switch (type) {
            case HELMET -> 2;
            case CHESTPLATE -> 4;
            case LEGGINGS -> 6;
            case BOOTS -> 2;
        };
    }

    // 返回护甲的坚韧度值。坚韧度值是包含在伤害计算中的额外值，有关更多信息，请参见 Minecraft Wiki 上的护甲机制文章：https://minecraft.wiki/w/Armor#Armor_toughness
    // 只有钻石和下界合金在这里的值大于 0，所以我们只返回 0。
    @Override
    public float getToughness() {
        return 0;
    }

    // 返回护甲的抗击退值。穿戴这种护甲时，玩家对击退具有一定程度的免疫。如果玩家从所有护甲部件中获得的总击退抗性值大于或等于 1，则它们将根本不受到任何击退。
    // 只有下界合金在这里的值大于 0，所以我们只返回 0。
    @Override
    public float getKnockbackResistance() {
        return 0;
    }

    // 确定等级的附魔性。这代表了这个护甲上的附魔有多好。
    // 金使用 25，我们将铜放在稍低的位置。
    @Override
    public int getEnchantmentValue(ArmorItem.Type type) {
        return 20;
    }

    // 确定装备这件护甲时播放的声音。
    @Override
    public SoundEvent getEquipSound() {
        return SoundEvents.ARMOR_EQUIP_GENERIC;
    }

    // 确定这件护甲的修复物品。
    @Override
    public Ingredient getRepairIngredient() {
        return Ingredient.of(Tags.Items.INGOTS_COPPER);
    }
    
    // 可选地，您还可以在这里重写 #getArmorTexture。此方法返回一个 ResourceLocation，用于确定存储护甲位置的位置，以防您希望将其存储在非默认位置。

有关示例，请参见 Tier 中的默认实现。
}
```

然后，在物品注册中使用该护甲材料。

```java
// ITEMS 是一个 DeferredRegister<Item>
public static final Supplier<ArmorItem> COPPER_HELMET = ITEMS.register("copper_helmet", () -> new ArmorItem(
        // 要使用的护甲材料。
        COPPER_ARMOR_MATERIAL,
        // 要使用的护甲类型。
        ArmorItem.Type.HELMET,
        // 物品属性。我们不需要在此设置耐久度，因为 ArmorItem 会为我们处理。
        new Item.Properties()
));
public static final Supplier<ArmorItem> COPPER_CHESTPLATE = ITEMS.register("copper_chestplate", () -> new ArmorItem(...));
public static final Supplier<ArmorItem> COPPER_LEGGINGS = ITEMS.register("copper_leggings", () -> new ArmorItem(...));
public static final Supplier<ArmorItem> COPPER_BOOTS = ITEMS.register("copper_boots", () -> new ArmorItem(...));
```

除了通常的资源外，护甲还需要一个穿戴时的护甲纹理，它将在装备护甲时渲染在玩家模型上。该纹理必须位于 `src/main/resources/assets/<mod_id>/textures/models/armor/<material>_layer_1.png`（头盔、胸甲和靴子的纹理），以及相同目录中的 `<material>_layer_2.png`（护腿的纹理）。

创建护甲纹理时，最好在基于标准护甲纹理的基础上进行工作，以确定每个部分的位置。

[block]: ../blocks/index.md
[farmersdelight]: https://www.curseforge.com/minecraft/mc-mods/farmers-delight
[item]: index.md
[mektools]: https://www.curseforge.com/minecraft/mc-mods/mekanism-tools
[tags]: ../resources/server/tags.md
