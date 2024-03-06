모델 변환
==========

[`BakedModel`][bakedmodel]을 아이템으로 그릴 때, 상황에 따라 모델에 선형 변환을 다양하게 적용할 수 있습니다. 모델을 그리는 다양한 상황들은 열거형 `ItemDisplayContext`에서 정의하며, 이를 활용하는 방법은 두 가지가 있는데: 구 바닐라 시스템, 그리고 포지에서 새로 추가한 시스템입니다. 바닐라 시스템은 `applyTransform`을 대신 사용하도록 포지에서 패치합니다.

`ItemDisplayContext`
---------------

`NONE` - 모델을 언제 그리는지를 따로 지정하지 않았거나, 또는 `Block#getRenderShape`가 `#ENTITYBLOCK_ANIMATED`일 때 사용합니다.

`THIRD_PERSON_LEFT_HAND`/`THIRD_PERSON_RIGHT_HAND`/`FIRST_PERSON_LEFT_HAND`/`FIRST_PERSON_RIGHT_HAND` - "FIRST_"로 시작하는 값들은 일인칭, "THIRD_"로 시작하는 값들은 삼인칭 시점에 아이템을 손에 들고 있을 때 사용됩니다.

`HEAD` - 플레이어가 머리에 아이템을 쓸 때 사용함 (예: 호박).

`GUI` - `Screen` 위에 아이템을 그릴 때 사용함.

`GROUND` - 아이템을 `ItemEntity`를 통해 레벨에 그릴 때 사용함.

`FIXED` - 아이템 액자에서 사용함.

바닐라 방식
---------------

기존 바닐라 시스템은 `BakedModel#getTransforms`을 사용합니다. 이 메서드는 `ItemTransforms`를 반환하는데, 이는 위에서 소개한 각 상황마다 무슨 `ItemTransform`을 사용할지를 저장하는 객체입니다. `ItemTransform`은 4x4 행렬과 동일한 기능을 하는 객체로, 전이(translation), 회전(rotation), 그리고 축적(scale)을 저장합니다. 이때 `#getTransform`에 `ItemDisplayContext#NONE`을 인자로 전달하면 언제나 `ItemTransform#NO_TRANSFORM`을 반환합니다.

:::important
클래스 이름에 주의하세요! `ItemTransforms` vs `ItemTransform`
:::

이 방식은 포지에선 더 이상 사용하지 않으며, `BakedModel#getTransform`은 이제 `ItemTransforms#NO_TRANSFORM`을 반환하고 실질적 모델 변환 과정은 `#applyTransform`에서 구현해야 합니다. 

포지 방식
-------------

포지는 `#applyTransform`을 추가해 모델 변환을 처리합니다. 이는 `BakedModel#getTransforms` 메서드를 계승합니다.

#### `IBakedModelExtension#applyTransform`

`ItemDisplayContext`, `PoseStack`, 그리고 아이템이 왼손에 있는지 오른손에 있는지를 의미하는 boolean을 인자로 받고 이에 상응하는 `BakedModel`을 반환하는 함수입니다. 여기서 반환되는 `BakedModel`은 아예 다른 모델이어도 상관없어 기존 바닐라 시스템보다 더 유연합니다 (예: 손에 들면 평평하지만 바닥에 놓으면 구겨져 보이는 종이).

[bakedmodel]: ./bakedmodel.md
