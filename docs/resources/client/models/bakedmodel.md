# Baked Models

`BakedModel`s are the in-code representation of a shape with textures. They can be obtained from multiple sources, for example by calling `UnbakedModel#bake` (default model loader) or `IUnbakedGeometry#bake` ([custom model loaders][modelloader]). Some [block entity renderers][ber] also make use of baked models. There is no limit to how complex a model may be.

## Methods of `BakedModel`

### `getQuads`

The most important method of a baked model is `getQuads`. This method is responsible for returning a list of `BakedQuad`s, which can then be sent to the GPU. A quad compares to a triangle in a modeling program (and in most other games), however due to Minecraft's general focus on squares, the developers elected to use quads (4 vertices) instead of triangles (3 vertices) for rendering in Minecraft. `getQuads` has five parameters that can be used:

- A `BlockState`: The [blockstate] being rendered. May be null, indicating that an item is being rendered.
- A `Direction`: The direction of the face being culled against. May be null, indicating that no culling should occur. Will always be null for items.
- A `RandomSource`: A client-bound random source you can use for randomization.
- A `ModelData`: The extra model data to use. This may contain additional data from the block entity needed for rendering.
- A `RenderType`: The [render type][rendertype] to use for rendering the block. May be null, indicating that the default render type should be used.

Be aware that this method is called very often (several times per model and frame), and as such should cache as much as possible.

### `applyTransform` and `getTransforms`

`applyTransform` allows for applying custom logic when applying perspective transformations to the model, including returning a completely separate model. This method is added by NeoForge as a replacement for the vanilla `getTransforms()` method, which only allows you to customize the transforms themselves, but not the way they are applied. However, `applyTransform`'s default implementation defers to `getTransforms`, so if you only need custom transforms, you can also override `getTransforms` and be done with it. `applyTransforms` offers three parameters:

- An `ItemDisplayContext`: The [perspective] the model is being transformed to.
- A `PoseStack`: The pose stack used for rendering.
- A `boolean`: Whether to use modified values for left-hand rendering instead of the default right hand rendering; `true` if the rendered hand is the left hand (off hand, or main hand if left hand mode is enabled in the options)

### Others

Other methods in `BakedModel` that you may override and/or query include:

| Signature                                                                     | Effect                                                                                                                                                                                                         |
|-------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `boolean useAmbientOcclusion()`                                               | Whether to use [ambient occlusion][ao] or not. Has an override that accepts a `BlockState` parameter, and an override that accepts a `BlockState` and a `RenderType` parameter.                                |
| `boolean isGui3d()`                                                           | Whether to use a 3d renderer for rendering in GUIs or not. Also affects GUI lighting.                                                                                                                          |
| `boolean usesBlockLight()`                                                    | Whether to use block light when lighting the model or not.                                                                                                                                                     |
| `boolean isCustomRenderer()`                                                  | If true, skips normal rendering and calls an associated [block entity renderer][ber]'s `renderByItem` method instead. If false, renders through the default renderer.                                          |
| `ItemOverrides getOverrides()`                                                | Returns the [`ItemOverrides`][itemoverrides] associated with this model. This is generally only relevant on item models.                                                                                       |
| `ModelData getModelData(BlockAndTintGetter, BlockPos, BlockState, ModelData)` | Returns the model data to use for the model. Mainly used for [block entity renderers][ber].                                                                                                                    |
| `TextureAtlasSprite getParticleIcon(ModelData)`                               | Returns the particle sprite to use for the model. May use the model data to use different particle sprites for different model data values. NeoForge-added, replacing the vanilla overload with no parameters. |

## Perspectives

Minecraft's render engine recognizes a total of 8 perspective types. These are used in a model JSON's `display` block, and represented in code through the `ItemDisplayContext` enum.

| Enum value                | JSON key                  | Usage                                                                                                            |
|---------------------------|---------------------------|------------------------------------------------------------------------------------------------------------------|
| `NONE`                    | `"none"`                  | Fallback purposes in code, should not be used in JSON                                                            |
| `THIRD_PERSON_RIGHT_HAND` | `"thirdperson_righthand"` | Right hand in third person (F5 view, or on other players)                                                        |
| `THIRD_PERSON_LEFT_HAND`  | `"thirdperson_lefthand"`  | Left hand in third person (F5 view, or on other players)                                                         |
| `FIRST_PERSON_RIGHT_HAND` | `"firstperson_righthand"` | Right hand in first person                                                                                       |
| `FIRST_PERSON_LEFT_HAND`  | `"firstperson_lefthand"`  | Left hand in first person                                                                                        |
| `HEAD`                    | `"head"`                  | When in a player's head armor slot (often only achievable via commands)                                          |
| `GUI`                     | `"gui"`                   | Inventories, player hotbar                                                                                       |
| `GROUND`                  | `"ground"`                | Dropped items; note that the rotation of the dropped item is handled by the dropped item renderer, not the model |
| `FIXED`                   | `"fixed"`                 | Item frames                                                                                                      |

## `ItemOverrides`

`ItemOverrides` is a class that provides a way for baked models to process the state of an [`ItemStack`][itemstack] and return a new baked model through the `#resolve` method. `#resolve` has five parameters:

- A `BakedModel`: The original model.
- An `ItemStack`: The affected item stack.
- A `ClientLevel`: The level the model is being rendered in. This should only be used for querying the level, not mutating it in any way. May be null.
- A `LivingEntity`: The entity the model is rendered on. May be null, e.g. when rendering from a [block entity renderer][ber].
- An `int`: A seed for randomizing.

`ItemOverrides` also hold the model's override options as `BakedOverride`s. An object of `BakedOverride` is an in-code representation of a model's [`overrides`][overrides] block. It can be used by baked models to return different models depending on its contents. A list of all `BakedOverride`s of an `ItemOverrides` instance can be retrieved through `ItemOverrides#getOverrides()`.

## `BakedModelWrapper`

A `BakedModelWrapper` can be used to modify an already existing `BakedModel`. `BakedModelWrapper` is a subclass of `BakedModel` that accepts another `BakedModel` (the "original" model) in the constructor and by default redirects all methods to the original model. Your implementation can then override only select methods, like so:

```java
// The generic parameter may optionally be a more specific subclass of BakedModel.
// If it is, the constructor parameter must match that type.
public class MyBakedModelWrapper extends BakedModelWrapper<BakedModel> {
    // Pass the original model to super.
    public MyBakedModelWrapper(BakedModel originalModel) {
        super(originalModel);
    }
    
    // Override whatever methods you want here. You may also access originalModel if needed.
}
```

After writing your model wrapper class, you must apply the wrappers to the models it should affect. Do so in a [client-side][sides] [event handler][event] for `ModelEvent.ModifyBakingResult`:

```java
@SubscribeEvent
public static void modifyBakingResult(ModelEvent.ModifyBakingResult event) {
    // For block models
        event.getModels().computeIfPresent(
        // The model resource location of the model to modify. Get it from
        // BlockModelShaper#stateToModelLocation with the blockstate to be affected as a parameter.
        BlockModelShaper.stateToModelLocation(MyBlocksClass.EXAMPLE_BLOCK.defaultBlockState()),
        // A BiFunction with the location and the original models as parameters, returning the new model.
        (location, model) -> new MyBakedModelWrapper(model);
    );
    // For item models
    event.getModels().computeIfPresent(
        // The model resource location of the model to modify.
        new ModelResourceLocation("examplemod", "example_item", "inventory"),
        // A BiFunction with the location and the original models as parameters, returning the new model.
        (location, model) -> new MyBakedModelWrapper(model);
    );
}
```

[ao]: https://en.wikipedia.org/wiki/Ambient_occlusion
[ber]: ../../../blockentities/ber.md
[blockstate]: ../../../blocks/states.md
[itemoverrides]: #itemoverrides
[itemstack]: ../../../items/index.md#itemstacks
[modelloader]: modelloaders.md
[overrides]: index.md#overrides
[perspective]: #perspectives
[rendertype]: index.md#render-types
