# 캐패빌리티

어떤 모드는 파이프를 추가하고, 어떤 모드는 새로운 창고를 추가하고, 어떤 모드는 아이템을 가공하는 기계를 추가합니다. 이 셋은 각각 다른 개발자가 만들었지만, 마치 마법같이 서로 호환이 됩니다. 캐패빌리티는 게임속 요소가 특정 기능을 수행할 수 있다고 알려, 모드들끼리 상호동작시키는 시스템입니다. 예시로 든 세 모드들은 각자 아이템을 다룰 수 있다고 알려, 상대가 무엇이 됐든 아이템을 전달할 수 있는 것입니다.

게임속 요소가 수행할 수 있는 기능은 인터페이스로 정의합니다. 네오 포지는 아이템이나 액체를 다루는 기능처럼 여러 모드에서 공통적으로 사용하는 기능을 이미 정의해 두었습니다. 자세한 사항은 아래를 참고하세요.

또한 네오 포지는 블록, 엔티티, 아이템 스택 등에 캐패빌리티 지원을 추가합니다. 각 타입마다 캐패빌리티를 사용하는 방법은 아래에서 자세히 다루겠습니다.

## 캐패빌리티를 쓰는 이유

캐패빌리티는 게임속 요소가 가진 **기능**과, 그 구체적인 **구현**을 서로 분리해, 누가 무엇을 어떻게 만들었냐에 관계 없이 서로 상호동작하기 위해 개발되었습니다. 캐패빌리티 사용하기 전 아래 세 가지를 고려하세요:

1. **구현**엔 관계없이, 요소의 **기능**만 신경 쓰면 되는가?
2. 해당 **기능**은 게임속 일부 요소만 가지고 있는가?
3. 무슨 블록, 무슨 엔티티냐에 따라 **구현**이 다를 수 있는가?

캐패빌리티 사용이 권장되는 상황은 다음과 같습니다:

- *"내가 만든 액체 컨테이너가 내구 구현과 상관없이 다른 모드의 액체를 저장할 수 있어야 한다."* - `IFluidHandler`를 쓰세요.
- *"엔티티가 가진 아이템의 개수를 새고 싶으나, 인벤토리가 어떻게 구현되었는지는 상관없다."* - `IItemHandler`를 쓰세요.
- *"아이템에 전력을 충전하고 싶지만 그 구체적인 구현과는 상관없다."* - `IEnergyStorage`를 쓰세요.
- *"플레이어가 바라보는 블록의 색상을 적용하고 싶지만 블록의 생김새가 어떻게 바뀔지는 모른다."* - 네오 포지가 자체적으로 색상 관련 인터페이스를 제공하진 않지만 직접 만드실 수 있습니다.

캐패빌리티 사용이 지양되는 상황은 다음과 같습니다:

- *"엔티티가 내가 만든 기계 근처에 있는지 확인하고 싶다."* - 캐패빌리티 말고 유틸리티 메서드 하나 만들어서 쓰세요.

## 네오 포지가 제공하는 캐패빌리티

네오 포지에는 기본적으로 다음 세 가지 인터페이스가 있습니다: `IItemHandler`, `IFluidHandler`, `IEnergyStorage`.

`IItemHandler`는 인벤토리와 아이템을 다루는 인터페이스입니다. 이를 지원하는 캐패빌리티들은:

- `Capabilities.ItemHandler.BLOCK`: 블록에 인벤토리 추가 (상자, 기계 등에 사용 가능).
- `Capabilities.ItemHandler.ENTITY`: 엔티티에 인벤토리 추가 (플레이어 인벤토리 확장, 엔티티 인벤토리/가방 등).
- `Capabilities.ItemHandler.ENTITY_AUTOMATION`: 자동화에 사용할 엔티티의 인벤토리 추가 (보트, 광산 수레 등).
- `Capabilities.ItemHandler.ITEM`: 아이템에 인벤토리 추가 (휴대용 가방 등).

`IFluidHandler`는 액체를 다루는 인터페이스입니다. 이를 지원하는 캐패빌리티들은:

- `Capabilities.FluidHandler.BLOCK`: 블록에 액체 인벤토리 추가.
- `Capabilities.FluidHandler.ENTITY`: 엔티티에 액체 인벤토리 추가.
- `Capabilities.FluidHandler.ITEM`: 아이템에 액체 인벤토리 추가. 이 캐패빌리티는 양동이도 지원하기 위해 `IFluidHandlerItem`을 대신 사용합니다.

`IEnergyStorage`는 에너지를 다루는 인터페이스입니다. TeamCoFH의 RedstoneFlux API를 기반으로 제작되었습니다. 이를 지원하는 캐패빌리티들은:

- `Capabilities.EnergyStorage.BLOCK`: 블록에 에너지 저장소 추가.
- `Capabilities.EnergyStorage.ENTITY`: 엔티티에 에너지 저장소 추가.
- `Capabilities.EnergyStorage.ITEM`: 아이템에 에너지 저장소 추가.

## 캐패빌리티 만들기

블록, 엔티티, 그리고 아이템은 캐패빌리티를 지원합니다.

캐패빌리티를 통해 특정 기능을 요청받아 사용할 수 있습니다. 네오 포지는 아래 캐패빌리티들을 추가합니다:

- `BlockCapability`: 블록과 블록 엔티티에서 사용하는 캐패빌리티들. 각 `Block`마다 구현이 다를 수 있음.
- `EntityCapability`: 엔티티에서 사용하는 캐패빌리티들, 각 `EntityType`마다 구현이 다를 수 있음.
- `ItemCapability`: 아이템 스택에서 사용하는 캐패빌리티들, 각 `Item`마다 구현이 다를 수 있음.

:::tip
다른 모드와 호환성을 위해 가능하시다면 네오 포지의 `Capabilities` 클래스의 캐패빌리티를 사용하시는 것을 권장드립니다.
:::

캐패빌리티 생성은 함수를 호출하고, 그 결과를 `static final` 필드에 저장하는 것입니다. 이때 아래 인자는 무조건 전달돼야 하는데:

- 캐패빌리티의 이름.
    - 동명의 캐패빌리티를 여러 번 만들려고 하면 똑같은 캐패빌리티가 매번 반환됩니다.
    - 이름이 다른 캐패빌리티는 **완전 독립적**이기에 다른 용도로 사용하셔도 됩니다.
- 캐패빌리티의 기능. `T` 타입 인자로 제시합니다.
- 생성에 필요한 추가 정보. `C` 타입 인자로 제시합니다.

예를 들어, 방향에 따라 다른 동작을 하는 `IItemHandler` 캐패빌리티는 다음과 같이 만듭니다:

```java
public static final BlockCapability<IItemHandler, @Nullable Direction> ITEM_HANDLER_BLOCK =
    BlockCapability.create(
        // 캐패빌리티를 구분하기 위한 고유한 이름 제시.
        new ResourceLocation("mymod", "item_handler"),
        // 캐패빌리티의 기능 제시. 여기서 사용할 기능은 `IItemHandler`임.
        IItemHandler.class,
        // 추가 정보 제시. 방향에 따라 다른 동작을 하기 위해 `Direction` 열거형을 추가로 받음.
        Direction.class);
```

`@Nullable Direction`은 블록에 매우 많이 쓰이기에 다음 편의성 함수도 제공됩니다:

```java
public static final BlockCapability<IItemHandler, @Nullable Direction> ITEM_HANDLER_BLOCK =
    BlockCapability.createSided(
        // 캐패빌리티를 구분하기 위한 고유한 이름 제시.
        new ResourceLocation("mymod", "item_handler"),
        // 캐패빌리티의 기능 제시. 여기서 사용할 기능은 `IItemHandler`임.
        IItemHandler.class);
```

만약 추가 정보가 필요 없다면 `Void`를 사용하세요. 추가 정보 없이 캐패빌리티를 생성하는 편의성 함수도 있습니다:

```java
public static final BlockCapability<IItemHandler, Void> ITEM_HANDLER_NO_CONTEXT =
    BlockCapability.createVoid(
        // 캐패빌리티를 구분하기 위한 고유한 이름 제시.
        new ResourceLocation("mymod", "item_handler_no_context"),
        // 캐패빌리티의 기능 제시. 여기서 사용할 기능은 `IItemHandler`임.
        IItemHandler.class);
```

엔티티와 아이템도 유사한 메서드가 각각 `EntityCapability`와 `ItemCapability`에 존재합니다.

## 캐패빌리티 받아오기

`BlockCapability`, `EntityCapability`, 또는 `ItemCapability`를 생성했다면 이젠 객체로부터 캐패빌리티를 받아올 수 있습니다.

엔티티와 아이템 스택의 경우, 캐패빌리티의 구현은 `#getCapability`를 호출해 받아올 수 있습니다. 만약 `null`이 반환되면, 그 캐패빌리티는 해당 엔티티 또는 아이템 스택에 대해 존재하지 않습니다.

예시:

```java
var object = entity.getCapability(CAP, context);
if (object != null) {
    // object 사용
}
```

```java
var object = stack.getCapability(CAP, context);
if (object != null) {
    // object 사용
}
```

블록 캐패빌리티는 블록 엔티티 없이도 동작해야 하기에 사용 방식이 다릅니다. 캐패빌리티는 `level`에 요청하며, `pos`(위치)를 제공해야 합니다:

```java
var object = level.getCapability(CAP, pos, context);
if (object != null) {
    // object 사용
}
```

만약 레벨의 해당 위치에 존재하는 블록의 상태나 블록 엔티티를 이미 알고 있다면 검색 시간 단축을 위해 다음처럼 추가적으로 제공할 수도 있습니다:

```java
var object = level.getCapability(CAP, pos, blockState, blockEntity, context);
if (object != null) {
    // object 사용
}
```

구체적인 예시를 보여드리자면, 블록의 북쪽면의 `IItemHandler`는 다음과 같이 받아올 수 있습니다:

```java
IItemHandler handler = level.getCapability(Capabilities.ItemHandler.BLOCK, pos, Direction.NORTH);
if (handler != null) {
    // handler를 이용한 아이템 관리 수행.
}
```

## 블록 캐패빌리티 캐시

블록 캐패빌리티는 검색할 때 내부적으로 아래 과정을 따릅니다:

1. 함수 인자로 블록 엔티티와 상태가 전달 안 됐으면 레벨에서 찾아옴.
2. 등록된 캐패빌리티 제공자들을 찾음. (아래에서 더 자세히 다룸.)
3. 제공자들을 순회하며 요청된 캐패빌리티가 있는지 수색함.
4. 그중 하나는 캐패빌리티를 반환함. 이때 새 객체가 할당될 수 있음.

저희도 최대한 빠르게 구현했지만 매 틱마다 위 검색 과정을 실행하면 서버 성능이 저하될 수 있습니다. `BlockCapabilityCache`는 검색 결과를 기억하여 특정 좌표의 캐패빌리티를 빠르게 받아옵니다.

:::tip
일반적으로, `BlockCapabilityCache`는 한번 생성한 이후 캐패빌리티를 자주 요청하는 객체에 함께 저장됩니다. 캐시를 언제 생성하고 어디에 저장할지는 필요에 따라 결정하세요.
:::

캐시를 생성하려면 `BlockCapabilityCache#create`를 호출해 레벨, 위치, 그리고 추가 정보를 전달하세요.

```java
// 다음과 같이 필드를 정의하세요:
private BlockCapabilityCache<IItemHandler, @Nullable Direction> capCache;

// 블록 또는 블록 엔티티 초기화 할 때:
this.capCache = BlockCapabilityCache.create(
        Capabilities.ItemHandler.BLOCK, // 기억할 캐패빌리티
        level, // 레벨
        pos, // 대상 위치
        Direction.NORTH // 추가 정보
);
```

이후 캐시를 가져오려면 `#getCapability`를 호출하세요:

```java
IItemHandler handler = this.capCache.getCapability();
if (handler != null) {
    // handler로 아이템 관련 작업을 수행.
}
```

**캐시는 GC가 알아서 처리하니 직접 지우실 필요는 없습니다.**

블록의 캐패빌리티가 변할 때 알림을 받는 것 또한 가능합니다! 이를 통해 캐패빌리티가 변할 때, 없어질 때, 또는 다시 생성될 때 대응할 수 있습니다.

알림을 받기 위해선 캐시를 생성할 때 두 개의 추가 인자를 전달해야 합니다:

- 캐시가 아직도 올바른지 확인하는 검사 코드.
    - 블록 엔티티는 단순히 `() -> !this.isRemoved()`를 사용하셔도 됩니다.
- 캐패빌리티가 변경되어 캐시가 제거될 때 실행될 코드.
    - 캐패빌리티가 변하거나, 제거되거나, 아니면 다시 생성될 때 실행됩니다.

```java
// 알림 대응을 위한 인자를 추가하면:
this.capCache = BlockCapabilityCache.create(
        Capabilities.ItemHandler.BLOCK, // 기억할 캐패빌리티
        level, // 레벨
        pos, // 대상 위치
        Direction.NORTH, // 추가 정보
        () -> !this.isRemoved(), // 검사 코드 (캐시가 진짜 캐패빌리티보다 오래 살 수 있기 때문)
        () -> onCapInvalidate() // 캐패빌리티 변화에 대응할 코드
);
```

## 블록 캐패빌리티 무효화

:::info
캐패빌리티 무효화는 오직 블록에만 적용됩니다. 엔티티와 아이템 스택의 캐패빌리티는 캐시가 불가능하며 무효화할 필요가 없습니다.
:::

캐시가 캐패빌리티의 변화에 올바르게 대응하려면 **캐패빌리티가 변하거나, 생성되거나, 사라질 때마다 무조건 `level.invalidateCapabilities(pos)`를 호출해야만 합니다**.

```java
// 캐패빌리티가 변하거나, 제거되거나, 다시 생성될 때:
level.invalidateCapabilities(pos);
```

네오 포지는 이미 청크를 불러올 때/해제할 때, 또는 블록 엔티티 생성/제거 시에 캐패빌리티 캐시를 무효화합니다. 하지만 아래의 경우 개발자가 직접 처리해야 합니다:

- 이전에 반환한 캐패빌리티가 더 이상 유효하지 않을 때.
- 블록 엔티티가 없는 블록이 설치되거나 다른 상태로 바뀌었을 때. `onPlace`를 재정의 하세요.
- 블록 엔티티가 없는 블록이 파괴되었을 때. `onRemove`를 재정의 하세요.

블록 엔티티가 없는 블록의 캐시 관리는 `ComposterBlock`을 참고하세요.

자세한 정보는 [`IBlockCapabilityProvider`][block-cap-provider]의 Javadoc을 확인하세요.

## 캐패빌리티 등록하기

캐패빌리티 객체는 _제공자_가 반환합니다. 제공자는 캐패빌리티 객체 또는 `null`을 반환하는 함수입니다. 제공자는 아래 조건에 따라 다르게 동작할 수 있습니다:

- 무슨 캐패빌리티를 제공하는가?
- 어떤 블록/블록 엔티티/엔티티/아이템 인가?

제공자는 `RegisterCapabilitiesEvent`에서 등록되어야 합니다.

블록의 제공자는 `registerBlock`으로 등록합니다. 예를 들어:

```java
private static void registerCapabilities(RegisterCapabilitiesEvent event) {
    event.registerBlock(
        Capabilities.ItemHandler.BLOCK, // 등록할 캐패빌리티
        (level, pos, state, be, side) -> <IItemHandler 반환>,
        // 캐패빌리티를 사용할 블록들
        MY_ITEM_HANDLER_BLOCK,
        MY_OTHER_ITEM_HANDLER_BLOCK
    );
}
```

In general, registration will be specific to some block entity types, so the `registerBlockEntity` helper method is provided as well:

```java
event.registerBlockEntity(
    Capabilities.ItemHandler.BLOCK, // capability to register for
    MY_BLOCK_ENTITY_TYPE, // block entity type to register for
    (myBlockEntity, side) -> myBlockEntity.myIItemHandlerForTheGivenSide
);
```

:::danger
제공자가 반환한 블록/블록 엔티티의 캐패빌리티가 더 이상 유효하지 않다면, `level.invalidateCapabilities(pos)`를 호출해 **무조건 캐시를 삭제해야 합니다**. 자세한 사항은 [캐시 무효화][invalidation]을 참고하세요.
:::

엔티티용 캐패빌리티는 `registerEntity`로 등록하며 위와 유사합니다:

```java
event.registerEntity(
    Capabilities.ItemHandler.ENTITY, // capability to register for
    MY_ENTITY_TYPE, // entity type to register for
    (myEntity, context) -> myEntity.myIItemHandlerForTheGivenContext
);
```

아이템 등록도 비슷합니다. 이때 제공자는 `Item`이 아니라 `ItemStack`을 받음을 유의하세요:

```java
event.registerItem(
    Capabilities.ItemHandler.ITEM, // 등록할 캐패빌리티
    (itemStack, context) -> <IItemHandler 반환>,
    // 캐패빌리티를 사용할 아이템들
    MY_ITEM,
    MY_OTHER_ITEM
);
```

## 모든 객체에 사용할 캐패빌리티 등록하기

만약 존재하는 모든 블록, 엔티티, 또는 아이템에 사용 가능한 캐패빌리티를 만드신다면 레지스트리를 순회하며 모든 객체에 해당 제공자를 등록해야 합니다.

예를 들어 네오 포지는 아래 코드를 사용해 모든 `BucketItem`에 액체 캐패빌리티를 추가합니다:

```java
// CapabilityHooks의 일부
for (Item item : BuiltInRegistries.ITEM) {
    if (item.getClass() == BucketItem.class) {
        event.registerItem(Capabilities.FluidHandler.ITEM, (stack, ctx) -> new FluidBucketWrapper(stack), item);
    }
}
```

캐패빌리티를 검색할 땐 제공자가 등록된 순서에 따라 수색합니다. 네오 포지에서 등록한 제공자보다 먼저 수색되게 하려면 `RegisterCapabilityEvent`의 핸들러가 다음과 같이 높은 우선순위를 가지게 하세요.

예시:

```java
modBus.addListener(RegisterCapabilitiesEvent.class, event -> {
    event.registerItem(
        Capabilities.FluidHandler.ITEM,
        (stack, ctx) -> new MyCustomFluidBucketWrapper(stack),
        // 캐패빌리티를 사용할 블록
        MY_CUSTOM_BUCKET);
}, EventPriority.HIGH); // 우선순위 HIGH를 사용해 네오 포지보다 먼저 제공자를 등록하세요!
```

네오 포지가 등록하는 캐패빌리티 제공자들은 [`CapabilityHooks`][capability-hooks]에서 참고하실 수 있습니다.

[block-cap-provider]: https://github.com/neoforged/NeoForge/blob/1.20.x/src/main/java/net/neoforged/neoforge/capabilities/IBlockCapabilityProvider.java
[capability-hooks]: https://github.com/neoforged/NeoForge/blob/1.20.x/src/main/java/net/neoforged/neoforge/capabilities/CapabilityHooks.java
[invalidation]: #블록-캐패빌리티-무효화
