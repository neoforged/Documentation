블록
======

블록은 마인크래프트의 핵심 효소로 레벨의 필수적 구성 요소입니다. 지형과 구조물, 그리고 기계들 전부 블록들로 이루어져 있습니다. 이번장에서는 블록 제작의 기초에 대해 다루겠습니다.

하나만 있어도 충분한 블록
-------------------
시작하기 전에, 먼저 게임엔 블록이 하나씩만 존재한다는 사실을 알아두셔야 합니다. 레벨에 존재하는 수천개의 블록은 전부 하나의 블록을 참조합니다, 다시 말해서 같은 블록이 월드에 여러번 등장하는 것입니다.

그렇기 때문에 블록의 인스턴스는 오직 하나만, 그것도 레지스트리 초기화 중에 생성되어야 합니다. 그 이후에는 등록된 블록의 참조를 사용하세요. 예를 들자면(이해가 안된다면 [레지스트리][registration]을 참고하세요): 

```java
//BLOCKS는 DeferredRegister.Blocks
public static final DeferredBlock<Block> MY_BLOCK = BLOCKS.register("my_block", () -> new Block(...));
```

블록을 등록한 이후, `my_block`에 대한 참조는 위 상수를 사용해야 합니다. 예를 들어 어떤 좌표에 존재하는 블록이 `my_block`인지 확인하고 싶다면, 다음과 같이 구현할 수 있습니다:

```java
level.getBlockState(position) // 해당 좌표에 존재하는 블록 상태를 가져옴 the given position
        //highlight-next-line
        .is(MyBlockRegistrationClass.MY_BLOCK.get());
```

추가적으로, 이 방식은 Java의 `equals` 대신 `block1 == block2`를 사용할 수 있습니다. (`equals`도 작동하긴 하나 레퍼런스 자체가 동일하기 때문에 필요 없습니다.)

:::danger
객체 등록중 이외에 `new Block()`을 호출하지 마세요! 아래와 같은 문제가 발생할 수 있습니다:
Do not call `new Block()` outside registration! As soon as you do that, things can and will break:

- 블록은 무조건 레지스트리가 동결되기 이전에 생성되어야 합니다. 네오포지는 일시적으로 레지스트리를 해동하기에 이때만 등록할 수 있습니다.
- 만약 레지스트리가 이미 동결된 이후 등록하려고 한다면, 나중에 해당 블록을 참조할 시 `null`이 대신 반환됩니다.
- 어떻게든 등록이 잘못된 블록을 사용하시면 블록에 대한 허상 참조가 발생하여 나중에 월드를 불러오면 공기로 대체됩니다.
:::

블록 만들기
----------------

### 단순한 블록
특별한 기능이 없는 블록들은(조약돌이나 나무판자 등) `Block`의 새 인스턴스를 만드는 것으로 충분합니다. 블록들이 등록될 때, 새로운 `Block`의 인스턴스를 `BlockBehaviour$Properties`를 인자로 넘겨 생성하세요. `BlockBehaviour$Properties`는 블록의 속성을 저장하는 객체로 `#of`로 생성하고 아래 메서드들을 통해 블록의 특성을 원하시는 대로 바꾸실 수 있습니다.

- `destroyTime` - 블록을 파괴하는데 걸리는 시간을 지정함.
    - 돌은 1.5, 흙은 0.5, 흑요석은 50, 기반암은 -1(부술 수 없음).
- `explosionResistance` - 블록의 폭발 저항력을 지정함.
    - 돌은 6.0, 흙은 0.5, 흑요석은 1,200, 기반암은 3,600,000.
- `sound` - 블록을 주먹으로 치거나, 캐거나, 설치시 나는 소리를 지정함.
    - 이 설정의 기본값은 `SoundType.STONE`. 자세한 사항은 [소리][sounds] 참고.
- `lightLevel` - 블록의 밝기를 지정. `BlockState`를 0~15 범위의 정수로 바꾸는 함수를 값으로 받음.
    - 발광석은 `state -> 15`, 횟불은 `state -> 14`를 사용함.
- `friction` - 블록의 마찰력, 또는 미끄러운 정도를 지정함.
    - 기본값은 0.6, 얼음은 0.98.

그리고 위 메서드들은 아래처럼 사용하실 수 있습니다:
```java
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
인벤토리에 들어있는 블록과 레벨에 설치된 블록은 다른 객체입니다. 인벤토리에 있는 블록은 사실 `BlockItem` 입니다. `BlockItem`은 `Item`의 하위 클래스로, 우클릭 시 레벨에 표현하는 블록을 설치하는 등의 상호작용 기능들을 구현합니다. 또한, `BlockItem`은 최대 아이템 갯수나 지정될 크리에이티브 탭 등의 아이템 속성 또한 지정합니다.

`BlockItem`도 따로 [등록]해 주어야 하며, 이는 블록의 아이템이 존재하지 않을 수 있기 때문입니다(그 예로 불이 있습니다).
:::

### 기능 추가
`Block` 클래스는 매우 기초적인 블록에만 바로 사용할 수 있습니다. 블록에 상호작용 등의 기능을 추가하시려면 `Block`의 하위 클래스를 직접 만드셔야 합니다. `Block`은 재정의할 수 있는 여러 메서드들을 제공하여 다양한 기능을 추가할 수 있습니다. 자세한 사항은 `Block`, `BlockBehaviour`, `IBlockExtension`을 참고하세요. 아래 [블록 써보기][usingblocks]도 확인해 블록의 주 사용처를 확인하세요.

만약 여러 종류가 있는 블록을 추가하려면 (예를 들어 아래, 위, 또는 두겹으로 배치될 수 있는 반 블록), [블록 상태][blockstates]를 사용하실 수 있습니다. 또한, 추가 데이터를 저장할 수 있는 블록을 추가하려면 (예를 들어 인벤토리가 있는 상자), 
If you want to make a block that has different variants (think a slab that has a bottom, top, and double variant), you should use [blockstates]. And finally, if you want a block that stores additional data (think a chest that stores its inventory), a [block entity][blockentities] should be used. The rule of thumb here is that if you have a finite and reasonably small amount of states (= a few hundred states at most), use blockstates, and if you have an infinite or near-infinite amount of states, use a block entity.

#### 선택적으로 블록 등록하기

과거에는 특정 블록/아이템들을 설정 파일에서 비활성화할 수 있도록 하였습니다. 그러나 이젠 레지스트리에 등록할 수 있는 블록 개수의 제한이 없으니 데이터 손상을 완전히 피하기 위해 전부 다 등록하시는 걸 권장드립니다! 만약 선택적으로 블록을 비활성화하고 싶으시다면, 블록의 조합법을 대신 비활성화하세요. 만약 크리에이티브 탭에서도 숨기고 싶으시다면 [`BuildCreativeModeTabContentsEvent`][creativetabs]의 `FeatureFlag`를 사용하실 수 있습니다.

추가 정보
---------------

바닐라 마인크래프트의 울타리, 담장과 같이 블록들에 배치, 방향 등의 특성을 추가하시려면, [blockstates]를 참고하세요

[blockitem]: #blockitem
[소리]: ../gameeffects/sounds.md
[등록]: ../concepts/registries.md#객체-등록하기
[blockstates]: states.md
[creativetabs]: ../items/index.md#creative-tabs
