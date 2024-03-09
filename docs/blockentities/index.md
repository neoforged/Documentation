블록 엔티티
======

블록 엔티티(`BlockEntity`)는 블록에 종속된 엔티티입니다. 동적으로 변하는 데이터를 저장하거나, 매 틱마다 수행돼야 하는 작업을 하거나, 동적 렌더링을 해야 할 때 등, [`BlockState`][blockstate] 만으로는 구현하기 어려운 기능들을 만들 때 사용합니다. 마인크래프트는 블록 엔티티를 상자 인벤토리, 화로 제련, 신호기의 광역 포션 효과를 구현하는 데에 사용합니다. 더 복잡한 예제들은 굴착기, 아이템 정렬하는 기계, 파이프, 디스플레이 등 다른 모드에서 찾아보실 수 있습니다.

:::note
블록 엔티티는 모든 문제의 만능 해결 방법이 아니며, 남용할 경우 서버에 큰 렉을 유발할 수 있습니다.
가능하다면 다른 방안을 먼저 찾아보세요.
:::

## 등록하기

블록 엔티티는 얼마든지 생성되고 제거될 수 있습니다, 그러다 보니 `BlockEntity` 자체를 레지스트리에 등록하는 대신 그 *종류*를 표현하는 `BlockEntityType`을 레지스트리에 등록합니다.

`BlockEntityType`은 다른 레지스트리 객체들과 똑같이 [등록]됩니다. `BlockEntityType`을 만들기 위해선 먼저 `BlockEntityType$Builder` 가 필요한데, `BlockEntityType$Builder#of`를 호출하여 빌더를 만들 수 있습니다. 이 메서드는 `BlockPos`와 `BlockState`를 인자로 받아 새로운 `BlockEntity` 인스턴스를 만드는 함수, 그리고 해당 `BlockEntity`를 부착할 블록들의 가변 인자를 받습니다. 이후, `BlockEntityType$Builder#build`를 호출하여 `BlockEntityType`을 생성할 수 있습니다. 이 메서드는 `DataFixer`에서 해당 블록 엔티티를 표현해 줄 `Type`을 인자로 받는데, `DataFixer`는 완전히 선택사항이기에 `null`을 전달하셔도 됩니다.

```java
// DeferredRegister<BlockEntityType<?>> REGISTER가 이미 정의되어 있다고 할 때
public static final RegistryObject<BlockEntityType<MyBE>> MY_BE = REGISTER.register("mybe", () -> BlockEntityType.Builder.of(MyBE::new, validBlocks).build(null));


// BlockEntity를 상속하는 MyBE 클래스 내에서
public MyBE(BlockPos pos, BlockState state) {
  super(MY_BE.get(), pos, state);
}
```

## 블록 엔티티 만들기

블록 엔티티를 붙일 블록은 `EntityBlock`을 구현해야 합니다. `#newBlockEntity(BlockPos, BlockState)`에서 블록에 부착할 새 블록 엔티티의 인스턴스를 반환해야 합니다.

## 블록 엔티티에 데이터 담기

블록 엔티티에 데이터를 담기 위해선 아래 두 메서드를 재정의하셔야 합니다:

```java
BlockEntity#saveAdditional(CompoundTag tag) // 전달된 tag에 추가 데이터를 저장함

BlockEntity#load(CompoundTag tag) // 전달된 tag에서 데이터를 불러오고 블록 엔티티에 적용함
```

위 두 메서드는 블록 엔티티가 들어있는 `LevelChunk`를 불러올 때 호출됩니다. 이들을 활용하여 NBT로부터 데이터를 저장하고 불러오세요.

:::note
블록 엔티티의 데이터가 변할 경우 `BlockEntity#setChanged`를 호출해 `LevelChunk`가 해당 블록 엔티티를 저장하도록 해야 합니다.
:::

:::danger
위 메서드를 재정의할 때는 `super`를 무조건 호출하세요! 그렇지 않으면 필수 정보가 누락될 수 있습니다!

그리고, `id`, `x`, `y`, `z`, `ForgeData`, 그리고 `ForgeCaps`는  `super`에서 사용하는 태그들의 이름입니다!
:::

## 블록 엔티티 틱 처리

아이템을 굽는 화로처럼, 1 틱마다 수행되는 작업을 블록 엔티티에 구현하기 위해선 `EntityBlock#getTicker(Level, BlockState, BlockEntityType)`를 재정의 하세요. 이때 논리 사이드에 따라 다른 ticker를 반환하셔도 됩니다. 이 메서드는 레벨, 블록 위치, [블록의 상태][blockstate], 그리고 블록 엔티티를 인자로 받는 함수를 반환하며, 여기서 반환한 함수는 매 틱마다 실행됩니다.

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
복잡한 연산을 여기서 하는 것은 피해야 합니다. 그 대신에, 복잡한 연산은 매 X 틱 마다 하도록 만드는 것도 고려하여 주세요. (초당 틱 횟수(tps)는 최대 20입니다.)
:::

## 클라이언트와 데이터 동기화하기

클라이언트와 데이터를 동기화시킬 방법은 총 3가지가 있는데: 청크를 불러올 때 동기화하기, 블록 업데이트시 동기화 하기, 그리고 커스텀 네트워크 메시지 보내기입니다.

### `LevelChunk` 불러올 때 동기화하기

이를 위해선 다음 두 메서드를 재정의하세요:

```java
BlockEntity#getUpdateTag()

IForgeBlockEntity#handleUpdateTag(CompoundTag tag)
```

* `#getUpdateTag`는 클라이언트로 전송되어야 할 데이터들을 수집합니다,
* `handleUpdateTag`는 수집한 데이터를 처리합니다. 만약 해당 `BlockEntity`에 데이터가 많지 않다면 [`BlockEntity`를 활용한 데이터 저장][데이터-저장하기]에서 소개된 메서드들을 응용하여 `BlockEntity` 전체를 재전송하셔도 됩니다.

:::caution
필요없는 데이터를 동기화하는 것은 네트워크를 혼잡하게 만들 수 있습니다. 그렇기에 클라이언트가 필요한 정보들을 필요할 때만 보내도록 하여 네트워크를 효율적으로 활용해야 합니다. 예를 들어, 블록 엔티티의 인벤토리가 변경될 때마다 클라이언트와 동기화를 하는 대신 [`AbstractContainerMenu`][menu]에서 동기화를 수행해 블록의 메뉴를 열 때만 동기화할 수 있습니다.
:::

### 블록이 업데이트될 때 동기화하기

이 방법은 살짝 더 복잡하지만, 아래 메서드 3개만 재정의하면 됩니다.

```java
BlockEntity#getUpdateTag()

BlockEntity#getUpdatePacket()

IForgeBlockEntity#onDataPacket
```

* `#getUpdatePacket`은 패킷을 포지에서 관리하도록 다른 패킷으로 대체할 때 사용합니다. 
* `#onDataPacket`은 패킷이 도착할 때 호출됩니다. 논리 서버 및 클라이언트 둘 다 호출될 수 있습니다.

```java
@Override
public CompoundTag getUpdateTag() {
  CompoundTag tag = new CompoundTag();
  // tag에 블록 엔티티 데이터 작성
  return tag;
}

@Override
public Packet<ClientGamePacketListener> getUpdatePacket() {
  // #getUpdateTag를 호출하여 전송할 tag를 가져옵니다
  return ClientboundBlockEntityDataPacket.create(this);
}

// IForgeBlockEntity#onDataPacket을 재정의하는 것은 선택사항입니다. 기본적으로 #load를 호출합니다.
```

이때 여기서 사용된 정적 생성자 `ClientboundBlockEntityDataPacket#create`는 아래 2개의 인자를 받습니다:

* `BlockEntity`.
* 블록 엔티티로 `CompoundTag`를 만드는 함수(`Function<BlockEntity, CompoundTag>`). 기본값으로 `BlockEntity#getUpdateTag`를 사용합니다.

이제 서버측에서 블록 업데이트를 클라이언트들에 전송할 수 있습니다.

```java
Level#sendBlockUpdated(BlockPos pos, BlockState oldState, BlockState newState, int flags)
```

`pos`는 업데이트할 블록 엔티티의 위치입니다.
`oldState`랑 `newState`는 해당 위치의 [블록의 상태][blockstate]를 전달하시면 됩니다.
`flags`는 무슨 정보를 보내고 업데이트할지 설정하는 비트 마스크들로, `2`(LSB 두 번째 비트), 또는 `Block#UPDATE_CLIENTS`를 포함하고 있어야 합니다. 그래야 서버가 클라이언트들에 업데이트 패킷을 전송합니다. `Block` 클래스를 참고하여 다른 플래그들의 역할 또한 볼 수 있습니다.

### 커스텀 네트워크 메시지로 동기화하기

이 방법은 가장 복잡하지만, 그러기에 동기화를 해야 하는 정보들만 실제로 동기화가 되도록 세밀하게 조절할 수 있습니다. 먼저 [네트워킹][네트워크-통신]에 대해 미리 숙지하시는 걸 권장드립니다, 특히 [`CustomPacketPayload`][custom_payload]에 대해 잘 알고 계셔야 합니다.

커스텀 메시지는 해당 블록 엔티티를 추적하고 있는 모든 클라이언트에 `SimpleChannel#send(PacketDistributor$PacketTarget, MSG)`를 통해 단번에 보낼 수 있습니다.
이때 사용하는 `PacketDistributor`는 `TRACKING_ENTITY`입니다.

:::caution
플레이어에게 패킷이 전달되었을 때는 해당 블록 엔티티가 부서지거나 다른 블록으로 대체되어 레벨에 존재하지 않을 수도 있습니다. 그렇기 때문에 블록이 진짜 존재하는지 무조건 확인하셔야 합니다! 또한 해당 블록 엔티티가 들어있는 청크가 존재하는지도 확인하셔야 합니다! (`Level#hasChunkAt(BlockPos)`).
:::

[등록]: ../concepts/registries.md#객체-등록하기
[데이터-저장하기]: #블록-엔티티에-데이터-담기
[네트워크-통신]: ../networking/index.md
[custom_payload]: ../networking/payload.md
[blockstate]: ../blocks/states.md
[menu]: ../gui/menus.md