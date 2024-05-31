# 데이터 부착

데이터 부착 시스템은 블록 엔티티, 청크, 엔티티에 추가 데이터를 저장합니다.

_레벨 자체에 데이터를 추가하려면 [SavedData](saveddata)를 대신 쓰세요._

:::note
Data attachments for item stacks have been superceeded by vanilla's [data components][datacomponents].
:::

## 부착물 생성하기

데이터 부착 시스템을 쓰려면 부착물(`AttachmentType`)이 필요합니다. 부착물은 아래 설정을 포함하는데:

- 기본값 생성 코드. 데이터를 맨 처음 접근하거나 데이터가 없는 객체와 비교할 때 사용함.
- 데이터를 저장하고 싶다면 사용할 직렬화 코드.
- (직렬화 코드를 사용한다면) 엔티티 사망 시 데이터를 자동으로 복사하는 `copyOnDeath` 플래그. (아래 참고)

:::tip
부착물의 데이터를 저장하고 싶지 않다면 직렬화를 사용하지 마세요.
:::

부착된 데이터가 직렬화되도록 하는 데에는 여러 가지 방법이 있습니다: `IAttachmentSerializer`를 구현하거나, `INBTSerializable`를 구현하고 `AttachmentType#serializable`에 전달해 빌더를 만들거나, 아니면 코덱을 빌더에 전달하는 방식이 있습니다.

In any case, the attachment **must be registered** to the `NeoForgeRegistries.ATTACHMENT_TYPES` registry. Here is an example:

```java
// 부착물을 등록하는 DeferredRegister 생성
private static final DeferredRegister<AttachmentType<?>> ATTACHMENT_TYPES = DeferredRegister.create(NeoForgeRegistries.ATTACHMENT_TYPES, MOD_ID);

// INBTSerializable로 직렬화
private static final Supplier<AttachmentType<ItemStackHandler>> HANDLER = ATTACHMENT_TYPES.register(
    "handler", () -> AttachmentType.serializable(() -> new ItemStackHandler(1)).build()
);
// Serialization via codec
private static final Supplier<AttachmentType<Integer>> MANA = ATTACHMENT_TYPES.register(
    "mana", () -> AttachmentType.builder(() -> 0).serialize(Codec.INT).build()
);
// No serialization
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
ItemStackHandler stackHandler = chunk.getData(HANDLER);
// 플레이어의 마나 값을 받아옴. 없다면 0을 부착:
int playerMana = player.getData(MANA);
// 기타 등등..
```

만약 기본값 데이터를 붙이고 싶지 않다면 `hasData`로 데이터 존재 유무를 확인할 수 있습니다:

```java
// 청크에 HANDLER가 붙어있는지 먼저 확인하고 처리
if (chunk.hasData(HANDLER)) {
    ItemStackHandler stackHandler = chunk.getData(HANDLER);
    // Do something with chunk.getData(HANDLER).
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

[saveddata]: ./saveddata.md
[datacomponents]: ../items/datacomponents.md
[network]: ../networking/index.md
