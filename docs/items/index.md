# 아이템

아이템은 블록들과 마찬가지로 모드의 핵심이 되는 요소입니다. 블록이 플레이어 주변의 레벨을 구성한다면 아이템은 플레이어의 인벤토리를 구성합니다.

## 아이템이 정확히 무엇인가요?

아이템에 대해 자세히 다루기 이전 아이템이 정확히 무엇인지 이해하고, [블록][block]과 엔티티와의 차이점을 숙지하는 것이 중요합니다. 아래 예시를 통해 설명하자면:

- 월드에 배치된 흙은 **블록**입니다. (정확히는 블록의 상태입니다. 자세한 사항은 [여기][blockstates]를 참고하세요.)
  - 모든 블록이 파괴되었을 때 아이템이 나오진 않습니다 (예: 나뭇잎), 자세한 사항은 [노획물 목록][loottables]을 참고하세요.
- 흙 블록은 [파괴][breaking]된 이후에야 사라지며 (= 공기 블록으로 대체되며), 흙이 나옵니다. 이때 나온 흙은 아이템 **엔티티**입니다, 돼지나 좀비와 동일하게 동작하고 물로 밀거나 용암으로 태울 수 있습니다. 
- 흙의 아이템 엔티티를 줍고 나면 **아이템 스택**이 되어 인벤토리에 들어갑니다. 아이템 스택은, 간단하게 말해서, 인벤토리 창에서 한 칸 안에 들어가 있는 것입니다. 개수, 내구도, 인첸트 등의 추가 정보를 담습니다.
- 아이템 스택의 기능은 자신의 **아이템**에서 나옵니다. 아이템은 모든 아이템 스택마다 동일한 정보 및 기능을 구현할 때 사용하고 (예를 들어, 모든 철검은 최대 250의 내구도를 가집니다), 아이템 스택은 각 아이템마다 다를 수 있는 정보를 담을 때 사용합니다 (예를 들어, 철검 하나는 내구도가 100이 남아 있을 때 다른 철검은 200이 남아 있을 수 있습니다). 아이템과 아이템 스택의 기능상 차이는 아래에서 더 자세히 다루겠습니다.
  - 아이템과 아이템 스택의 관계는 [`Block`][block]과 [`BlockState`][blockstates]와 비슷합니다, `BlockState`의 기능은 `Block`에서 정의합니다. 정확한 비유는 아니지만 (각 블록의 상태는 유일하다는 차이가 있음), 그래도 아래 내용을 이해하는데 도움을 줍니다.

## 아이템 만들기

이제 아이템이 무엇인지 알았으니 하나 만들어 보도록 하겠습니다.

블록과 유사하게, 나무 막대기나 설탕과 같은 단순한 아이템은 `Item` 클래스를 바로 사용하시면 됩니다. 아이템 레지스트리를 구성할 때, 새로운 아이템을 `Item$Properties`를 인자로 사용해 생성하여 등록하시면 됩니다. `Item#Properties`는 `#of` 함수로 생성할 수 있으며, 아래 메서드들을 호출해 세부 사항을 설정할 수 있습니다:

- `stacksTo` - 아이템을 합칠 수 있는 최대 크기 지정. 64가 기본값. 엔더 진주와 같이 16개만 합쳐지는 아이템에서 사용.
- `durability` - 해당 아이템의 최대 내구도 지정. 0이 기본값. 만약 내구도가 0이라면 나무 막대기와 같이 내구도가 존재하지 않음. 내구도가 있는 아이템은 합칠 수 없음.
- `craftRemainder` - 아이템을 조합에 사용한 이후 남을 아이템 지정. 케이크 제작 시 우유 양동이가 있던 자리에 빈 양동이를 두기 위해 사용함.
- `fireResistant`- 해당 아이템의 엔티티가 불에 타지 않도록 함. 네더라이트 아이템들이 사용함.
- `setNoRepair` - 	아이템을 수리 불가능하게 만듦. 바닐라 마인크래프트에서 사용하지 않음.
- `requiredFeatures` - 크리에이티브 탭에서 해당 아이템이 표시되기 위해 필요한 `FeatureFlag` 지정. 바닐라 마인크래프트에선 개발 중인 기능을 잠가두기 위해 사용함. 잠가진 기능을 사용하는 것이 아니라면 이를 사용하는 것은 권장되지 않음.

위 메서드들의 사용 예시는 `Items` 클래스에서 찾아보실 수 있습니다.

### 음식

`Item` 클래스는 기본적으로 음식의 기능도 제공합니다; 단순한 음식을 제작하신다면 새로운 아이템 클래스를 작성하지 않으셔도 됩니다. 아이템을 섭취 가능하게 만드시려면 `Item$Properties#food`에 `FoodProperties`를 전달해 호출하시면 됩니다.

`FoodProperties`는 `FoodProperties#Builder`로 생성합니다. 아래 메서드들을 호출해 세부 사항을 설정하실 수 있습니다:

- `nutrition` - 음식의 영양(nutrition)을 설정함. 섭취 시 허기 값이 얼마나 올라가는지 결정하며, 허기 값은 반칸당 1 임. 예를 들어 마인크래프트의 스테이크는 섭취 시 4칸이 차며, 8의 영양 값을 가지고 있음.
- `saturationMod` - 음식 섭취 시 포만감 증가 연산에 사용할 계수를 설정함. 증가되는 포만감은 `min(2 * nutrition * saturationMod, playerNutrition)`으로 계산됨. 예를 들어 `saturationMod` 값이 `0.5`라면, 음식의 포만도 값은 영양 값과 동일함.
- `meat` - 아이템이 고기인지 아닌지 설정함. 예를 들어 음식이 늑대 치료에 사용 가능한지 확인하는 데 사용됨.
- `alwaysEat` - 플레이어가 배부르더라도 음식을 섭취할 수 있는지 설정함. `false`가 기본값. `true`로 설정 시 황금 사과처럼 언제나 먹을 수 있음.
- `fast` - 음식을 빠르게 섭취할 수 있는지 설정함. `false`가 기본값. 말린 켈프는 `true`를 사용함.
- `effect` - 음식 섭취 시 추가할 [`MobEffectInstance`][mobeffectinstance]를 설정함. 메서드의 두 번째 인자는 해당 효과가 추가될 확률을 설정함. 예를 들어 썩은 살점은 80%의 확률로 허기 효과를 부여하며, 확률값으로 `0.8`을 사용함. `effect` 메서드는 두 개가 존재하는데, 그중 `Supplier<MobEffectInstance>`를 인자로 받는 것을 사용할 것, 나머지는 클래스를 불러오는 순서가 꼬이면 오류가 날 수 있음.
- `build` - 모든 세부 사항을 설정한 이후 `FoodProperties`를 생성할 때 사용함.

위 메서드들의 사용 예시는 `Foods` 클래스에서 찾아보실 수 있습니다.

아이템의 `FoodProperties`는 `Item#getFoodProperties(ItemStack, LivingEntity)`를 호출해 얻으실 수 있습니다. 만약 해당 아이템이 음식이 아니라면 null이 반환됩니다. 아이템이 음식인지 확인하려면 반환값을 null과 비교하시거나, `Item#isEdible()`을 호출하세요.

### 추가 기능 만들기

아이템에 추가 기능을 구현하시려면 `Item`의 자식 클래스를 작성하셔야 합니다. `Item` 클래스는 여러 상호작용 동작을 위해 재정의 할 수 있는 메서드가 많이 있습니다, 자세한 사항은 `Item` 또는 `IItemExtension`을 참고하세요.

가장 대표적인 아이템의 추가 기능은 왼 클릭, 그리고 우 클릭입니다. 왼 클릭은 [블록 파괴][breaking] 및 엔티티 공격하기 문서(작업 중)를, 우 클릭은 [상호작용 파이프라인][interactionpipeline]을 참고하세요.

### `DeferredRegister.Items`
// TODO

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

- 자신을 대표하는 `Item`. `itemstack.getItem()`으로 확인할 수 있음.
- 아이템의 개수. 대개 1~64 범위 값임, `itemstack.getCount()`로 확인, `itemstack.setCount(int)` 또는 `itemstack.shrink(int)`로 변경 가능.
- 추가 [NBT][nbt] 데이터, `itemstack.getTag()` 또는 `itemstack.getOrCreateTag()`로 확인 가능. 두 번째 메서드는 NBT 데이터가 없을 경우 생성함. 이외에도 `#hasTag`, `#setTag`와 같은 다른 NBT 관련 메서드가 존재함.
  - NBT 데이터가 있지만 비어 있는 `ItemStack`과, NBT 데이터가 없는 `ItemStack`은 기능상 동일하나 다른 아이템으로 취급되어 쌓아 올릴 수 없습니다.

새로운 `ItemStack`은 `new ItemStack(Item)`으로 생성할 수 있습니다, 여기서 전달하는 `Item`은 아이템 스택의 기능을 정의하는 아이템입니다. 기본적으로 새로 생성된 아이템 스택은 NBT 데이터가 없고 개수가 1개입니다. 필요하다면 NBT 데이터와 개수도 인자로 받는 생성자를 대신 사용하실 수도 있습니다.

`ItemStack`의 데이터는 변경될 수 있습니다 (아래 참고), 하지만 데이터를 변경하면 안 되는 특수한 상황이 몇몇 있습니다. 이런 상황에서 `ItemStack`의 데이터를 변경하려면 `itemstack.copy()`를 통해 먼저 복사한 다음에 변경하세요.

비어있는 아이템 스택을 표현하시려면 `ItemStack.EMPTY`를 사용하세요. 아이템이 비어있는지 확인하시려면 `itemstack.isEmpty()`를 호출하세요.

### `ItemStack`의 가변성

`ItemStack`의 데이터는 변경될 수 있습니다. `setCount`, `setTag`, 또는 `getOrCreateTag` 등을 호출하면, `ItemStack` 자체가 변경됩니다. 마인크래프트는 이 특성을 적극적으로 응용합니다, 예를 들어 `itemstack.split(int)`는 전달된 정수만큼 아이템 스택의 개수를 감소시켜, 기존 `ItemStack`을 수정함과 동시에 새로운 `ItemStack`을 반환합니다.

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
    if(event.getTabKey() == CreativeModeTabs.INGREDIENTS){
        event.accept(MyItemsClass.MY_ITEM);
        // #accepts는 ItemLike를 인자로 받아 블록 또한 등록할 수 있음. 이때 전달된 블록은 대응되는 아이템이 존재해야 함.
        event.accept(MyBlocksClass.MY_BLOCK);
    }
}
```

이 이벤트는 활성화된 `FeatureFlag`들을 반환하는 `getFlags()`, 사용자가 관리자 권한이 있는지 알려주는 `hasPermissions` 등의 추가 정보도 담고 있습니다. 

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
        output.accept(MyItemsClass.MY_ITEM);
        // #accepts는 ItemLike를 인자로 받아 블록 또한 등록할 수 있음. 이때 전달된 블록은 대응되는 아이템이 존재 해야 함.
        output.accept(MyBlocksClass.MY_BLOCK);
    })
    .build()
);
```

[block]: ../blocks/index.md
[blockstates]: ../blocks/states.md
[breaking]: ../blocks/index.md#블록-파괴
[creativetabs]: #크리에이티브-탭
[food]: #음식
[hunger]: https://ko.minecraft.wiki/w/%EB%B0%B0%EA%B3%A0%ED%94%94#%EC%9E%91%EB%8F%99_%EC%9B%90%EB%A6%AC
[interactionpipeline]: interactionpipeline.md
[loottables]: ../resources/server/loottables.md
[mobeffectinstance]: mobeffects.md#mobeffectinstances
[modbus]: ../concepts/events.md#event-buses
[nbt]: ../datastorage/nbt.md
[registering]: ../concepts/registries.md#객체-등록하기
[resources]: ../resources/client/index.md
[sides]: ../concepts/sides.md
