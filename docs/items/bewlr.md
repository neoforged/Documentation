BlockEntityWithoutLevelRenderer
=======================

`BlockEntityWithoutLevelRenderer`는 아이템을 동적으로 렌더링하는 클래스입니다. 이 시스템은 이전에 `ItemStack`을 기반으로 만든 오래된 시스템보다 간단한데, 그때는 `BlockEntity`를 사용했어야만 했고, `ItemStack`에 접근할 수 없었습니다.

BlockEntityWithoutLevelRenderer 쓰기
--------------------------

`BlockEntityWithoutLevelRenderer`(또는 BWELR)는 아이템을 `public void renderByItem(itemStack, itemDisplayContext, poseStack, multiBufferSource, combinedLight, combinedOverlay)`를 사용해 렌더링할 수 있도록 합니다.

BEWLR을 사용하기 위해선, 아이템의 모델이 `BakedModel#isCustomRenderer`에서 `true`를 반환하도록 해야 합니다, 그렇지 않다면 기본 렌더러인 `ItemRenderer#getBlockEntityRenderer`를 사용하게 됩니다.

:::note
만약 블록의 `Block#getRenderShape`가 `RenderShape#ENTITYBLOCK_ANIMATED`로 설정되어 있다면 똑같이 BEWLR을 씁니다.
:::

아이템이 사용할 BEWLR을 지정하기 위해선, `IClientItemExtensions`의 익명 인스턴스를 `Item#initializeClient`에서 사용하셔야 합니다. 이때 사용하는 익명 인스턴스에서 `IClientItemExtensions#getCustomRenderer`를 재정의해서 BEWLR을 반환하도록 해야 합니다.

```java
// 아이템 클래스 내부
@Override
public void initializeClient(Consumer<IClientItemExtensions> consumer) {
    consumer.accept(new IClientItemExtensions() {
        @Override
        public BlockEntityWithoutLevelRenderer getCustomRenderer() {
            return myBEWLRInstance;
        }
    });
}
```

:::caution
각 모드는 하나의 BEWLR 만 사용하실 수 있습니다.
:::
