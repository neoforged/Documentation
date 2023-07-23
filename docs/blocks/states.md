블록의 상태
============

구버전에서 블록의 여러 상태 표현하기
---------------------------------------

마인크래프트 1.7 이하 버전에서는 블록 엔티티 없이 블록의 배치와 같은 상태를 저장하기 위해서는 **메타 데이터**를 사용하여야만 했습니다. 메타데이터는 블록과 함께 저장되는 정수로, 블록의 회전 방향, 배치, 또는 블록의 종류 등을 저장하는데에 사용되었습니다. (예: `ladder:2`)

그렇지만, 메타데이터 시스템은 쓰기도 어렵고 제한적이며 햇갈리기만 했습니다, 당연하게도 모든 정보를 블록 ID 옆에 다는 정수 하나에다 담으려고 하다보니, 각 숫자가 무슨 의미인지 파악하기가 힘들었습니다. 예를 들어 계단과 같이 여러 배치가 존재하는 블록은 다음과 같이 정의해야만 했습니다.

```java
switch (meta) {
  case 0: { ... } // 앞
  case 1: { ... } // 뒤
  case 2: { ... } // 왼쪽
  case 3: { ... } // 오른쪽
  // .......
}
```

네... 메타데이터의 경우의 수가 많아지면 머리가 아플 겁니다.

`BlockState`의 등장
---------------------------------------

마인크래프트 1.8부터 메타데이터 시스템은 폐기되었고 **블록 상태 시스템**으로 대체되었습니다. 이는 블록이 가지는 여러 상태들을 속성값들에 따라 자동으로 만들어주고 구분하기 쉽게 만들어 줍니다.

블록의 각 *속성*들은 `Property<T>` 의 인스턴스로 정의되는데, 그 예로: 악기 소리 종류 (`EnumProperty<NoteBlockInstrument>`), 바라보는 방향 (`DirectionProperty`, `EnumProperty<Direction>`을 상속함), 레드스톤 신호 여부 (`Property<Boolean>`) 등이 있습니다.

`BlockState`는 블록의 각 속성값들의 조합과 `Block` 사이의 고유한 짝입니다. 예를 들어:
* `oak_chair[facing=north]` - 블록 `oak_chair`와 속성값 `DirectionProperty`의 경우의 수중 하나인 `north` 간의 짝
* `sculk_sensor[power=15,sculk_sensor_phase=cooldown,waterlogged=true]` - 블록 `sculk_sensor`와 속성값 `power`, `sculk_sensor_phase`, `waterlogged`의 경우의 수 (15, "cooldown", `true`)간의 짝

블록 상태 시스템이 다루기도 편하고 덜 햇갈리다 보니 메타 데이터 시스템을 완전히 대체하였습니다. 플레이어가 누루고 있는 동쪽을 바라보고 있는 돌 버튼은 이전에는 `minecraft:stone_button` 에 메타데이터 값 `9` 로 표현되었던 반면 이제는 `minecraft:stone_button[facing=east,powered=true]` 로 나타낼 수 있습니다.


:::note
게임이 시작되는 동안 가능한 모든 조합의 `BlockState` 들이 생성되며 이들은 모두 불변입니다. 다시 경우의 수가 매우 많은 `BlockState`를 만들 경우 게임을 불러오는 속도가 매우 느려질 수 있습니다.

만약 경우의 수가 너무 많다면 블록 엔티티와 같은 다른 방안을 사용하시길 바랍니다.
:::

:::note
**만약 블록이 다른 이름을 가진다면, 또 다른 블록 상태가 아니라 새로운 블록이 되어야 합니다**.
:::

예를 들어 의자를 만든다고 할 때: 의자의 *방향* 은 블록의 *속성*이니 블록 상태 시스템을 사용하는게 옳지만, *나무의 종류*가 다른 의자들은 아예 다른 블록이 되어야 합니다.
동쪽을 바라보는 "참나무 의자" (`oak_chair[facing=east]`) 는 서쪽을 바라보는 "가문비 나무 의자" (`spruce_chair[facing=west]`) 와는 다른 블록입니다.

블록에 상태 추가하기
---------------------------------------

상태를 추가할 `Block` 클래스에 그 블록이 가질 수 있는 모든 속성들을 `static final` 필드들로 정의하세요. 이때 직접 `Property<?>` 클래스를 구현하여 새로운 속성값을 만드셔도 됩니다. 바닐라 마인크래프트는 이미 다수의 유용한 속성값을 정의하기 쉽도록 아래 클래스들을 제공합니다:

* `IntegerProperty`
  * `Property<Integer>` 의 구현. 정수값을 가지는 속성을 정의함.
  * `IntegerProperty#create(String 속성이름, int 최솟값, int 최댓값)`를 호출하여 생성할 수 있음.
* `BooleanProperty`
  * `Property<Boolean>` 의 구현. `true` 또는 `false` 값을 가지는 속성을 정의함.
  * `BooleanProperty#create(String 속성이름)`를 호출하여 생성할 수 있음.
* `EnumProperty<E extends Enum<E>>`
  * `Property<E>` 의 구현. 열거형 클래스의 열거 상수값을 가지는 속성을 정의함.
  * `EnumProperty#create(String 속성이름, Class<E> 열거형클래스)`를 호출하여 생성할 수 있음.
  * 사실 열거형 클래스의 열거상수중 일부만 값으로 가지도록 할 수도 있습니다. (예를 들어 `DyeColor` 의 16개의 색상중 4개만 사용하는 경우). 자세한 내용은 `EnumProperty#create`의 오버로드들을 참고하세요.
* `DirectionProperty`
  * `EnumProperty<Direction>`를 조금 더 간소화시킨 구현.
  * 여러 편리한 기능들도 제공하는데, 예를 들어 앞, 뒤, 양 옆 방향만 사용하시려면 `DirectionProperty.create("<name>", Direction.Plane.HORIZONTAL)`를 호출하세요. X축 방향 속성을 정의려면 `DirectionProperty.create("<name>", Direction.Axis.X)`를 호출하세요.

`BlockStateProperties` 에는 바닐라 마인크래프트에서 제공하는 속성들이 있습니다, 그리고 가능하다면 새로운 속성을 만드시는 것 보다 이 클래스에서 제공하는 속성들을 재사용하세요.

이제 원하시는 속성을 `Property<?>`로 정의하였으니, `Block#createBlockStateDefinition(StateDefinition$Builder)`를 재정의하여 `StateDefinition$Builder#add(...)`를 호출해 블록에 속성을 추가하실 수 있습니다.

모든 블록들은 가지고 있는 여러 `BlockState`들중 하나는 기본값으로 둡니다. 이 기본값은 자동으로 결정되지만 원하신다면 `Block#registerDefaultState(BlockState)`를 블록의 생성자에서 호출하여 변경하실 수 있습니다. 이 기본 상태는 블록을 배치할 때 가질 상태로 사용됩니다. 예를 들어 `DoorBlock` 의 경우:

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

블록을 설치할 때 상황에 따라 기본 `BlockState` 말고 다른 `BlockState`를 사용하도록 하고 싶으시다면 `Block#getStateForPlacement(BlockPlaceContext)`를 재정의하세요. 이 메서드는 플레이어가 바라보는 방향에 따라 방향이 다른 블록을 대신 설치하도록 하는 등 응용 방법이 많습니다.

블록의 속성 써보기
---------------------

어떤 `BlockState`의 속성값을 알고 싶으시다면 `BlockState#getValue(Property<?>)`를 호출하여 속성 값을 받아올 수 있습니다.
만약 `BlockState`의 특정 속성값을 변경하시고 싶으시다면 `BlockState#setValue(Property<T>, T)`를 통해 바꾸실 있습니다. 근데 `BlockState`들은 다 불변이라, 실제로 `BlockState`를 수정하는 것이 아닌, 게임을 불러올 때 생성한 다른 `BlockState`를 대신 반환합니다.

또한 `BlockState` 두개를 비교할 때 `Object#equals` 가 아니라 `==` 로 비교하셔도 됩니다.

레벨의 특정 위치에 블록을 배치하거나 무엇이 있는지 확인하고 싶으시다면 `Level#getBlockState(BlockPos)` 또는 `Level#setBlockAndUpdate(BlockPos, BlockState)`를 호출하시면 됩니다. 이때 원하시는 블록 상태가 따로 있다면 `Block#defaultBlockState()`를 호출하여 블록 상태의 기본값을 받아온 이후, `BlockState#setValue(Property<T>, T)`를 호출해 속성값들을 맞춘 다음 설치하시면 됩니다.
