# Loot Tables

Loot tables are data files that are used to define randomized loot drops. A loot table can be rolled, returning a (potentially empty) list of item stacks. The output of this process depends on (pseudo-)randomness. Loot tables are located at `data/<mod_id>/loot_tables/<name>.json`. For example, the loot table `minecraft:blocks/dirt`, used by the dirt block, is located at `data/minecraft/loot_tables/blocks/dirt.json`.

Minecraft uses loot tables at various points in the game, including block drops, entity drops, chest loot, fishing loot, and many others. How a loot table is referenced depends on the context:

- Every block will, by default, receive an associated loot table, located at `<block_namespace>:blocks/<block_name>`. This can be disabled by calling `#noLootTable` on the block's `Properties`, resulting in no loot table being created and the block dropping nothing; this is mainly done by air-like or technical blocks.
- Every subclass of `LivingEntity` will, by default, receive an associated loot table, located at `<entity_namespace>:entities/<entity_name>`. This can be changed by overriding `#getLootTable` if you are directly extending `LivingEntity`, or by overriding `#getDefaultLootTable` if you are extending `Mob` or a subclass thereof. For example, sheep use this to roll different loot tables depending on their wool color.
- Chests in structures specify their loot table in their block entity data. Minecraft stores all chest loot tables in `minecraft:chests/<chest_name>`, it is not required (but recommended) to follow this practice in mods.
- The loot tables for gift items that villagers may throw at players after a raid are defined in the [`neoforge:raid_hero_gifts` data map][raidherogifts].
- Other loot tables, for example the fishing loot table, are retrieved when needed from `level.getServer().getLootData().getLootTable(lootTableId)`. A list of all vanilla loot table locations can be found in `BuiltInLootTables`.

:::warning
Loot tables should generally only be created for stuff that belongs to your mod. For modifying existing loot tables, [global loot modifiers (GLMs)][glm] should be used instead.
:::

## Terminology and Specification

Due to the complexity of the loot table system, loot tables are compromised of several sub-systems that each have a different purpose:

- A **loot entry** is a singular loot element with some basic values, such as a weight.
- A **loot pool** is, in essence, a list of loot entries. A loot table can contain multiple loot pools, and each loot pool is rolled independently of the others.
  - NeoForge allows loot pools to specify a `name` field. This can be used by [GLMs][glm]. If unspecified, this is the hash code of the loot pool, prefixed by `custom#`.
- A **roll** is a "picking" from a loot table or loot pool. A loot table is always rolled once per in-code call, but loot pools can specify this value to be greater than 1.
  - A **bonus roll** is an extra roll, calculated using the [**luck value**][luck]. It is specified and calculated independently of the regular rolls amount, and added on top of it after both calculations have completed.
- A **loot condition** is a condition on a loot entry that must be met for the entry to be further considered, otherwise the entry is treated as non-existent.
  - Multiple loot conditions can be applied to the same loot entry.
  - Loot conditions (or lists thereof) can also be applied to a loot pool. If the condition fails, the entire pool is discarded.
  - This is not to be confused with NeoForge's [conditional data loading][conditions]. Data load conditions may be used in a loot table as well, but only in the root.
  - For a full list of vanilla loot conditions, see [Item Predicates][itempredicates]. [NeoForge adds two loot conditions as well][neoconditions]. Modders may also add their own loot conditions.
- A **loot function** is a function that can be applied to the result of a loot entry.
  - Multiple loot functions can be applied to the same loot entry.
  - Loot functions (or lists thereof) can also be applied to a loot pool or loot table, affecting all items in that loot pool/loot table.
  - For a full list of vanilla loot functions, see [Item Modifiers][itemmodifiers]. Modders may also add their own loot functions.
- The **loot context** is an object passed to the loot table evaluator that may contain additional information for rolling the table, for example an associated block state, block entity, entity, etc.; these are called **loot context parameters**.
  - A full list of loot context parameters can be found in the `LootContextParams` class.
- The **loot table type** is a validator for the loot context. For example, the loot table type `barter` is guaranteed to have an entity context for the piglin being bartered with.
  - The context is validated at data pack load time, printing a log warning if context is used that is not defined by the loot table type.
  - The loot table type is always optional. No validation will take place if it is not specified.
  - This is internally called a **loot context parameter set**. The default parameter sets can be found in the `LootContextParamSets` class.
  - For a full list of loot table types and what context they provide, see [Loot Contexts][lootcontext].
- A **loot table evaluator** is the piece of Java code rolling the loot table.

Generally, a loot table has the following JSON format:

```json5
{
  "type": "chest", // loot table type
  "neoforge:conditions": [
    // data load conditions
  ],
  "functions": [
    // table-wide loot functions
  ],
  "pools": [ // list of loot pools
    {
      "rolls": 1, // amount of rolls of the loot table, using 5 here will yield 5 results from the pool
      "bonus_rolls": 0.5, // amount of bonus rolls, see the luck section below
      "name": "my_pool",
      "conditions": [
        // pool-wide loot conditions
      ],
      "functions": [
        // pool-wide loot functions
      ],
      "entries": [ // list of loot table entries
        {
          "type": "minecraft:item", // loot entry type
          "name": "minecraft:dirt", // type-specific properties, for example the name of the item
          "conditions": [
            // entry-wide loot conditions
          ],
          "functions": [
            // entry-wide loot functions
          ]
        }
      ]
    }
  ]
}
```

The exact [JSON specification of loot tables][loottablespec] can be found on the [Minecraft Wiki][wiki].

## Using a Loot Table

To roll a loot table, we need two things: the loot table itself, and a (possibly empty) set of loot context parameters.

Let's start with getting the loot table itself. Loot tables are referenced by a [`ResourceLocation`][rl]. Loot table resource locations are relative to the `loot_tables` datapack folder. So for example, the loot table file for the loot table `examplemod:custom_fishing` would be located at `data/examplemod/loot_tables/custom_fishing`. Once you have the location, a loot table can then be obtained using `level.getServer().getLootData().getLootTable(location)`. As the loot data is only available through the server, this logic must run on a [logical server][sides], not a logical client.

:::tip
Minecraft's built-in loot table locations can be found in the `BuiltInLootTables` class.
:::

Now that we have a loot table, let's build our parameter set. We begin by creating an instance of `LootParams.Builder`:

```java
// Make sure that you are on a server, otherwise the cast will fail.
LootParams.Builder builder = new LootParams.Builder((ServerLevel) level);
```

We can then add loot context parameters, like so:

```java
// Use whatever context parameters and values you need. Vanilla parameters can be found in LootContextParams.
builder.withParameter(LootContextParams.ORIGIN, position);
// This variant can accept null as the value, in which case an existing value for that parameter will be removed.
builder.withOptionalParameter(LootContextParams.ORIGIN, null);
```

It is also possible to add dynamic drops from code, for example for dropping container contents. This is done like so (the lambda is a `Consumer<ItemStack>`):

```java
builder.withDynamicDrop(new ResourceLocation("examplemod", "example_dynamic_drop"), stack -> {
    // whatever you want to drop here
});
```

Finally, we can create the `LootParams` from the builder and use them to roll the loot table:

```java
// Specify a loot context param set here if you want.
LootParams params = builder.create(LootContextParamSet.EMPTY);
// Get the loot table.
LootTable table = level.getServer().getLootData().getLootTable(location);
// Actually roll the loot table.
List<ItemStack> list = table.getRandomItems(params);
// Use this instead if you are rolling the loot table for container contents, e.g. loot chests.
// This method takes care of properly splitting the loot items across the container.
List<ItemStack> containerList = table.fill(container, params, someSeed);
```

:::danger
`LootTable` additionally exposes a method named `#getRandomItemsRaw`. Unlike the various `#getRandomItems` variants, `#getRandomItemsRaw` method will not apply [global loot modifiers][glm]. Use this method only if you know what you are doing.
:::

## Luck

In the `LootParams.Builder`, we can also set a luck value through `#withLuck`. The luck value is a rather obscure concept only used in two vanilla use cases. One is in loot tables that use the [`quality` field][entry] on loot entries, and the second one is to determine bonus rolls.

To determine bonus rolls, the specified bonus rolls value of a loot pool is multiplied with the luck value. Both the luck value and the bonus rolls value default to 0, so this only comes into effect for loot pools with a non-zero bonus rolls value, and only if the luck value of the player is greater than zero as well.

Luck is modified by an entity attribute also called luck. This attribute is only affected by the luck [mob effect][mobeffect], which is unobtainable in survival gameplay and only available through creative mode or commands. However, mods may add survival-obtainable ways to modify this stat, so it is generally recommended to account for this possibility.

:::info
The Fortune and Looting enchantments do not use the luck value. They are instead implemented as loot functions.
:::

## NeoForge-Added Loot Conditions

### `neoforge:loot_table_id`

This condition only returns true if the surrounding loot table id matches. This is typically used within [global loot modifiers][glm].

```json5
// In some loot pool or pool entry
{
  "conditions": [
    {
      "condition": "neoforge:loot_table_id",
      // Will only apply when the loot table is for dirt
      "loot_table_id": "minecraft:blocks/dirt"
    }
  ]
}
```

### `neoforge:can_tool_perform_action`

This condition only returns true if the item in the `tool` loot context parameter (`LootContextParams.TOOL`) can perform the specified [`ToolAction`][toolaction].

```json5
// In some loot pool or pool entry
{
  "conditions": [
    {
      "condition": "neoforge:can_tool_perform_action",
      // Will only apply if the tool can strip a log like an axe
      "action": "axe_strip"
    }
  ]
}
```

## Custom Loot Conditions

Loot conditions are a [registry]. Like many other registries, they use the pattern of "one type object, many instance objects". Additionally, like many other datapack-related systems, they use [codecs][codec]. To get started, we create our loot item condition class. For the sake of example, let's assume we only want the condition to pass if the player killing the mob has a certain xp level:

```java
public record HasXpLevelCondition(int level) implements LootItemCondition {
    // Add the context we need for this condition. In our case, this will be the xp level the player must have.
    public static final Codec<HasXpLevelCondition> CODEC = RecordCodecBuilder.create(inst -> inst.group(
            Codec.INT.fieldOf("level").forGetter(this::level)
    ).apply(inst, HasXpLevelCondition::new));
    // Our type instance.
    public static final LootItemConditionType TYPE = new LootItemConditionType(CODEC);

    // Return our type instance here.
    @Override
    public LootItemConditionType getType() {
        return TYPE;
    }
    
    // Evaluates the condition here. Get the required loot context parameters from the provided LootContext.
    // In our case, we want the KILLER_ENTITY to have at least our required level.
    @Override
    public boolean test(LootContext context) {
        Entity entity = context.getParamOrNull(LootContextParams.KILLER_ENTITY);
        return entity instanceof Player player && player.experienceLevel >= level; 
    }
    
    // Tell the game what parameters we expect from the loot context. Used in validation.
    @Override
    public Set<LootContextParam<?>> getReferencedContextParams() {
        return ImmutableSet.of(LootContextParams.KILLER_ENTITY);
    }
}
```

And then, we can register the condition type to the registry:

```java
public static final DeferredRegister<LootItemConditionType> LOOT_CONDITION_TYPES =
        DeferredRegister.create(Registries.LOOT_CONDITION_TYPE, ExampleMod.MOD_ID);

public static final Supplier<LootItemConditionType> MIN_XP_LEVEL =
        LOOT_CONDITION_TYPES.register("min_xp_level", () -> HasXpLevelCondition.TYPE);
```

## Custom Loot Functions

Similar to loot conditions, we can also add loot functions by registering a corresponding type object to their [registry], which is in turn created with a [codec]. `LootItemFunction` extends `BiFunction<ItemStack, LootContext, ItemStack>`, so what we want is to use the existing item stack and the loot context to return a new, modified item stack.

Almost all loot functions don't directly extend `LootItemFunction`, but extend `LootItemConditionalFunction` instead. This class has built-in functionality for applying loot conditions to the function - the function is only applied if the loot conditions apply. For the sake of example, let's apply a random enchantment with a specified level to the item:

```java
// Code adapted from vanilla's EnchantRandomlyFunction class.
// LootItemConditionalFunction is an abstract class, not an interface, so we cannot use a record here.
public class RandomEnchantmentWithLevelFunction extends LootItemConditionalFunction {
    // Our context: an optional list of enchantments, and a level.
    private final Optional<HolderSet<Enchantment>> enchantments;
    private final int level;
    // A codec for the enchantment registry.
    private static final Codec<HolderSet<Enchantment>> ENCHANTMENT_SET_CODEC = BuiltInRegistries.ENCHANTMENT
            .holderByNameCodec()
            .listOf()
            .xmap(HolderSet::direct, e -> e.stream().toList());
    // Our codec.
    public static final Codec<RandomEnchantmentWithLevelFunction> CODEC =
            // #commonFields adds the conditions field.
            RecordCodecBuilder.create(inst -> commonFields(inst)
                    .and(ExtraCodecs.strictOptionalField(ENCHANTMENT_SET_CODEC, "enchantments").forGetter(inst -> inst.enchantments))
                    .and(Codec.INT.fieldOf("level").forGetter(inst -> inst.level))
                    .apply(inst, RandomEnchantmentWithLevelFunction::new));
    // Our loot function type.
    public static final LootItemFunctionType TYPE = new LootItemFunctionType(CODEC);
    
    RandomEnchantmentWithLevelFunction(List<LootItemCondition> conditions, Optional<HolderSet<Enchantment>> enchantments, int level) {
        super(conditions);
        this.enchantments = enchantments;
        this.level = level;
    }
    
    // Return our loot function type here.
    @Override
    public LootItemFunctionType getType() {
        return TYPE;
    }
    
    // Run our enchantment application logic. Most of this is copied from EnchantRandomlyFunction#run.
    @Override
    public ItemStack run(ItemStack stack, LootContext context) {
        RandomSource random = context.getRandom();
        Optional<Holder<Enchantment>> optional = this.enchantments
                .flatMap(e -> e.getRandomElement(randomsource))
                .or(() -> Util.getRandomSafe(BuiltInRegistries.ENCHANTMENT.holders()
                        .filter(e -> e.value().isDiscoverable())
                        .filter(e -> pStack.is(Items.BOOK) || e.value().canEnchant(pStack))
                        .toList(), randomsource));
        if (optional.isEmpty()) {
            LogUtils.getLogger().warn("Couldn't find a compatible enchantment for {}", stack);
        } else if (stack.is(Items.BOOK)) {
            stack = new ItemStack(Items.ENCHANTED_BOOK);
            EnchantedBookItem.addEnchantment(stack, new EnchantmentInstance(optional.get().value(), this.level));
        } else {
            stack.enchant(optional.get().value(), this.level);
        }
        return stack;
    }
}
```

And then, we can register the function type to the registry:

```java
public static final DeferredRegister<LootItemFunctionType> LOOT_FUNCTION_TYPES =
        DeferredRegister.create(Registries.LOOT_FUNCTION_TYPE, ExampleMod.MOD_ID);

public static final Supplier<LootItemFunctionType> RANDOM_ENCHANTMENT_WITH_LEVEL =
        LOOT_FUNCTION_TYPES.register("random_enchantment_with_level", () -> RandomEnchantmentWithLevelFunction.TYPE);
```

[codec]: ../../../datastorage/codecs.md
[conditions]: ../conditions.md
[datapack]: https://minecraft.wiki/w/Data_pack
[entry]: https://minecraft.wiki/w/Loot_table#Entry
[event]: ../../../concepts/events.md#registering-an-event-handler
[glm]: ../glm.md
[itemmodifiers]: https://minecraft.wiki/w/Item_modifier#JSON_format
[itempredicates]: https://minecraft.wiki/w/Predicate#Predicate_JSON_format
[lootcontext]: https://minecraft.wiki/w/Loot_context
[loottablespec]: https://minecraft.wiki/w/Loot_table#JSON_format
[luck]: #luck
[mcwiki]: https://minecraft.wiki
[mobeffect]: ../../../items/mobeffects.md
[neoconditions]: #neoforge-added-loot-conditions
[raidherogifts]: ../datamaps/builtin.md#neoforgeraid_hero_gifts
[registry]: ../../../concepts/registries.md
[rl]: ../../../misc/resourcelocation.md
[sides]: ../../../concepts/sides.md
[toolaction]: ../../../items/tools.md#toolactions
[wiki]: https://minecraft.wiki/w/Loot_table
