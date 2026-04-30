---
description: How to work with fluids, fluid states and fluid stacks, and how to add your own.
sidebar_position: 3
---
# Fluids

In vanilla Minecraft, the two fluids - water and lava - are special types of [blocks][block] that can spread to neighboring blocks over a certain distance. They are generally not solid, and [entities][entity] can enter and "swim" in them.

In modded Minecraft, especially in many tech mods, fluids also take on the role of recipe ingredients. This is possible because fluids exist in a separate registry and are only added to the world using fluid blocks, essentially meaning that fluids can be seen in complete independence from blocks.

This article aims to showcase both the in-world and the recipe aspects of fluids.

:::warning
Due to vanilla only having two fluids, and those fluids having a lot of special-casing, some of these systems are very hacky and - due to a lot of edge cases that cannot be reasonably caught in testing - may not always work correctly. If you find a bug with fluids, please reach out to us on Discord.
:::

## `Fluid` and `FluidType`

Before we can register a fluid, we must first understand a few design decisions made by Minecraft and NeoForge.

In Minecraft, water and lava each have two variants: a flowing fluid and a source fluid. The way this works is mostly due to hardcoding, in some association with `FluidState`s (see below). Since this hardcoding is inconvenient at best and practically impossible to use at worst, NeoForge introduces the `FluidType` class and patches a ton of places to use it. The main purpose of the `FluidType` is to contain the common logic of the fluid - e.g. the sounds it makes, whether boats can be used in it, etc. - and only leave the actual flowing logic in the fluid itself. `FluidType`s live in a separate registry added by NeoForge, and thus must be registered in addition to `Fluid`s.

With that in mind, let's start creating our fluid! For the sake of example, we're going to create a molten iron fluid. To get started, we need two [registries][registries]:

```java
public static final DeferredRegister<Fluid> FLUIDS =
    DeferredRegister.create(Registries.FLUID, ExampleMod.MOD_ID);
public static final DeferredRegister<FluidType> FLUID_TYPES =
    DeferredRegister.create(NeoForgeRegistries.FLUID_TYPES, ExampleMod.MOD_ID);
```

Since `Fluid`s require a `FluidType` to be created, we create the `FluidType` first. A `FluidType`'s options are defined in a `Properties` object, similar to block properties.

```java
public static final DeferredHolder<FluidType, FluidType> MOLTEN_IRON_TYPE = FLUID_TYPES.register(
        // The registry name of the fluid type. Usually it makes sense to name it the same as the `Fluid`.
        "molten_iron",
        // The supplier for the fluid type, accepting a `FluidType.Properties` object.
        () -> new FluidType(FluidType.Properties.create()
                // The translation key of the fluid. While this will not be visible in vanilla Minecraft,
                // it will be visible if the fluid is stored in e.g. a modded tank, or when looked at in-world
                // with WAILA (What Am I Looking At?) or similar mods installed.
                // In order to later make datagen easier, we use a block translation key here.
                // If you do not plan on adding a block, you can replace "block." with "fluid."
                .descriptionId("block." + ExampleMod.MOD_ID + ".molten_iron")
                // Set lava-like sounds for our fluid. This is only relevant if you have a bucket item,
                // which we will look at later.
                .sound(SoundActions.BUCKET_FILL, SoundEvents.BUCKET_FILL_LAVA)
                .sound(SoundActions.BUCKET_EMPTY, SoundEvents.BUCKET_EMPTY_LAVA)
                // We cannot swim or drown in molten iron.
                .canDrown(false)
                .canSwim(false)
                // We want molten iron to slightly glow.
                .lightLevel(5)
        ));
```

:::tip
There are a bunch of other methods in `FluidType`. For example, if you were to make a more water-like fluid, the `supportsBoating()` and `isWaterLike()` methods could be interesting to you. For a full list of available methods, please see the source of `FluidType.Properties`.

Not all of these methods are used by vanilla systems. Some of them, such as `temperature()` or `density()`, were requested in the original design phase of the `FluidType` system for mod compatibility, and may or may not be used by modded systems.
:::

With our `FluidType` created, we can move to the `Fluid` itself. NeoForge provides the `BaseFlowingFluid` class as a base for us to use, which has three inner classes: `Source`, `Flowing` and `Properties`. `Source` and `Flowing` are subclasses of `BaseFlowingFluid`, following the layout of vanilla's `WaterFluid` and `LavaFluid`, while `Properties` is once again a block properties-like object, this time responsible for tying the fluid type, source fluid, flowing fluid and later also stuff like the bucket or the fluid block together.

Since the source and flowing fluids depend on the fluid properties but the fluid properties also depends on the two fluids, we need to be a little careful with static initialization order and qualify with the class name in some places. Assuming you are keeping your fluids in a class named `ModFluids`, the code looks as follows:

```java
// The source fluid. This is usually named without specifying "source" in the name. 
public static final DeferredHolder<Fluid, BaseFlowingFluid.Source> MOLTEN_IRON = FLUIDS.register(
        // The registry name.
        "molten_iron",
        // The source fluid supplier. Qualify the properties with the class name here.
        () -> new BaseFlowingFluid.Source(ModFluids.MOLTEN_IRON_PROPERTIES));

// The flowing fluid. The name is commonly prefixed with "flowing_".
public static final DeferredHolder<Fluid, BaseFlowingFluid.Flowing> FLOWING_MOLTEN_IRON = FLUIDS.register(
        // The registry name.
        "flowing_molten_iron",
        // The flowing fluid supplier. Again, qualify the properties with the class name.
        () -> new BaseFlowingFluid.Flowing(ModFluids.MOLTEN_IRON_PROPERTIES));

// The fluid properties. We will use this later to connect additional stuff to the fluid, for example the bucket.
public static final BaseFlowingFluid.Properties MOLTEN_IRON_PROPERTIES =
        // Parameters are the fluid type, the source fluid and the flowing fluid.
        new BaseFlowingFluid.Properties(MOLTEN_IRON_TYPE, MOLTEN_IRON, FLOWING_MOLTEN_IRON);
```

With this done, your fluid should now be loaded into the game, and recipes will be able to make use of it.

## Resources

While our fluid now exists, we aren't done yet: we still need to add the resource files for the fluid. For a fluid without a block, this is limited to textures and a translation. Blocks later also require a model and a renderer to be set up.

Let's start by adding the texture files. When creating your assets, it is recommended to use the vanilla water or lava texture as a basis; this is especially important with flowing fluids as they use what is effectively a 2x2 texture that is sampled by the flowing fluid renderer. The texture files must be named and placed as follows (where `examplemod` is your mod id):

- `assets/examplemod/textures/block/molten_iron_still.png` for the still texture, and
- `assets/examplemod/textures/block/molten_iron_flowing.png` for the flowing texture.

Most fluids are animated, so they will also need accompanying `.png.mcmeta` files. Again, you can base these off the vanilla files. For more information, see the article on [textures].

Now for the translations. The translation key used by fluids is defined by `FluidType#descriptionId()`. In our example, we used `block.examplemod.molten_iron`, so we would add a translation like so:

```java
    @Override
    protected void addTranslations() {
        // other translations here
    
        add("block.examplemod.molten_iron", "Molten Iron");
        
        // Alternatively, once you have created a fluid block later:
        addBlock(ModBlocks.MOLTEN_IRON.get(), "Molten Iron");
    }
```

For more information, see [I18n and L10n/Datagen][i18n].

## In-World Fluids

TODO

### `FluidState` and Waterlogging

TODO

### Fluid Blocks

TODO

### Cauldrons

TODO

## Fluids in Recipes

TODO

### `FluidStack`

TODO

### `FluidIngredient`

TODO

[block]: index.md
[entity]: ../entities/index.md
[i18n]: ../resources/client/i18n.md#datagen
[registries]: ../concepts/registries.md
[tags]: ../resources/server/tags.md#datagen
[textures]: ../resources/client/textures.md
