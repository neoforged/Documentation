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

## Entity Models

:::info
This section is a work in progress.
:::

## Animations

:::info
This section is a work in progress.
:::

[events]: ../concepts/events.md
[livingentity]: livingentity.md
[sides]: ../concepts/sides.md
