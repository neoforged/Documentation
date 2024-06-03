# 블록

블록은 마인크래프트의 핵심 요소로 레벨을 구성합니다. 지형과 구조물, 그리고 기계들 전부 블록들로 이루어져 있습니다. 이번장에서는 블록 제작의 핵심과 응용 방안들에 대해 다루겠습니다.

## 블록 하나 우려먹기

시작하기 전에, 먼저 게임 속 블록은 하나씩만 존재한다는 사실을 염두하셔야 합니다. 예를 들어 레벨에 존재하는 수천 개의 돌 블록은 전부 하나의 돌 블록을 재사용하는 것입니다.

그렇기 때문에 각 블록은 한번씩만, 그것도 [레지스트리][registration] 초기화 중에 생성되어야 하며, 블록을 사용해야 하면 이미 등록된 것을 참조하세요.

다른 레지스트리들과 다르게 블록은 블록 전용으로 확장된 `DeferredRegister.Block`을 사용할 수 있습니다. `DeferredRegister<Block>`과의 차이점은:

- `DeferredRegister.create(...)` 대신 `DeferredRegister.createBlocks("yourmodid")`으로 생성함.
- `#register`가 `DeferredBlock<T extends Block>`을 대신 반환함, 이는 `DeferredHolder<Block, T>`의 하위 타입임. 여기서 `T`는 등록할 블록의 타입.
- 블록 등록을 간소화 시켜줄 여러 유틸리티 메서드가 있음. 자세한 사항은 [아래][below] 참고.

이제 블록을 직접 만들어 보겠습니다:

```java
//BLOCKS는 DeferredRegister.Blocks라 가정
public static final DeferredBlock<Block> MY_BLOCK = BLOCKS.register("my_block", () -> new Block(...));
```

블록을 등록한 이후, `my_block`을 써야 한다면 위 상수를 사용하세요. 예를 들어 어떤 좌표에 존재하는 블록이 `my_block`인지 확인하고 싶다면, 다음과 같이 구현할 수 있습니다:

```java
level.getBlockState(position) // 해당 좌표에 존재하는 블록의 상태를 가져옴
        //highlight-next-line
        .is(MyBlockRegistrationClass.MY_BLOCK);
```

블록은 하나씩만 존재하기 때문에 Java의 `equals` 대신 `block1 == block2`를 사용할 수 있습니다 (`equals`도 작동하긴 하나 필요 없습니다).

:::danger
레지스트리 초기화 중 이외에 `new Block()`을 호출하지 마세요! 아래와 같은 문제가 발생할 수 있습니다:

- 블록은 무조건 레지스트리가 동결되기 이전에 생성되어야 합니다. 네오 포지는 일시적으로 레지스트리를 해동하기에 이 때만 등록할 수 있습니다.
- 만약 레지스트리가 이미 동결된 이후 등록하려고 한다면, 나중에 해당 블록을 참조할 시 `null`이 대신 반환됩니다.
- 어떻게든 등록이 잘못된 블록을 사용하시면 나중에 다시 참조할 수 없어 저장된 월드를 불러올 때 공기로 대체됩니다.
:::

## 블록 만들기

위에서 말했듯이 먼저 `DeferredRegister.Blocks`를 만드는 것으로 시작합니다.

```java
public static final DeferredRegister.Blocks BLOCKS = DeferredRegister.createBlocks("yourmodid");
```

### 단순한 블록

특별한 기능이 없는 블록들은(조약돌이나 나무판자 등) `Block`의 새 인스턴스를 만드는 것으로 충분합니다. `Block`은 `BlockBehaviour$Properties`를 생성자 인자로 받습니다. `BlockBehaviour$Properties`는 블록의 특성을 저장하는 객체입니다. `BlockBehaviour$Properties#of`로 생성하고 아래 메서드들을 통해 블록의 특성을 원하시는 대로 바꾸실 수 있습니다.

- `destroyTime` - 블록을 파괴하는 데 걸리는 시간을 지정함.
    - 돌은 1.5, 흙은 0.5, 흑요석은 50, 기반암은 -1(부술 수 없음).
- `explosionResistance` - 블록의 폭발 저항력을 지정함.
    - 돌은 6.0, 흙은 0.5, 흑요석은 1,200, 기반암은 3,600,000.
- `sound` - 블록을 주먹으로 치거나, 캐거나, 설치 시 나는 소리를 지정함.
    - 이 설정의 기본값은 `SoundType.STONE`. 자세한 사항은 [소리][sounds] 참고.
- `lightLevel` - 블록의 밝기를 지정. `BlockState`를 0~15 범위의 정수로 바꾸는 함수를 값으로 받음.
    - 발광석은 `state -> 15`, 횃불은 `state -> 14`를 사용함.
- `friction` - 블록의 마찰력, 또는 미끄러운 정도를 지정함.
    - 기본값은 0.6, 얼음은 0.98.

그리고 위 메서드들은 아래처럼 사용하실 수 있습니다:

```java
//BLOCKS는 DeferredRegister.Blocks라 가정
public static final DeferredBlock<Block> MY_BETTER_BLOCK = BLOCKS.register(
        "my_better_block", 
        () -> new Block(BlockBehaviour.Properties.of()
                //highlight-start
                .destroyTime(2.0f)
                .explosionResistance(10.0f)
                .sound(SoundType.GRAVEL)
                .lightLevel(state -> 7)
                //highlight-end
        ));
```

자세한 사항은 `BlockBehaviour#Properties` 소스코드 또는 `Blocks`의 예시들을 참고하세요.

:::note
인벤토리에 들어있는 블록과 레벨에 설치된 블록은 다른 객체입니다. 인벤토리에 있는 블록은 사실 `BlockItem`입니다. `BlockItem`은 `Item`의 하위 클래스로, 우클릭 시 레벨에 블록을 설치하는 등의 상호작용 기능들이 구현되어 있습니다. 또한, `BlockItem`은 최대 아이템 개수나 지정될 크리에이티브 탭 등의 아이템 속성들을 자동으로 지정합니다.

`BlockItem`도 따로 [등록][registration]해야 합니다. 일부 블록은 아이템이 없어도 되기 때문입니다(그 예로 불이 있습니다).
:::

### 기능 추가

`Block` 클래스는 매우 기초적인 블록에만 바로 사용할 수 있습니다. 블록에 상호작용 등의 기능을 추가하시려면 `Block`의 하위 클래스를 직접 만드셔야 합니다. `Block`은 재정의할 수 있는 여러 메서드들을 제공하여 다양한 기능을 추가할 수 있습니다. 자세한 사항은 `Block`, `BlockBehaviour`, `IBlockExtension`을 참고하세요. 아래 [블록 써보 기][usingblocks]도 확인해 유용한 기능 제작법도 볼 수 있습니다.

만약 여러 상태가 존재하는 블록을 만든다면 (예를 들어 아래, 위, 또는 두 겹으로 배치될 수 있는 반 블록), [블록의 상태(BlockState)][blockstates]를 사용하실 수 있습니다. 또한, 추가 데이터를 저장할 수 있는 블록을 만든다면 (예를 들어 인벤토리가 있는 상자), [블록 엔티티][blockentities]를 대신 사용하세요. 이 둘 중 무엇을 사용하느냐는 대개 블록이 표현할 수 있는 경우의 수가 유한하다면 블록의 상태를, 경우의 수가 무한이 많다면 블록 엔티티를 사용하세요(예를 들어 상자는 인벤토리의 모든 아이템의, 모든 개수의 모든 배치를, 다른 모드까지 고려해야 하기에 블록 엔티티가 적합합니다).

### `DeferredRegister.Blocks`의 기능

[위][above]에서 `DeferredRegister.Blocks`를 만드는 방법과, `DeferredBlock`에 대해 배웠습니다. 이제 추가 기능에 대해 살펴보겠습니다, 먼저 `#registerBlock`이 있습니다:

```java
public static final DeferredRegister.Blocks BLOCKS = DeferredRegister.createBlocks("yourmodid");

public static final DeferredBlock<Block> EXAMPLE_BLOCK = BLOCKS.registerBlock(
        "example_block",
        Block::new, // 아래 속성값을 받아 블록을 생성할 메서드.
        BlockBehaviour.Properties.of() // 블록의 속성값.
);
```

내부적으로, 위는 `BLOCKS.register("example_block", () -> new Block(BlockBehaviour.Properties.of()))`를 호출합니다. 전달된 속성값을 사용해 블록을 생성합니다.

만약 위처럼 `Block::new`를 쓰신다면 아래처럼 `#registerSimpleBlock`을 사용해 더 간단하게 블록을 만들 수 있습니다:

```java
public static final DeferredBlock<Block> EXAMPLE_BLOCK = BLOCKS.registerSimpleBlock(
        "example_block",
        BlockBehaviour.Properties.of() // 블록의 속성값.
);
```

위 두 예시는 완전히 동일한 기능을 합니다, 하지만 `#registerSimpleBlock`은 `Block`의 하위 클래스를 사용할 수 없어 복잡한 블록을 등록하신다면 첫번째 예시를 대신 사용하세요.   

### 에셋

이제 게임을 키고 블록을 배치하시면 블록의 [텍스쳐][textures]가 없을 겁니다. 이는 [블록의 모델][model]이 지정되지 않을 때 대신 띄우는 모델입니다. 블록의 모델을 지정하려면 먼저 모델을 추가한 다음, [blockstate 파일][bsfile]에서 각 블록 상태마다 무슨 모델을 사용할지 지정하세요. 자세한 정보는 연결된 문서를 참고하세요.

## 블록의 기능들

블록 자체는 게임 로직에서 많이 사용하지 않습니다. 마인크래프트에서 가장 빈번히 수행하는 작업인, 좌표에 있는 블록 알아내기와 좌표에 블록 설치하기 이 두 가지는 블록이 아니라 블록의 상태를 대신 이용합니다. 디자인상, `Block`은 블록의 기능만 정의하고, 레벨에는 `BlockState`를 배치합니다. 때문에 `Block`의 여러 메서드들은 `BlockState`를 인자로 받습니다. 이들의 응용 방법은 [블록의 상태 사용하기][usingblockstates]를 참고하세요.

아래는 블록의 대표적인 파이프라인을 다룹니다. 따로 말이 없다면 아래 메서드들은 양 사이드에서 호출되며 같은 결과를 반환해야 합니다.

### 블록 설치

블록을 설치는 대개 `BlockItem#useOn`에서 처리합니다 (연꽃잎은 자식 클래스 `PlaceOnWaterBlockItem`를 사용함). 자세한 상호작용 과정은 [이곳][interactionpipeline]을 참고하세요. 조약돌 아이템과 같은 `BlockItem`을 들고 우클릭하면 이 메서드가 호출됩니다.

- 여러 사전 검사 수행. 예를 들어 관전자 모드는 아닌지, Feature Flag가 활성화 되어 있는지, 블록을 배치하는 위치가 세상 밖은 아닌지 등 확인함. 만약 이중 하나라도 실패하면 블록 설치는 중단됨.
- `Block#canBeReplaced`를 해당 위치에 이미 배치되어 있는 블록에 호출함. 여기서 `false` 반환시 블록 설치는 중단됨. `true`를 반환하는 블록은 대표적으로 눈 또는 잔디가 있음.
- `Block#getStateForPlacement`를 호출해 구체적으로 배치할 블록 상태를 정함. 이때 플레이어의 위치, 각도, 클릭한 블록의 면 등이 전달됨. 계단이나 문 처럼, 바라보는 각도에 따라 다른 블록 상태를 사용할 때 유용함.
- `Block#canSurvive`를 호출해 위에서 정한 블록 상태를 해당 위치에 배치할 수 있는지 검사함. 여기서 `false` 반환시 파이프라인은 중단됨.
- `Level#setBlock`를 호출히 블록 상태를 레벨에 배치함.
  - 내부적으로 `Block#onPlace`도 호출함.
- `Block#setPlacedBy`를 호출함.

### 블록 파괴

블록은 시간에 따라 파괴되기 때문에 더 복잡합니다. 파괴 과정은 세 단계로 이루어지는데: "시작", "채굴", "파괴"입니다.

- 블록을 최초로 왼 클릭 할 때, "시작" 단계에 들어섭니다.
- 왼쪽 마우스 버튼이 계속 눌러지고 있다면 "채굴" 단계에 들어섭니다. **이 단계의 메서드들은 매 틱마다 실행됩니다.**
- 블록이 완전히 파괴될 때까지 누루고 있었다면 "파괴" 단계에 들어섭니다.

간단히 코드처럼 표현을 하자면:

```java
leftClick();
initiatingStage();
while (leftClickIsBeingHeld()) {
    miningStage();
    if (blockIsBroken()) {
        actuallyBreakingStage();
        break;
    }
}
```

아래 섹션들은 위 단계들을 구체적인 메서드 이름과 함께 자세히 다룹니다.

#### 시작 단계

- 클라이언트 전용: `InputEvent.InteractionKeyMappingTriggered` 이벤트가 방송됨. 이벤트가 취소되면 파이프라인은 중단됨.
- 여러 사전 검사 수행. 예를 들어 관전자 모드는 아닌지, Feature Flag가 활성화 되어 있는지, 블록을 파괴하는 위치가 세상 밖은 아닌지 등 확인함. 만약 이중 하나라도 실패하면 블록 파괴는 중단됨.
- `PlayerInteractEvent.LeftClickBlock` 이벤트가 방송됨. 이벤트가 취소되면 파이프라인은 중단됨.
  - 클라이언트에서만 취소되면, 서버는 파이프라인을 시작하지 않아 문제가 발생하지 않음.
  - 서버에서만 최소되면 클라이언트는 파이프라인을 계속 수행해 동기화가 깨질 수 있음.
- `Block#attack`이 호출됩니다.

#### 채굴 단계

- `PlayerInteractEvent.LeftClickBlock` 이벤트가 매 틱 마다 방송됨. 이벤트가 취소되면 파이프라인은 "종결" 단계로 건너뜀.
  - 클라이언트에서만 취소되면, 서버는 아무런 동작을 하지 않아 문제가 발생하지 않음.
  - 서버에서만 최소되면 클라이언트는 파이프라인을 계속 수행해 동기화가 깨질 수 있음.
- `Block#getDestroyProgress`를 호출해 채굴 진행도를 증가시킴.
  - `Block#getDestroyProgress`는 각 틱마다 채굴 진행도를 얼마나 증가시킬지를 반환하는 메서드. 0~1 사이의 값을 반환함.
- 채굴 진행도 오버레이(균열 텍스쳐)가 갱신됨.
- 채굴 진행도가 1.0 이상이면, 채굴이 완료된 것으로 간주하고 파괴 단계로 전환.

#### 파괴 단계

- `IItemExtension#onBlockStartBreak`이 호출됨. `true`가 반환될 경우 블록을 파괴하지 않고 "종결" 단계로 건너뜀.
- 서버 전용: `IBlockExtension#canHarvestBlock`을 호출해 블록 파괴 시 아이템 회수 가능 여부 판단.
- `IBlockExtension#onDestroyedByPlayer`가 호출됨. `false`가 반환될 경우 블록을 파괴하지 않고 "종결" 단계로 건너뜀. 이 메서드는 내부적으로:
  - `Block#playerWillDestroy`를 호출.
  - 블록을 공기로 대체함.
    - 이후 `Block#onRemove`를 호출.
- `Block#destroy` 호출.
- 서버 전용: 이전에 `IBlockExtension#canHarvestBlock`에서 `true`를 반환한 경우, `Block#playerDestroy` 호출.
- 서버 전용: `IBlockExtension#getExpDrop` 호출. 만약 0보다 큰 값 반환시 `Block#popExperience`로 반환값 전달.

### 틱

틱은 1 / 20초(또는 50ms)에 한 번씩 게임을 업데이트하는 메커니즘 입니다. 이를 활용해 블록을 반복적으로 업데이트 하거나 특정 작업을 처리할 수 있습니다.

#### 서버 틱 연산

블록의 틱은 `Block#tick`에서 처리합니다. 이 메서드는 두 가지 방법으로 호출되는데: [무작위로 호출되거나][randomtick] (아래 참고), 직접 요청될 수 있습니다. 틱 연산은 `Level#scheduleTick(BlockPos, Block, int)`을 호출해 요청할 수 있습니다, 여기서 `int`는 지연 시간입니다. 단위는 틱 입니다. 이 메커니즘은 게임 속에서 다양하게 이용되는데, 예를 들어 흘림잎은 틱 연산을 요청해서 서서히 기울어 지고, 여러 레드스톤 소자들도 틱 연산을 요청해 일정 시간 뒤에 반응합니다.

#### 클라이언트 틱 연산

`Block#animateTick`은 매 프레임마다, 클라이언트에서만 호출됩니다. 이는 횃불의 불꽃 파티클을 소환하는 등의 용도로 사용합니다.

#### 날씨 틱 연산

날씨 틱 연산은 `Block#handlePrecipitation`에서 처리하며, 무작위 틱 연산과 따로 실행됩니다. 오직 서버에서, 비가 올 때, 1 / 16의 확률로 실행됩니다. 가마솥에 눈이나 물을 채울 때 사용합니다.

#### 무작위 블록 틱

무작위 블록 틱(Random Tick)은 매 틱당 청크에서 일정량의 블록을 골라 틱을 수행하는 메커니즘 입니다. 틱을 수행할 블록 갯수는 `randomTickSpeed` 게임 규칙이 지정합니다. 예를 들어 기본값 3을 사용한다면, 매 틱마다, 각 청크에서 세 개의 블록을 무작위로 고르고, 각 블록의 `Block#randomTick`을 호출합니다.

무작위 블록 틱은 블록에 기본적으로 비활성화 되어 있으며, 사용하려면 `BlockBehaviour$Properties#randomTicks()`를 호출하세요.

`Block#randomTick`은 기본적으로 `Block#tick`을 호출합니다. 무작위 블록 틱과 직접 요청한 틱이 다른 작업을 수행하도록 만들려면 `Block#randomTick`을 재정의 하세요.

무작위 블록 틱은 식물의 성장, 얼음과 눈의 해동, 구리의 산화 등 많은 블록이 응용합니다.

[above]: #블록-하나-우려먹기
[below]: #deferredregisterblocks의-기능
[blockentities]: ../blockentities/index.md
[blockstates]: states.md
[bsfile]: ../resources/client/models/index.md#blockstate-files
[events]: ../concepts/events.md
[interactionpipeline]: ../items/interactionpipeline.md
[item]: ../items/index.md
[model]: ../resources/client/models/index.md
[randomtick]: #무작위-블록-틱
[registration]: ../concepts/registries.md#methods-for-registering
[resources]: ../resources/index.md#assets
[sounds]: ../resources/client/sounds.md
[textures]: ../resources/client/textures.md
[usingblocks]: #블록의-기능들
[usingblockstates]: states.md#상태-사용법
