---
sidebar_position: 5
---
# Entity Renderers

Entity renderers are used to define rendering behavior for an entity. They only exist on the [logical and physical client][sides].

## Creating an Entity Renderer

The simplest entity renderer is one that directly extends `EntityRenderer`:

```java
// The generic type in the superclass should be set to what entity you want to render.
// If you wanted to enable rendering for any entity, you'd use Entity, like we do here.
public class MyEntityRenderer extends EntityRenderer<Entity> {
    // Define a constant field for our texture, to use below. The ResourceLocation will be interpreted
    // as relative to your assets namespace, i.e. assets/<modid>, and must end with .png.
    private static final ResourceLocation TEXTURE =
            ResourceLocation.fromNamespaceAndPath("examplemod", "textures/entity/my_entity.png");
    
    // In our constructor, we just forward to super.
    public MyEntityRenderer(EntityRendererProvider.Context context) {
        super(context);
    }

    // Return the texture resource location here. The parameter type matches the generic type we pass to
    // the superclass. More elaborate checks may be performed here, but should probably be cached. 
    public ResourceLocation getTextureLocation(Entity entity) {
        return TEXTURE;
    }

    // Actually render the entity. The first parameter matches the generic type we pass to the superclass.
    // Calling super will handle leash and name tag rendering for you, if applicable.
    public void render(Entity entity, float entityYaw, float partialTick, PoseStack poseStack, MultiBufferSource bufferSource, int packedLight) {
        super.render(entity, entityYaw, partialTick, poseStack, bufferSource, packedLight);
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

## Hierarchy

:::info
This section is a work in progress.
:::

## Entity Models

:::info
This section is a work in progress.
:::

## Animations

:::info
This section is a work in progress.
:::

[events]: ../concepts/events.md
[sides]: ../concepts/sides.md
