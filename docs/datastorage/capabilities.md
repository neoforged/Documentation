캐패빌리티
=====================

캐패빌리티 시스템은 클래스 참조로 인한 강제 종속성을 피하면서도 선택적으로 기능을 제공할 수 있습니다.

이렇게 제공되는 동작 또는 기능을 캐패빌리티라고 하며, 이를 인터페이스 형태로 제공합니다.

포지는 `BlockEntity`, `Entity`, `ItemStack`, `Level`, 그리고 `LevelChunk`에 캐패빌리티 지원을 추가합니다, 이 객체들에는 캐패빌리티를 이벤트 핸들러 사용 또는 관련 메서드를 재정의하여 추가할 수 있습니다. 이에 대해서는 아래 더 자세히 다루도록 하겠습니다.

포지에서 제공하는 캐패빌리티
---------------------------

포지에서는 기본적으로 세가지 캐패빌리티가 있습니다: `IItemHandler`, `IFluidHandler` `IEnergyStorage`
`IItemHandler`는 인벤토리를 관리하는 인터페이스를 제공합니다. BlockEntity, Entity, 또는 ItemStack 에 사용할 수 있습니다. `Container`, `WorldlyContainer` 대신 사용하세요.

`IFluidHandler`는 액체를 저장하는 인터페이스를 제공합니다. BlockEntity, Entity, 또는 ItemStack 에 적용할 수 있습니다.

`IEnergyStorage`는 에너지를 저장하는 인터페이스를 제공합니다. BlockEntity, Entity, 또는 ItemStack 에 적용할 수 있습니다. TeamCoFH 의 RedstoneFlux API를 기반으로 하여 만들어 졌습니다.

캐패빌리티 사용하기
----------------------------

각 캐패빌리티는 `Capability`라는 고유한 인스턴스로 구분합니다.

각 `Capability` 인스턴스들은 포지에서 생성하고 관리합니다. 이들을 참조하려면 `CapabilityManager#get`을 사용하세요. 

::tip
위에서 언급한 세가지 캐패빌리티들은 `ForgeCapabilities`를 통해서도 `Capability`를 참조하실 수 있습니다.
:::

```java
static Capability<IItemHandler> ITEM_HANDLER_CAPABILITY = CapabilityManager.get(new CapabilityToken<IItemHandler>(){});

static Capability<IItemHandler> STATIC_REFERENCE = ForgeCapabilities#ITEM_HANDLER;
// 위 두가지 다 동일한 캐패빌리티의 인스턴스를 참조합니다
```

`CapabilityManager#get`은 언제나 `null`이 아닌 요청된 `Capability`를 반환합니다.
여기서 `CapabilityToken`의 제너릭 타입 인자는 `Capability`가 제공하는 인스턴스를 사용합니다.

:::danger
`CapabilityManager#get`이 `null`이 값을 반환하였어도 해당 캐패빌리티가 존재하지 않을 수 있습니다. 캐패빌리티가 사용가능한지 확인하려면 `Capability#isRegistered`를 사용하세요.
:::

BlockEntity, Entity, 그리고 ItemStack은 `ICapabilityProvider`를 구현하여 캐패빌리티 시스템을 지원합니다. `ICapabilityProvider#getCapability`에 `Capability`를 인자로 넘겨 원하시는 캐패빌리티를 요청하실 수 있습니다.

여기서 "요청"이라고 했는데, 객체가 요청받은 캐패빌리티를 지원하지 않을 수 있기 때문입니다. 만약 객체가 요청받은 캐패빌리티를 지원하지 않는다면 `LazyOptional.empty()`가 반환되고, 지원한다면 캐패빌리티가 제공하는 인터페이스의 인스턴스가 반환됩니다.

`#getCapability` 메서드는 `Direction`를 두번째 인자로 받는데, 이는 방향(또는 면)에 따라 다른 캐패빌리티를 사용할 수 있도록 해줍니다. 이때 방향이 필요 없는 상황이라면 `null`을 전달하실 수도 있습니다.

캐패빌리티 지원하기
---------------------

`ICapabilityProvider`를 지원하는 객체에서 새로운 캐패빌리티를 지원하기 위해서는 먼저 지원할 캐패빌리티가 존재하는지 먼저 확인해야 합니다. 캐패빌리티는 다른 모드에서도 추가할 수 있습니다. 근데 해당 모드가 설치되어 있지 않다면 오류가 발생할 수 있습니다. 이는 위처럼 `Capability#isRegistered`를 사용하여 확인하실 수 있습니다.

이후 지원할 캐패빌리티가 제공하는 인터페이스의 인스턴스가 필요합니다. 직접 구현해서 만드셔도 되고, `IItemHandler`를 구현하는 `ItemStackHandler`처럼 이미 존재하시는걸 쓰셔도 됩니다. 이제 이 인스턴스를 `LazyOptional#of`로 감싸주세요.

이제 `ICapabilityProvider#getCapability`에서 지원할 캐패빌리티의 `Capability`가 전달되면 감싼 `LazyOptional`을 반환하시면 됩니다. 방향에 따라 다른 캐패빌리티를 반환한다면 `side` 인자를 사용하실 수 있습니다. 마지막으로, `super` 메서드 호출을 하는 것을 잊지 마세요, 그렇지 않으면 기존에 이미 지원되던 캐패빌리티가 오작동 합니다.

객체가 게임에서 제거되거나, 특정 캐패빌리티를 중간에 비활성화 하신다면 위에서 만든 `LazyOptional`을 `#invalidate`를 호출해 무효화 해야 합니다, 이는 `#getCapability`에서 반환한 `LazyOptional`을 다른 곳에서 저장할 수 있기 때문입니다. 엔티티와 블록 엔티티의 경우 월드에서 제거될 때 자동으로 호출되는 `#invalidateCaps`에서 무효화 하실 수 있습니다.

```java
// 아래 코드가 블록 엔티티의 일부라고 할 때:
LazyOptional<IItemHandler> inventoryHandlerLazyOptional;

// inventoryHandlerSupplier는 IItemHandler의 인스턴스를 반환하는 Supplier 입니다 (예: () -> inventoryHandler).
inventoryHandlerLazyOptional = LazyOptional.of(inventoryHandlerSupplier);

@Override
public <T> LazyOptional<T> getCapability(Capability<T> cap, Direction side) {
  if (cap == CapabilityItemHandler.ITEM_HANDLER_CAPABILITY) {
    return inventoryHandlerLazyOptional.cast();
  }
  return super.getCapability(cap, side);
}

@Override
public void invalidateCaps() {
  super.invalidateCaps();
  inventoryHandlerLazyOptional.invalidate();
}
```

`Item`은 방식이 조금 다른데, `ItemStack`의 캐패빌리티 지원을 `Item#initCapabilities`에서 추가하기 때문입니다. 여기선 위처럼 `#getCapability`를 구현하는 `ICapabilityProvider`를 반환하여, `ItemStack`에 캐패빌리티 지원을 ["부착"][부착]합니다.

캐패빌리티 요청은 매 틱마다, 수십번씩 발생할 수 있으니, `#getCapability` 함수는 매우 빨라야만 합니다. 외부 자료구조 말고 위처럼 직접 코드로 확인해 주세요.

캐패빌리티 부착하기
----------------------

캐패빌리티 시스템을 지원하는 `Entity`, `Level`과 같은 객체에는 새로운 캐패빌리티 지원을 추가할 수 있습니다. 이 과정을 "부착"이라고 하며, `AttachCapabilitiesEvent`가 방송될 때 또 다른 `ICapabilityProvider`의 인스턴스를 부착하시면 됩니다.
게임속 여러 객체들은 초기화 도중 이 이벤트를 방송하여 다른 캐패빌리티가 부착될 수 있도록 합니다:

* `AttachCapabilitiesEvent<Entity>`: 엔티티 초기화시 방송됨.
* `AttachCapabilitiesEvent<BlockEntity>`: 블록 엔티티 초기화시 방송됨.
* `AttachCapabilitiesEvent<ItemStack>`: 아이템 스택 초기화시 방송됨.
* `AttachCapabilitiesEvent<Level>`: 레벨 초기화시 방송됨.
* `AttachCapabilitiesEvent<LevelChunk>`: 청크 초기화시 방송됨.

이때 이벤트의 제너릭 타입은 위에 나열된 것만 쓰세요, 예를 들어, `Player`에 캐패빌리티를 부착한다면 `AttachCapabilitiesEvent<Entity>`를 구독하고, 객체가 `Player`인지 확인하여야 합니다.

캐패빌리티를 부착하려면 해당 이벤트의 `#addCapability`를 호출하시면 됩니다. 이때 부착할 캐패빌리티의 데이터를 저장할 필요가 없다면 `ICapabilityProvider`만 구현해도 되지만, 데이터를 저장해야 할 경우, `ICapabilitySerializable<T extends Tag>`를 대신 구현하세요, 이 인터페이스는 NBT를 저장하고 불러오는 메서드도 가지고 있습니다.

부착하시는 캐패빌리티는 `LazyOptional`을 무효화시킬 람다 함수를 `#addListener`에 전달해야 하셔야 합니다.

`ICapabilityProvider` 구현에 관해서는 [캐패빌리티 지원하기][지원]를 참고하세요.

캐패빌리티 직접 만들기
----------------------------

캐패빌리티는 `RegisterCapabilitiesEvent` 또는 `@AutoRegisterCapability`로 등록합니다.

### RegisterCapabilitiesEvent

캐피빌리티가 제공할 인터페이스를 `RegisterCapabilitiesEvent#register`에 전달하는 것으로 등록합니다. 이 이벤트는 [모드 버스에 방송됩니다][handled].

```java
@SubscribeEvent
public void registerCaps(RegisterCapabilitiesEvent event) {
  event.register(IExampleCapability.class);
}
```

### @AutoRegisterCapability

캐패빌리티가 제공할 인터페이스를 `@AutoRegisterCapability`로 표시하면 포지가 알아서 등록해 줍니다.

```java
@AutoRegisterCapability
public interface IExampleCapability {
    // ...
}
```

LevelChunk 와 BlockEntity 캐패빌리티 데이터 유지시키지
--------------------------------------------

`LevelChunk`와 `BlockEntity`는 데이터가 수정되었다고 표기되었을 경우에만 디스크에 저장됩니다. 이들의 캐패빌리티의 데이터를 올바르게 유지시키지 위해서는 데이터가 변경되었을 때 수정되었다고 표기하여야만 합니다. `LevelChunk`는 `#setUnsaved`로, `BlockEntity`는 `#setChanged`로 데이터 변경을 표시할 수 있습니다.

블록 엔티티에서 많이 쓰이는 `ItemStackHandler`는 `void onContentsChanged(int slot)`에서 데이터가 수정되었다고 표기합니다.

```java
public class MyBlockEntity extends BlockEntity {

  private final IItemHandler inventory = new ItemStackHandler(...) {
    @Override
    protected void onContentsChanged(int slot) {
      super.onContentsChanged(slot);
      setChanged(); // BlockEntity에서 데이터 수정 표시
    }
  }

  // ...
}
```

클라이언트와 데이터 동기화 하기
-------------------------------

캐패빌리티의 데이터는 클라이언트에게 전송되지 않습니다. 모드를 만드실 때 직접 패킷을 사용해서 데이터를 동기화 하여야 합니다.

데이터를 동기화 할만한 크게 아래 3가지가 있습니다:

1. 엔티티가 레벨에 스폰될때나, 블록이 설치되는 경우. 이럴땐 클라이언트들에 초기 값을 보내볼 수 있습니다.
2. 저장된 데이터가 수정되는 경우, 이경우 데이터가 필요한 클라이언트들에 데이터를 보내볼 수 있습니다.
3. 클라이언트가 특정 엔티티나 블록을 처다보기 시작할 때, 이 경우 이미 존재하는 데이터를 보내볼 수 있습니다.

[네트워킹][network]을 참고하여 네트워크 패킷을 구현하는 방법에 대해 자세히 알아보세요.

플레이어가 죽어도 데이터 유지시키기
-------------------------------

캐패빌리티의 데이터는 엔티티가 사망하면 다 사라집니다. 플레이어 사망시 캐패빌리티의 데이터를 리스폰 과정에서 직접 복사하여야만 합니다.

`PlayerEvent$Clone`을 통해 이를 구현할 수 있는데, 죽기 전 플레이어 엔티티의 데이터를 새로운 플레이어 엔티티에 데이터로 복사하는 것입니다.
이 이벤트는 플레이어가 엔드에서 돌아올 때도 방송됩니다. 이때는 데이터가 유지되기 때문에 복사하면 안되는데, `#isWasDead`로 플레이어가 진짜 죽은 것인지, 아니면 엔드에서 돌아오는 것인지 구분할 수 있습니다.

[지원]: #캐패빌리티-지원하기
[handled]: ../concepts/events.md#creating-an-event-handler
[network]: ../networking/index.md
[부착]: #캐패빌리티-부착하기
