# Custom Model Loaders

A model is simply a shape. It can be a cube, a collection of cubes, a collection of triangles, or any other geometrical shape (or collection of geometrical shape). For most contexts, it is not relevant how a model is defined, as everything will end up as a `BakedModel` in memory anyway. As such, NeoForge adds the ability to register custom model loaders that can transform any model you want into a `BakedModel` for the game to use.

The entry point for a block model remains the model JSON file. However, you can specify a `loader` field in the root of the JSON that will swap out the default loader for your own loader. A custom model loader may ignore all fields the default loader requires.

## Builtin Model Loaders

Besides the default model loader, NeoForge offers a total of six builtin loaders, each serving a different purpose.

### Composite Model

### Dynamic Bucket Model

### Elements Model

### Item Layer Model

### OBJ Model

### Separate Transforms Model

## Creating Custom Model Loaders

To create your own model loader, you need three classes, plus an event handler:

- A geometry loader class
- A geometry class
- A dynamic model class
- A [client-side][sides] [event handler][event] for `ModelEvent.RegisterGeometryLoaders` that registers the geometry loader

To illustrate how these classes are connected, we will follow a model being loaded:

- During model loading, a model JSON with the `loader` property set to your loader is passed to your geometry loader. The geometry loader then reads the model JSON and returns a geometry object using the model JSON's properties.
- During model baking, the geometry is baked, returning a dynamic model.
- During model rendering, the dynamic model is used for rendering.

Let's illustrate this further through a basic class setup. The geometry loader class is named `MyGeometryLoader`, the geometry class is named `MyGeometry`, and the dynamic model class is named `MyDynamicModel`:

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
}

public class MyDynamicModel implements IDynamicBakedModel {
    // Sprite of the missing texture. Can be used as a fallback when needed.
    private static final TextureAtlasSprite MISSING_TEXTURE = 
            new Material(TextureAtlas.LOCATION_BLOCKS, MissingTextureAtlasSprite.getLocation()).sprite();

    // Whether to use ambient occlusion when rendering. Provided by the geometry baking context.
    private final boolean useAmbientOcclusion;
    // Whether to use 3d rendering in a GUI. Provided by the geometry baking context.
    private final boolean isGui3d;
    // Whether to use block light. Provided by the geometry baking context.
    private final boolean usesBlockLight;
    // The particle sprite to use when breaking, falling on, or walking over a block. Irrelevant on item models.
    private final TextureAtlasSprite particle;
    // The item overrides to use. Irrelevant on block models.
    private final ItemOverrides overrides;

    // The constructor does not require any parameters other than the ones for instantiating the final fields.
    // It may specify any additional parameters to store in fields you deem necessary for your model to work.
    public MyDynamicModel(boolean useAmbientOcclusion, boolean isGui3d, boolean usesBlockLight,
            TextureAtlasSprite particle, ItemOverrides overrides) {
        this.useAmbientOcclusion = useAmbientOcclusion;
        this.isGui3d = isGui3d;
        this.usesBlockLight = usesBlockLight;
        this.particle = particle;
        this.overrides = overrides;
    }

    // Use our attributes.
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
        // Return MISSING_TEXTURE if you don't need a particle, e.g. when in an item model context.
        return particle;
    }

    @Override
    public ItemOverrides getOverrides() {
        // Return ItemOverrides.EMPTY when in a block model context.
        return overrides;
    }

    // Override this to true if you also want to use a custom renderer instead of the builtin render engine.
    @Override
    public boolean isCustomRenderer() {
        return false;
    }

    // This is where the magic happens. Return a list of the quads to render here. Parameters are:
    // - The blockstate being rendered.
    // - The side being rendered.
    // - A client-bound random source you can use for randomizing stuff.
    // - The extra face data to use.
    // - The render type of the model.
    @Override
    public List<BakedQuad> getQuads(@Nullable BlockState state, @Nullable Direction side, RandomSource rand, ModelData extraData, @Nullable RenderType renderType) {
        List<BakedQuad> quads = new ArrayList<>();
        // add elements to the quads list as needed here
        return quads;
    }
}
```

### Datagen

Of course, we can also [datagen] our models. To do so, we need a class that extends `CustomLoaderBuilder`:

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

To use this loader builder, do the following during block (or item) [model datagen][modeldatagen]:

```java
// This assumes a BlockStateProvider. Use getBuilder("my_cool_block") directly in an ItemModelProvider.
// The parameter for customLoader() is a BiFunction. The parameters of the BiFunction
// are the result of the getBuilder() call and the provider's ExistingFileHelper.
MyLoaderBuilder loaderBuilder = models().getBuilder("my_cool_block").customLoader(MyLoaderBuilder::new);
```

Then, call your field setters on the `loaderBuilder`.

### Reusing the Default Model Loader

In some contexts, it makes sense to reuse the vanilla model loader and just building your model logic on top of that instead of outright replacing it. We can do so using a neat trick: In the model loader, we simply remove the `loader` property and send it back to the model deserializer, tricking it into thinking that it is a regular model now. We then pass it to the geometry, bake the model geometry there (like the default geometry handler would) and pass it along to the dynamic model, where we can then use the model's quads in whatever way we want:

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

    // Method responsible for correctly resolving parent properties. Unneeded if we don't reuse the default loader properties, but needed if we do, so here we go.
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

[datagen]: ../../index.md#data-generation
[event]: ../../../concepts/events.md#registering-an-event-handler
[modeldatagen]: datagen.md
[sides]: ../../../concepts/sides.md
