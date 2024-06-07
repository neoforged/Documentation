# 데이터 부착

데이터 부착 시스템은 블록 엔티티, 청크, 엔티티와 같은 게임속 요소에 추가 데이터를 저장합니다.

_레벨 자체에 데이터를 추가하려면 [SavedData](saveddata)를 대신 쓰세요._

:::note
아이템에 추가 데이터를 저장하려면 [데이터 조각][datacomponents]를 사용하세요.
:::

## 새로운 데이터 정의하기

부착할 데이터는 `AttachmentType`으로 정의합니다. `AttachmentType`은 무슨 데이터를 어떻게 부착하고 저장할지 등을 정의하는 타입으로, 아래 설정들을 가집니다:

- 기본값 생성 코드. 데이터를 처음 사용하거나, 아직 데이터가 없는 요소의 데이터 값을 비교할 때 사용함.
- (선택 사항) 데이터를 저장할 때 사용할 코드. 없으면 데이터가 저장되지 않음.
- (데이터를 저장한다면) 엔티티 사망 시 데이터를 자동으로 복사하는 `copyOnDeath` 플래그. (아래 참고)

부착된 데이터를 저장하는 데에는 여러 방법이 있습니다: 데이터 자체가 `INBTSerializable`을 구현하거나, 코덱 또는 `IAttachmentSerializer`를 빌더에 전달하는 방식이 있습니다.

무슨 데이터를 정의하시든, 무조건 `NeoForgeRegistries.ATTACHMENT_TYPES`에 아래와 같이 등록해야 합니다:

```java
// 부착물을 등록하는 DeferredRegister 생성
private static final DeferredRegister<AttachmentType<?>> ATTACHMENT_TYPES = DeferredRegister.create(NeoForgeRegistries.ATTACHMENT_TYPES, MOD_ID);

// INBTSerializable로 저장
private static final Supplier<AttachmentType<ItemStackHandler>> HANDLER = ATTACHMENT_TYPES.register(
    "handler", () -> AttachmentType.serializable(() -> new ItemStackHandler(1)).build()
);
// 코덱으로 저장
private static final Supplier<AttachmentType<Integer>> MANA = ATTACHMENT_TYPES.register(
    "mana", () -> AttachmentType.builder(() -> 0).serialize(Codec.INT).build()
);
// 저장 안함
private static final Supplier<AttachmentType<SomeCache>> SOME_CACHE = ATTACHMENT_TYPES.register(
    "some_cache", () -> AttachmentType.builder(() -> new SomeCache()).build()
);

// 이후 DeferredRegister를 모드 버스에 연결하는 걸 잊지 마세요.
ATTACHMENT_TYPES.register(modBus);
```

## 데이터 부착하기

위에서 정의한 데이터는 레벨, 청크, 엔티티, 블록 엔티티에 사용하실 수 있습니다. 해당 부착물이 없는 객체의 데이터를 `#getData`로 가져오면 새 기본값 데이터를 만들어 부착합니다.

```java
// ItemStackHandler를 받아옴. 만약 부착된 적 없다면 새로 하나 생성해서 부착함:
ItemStackHandler stackHandler = chunk.getData(HANDLER);
// 플레이어의 마나 값을 받아옴. 없다면 0을 부착함:
int playerMana = player.getData(MANA);
// 기타 등등..
```

만약 기본값 데이터를 붙이고 싶지 않다면 `hasData`로 데이터 존재 유무를 확인하세요:

```java
// 청크에 HANDLER가 붙어있는지 먼저 확인함
if (chunk.hasData(HANDLER)) {
    ItemStackHandler stackHandler = chunk.getData(HANDLER);
    // 데이터 사용
}
```

데이터는 `setData`로 갱신할 수 있습니다:

```java
// 마나 10 증감
player.setData(MANA, player.getData(MANA) + 10);
```

:::important
블록 엔티티와 청크는 데이터가 변경될 시 `setChanged`와 `setUnsaved(true)` 등을 통해 그 사실을 표기해 두어야 합니다. `setData`는 자동으로 이를 표기하지만:

```java
chunk.setData(MANA, chunk.getData(MANA) + 10); // 자동으로 setUnsaved 호출
```

`getData`로 받은 데이터를 바로 수정하시면 직접 변경 사실을 표기해야 합니다:

```java
var mana = chunk.getData(MUTABLE_MANA);
mana.set(10);
chunk.setUnsaved(true); // setData를 사용하지 않았기에 무조건 직접 표기해야 함
```
:::

## 클라이언트와 데이터 공유하기

블록 엔티티, 청크, 또는 엔티티에 부착된 데이터는 클라이언트에 직접 [패킷을 전송하셔야][network] 합니다. 청크의 경우 데이터가 전송될 때 `ChunkWatchEvent.Sent`를 방송하니 이때 변경된 데이터를 같이 보내세요.

## 플레이어 사망 시 데이터 복사하기

원칙적으로, 엔티티 사망시 데이터는 삭제됩니다. 플레이어가 부활할 때 데이터를 유지하려면 데이터를 정의할 때 `AttachmentType#copyOnDeath`를 호출하세요, 리스폰 하면서 이전 데이터를 복사합니다.

직접 데이터를 복사하시려면 `PlayerEvent.Clone` 이벤트를 사용하세요. `#isWasDeath`로 사망했다가 부활하는 것인지, 아니면 엔드에서 돌아오는 것인지 구분할 수 있습니다. 엔드에서 돌아오는 경우 데이터가 그대로 유지되니 데이터를 복사하지 마세요, 안그럼 겹칩니다.

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
