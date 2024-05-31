# 상호작용 파이프라인

이 페이지는 우클릭을 통한 상호작용 과정, 그리고 결과(`Result`)가 무엇인지, 어디에 쓰는지에 대해 다룹니다. 

## 우클릭을 하면 무슨 일이 일어나나요?

월드에서 우클릭할 시, 바라보던 대상, 손에 들던 `ItemStack`에 따라 여러 작업이 수행됩니다. 많은 상호작용 관련 메서드들은 두 개의 결과(아래 참고)중 하나를 반환합니다. 이 메서드들은 명시적으로 성공 또는 실패 시 파이프라인을 중단합니다. 가독성을 위해 "명시적 성공 또는 실패"는 "확실한 결과"로 표현하겠습니다.

- `InputEvent.InteractionKeyMappingTriggered`가 마우스 우클릭, 주 상호작용 손을 가지고 방송됨. 이벤트 취소 시 파이프라인 중단.
- 여러 사전 검사 수행. 관전자 모드이거나 손에 든 `ItemStack`의 feature flag가 비활성화되어 있다면 파이프라인 중단.
- 바라보는 대상에 따라 다른 작업 수행:
    - 월드 경계 안에 있는, 상호작용 거리 내의 엔티티:
        - `PlayerInteractEvent.EntityInteractSpecific`이 방송됨. 이벤트 취소 시 파이프라인 중단.
        - **바라본 엔티티에** `Entity#interactAt`이 호출됨. 확실한 결과가 반환될 시 파이프라인 중단.
            - 자체 제작한 엔티티에 상호작용 기능을 추가하려면 이 메서드를 재정의 하세요. 바닐라 엔티티에 상호작용 기능을 추가하려면 이벤트를 대신 사용하세요.
        - 엔티티가 GUI를 열 경우(예: 주민 거래 GUI, 상자 광산 수레 GUI), 파이프라인 중단.
        - `PlayerInteractEvent.EntityInteract`가 방송됨. 이벤트 취소 시 파이프라인 중단.
        - **바라본 엔티티에** `Entity#interact`가 호출됨. 확실한 결과가 반환될 시 파이프라인 중단.
            - 자체 제작한 엔티티에 상호작용 기능을 추가하려면 이 메서드를 재정의 하세요. 바닐라 엔티티에 상호작용 기능을 추가하려면 이벤트를 대신 사용하세요.
            - `Mob`의 경우, `Entity#interact`를 끈으로 끌기 또는 스폰알로 아기를 소환하는 데 사용합니다, 그리고 몹 전용 상호작용 기능은 `Mob#mobInteract`로 구현합니다. 메서드의 결과는 `Entity#interact`와 똑같이 처리됩니다.
        - 만약 바라본 엔티티가 `LivingEntity`라면, 주 상호작용 손의 아이템에 대해 `Item#interactLivingEntity`가 호출됨. 확실한 결과가 반환될 시 파이프라인 중단.
    - 월드 경계 안에 있는, 상호작용 거리 내의 블록:
        - `PlayerInteractEvent.RightClickBlock`이 방송됨. 이벤트 취소 시 파이프라인 중단. 해당 이벤트는 블록 또는 아이템 처리만 차단하는 것도 가능.
        - `IItemExtension#onItemUseFirst`가 호출됨. 확실한 결과가 반환될 시 파이프라인 중단.
        - 플레이어가 웅크리지 않았고 이벤트가 블록 처리를 차단하지 않았다면 `UseItemOnBlockEvent` is fired. If the event is canceled, the cancellation result is used. Otherwise, `Block#useItemOn` is called. If it returns a definitive result, the pipeline ends.
        - If the `ItemInteractionResult` is `PASS_TO_DEFAULT_BLOCK_INTERACTION` and the executing hand is the main hand, then `Block#useWithoutItem`가 호출됨. 확실한 결과가 반환될 시 파이프라인 중단. definitive result, the pipeline ends.
        - 이벤트가 아이템 처리를 차단하지 않았다면, `Item#useOn`이 호출됩니다. 확실한 결과가 반환될 시 파이프라인 중단.
- `Item#use`가 호출됨. 확실한 결과가 반환될 시 파이프라인 중단.
- 위 과정을 부 상호작용 손으로 한번 더 수행함.

## 결과 타입

There are three different types of results: `InteractionResult`s, `ItemInteractionResult`s, and `InteractionResultHolder<T>`s. `InteractionResult` is used most of the time, only `Item#use` uses `InteractionResultHolder<ItemStack>`, and only `BlockBehaviour#useItemOn` and `CauldronInteraction#interact` use `ItemInteractionResult`.

`InteractionResult`는 다섯 개의 경우의 수를 가진 열거형입니다: `SUCCESS`, `CONSUME`, `CONSUME_PARTIAL`, `PASS`그리고 `FAIL`. 추가적으로, `InteractionResult#sidedSuccess`는 서버에선 `SUCCESS`, 클라이언트에선 `CONSUME`을 반환합니다.

`InteractionResultHolder<T>`는 `InteractionResult`와 `T`를 담는 객체입니다. `T`는 아무거나 될 수 있지만 거의 `ItemStack`을 사용합니다. `InteractionResultHolder<T>`는 각 열거형 값을 위한 메서드를 제공하며(`#success`, `#consume`, `#pass` 그리고 `#fail`), 위처럼 `#sidedSuccess` 또한 제공합니다. 이는 클라이언트에선 `#success`를, 서버에선 `#consume`을 호출합니다.

`ItemInteractionResult` is a parallel to `InteractionResult` specifically for when an item is used on a block. It is an enum of six values: `SUCCESS`, `CONSUME`, `CONSUME_PARTIAL`, `PASS_TO_DEFAULT_BLOCK_INTERACTION`, `SKIP_DEFAULT_BLOCK_INTERACTION`,  and `FAIL`. Each `ItemInteractionResult` can be mapped to a `InteractionResult` via `#result`; `PASS_TO_DEFAULT_BLOCK_INTERACTION`, `SKIP_DEFAULT_BLOCK_INTERACTION` both represent `InteractionResult#PASS`. Similarly, `#sidedSucess` also exists for `ItemInteractionResult`.

Generally, the different values mean the following:

- `InteractionResult#sidedSuccess` (or `InteractionResultHolder#sidedSuccess` / `ItemInteractionResult#sidedSucess` where needed) should be used if the operation should be considered successful, and you want the arm to swing. The pipeline will end.
- `InteractionResult#SUCCESS` (or `InteractionResultHolder#success` / `ItemInteractionResult#SUCCESS` where needed) should be used if the operation should be considered successful, and you want the arm to swing, but only on one side. Only use this if you want to return a different value on the other logical side for whatever reason. The pipeline will end.
- `InteractionResult#CONSUME` (or `InteractionResultHolder#consume` / `ItemInteractionResult#CONSUME` where needed) should be used if the operation should be considered successful, but you do not want the arm to swing. The pipeline will end.
- `InteractionResult#CONSUME_PARTIAL` is mostly identical to `InteractionResult#CONSUME`, the only difference is in its usage in [`Item#useOn`][itemuseon].
    - `ItemInteractionResult#CONSUME_PARTIAL` is similar within its usage in `BlockBehaviour#useItemOn`.
- `InteractionResult.FAIL` (or `InteractionResultHolder#fail` / `ItemInteractionResult#FAIL` where needed) should be used if the item functionality should be considered failed and no further interaction should be performed. The pipeline will end. This can be used everywhere, but it should be used with care outside of `Item#useOn` and `Item#use`. In many cases, using `InteractionResult.PASS` makes more sense.
- `InteractionResult.PASS` (or `InteractionResultHolder#pass` where needed) should be used if the operation should be considered neither successful nor failed. The pipeline will continue. This is the default behavior (unless otherwise specified).
    - `ItemInteractionResult#PASS_TO_DEFAULT_BLOCK_INTERACTION` allows `BlockBehaviour#useWithoutItem` to be called for the mainhand while `#SKIP_DEFAULT_BLOCK_INTERACTION` prevents the method from executing altogether. `#PASS_TO_DEFAULT_BLOCK_INTERACTION` is the default behavior (unless otherwise specified).

몇몇 메서드는 사용 방법 또는 기능이 특별하기에 아래에서 더 자세히 다룹니다.

## `IItemExtension#onItemUseFirst`

`InteractionResult#sidedSuccess`와 `InteractionResult.CONSUME`은 여기선 아무 효과도 없으며, 오직 `InteractionResult.SUCCESS`, `InteractionResult.FAIL`, 또는 `InteractionResult.PASS`만 사용 가능합니다.

## `Item#useOn`

작업을 성공으로 표기하고 싶지만 팔은 가만히 두고 싶다면, 또는 `ITEM_USED` 통계에 값을 기록하고 싶다면 `InteractionResult.CONSUME_PARTIAL`을 사용하세요.

## `Item#use`

이 메서드는 유일하게 `InteractionResultHolder<ItemStack>`를 반환합니다. `InteractionResultHolder<ItemStack>`에 저장된 `ItemStack`은 아이템 상호작용을 시작한 아이템을 대체합니다.

`Item#use`의 기본 구현은 아이템이 음식이고, 플레이어가 섭취 가능할 경우 `InteractionResultHolder#consume`을, 아이템이 음식이나 플레이어가 섭취할 수 없을 경우 `InteractionResultHolder#fail`을, 아이템이 음식이 아닐 경우 `InteractionResultHolder#pass`를 반환합니다.

주 상호작용 손으로 파이프라인 처리 중 여기서 `InteractionResultHolder#fail`을 반환하면 부 상호작용 손 처리를 차단합니다. 부 상호작용 손 처리도 수행하려면 `InteractionResultHolder#pass`를 대신 반환하세요.

[itemuseon]: #itemuseon
