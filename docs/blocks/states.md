블록의 상태
============

구버전에서 블록의 여러 상태 표현하기
---------------------------------------

마인크래프트 1.7 이하 버전에서는 블록 엔티티 없이 블록의 배치와 같은 상태를 저장하기 위해서는 **메타 데이터**를 사용하여야만 했습니다. 메타데이터는 블록과 함께 저장되는 정수로, 블록의 회전 방향, 배치, 또는 블록의 종류 등을 저장하는 데에 사용되었습니다. (예: `ladder:2`)

그렇지만, 메타데이터 시스템은 쓰기도 어렵고 제한적이며 헷갈리기만 했습니다, 당연하게도 모든 정보를 블록 ID 옆에 다는 정수 하나에다 담으려고 하다 보니, 각 숫자가 무슨 의미인지 파악하기가 힘들었습니다. 예를 들어 계단과 같이 여러 배치가 존재하는 블록은 다음과 같이 정의해야만 했습니다.

```java
switch (meta) {
  case 0: { ... } // 앞
  case 1: { ... } // 뒤
  case 2: { ... } // 왼쪽
  case 3: { ... } // 오른쪽
  // .......
}
```

하지만 메타 데이터는 블록의 상태를 잘 전달하지 못하며 다루기 어렵습니다.

`BlockState`의 등장
---------------------------------------

마인크래프트 1.8부터 메타데이터 시스템은 폐기되었고 **블록 상태 시스템**으로 대체되었습니다. 이는 블록이 가지는 여러 상태들을 속성값들에 따라 자동으로 만들어주고 구분하기 쉽게 만들어 줍니다.

블록의 각 *속성*들은 `Property<T>`로 대표되는데, 그 예로: 악기 소리 종류 (`EnumProperty<NoteBlockInstrument>`), 바라보는 방향 (`DirectionProperty`), 레드스톤 신호 여부 (`Property<Boolean>`) 등이 있습니다.

`BlockState`는 블록의 각 속성값들의 조합과 `Block` 사이의 고유한 짝입니다. 예를 들어:
* `oak_chair[facing=north]` - 블록 `oak_chair`와 속성값 `DirectionProperty`의 경우의 수중 하나인 `north` 간의 짝
* `sculk_sensor[power=15,sculk_sensor_phase=cooldown,waterlogged=true]` - 블록 `sculk_sensor`와 속성값 `power`, `sculk_sensor_phase`, `waterlogged`의 경우의 수 (15, "cooldown", `true`) 간의 짝

블록 상태 시스템이 다루기도 편하고 덜 헷갈리다 보니 메타 데이터 시스템을 완전히 대체하였습니다. 플레이어가 누루고 있는 동쪽을 바라보고 있는 돌 버튼은 이전에는 `minecraft:stone_button` 에 메타데이터 값 `9` 로 표현되었던 반면 이제는 `minecraft:stone_button[facing=east,powered=true]` 로 나타낼 수 있습니다.


:::note
게임이 시작되는 동안 가능한 모든 조합의 `BlockState` 들이 생성되며 이들은 모두 불변입니다. 경우의 수가 매우 많은 `BlockState`를 만들 경우 게임을 불러오는 속도가 매우 느려질 수 있습니다.

만약 경우의 수가 너무 많다면 블록 엔티티와 같은 다른 방안을 사용하시길 바랍니다.
:::

:::note
**만약 블록이 다른 이름을 가진다면, 또 다른 블록 상태가 아니라 새로운 블록이 되어야 합니다**.

예를 들어 의자를 만든다고 할 때: 의자의 *방향* 은 블록의 *속성*이니 블록 상태 시스템을 사용하는 게 옳지만, *나무의 종류*가 다른 의자들은 아예 다른 블록이 되어야 합니다.
동쪽을 바라보는 "참나무 의자" (`oak_chair[facing=east]`)는 서쪽을 바라보는 "가문비나무 의자" (`spruce_chair[facing=west]`)와는 다른 블록입니다.
:::


블록에 상태 추가하기
---------------------------------------

상태를 추가할 블록의 클래스에 모든 속성들을 `static final` 필드들로 정의하세요. 이때 직접 `Property<?>` 클래스를 구현하여 새로운 속성값을 만드셔도 되지만, 바닐라 마인크래프트는 이미 다수의 유용한 속성값을 정의하기 쉽도록 아래 클래스들을 제공합니다:

* `IntegerProperty`
  * `Property<Integer>`의 구현. 정수값을 가지는 속성을 정의함.
  * `IntegerProperty#create(String 속성이름, int 최솟값, int 최댓값)`를 호출하여 생성할 수 있음.
* `BooleanProperty`
  * `Property<Boolean>`의 구현. `true` 또는 `false`를 가지는 속성을 정의함.
  * `BooleanProperty#create(String 속성이름)`를 호출하여 생성할 수 있음.
* `EnumProperty<E extends Enum<E>>`
  * `Property<E>`의 구현. 열거형 클래스의 열거 상수값을 가지는 속성을 정의함.
  * `EnumProperty#create(String 속성이름, Class<E> 열거형클래스)`를 호출하여 생성할 수 있음.
  * 열거 상수 일부로 제한 가능(예를 들어 `DyeColor`의 16개의 색상 중 4개만 사용하는 경우). 자세한 내용은 `EnumProperty#create`의 동명 메서드 참고.
* `DirectionProperty`
  * `EnumProperty<Direction>`를 조금 더 간소화시킨 구현.
  * 평면, 특정 좌표축으로 제한하는 기능 지원. 자세한 내용은 `DirectionProperty#create`의 동명 메서드 참고.

`BlockStateProperties`는 이들을 활용한 여러 블록 속성들을 제공합니다. 가능하다면 새로운 속성을 만드시는 것보다 여기서 사전 정의된 속성들을 재사용하세요.

이제 원하시는 속성들을 추가하셨으니, `Block#createBlockStateDefinition(StateDefinition$Builder)`에서 `StateDefinition$Builder#add(...)`를 호출해 블록에 속성을 추가하실 수 있습니다.

모든 블록들은 기본값 `BlockState`가 필요합니다. 이는 자동으로 결정되지만 원하신다면 `Block#registerDefaultState(BlockState)`를 생성자에서 호출해 변경하실 수 있습니다. 이 기본값은 블록 배치시 사용됩니다. 예를 들어 `DoorBlock` 의 경우:

```java
this.registerDefaultState(
  this.stateDefinition.any()
    .setValue(FACING, Direction.NORTH)
    .setValue(OPEN, false)
    .setValue(HINGE, DoorHingeSide.LEFT)
    .setValue(POWERED, false)
    .setValue(HALF, DoubleBlockHalf.LOWER)
);
```

블록 배치 시 상황에 따라 기본값 이외의 다른 `BlockState`를 사용하시려면 `Block#getStateForPlacement(BlockPlaceContext)`를 재정의하세요. 이 메서드는 플레이어가 바라보는 방향에 따라 방향이 다른 블록을 대신 설치하도록 하는 등 응용 방법이 많습니다.

블록 상태 사용법
---------------------

`BlockState`의 속성값은 `BlockState#getValue(Property<?>)`로 받아오고, `BlockState#setValue(Property<T>, T)`로 바꿉니다. 근데 전술했듯이 `BlockState`는 불변이라, 진짜 `BlockState`를 수정하는 대신, 게임을 불러올 때 생성한 다른 `BlockState`를 대신 반환합니다.

각 `BlockState`는 고유하기 때문에 비교할 때 `Object#equals` 말고 `==`를 사용하셔도 됩니다.

레벨에 블록을 배치하거나 무엇이 있는지 확인하고 싶으시다면 `Level#getBlockState(BlockPos)` 또는 `Level#setBlockAndUpdate(BlockPos, BlockState)`를 호출하시면 됩니다. 원하시는 블록 상태가 따로 있다면 `Block#defaultBlockState()`를 호출하여 블록 상태의 기본값을 받고, `BlockState#setValue(Property<T>, T)`를 호출해 속성값들을 맞춘 다음 설치하시면 됩니다.
