---
description: How to add and work with fluids in-world.
sidebar_position: 2
---
# In-World Fluids

When placing [fluids][fluid] in world, `FluidState`s are used instead of `Fluid`s, closely mirroring the use of [`BlockState`s][blockstate] versus [`Block`s][block]. Similar to `BlockState`s, a `FluidState` at a position can be queried using `Level#getFluidState()`, and the default state can be obtained using `Fluid#defaultFluidState()`.

However, `FluidState`s also exhibit a few differences to `BlockState`s. Most notably, their different states do not operate using properties, at least not properties defined in the same way as block state properties, instead the exact `FluidState` is computed by the level from fluid spreading mechanics. For most use cases the exact `FluidState` is irrelevant, save for some properties such as `isSource()` which can be queried from the `FluidState` if needed.

Unfortunately, the current implementation of `FluidState`s in levels is very much half-baked. Even more unfortunately, it is impossible for NeoForge to fix this without breaking compatibility with vanilla worlds. Basically all `FluidState` logic is tied to `BlockState` in some way, despite there not really being a need to. This is why, for example, there is no `Level#setFluidState()` method. In the current implementation, `Level#getFluidState()` essentially boils down to `BlockState#getFluidState()`, happening very deep in chunk storage. It is expected that Mojang will eventually rework this, however for now we have to make do with what we have.

## Waterlogging

_See also [Blocks][block] and [Block States][blockstate]._

The epitome of the half-baked `FluidState` system is waterlogging. Waterlogging is the ability of certain non-full blocks, e.g. slabs, to also contain a water source at the same time. This is currently implemented via the `WATERLOGGED` block state property:

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

    // When placing this block in water, place the waterlogged state.
    @Override
    public BlockState getStateForPlacement(BlockPlaceContext context) {
        return defaultBlockState().setValue(
            WATERLOGGED,
            context.getLevel().getFluidState(context.getClickedPos()).is(Fluids.WATER)
        );
    }
    
    // When this block receives a block update (because e.g. a neighbor changed),
    // a tick should be scheduled.
    @Override
    protected BlockState updateShape(
        BlockState state,
        LevelReader level,
        ScheduledTickAccess ticks,
        BlockPos pos,
        Direction directionToNeighbour,
        BlockPos neighbourPos,
        BlockState neighbourState,
        RandomSource random
    ) {
        if (state.getValue(WATERLOGGED)) {
            ticks.scheduleTick(pos, Fluids.WATER, Fluids.WATER.getTickDelay(level));
        }
        return super.updateShape(state,
            level,
            ticks,
            pos,
            directionToNeighbour,
            neighbourPos,
            neighbourState,
            random);
    }
}
```

:::info
"Lavalogging" or similar fluid-logging with other fluids is easily possible. To do so, simply create a new `BooleanProperty`, add it to the block as usual, and have `Block#getFluidState()` return the desired fluid if the property is true.

However, be aware that waterlogging is hardcoded in some instances, such as world generation or piston moving logic.
:::

## Fluid Blocks

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
                // For example, like before, we make our molten iron fluid glow slightly:
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

Finally, the block needs a model, which is fairly simple to [generate][models]:

```java
@Override
protected void registerModels(BlockModelGenerators blockModels, ItemModelGenerators itemModels) {
    blockModels.createNonTemplateModelBlock(ModBlocks.MOLTEN_IRON.get());
}
```

## Buckets

Fluids can usually be picked up in a bucket. A custom bucket for our fluid can be added like so:

```java
// Assuming a DeferredRegister.Items named ITEMS, and assuming the fluid stuff
// is in another class named ModFluids.
public static final DeferredItem<BucketItem> MOLTEN_IRON_BUCKET = ITEMS.registerItem(
        // The registry name.
        "molten_iron_bucket",
        // The bucket item factory.
        properties -> new BucketItem(ModFluids.MOLTEN_IRON.get(), properties),
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
    event.enqueueWork(() -> DispenserBlock.registerBehavior(ModItems.MOLTEN_IRON_BUCKET, DispenseFluidContainer.getInstance()));
}
```

:::tip
If you want custom dispenser behavior for your bucket, you can also create a custom `DispenseItemBehavior`. See the source of `DispenseFluidContainer` for what to implement.
:::

Finally, all that's left is a translation and a model:

```java
// In the language provider
@Override
protected void addTranslations() {
    add(ModFluids.MOLTEN_IRON_TYPE.get().getDescriptionId(), "Molten Iron");
    addItem(ModItems.MOLTEN_IRON_BUCKET, "Molten Iron Bucket");
}

// In the model provider
@Override
protected void registerModels(BlockModelGenerators blockModels, ItemModelGenerators itemModels) {
    blockModels.createNonTemplateModelBlock(ModBlocks.MOLTEN_IRON.get());
    // We use NeoForge's `DynamicFluidContainerModel`.
    itemModels.itemModelOutput.accept(ModItems.MOLTEN_IRON_BUCKET.get(), new DynamicFluidContainerModel.Unbaked(
        // The model's textures. The model is rendered in the order of base, fluid, cover (lowest to highest).
        new DynamicFluidContainerModel.Textures(
                // The particle texture.
                Optional.of(new Material(Identifier.withDefaultNamespace("item/bucket"))),
                // The base texture.
                Optional.of(new Material(Identifier.withDefaultNamespace("item/bucket"))),
                // The fluid texture, i.e. the part that actually contains the fluid.
                Optional.of(new Material(Identifier.fromNamespaceAndPath("neoforge", "item/mask/bucket_fluid"))),
                // The cover texture. This is rendered last and can be a mask (see below).
                Optional.empty()
        ),
        // The fluid to use.
        ModFluids.MOLTEN_IRON.get(),
        // Whether the bucket model should be flipped, commonly used for "gaseous" fluids.
        false,
        // If true, the cover texture is a mask. If false, the cover texture is rendered normally.
        // See below for more info.
        true,
        // If this is true, if the fluid emits light, the fluid element of the model becomes emissive.
        true));
}
```

### Bucket Mask Textures

If the `coverIsMask` boolean is true, the cover texture is instead treated as a mask texture. Mask textures are textures containing either a full white (`0xfffffff`) or transparent black (`0x00000000` or just `0`) pixels, acting as a stencil of sorts. Their function is best exemplified by having a look at them:

TODO

Only the white pixels in the mask will be included in rendering, and pixels overlapping with the transparent part of the mask will be discarded.

:::tip
The mask textures seen above are shipped by Neo, at the following respective locations:

- `assets/neoforge/textures/item/mask/bucket_fluid.png`
- `assets/neoforge/textures/item/mask/bucket_fluid_drip.png`
- `assets/neoforge/textures/item/mask/bucket_fluid_cover.png`
- `assets/neoforge/textures/item/mask/bucket_fluid_cover_drip.png`
:::

## Cauldrons

In addition to buckets, it is common for fluids to go in a cauldron. For this, a separate cauldron block is necessary:

```java
public class MoltenIronCauldronBlock extends AbstractCauldronBlock {
    // Block codec boilerplate.
    private static final MapCodec<MoltenIronCauldronBlock> CODEC =
        simpleCodec(MoltenIronCauldronBlock::new);

    @Override
    protected MapCodec<? extends AbstractCauldronBlock> codec() {
        return CODEC;
    }

    // The cauldron interaction dispatcher and its id. See below for more info.
    public static final CauldronInteraction.Dispatcher CAULDRON_INTERACTIONS =
        new CauldronInteraction.Dispatcher();
    public static final Identifier CAULDRON_INTERACTIONS_ID =
        Identifier.fromNamespaceAndPath(ExampleMod.MOD_ID, "molten_iron_cauldron");

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

    // Vanilla water cauldrons output 1-3 based on the fill level,
    // we are always full and therefore output 3.
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
            // The amount.
            FluidType.BUCKET_VOLUME,
            // The "level" block state property. Since we don't have one, we pass null.
            null);
}
```

Finally, since a fluid cauldron is a block like any other, we need some datagen setup. This includes a [translation][i18n], a [block model][models], a [loot table][loottable] and some [tags]:

```java
// In the language provider
@Override
protected void addTranslations() {
    add(ModFluids.MOLTEN_IRON_TYPE.get().getDescriptionId(), "Molten Iron");
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
            MoltenIronCauldronBlock.CAULDRON_INTERACTIONS_ID,
            // Our `CauldronInteraction.Dispatcher`.
            MoltenIronCauldronBlock.CAULDRON_INTERACTIONS);
}
```

Secondly, we need to register the actual interactions. That works like so:

```java
@SubscribeEvent
private static void registerCauldronInteractions(RegisterCauldronInteractionEvent.Interaction event) {
    // Empty our cauldron when it is right-clicked with an empty bucket.
    event.register(
        // The id of our cauldron interactions.
        MoltenIronCauldronBlock.CAULDRON_INTERACTIONS_ID,
        // The item we're right-clicking with.
        Items.BUCKET,
        // A callback called when right-clicking. Input parameters are the cauldron blockstate,
        // the level, the position, the player, the used hand, and the used item stack.
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
    event.register(
        MoltenIronCauldronBlock.CAULDRON_INTERACTIONS_ID,
        Items.LAVA_BUCKET,
        CauldronInteractions::fillLavaInteraction);
    event.register(
        MoltenIronCauldronBlock.CAULDRON_INTERACTIONS_ID,
        Items.WATER_BUCKET,
        CauldronInteractions::fillWaterInteraction);
    event.register(
        MoltenIronCauldronBlock.CAULDRON_INTERACTIONS_ID,
        Items.POWDER_SNOW_BUCKET,
        CauldronInteractions::fillPowderSnowInteraction);

    // When **any** cauldron is right-clicked with our bucket, replace with our cauldron.
    // To do so, we use `event#registerToAll()` instead of `event#register()`.
    event.registerToAll(ModItems.MOLTEN_IRON_BUCKET.get(),
        // A callback called when right-clicking. Input parameters are the cauldron blockstate,
        // the level, the position, the player, the used hand, and the used item stack.
        (state, level, pos, player, hand, stack) -> CauldronInteractions.emptyBucket(
            // Pass along the input parameters, except the state.
            level, pos, player, hand, stack,
            // The resulting block state.
            ModBlocks.MOLTEN_IRON_CAULDRON.get().defaultBlockState(),
            // The sound event to play when filling the cauldron.
            SoundEvents.BUCKET_EMPTY_LAVA));
}
```

Cauldron interactions are not limited to buckets. Vanilla adds a couple of other cauldron recipes, mostly for "cleaning" colored items. These work through generally the same mechanism. For more information, see the `CauldronInteractions` class. This is also where you can find the vanilla cauldron interaction dispatchers.

[block]: ../blocks/index.md
[blockstate]: ../blocks/states.md
[fluid]: index.md
[i18n]: ../resources/client/i18n.md#datagen
[loottable]: ../resources/server/loottables/index.md#datagen
[models]: ../resources/client/models/datagen.md
[tags]: ../resources/server/tags.md#datagen
