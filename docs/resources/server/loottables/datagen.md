# Loot Table Datagen

[Loot tables][loottable] can be [datagenned][datagen] by subclassing `LootTableProvider` and providing a list of `LootTableSubProvider` in the constructor. Due to Mojang being Mojang, this requires some boilerplate to fully set up:

```java
public class MyLootTableProvider extends LootTableProvider {
    // Get the PackOutput from GatherDataEvent.
    public MyLootTableProvider(PackOutput output) {
        super(output,
                // A set of required table resource locations. This is used in validation (see below).
                // It is generally not recommended for mods to validate, therefore we pass in an empty set.
                Set.of(),
                // A list of sub provider entries. See below for what values to use here.
                List.of(...));
    }
    
    // Vanilla uses this method to validate existence and correct usage of loot context parameters.
    // This is a pretty complex setup, so it is usually recommended for modders to trust themselves and no-op here.
    @Override
    protected void validate(Map<ResourceLocation, LootTable> map, ValidationContext context) {}
}
```

Like all data providers, we register the provider to `GatherDataEvent`:

```java
@SubscribeEvent
public static void onGatherData(GatherDataEvent event) {
    event.getGenerator().addProvider(event.includeServer(), MyLootTableProvider::new);
}
```

## `LootTableSubProvider`s

`LootTableSubProvider`s are where the actual generation happens. To get started, we implement `LootTableSubProvider` and override `#generate`:

```java
public class MyLootTableSubProvider implements LootTableSubProvider {
    // The parameter is provided by the lambda (see below). It can be stored and used to lookup other registry entries.
    public MyLootTableSubProvider(HolderLookup.Provider lookupProvider) {
        super(lookupProvider);
    }
    
    @Override
    public void generate(BiConsumer<ResourceLocation, LootTable.Builder> consumer) {
        // LootTable.lootTable() returns a loot table builder we can add loot tables to.
        consumer.accept(ResourceLocation.fromNamespaceAndPath(ExampleMod.MOD_ID, "example_loot_table"), LootTable.lootTable()
                // Add a loot table-level loot function. This example uses a number provider (see below).
                .apply(SetItemCountFunction.setCount(ConstantValue.exactly(5)))
                // Add a loot pool.
                .withPool(LootPool.lootPool()
                        // Add a loot pool-level function, similar to above.
                        .apply(...)
                        // Add a loot pool-level condition. This example only rolls the pool if it is raining.
                        .when(WeatherCheck.weather().setRaining(true))
                        // Set the amount of rolls and bonus rolls, respectively.
                        // Both of these methods utilize a number provider.
                        .setRolls(UniformGenerator.between(5, 9))
                        .setBonusRolls(ConstantValue.exactly(1))
                        // Add a loot entry. This example returns an item loot entry. See below for more loot entries.
                        .add(LootItem.lootTableItem(Items.DIRT))
                )
        );
    }
}
```

Once we have our loot table sub provider, we add it to the constructor of our loot provider, like so:

```java
super(output, Set.of(), List.of(
        new SubProviderEntry(
                // A reference to the sub provider's constructor.
                // This is a Function<HolderLookup.Provider, ? extends LootTableSubProvider>.
                MyLootTableSubProvider::new,
                // An associated loot context set. If you're unsure what to use, use empty.
                LootContextParamSets.EMPTY
        ),
        // other sub providers here (if applicable)
));
```

### Loot Entry Providers

Due to the different types of loot entries, different `LootPoolEntryContainer`s exist. These are generally classified into what the code calls composites and singletons, where composites are made up of multiple singletons or other composites. We generally work not with them directly, but with their respective `LootPoolEntryContainer.Builder<?>` subclasses.

Let's start with the singletons, since those are easier:

- `EmptyLootItem#emptyItem`: Always provides an empty stack.
- `LootItem#lootTableItem`: Provides a stack of one item. The item can be specified as a parameter.
- `TagEntry#tagContents`: Provides a stack of one item, per item in the tag. The tag can be specified as a parameter.
- `TagEntry#expandTag`: Similar to `#tagContents`, however one loot entry is created for each item in the tag instead of one entry that drops all items at once.
- `LootTableReference#lootTableReference`: Rolls the specified loot table and returns the resulting item stacks as one entry.
- `DynamicLoot#dynamicEntry`: Tells the game to call on a dynamic drops provider by the specified name. See [Using a Loot Table][useloottable] for more info.

The composites then use the singletons or other composites in the following ways:

- `EntryGroup#list`: Accepts a vararg of other `LootPoolEntryContainer.Builder<?>`s. Runs all of its children, regardless of if they succeed or not.
- `AlternativesEntry#alternatives`: Accepts a vararg of other `LootPoolEntryContainer.Builder<?>`s. Runs its children in order until one succeeds.
- `SequentialEntry#sequential`: The opposite of `AlternativesEntry`. Accepts a vararg of other `LootPoolEntryContainer.Builder<?>`s, and runs its children in order until one fails.

All `LootPoolEntryContainer.Builder<?>`s additionally allow adding loot conditions and loot functions by calling `#when` and `#apply`, respectively, similar to loot pools (see above). Additionally, be aware that mods may add custom loot entry providers.

### Number Providers

Number providers define how a number is obtained. This is done instead of simply using constant integers and floats in order to bring more randomness to loot tables. Vanilla defines four number providers, however more may be added by mods.

- `ConstantValue#exactly`: A constant integer or float value.
- `UniformGenerator#between`: Uniformly-distributed random integer or float values, with min and max values set. All values between min and max have the same chance to appear.
- `BinomialDistributionGenerator#binomial`: Binomially-distributed random integer values, with n and p values set. See [Binomial Distribution][binomial] for more information on what these values mean.
- `ScoreboardValue#fromScoreboard`: Given an entity target, a score name and (optionally) a scale value, retrieves the given scoreboard value for the entity target, multiplying it with the given scale value (if available).

### `BlockLootSubProvider`

`BlockLootSubProvider` is an abstract helper class containing many helpers for creating common block loot tables, e.g. single item drops (`#createSingleItemTable`), dropping the block the table is created for (`#dropSelf`), silk touch-only drops (`#createSilkTouchOnlyTable`), drops for slab-like blocks (`#createSlabItemTable`), and many more. Unfortunately, setting up a `BlockLootSubProvider` for modded usage involves more boilerplate:

```java
public class MyBlockLootSubProvider extends BlockLootSubProvider {
    // The constructor can be private if this class is an inner class of your loot table provider.
    // The parameter is provided by the lambda in the LootTableProvider's constructor.
    public MyBlockLootSubProvider(HolderLookup.Provider lookupProvider) {
        // The first parameter is a set of blocks we are creating loot tables for. Instead of hardcoding,
        // we use our block registry and just pass an empty set here.
        // The second parameter is the feature flag set, this will be the default flags
        // unless you are adding custom flags (which is beyond the scope of this article).
        super(Set.of(), FeatureFlags.DEFAULT_FLAGS);
    }
    
    // The contents of this Iterable are used for validation.
    // We return an Iterable over our block registry's values here.
    @Override
    protected Iterable<Block> getKnownBlocks() {
        // The contents of our DeferredRegister.
        return MyRegistries.BLOCK_REGISTRY.getEntries()
                .stream()
                // Cast to Block here, otherwise it will be a ? extends Block and Java will complain.
                .map(e -> (Block) e.value())
                .toList();
    }
    
    // We override the add() method to add the block to the list whenever we add a loot table.
    @Override
    protected void add(Block block, LootTable.Builder builder) {
        super.add(block, builder);
        blocks.add(block);
    }
    
    // Actually add our loot tables.
    @Override
    protected void generate() {
        // Equivalent to calling add(MyBlocks.EXAMPLE_BLOCK.get(), createSingleItemTable(MyBlocks.EXAMPLE_BLOCK.get()));
        dropSelf(MyBlocks.EXAMPLE_BLOCK.get());
        // Add a table with a silk touch only loot table.
        add(MyBlocks.EXAMPLE_SILK_TOUCHABLE_BLOCK.get(),
                createSilkTouchOnlyTable(MyBlocks.EXAMPLE_SILK_TOUCHABLE_BLOCK.get()));
        // other loot table additions here
    }
}
```

We then add our sub provider to the loot table provider's constructor like any other sub provider:

```java
super(output, Set.of(), List.of(new SubProviderEntry(
        MyBlockLootTableSubProvider::new,
        LootContextParamSets.BLOCK // it makes sense to use BLOCK here
)));
```

### `EntityLootSubProvider`

Similar to `BlockLootSubProvider`, `EntityLootSubProvider` provides many helpers for entity loot table generation. Also similar to `BlockLootSubProvider`, we must provide a `Stream<EntityType<?>>` of entities known to the provider (instead of the `Iterable<Block>` used before). Overall, our implementation looks very similar to our `BlockLootSubProvider`, but with every mentioned of blocks swapped out for entity types:

```java
public class MyEntityLootSubProvider extends EntityLootSubProvider {
    public MyEntityLootSubProvider(HolderLookup.Provider lookupProvider) {
        // Unlike with blocks, we do not provide a set of known entity types. Vanilla instead uses custom checks here.
        super(FeatureFlags.DEFAULT_FLAGS, lookupProvider);
    }

    @Override
    protected Stream<EntityType<?>> getKnownEntityTypes() {
        return MyRegistries.ENTITY_TYPES.getEntries()
                .stream()
                .map(e -> (EntityType<?>) e.value());
    }

    @Override
    protected void generate() {
        add(MyEntities.EXAMPLE_ENTITY.get(), LootTable.lootTable());
        // other loot table additions here
    }
}
```

And again, we then add our sub provider to the loot table provider's constructor:

```java
super(output, Set.of(), List.of(new SubProviderEntry(
        MyEntityLootTableSubProvider::new,
        LootContextParamSets.ENTITY
)));
```

[binomial]: https://en.wikipedia.org/wiki/Binomial_distribution
[datagen]: ../../index.md#data-generation
[loottable]: index.md
[useloottable]: index.md#using-a-loot-table
