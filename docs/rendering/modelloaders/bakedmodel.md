`BakedModel`
=============

`BakedModel`은 바닐라 모델 로더의 `UnbakedModel#bake`, 또는 모드가 추가한 모델 로더의 `IUnbakedGeometry#bake`를 호출하면 생성되는 것으로, 아이템/블록 등의 개념 없이 추상적인 모양만 정의하는 `UnbakedModel` 또는 `IUnbakedGeometry`와 다르게, `BakedModel`은 GPU로 보낼 준비가 (거의) 다 된 구체적이고 최적화된 모델을 표현합니다. 또한 아이템 및 블록의 상태에 따라 생김새를 바꿀 수도 있습니다.

`BakedModel` 인터페이스를 구현해야 하는 경우는 거의 없습니다. 해당 인터페이스를 구현하는 다른 클래스를 사용하는 것이 권장됩니다.

### `getOverrides`

해당 모델의 [`ItemOverrides`][overrides]를 반환합니다. 모델을 아이템처럼 그려낼 때만 사용됩니다.

### `useAmbientOcclusion`

모델이 레벨의 블록으로 그려지고, 해당 블록은 빛을 발산하지 않고, 마지막으로 주변광 차폐(Ambient Occulusion)를 사용한다면 `true`를 반환합니다.

### `isGui3d`

아이템의 모델을 3D로 그려야 하는지를 반환합니다. 땅에 떨어진 아이템 엔티티, 액자에 걸린 아이템, 인벤토리의 블록 아이템 등은 `true`를 반환합니다.  

### `usesBlockLight`

아이템의 모델에 블록과 유사한 조명 효과를 적용할지를 반환합니다. 인벤토리의 블록 아이템의 각 면의 밝기를 다르게 만듭니다.


### `isCustomRenderer`

:::caution
무엇을 만드시는지 잘 모른다면 `false`를 반환하세요.
:::

`true` 반환 시 아이템을 그릴 때 해당 모델을 무시합니다, 그 대신 `BlockEntityWithoutLevelRenderer#renderByItem`를 사용해 그립니다. 상자, 엔더 상자, 셜커와 현수막 등은 `true`를 반환하며, 그려질 때 아이템의 데이터를 `BlockEntity`에 복사하고 그 자리에 `BlockEntityRenderer`를 사용해 블록 엔티티를 대신 그립니다. 자세한 사항은 [BlockEntityWithoutLevelRenderer][bewlr]를 참고하세요.

### `getParticleIcon`

모델의 파티클로 무슨 텍스쳐를 쓸지를 반환합니다. 블록의 경우 엔티티가 위에 낙하할 때 또는 블록이 파괴될 때 파티클을 표시하며, 아이템의 경우 플레이어가 섭취하거나 파괴될 때 표시됩니다.

:::important
아무런 인자도 받지 않는 마인크래프트 바닐라 메서드는 더 이상 사용되지 않습니다. 그 대신 모델 데이터를 전달할 수 있는 `#getParticleIcon(ModelData)`를 사용하세요.
:::

### <s>`getTransforms`</s>

`#applyTransform`으로 대체되어 더 이상 필요하지 않습니다. `#applyTransform`이 구현되어 있다면 재정의할 필요될 없습니다. 자세한 사항은 [모델 변환][transform]을 참고하세요.

### `applyTransform`

[모델 변환][transform]을 참고하세요.

### `getQuads`

이 메서드는 `BakedModel`의 핵심입니다. 다수의 `BakedQuad`들을 반환하는데, 이는 모델을 그릴때 필요한 저수준 꼭짓점 데이터를 담고 있습니다. 만약 모델을 블록으로 그린다면 null이 아닌 `BlockState` 값이 전달됩니다. 모델을 아이템으로 그린다면 `#getOverrides`가 반환한 `ItemOverrides`가 아이템의 데이터를 대신 전달하고, `BlockState`는 null이 전달됩니다.

`Direction` 인자는 모델의 면중 특정 방향을 바라보는 면만 반환해야 할 때 사용됩니다. 주로 보이지 않는 면을 잘라내기 위해 사용됩니다. 만약 블록의 면이 다른 불투명한 블록의 면과 맞닿아 있어 보이지 않는다면 해당 면은 잘려 그려지지 않습니다. 만약 방향으로 `null`이 전달되었을 경우, 특정 방향과 관련 없는 면들을 반환합니다. 이때 이 면들은 잘리지 않습니다.

`rand`는 모델에 다양성을 부여하기 위한 `Random` 객체입니다.

`ModelData`인자는 `ModelProperty`를 통해 모델의 속성을 전달해 필요에 따라 다른 모델로 교체할 때 사용됩니다.

`getQuads` 메서드는 매우 자주 호출됩니다: *레벨의 각 블록마다*, 블록의 각 렌더 계층과 잘리지 않는 면의 모든 조합마다 한 번씩 호출되기 가능한 한 최적화되어야 합니다.

[overrides]: ./itemoverrides.md
[ambocc]: https://en.wikipedia.org/wiki/Ambient_occlusion
[bewlr]: ../../items/bewlr.md
[transform]: ./transform.md
