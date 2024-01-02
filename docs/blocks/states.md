블록의 상태
=========

점진적으로 자라는 식물, 다양한 배치가 가능한 반블록 등, 하나의 블록에 여러가지의 "상태"를 부여해야 할 떄가 있습니다. 마인크래프트는 Blockstate를 통해 하나의 블록에 여러 상태를 부여합니다.

BlockState 속성
---------------

Blockstate는 블록에 다양한 타입의 속성들을 추가하여 상태를 부여합니다. 예를 들어, 엔드 차원문 틀은 두 개의 속성이 있는데: 눈 존재 여부(`eye`, 경우의 수 2개), 그리고 방향(`facing` 경우의 수 4개) 입니다. 그러므로 엔드 차원문 틀은 8(2 * 4)개의 상태를 가집니다:

```
minecraft:end_portal_frame[facing=north,eye=false]
minecraft:end_portal_frame[facing=east,eye=false]
minecraft:end_portal_frame[facing=south,eye=false]
minecraft:end_portal_frame[facing=west,eye=false]
minecraft:end_portal_frame[facing=north,eye=true]
minecraft:end_portal_frame[facing=east,eye=true]
minecraft:end_portal_frame[facing=south,eye=true]
minecraft:end_portal_frame[facing=west,eye=true]
```

일반적으로 블록 상태는 `blockid[property1=value1,property2=value,...]`식으로 문자열로 표현되며 명령어 문법으로 이용되기도 합니다.

만약 블록에 아무런 블록 상태가 정의되지 않아도, 하나의 블록 상태는 존재합니다. 이 상태는 아무런 속성이 지정되지 않고, `minecraft:oak_planks[]` 또는 `minecraft:oak_planks`처럼 단순하게 표현됩니다.

블록과 마찬가지고 각 블록 상태는 메모리에 하나만 존재합니다. 다시 말해 두 개의 블록 상태를 비교하는데 `==`를 사용할 수 있습니다. `BlockState`는 불변 클래스 입니다, 자식 클래스를 가질 수 없습니다. **실질적인 기능은 [블록][block] 클래스에서 대신 구현합니다!**

블록 상태를 써야할 때
-----------------------

### 블록 상태 vs 아예 다른 블록

일반적으로, **이름이 달라진다면, 블록 상태가 아니라 새로운 블록으로 만드세요.** 예를 들어 의자를 만든다고 할 때, 의자의 *방향* 은 블록의 *속성*이니 블록 상태 시스템을 사용하는 것이 옳지만, *나무의 종류*가 다른 의자들은 아예 다른 블록이 되어야 합니다.

### 블록 상태 vs [블록 엔티티][blockentity]

일반적으로, **경우의 수가 유한하다면, 블록 상태를 사용하세요, 만일 그렇지 않거나 무리하게 많은 경우의 수가 존재한다면 블록 엔티티를 사용하세요.** 블록 엔티티는 아무 데이터나 저장할 수 있지만, 블록 상태보다 느립니다.

블록 상태와 블록 엔티티는 같이 사용할 수 있습니다. 예를 들어 상자의 경우, 바라보는 방향, 물에 잠긴 여부, 큰 상자 여부 등은 블록 상태로 표현하고, 인벤토리와 호퍼와의 상호작용은 블록 엔티티로 구현할 수 있습니다.

"경우의 수가 얼마나 돼야 블록 엔티티를 써야 하는가"에는 확답을 드리긴 어려우나, 2^8~2^9 쯤 되면 블록 엔티티를 쓰는걸 권장드립니다.

블록에 상태 추가하기
---------------------------------------

블록 상태를 통해 속성을 추가하기 위해선, 대상 블록의 클래스에 `public static final Property<?>` 필드를 만들거나 참조하세요. `Property<?>`를 직접 구현하셔도 되지만, 마인크래프트가 기본으로 제공하는 것들로도 충분할 겁니다:

* `IntegerProperty`
  * `Property<Integer>`의 구현. 정수값을 가지는 속성을 정의함. 음수 사용 불가능.
  * `IntegerProperty#create(String 속성이름, int 최솟값, int 최댓값)`를 호출하여 생성할 수 있음.
* `BooleanProperty`
  * `Property<Boolean>`의 구현. `true` 또는 `false`를 가지는 속성을 정의함.
  * `BooleanProperty#create(String 속성이름)`를 호출하여 생성할 수 있음.
* `EnumProperty<E extends Enum<E>>`
  * `Property<E>`의 구현. 열거형 클래스의 열거 상수값을 가지는 속성을 정의함.
  * `EnumProperty#create(String 속성이름, Class<E> 열거형클래스)`를 호출하여 생성할 수 있음.
  * 열거 상수 일부로 제한 가능(예를 들어 `DyeColor`의 16개의 색상 중 4개만 사용하는 경우). 자세한 내용은 `EnumProperty#create`의 동명 메서드 참고.
* `DirectionProperty`
  * `EnumProperty<Direction>`를 확장함. `Direction`을 사용하는 속성을 정의함.
  * `DirectionProperty#create(String propertyName)`를 호출하여 생서할 수 있음.
  * 평면, 특정 좌표축으로 제한하는 기능 지원. 자세한 내용은 `DirectionProperty#create`의 동명 메서드 참고.

`BlockStateProperties`는 이들을 활용한 여러 블록 속성들을 제공합니다. 가능하다면 새로운 속성을 만드시는 것보다 여기서 사전 정의된 속성들을 재사용하세요.

이제 원하시는 속성들을 추가하셨으니, `Block#createBlockStateDefinition(StateDefinition$Builder)`에서 `StateDefinition$Builder#add(위에서_참조한_Property)`를 호출해 블록에 속성을 추가하실 수 있습니다. 이 메서드는 가변 인자를 받으니 위에서 참조한 모든 속성들을 한번에 추가할 수 있습니다.

모든 블록들은 기본 블록 상태가 필요합니다. 따로 지정하지 않으셨다면, 모든 속성값이 기본값인 상태를 사용합니다. 원하신다면 `Block#registerDefaultState(BlockState)`를 생성자에서 호출해 변경하실 수 있습니다.

블록 배치시에 사용되는 블록 상태를 바꾸시려면 `Block#getStateForPlacement(BlockPlaceContext)`를 재정의하세요. 이 메서드는 플레이어가 바라보는 방향에 따라 방향이 다른 블록을 대신 설치하도록 하는 식으로 사용할 수 있습니다.

예를 들어, 엔드 차원문 틀의 경우:

```java
public class EndPortalFrameBlock extends Block {
  // Note: 아래처럼 상수 필드를 만들지 않고 매번 BlockStateProperties에서 참조하실 수도 있습니다.
  // 그렇지만 가시성을 위해 아래 처럼 상수 필드를 만드시는 것을 권장드립니다.
  public static final DirectionProperty FACING = BlockStateProperties.FACING;
  public static final BooleanProperty EYE = BlockStateProperties.EYE;

  public EndPortalFrameBlock(BlockBehaviour.Properties pProperties) {
    super(pProperties);
    // stateDefinition.any()는 무작위 블록 상태를 만들어 반환합니다,
    // 모든 속성을 다시 지정하니 무작위 상태를 사용해도 상관 없습니다.
    registerDefaultState(stateDefinition.any()
            .setValue(FACING, Direction.NORTH)
            .setValue(EYE, false)
    );
  }

  @Override
  protected void createBlockStateDefinition(StateDefinition.Builder<Block, BlockState> pBuilder) {
    // 블록 상태에 속성을 여기서 추가합니다
    pBuilder.add(FACING, EYE);
  }

  @Override
  @Nullable
  public BlockState getStateForPlacement(BlockPlaceContext pContext) {
    // BlockPlaceContext에 따라 블록 배치시 무슨 상태를 사용할 지 결정하는 코드.
  }
}
```

블록 상태 사용법
---------------------

`Block`에서 `BlockState`를 사용하려면 `Block#defaultBlockState`를 호출해 기본 상태에 접근할 수 있습니다. 전술했듯이 `Block#registerDefaultState`를 호출해 기본 상태를 바꿀 수 있습니다. 

`BlockState`의 속성값은 `BlockState#getValue(Property<?>)`에 값을 받아올 속성을 전달하여 읽을 수 있습니다. 엔드 차원문 틀을 다시 예로 들자면:


```java
// EndPortalFrameBlock.FACING은 DirectionProperty이며 BlockState로부터 Direction 값을 읽는데 사용합니다
Direction direction = endPortalFrameBlockState.getValue(EndPortalFrameBlock.FACING);
```

만약 속성값이 다른 `BlockState`에 접근하시려면, 사전에 받아온 `BlockState`에 `#setValue(Property<T>, T)`를 호출해 원하시는 속성값을 지정하세요. 예를 들어 남쪽을 바라보는 엔드 차원문 틀의 상태에 접근한다면:

```java
endPortalFrameBlockState = endPortalFrameBlockState.setValue(EndPortalFrameBlock.FACING, Direction.SOUTH);
```

:::note
`BlockState`는 불변입니다. `#setValue(Property<T>, T)`를 호출해도 블록 상태 자체는 변형되지 않으며, 대신 요청하신 값을 가진 다른 블록 상태를 찾아 반환하며, 여기서 반환된 블록 상태는 요청하신 속성 값을 가진 유일한 객체입니다. 그러므로 `state#setValue`의 결과를 필드에 할당하지 않으면 아무 변화도 일어나지 않습니다.
:::

레벨에서 블록 상태를 가져오려면 `Level#getBlockState(BlockPos)`를 호출하세요.

### Level#setBlock

레벨에 블록 상태를 배치하려면 `Level#setBlockState(BlockPos, BlockState, int)`를 호출하세요.

여기서 `int` 인자는 업데이트를 구체적으로 어떻게 수행할지를 설정하는 비트 플래그 입니다.

`Block` 클래스는 `UPDATE_`로 시작하는 여러 상수가 있습니다. 이 상수들은 비트 OR 연산으로 기능을 합칠 수 있습니다. (예를 들어`Block.UPDATE_NEIGHBORS | Block.UPDATE_CLIENTS`)

- `Block.UPDATE_NEIGHBORS`는 주위 블록에 갱신하라는 신호를 보냅니다. 내부적으로 주위 블록에 `Block#neighborChanged`를 호출합니다. 일반적으로 레드스톤 신호에 쓰입니다.
- `Block.UPDATE_CLIENTS`는 클라이언트에 변경된 블록 정보를 전송합니다.
- `Block.UPDATE_INVISIBLE`는 클라이언트에 일부러 변경된 블록 정보를 보내지 못하도록 합니다. 또한 `Block.UPDATE_CLIENTS`를 무시합니다.
- `Block.UPDATE_IMMEDIATE`는 클라이언트가 해당 블록을 다시 렌더링 하도록 강요합니다.
- `Block.UPDATE_KNOWN_SHAPE`는 주위 블록을 재귀적으로 갱신하는 것을 막습니다.
- `Block.UPDATE_SUPPRESS_DROPS`는 해당 위치에 있던 이전 블록의 노획물이 나오지 않도록 합니다.
- `Block.UPDATE_MOVE_BY_PISTON`는 피스톤이 블록을 움직였다고 표기하는데 사용합니다. 주로 밝기 갱신을 늦추는데 사용합니다.
- `Block.UPDATE_ALL`은 `Block.UPDATE_NEIGHBORS | Block.UPDATE_CLIENTS`와 동일합니다.
- `Block.UPDATE_ALL_IMMEDIATE`는 `Block.UPDATE_NEIGHBORS | Block.UPDATE_CLIENTS | Block.UPDATE_IMMEDIATE`와 동일합니다.
- `Block.NONE`은 `Block.UPDATE_INVISIBLE`와 동일합니다.

추가로 `Level#setBlockAndUpdate(BlockPos, BlockState)`도 있는데, 이는 `setBlock(pos, state, Block.UPDATE_ALL)`과 동일합니다.

[block]: index.md
[blockentity]: ../blockentities/index.md
