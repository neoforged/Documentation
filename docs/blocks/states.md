# 블록의 상태

다른 각도로 설치된 계단, 눌러진 갑압판, 열리고 닫힌 문, 이들의 공통점은 한 블록에 여러 종류, 또는 "상태"가 존재한단 것입니다. 반 블록을 예로 들자면, 아래에 배치된 경우, 위에 배치된 경우, 그리고 두개가 겹쳐있는 경우마다 블록을 따로 만드는건 이상하니, 마인크래프트는 하나의 블록이 여러 상태를 부여합니다.

BlockState는 블록의 각 상태를 대표하는 클래스로, 반 블록의 배치, 식물의 성장도 등을 표현하는데 사용합니다.

## BlockState 속성

블록은 속성을 가지고, BlockState는 그 구체적인 값을 표현합니다. 예를 들어 계단의 방향, 식물의 성장도, 갑압판의 활성화 여부 등이 블록의 속성입니다. 한 블록은 여러 개의 속성을 가질 수 있습니다, 예를 들어 엔드 차원문 틀은 엔더의 눈 장착 여부 (`eyes`, 두 가지 경우의 수)와 방향 (`facing`, 네 가지 경우의 수)를 가집니다. 이 둘을 조합해 엔드 차원문은 8개 (2 * 4)의 BlockState를 가집니다:

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

일반적으로 BlockState는 `blockid[property1=value1,property2=value,...]` 형식의 문자열로 표현되며 명령어 문법으로 이용되기도 합니다.

만약 블록에 아무런 속성이 지정되지 않으면 기본값 BlockState 하나만 부여받으며, `minecraft:oak_planks[]` 또는 `minecraft:oak_planks`처럼 단순하게 표현됩니다.

블록과 마찬가지로 블록의 각 상태는 메모리에 하나만 존재합니다. 다시 말해 두 개의 상태를 비교하는데 `==`를 사용할 수 있습니다. `BlockState`는 불변 클래스 입니다; 하위 클래스를 가질 수 없으며 **상호작용과 같은 기능들은 [블록][block] 클래스에서 대신 구현합니다!**

## BlockState를 써야할 때

### 새로운 상태 vs 아예 다른 블록

일반적으로, **이름이 달라진다면, 상태를 추가하는 대신 새로운 블록을 만드세요.** 예를 들어 의자를 만든다고 할 때, 의자의 *방향* 은 블록의 *속성*이니 상태에 추가하는 것이 좋지만, *나무의 종류*가 다른 의자들은 아예 다른 블록이 되어야 합니다.

### BlockState vs [BlockEntity][blockentity]

일반적으로, **상태의 경우의 수가 유한하다면, BlockState를 사용하세요, 만약 무리하게 많은 경우의 수가 존재한다면 블록 엔티티를 사용하세요.** 블록 엔티티는 아무 데이터나 저장할 수 있지만, 블록 상태에 비해 느립니다.

블록의 상태와 블록 엔티티는 같이 사용할 수 있습니다. 예를 들어 상자의 경우, 바라보는 방향, 물에 잠긴 여부, 큰 상자 여부 등은 상태로 표현하고, 인벤토리와 호퍼와의 상호작용은 블록 엔티티로 구현합니다.

"경우의 수가 얼마나 돼야 블록 엔티티를 쓰는게 좋은지"는 확답을 드리긴 어려우나, 2^8~2^9 쯤 되면 블록 엔티티를 쓰는걸 권장드립니다.

## 새로운 상태 추가하기

블록에 새로운 상태를 추가하려면 속성을 사용하세요, 각 속성은 `Property<?>`로 표현됩니다. 직접 `Property<?>`를 구현하셔도 되지만, 마인크래프트가 기본으로 제공하는 것들로도 충분할 겁니다:

- `IntegerProperty`
    - `Property<Integer>`의 하위 클래스. 정수값을 가지는 속성을 정의함. 음수 사용 불가능.
    - `IntegerProperty#create(String 속성이름, int 최솟값, int 최댓값)`를 호출하여 생성할 수 있음.
- `BooleanProperty`
    - `Property<Boolean>`의 하위 클래스. `true` 또는 `false`를 가지는 속성을 정의함.
    - `BooleanProperty#create(String 속성이름)`를 호출하여 생성할 수 있음.
- `EnumProperty<E extends Enum<E>>`
    - `Property<E>`의 하위 클래스. 열거형 클래스의 열거 상수값들을 상태로 가지는 속성을 정의함.
    - `EnumProperty#create(String 속성이름, Class<E> 열거형클래스)`를 호출하여 생성할 수 있음.
    - 열거 상수 일부로 제한 가능(예를 들어 `DyeColor`의 16개의 색상 중 4개만 사용하는 경우). 자세한 내용은 `EnumProperty#create`의 동명 메서드 참고.
- `DirectionProperty`
    - `EnumProperty<Direction>`의 하위 클래스. `Direction`을 사용하는 속성을 정의함.
    - `DirectionProperty#create(String propertyName)`를 호출하여 생성할 수 있음.
    - 평면 위, 또는 특정 좌표축 방향만 사용할 수도 있음. 자세한 내용은 `DirectionProperty#create`의 동명 메서드 참고.

자주 사용하는 블록의 속성들은 `BlockStateProperties`에 정의되어 있습니다. 가능하다면 새로운 속성을 만드시는 것보다 여기서 사전 정의된 속성들을 재사용하세요.

원하시는 속성들을 선택하셨으면, `Block#createBlockStateDefinition`에서 `StateDefinition$Builder#add`에 속성들을 전달해 추가하세요.

모든 블록들은 기본 상태가 필요합니다. 따로 지정되지 않았다면, 모든 속성 값이 기본값인 상태를 사용합니다. 필요하다면 `Block#registerDefaultState(BlockState)`를 생성자에서 호출해 변경하실 수 있습니다.

블록 배치시에 사용되는 상태를 바꾸시려면 `Block#getStateForPlacement`를 재정의하세요. 플레이어의 위치, 각도, 클릭한 블록의 면 등에 따라 다른 블록 상태를 배치할 수 있습니다. 문이나 계단처럼 방향에 따라 다른 블록 상태를 배치할 때 유용합니다.

예를 들어, 엔드 차원문 틀의 경우:

```java
public class EndPortalFrameBlock extends Block {
  // Note: 아래처럼 정적 상수 필드를 만드는 대신 매번 BlockStateProperties에서 참조하실 수도 있습니다.
  // 그렇지만 가시성을 위해 아래 처럼 상수 필드를 만드시는 것을 권장드립니다.
  public static final DirectionProperty FACING = BlockStateProperties.FACING;
  public static final BooleanProperty EYE = BlockStateProperties.EYE;

  public EndPortalFrameBlock(BlockBehaviour.Properties pProperties) {
    super(pProperties);
    // stateDefinition.any()는 무작위 상태를 만들어 반환합니다,
    // 어차피 모든 속성 값을 직접 설정하니 무작위 상태를 사용해도 상관없습니다.
    registerDefaultState(stateDefinition.any()
            .setValue(FACING, Direction.NORTH)
            .setValue(EYE, false)
    );
  }

  @Override
  protected void createBlockStateDefinition(StateDefinition.Builder<Block, BlockState> pBuilder) {
    // 블록의 속성을 여기서 추가합니다
    pBuilder.add(FACING, EYE);
  }

  @Override
  @Nullable
  public BlockState getStateForPlacement(BlockPlaceContext pContext) {
    // BlockPlaceContext에 따라 블록 배치시 무슨 상태를 사용할 지 결정하는 코드.
  }
}
```

## 상태 사용법

블록의 기본 상태는 `Block#defaultBlockState`가 반환합니다. 전술했듯이 기본 상태는 `Block#registerDefaultState`로 변경하실 수 있습니다. 

상태의 속성 값은 `BlockState#getValue(Property<?>)`에 값을 받아올 속성을 전달하여 읽을 수 있습니다. 엔드 차원문 틀을 다시 예로 들자면:

```java
// EndPortalFrameBlock.FACING은 DirectionProperty이며 차원문의 방향을 읽는데 사용합니다
Direction direction = endPortalFrameBlockState.getValue(EndPortalFrameBlock.FACING);
```

각 상태의 속성 값은 `#setValue(Property<T>, T)`로 변경할 수 있습니다. 예를 들어 남쪽을 바라보는 엔드 차원문 틀의 상태를 사용하려면:

```java
endPortalFrameBlockState = endPortalFrameBlockState.setValue(EndPortalFrameBlock.FACING, Direction.SOUTH);
```

:::note
`BlockState`는 불변입니다. `#setValue(Property<T>, T)`를 호출하면 상태를 변형하는게 아니라 요청하신 값을 가진 다른 상태를 찾아 반환합니다.
:::

레벨에서 블록의 상태를 가져오려면 `Level#getBlockState(BlockPos)`를 호출하세요.

### Level#setBlock

레벨에 블록을 배치하려면 `Level#setBlockState(BlockPos, BlockState, int)`를 호출하세요.

여기서 `int` 인자는 블록 업데이트를 구체적으로 어떻게 수행할지를 설정하는 플래그 입니다.

각 플래그들은 `Block`에 정의되여 있으며, 이름은 `UPDATE_`로 시작합니다. 이들은 비트 OR 연산으로 합칠 수 있습니다 (예를 들어`Block.UPDATE_NEIGHBORS | Block.UPDATE_CLIENTS`는 주변 블록을 갱신하고 클라이언트에 변화를 알립니다).

- `Block.UPDATE_NEIGHBORS`는 주위 블록을 갱신합니다. 내부적으로 주위 블록에 `Block#neighborChanged`를 호출합니다. 대개 레드스톤 신호에 쓰입니다.
- `Block.UPDATE_CLIENTS`는 클라이언트에 변경된 블록 정보를 전송합니다.
- `Block.UPDATE_INVISIBLE`는 일부러 클라이언트에 변경된 블록 정보를 보내지 않습니다. `Block.UPDATE_CLIENTS`를 무시합니다.
- `Block.UPDATE_IMMEDIATE`는 클라이언트가 해당 블록을 다시 그리도록 강요합니다.
- `Block.UPDATE_KNOWN_SHAPE`는 주위 블록을 재귀적으로 갱신하는 것을 막습니다.
- `Block.UPDATE_SUPPRESS_DROPS`는 해당 위치에 있던 이전 블록의 노획물이 나오는 것을 막습니다.
- `Block.UPDATE_MOVE_BY_PISTON`는 피스톤이 블록을 움직였다고 표기하는데 사용합니다. 주로 밝기 갱신을 늦추는데 사용합니다.
- `Block.UPDATE_ALL`은 `Block.UPDATE_NEIGHBORS | Block.UPDATE_CLIENTS`와 동일합니다.
- `Block.UPDATE_ALL_IMMEDIATE`는 `Block.UPDATE_NEIGHBORS | Block.UPDATE_CLIENTS | Block.UPDATE_IMMEDIATE`와 동일합니다.
- `Block.NONE`은 `Block.UPDATE_INVISIBLE`와 동일합니다.

참고로 `Level#setBlockAndUpdate(BlockPos, BlockState)`도 있는데, 이는 `setBlock(pos, state, Block.UPDATE_ALL)`과 동일합니다.

[block]: index.md
[blockentity]: ../blockentities/index.md
