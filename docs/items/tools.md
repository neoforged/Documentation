# 도구 & 장비

도구는 [블록][block]을 부수기 위해 사용하는 [아이템][item]입니다. 많은 모드들에서 새로운 종류의 도구나 도구 세트를 추가합니다.

## 도구 세트 만들기

도구 세트는 대개 다섯 가지의 아이템으로 구성됩니다: 곡괭이, 도끼, 삽, 괭이, 검 (검은 도구로 취급하기 애매하지만 일관성을 위해 포함합니다). 이들에 해당하는 클래스는 차례대로: `PickaxeItem`, `AxeItem`, `ShovelItem`, `HoeItem` 그리고 `SwordItem`이 있습니다. 이 클래스들의 관계는 다음과 같습니다:

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

`TieredItem`은 `Tier`(아래 참고)를 가지는 아이템을 표현하는 클래스입니다. 그 하위 클래스 `DiggerItem`은 블록을 부수는 아이템을 만들기 위해 제작된 클래스입니다. 이때 가위와 같이 티어가 없는 기타 도구들은 위 클래스 관계에 포함되지 않고, 대신 `Item`을 바로 상속해 블록을 부수는 기능을 따로 구현합니다.

새로운 도구 세트를 만들기 위해선, 먼저 새로운 `Tier`를 추가하세요. 아래는 구리 도구를 추가하는 예제입니다, 각 값들을 자신의 재료에 맞게 조절하세요.

```java
// 아래 예시에선 구리를 철과 돌 사이 정도로 조절합니다.
public static final Tier COPPER_TIER = new SimpleTier(
        // The tag that determines what blocks this tool cannot break. See below for more information.
        MyBlockTags.INCORRECT_FOR_COPPER_TOOL,
        // Determines the level of this tool. Since this is an int, there is no good way to place our tool between stone and iron.
        // NeoForge introduces the TierSortingRegistry to solve this problem, see below for more information. Use a best-effort approximation here.
        // Stone is 1, iron is 2.
        1,
        // 티어의 내구도.
        // 돌은 131, 철은 250.
        200,
        // 티어의 채광 속도. 검은 이 값을 무시함.
        // 돌은 4, 철은 6.
        5f,
        // 티어의 추가 피해량. 도구들마다 이 값을 다르게 사용하는데, 예를 들어 칼은 (추가 피해량 + 4) 만큼의 피해를 줌.
        // 돌은 1, 철은 2. 이에 따라 돌검은 5, 철검은 6.
        1.5f,
        // 티어의 마법 부여 가중치. 높을수록 좋은 인첸트가 잘 나옴.
        // 금은 22.
        20,
        // Determines the repair ingredient of the tier. Use a supplier for lazy initializing.
        () -> Ingredient.of(Tags.Items.INGOTS_COPPER)
);
```

다른 예제는 마인크래프트의 `Tiers`를 참고하세요. 이제 새로운 티어를 추가했으니, 이 티어를 가지는 도구들도 추가합니다. 모든 도구들은 생성자 똑같은 네 개의 인자를 받습니다.

```java
//ITEMS은 DeferredRegister<Item>
public static final Supplier<SwordItem> COPPER_SWORD = ITEMS.register("copper_sword", () -> new SwordItem(
        // 사용할 티어.
        COPPER_TIER,
        // The item properties. We don't need to set the durability here because TieredItem handles that for us.
        new Item.Properties().attributes(
            // There are `createAttributes` methods in either the class or subclass of each DiggerItem
            SwordItem.createAttributes(
                // The tier to use.
                COPPER_TIER,
                // The type-specific attack damage bonus. 3 for swords, 1.5 for shovels, 1 for pickaxes, varying for axes and hoes.
                3,
                // The type-specific attack speed modifier. The player has a default attack speed of 4, so to get to the desired
                // value of 1.6f, we use -2.4f. -2.4f for swords, -3f for shovels, -2.8f for pickaxes, varying for axes and hoes.
                -2.4f,
            )
        )
));
public static final Supplier<AxeItem> COPPER_AXE = ITEMS.register("copper_axe", () -> new AxeItem(...));
public static final Supplier<PickaxeItem> COPPER_PICKAXE = ITEMS.register("copper_pickaxe", () -> new PickaxeItem(...));
public static final Supplier<ShovelItem> COPPER_SHOVEL = ITEMS.register("copper_shovel", () -> new ShovelItem(...));
public static final Supplier<HoeItem> COPPER_HOE = ITEMS.register("copper_hoe", () -> new HoeItem(...));
```

### 태그

When creating a `Tier`, it is assigned a block [tag][tags] containing blocks that will not drop anything if broken with this tool. For example, the `minecraft:incorrect_for_stone_tool` tag contains blocks like Diamond Ore, and the `minecraft:incorrect_for_iron_tool` tag contains blocks like Obsidian and Ancient Debris. To make it easier to assign blocks to their incorrect mining levels, a tag also exists for blocks that need this tool to be mined. For example, the `minecraft:needs_iron_tool` tag containslike Diamond Ore, and the `minecraft:needs_diamond_tool` tag contains blocks like Obsidian and Ancient Debris.

필요하다면 다른 티어의 태그를 재사용하셔도 됩니다. 예를 들어 위에서 만든 구리 도구가 돌 도구와 같은 블록만 캔다면 `BlockTags#INCORRECT_FOR_STONE_TOOL`을 사용합니다.

아니면 아래처럼 새로운 태그를 추가하세요:

```java
// This tag will allow us to add these blocks to the incorrect tags that cannot mine them
public static final TagKey<Block> NEEDS_COPPER_TOOL = TagKey.create(BuiltInRegistries.BLOCK.key(), new ResourceLocation(MOD_ID, "needs_copper_tool"));

// This tag will be passed into our tier
public static final TagKey<Block> INCORRECT_FOR_COPPER_TOOL = TagKey.create(BuiltInRegistries.BLOCK.key(), new ResourceLocation(MOD_ID, "incorrect_for_cooper_tool"));
```

이제 태그에 블록들을 추가하세요. 예를 들어 구리 도구로 금광석, 금 블록, 레드스톤 광석을 캐려면 파일 `src/main/resources/data/<모드 아이디>/tags/blocks/needs_copper_tool.json`을 만들고 아래 내용을 적습니다:

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

Then, for our tag to pass into the tier, we can provide a negative constraint for any tools that are incorrect for stone tools but within our copper tools tag. The tag file is located at `src/main/resources/data/mod_id/tags/blocks/incorrect_for_cooper_tool.json`:

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

Finally, we can pass our tag into our tier creation, as seen above.

If you want to check if a tool can make a block state drop its blocks, call `Tool#isCorrectForDrops`. The `Tool` can be obtained by calling `ItemStack#get` with `DataComponents#TOOL`.

## Custom Tools

Custom tools can be created by adding a `Tool` [data component][datacomponents] (via `DataComponents#TOOL`) to the list of default components on your item via `Item.Properties#component`. `DiggerItem` is an implementation which takes in a `Tier`, as explained above, to construct the `Tool`. `DiggerItem` also provides a convience method called `#createAttributes` to supply to `Item.Properties#attributes` for your tool, such as the modified attack damage and attack speed.

A `Tool` contains a list of `Tool.Rule`s, the default mining speed when holding the tool (`1` by default), and the amount of damage the tool should take when mining a block (`1` by default). A `Tool.Rule` contains three pieces of information: a `HolderSet` of blocks to apply the rule to, an optional speed at which to mine the blocks in the set, and an optional boolean at which to determine whether these blocks can drop from this tool. If the optional are not set, then the other rules will be checked. The default behavior if all rules fail is the default mining speed and that the block cannot be dropped.

:::note
A `HolderSet` can be created from a `TagKey` via `Registry#getOrCreateTag`.
:::

Creating a multitool-like item (i.e. an item that combines two or more tools into one, e.g. an axe and a pickaxe as one item) or any tool-like does not need to extend any of the existing `TieredItem`s. It simply can be implemented using a combination of the following parts:

- Adding a `Tool` with your own rules by setting `DataComponents#TOOL` via `Item.Properties#component`.
- Adding attributes to the item (e.g. attack damage, attack speed) via `Item.Properties#attributes`.
- Overriding `IItemExtension#canPerformAction` to determine what [`ToolAction`s][toolaction] the item can perform.
- Calling `IBlockExtension#getToolModifiedState` if you want your item to modify the block state on right click based on the `ToolAction`s.
- Adding your tool to some of the `minecraft:*_enchantable` tags so that your item can have certain enchantments applied to it, or `IItemExtension#canApplyAtEnchantingTable` to check if the enchantment can be applied at all.

## `ToolAction`

`ToolAction`은 도구의 기능을 표현하는 클래스입니다. 네오 포지는 `ToolActions`에 여러 기본 `ToolAction`들을 정의합니다:

- 블록 파괴용 기능들: 위 네 개의 `DiggerItem`, 검, 그리고 가위에 각각 하나씩 있음.
- 도끼 우클릭 기능들: 나무의 껍질을 벗김, 산회된 구리를 긁어냄, 구리의 밀랍 제거.
- 가위 우클릭 기능들: 꿀 수확, 호박 가공, 선 절단.
- 기타 기능들: 길 평탄화, 휘몰아치는 칼날, 경작지 다듬기, 방패로 막기, 낚시찌 던지기.

새로운 `ToolAction`을 추가하려면, `ToolAction#get`을 호출하세요 - 필요하다면 자동으로 새로운 `ToolAction`을 생성하고 등록합니다. 이후 새 도구 아이템에서 `IItemExtension#canPerformAction`을 재정의 하세요.

`ItemStack`이 특정 `ToolAction`을 수행할 수 있는지 확인하려면 `IItemStackExtension#canPerformAction`을 호출하세요. 이 메서드는 도구뿐 아니라 모든 아이템에 사용할 수 있습니다.

## 갑옷

Similar to tools, armor uses a tier system (although a different one). What is called `Tier` for tools is called `ArmorMaterial` for armors. Like above, this example shows how to add copper armor; this can be adapted as needed. However, unlike `Tier`s, `ArmorMaterial`s need to be [registered]. For the vanilla values, see the `ArmorMaterials` class.

```java
// We place copper somewhere between chainmail and iron.
public static final ArmorMaterial COPPER_ARMOR_MATERIAL = new ArmorMaterial(
    // Determines the defense value of this armor material, depending on what armor piece it is.
    Util.make(new EnumMap<>(ArmorItem.Type.class), map -> {
        map.put(ArmorItem.Type.BOOTS, 2);
        map.put(ArmorItem.Type.LEGGINGS, 4);
        map.put(ArmorItem.Type.CHESTPLATE, 6);
        map.put(ArmorItem.Type.HELMET, 2);
        map.put(ArmorItem.Type.BODY, 4);
    }),
    // Determines the enchantability of the tier. This represents how good the enchantments on this armor will be.
    // Gold uses 25, we put copper slightly below that.
    20,
    // Determines the sound played when equipping this armor.
    // This is wrapped with a Holder.
    SoundEvents.ARMOR_EQUIP_GENERIC,
    // Determines the repair item for this armor.
    () -> Ingredient.of(Tags.Items.INGOTS_COPPER),
    // Determines the texture locations of the armor to apply when rendering
    // This can also be specified by overriding 'IItemExtension#getArmorTexture' on your item if the armor texture needs to be more dynamic
    List.of(
        // Creates a new armor texture that will be located at:
        // - 'assets/mod_id/textures/models/armor/copper_layer_1.png' for the outer texture
        // - 'assets/mod_id/textures/models/armor/copper_layer_2.png' for the inner texture (only legs)
        new ArmorMaterial.Layer(
            new ResourceLocation(MOD_ID, "copper")
        ),
        // Creates a new armor texture that will be rendered on top of the previous at:
        // - 'assets/mod_id/textures/models/armor/copper_layer_1_overlay.png' for the outer texture
        // - 'assets/mod_id/textures/models/armor/copper_layer_2_overlay.png' for the inner texture (only legs)
        // 'true' means that the armor material is dyeable; however, the item must also be added to the 'minecraft:dyeable' tag
        new ArmorMaterial.Layer(
            new ResourceLocation(MOD_ID, "copper"), "_overlay", true
        )
    ),
    // Returns the toughness value of the armor. The toughness value is an additional value included in
    // damage calculation, for more information, refer to the Minecraft Wiki's article on armor mechanics:
    // https://minecraft.wiki/w/Armor#Armor_toughness
    // Only diamond and netherite have values greater than 0 here, so we just return 0.
    0,
    // Returns the knockback resistance value of the armor. While wearing this armor, the player is
    // immune to knockback to some degree. If the player has a total knockback resistance value of 1 or greater
    // from all armor pieces combined, they will not take any knockback at all.
    // Only netherite has values greater than 0 here, so we just return 0.
    0
);
```

이후 갑옷 재질을 갑옷 아이템 등록에 사용하시면 됩니다.

```java
//ITEMS은 DeferredRegister<Item>
public static final Supplier<ArmorItem> COPPER_HELMET = ITEMS.register("copper_helmet", () -> new ArmorItem(
        // 사용할 갑옷 재질.
        COPPER_ARMOR_MATERIAL,
        // 갑옷 착용부.
        ArmorItem.Type.HELMET,
        // The item properties where we set the durability.
        // ArmorItem.Type is an enum of five values: HELMET, CHESTPLATE, LEGGINGS, BOOTS, and BODY.
        // BODY is used for non-player entities like wolves or horses.
        // Vanilla armor materials determine this by using a base value and multiplying it with a type-specific constant.
        // The constants are 13 for BOOTS, 15 for LEGGINGS, 16 for CHESTPLATE, 11 for HELMET, and 16 for BODY.
        // If we don't want to use these ratios, we can set the durability normally.
        new Item.Properties().durability(ArmorItem.Type.HELMET.getDurability(15))
));
public static final Supplier<ArmorItem> COPPER_CHESTPLATE = ITEMS.register("copper_chestplate", () -> new ArmorItem(...));
public static final Supplier<ArmorItem> COPPER_LEGGINGS = ITEMS.register("copper_leggings", () -> new ArmorItem(...));
public static final Supplier<ArmorItem> COPPER_BOOTS = ITEMS.register("copper_boots", () -> new ArmorItem(...));
```

갑옷 텍스쳐 제작 시 텍스쳐의 어느 부분이 어디로 가는지 확인하기 위해 마인크래프트의 다른 갑옷 텍스쳐와 비교하며 작업하시는 것을 권장드립니다.

[block]: ../blocks/index.md
[datacomponents]: ./datacomponents.md
[item]: index.md
[toolaction]: #toolactions
[tags]: ../resources/server/tags.md
[registered]: ../concepts/registries.md#methods-for-registering
