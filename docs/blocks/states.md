블록의 상태
============

구버전의 블록 상태
---------------------------------------

마인크래프트 1.7 이하 버전에서는 블록 엔티티를 사용하지 않고, 블록의 배치나 상태를 저장하기 위해서는 **메타 데이터**를 사용하여야만 했습니다. 메타데이터는 블록과 함께 저장되는 정수로, 블록의 회전 방향, 배치, 또는 블록의 종류 등을 저장하는데에 사용되었습니다.

그렇지만, 메타데이터 시스템은 쓰기도 어렵고 제한적이며 햇갈리기만 했습니다, 당연하게도 모든 정보를 블록 ID 옆에 다는 정수 하나로만 저장하려고 하다보니, 각 숫자가 무슨 의미인지 파악하기가 힘들었습니다. 예를 들어 계단처럼 방향이 있으면서 완전히 꽉 채워지진 않은 블록은 다음과 같이 정의해야만 했습니다.

```java
switch (meta) {
  case 0: { ... } // 남쪽을 바라보고 있고 아래에 배치되어 있음
  case 1: { ... } // 남쪽을 바라보고 있고 위쪽에 배치되어 있음
  case 2: { ... } // 북쪽을 바라보고 있고 아래에 배치되어 있음
  case 3: { ... } // 북쪽을 바라보고 있고 위쪽에 배치되어 있음
  // .......
}
```

위처럼, 정수 하나만으로 블록의 상태를 저장하면 각 숫자가 무슨 의미를 가지는지 알 수 없기 때문에 소스코드 없이는 블록의 현재 상태를 알 수 없었습니다.

`BlockState`의 등장
---------------------------------------

마인크래프트 1.8부터 메타데이터 시스템은 폐기되었고 **블록 상태 시스템**으로 대체되었습니다. 블록 상태 시스템은 블록의 각 속성들을 추상화하고 블록의 기능과 분리해냅니다.

블록의 각 *속성*들은 `Property<?>` 의 인스턴스로 설명되는데, 그 예로: 악기 (`EnumProperty<NoteBlockInstrumenet>`), 바라보는 방향 (`DirectionProperty`), 레드스톤 신호 여부 (`Property<Boolean>`) 등이 있습니다. 각 속성들의 속성값의 자료형은 `Property<T>` 에 전달되는 타입 인자 `T` 입니다.

블록 상태 시스템은 `Block`을 `Property<?>` 와 가능한 모든 속성값들로 만든 맵과 짝을 지어놓는데, 이 고유한 짝을 `BlockState` 라고 합니다.

블록 상태 시스템이 다루기도 편하고 덜 햇갈리다 보니 메타 데이터 시스템을 완전히 대체하였습니다. 플레이어가 누루고 있는 동쪽을 바라보고 있는 돌 버튼은 이전에는 `minecraft:stone_button` 에 메타데이터 값 `9` 로 표현되었던 반면 이제는 `minecraft:stone_button[facing=east,powered=true]` 로 나타낼 수 있습니다.

블록 상태 시스템을 올바르게 사용하는 방법
---------------------------------------

블록 상태 시스템이 유연하고 강력한 것은 맞지만, 그렇다고 만능은 아닙니다. `BlockState` 들은 불변입니다, 게임이 시작되는 동안 가능한 모든 조합의 `BlockState` 들이 생성됩니다. 다시 말해서, 경우의 수가 매우 많은 `BlockState`를 만들 경우 게임을 불러오는 속도가 매우 느려질 수 있으며, 블록의 메카닉을 이해하기도 어려워 질 것입니다.

모든 블록들이 블록 상태 시스템을 사용할 필요는 없으며, 블록의 가장 간단한 속성들만 블록 상태 시스템으로 표현해야 합니다, 그 외에 블록 엔티티를 사용하거나 아예 또 다른 블록을 만드는 것 또한 고려해주세요, 그리고 언제나 블록 상태 시스템을 사용하는 것이 옳은 일인지 고려해주세요.

:::note
팁: **만약 블록이 다른 이름을 가진다면, 또 다른 블록 상태가 아니라 새로운 블록이 되어야 합니다**.
:::

예를 들어 의자를 만든다고 할 때: 의자의 *방향* 은 블록의 *속성*이니 블록 상태 시스템을 사용하는게 옳지만, *나무의 종류*가 다른 의자들은 아예 다른 블록이 되어야 합니다.
동쪽을 바라보는 "참나무 의자" (`oak_chair[facing=east]`) 는 서쪽을 바라보는 "가문비 나무 의자" (`spruce_chair[facing=west]`) 와는 다른 블록입니다.

블록에 상태 추가하기
---------------------------------------

현재 만들고 계신 `Block` 클래스에 그 블록이 가질 수 있는 모든 속성들을 `static final` 로 정의된 `Property<?>` 객체들을 생성하거나 참조하여 표현하세요. 원하신다면 직접 `Property<?>` 클래스를 구현하여도 됩니다만, 이 문서에서는 이에 대해 다루진 않겠습니다. 바닐라 마인크래프트는 이미 쓸만한 이 클래스의 구현들을 여러개 제공하고 있습니다:

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

이제 원하시는 `Property<>` 객체가 있으니, 블록의 `Block#createBlockStateDefinition(StateDefinition$Builder)` 메서드를 재정의하세요. 이때 블록에 추가할 `Property<?>`를 `StateDefinition$Builder#add(...);` 에 인자로 전달해 호출하여 속성들을 블록에 추가하실 수 있습니다.

모든 블록들은 블록 상태의 "기본값", 또는 기본 상태가 있습니다. 이 기본 상태는 자동으로 결정되지만 원하신다면 `Block#registerDefaultState(BlockState)`를 블록의 생성자에서 호출하여 변경하실 수 있습니다. 이 기본 상태는 블록이 설치 될 때 가질 상태로 사용됩니다. 예를 들어 `DoorBlock` 의 경우:

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

`BlockState` 는 불변이고, 가능한 모든 `BlockState` 들이 게임을 불러올 때 생성되니, `BlockState#setValue(Property<T>, T)`를 호출하면 블록 상태에 저장된 속성값을 수정하는 것이 아니라 해당 값이 이미 들어있는 `BlockState`를 `Block` 의 `StateHolder`를 통해 요청하여 받아옵니다.

또한 `BlockState` 두개를 비교할 때 `Object#equals` 가 아니라 `==` 로 비교하셔도 됩니다.

블록의 속성 써보기
---------------------

`BlockState#getValue(Property<?>)`를 호출하여 해당 블록 상태의 속성 값을 받아올 수 있습니다, 이때 인자로 전달하는 속성은 구체적인 값을 얻으려는 속성입니다.
만약 해당 속성으로 다른 값을 가지고 있는 블록 상태를 얻고 싶다면 `BlockState#setValue(Property<T>, T)`를 속성과 속성 값을 전달하여 호출하시면 됩니다.

레벨의 특정 위치에 블록을 배치하거나 무엇이 있는지 확인하고 싶으시다면 `Level#getBlockState(BlockPos)` 또는 `Level#setBlockAndUpdate(BlockPos, BlockState)`를 호출하시면 됩니다. 이때 원하시는 블록 상태가 따로 있다면 `Block#defaultBlockState()`를 호출하여 블록 상태의 기본값을 받아온 이후, `BlockState#setValue(Property<T>, T)`를 호출해 속성값들을 맞춘 다음 설치하시면 됩니다.
