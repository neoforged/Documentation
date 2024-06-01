# 블록 엔티티

블록 엔티티(`BlockEntity`)는 블록에 종속된 엔티티입니다. 동적으로 변하는 데이터를 저장하거나, 매 틱마다 수행돼야 하는 작업을 하거나, 동적 렌더링을 해야 할 때 등, [`BlockState`][blockstate] 만으로는 구현하기 어려운 기능들을 만들 때 사용합니다. 마인크래프트는 블록 엔티티를 상자 인벤토리, 화로 제련, 신호기의 광역 포션 효과를 구현하는 데에 사용하며, 굴착기, 아이템 정렬하는 기계, 파이프, 디스플레이 등 더 복잡한 예제들은 다른 모드에서 찾아보실 수 있습니다.

:::note
블록 엔티티는 남용할 경우 서버에 큰 렉을 유발할 수 있습니다. 가능하다면 다른 방안을 먼저 찾아보세요.
:::

## 블록 엔티티 만들고 등록하기

블록 엔티티는 얼마든지 생성되고 제거될 수 있습니다, 그러다 보니 `BlockEntity` 자체를 레지스트리에 등록하는 대신 그 *종류*를 표현하는 `BlockEntityType`을 레지스트리에 등록합니다.

`BlockEntityType`은 다른 레지스트리와 똑같이 [등록][registration]하고, `BlockEntityType$Builder#of`를 사용해 생성합니다. 이 메서드는 두 개의 인자를 받는데: `BlockEntityType$BlockEntitySupplier`와 이 블록 엔티티를 사용할 블록들을 받습니다. `BlockEntityType.BlockEntitySupplier`는 블록 엔티티를 불러오거나 레벨에 새로 배치할 때 호출되는 함수로, `BlockPos`와 `BlockState`를 인자로 받고 `BlockEntity`를 반환합니다. 이후 `#build`를 호출해 `BlockEntityType`을 생성하세요. 이때 `DataFixer`가 이 블록 엔티티를 레지스트리에서 찾을 때 사용하는 `Type`을 인자로 넘겨야 하는데, 이 시스템은 선택 사항이니 `null`을 사용하셔도 됩니다.

```java
// REGISTER는 DeferredRegister<BlockEntityType<?>>라 가정
public static final RegistryObject<BlockEntityType<MyBE>> MY_BE = REGISTER.register("mybe", () -> BlockEntityType.Builder.of(MyBE::new, validBlocks).build(null));

// BlockEntity를 상속하는 MyBE 클래스 내에서
public MyBE(BlockPos pos, BlockState state) {
  super(MY_BE.get(), pos, state);
}
```

## 블록에 부착하기

블록 엔티티를 붙일 블록은 `EntityBlock`을 구현해야 합니다. `EntityBlock#newBlockEntity(BlockPos, BlockState)`은 블록이 배치될 때 호출되는 함수로, 블록에 부착할 새로운 블록 엔티티를 생성합니다.

## 블록 엔티티에 데이터 담기

블록 엔티티에 데이터를 담기 위해선 아래 두 메서드를 재정의하세요:

```java
BlockEntity#saveAdditional(CompoundTag tag, HolderLookup.Provider registries) // 블록 엔티티를 저장할 때 호출됨

BlockEntity#loadAdditional(CompoundTag tag, HolderLookup.Provider registries) // 블록 엔티티를 불러올 때 호출됨
```

위 두 메서드는 블록 엔티티가 들어있는 청크를 저장하고 불러올 때 호출됩니다.

:::note
블록 엔티티의 데이터를 변경하면 무조건 `BlockEntity#setChanged`를 호출해야 저장됩니다.
:::

:::danger
위 메서드를 재정의할 때는 `super`를 무조건 호출하세요! 그렇지 않으면 필수 정보가 누락될 수 있습니다!

그리고, `id`, `x`, `y`, `z`, `NeoForgeData`, `neoforge:attachments`는 타 데이터와 겹치니 태그 이름으로 사용하지 마세요.
:::

## 블록 엔티티 틱 처리

블록 엔티티는 매 틱마다 특정 작업을 수행할 수 있습니다. 대표적으로 아이템을 굽는 화로가 있습니다. 이를 위해선 `EntityBlock#getTicker(Level, BlockState, BlockEntityType)`를 재정의 하세요. 이때 논리 사이드에 따라 다른 `BlockEntityTicker`를 반환하셔도 됩니다. `BlockEntityTicker`는 레벨, 블록 위치, [블록의 상태][blockstate], 그리고 블록 엔티티를 인자로 받는 함수입니다. `BlockEntityTicker`는 매 틱마다 호출됩니다.

```java
// Block의 자식 클래스 내부
@Nullable
@Override
public <T extends BlockEntity> BlockEntityTicker<T> getTicker(Level level, BlockState state, BlockEntityType<T> type) {
  return type == MyBlockEntityTypes.MYBE.get() ? MyBlockEntity::tick : null;
}

// MyBlockEntity 클래스 내부
public static void tick(Level level, BlockPos pos, BlockState state, MyBlockEntity blockEntity) {
  // 매틱마다 해야 하는 작업 처리
}
```

:::note
`BlockEntityTicker`에서 복잡한 연산을 하면 서버에 무리가 갑니다. 복잡한 연산은 매 X 틱 마다 하도록 만드는 것도 고려하여 주세요. (초당 틱 횟수(tps)는 최대 20입니다.)
:::

## 클라이언트와 데이터 동기화하기

클라이언트와 데이터를 동기화시킬 방법은 총 3가지가 있는데: 청크를 불러올 때 동기화하기, 블록 업데이트시 동기화 하기, 그리고 커스텀 네트워크 메시지 보내기입니다.

### `LevelChunk` 불러올 때 동기화하기

이를 위해선 다음 두 메서드를 재정의하세요:
```java
BlockEntity#getUpdateTag(HolderLookup.Provider registries)

IBlockEntityExtension#handleUpdateTag(CompoundTag tag, HolderLookup.Provider registries)
```

첫번째 메서드는 클라이언트에 보낼 데이터를 모으고, 두번째 메서드는 받은 데이터를 처리합니다. 만약 데이터가 많지 않다면 [위 *블록 엔티티에 데이터 담기*][storing-data] 섹션의 메서드를 사용해 블록 엔티티 전체를 다시 보내셔도 됩니다.

:::caution
너무나 많은 데이터를 동기화하면  네트워크에 무리가 갈 수 있습니다. 그렇기에 필요한 정보를 필요할 때만 보내 네트워크를 효율적으로 활용해야 합니다. 예를 들어, 블록 엔티티의 인벤토리가 변경될 때마다 동기화를 하는 대신, [`AbstractContainerMenu`][menu]를 통해 블록의 메뉴를 열 때만 동기화할 수 있습니다.
:::

### 블록이 업데이트될 때 동기화하기

이 방법은 살짝 더 복잡하지만, 아래처럼 메서드 2-3개만 재정의하면 됩니다.

```java
// BlockEntity의 하위 클래스
@Override
public CompoundTag getUpdateTag(HolderLookup.Provider registries) {
  CompoundTag tag = new CompoundTag();
  // tag에 블록 엔티티 데이터 작성
  return tag;
}

@Override
public Packet<ClientGamePacketListener> getUpdatePacket() {
  // 아래는 자동으로 #getUpdateTag를 호출하여 전송할 데이터를 가져옴
  return ClientboundBlockEntityDataPacket.create(this);
}

// 필요하면 IBlockEntityExtension#onDataPacket도 재정의 가능. 기본적으로 BlockEntity#loadWithComponents를 호출함.
```

이때 `ClientboundBlockEntityDataPacket#create`의 인자는:

- `BlockEntity`.
- 전송할 데이터를 담은 `CompoundTag`를 만드는 함수(`Function<BlockEntity, CompoundTag>`). 기본값으로 `BlockEntity#getUpdateTag`를 사용함.

이제 서버에서 다음과 같이 블록 엔티티를 업데이트할 수 있습니다:

```java
Level#sendBlockUpdated(BlockPos pos, BlockState oldState, BlockState newState, int flags)
```

- `pos`는 업데이트할 블록 엔티티의 위치.
- `oldState`랑 `newState`는 해당 위치의 [블록의 상태][blockstate].
- `flags`는 무슨 정보를 보내고 업데이트할지 설정하는 비트 마스크들. `2`, 또는 `Block#UPDATE_CLIENTS`를 포함하고 있어야 블록 엔티티 정보가 전송됨. 다른 플래그들은 `Block` 클래스를 참고.

### 커스텀 패킷으로 동기화하기

커스텀 패킷을 활용하는 것은 가장 복잡하지만, 필요한 정보만 골라 보낼 수 있어 가장 효율적이기도 합니다. 먼저 [네트워킹][networking] 문서를, 특히 [`PayloadRegistrar`][payload] 사용법을 충분히 숙지하신 후 패킷을 작성하세요. 패킷을 전송할 때는 블록 엔티티를 불러온 클라이언트들만 선택하는 `PacketDistributor#sendToPlayersTrackingChunk`를 사용하세요.

:::caution
플레이어에게 패킷이 도착했을 때는 블록 엔티티가 부서지거나, 다른 블록으로 대체되거나, 아니면 청크가 사라져 클라이언트에 존재하지 않을 수도 있습니다. 그렇기 때문에 블록이 진짜 존재하는지 무조건 확인하셔야 합니다! 청크는 `Level#hasChunkAt(BlockPos)`으로 존재하는지 할 수 있습니다.
:::

[registration]: ../concepts/registries.md#객체-등록-방법들
[storing-data]: #블록-엔티티에-데이터-담기
[menu]: ../gui/menus.md
[networking]: ../networking/index.md
[payload]: ../networking/payload.md
[blockstate]: ../blocks/states.md
