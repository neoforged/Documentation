# 烘焙模型

`BakedModel` 是带有纹理的形状在代码中的表示形式。它们可以来自多个来源，例如通过 `UnbakedModel#bake`（默认模型加载器）或 `IUnbakedGeometry#bake`（[自定义模型加载器][modelloader]）的调用生成。一些[方块实体渲染器][ber]也使用烘焙模型。模型的复杂度没有限制。

模型存储在 `ModelManager` 中，可以通过 `Minecraft.getInstance().modelManager` 访问。然后，您可以调用 `ModelManager#getModel` 通过其 [`ResourceLocation`][rl] 或 [`ModelResourceLocation`][mrl] 获取特定模型。模组基本上总是重用之前自动加载和烘焙的模型。

## `BakedModel` 的方法

### `getQuads`

烘焙模型最重要的方法是 `getQuads`。此方法负责返回 `BakedQuad` 的列表，这些列表随后可以发送到 GPU。在建模程序中（以及大多数其他游戏中），四边形类似于三角形，然而由于 Minecraft 通常关注于方形，开发者选择使用四边形（4个顶点）而非三角形（3个顶点）进行渲染。`getQuads` 有五个参数可用：

- `BlockState`：正在渲染的[方块状态][blockstate]。可能为空，表示正在渲染物品。
- `Direction`：正在剔除的面的方向。可能为空，这意味着应该返回不可遮挡的四边形。
- `RandomSource`：客户端绑定的随机源，您可以用于随机化。
- `ModelData`：使用的额外模型数据。这可能包含方块实体渲染所需的额外数据。由 `BakedModel#getModelData` 提供。
- `RenderType`：用于渲染方块的[渲染类型][rendertype]。可能为空，表示应返回此模型使用的所有渲染类型的四边形。否则，它是 `BakedModel#getRenderTypes` 返回的渲染类型之一（见下文）。

模型应该大量缓存。这是因为即使区块只有在其中一个方块更改时才重建，但此方法中的计算仍需尽可能快速，并且理想情况下由于该方法将被每个区块部分调用多次（每个给定模型使用的渲染类型的次数 * 每个模型使用的渲染类型的数量 * 每个区块部分 4096 个方块），因此应该进行大量缓存。此外，[方块实体渲染器][ber]或实体渲染器实际上可能每帧调用此方法几次。

### `applyTransform` 和 `getTransforms`

`applyTransform` 允许在应用模型的透视变换时应用自定义逻辑，包括返回完全不同的模型。此方法由 NeoForge 添加，替代了 vanilla 的 `getTransforms()` 方法，后者只允许您自定义变换本身，而不能自定义应用方式。然而，`applyTransform` 的默认实现遵循 `getTransforms`，所以如果您只需要自定义变换，也可以重写 `getTransforms` 并完成它。`applyTransforms` 提供三个参数：

- `ItemDisplayContext`：模型正在转换到的[透视][perspective]。
- `PoseStack`：用于渲染的姿势堆栈。
- `boolean`：是否使用修改后的值进行左手渲染，而不是默认的右手渲染；如果渲染的手是左手（副手，或在选项中启用

左手模式的主手），则为 `true`。

:::note
`applyTransform` 和 `getTransforms` 仅适用于物品模型。
:::

### 其他

您可能会重写和/或查询的其他 `BakedModel` 方法包括：

| 签名 | 效果 |
|---|---|
| `TriState useAmbientOcclusion()` | 是否使用[环境光遮蔽][ao]。接受 `BlockState`、`RenderType` 和 `ModelData` 参数，并返回 `TriState`，这不仅允许强制禁用 AO，还允许强制启用 AO。有两个重载，每个都返回一个 `boolean` 参数，并只接受 `BlockState` 或无参数；这两个都已弃用，将被第一个变体取代。 |
| `boolean isGui3d()` | 此模型在 GUI 插槽中是否渲染为 3D 或平面。 |
| `boolean usesBlockLight()` | 在照亮模型时是否使用 3D 照明（`true`）或正面的平面照明（`false`）。 |
| `boolean isCustomRenderer()` | 如果为真，跳过正常渲染并调用关联的 [`BlockEntityWithoutLevelRenderer`][bewlr] 的 `renderByItem` 方法。如果为假，则通过默认渲染器渲染。 |
| `ItemOverrides getOverrides()` | 返回与此模型相关的 [`ItemOverrides`][itemoverrides]。这仅在物品模型中相关。 |
| `ModelData getModelData(BlockAndTintGetter, BlockPos, BlockState, ModelData)` | 返回用于模型的模型数据。此方法传递一个现有的 `ModelData`，如果方块有关联的方块实体，则为 `BlockEntity#getModelData()` 的结果，如果不是这种情况，则为 `ModelData.EMPTY`。此方法可用于需要模型数据但没有方块实体的方块，例如具有连接纹理的方块。 |
| `TextureAtlasSprite getParticleIcon(ModelData)` | 返回用于模型的粒子精灵。可以使用模型数据为不同的模型数据值使用不同的粒子精灵。NeoForge 添加，替换了没有参数的 vanilla `getParticleIcon()` 重载。 |
| `ChunkRenderTypeSet getRenderTypes(BlockState, RandomSource, ModelData)` | 返回包含用于渲染方块模型的渲染类型的 `ChunkRenderTypeSet`。`ChunkRenderTypeSet` 是一个支持集合的有序 `Iterable<RenderType>`。默认回退到从模型 JSON [获取渲染类型][rendertype]。仅用于方块模型，物品模型使用下面的重载。 |
| `List<RenderType> getRenderTypes(ItemStack, boolean)` | 返回包含用于渲染物品模型的渲染类型的 `List<RenderType>`。默认回退到正常的模型绑定渲染类型查找，这总是产生一个元素的列表。仅用于物品模型，方块模型使用上面的重载。 |

## 透视

Minecraft 的渲染引擎总共识别 8 种透视类型（如果包括代码中的回退，则为 9 种）用于物品渲染。这些在模型 JSON 的 `display` 块中使用，并在代码中通过 `ItemDisplayContext` 枚举表示。

| 枚举值 | JSON 键 | 用途 |
|---|---|---|
| `THIRD_PERSON_RIGHT_HAND` | `"thirdperson_righthand"` | 第三人称右手（F5 视图，或其他玩家上） |
| `THIRD_PERSON_LEFT_HAND`  | `"thirdperson_lefthand"`  | 第三人称左手（F5 视图，或其他玩家上） |
| `FIRST_PERSON_RIGHT_HAND` | `"firstperson_righthand"` | 第一人称右手 |
| `FIRST_PERSON_LEFT_HAND`  | `"firstperson_lefthand"`  | 第一人

称左手 |
| `HEAD`                    | `"head"`                  | 玩家头部装备槽中（通常只能通过命令实现） |
| `GUI`                     | `"gui"`                   | 背包，玩家快捷栏 |
| `GROUND`                  | `"ground"`                | 掉落物；注意，掉落物的旋转是由掉落物渲染器处理的，而非模型 |
| `FIXED`                   | `"fixed"`                 | 物品框 |
| `NONE`                    | `"none"`                  | 代码中的回退用途，不应在 JSON 中使用 |

## `ItemOverrides`

`ItemOverrides` 是一个类，提供了一种方式让烘焙模型处理 [`ItemStack`][itemstack] 的状态并通过 `#resolve` 方法返回新的烘焙模型。`#resolve` 有五个参数：

- `BakedModel`：原始模型。
- `ItemStack`：正在渲染的物品堆栈。
- `ClientLevel`：模型正在其中渲染的级别。这应该只用于查询级别，不得以任何方式修改。可能为空。
- `LivingEntity`：模型渲染在其上的实体。可能为空，例如在[方块实体渲染器][ber]中渲染时。
- `int`：用于随机化的种子。

`ItemOverrides` 还持有模型的覆盖选项作为 `BakedOverride`。`BakedOverride` 的对象是模型的 [`overrides`][overrides] 块在代码中的表示形式。它可以由烘焙模型使用，根据其内容返回不同的模型。可以通过 `ItemOverrides#getOverrides()` 检索 `ItemOverrides` 实例的所有 `BakedOverride` 列表。

## `BakedModelWrapper`

`BakedModelWrapper` 可用于修改已存在的 `BakedModel`。`BakedModelWrapper` 是 `BakedModel` 的一个子类，它在构造函数中接受另一个 `BakedModel`（“原始”模型），并默认将所有方法重定向到原始模型。然后，您的实现可以选择只覆盖某些方法，如下所示：

```java
// 泛型参数可以是 BakedModel 的更具体的子类。
// 如果是这样，构造参数必须匹配该类型。
public class MyBakedModelWrapper extends BakedModelWrapper<BakedModel> {
    // 将原始模型传递给 super。
    public MyBakedModelWrapper(BakedModel originalModel) {
        super(originalModel);
    }
    
    // 在这里覆盖您想要的方法。如果需要，也可以访问 originalModel。
}
```

编写您的模型包装类后，必须将包装器应用于它应影响的模型。在[客户端][sides]的[事件处理器][event]中为 `ModelEvent.ModifyBakingResult` 这样做：

```java
@SubscribeEvent
public static void modifyBakingResult(ModelEvent.ModifyBakingResult event) {
    // 对于方块模型
    event.getModels().computeIfPresent(
        // 要修改的模型的模型资源位置。从
        // BlockModelShaper#stateToModelLocation 获取，参数为受影响的方块状态。
        BlockModelShaper.stateToModelLocation(MyBlocksClass.EXAMPLE_BLOCK.defaultBlockState()),
        // 一个带有位置和原始模型为参数的 BiFunction，返回新模型。
        (location, model) -> new MyBakedModelWrapper(model);
    );
    // 对于物品模型
    event.getModels().computeIfPresent(
        // 要修改的模型的模型资源位置。
        new ModelResourceLocation("examplemod", "example_item", "inventory"),
        // 一个带有位置和原始模型为参数的 BiFunction，返回新模型。
        (location, model) -> new MyBakedModelWrapper(model);
    );
}
```

:::warning
通常建议在可能的情况下使用[自定义模型加载器][modelloader

]而不是在 `ModelEvent.ModifyBakingResult` 中包装烘焙模型。如果需要，自定义模型加载器也可以使用 `BakedModelWrapper`。
:::

[ao]: https://zh.wikipedia.org/wiki/环境光遮蔽
[ber]: ../../../blockentities/ber.md
[bewlr]: ../../../items/bewlr.md
[blockstate]: ../../../blocks/states.md
[itemoverrides]: #itemoverrides
[itemstack]: ../../../items/index.md#itemstacks
[modelloader]: modelloaders.md
[mrl]: ../../../misc/resourcelocation.md#modelresourcelocations
[overrides]: index.md#overrides
[perspective]: #perspectives
[rendertype]: index.md#render-types
[rl]: ../../../misc/resourcelocation.md
