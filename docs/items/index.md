# 아이템

아이템은 블록들과 마찬가지로 모드의 핵심이 되는 요소입니다. 블록이 플레이어 주변의 레벨을 구성한다면 아이템은 플레이어의 인벤토리를 구성합니다.

## 아이템이 정확히 무엇인가요?

아이템에 대해 자세히 다루기 이전 아이템이 정확히 무엇인지 이해하고, [블록][block]과 엔티티와의 차이점을 숙지하는 것이 중요합니다. 아래 예시를 통해 설명하자면:

- In the world, you encounter a dirt block and want to mine it. This is a **block**, because it is placed in the world. (Actually, it is not a block, but a blockstate. See the [Blockstates article][blockstates] for more detailed information.)
  - Not all blocks drop themselves when breaking (e.g. leaves), see the article on [loot tables][loottables] for more information.
- Once you have [mined the block][breaking], it is removed (= replaced with an air block) and the dirt drops. The dropped dirt is an item **entity**. This means that like other entities (pigs, zombies, arrows, etc.), it can inherently be moved by things like water pushing on it, or burned by fire and lava.
- Once you pick up the dirt item entity, it becomes an **item stack** in your inventory. An item stack is, simply put, an instance of an item with some extra information, such as the stack size.
- Item stacks are backed by their corresponding **item** (which is what we're creating). Items hold [data components][datacomponents] that contains the default information all items stacks are initialized to (for example, every iron sword has a max durability of 250), while item stacks can modify those data components, allowing two different stacks for the same item to have different information (for example, one iron sword has 100 uses left, while another iron sword has 200 uses left). For more information on what is done through items and what is done through item stacks, read on.
  - The relationship between items and item stacks is roughly the same as between [blocks][block] and [blockstates][blockstates], in that a blockstate is always backed by a block. It's not a really accurate comparison (item stacks aren't singletons, for example), but it gives a good basic idea about what the concept is here.

## 아이템 만들기

이제 아이템이 무엇인지 알았으니 하나 만들어 보도록 하겠습니다.

블록과 유사하게, 나무 막대기나 설탕과 같은 단순한 아이템은 `Item` 클래스를 바로 사용하시면 됩니다. 아이템 레지스트리를 구성할 때, 새로운 아이템을 `Item$Properties`를 인자로 사용해 생성하여 등록하시면 됩니다. `Item#Properties`는 `#of` 함수로 생성할 수 있으며, 아래 메서드들을 호출해 세부 사항을 설정할 수 있습니다:

- `stacksTo` - Sets the max stack size (via `DataComponents#MAX_STACK_SIZE`) of this item. Defaults to 64. Used e.g. by ender pearls or other items that only stack to 16.
- `durability` - Sets the durability (via `DataComponents#MAX_DAMAGE`) of this item and the initial damge to 0 (via `DataComponents#DAMAGE`). Defaults to 0, which means "no durability". For example, iron tools use 250 here. Note that setting the durability automatically locks the max stack size to 1.
- `craftRemainder` - Sets the crafting remainder of this item. Vanilla uses this for filled buckets that leave behind empty buckets after crafting.
- `fireResistant` - Makes item entities that use this item immune to fire and lava (via `DataComponents#FIRE_RESISTANT`). Used by various netherite items.
- `setNoRepair` - Disables anvil and crafting grid repairing for this item. Unused in vanilla.
- `rarity` - Sets the rarity of this item (via `DataComponents#RARITY`). Currently, this simply changes the item's color. `Rarity` is an enum consisting of the four values `COMMON` (white, default), `UNCOMMON` (yellow), `RARE` (aqua) and `EPIC` (light purple). Be aware that mods may add more rarity types.
- `requiredFeatures` - Sets the required feature flags for this item. This is mainly used for vanilla's feature locking system in minor versions. It is discouraged to use this, unless you're integrating with a system locked behind feature flags by vanilla.
- `food` - Sets the [`FoodProperties`][food] of this item (via `DataComponents#FOOD`).

위 메서드들의 사용 예시는 `Items` 클래스에서 찾아보실 수 있습니다.

### 음식

`Item` 클래스는 기본적으로 음식의 기능도 제공합니다; 단순한 음식을 제작하신다면 새로운 아이템 클래스를 작성하지 않으셔도 됩니다. 아이템을 섭취 가능하게 만드시려면 `Item$Properties#food`에 `FoodProperties`를 전달해 호출하시면 됩니다.

`FoodProperties`는 `FoodProperties#Builder`로 생성합니다. 아래 메서드들을 호출해 세부 사항을 설정하실 수 있습니다:

- `nutrition` - 음식의 영양(nutrition)을 설정함. 섭취 시 허기 값이 얼마나 올라가는지 결정하며, 허기 값은 반칸당 1 임. 예를 들어 마인크래프트의 스테이크는 섭취 시 4칸이 차며, 8의 영양 값을 가지고 있음.
- `saturationMod` - 음식 섭취 시 포만감 증가 연산에 사용할 계수를 설정함. 증가되는 포만감은 `min(2 * nutrition * saturationMod, playerNutrition)`으로 계산됨. 예를 들어 `saturationMod` 값이 `0.5`라면, 음식의 포만도 값은 영양 값과 동일함.
- `alwaysEdible` - 플레이어가 배부르더라도 음식을 섭취할 수 있는지 설정함. `false`가 기본값. `true`로 설정 시 황금 사과처럼 언제나 먹을 수 있음.
- `fast` - 음식을 빠르게 섭취할 수 있는지 설정함. `false`가 기본값. 말린 켈프는 `true`를 사용함.
- `effect` - 음식 섭취 시 추가할 [`MobEffectInstance`][mobeffectinstance]를 설정함. 메서드의 두 번째 인자는 해당 효과가 추가될 확률을 설정함. 예를 들어 썩은 살점은 80%의 확률로 허기 효과를 부여하며, 확률값으로 `0.8`을 사용함. `effect` 메서드는 두 개가 존재하는데, 그중 `Supplier<MobEffectInstance>`를 인자로 받는 것을 사용할 것, 나머지는 클래스를 불러오는 순서가 꼬이면 오류가 날 수 있음.
- `build` - 모든 세부 사항을 설정한 이후 `FoodProperties`를 생성할 때 사용함.

위 메서드들의 사용 예시는 `Foods` 클래스에서 찾아보실 수 있습니다.

To get the `FoodProperties` for an item, call `Item#getFoodProperties(ItemStack, LivingEntity)`. This may return null, since not every item is edible. To determine whether an item is edible, call `Item#isEdible()` or null-check the result of the `getFoodProperties` call.

### 추가 기능 만들기

아이템에 추가 기능을 구현하시려면 `Item`의 자식 클래스를 작성하셔야 합니다. `Item` 클래스는 여러 상호작용 동작을 위해 재정의 할 수 있는 메서드가 많이 있습니다, 자세한 사항은 `Item` 또는 `IItemExtension`을 참고하세요.

가장 대표적인 아이템의 추가 기능은 왼 클릭, 그리고 우 클릭입니다. 왼 클릭은 [블록 파괴][breaking] 및 엔티티 공격하기 문서(작업 중)를, 우 클릭은 [상호작용 파이프라인][interactionpipeline]을 참고하세요.

### `DeferredRegister.Items`

All registries use `DeferredRegister` to register their contents, and items are no exceptions. However, due to the fact that adding new items is such an essential feature of an overwhelming amount of mods, NeoForge provides the `DeferredRegister.Items` helper class that extends `DeferredRegister<Item>` and provides some item-specific helpers:

```java
public static final DeferredRegister.Items ITEMS = DeferredRegister.createItems(ExampleMod.MOD_ID);

public static final Supplier<Item> EXAMPLE_ITEM = ITEMS.registerItem(
        "example_item",
        Item::new, // The factory that the properties will be passed into.
        new Item.Properties() // The properties to use.
);
```

Internally, this will simply call `ITEMS.register("example_item", () -> new Item(new Item.Properties()))` by applying the properties parameter to the provided item factory (which is commonly the constructor).

If you want to use `Item::new`, you can leave out the factory entirely and use the `simple` method variant:

```java
public static final Supplier<Item> EXAMPLE_ITEM = ITEMS.registerSimpleItem(
        "example_item",
        new Item.Properties() // The properties to use.
);
```

This does the exact same as the previous example, but is slightly shorter. Of course, if you want to use a subclass of `Item` and not `Item` itself, you will have to use the previous method instead.

Both of these methods also have overloads that omit the `new Item.Properties()` parameter:

```java
public static final Supplier<Item> EXAMPLE_ITEM = ITEMS.registerItem("example_item", Item::new);
// Variant that also omits the Item::new parameter
public static final Supplier<Item> EXAMPLE_ITEM = ITEMS.registerSimpleItem("example_item");
```

Finally, there's also shortcuts for block items:

```java
public static final Supplier<BlockItem> EXAMPLE_BLOCK_ITEM = ITEMS.registerSimpleBlockItem("example_block", ExampleBlocksClass.EXAMPLE_BLOCK, new Item.Properties());
// Variant that omits the properties parameter:
public static final Supplier<BlockItem> EXAMPLE_BLOCK_ITEM = ITEMS.registerSimpleBlockItem("example_block", ExampleBlocksClass.EXAMPLE_BLOCK);
// Variant that omits the name parameter, instead using the block's registry name:
public static final Supplier<BlockItem> EXAMPLE_BLOCK_ITEM = ITEMS.registerSimpleBlockItem(ExampleBlocksClass.EXAMPLE_BLOCK, new Item.Properties());
// Variant that omits both the name and the properties:
public static final Supplier<BlockItem> EXAMPLE_BLOCK_ITEM = ITEMS.registerSimpleBlockItem(ExampleBlocksClass.EXAMPLE_BLOCK);
```

:::note
If you keep your registered blocks in a separate class, you should classload your blocks class before your items class.
:::

### 리소스 제공하기

위에서 만드신 아이템은 아직 모델과 텍스쳐를 가지고 있지 않아 `/give` 또는 [크리에이티브 탭][creativetabs]에서 꺼내시면 생김새가 깨집니다.

아이템에 텍스쳐를 입히기 위해선 아이템의 모델 JSON과 텍스쳐 PNG 파일을 제공하셔야 합니다. 자세한 사항은 [리소스][resources]를 참고하세요.

## `ItemStack`

`Block`과 `BlockState`의 관계와 유사하게, `ItemStack`의 모든 기능은 `Item`이 구현합니다. `ItemStack`은 인벤토리에서 한 칸 안에 들어있는 것입니다. `BlockState`와 마찬가지로, `Item`의 메서드를 재정의 하면 이를 `ItemStack`을 통해 호출합니다, 그리고 `Item`의 메서드들은 대개 `ItemStack`을 인자로 받습니다.

`ItemStack`은 크게 세 가지로 구성되는데:

- The `Item` it represents, obtainable through `ItemStack#getItem`.
- The stack size, typically between 1 and 64, obtainable through `getCount` and changeable through `setCount` or `shrink`.
- The data components map, where stack-specific data is stored. Obtainable through `getComponents`. The components values are typically accessed and mutated via `has`, `get`, `set`, `update`, and `remove`.

새로운 `ItemStack`은 `new ItemStack(Item)`으로 생성할 수 있습니다, 여기서 전달하는 `Item`은 아이템 스택의 기능을 정의하는 아이템입니다. 기본적으로 새로 생성된 아이템 스택은 NBT 데이터가 없고 개수가 1개입니다. 필요하다면 NBT 데이터와 개수도 인자로 받는 생성자를 대신 사용하실 수도 있습니다.

`ItemStack`s are mutable objects (see below), however it is sometimes required to treat them as immutables. If you need to modify an `ItemStack` that is to be treated immutable, you can clone the stack using `#copy` or `#copyWithCount` if a specific stack size should be used.

비어있는 아이템 스택을 표현하시려면 `ItemStack.EMPTY`를 사용하세요. 아이템이 비어있는지 확인하시려면 `#isEmpty`를 호출하세요.

### `ItemStack`의 가변성

`ItemStack`s are mutable objects. This means that if you call for example `#setCount` or any data component map methods, the `ItemStack` itself will be modified. Vanilla uses the mutability of `ItemStack`s extensively, and several methods rely on it. For example, `#split` splits the given amount off the stack it is called on, both modifying the caller and returning a new `ItemStack` in the process.

하지만 다수의 아이템 스택을 다루는 상황에선 문제가 발생할 수 있는데, 특히 인벤토리를 다룰 땐 마우스 커서에 담은 아이템과 클릭한 아이템 칸을 동시에 다루기 때문에 더 까다롭습니다.

:::tip
잘 모르시겠다면 먼저 `#copy`로 복사하세요.
:::

## 크리에이티브 탭

아이템은 기본적으로 크리에이티브 탭에 등장하지 않아 `/give` 명령어로만 획득할 수 있습니다.

탭에 아이템을 추가하는 방법은 어디에 추가하느냐에 따라 달라집니다.

### 존재하는 탭에 추가하기

:::note
이 방법은 마인크래프트, 또는 다른 모드가 추가한 탭에 아이템을 추가할 때 사용합니다. 만약 직접 만드신 탭에 추가하시려면 아래를 참고하세요.
:::

아이템은 [모드 이벤트 버스][modbus]에 방송되는 `BuildCreativeModeTabContentsEvent`를 통해 `CreativeModeTab`에 추가될 수 있습니다. 이 이벤트는 [논리 클라이언트][sides]에서만 방송됩니다. `#accept`를 호출해 아이템을 추가할 수 있습니다.

```java
// ITEM이라는 RegistryObject<Item>과 BLOCK이라는 RegistryObject<Block>가 있다고 가정
@SubscribeEvent
public void buildContents(BuildCreativeModeTabContentsEvent event) {
    // 재료 탭에 아이템 추가
    if(event.getTabKey() == CreativeModeTabs.INGREDIENTS) {
        event.accept(MyItemsClass.MY_ITEM.get());
        // #accepts는 ItemLike를 인자로 받아 블록 또한 등록할 수 있음. 이때 전달된 블록은 대응되는 아이템이 존재해야 함.
        event.accept(MyBlocksClass.MY_BLOCK.get());
    }
}
```

이 이벤트는 활성화된 `FeatureFlag`들을 반환하는 `getFlags`, 사용자가 관리자 권한이 있는지 알려주는 `hasPermissions` 등의 추가 정보도 담고 있습니다. 

### 직접 크리에이티브 탭 만들기

`CreativeModeTab`은 레지스트리에 등록되어야 정상적으로 동작합니다. 새로운 크리에이티브 탭은 빌더를 통해 만들며, 이는 `#builder`를 호출해 생성합니다. 빌더를 통해 제목, 아이콘, 기본 아이템 등 여러 세부 사항을 설정하실 수 있습니다. 이뿐 아니라, 네오 포지는 라벨, 탭 이미지, 제목과 슬롯 색상, 탭 순서 등의 속성 또한 추가합니다.

```java
// REGISTER라는 DeferredRegister<CreativeModeTab>가 있다고 가정함
public static final RegistryObject<CreativeModeTab> EXAMPLE_TAB = REGISTER.register("example", () -> CreativeModeTab.builder()
    // 탭 이름 설정. 아래 번역 키의 텍스트 추가를 잊지 말 것!
    .title(Component.translatable("item_group."+MOD_ID+".example"))
    // 탭 아이콘 설정
    .icon(()->new ItemStack(ITEM.get()))
    // 기본 아이템 추가
    .displayItems((params,output) -> {
        output.accept(MyItemsClass.MY_ITEM.get());
        // #accepts는 ItemLike를 인자로 받아 블록 또한 등록할 수 있음. 이때 전달된 블록은 대응되는 아이템이 존재 해야 함.
        output.accept(MyBlocksClass.MY_BLOCK.get());
    })
    .build()
);
```

[block]: ../blocks/index.md
[blockstates]: ../blocks/states.md
[breaking]: ../blocks/index.md#breaking-a-block
[creativetabs]: #creative-tabs
[datacomponents]: ./datacomponents.md
[food]: #food
[hunger]: https://minecraft.wiki/w/Hunger#Mechanics
[interactionpipeline]: interactionpipeline.md
[loottables]: ../resources/server/loottables.md
[mobeffectinstance]: mobeffects.md#mobeffectinstances
[modbus]: ../concepts/events.md#event-buses
[registering]: ../concepts/registries.md#methods-for-registering
[resources]: ../resources/index.md#assets
[sides]: ../concepts/sides.md
