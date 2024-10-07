# 自定义模型加载器

一个模型就是一个形状。它可以是一个立方体、一组立方体、一组三角形，或者任何其他的几何形状（或几何形状的组合）。在大多数上下文中，模型是如何定义的并不重要，因为最终一切都会在内存中变成`BakedModel`。因此，NeoForge增加了能够注册自定义模型加载器的功能，这些加载器可以将任何你想要的模型转换成游戏使用的`BakedModel`。

一个方块模型的入口点仍然是模型JSON文件。然而，你可以在JSON的根部指定一个`loader`字段，它会将默认加载器替换为你自己的加载器。一个自定义模型加载器可能会忽略默认加载器所需的所有字段。

## 内建模型加载器

除了默认模型加载器，NeoForge还提供了几个内建的加载器，每个加载器都有不同的用途。

### 组合模型

组合模型可以用来在父模型中指定不同的模型部分，并且只在子模型中应用其中的一些。以下面的例子最能说明这一点。考虑以下位于`examplemod:example_composite_model`的父模型：

```json5
{
  "loader": "neoforge:composite",
  // Specify model parts.
  "children": {
    "part_1": {
      "parent": "examplemod:some_model_1"
    },
    "part_2": {
      "parent": "examplemod:some_model_2"
    }
  },
  "visibility": {
    // Disable part 2 by default.
    "part_2": false
  }
}
```

然后，我们可以在`examplemod:example_composite_model`的子模型中禁用和启用单独的部分：

```json5
{
  "parent": "examplemod:example_composite_model",
  // Override visibility. If a part is missing, it will use the parent model's visibility value.
  "visibility": {
    "part_1": false,
    "part_2": true
  }
}
```

要[datagen][modeldatagen]这个模型，使用自定义加载器类`CompositeModelBuilder`。

### 动态流体容器模型

动态流体容器模型，也称为动态桶模型，它最常见的使用场景是用于表示流体容器的物品（如桶或罐）并想在模型中显示流体。这只有在流体量是固定的（例如只有岩浆和细雪）的情况下才可行，如果流体是任意的，那么请使用[`BlockEntityWithoutLevelRenderer`][bewlr]。

```json5
{
  "loader": "neoforge:fluid_container",
  // Required. Must be a valid fluid id.
  "fluid": "minecraft:water",
  // The loader generally expects two textures: base and fluid.
  "textures": {
    // The base container texture, i.e. the equivalent of an empty bucket.
    "base": "examplemod:item/custom_container",
    // The fluid texture, i.e. the equivalent of water in a bucket.
    "fluid": "examplemod:item/custom_container_fluid"
  },
  // Optional, defaults to false. Whether to flip the model upside down, for gaseous fluids.
  "flip_gas": true,
  // Optional, defaults to true. Whether to have the cover act as the mask.
  "cover_is_mask": false,
  // Optional, defaults to true. Whether to apply the fluid's luminosity to the item model.
  "apply_fluid_luminosity": false,
}
```

很多时候，动态流体容器模型会直接使用桶模型。这是通过指定`neoforge:item_bucket`父模型来实现的，如下所示：

```json5
{
  "loader": "neoforge:fluid_container",
  "parent": "neoforge:item/bucket",
  // Replace with your own fluid.
  "fluid": "minecraft:water"
  // Optional properties here. Note that the textures are handled by the parent.
}
```

要[datagen][modeldatagen]这个模型，使用自定义加载器类`DynamicFluidContainerModelBuilder`。请注意，出于对旧版本支持的考虑，这个类还提供了一个设置`apply_tint`属性的方法，这个属性现在已不再使用。

### 元素模型

一个元素模型由方块模型[elements][elements]和一个可选的[根变换][transform]组成。主要用于常规模型渲染之外的场景，例如在[BER][ber]中。

```json5
{
  "loader": "neoforge:elements",
  "elements": [...],
  "transform": {...}
}
```

### 空模型

一个空模型什么都不渲染。

```json5
{
  "loader": "neoforge:empty"
}
```

### 物品层模型

物品层模型是标准`item/generated`模型的一个变种，提供了以下额外的功能：

- 无限数量的层（而不是默认的5层）
- 每一层的[渲染类型][rendertype]

```json5
{
  "loader": "neoforge:item_layers",
  "textures": {
    "layer0": "...",
    "layer1": "...",
    "layer2": "...",
    "layer3": "...",
    "layer4": "...",
    "layer5": "...",
  },
  "render_types": {
    // Map render types to layer numbers. For example, layers 0, 2 and 4 will use cutout.
    "minecraft:cutout": [0, 2, 4],
    "minecraft:cutout_mipped": [1, 3],
    "minecraft:translucent": [5]
  },
  // other stuff the default loader allows here
}
```

要[datagen][modeldatagen]这个模型，使用自定义加载器类`ItemLayerModelBuilder`。

### OBJ模型

OBJ模型加载器允许您在游戏中使用Wavefront `.obj` 3D模型，允许在模型中包含任意形状（包括三角形、圆形等）。`.obj`模型必须放在`models`文件夹（或其子文件夹）中，并且必须提供一个同名的`.mtl`文件（或手动设置），所以例如，位于`models/block/example.obj`的OBJ模型必须有一个对应的MTL文件位于`models/block/example.mtl`。

```json5
{
  "loader": "neoforge:obj",
  // Required. Reference to the model file. Note that this is relative to the namespace root, not the model folder.
  "model": "examplemod:models/example.obj",
  // Normally, .mtl files must be put into the same location as the .obj file, with only the file ending differing.
  // This will cause the loader to automatically pick them up. However, you can also set the location
  // of the .mtl file manually if needed.
  "mtl_override": "examplemod:models/example_other_name.mtl",
  // These textures can be referenced in the .mtl file as #texture0, #particle, etc.
  // This usually requires manual editing of the .mtl file.
  "textures": {
    "texture0": "minecraft:block/cobblestone",
    "particle": "minecraft:block/stone"
  },
  // Enable or disable automatic culling of the model. Optional, defaults to true.
  "automatic_culling": false,
  // Whether to shade the model or not. Optional, defaults to true.
  "shade_quads": false,
  // Some modeling programs will assume V=0 to be bottom instead of the top. This property flips the Vs upside-down.
  // Optional, defaults to false.
  "flip_v": true,
  // Whether to enable emissivity or not. Optional, defaults to true.
  "emissive_ambient": false
}
```

要[datagen][modeldatagen]这个模型，使用自定义加载器类`ObjModelBuilder`。

### 独立变换模型

独立变换模型可用于根据视角切换不同的模型。视角与[normal model][model]中的`display`块相同。这通过指定一个基础模型（作为后备）然后为每个视角指定覆盖模型来实现。注意，如果您愿意，每个这样的模型都可以是完整的模型，但通常最简单的方法是使用那个模型的子模型来引用另一个模型，如下所示：

```json5
{
  "loader": "neoforge:separate_transforms",
  // Use the cobblestone model normally.
  "base": {
    "parent": "minecraft:block/cobblestone"
  },
  // Use the stone model only when dropped.
  "perspectives": {
    "ground": {
      "parent": "minecraft:block/stone"
    }
  }
}
```

要[datagen][modeldatagen]这个模型，使用自定义加载器类`SeparateTransformsModelBuilder`。

## 创建自定义模型加载器

要创建自己的模型加载器，您需要三个类加上一个事件处理程序：

- 一个几何体加载器类
- 一个几何体类
- 一个动态的[baked model][bakedmodel]类
- 一个用于`ModelEvent.RegisterGeometryLoaders`的[客户端][sides] [事件处理程序][event]，用于注册几何体加载器

为了说明这些类是如何连接的，我们将跟随一个模型的加载过程：

- 在模型加载期间，带有`loader`属性设置为您的加载器的模型JSON被传递给您的几何体加载器。然后，几何体加载器读取模型JSON并使用模型JSON的属性返回一个几何体对象。
- 在模型烘焙期间，几何体被烘焙，返回一个动态烘焙模型。
- 在模型渲染期间，动态烘焙模型用于渲染。

让我们通过一个基本的类设置进一步说明。几何体加载器类命名为`MyGeometryLoader`，几何体类命名为`MyGeometry`，动态烘焙模型类命名为`MyDynamicModel`：

```java
public class MyGeometryLoader implements IGeometryLoader<MyGeometry> {
    // It is highly recommended to use a singleton pattern for geometry loaders, as all models can be loaded through one loader.
    public static final MyGeometryLoader INSTANCE = new MyGeometryLoader();
    // The id we will use to register this loader. Also used in the loader datagen class.
    public static final ResourceLocation ID = new ResourceLocation("examplemod", "my_custom_loader");
    
    // In accordance with the singleton pattern, make the constructor private.        
    private MyGeometryLoader() {}
    
    @Override
    public MyGeometry read(JsonObject jsonObject, JsonDeserializationContext context) throws JsonParseException {
        // Use the given JsonObject and, if needed, the JsonDeserializationContext to get properties from the model JSON.
        // The MyGeometry constructor may have constructor parameters (see below).
        return new MyGeometry();
    }
}

public class MyGeometry implements IUnbakedGeometry<MyGeometry> {
    // The constructor may have any parameters you need, and store them in fields for further usage below.
    // If the constructor has parameters, the constructor call in MyGeometryLoader#read must match them.
    public MyGeometry() {}

    // Method responsible for model baking, returning our dynamic model. Parameters in this method are:
    // - The geometry baking context. Contains many properties that we will pass into the model, e.g. light and ao values.
    // - The model baker. Can be used for baking sub-models.
    // - The sprite getter. Maps materials (= texture variables) to TextureAtlasSprites. Materials can be obtained from the context.
    //   For example, to get a model's particle texture, call spriteGetter.apply(context.getMaterial("particle"));
    // - The model state. This holds the properties from the blockstate file, e.g. rotations and the uvlock boolean.
    // - The item overrides. This is the code representation of an "overrides" block in an item model.
    // - The resource location of the model.
    @Override
    public BakedModel bake(IGeometryBakingContext context, ModelBaker baker, Function<Material, TextureAtlasSprite> spriteGetter, ModelState modelState, ItemOverrides overrides, ResourceLocation modelLocation) {
        // See info on the parameters below.
        return new MyDynamicModel(context.useAmbientOcclusion(), context.isGui3d(), context.useBlockLight(),
                spriteGetter.apply(context.getMaterial("particle")), overrides);
    }

    // Method responsible for correctly resolving parent properties. Required if this model loads any nested models or reuses the vanilla loader on itself (see below).
    @Override
    public void resolveParents(Function<ResourceLocation, UnbakedModel> modelGetter, IGeometryBakingContext context) {
        base.resolveParents(modelGetter);
    }
}

// BakedModelWrapper can be used as well to return default values for most methods, allowing you to only override what actually needs to be overridden.
public class MyDynamicModel implements IDynamicBakedModel {
    // Material of the missing texture. Its sprite can be used as a fallback when needed.
    private static final Material MISSING_TEXTURE = 
            new Material(TextureAtlas.LOCATION_BLOCKS, MissingTextureAtlasSprite.getLocation());

    // Attributes for use in the methods below. Optional, the methods may also use constant values if applicable.
    private final boolean useAmbientOcclusion;
    private final boolean isGui3d;
    private final boolean usesBlockLight;
    private final TextureAtlasSprite particle;
    private final ItemOverrides overrides;

    // The constructor does not require any parameters other than the ones for instantiating the final fields.
    // It may specify any additional parameters to store in fields you deem necessary for your model to work.
    public MyDynamicModel(boolean useAmbientOcclusion, boolean isGui3d, boolean usesBlockLight, TextureAtlasSprite particle, ItemOverrides overrides) {
        this.useAmbientOcclusion = useAmbientOcclusion;
        this.isGui3d = isGui3d;
        this.usesBlockLight = usesBlockLight;
        this.particle = particle;
        this.overrides = overrides;
    }

    // Use our attributes. Refer to the article on baked models for more information on the method's effects.
    @Override
    public boolean useAmbientOcclusion() {
        return useAmbientOcclusion;
    }

    @Override
    public boolean isGui3d() {
        return isGui3d;
    }

    @Override
    public boolean usesBlockLight() {
        return usesBlockLight;
    }

    @Override
    public TextureAtlasSprite getParticleIcon() {
        // Return MISSING_TEXTURE.sprite() if you don't need a particle, e.g. when in an item model context.
        return particle;
    }

    @Override
    public ItemOverrides getOverrides() {
        // Return ItemOverrides.EMPTY when in a block model context.
        return overrides;
    }

    // Override this to true if you want to use a custom block entity renderer instead of the default renderer.
    @Override
    public boolean isCustomRenderer() {
        return false;
    }

    // This is where the magic happens. Return a list of the quads to render here. Parameters are:
    // - The blockstate being rendered. May be null if rendering an item.
    // - The side being culled against. May be null, which means quads that cannot be occluded should be returned.
    // - A client-bound random source you can use for randomizing stuff.
    // - The extra data to use. Originates from a block entity (if present), or from BakedModel#getModelData().
    // - The render type for which quads are being requested.
    // NOTE: This may be called many times in quick succession, up to several times per block.
    // This should be as fast as possible and use caching wherever applicable.
    @Override
    public List<BakedQuad> getQuads(@Nullable BlockState state, @Nullable Direction side, RandomSource rand, ModelData extraData, @Nullable RenderType renderType) {
        List<BakedQuad> quads = new ArrayList<>();
        // add elements to the quads list as needed here
        return quads;
    }
}
```

在所有操作完成后，不要忘记实际注册您的加载器，否则所有的工作都将白费：

```java
// Client-side mod bus event handler
@SubscribeEvent
public static void registerGeometryLoaders(ModelEvent.RegisterGeometryLoaders event) {
    event.register(MyGeometryLoader.ID, MyGeometryLoader.INSTANCE);
}
```

### 数据生成

当然，我们也可以对我们的模型进行[数据生成]。为此，我们需要一个扩展`CustomLoaderBuilder`的类：

```java
// This assumes a block model. Use ItemModelBuilder as the generic parameter instead 
// if you're making a custom item model.
public class MyLoaderBuilder extends CustomLoaderBuilder<BlockModelBuilder> {
    public MyLoaderBuilder(BlockModelBuilder parent, ExistingFileHelper existingFileHelper) {
        super(
                // Your model loader's id.
                MyGeometryLoader.ID,
                // The parent builder we use. This is always the first constructor parameter.
                parent,
                // The existing file helper we use. This is always the second constructor parameter.
                existingFileHelper,
                // Whether the loader allows inline vanilla elements as a fallback if the loader is absent.
                false
        );
    }
    
    // Add fields and setters for the fields here. The fields can then be used below.
    
    // Serialize the model to JSON.
    @Override
    public JsonObject toJson(JsonObject json) {
        // Add your fields to the given JsonObject.
        // Then call super, which adds the loader property and some other things.
        return super.toJson(json);
    }
}
```

要使用这个加载器构建器，在块（或物品）[模型数据生成][modeldatagen]期间执行以下操作：

```java
// This assumes a BlockStateProvider. Use getBuilder("my_cool_block") directly in an ItemModelProvider.
// The parameter for customLoader() is a BiFunction. The parameters of the BiFunction
// are the result of the getBuilder() call and the provider's ExistingFileHelper.
MyLoaderBuilder loaderBuilder = models().getBuilder("my_cool_block").customLoader(MyLoaderBuilder::new);
```

然后，在`loaderBuilder`上调用你的字段设置器。

#### 可见性

`CustomLoaderBuilder`的默认实现有应用可见性的方法。你可以选择在你的模型加载器中使用或忽视`visibility`属性。目前，只有[复合模型加载器][composite]使用了这个属性。

### 重用默认模型加载器

在某些情况下，重用 Vanilla 模型加载器并在其基础上构建你的模型逻辑，而不是直接替换它，是有意义的。我们可以使用一个巧妙的技巧来实现这个目标：在模型加载器中，我们只需移除`loader`属性，然后将其发送回模型解析器，让其误以为现在是一个常规模型。然后我们将它传给几何体，在那里烘焙模型几何体（就像默认的几何体处理器那样），并将其传递给动态模型，在那里我们可以以我们想要的方式使用模型的quads：

```java
public class MyGeometryLoader implements IGeometryLoader<MyGeometry> {
    public static final MyGeometryLoader INSTANCE = new MyGeometryLoader();
    public static final ResourceLocation ID = new ResourceLocation(...);
    
    private MyGeometryLoader() {}
    
    @Override
    public MyGeometry read(JsonObject jsonObject, JsonDeserializationContext context) throws JsonParseException {
        // Trick the deserializer into thinking this is a normal model by removing the loader field and then passing it back into the deserializer.
        jsonObject.remove("loader");
        BlockModel base = context.deserialize(jsonObject, BlockModel.class);
        // other stuff here if needed
        return new MyGeometry(base);
    }
}

public class MyGeometry implements IUnbakedGeometry<MyGeometry> {
    private final BlockModel base;

    // Store the block model for usage below.            
    public MyGeometry(BlockModel base) {
        this.base = base;
    }

    @Override
    public BakedModel bake(IGeometryBakingContext context, ModelBaker baker, Function<Material, TextureAtlasSprite> spriteGetter, ModelState modelState, ItemOverrides overrides, ResourceLocation modelLocation) {
        BakedModel bakedBase = new ElementsModel(base.getElements()).bake(context, baker, spriteGetter, modelState, overrides, modelLocation);
        return new MyDynamicModel(bakedBase, /* other parameters here */);
    }

    @Override
    public void resolveParents(Function<ResourceLocation, UnbakedModel> modelGetter, IGeometryBakingContext context) {
        base.resolveParents(modelGetter);
    }
}

public class MyDynamicModel implements IDynamicBakedModel {
    private final BakedModel base;
    // other fields here

    public MyDynamicModel(BakedModel base, /* other parameters here */) {
        this.base = base;
        // set other fields here
    }

    // other override methods here

    @Override
    public List<BakedQuad> getQuads(@Nullable BlockState state, @Nullable Direction side, RandomSource rand, ModelData extraData, @Nullable RenderType renderType) {
        List<BakedQuad> quads = new ArrayList<>();
        // Add the base model's quads. Can also do something different with the quads here, depending on what you need.
        quads.add(base.getQuads(state, side, rand, extraData, renderType));
        // add other elements to the quads list as needed here
        return quads;
    }
    
    // Apply the base model's transforms to our model as well.
    @Override
    public BakedModel applyTransform(ItemDisplayContext transformType, PoseStack poseStack, boolean applyLeftHandTransform) {
        return base.applyTransform(transformType, poseStack, applyLeftHandTransform);
    }
}
```

[bakedmodel]: bakedmodel.md
[ber]: ../../../blockentities/ber.md
[bewlr]: ../../../items/bewlr.md
[composite]: #composite-model
[datagen]: ../../index.md#data-generation
[elements]: index.md#elements
[event]: ../../../concepts/events.md#registering-an-event-handler
[model]: index.md#specification
[modeldatagen]: datagen.md
[rendertype]: index.md#render-types
[sides]: ../../../concepts/sides.md
[transform]: index.md#root-transforms
