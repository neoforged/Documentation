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
        // 도구의 수준. 값으로 정수만 사용할 수 있어 돌과 철 사이로 조절하는 것은 불가능.
        // 이는 TierSortingRegistry를 대신 사용해야 함. 자세한 사항은 아래를 참고. 여기선 임의로 돌과 동일한 수준을 사용.
        // 돌은 1, 철은 2.
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
        // 티어로 부술 수 있는 블록을 표시할 태그. 자세한 사항은 아래를 참고.
        MyBlockTags.NEEDS_COPPER_TOOL,
        // 도구 수리에 필요한 재료. 지연 초기화를 위해 Supplier를 사용.
        () -> Ingredient.of(Tags.Items.INGOTS_COPPER)
);
```

다른 예제는 마인크래프트의 `Tiers`를 참고하세요.

이제 새로운 티어를 추가했으니, 이 티어를 가지는 도구들도 추가합니다. 모든 도구들은 생성자의 인자가 동일합니다:

```java
//ITEMS은 DeferredRegister<Item>
public static final Supplier<SwordItem> COPPER_SWORD = ITEMS.register("copper_sword", () -> new SwordItem(
        // 사용할 티어.
        COPPER_TIER,
        // 도구 자체의 추가 대미지. 검은 3, 삽은 1.5, 곡괭이는 1, 괭이와 도끼는 저마다 다름.
        3,
        // 도구 자체의 추가 공격 속도. 기본 공격 속도는 4, 공격 속도를 1.6f로 맞추기 위해 -2.4f를 사용함.
        // 검은 -2.4f, 삽은 -3f, 곡괭이는 -2.8f, 괭이와 도끼는 저마다 다름.
        -2.4f,
        // 아이템 속성값들. 내구도는 이미 Tier에서 지정했으니 설정할 필요 없음.
        new Item.Properties()
));
public static final Supplier<AxeItem> COPPER_AXE = ITEMS.register("copper_axe", () -> new AxeItem(...));
public static final Supplier<PickaxeItem> COPPER_PICKAXE = ITEMS.register("copper_pickaxe", () -> new PickaxeItem(...));
public static final Supplier<ShovelItem> COPPER_SHOVEL = ITEMS.register("copper_shovel", () -> new ShovelItem(...));
public static final Supplier<HoeItem> COPPER_HOE = ITEMS.register("copper_hoe", () -> new HoeItem(...));
```

### 태그

위에서 티어를 만들 때 태그를 사용했습니다. 티어가 부술 수 있는 블록은 [블록 태그][tags]로 구분합니다. 예를 들어 철 도구는 `minecraft:needs_iron_tool` 태그를 사용하며, 다이아몬드, 금광석 등을 포함합니다. 또,`minecraft:needs_diamond_tool` 태그는 흑요석과 고대 잔해 등을 포함합니다. 상위 티어는 지정하지 않아도 하위 티어의 블록들을 전부 캘 수 있어, 하위 티어의 태그 내용을 복사하지 않아도 됩니다.

필요하다면 다른 티어의 태그를 재사용하셔도 됩니다. 예를 들어 위에서 만든 구리 도구가 돌 도구와 같은 블록만 캔다면 `BlockTags.NEEDS_STONE_TOOL`을 사용합니다.

아니면 아래처럼 새로운 태그를 추가하세요:

```java
public static final TagKey<Block> NEEDS_COPPER_TOOL = TagKey.create(BuiltInRegistries.BLOCK.key(), new ResourceLocation(MOD_ID, "needs_copper_tool"));
```

이제 태그에 블록들을 추가하세요. 예를 들어 구리 도구로 금광석, 금 블록, 레드스톤 광석을 캐려면 파일 `src/main/resources/data/<모드 아이디>/tags/blocks/needs_copper_tool.json`을 만들고 아래 내용을 적습니다:

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

이제, 위 예시처럼 `NEEDS_COPPER_TOOL`를 티어에 전달합니다.

### `TierSortingRegistry`

티어간 순서를 더 유연히 조절하려면, `TierSortingRegistry`에 티어를 등록하세요. 티어는 아이템보다 먼저 등록되어야 하기에 아래처럼 `static` 블록을 사용하시는 것을 권장드립니다.

```java
public static final Tier COPPER_TIER = new SimpleTier(...);

static {
    TierSortingRegistry.registerTier(
            COPPER_TIER,
            // 티어를 구분하기 위한 이름. minecraft 네임스페이스를 사용해도 됨.
            new ResourceLocation("minecraft", "copper"),
            // 하위 티어들. 돌은 구리보다 낮은 티어임.
            // 나무와 철은 이미 돌보다 낮으니 리스트에 포함할 필요 없음.
            List.of(Tiers.STONE),
            // 상위 티어들. 철은 구리보다 높은 티어임.
            // 다이아몬드와 네더라이트는 이미 철보다 높으니 리스트에 포함할 필요 없음.
            List.of(Tiers.IRON)
    );
}
```

위 리스트는 `Tier` 말고도, 티어의 이름도 포함할 수 있습니다. 예를 들어 구리가 철과 [메카니즘][mektools]의 Osmium보다 약하다면 아래처럼 지정하세요:

```java
public static final Tier COPPER_TIER = new SimpleTier(...);

static {
    TierSortingRegistry.registerTier(
            COPPER_TIER,
            new ResourceLocation("minecraft", "copper"),
            List.of(Tiers.STONE),
            // 아래 리스트에 Tier랑 ResourceLocation을 섞어 담아도 됨.
            List.of(Tiers.IRON, new ResourceLocation("mekanism", "osmium"))
    );
}
```

상위 티어와 하위 티어 모두 위처럼 리스트를 활용합니다. 티어의 순서가 여러 번 지정된다면 그중 가장 엄격한 범위를 사용합니다.

:::caution
위 레지스트리는 잘못하면 순환 종속성을 유발할 수 있습니다, 그러니 티어 순서가 말이 되는지, 순환 참조는 없는지 확인하세요.
:::

만약 블록을 특정 티어로 파괴 가능한지 확인하려면 `TierSortingRegistry#isCorrectTierForDrops`를 호출하세요.

## 새로운 종류의 도구

망치나 낫같이 새로운 종류의 도구는 `DiggerItem` (무기의 경우 `TieredItem`)을 확장해 만들 수 있습니다. 

`DiggerItem`의 생성자 인자 중 처음 네 개는 위에서 다룬 것과 동일하나, 다섯 번째 인자는 도구의 `mineable` 태그를 받습니다. 이 태그는 일반적으로 `<모드 아이디>:mineable/<도구 이름>` 형식입니다. 만약 다른 모드도 같은 종류의 도구를 추가할 것 같다면 네임 스페이스로 모드 아이디 말고 `forge`를 대신 사용하세요. 예를 들어 [Farmer's Delight][farmersdelight]는 칼의 태그로 `forge:mineable/knives`를 사용합니다.

만약 여러 도구의 역할을 할 수 있는 아이템을 만든다면 (예를 들어 동시에 곡괭이와 도끼로 사용할 수 있는 아이템이라면), `AxeItem`을 확장하는 것을 권장드립니다, 왜냐하면 날카로움이나 밀치기 같은 인첸트들이 도끼에도 동작하기 때문입니다.

## `ToolAction`

`ToolAction`은 도구의 기능을 표현하는 클래스입니다. 네오 포지는 `ToolActions`에 여러 기본 `ToolAction`들을 정의합니다:

- 블록 파괴용 기능들: 위 네 개의 `DiggerItem`, 검, 그리고 가위에 각각 하나씩 있음.
- 도끼 우클릭 기능들: 나무의 껍질을 벗김, 산회된 구리를 긁어냄, 구리의 밀랍 제거.
- 가위 우클릭 기능들: 꿀 수확, 호박 가공, 선 절단.
- 기타 기능들: 길 평탄화, 휘몰아치는 칼날, 경작지 다듬기, 방패로 막기, 낚시찌 던지기.

새로운 `ToolAction`을 추가하려면, `ToolAction#get`을 호출하세요 - 필요하다면 자동으로 새로운 `ToolAction`을 생성하고 등록합니다. 이후 새 도구 아이템에서 `IItemExtension#canPerformAction`을 재정의 하세요.

`ItemStack`이 특정 `ToolAction`을 수행할 수 있는지 확인하려면 `IItemStackExtension#canPerformAction`을 호출하세요. 이 메서드는 도구뿐 아니라 모든 아이템에 사용할 수 있습니다.

## 갑옷

도구처럼 갑옷도 티어와 유사한 시스템을 사용합니다. 갑옷은 `Tier` 대신 갑옷 재질(`ArmorMaterial`)을 사용합니다. 예시로 구리 갑주를 추가해 보겠습니다; 필요에 따라 값들을 수정하세요. 마인크래프트의 `ArmorMaterials`를 참고해 값을 어느 정도로 조절할지 참고하실 수 있습니다.

```java
// 구리를 사슬과 철 사이 정도로 조절할 것.
public static final ArmorMaterial COPPER_ARMOR_MATERIAL = new ArmorMaterial() {
    // 갑옷 재질의 이름. 주로 갑옷의 텍스쳐를 찾을 때 사용함.
    // 아래처럼 이름에 모드 아이디를 포함하는 것이 좋음, 그렇지 않으면 다른 모드에서 같은 재질을 추가하면
    // 겹칠 수 있음. 모드 아이디 누락 시 "minecraft" 네임 스페이스를 대신 사용함.
    @Override
    public String getName() {
        return "modid:copper";
    }

    // StringRepresentable의 메서드 재정의. 대개 getName()과 같은 값을 반환함.
    @Override
    public String getSerializedName() {
        return getName();
    }

    // 갑옷 재질의 내구도. 갑옷 착용부에 따라 다른 값을 사용할 수 있음.
    // 갑옷 착용부는 ArmorItem.Type 열거형에 정의되어 네 가지 값이 존재함: HELMET, CHESTPLATE, LEGGINGS, BOOTS.
    // 마인크래프트는 착용부 자체의 내구도와 재질의 내구도를 곱한 값을 반환함.
    // 부츠는 13, 각반은 15, 흉갑은 16, 헬멧은 11.
    // 사슬과 철의 재질 내구도는 15 임으로 아래서도 15를 사용함.
    @Override
    public int getDurabilityForType(ArmorItem.Type type) {
        return switch (type) {
            case HELMET -> 11 * 15;
            case CHESTPLATE -> 16 * 15;
            case LEGGINGS -> 15 * 15;
            case BOOTS -> 13 * 15;
        };
    }

    // 갑옷 재질의 방어도. 갑옷 착용부에 따라 다른 값을 사용할 수 있음.
    @Override
    public int getDurabilityForType(ArmorItem.Type type) {
        return switch (type) {
            case HELMET -> 2;
            case CHESTPLATE -> 4;
            case LEGGINGS -> 6;
            case BOOTS -> 2;
        };
    }

    // 갑옷 재질의 단단함. 단단함은 피해량 연산 시에 사용되는 또 다른 값으로, 자세한 사항은 아래를 참고할 것:
    // https://ko.minecraft.wiki/w/%EA%B0%91%EC%98%B7#%EA%B0%91%EC%98%B7%EC%9D%98_%EB%8B%A8%EB%8B%A8%ED%95%A8
    // 오직 다이아몬드와 네더라이트만 0보다 큰 값을 사용하니, 여기선 0을 반환함.
    @Override
    public float getToughness() {
        return 0;
    }

    // 갑옷 재질의 밀치기 저항력. 만약 아래 값이 1 이상일 경우 밀쳐지는 것이 불가능함.
    // 오직 네더라이트만 0보다 큰 값을 사용하니, 여기선 0을 반환함.
    @Override
    public float getKnockbackResistance() {
        return 0;
    }

    // 갑옷 재질의 마법 부여 가중치. 높을수록 좋은 인첸트가 잘 나옴.
    // 금은 25를 사용하니, 여기선 그보다 조금 작은 값을 반환함.
    @Override
    public int getEnchantmentValue(ArmorItem.Type type) {
        return 20;
    }

    // 갑옷 착용 시 재생할 소리.
    @Override
    public SoundEvent getEquipSound() {
        return SoundEvents.ARMOR_EQUIP_GENERIC;
    }

    // 갑옷 수리에 필요한 재료.
    @Override
    public Ingredient getRepairIngredient() {
        return Ingredient.of(Tags.Items.INGOTS_COPPER);
    }
}
```

이후 갑옷 재질을 갑옷 아이템 등록에 사용하시면 됩니다.

```java
//ITEMS은 DeferredRegister<Item>
public static final Supplier<ArmorItem> COPPER_HELMET = ITEMS.register("copper_helmet", () -> new ArmorItem(
        // 사용할 갑옷 재질.
        COPPER_ARMOR_MATERIAL,
        // 갑옷 착용부.
        ArmorItem.Type.HELMET,
        // 아이템 속성값들. 내구도는 이미 ArmorItem이 지정하니 설정할 필요 없음.
        new Item.Properties()
));
public static final Supplier<ArmorItem> COPPER_CHESTPLATE = ITEMS.register("copper_chestplate", () -> new ArmorItem(...));
public static final Supplier<ArmorItem> COPPER_LEGGINGS = ITEMS.register("copper_leggings", () -> new ArmorItem(...));
public static final Supplier<ArmorItem> COPPER_BOOTS = ITEMS.register("copper_boots", () -> new ArmorItem(...));
```

갑옷은 아이템의 텍스쳐뿐 아니라 착용 시 플레이어 위에 그릴 텍스쳐도 필요합니다. 각반을 제외한 다른 갑주는 `src/main/resources/assets/<모드 아이디>/textures/models/armor/<재질 이름>_layer_1.png`를 사용하고, 각반은 같은 경로에 `<재질 이름>_layer_2.png`를 사용합니다. 필요하다면 `IItemExtension#getArmorTexture`를 재정의하여 텍스쳐의 위치를 바꿀 수 있습니다.

갑옷 텍스쳐 제작 시 텍스쳐의 어느 부분이 어디로 가는지 확인하기 위해 마인크래프트의 다른 갑옷 텍스쳐와 비교하며 작업하시는 것을 권장드립니다.

[block]: ../blocks/index.md
[farmersdelight]: https://www.curseforge.com/minecraft/mc-mods/farmers-delight
[item]: index.md
[mektools]: https://www.curseforge.com/minecraft/mc-mods/mekanism-tools
[tags]: ../resources/server/tags.md
