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

- `assets/examplemod/textures/block/molten_iron_still.png` for the still texture,
- `assets/examplemod/textures/block/molten_iron_flowing.png` for the flowing texture, and
- `assets/examplemod/textures/block/molten_iron_overlay.png` for the overlay texture (the overlay texture is optional and only used if the fluid has an associated block; it is displayed transparently when the player is inside the fluid's block).

Most fluids are animated, so they will also need accompanying `.png.mcmeta` files. Again, you can base these off the vanilla files. For more information, see the article on [textures].

Now for the translations. The translation key used by fluids is defined by `FluidType#descriptionId()`, and we can get it from a `FluidType` using `#getDescriptionId()`:

```java
@Override
protected void addTranslations() {
    add(AMFluids.MOLTEN_IRON_TYPE.getDescriptionId(), "Molten Iron");
}
```

For more information, see [I18n and L10n/Datagen][i18n].

## In-World Fluids

When placing fluids in world, `FluidState`s are used instead of `Fluid`s, closely mirroring the use of [`BlockState`s][blockstate] versus `Block`s. Similar to `BlockState`s, `FluidState`s can be set into a level using `Level#setFluidState()`, a `FluidState` at a position can be queried using `Level#getFluidState()`, and the default state can be obtained using `Fluid#defaultFluidState()`.

However, `FluidState`s also exhibit a few differences to `BlockState`s. Most notably, their different states do not operate using properties, at least not properties defined in the same way as block state properties, instead the exact `FluidState` is computed by the level from fluid spreading mechanics. For most use cases the exact `FluidState` is irrelevant, save for some properties such as `isSource()` which can be queried from the `FluidState` if needed.

Unfortunately, the current implementation of `FluidState`s in levels is very much half-baked. Even more unfortunately, it is impossible for NeoForge to fix this without breaking compatibility with vanilla worlds. Basically all `FluidState` logic is tied to `BlockState` in some way, despite there not really being a need to. In the current implementation, `Level#getFluidState()` essentially boils down to `BlockState#getFluidState()`, happening very deep in chunk storage. It is expected that Mojang will eventually rework this, however for now we have to make do with what we have.

### Waterlogging

_See also [Blocks][block] and [Block States][blockstate]._

The epitome of this half-baked `FluidState` system is waterlogging. Waterlogging is the ability of certain non-full blocks, e.g. slabs, to also contain a water source at the same time. This is currently implemented via the `WATERLOGGED` block state property:

```java
// Implementing SimpleWaterloggedBlock automatically enables bucket pickup
// and makes some helper methods available.
public class MyBlock extends Block implements SimpleWaterloggedBlock {
    // Add the WATERLOGGED property to our class for easy access.
    public static final BooleanProperty WATERLOGGED = BlockStateProperties.WATERLOGGED;

    // Set WATERLOGGED to false by default.
    public MyBlock(Properties properties) {
        super(properties);
        registerDefaultState(getStateDefinition().any().setValue(WATERLOGGED, false));
    }

    // Add WATERLOGGED to the block state definition.
    @Override
    protected void createBlockStateDefinition(StateDefinition.Builder<Block, BlockState> builder) {
        super.createBlockStateDefinition(builder);
        builder.add(WATERLOGGED);
    }

    // The important part: Query the WATERLOGGED property when asked for the fluid state.
    // The `false` parameter in Fluids.WATER.getSource(false) means "falling" and is set to false
    // for all vanilla waterlogging implementations.
    @Override
    public FluidState getFluidState(BlockState state) {
        return state.getValue(WATERLOGGED) ? Fluids.WATER.getSource(false) : super.getFluidState(state);
    }
}
```

### Fluid Blocks

In order to be able to place our fluid in the world, we need to create a `LiquidBlock` for it:

```java
// Assuming a DeferredRegister.Blocks named BLOCKS, and assuming the fluid stuff
// is in another class named ModFluids.
public static final DeferredBlock<LiquidBlock> MOLTEN_IRON = BLOCKS.registerBlock(
        // The block registry name.
        "molten_iron",
        // The liquid block factory.
        properties -> new LiquidBlock(ModFluids.MOLTEN_IRON.get(), properties),
        // The block properties.
        () -> BlockBehaviour.Properties.of()
                // Standard properties for both vanilla fluids. Strength 100 disables vanilla TNT
                // from having effects while allowing modded explosives to still work.
                .liquid()
                .noLootTable()
                .noCollision()
                .replaceable()
                .pushReaction(PushReaction.DESTROY)
                .sound(SoundType.EMPTY)
                .strength(100)
                // You may define additional properties depending on what your fluid does.
                // For example, we could make our molten iron fluid glow slightly:
                .lightLevel(_ -> 5)
);
```

The block should then be added to the fluid properties like so:

```java
public static final BaseFlowingFluid.Properties MOLTEN_IRON_PROPERTIES =
        new BaseFlowingFluid.Properties(MOLTEN_IRON_TYPE, MOLTEN_IRON, FLOWING_MOLTEN_IRON)
                // Set the block, assuming it is located in the `ModBlocks` class.
                // Make sure that `ModBlocks` is classloaded before `ModFluids`!
                .block(ModBlocks.MOLTEN_IRON);
```

Finally, the block needs a model and a renderer. Let's start with the model, which is fairly simple to [generate][modeldatagen]:

```java
@Override
protected void registerModels(BlockModelGenerators blockModels, ItemModelGenerators itemModels) {
    blockModels.createNonTemplateModelBlock(ModBlocks.MOLTEN_IRON.get());
}
```

The renderer, on the other hand, is registered in a [client-only][sides] [mod bus][modbus] [event handler][events]:

```java
@SubscribeEvent // on the mod event bus only on the physical client
private static void registerFluidModels(RegisterFluidModelsEvent event) {
    event.register(new FluidModel.Unbaked(
            // The still, flowing and overlay texture materials.
            // The overlay material is nullable; if null, no overlay will be displayed.
            new Material(Identifier.fromNamespaceAndPath(ExampleMod.MOD_ID, "block/molten_iron_still")),
            new Material(Identifier.fromNamespaceAndPath(ExampleMod.MOD_ID, "block/molten_iron_flowing")),
            new Material(Identifier.fromNamespaceAndPath(ExampleMod.MOD_ID, "block/molten_iron_overlay")),
            // The fluid tint source. We leave it at null, which means no tint. See below for more info.
            null),
            // Suppliers for the still and flowing fluids.
            ModFluids.MOLTEN_IRON::value,
            ModFluids.FLOWING_MOLTEN_IRON::value
    );
}
```

### Fluid Tint Sources

_See also: [Tinting][tinting]_

Like blocks, fluids can be tinted. In vanilla, water does this, while lava does not. NeoForge patches this system to enable mod support. All related logic goes through the `FluidTintSource` interface. In a simple implementation, it only overrides `#color()`:

```java
// If possible, we want to use a singleton.
public final class MoltenIronTintSource implements FluidTintSource {
    public static final MoltenIronTintSource INSTANCE = new MoltenIronTintSource();
    
    private MoltenIronTintSource() {}

    @Override
    public int color(FluidState state) {
        // Return whatever color you want here.
        return 0xff000000;
    }
}
```

Once we have our tint source, we use it in the `RegisterFluidModelsEvent` like so:

```java
@SubscribeEvent // on the mod event bus only on the physical client
private static void registerFluidModels(RegisterFluidModelsEvent event) {
    event.register(new FluidModel.Unbaked(
            new Material(Identifier.fromNamespaceAndPath(ExampleMod.MOD_ID, "block/molten_iron_still")),
            new Material(Identifier.fromNamespaceAndPath(ExampleMod.MOD_ID, "block/molten_iron_flowing")),
            new Material(Identifier.fromNamespaceAndPath(ExampleMod.MOD_ID, "block/molten_iron_overlay")),
            // Use our tint source instance here.
            MoltenIronTintSource.INSTANCE),
            ModFluids.MOLTEN_IRON::value,
            ModFluids.FLOWING_MOLTEN_IRON::value
    );
}
```

:::tip
If the implementation only overrides `#color(FluidState)`, you can also use a functional interface lambda instead of a singleton class.
:::

For more complex behavior, additional methods are available, both of which defer to `#color(FluidState)` by default:

- `colorInWorld(FluidState fluidState, BlockState blockState, BlockAndTintGetter level, BlockPos pos)` - A position-sensitive method used when displaying the fluid in world. Water uses this for biome-dependent colors.
- `colorAsStack(FluidStack stack)` - A `FluidStack`-sensitive method, which can be used for e.g. [data component][datacomponent]-sensitive tinting. Unused in vanilla, as `FluidStack` is a NeoForge system.

In addition, `FluidTintSource` extends `BlockTintSource`, which means that all the `BlockState`-sensitive methods are available as well.

### Buckets

Fluids can usually be picked up in a bucket. A custom bucket for our fluid can be added like so:

```java
// Assuming a DeferredRegister.Items named ITEMS, and assuming the fluid stuff
// is in another class named ModFluids.
public static final DeferredItem<BucketItem> MOLTEN_IRON_BUCKET = ITEMS.registerItem(
        // The registry name.
        "molten_iron_bucket",
        // The bucket item factory.
        properties -> new BucketItem(AMFluids.LIQUID_ETHERIUM.get(), properties),
        // The properties supplier. Buckets stack to 1 and return a bucket when used in crafting.
        () -> new Item.Properties().stacksTo(1).craftRemainder(Items.BUCKET)
);
```

We then add it to our fluid properties like so:

```java
public static final BaseFlowingFluid.Properties MOLTEN_IRON_PROPERTIES =
        new BaseFlowingFluid.Properties(MOLTEN_IRON_TYPE, MOLTEN_IRON, FLOWING_MOLTEN_IRON)
                .block(ModBlocks.MOLTEN_IRON)
                // Set the bucket, assuming it is located in the `ModItems` class.
                // Make sure that `ModItems` is classloaded before `ModFluids`!
                .bucket(ModItems.MOLTEN_IRON_BUCKET);
```

Next, it is recommended (but not required) to add a dispenser behavior for the bucket:

```java
@SubscribeEvent // on the mod event bus
private static void commonSetup(FMLCommonSetupEvent event) {
    // `DispenserBlock#registerBehavior` is not thread-safe so we wrap it in a lambda.
    // The anonymous class seen here is copied from `DispenseItemBehavior#bootStrap()`.
    event.enqueueWork(() -> DispenserBlock.registerBehavior(ModItems.MOLTEN_IRON_BUCKET, new DefaultDispenseItemBehavior() {
        private final DefaultDispenseItemBehavior defaultDispenseItemBehavior = new DefaultDispenseItemBehavior();

        @Override
        public ItemStack execute(BlockSource source, ItemStack dispensed) {
            DispensibleContainerItem bucket = (DispensibleContainerItem) dispensed.getItem();
            BlockPos target = source.pos().relative(source.state().getValue(DispenserBlock.FACING));
            Level level = source.level();
            if (bucket.emptyContents(null, level, target, null, dispensed)) {
                bucket.checkExtraContent(null, level, dispensed, target);
                return this.consumeWithRemainder(source, dispensed, new ItemStack(Items.BUCKET));
            } else {
                return this.defaultDispenseItemBehavior.dispense(source, dispensed);
            }
        }
    }));
}
```

:::tip
If you have multiple buckets, you can reuse the same `DispenseItemBehavior` instance for all buckets.
:::

Finally, all that's left is a translation and a model:

```java
// In the language provider
@Override
protected void addTranslations() {
    add(AMFluids.MOLTEN_IRON_TYPE.get().getDescriptionId(), "Molten Iron");
    addItem(AMItems.MOLTEN_IRON_BUCKET, "Molten Iron Bucket");
}

// In the model provider
@Override
protected void registerModels(BlockModelGenerators blockModels, ItemModelGenerators itemModels) {
    blockModels.createNonTemplateModelBlock(ModBlocks.MOLTEN_IRON.get());
    // We use NeoForge's `DynamicFluidContainerModel`.
    itemModels.itemModelOutput.accept(AMItems.LIQUID_ETHERIUM_BUCKET.get(), new DynamicFluidContainerModel.Unbaked(
        // The model's textures.
        new DynamicFluidContainerModel.Textures(
                Optional.of(new Material(Identifier.withDefaultNamespace("item/bucket"))),
                Optional.of(new Material(Identifier.withDefaultNamespace("item/bucket"))),
                Optional.of(new Material(Identifier.fromNamespaceAndPath("neoforge", "item/mask/bucket_fluid"))),
                Optional.empty()
        ),
        // The fluid to use.
        AMFluids.LIQUID_ETHERIUM.get(),
        // Whether the bucket model should be flipped, commonly used for "gaseous" fluids.
        false,
        // If true, the "cover" texture is a mask. We generally want this for buckets.
        true,
        // If this is true, if the fluid emits light, the fluid element of the model becomes emissive.
        true));
}
```

### Cauldrons

In addition to buckets, it is common for fluids to go in a cauldron. For this, a separate cauldron block is necessary:

```java
public class MoltenIronCauldronBlock extends AbstractCauldronBlock {
    // Block codec boilerplate.
    private static final MapCodec<MoltenIronCauldronBlock> CODEC = simpleCodec(MoltenIronCauldronBlock::new);

    @Override
    protected MapCodec<? extends AbstractCauldronBlock> codec() {
        return CODEC;
    }

    // The cauldron interaction dispatcher. See below for more info.
    public static final CauldronInteraction.Dispatcher CAULDRON_INTERACTIONS =
        new CauldronInteraction.Dispatcher();

    // Pass our `CauldronInteraction.Dispatcher` to super.
    public MoltenIronCauldronBlock(Properties properties) {
        super(properties, CAULDRON_INTERACTIONS);
    }

    // We assume that our cauldron can only ever be completely full, i.e. that we don't have "bottles"
    // or a similar intermediary unit present.
    @Override
    public boolean isFull(BlockState state) {
        return true;
    }

    // Vanilla water cauldrons output 1-3 based on the fill level, we are always full and therefore output 3.
    @Override
    protected int getAnalogOutputSignal(BlockState state, Level level, BlockPos pos, Direction direction) {
        return 3;
    }

    // A full cauldron has its visual height at 0.9375 (= 15/16).
    @Override
    protected double getContentHeight(BlockState state) {
        return 0.9375;
    }
}
```

We then use this cauldron in registration:

```java
// Assuming a DeferredRegister.Blocks named BLOCKS.
public static final DeferredBlock<MoltenIronCauldronBlock> MOLTEN_IRON_CAULDRON = BLOCKS.registerBlock(
        // The registry name.
        "molten_iron_cauldron",
        // The cauldron constructor reference.
        MoltenIronCauldronBlock::new,
        // The properties to use. We generally copy the vanilla cauldron.
        // Since we gave molten iron a glow, we also apply that to the cauldron.
        () -> BlockBehaviour.Properties.ofFullCopy(Blocks.CAULDRON).lightLevel(_ -> 5)
);
```

Next, we need to associate a fluid with the cauldron. We do this in `RegisterCauldronFluidContentEvent` like so:

```java
@SubscribeEvent // on the mod event bus
private static void registerCauldronFluidContent(RegisterCauldronFluidContentEvent event) {
    event.register(
            // The cauldron block.
            ModBlocks.MOLTEN_IRON_CAULDRON.get(),
            // The fluid.
            ModFluids.MOLTEN_IRON.get(),
            // The amount. 1000 is one bucket.
            1000,
            // The "level" block state property. Since we don't have one, we pass null.
            null);
}
```

Finally, since a fluid cauldron is a block like any other, we need some datagen setup. This includes a translation, a block model, a [loot table][loottable] and some [tags]:

```java
// In the language provider
@Override
protected void addTranslations() {
    add(AMFluids.MOLTEN_IRON_TYPE.get().getDescriptionId(), "Molten Iron");
    addItem(ModItems.MOLTEN_IRON_BUCKET, "Molten Iron Bucket");
    addBlock(ModBlocks.MOLTEN_IRON_CAULDRON, "Molten Iron Cauldron");
}

// In the model provider
@Override
protected void registerModels(BlockModelGenerators blockModels, ItemModelGenerators itemModels) {
    blockModels.createNonTemplateModelBlock(ModBlocks.MOLTEN_IRON.get());
    itemModels.itemModelOutput.accept(...);
    blockModels.blockStateOutput.accept(BlockModelGenerators.createSimpleBlock(
        // Our cauldron block.
        ModBlocks.MOLTEN_IRON_CAULDRON.get(),
        // We use the `CAULDRON_FULL` model template.
        BlockModelGenerators.plainVariant(ModelTemplates.CAULDRON_FULL.create(
                // Our cauldron block.
                ModBlocks.MOLTEN_IRON_CAULDRON.get(),
                // The cauldron fluid texture mapping.
                TextureMapping.cauldron(TextureMapping.getBlockTexture(ModBlocks.MOLTEN_IRON.get(), "_still")),
                blockModels.modelOutput))));
}

// In the block loot sub provider
@Override
protected void generate() {
    // Drop an empty cauldron when mined.
    dropOther(ModBlocks.MOLTEN_IRON_CAULDRON.get(), Items.CAULDRON);
}

// In the block tags provider
@Override
protected void addTags(HolderLookup.Provider provider) {
    tag(BlockTags.CAULDRONS).add(ModBlocks.MOLTEN_IRON_CAULDRON.get());
}
```

### Cauldron Interactions

We now have our cauldron, however we can't yet interact with it, or even obtain it in survival. For that to work, we need to register cauldron interactions. If you recall back to the cauldron class, we had a `CauldronInteraction.Dispatcher`, which we are going to use now.

Cauldron interactions happen in two events. First, we need to register the `CauldronInteraction.Dispatcher` like so:

```java
@SubscribeEvent // on the mod event bus
private static void registerCauldronInteractionDispatchers(RegisterCauldronInteractionEvent.Dispatcher event) {
    event.register(
            // A unique identifier.
            Identifier.fromNamespaceAndPath(ExampleMod.MOD_ID, "molten_iron_cauldron"),
            // Our `CauldronInteraction.Dispatcher`.
            MoltenIronCauldronBlock.CAULDRON_INTERACTIONS);
}
```

Secondly, we need to register the actual interactions. That works like so:

```java
@SubscribeEvent
private static void registerCauldronInteractions(RegisterCauldronInteractionEvent.Interaction event) {
    // Empty our cauldron when it is right-clicked with an empty bucket.
    MoltenIronCauldronBlock.CAULDRON_INTERACTIONS.put(Items.BUCKET,
        // Input parameters are the cauldron blockstate, the level, the position,
        // the player, the used hand, and the used item stack
        (state, level, pos, player, hand, stack) -> CauldronInteractions.fillBucket(
            // Pass along the input parameters.
            state, level, pos, player, hand, stack,
            // The resulting item stack.
            ModItems.MOLTEN_IRON_BUCKET.toStack(),
            // A predicate for additional checks if the bucket can be filled.
            // We have no additional checks, so we just always return true.
            _ -> true,
            // The sound event to play when emptying the cauldron.
            SoundEvents.BUCKET_FILL_LAVA));
    
    // For compat with vanilla, we need to add handling for when our cauldron is right-clicked
    // with water, lava and powder snow buckets. Compat with other mods is handled
    // by the bucket fill handler method, see below.
    LiquidEtheriumCauldronBlock.CAULDRON_INTERACTIONS
        .put(Items.LAVA_BUCKET, CauldronInteractions::fillLavaInteraction);
    LiquidEtheriumCauldronBlock.CAULDRON_INTERACTIONS
        .put(Items.WATER_BUCKET, CauldronInteractions::fillWaterInteraction);
    LiquidEtheriumCauldronBlock.CAULDRON_INTERACTIONS
        .put(Items.POWDER_SNOW_BUCKET, CauldronInteractions::fillPowderSnowInteraction);

    // When **any** cauldron is right-clicked with our bucket, replace with our cauldron.
    // To do so, we use `event#registerToAll()` instead of `CauldronInteraction.Dispatcher#put()`.
    event.registerToAll(ModItems.MOLTEN_IRON_BUCKET.get(),
        // Input parameters are the cauldron blockstate, the level, the position,
        // the player, the used hand, and the used item stack
        (state, level, pos, player, hand, stack) -> CauldronInteractions.fillBucket(
            // Pass along the input parameters, except the state.
            level, pos, player, hand, stack,
            // The resulting block state.
            ModBlocks.MOLTEN_IRON_CAULDRON.get().defaultBlockState(),
            // The sound event to play when filling the cauldron.
            SoundEvents.BUCKET_EMPTY_LAVA));
}
```

Cauldron interactions are not limited to buckets. Vanilla adds a couple of other cauldron recipes, mostly for "cleaning" colored items. These work through generally the same mechanism. For more information, see the `CauldronInteractions` class. This is also where you can find the vanilla cauldron interaction dispatchers.

## Fluids in Recipes

TODO

### `FluidStack`

TODO

### `FluidIngredient`

TODO

[block]: index.md
[blockstate]: states.md
[datacomponent]: ../items/datacomponents.md
[entity]: ../entities/index.md
[events]: ../concepts/events.md
[i18n]: ../resources/client/i18n.md#datagen
[loottable]: ../resources/server/loottables/index.md#datagen
[modbus]: ../concepts/events.md#event-buses
[modeldatagen]: ../resources/client/models/datagen.md
[registries]: ../concepts/registries.md
[sides]: ../concepts/sides.md
[tags]: ../resources/server/tags.md#datagen
[textures]: ../resources/client/textures.md
[tinting]: ../resources/client/models/index.md#tinting
