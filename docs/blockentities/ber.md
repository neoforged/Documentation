# BlockEntityRenderer

`BlockEntityRenderer`(줄여서 `BER`)은 블록 엔티티를 그리는 클래스 입니다. 주로 정적 모델(JSON, OBJ, B3D, others)만으론 표현하기 힘든 블록들을 그릴 때 사용합니다.

## BER 만들기

BER을 만들기 위해서는 `BlockEntityRenderer`의 자식 클래스를 만드세요. 이때 사용하는 제너릭 인자는 그릴 블록 엔티티의 타입 입니다.

블록 엔티티는 종류마다 하나의 `BER` 인스턴스만 사용합니다. 만약 같은 블록이라도 데이터에 따라 다르게 그려야 한다면, 이런 정보는 `BER`이 아니라 블록 엔티티 자체에다가 저장해야 합니다.

### `render`

이 메서드는 매 프레임마다 블록 엔티티를 그릴 때 호출됩니다.

#### 메서드의 인자들
- `blockEntity`: 렌더링할 블록 엔티티.
- `partialTick`: 이전 틱으로부터 시간이 얼마나 지났는지 알려주는 값. 0.0 부터 1.0 사이의 범위를 가짐. 0.0이면 이전 틱 끝나고 바로, 1.0 이면 현재 틱 끝나기 직전임.
- `poseStack`: 블록 엔티티를 화면의 올바른 위치에 렌더링하기 위한 4x4 행렬들이 들어있는 스택.
- `bufferSource`: Vertex Consumer 에 접근할 수 있는 렌더링 버퍼.
- `combinedLight`: 블록 엔티티의 밝기.
- `combinedOverlay`: 블록 엔티티의 오버레이를 지정하는 정수. 거의 `OverlayTexture#NO_OVERLAY`(또는 655,360)만 사용함.

## BER 등록하기

BER은 [모드 버스의 `EntityRenderersEvent.RegisterRenderers` 이벤트][event]에서 등록할 수 있습니다. 핸들러에서 `#registerBlockEntityRenderer`를 호출하세요.

```java
public class MyBlockEntityRenderer implements BlockEntityRenderer {

    public MyBlockEntityRenderer(BlockEntityRendererProvider.Context ctx) {
        // 렌더러 초기화
    }

    // #render와 같은 기타 렌더링 함수 구현
}

// 이벤트 클래스
@SubscribeEvent
public static void registerRenderers(EntityRenderersEvent.RegisterRenderers event) {
    event.registerBlockEntityRenderer(MyBlockEntityTypes.MYBE.get(), MyBlockEntityRenderer::new);
}
```

[event]: ../concepts/events.md#이벤트에-핸들러-등록하기
