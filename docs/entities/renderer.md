---
sidebar_position: 5
---
# Entity Renderers

Entity renderers are used to define rendering behavior for an entity. They only exist on the [logical and physical client][sides].

Entity rendering uses what is known as entity render states. Simply put, this is an object that holds all values that the renderer needs. Every time the entity is rendered, the render state is updated, and then the `#render` method uses that render state to render the entity. This is to avoid common issues when the entity renderer accidentally mutates the entity's fields.

## Creating an Entity Renderer

The simplest entity renderer is one that directly extends `EntityRenderer`:

```java
// The generic type in the superclass should be set to what entity you want to render.
// If you wanted to enable rendering for any entity, you'd use Entity, like we do here.
// You'd also use an EntityRenderState that fits your use case. More on this below.
public class MyEntityRenderer extends EntityRenderer<Entity, EntityRenderState> {
    // In our constructor, we just forward to super.
    public MyEntityRenderer(EntityRendererProvider.Context context) {
        super(context);
    }

    // Tell the render engine how to create a new entity render state.
    public EntityRenderState createRenderState() {
        return new EntityRenderState();
    }

    // Update the render state by copying the needed values from the passed entity to the passed state.
    // Both Entity and EntityRenderState may be replaced with more concrete types,
    // based on the generic types that have been passed to the supertype.
    public void extractRenderState(Entity entity, EntityRenderState state, float partialTick) {
        super.extractRenderState(entity, state, partialTick);
        // Extract and store any additional values in the state here.
    }
    
    // Actually render the entity. The first parameter matches the render state's generic type.
    // Calling super will handle leash and name tag rendering for you, if applicable.
    public void render(EntityRenderState state, PoseStack poseStack, MultiBufferSource bufferSource, int packedLight) {
        super.render(state, entityYaw, partialTick, poseStack, bufferSource, packedLight);
        // do your own rendering here
    }
}
```

Now that we have our entity renderer, we also need to register it and connect it to its owning entity. This is done in [`EntityRenderersEvent.RegisterRenderers`][events] like so:

```java
@SubscribeEvent
public static void registerEntityRenderers(EntityRenderersEvent.RegisterRenderers event) {
    event.registerEntityRenderer(MY_ENTITY_TYPE.get(), MyEntityRenderer::new);
}
```

## Entity Render States

As mentioned before, entity render states are used to separate values used for rendering from the actual entity's values. There's nothing more to them, they are really just mutable data storage objects. As such, extending is really easy:

```java
public class MyEntityRenderState extends EntityRenderState {
    public ItemStack stackInHand;
}
```

That's literally it. Extend the class, add your field, and off you go. The only thing left to do now is to update that `stackInHand` field in `EntityRenderer#extractRenderState`, as explained above.

## Hierarchy

Like with entities themselves, entity renderers also have a class hierarchy, though not as layered. It basically boils down to:

- `EntityRenderer`: The abstract base class. Many entities, notably almost all non-living ones, extend this class directly.
    - `ArrowRenderer`, `AbstractBoatRenderer`, `AbstractMinecartRenderer`: These exist mainly for convenience, and are used as parents for more specific renderers. `ArrowRenderer` is also used directly by the regular arrow entity.
    - `LivingRenderer`: The abstract base class for renderers for [living entities][livingentity]. Direct subclasses include `ArmorStandRenderer` and `PlayerRenderer`.
        - `MobRenderer`: The abstract base class for renderers for `Mob`s. Many renderers extend this directly.
            - `AgeableRenderer`: The abstract base class for renderers for `Mob`s that have child variants. This includes monsters with child variants, such as hoglins.
                - `HumanoidMobRenderer`: The abstract base class for humanoid entity renderers. Used by e.g. zombies and skeletons.

As with the various entity classes, use what fits your use case most. Be aware that many of these classes have corresponding type bounds in their generics; for example, `LivingRenderer` has type bounds for `LivingEntity` and `LivingEntityRenderState`.

## Entity Models and Layer Definitions

Many renderers, especially the `LivingRenderer` and its subclasses, make use of `EntityModel`s. `EntityModel`s are basically a list of cubes and associated textures for the renderer to use. They are commonly created statically when the entity renderer's constructor is first created.

Entity models use a layer system, where each layer is represented as a `LayerDefinition`. A renderer can use multiple layers, and the renderer can decide what layer(s) to render at what time. For example, the elytra uses a separate layer that is rendered independently of the `LivingEntity` wearing it. Similarly, player capes are also a separate layer.

### Creating a Layer Definition

With all that out of the way, let's create an entity model ourselves:

```java
// You may use a more specific subtype of EntityRenderState in the generic.
// If you do, all uses of EntityRenderState within the class will change to that more specific subtype.
public class MyEntityModel extends EntityModel<EntityRenderState> {
    // A static method in which we create our layer definition. createBodyLayer() is the name
    // most vanilla models use. If you have multiple layers, you will have multiple of these static methods.
    public static LayerDefinition createBodyLayer() {
        // Create our mesh.
        MeshDefinition mesh = new MeshDefinition();
        // The mesh initially contains no object other than the root, which is invisible (has a size of 0x0x0).
        PartDefinition root = mesh.getRoot();
        // We add a head part.
        PartDefinition head = root.addOrReplaceChild(
            // The name of the part.
            "head",
            // The CubeListBuilder we want to add. While it is possible to add multiple cubes into one part,
            // it is generally discouraged and only one cube per PartDefinition should be used.
            CubeListBuilder.create()
                // The UV coordinates to use within the texture. Texture binding itself is explained below.
                // In this example, we start at U=10, V=20.
                .texOffs(10, 20)
                // Add our cube. Again, while multiple can be added, it is recommended to only add one.
                .addBox(
                    // The origin of the cube, relative to the parent object's position.
                    -5, -5, -5,
                    // The size of the cube.
                    10, 10, 10
                ),
            // An additional offset to apply to all elements of the CubeListBuilder. Besides PartPose#offset,
            // PartPose#offsetAndRotation is also available. This can be reused across multiple PartDefinitions.
            PartPose.offset(0, 8, 0)
        );
        // We can now add children to any PartDefinition, thus creating a hierarchy.
        PartDefinition part1 = root.addOrReplaceChild(...);
        PartDefinition part2 = head.addOrReplaceChild(...);
        PartDefinition part3 = part1.addOrReplaceChild(...);
        // At the end, we create a LayerDefinition from the MeshDefinition.
        // The two integers are the expected dimensions of the texture; 64x32 in our example.
        return LayerDefinition.create(mesh, 64, 32);
    }
}
```

Note that in the above example, we directly extend `EntityModel`; depending on your use case, it might be more appropriate to use one of the subclasses instead. When creating a new model, it is recommended you have a look at whatever existing model is closest to your use case, and then work from there.

:::tip
The [Blockbench][blockbench] modeling program is a great help in creating entity models. To do so, choose the Modded Entity option when creating your model in Blockbench.

Blockbench also has an option to export models as a `LayerDefinition` creation method, which can be found under `File -> Export -> Export Java Entity`.
:::

### Registering a Layer Definition

Once we have our entity layer definition, we also need to register it in `EntityRenderersEvent.RegisterLayerDefinitions`. To do so, we need a `ModelLayerLocation`, which essentially acts as an identifier for our layer (remember, one entity can have multiple layers).

```java
// Our ModelLayerLocation.
public static final ModelLayerLocation MY_LAYER = new ModelLayerLocation(
    // Should be the name of the entity this layer belongs to.
    // May be more generic if this layer can be used on multiple entities.
    ResourceLocation.fromNamespaceAndPath("examplemod", "example_entity"),
    // The name of the layer itself.
    "main"
);

@SubscribeEvent
public static void registerLayerDefinitions(EntityRenderersEvent.RegisterLayerDefinitions event) {
    // Add our layer here.
    event.add(MY_LAYER, MyEntityModel::createBodyLayer);
}
```

### Adding a Layer Definition to an Entity

In some contexts, you might also want to add a new layer to an existing entity. For example, you might want to render some extra equipment on an entity when worn. This can be done like so:

```java
@SubscribeEvent
public static void addLayers(EntityRenderersEvent.AddLayers event) {
    // Add a layer to every single entity type.
    for (EntityType<?> entityType : event.getEntityTypes()) {
        // Get our renderer.
        EntityRenderer<?, ?> renderer = event.getRenderer(entityType);
        // Null-check the renderer. You could add more checks here. For example, a common check is
        // `instanceof LivingEntityRenderer<?, ?>` to only target living entity renderers.
        if (renderer != null) {
            // Add the layer to the renderer. Reuses the ModelLayerLocation from above.
            renderer.addLayer(MY_LAYER);
        }
    }
}
```

For players, a bit of special-casing is required because there can actually be multiple player renderers. These are managed separately by the event. We can interact with them like so:

```java
@SubscribeEvent
public static void addPlayerLayers(EntityRenderersEvent.AddLayers event) {
    // Iterate over all possible player models.
    for (PlayerSkin.Model skin : event.getSkins()) {
        // Get the associated PlayerRenderer.
        if (event.getSkin(skin) instanceof PlayerRenderer playerRenderer) {
            // Add the layer to the renderer.
            playerRenderer.addLayer(MY_LAYER);
        }
    }
}
```

## Animations

:::info
This section is a work in progress.
:::

[blockbench]: https://www.blockbench.net/
[events]: ../concepts/events.md
[livingentity]: livingentity.md
[sides]: ../concepts/sides.md
