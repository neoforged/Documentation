BlockEntityRenderer
==================

`BlockEntityRenderer`, 또는 `BER` 은 정적인 모델(JSON, OBJ, B3D, others)만으론 표현하기 힘든 블록들을 렌더링할 때 사용합니다. 이때 해당 블록은 `BlockEntity` 가 있어야만 합니다.

BER 만들기
--------------

BER을 만들기 위해서는 `BlockEntityRenderer` 의 자식 클래스를 만드세요. 이때 사용하는 제너릭 인자는 렌더링할 `BlockEntity` 클래스 입니다. 이는 BER 의 `render` 메서드에 전달되는 인자로 사용됩니다.

`BlockEntityType` 하나당 하나의 BER 만이 존재합니다; 다수의 `BlockEntity` 인스턴스에 하나의 BER 만 사용하게 됩니다. 그러다보니, 각 `BlockEntity` 마다 다르게 렌더링해야 한다면, 이에 대한 정보는 BER 에 저장하지 말고 `BlockEntity` 에다가 저장해야 합니다. 예를 들어, `render` 함수가 호출될 때 마다 증가하는 정수를 BER 에다가 만든다면, 매 프레임마다, 해당 타입의 모든 `BlockEntity` 들 하나하나마다 증가하게 됩니다.

### `render`

이 메서드는 `BlockEntity`를 렌더링하기 위해 매 프레임마다 호출됩니다.

#### 메서드의 인자들

* `blockEntity`: 렌더링할 `BlockEntity`.
* `partialTicks`: 이전 틱으로부터 시간이 얼마나 지났는지 알려주는 0.0 부터 1.0 사이의 값. 0.0이면 이전 틱 끝나고 바로, 1.0 이면 현재 틱 끝나기 직전임.
* `poseStack`: `BlockEntity`를 화면의 올바른 위치에 렌더링하기 위한 4x4 행렬들이 들어있는 스택.
* `bufferSource`: Vertex Consumer 에 접근할 수 있는 렌더링 버퍼.
* `combinedLight`: 현재 `BlockEntity` 의 정수 밝기.
* `combinedOverlay`: `BlockEntity` 의 오버레이를 지정하는 정수. 보통 `OverlayTexture#NO_OVERLAY` 또는 655,360을 사용함.

BER 등록하기
-----------------

BER을 등록하기 위해선, `EntityRenderersEvent$RegisterRenderers` 이벤트를 모드 버스에서 구독하고 해당 이벤트가 방송될 때 `#registerBlockEntityRenderer`를 호출하세요.
