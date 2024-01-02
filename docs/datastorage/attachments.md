# 데이터 부착

데이터 부착 시스템은 블록 엔티티, 청크, 엔티티, 그리고 아이템 스택에 추가 데이터를 저장합니다.

_레벨 자체에 데이터를 추가하려면 [SavedData](saveddata)를 대신 쓰세요._

## 부착물 생성하기

데이터 부착 시스템을 쓰려면 부착물(`AttachmentType`)이 필요합니다. 부착물은 아래 네 설정을 포함하는데:
- 기본값 생성 코드. 데이터를 맨 처음 접근하거나 데이터가 없는 객체와 비교할 때 사용함.
- 데이터를 저장하고 싶다면 사용할 직렬화 코드.
- (직렬화 코드를 사용한다면) 엔티티 사망 시 데이터를 자동으로 복사하는 `copyOnDeath` 플래그. (아래 참고)
- (심화 기능) (직렬화 코드를 사용한다면) 두 아이템 스택의 데이터가 동일한지 비교하는 `comparator`.

:::tip
부착물의 데이터를 저장하고 싶지 않다면 직렬화를 사용하지 마세요.
:::

부착된 데이터가 직렬화되도록 하는 데에는 여러 가지 방법이 있습니다: `IAttachmentSerializer`를 구현하거나, `INBTSerializable`를 구현하고 `AttachmentType#serializable`에 전달해 빌더를 만들거나, 아니면 코덱을 빌더에 전달하는 방식이 있습니다.

:::warning
아이템은 코덱으로 직렬화하면 더 느립니다.
:::

모든 부착물은 `NeoForgeRegistries.ATTACHMENT_TYPES`에 **무조건 등록되어야** 합니다. 아래 예시를 참고하세요:
```java
// 부착물을 등록하는 DeferredRegister 생성
private static final DeferredRegister<AttachmentType<?>> ATTACHMENT_TYPES = DeferredRegister.create(NeoForgeRegistries.ATTACHMENT_TYPES, MOD_ID);

// INBTSerializable로 직렬화
private static final Supplier<AttachmentType<ItemStackHandler>> HANDLER = ATTACHMENT_TYPES.register(
        "handler", () -> AttachmentType.serializable(() -> new ItemStackHandler(1)).build());
// 코덱으로 직렬화
private static final Supplier<AttachmentType<Integer>> MANA = ATTACHMENT_TYPES.register(
        "mana", () -> AttachmentType.builder(() -> 0).serialize(Codec.INT).build());
// 직렬화 안 함
private static final Supplier<AttachmentType<SomeCache>> SOME_CACHE = ATTACHMENT_TYPES.register(
        "some_cache", () -> AttachmentType.builder(() -> new SomeCache()).build()
);

// 이후 DeferredRegister를 모드 버스에 연결하는 걸 잊지 마세요.
ATTACHMENT_TYPES.register(modBus);
```

## 부착물 사용하기

부착물을 생성하셨다면 아무 holder 객체에나 사용하실 수 있습니다. 해당 부착물이 없는 객체에 `#getData`를 호출하면 새 기본값 데이터를 만들어 부착합니다.

```java
// ItemStackHandler를 받아옴. 만약 부착된 적 없다면 새로 하나 생성:
ItemStackHandler stackHandler = stack.getData(HANDLER);
// 플레이어의 마나 값을 받아옴. 없다면 0을 부착:
int playerMana = player.getData(MANA);
```

만약 기본값 데이터를 붙이고 싶지 않다면 `hasData`로 데이터 존재 유무를 확인할 수 있습니다:
```java
// 아이템에 HANDLER가 붙어있는지 확인
if (stack.hasData(HANDLER)) {
    ItemStackHandler stackHandler = stack.getData(HANDLER);
    // Do something with stack.getData(HANDLER).
}
```

데이터는 `setData`로 갱신할 수 있습니다:
```java
// 마나 10 증감
player.setData(MANA, player.getData(MANA) + 10);
```

:::important
블록 엔티티와 청크는 데이터가 변경될 시 (`setChanged`와 `setUnsaved(true)` 등을 통해) 그 사실을 표기해 두어야 합니다. `setData`는 자동으로 이를 표기합니다:
```java
chunk.setData(MANA, chunk.getData(MANA) + 10); // 자동으로 setUnsaved 호출
```
하지만 `getData`로 받은 데이터를 바로 수정한다면 수동으로 변경 사실을 표기해야 합니다:
```java
var mana = chunk.getData(MUTABLE_MANA);
mana.set(10);
chunk.setUnsaved(true); // setData를 사용하지 않았기에 무조건 직접 표기해야 함
```
:::

## 클라이언트와 데이터 공유하기
현재, 아이템은 직렬화가 가능한 데이터만 클라이언트와 서버끼리 동기화가 가능합니다. 이 동기화는 자동으로 수행됩니다.

블록 엔티티, 청크, 또는 엔티티에 부착된 데이터는 클라이언트에 직접 [패킷을 전송하셔야][network] 합니다. 청크의 경우 데이터가 전송될 때 `ChunkWatchEvent.Sent`를 방송하니 이때 변경된 추가 데이터를 같이 보내세요.

## 플레이어 사망 시 데이터 복사하기
기본적으로 사망한 엔티티의 추가 데이터는 복사되지 않습니다. 플레이어의 데이터를 복사하려면 부착물의 builder에 `#copyOnDeath`를 호출하세요.

데이터 복사 과정을 수정하시려면 `PlayerEvent.Clone`를 사용하세요. 이 이벤트는 `#isWasDeath` 메서드로 사망했다가 부활하는 것인지, 아니면 엔드에서 돌아오는 것인지 구분할 수 있습니다. 엔드에서 돌아오는 경우 데이터가 그대로 유지되니 데이터 복사를 피하기 위해 이 두 경우를 구분하세요.

예시:
```java
NeoForge.EVENT_BUS.register(PlayerEvent.Clone.class, event -> {
    if (event.isWasDeath() && event.getOriginal().hasData(MY_DATA)) {
        event.getEntity().getData(MY_DATA).fieldToCopy = event.getOriginal().getData(MY_DATA).fieldToCopy;
    }
});
```

[network]: ../networking/index.md