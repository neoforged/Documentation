# 블록

블록은 마인크래프트의 핵심 효소로 레벨의 필수적 구성 요소입니다. 지형과 구조물, 그리고 기계들 전부 블록들로 이루어져 있습니다. 이번장에서는 블록 제작의 핵심과 응용 방안들에 대해 다루겠습니다.

## 하나의 블록으로 모든 것을

시작하기 전에, 먼저 게임 속 블록은 하나씩만 존재한다는 사실을 염두하셔야 합니다. 레벨에 존재하는 수천 개의 블록은 전부 하나의 블록을 참조합니다, 다시 말해서 같은 블록이 월드에 여러 번 등장하는 것입니다.

그렇기 때문에 각 블록은 한번만, 그것도 [레지스트리][registration] 초기화 중에 생성되어야 합니다. 그 이후에는 등록된 블록을 참조하세요. 아래 예를 들자면:

다른 레지스트리들과 다르게 블록은 블록 전용으로 확장된 `DeferredRegister.Block`을 사용할 수 있습니다. `DeferredRegister<Block>`과의 차이점은:

- `DeferredRegister.create(...)` 대신 `DeferredRegister.createBlocks("yourmodid")`으로 생성함.
- `#register`는 `DeferredBlock<T extends Block>`을 대신 반환함, 이는 `DeferredHolder<Block, T>`의 하위 타입임. 여기서 `T`는 등록할 블록의 타입.
- 블록 등록을 간소화 시켜줄 여러 유틸리티 메서드가 있음. 자세한 사항은 [아래][below] 참고.

이제 블록을 직접 만들어 보겠습니다:

```java
//BLOCKS는 DeferredRegister.Blocks
public static final DeferredBlock<Block> MY_BLOCK = BLOCKS.register("my_block", () -> new Block(...));
```

블록을 등록한 이후, `my_block`에 대한 참조는 위 상수를 사용해야 합니다. 예를 들어 어떤 좌표에 존재하는 블록이 `my_block`인지 확인하고 싶다면, 다음과 같이 구현할 수 있습니다:

```java
level.getBlockState(position) // 해당 좌표에 존재하는 블록의 상태를 가져옴
        //highlight-next-line
        .is(MyBlockRegistrationClass.MY_BLOCK);
```

추가적으로, 이 방식은 Java의 `equals` 대신 `block1 == block2`를 사용할 수 있습니다. (`equals`도 작동하긴 하나 레퍼런스 자체가 동일하기 때문에 필요 없습니다.)

:::danger
객체 등록 중 이외에 `new Block()`을 호출하지 마세요! 아래와 같은 문제가 발생할 수 있습니다:

- 블록은 무조건 레지스트리가 동결되기 이전에 생성되어야 합니다. 네오포지는 일시적으로 레지스트리를 해동하기에 이때만 등록할 수 있습니다.
- 만약 레지스트리가 이미 동결된 이후 등록하려고 한다면, 나중에 해당 블록을 참조할 시 `null`이 대신 반환됩니다.
- 어떻게든 등록이 잘못된 블록을 사용하시면 블록에 대한 허상 참조가 발생하여 나중에 월드를 불러오면 공기로 대체됩니다.
:::

## 블록 만들기

위에서 말했듯이 먼저 `DeferredRegister.Blocks`를 만드세요.

```java
public static final DeferredRegister.Blocks BLOCKS = DeferredRegister.createBlocks("yourmodid");
```

### 단순한 블록

특별한 기능이 없는 블록들은(조약돌이나 나무판자 등) `Block`의 새 인스턴스를 만드는 것으로 충분합니다. 블록들이 등록될 때, 새로운 `Block`의 인스턴스를 `BlockBehaviour$Properties`를 인자로 넘겨 생성하세요. `BlockBehaviour$Properties`는 블록의 속성을 저장하는 객체로 `#of`로 생성하고 아래 메서드들을 통해 블록의 특성을 원하시는 대로 바꾸실 수 있습니다.

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
//BLOCKS is a DeferredRegister.Blocks
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
인벤토리에 들어있는 블록과 레벨에 설치된 블록은 다른 객체입니다. 인벤토리에 있는 블록은 사실 `BlockItem`입니다. `BlockItem`은 `Item`의 하위 클래스로, 우클릭 시 레벨에 표현하는 블록을 설치하는 등의 상호작용 기능들을 구현합니다. 또한, `BlockItem`은 최대 아이템 개수나 지정될 크리에이티브 탭 등의 아이템 속성 또한 지정합니다.

`BlockItem`도 따로 [등록]해 주어야 하며, 이는 블록의 아이템이 존재하지 않을 수 있기 때문입니다(그 예로 불이 있습니다).
:::

### 기능 추가

`Block` 클래스는 매우 기초적인 블록에만 바로 사용할 수 있습니다. 블록에 상호작용 등의 기능을 추가하시려면 `Block`의 하위 클래스를 직접 만드셔야 합니다. `Block`은 재정의할 수 있는 여러 메서드들을 제공하여 다양한 기능을 추가할 수 있습니다. 자세한 사항은 `Block`, `BlockBehaviour`, `IBlockExtension`을 참고하세요. 아래 [블록 써보기][usingblocks]도 확인해 블록의 주 사용처를 확인하세요.

만약 여러 종류가 있는 블록을 추가하려면 (예를 들어 아래, 위, 또는 두 겹으로 배치될 수 있는 반 블록), [블록의 상태][blockstates]를 사용하실 수 있습니다. 또한, 추가 데이터를 저장할 수 있는 블록을 추가하려면 (예를 들어 인벤토리가 있는 상자), [블록 엔티티][blockentities]를 대신 사용하세요. 이 둘 중 무엇을 사용하느냐는 대개 블록이 표현할 수 있는 경우의 수가 소수로 제한되어 있다면 블록의 상태를(기껏 해봐야 몇백 개), 경우의 수가 무한이 많다면 블록 엔티티를 사용하세요(인벤토리는 모든 아이템의, 모든 개수의 모든 배치를, 다른 모드까지 고려해야 하기에 블록 엔티티가 적합합니다).

### `DeferredRegister.Blocks` 응용하기

[위]에서 `DeferredRegister.Blocks`를 만드는 방법과, `DeferredBlock`에 대해 배웠습니다. 이제 다른 추가 기능도 살펴보겠습니다, 먼저 `#registerBlock`이 있습니다:

```java
public static final DeferredRegister.Blocks BLOCKS = DeferredRegister.createBlocks("yourmodid");

public static final DeferredBlock<Block> EXAMPLE_BLOCK = BLOCKS.registerBlock(
        "example_block",
        Block::new, // 아래 속성값을 받아 블록을 생성할 메서드.
        BlockBehaviour.Properties.of() // 블록의 속성값.
);
```

내부적으로, 위는 `BLOCKS.register("example_block", () -> new Block(BlockBehaviour.Properties.of()))`를 호출합니다, 이때 전달된 메서드에 속성값을 인자로 사용해 블록을 생성합니다.

만약 위처럼 `Block::new`를 쓰신다면 아래처럼 메서드를 빼도 됩니다:

```java
public static final DeferredBlock<Block> EXAMPLE_BLOCK = BLOCKS.registerSimpleBlock(
        "example_block",
        BlockBehaviour.Properties.of() // The properties to use.
);
```

위는 이전 예시랑 완전히 동일한 기능을 합니다, 하지만 `Block`의 하위 클래스는 사용할 수 없어 복잡한 블록을 등록하신다면 첫번째 예시를 대신 사용하세요.   

### 에셋

If you register your block and place it in the world, you will find it to be missing things like a texture. This is because [textures], among others, are handled by Minecraft's resource system. To apply the texture to the block, you must provide a [model] and a [blockstate file][bsfile] that associates the block with the texture and a shape. Give the linked articles a read for more information.

## 블록 응용하기

블록 자체는 게임 로직에서 많이 사용하지 않습니다. 마인크래프트에서 가장 빈번히 수행하는 작업인, 좌표에 있는 블록 알아내기와 좌표에 블록 설치하기 이 두 가지는 블록이 아니라 블록의 상태를 대신 이용합니다. 디자인상, `Block`은 블록의 기능을 정의하고, 레벨에는 `BlockState`를 배치합니다. `Block`의 여러 메서드들은 `BlockState`를 인자로 받습니다. 이들의 응용 방법은 [블록의 상태 사용하기][usingblockstates]를 참고하세요.

아래는 블록의 공통적인 기능들의 파이프라인에 다룹니다. 따로 명시하지 않는다면, 아래 언급된 메서드들은 양 논리 사이드에서 호출되며 같은 결과를 반환해야 합니다.

### 블록 설치

블록을 설치는 대개 `BlockItem#useOn` (또는 연꽃잎이 응용하는 `PlaceOnWaterBlockItem`과 같은 자식 클래스)에서 이루어집니다. 자세한 상호작용 과정은 [이곳][interactionpipeline]을 참고하세요. 조약돌 아이템과 같은 `BlockItem`을 들고 우클릭하면 이 메서드가 호출됩니다.

- Several prerequisites are checked, for example that you are not in spectator mode, that all required feature flags for the block are enabled or that the target position is not outside the world border. If at least one of these checks fails, the pipeline ends.
- `Block#canBeReplaced` is called for the block currently at the position where the block is attempted to be placed. If it returns `false`, the pipeline ends. Prominent cases that return `true` here are tall grass or snow layers.
- `Block#getStateForPlacement` is called. This is where, depending on the context (which includes information like the position, the rotation and the side the block is placed on), different block states can be returned. This is useful for example for blocks that can be placed in different directions.
- `Block#canSurvive` is called with the blockstate obtained in the previous step. If it returns `false`, the pipeline ends.
- The blockstate is set into the level via a `Level#setBlock` call.
  - In that `Level#setBlock` call, `Block#onPlace` is called.
- `Block#setPlacedBy` is called.

### 블록 파괴

블록은 시간에 따라 파괴되기 때문에 더 복잡합니다. 파괴 과정은 세 단계로 이루어지는데: "시작", "채굴", "파괴"입니다.

- 블록이 최초로 왼 클릭 됐을 때, "시작" 단계에 들어섭니다.
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

- 클라이언트 전용: `InputEvent.InteractionKeyMappingTriggered`에 왼쪽 마우스 버튼, 그리고 주로 사용하는 손을 전달해 이벤트를 방송합니다. 만약 이 이벤트가 취소되면, 파이프라인은 중단됩니다.
- 이후 여러 사전 검사가 수행됩니다. 관전자 모드가 아닌지, 필요한 Feature Flag가 전부 활성화되었는지, 파괴할 블록이 월드 밖은 아닌지를 확인합니다. 만약 이 중 하나라도 실패하면 파이프라인은 중단됩니다.
- `PlayerInteractEvent.LeftClickBlock` 이벤트가 방송됩니다. 만약 이 이벤트가 취소되면, 파이프라인은 중단됩니다.
  - 클라이언트에서만 이 이벤트를 취소하면, 서버로 아무런 패킷도 전달하지 않기 때문에 서버는 아무 동작도 하지 않아 문제가 발생하지 않습니다.
  - 하지만 서버에서만 이 이벤트를 취소한다면 클라이언트는 아래 단계를 계속 수행할 것이기에 동기화가 깨질 수 있습니다!
- `Block#attack`이 호출됩니다.

#### 채굴 단계

- `PlayerInteractEvent.LeftClickBlock` 이벤트가 방송됩니다. 만약 이 이벤트가 취소되면, 파이프라인은 "종결" 단계로 건너뜁니다.
  - 클라이언트에서만 이 이벤트를 취소하면, 서버로 아무런 패킷도 전달하지 않기 때문에 서버는 아무 동작도 하지 않아 문제가 발생하지 않습니다.
  - 하지만 서버에서만 이 이벤트를 취소한다면 클라이언트는 아래 단계를 계속 수행할 것이기에 동기화가 깨질 수 있습니다!
- `Block#getDestroyProgress`를 호출해 채굴 진행도를 증가시킵니다.
  - `Block#getDestroyProgress`는 각 틱마다 채굴 진행도를 얼마나 증가시킬지를 0~1 사이의 부동 소수점 값으로 반환합니다.
- 채굴 진행도 오버레이(균열 텍스쳐)가 갱신됩니다.
- 채굴 진행도가 1.0 이상이면, 채굴이 완료된 것으로 간주하고 파괴 단계에 들어섭니다.

#### 파괴 단계

- `IItemExtension#onBlockStartBreak`이 호출됩니다. `true`가 반환될 경우 블록을 파괴하지 않고 "종결" 단계로 건너뜁니다.
- 서버 전용: `IBlockExtension#canHarvestBlock`이 호출되어 블록 파괴 시 아이템 회수 가능 여부를 판단합니다.
- `IBlockExtension#onDestroyedByPlayer`가 호출됩니다. `false`가 반환될 경우 블록을 파괴하지 않고 "종결" 단계로 건너뜁니다. 이 메서드는 내부적으로:
  - `Block#playerWillDestroy`를 호출합니다.
  - `Level#setBlock`을 `Blocks.AIR.defaultBlockState()`를 인자로 호출해 블록을 제거합니다.
    - `Level#setBlock`은 내부적으로 `Block#onRemove`를 호출합니다.
- `Block#destroy`가 호출됩니다.
- 서버 전용: 이전에 `IBlockExtension#canHarvestBlock`에서 `true`가 반환될 경우, `Block#playerDestroy`가 호출됩니다.
- 서버 전용: `IBlockExtension#getExpDrop`이 호출됩니다.
- 서버 전용: 이전에 호출한 `#getExpDrop`의 결과가 0보다 크다면 `Block#popExperience`에 그 결과를 인자로 사용해 호출합니다.

### 틱

틱은 게임을 1 / 20초(또는 50ms)에 한 번씩 업데이트하는 메커니즘으로, 이 시간을 틱을 단위로 사용해 "1 틱"이라 부르기도 합니다. 블록은 틱에 따라 작업을 수행하는 여러 메서드를 제공합니다.

#### 서버 틱 연산

`Block#tick`은 두 가지 상황에서 호출됩니다: 기본 ["무작위 블록 틱"][randomtick] (아래 참고), 또는 "계획된 틱"입니다. 계획된 틱은 사전에 정해진 일정 틱 뒤에 `Block#tick`을 호출하도록 요청하는 것으로, `Level#scheduleTick(BlockPos, Block, int)`으로 요청할 수 있는데, 여기서 `int`는 지연 시간입니다. 이 메커니즘은 게임 속에서 다양하게 이용되는데, 예를 들어 흘림잎의 기울어짐은 계획된 틱을 깊이 응용합니다. 또 다른 사용 사례로는 레드스톤 소자가 있습니다.

#### 클라이언트 틱 연산

`Block#animateTick`은 매 프레임마다, 클라이언트에서만 호출됩니다. 이는 횃불 불꽃 파티클을 소환하는 등의 용도로 사용합니다.

#### 날씨 틱 연산

날씨 틱 연산은 `Block#handlePrecipitation`에서 처리하며 일반 틱 연산과 따로 실행됩니다. 오직 서버에서만, 비가 올 때만 수행되며, 1 / 16의 확률로 실행됩니다. 가마솥에 눈이나 물을 채울 때 사용합니다.

#### 무작위 블록 틱

무작위 블록 틱 또한 일반 틱 연산과 따로 실행됩니다. 무작위 블록 틱은 무조건 `BlockBehaviour$Properties#randomTicks()`를 호출해 활성화되어야만 합니다.

무작위 블록 틱은 매 틱당 한 청크 내 일정량의 블록에 대해 수행됩니다. 이 일정량은 `randomTickSpeed` 게임 규칙에서 지정합니다. 예를 들어 기본값 3을 사용한다면, 매 틱마다, 각 청크에서 세 개의 블록을 무작위로 고릅니다. 이 블록들의 무작위 블록 틱이 활성화되어 있다면 `Block#randomTick`이 각각 호출됩니다.

`Block#randomTick`은 기본적으로 `Block#tick`을 호출합니다. 무작위 블록 틱과 계획된 틱이 다른 작업을 수행하도록 만들려면 `Block#randomTick`을 재정의 하세요.

무작위 블록 틱은 식물의 성장, 얼음과 눈의 해동, 구리의 산화 등 많은 블록이 응용합니다.

[above]: #하나의-블록으로-모든-것을
[below]: #deferredregisterblocks-helpers
[blockentities]: ../blockentities/index.md
[blockstates]: states.md
[bsfile]: ../resources/client/models/index.md#blockstate-files
[events]: ../concepts/events.md
[interactionpipeline]: ../items/interactionpipeline.md
[item]: ../items/index.md
[model]: ../resources/client/models/index.md
[randomtick]: #random-ticking
[registration]: ../concepts/registries.md#methods-for-registering
[resources]: ../resources/index.md#assets
[sounds]: ../resources/client/sounds.md
[textures]: ../resources/client/textures.md
[usingblocks]: #using-blocks
[usingblockstates]: states.md#using-blockstates
