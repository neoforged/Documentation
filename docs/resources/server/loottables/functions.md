# Loot Functions

Loot functions can be used to modify the result of a [loot entry][entry], or the multiple results of a [loot pool][pool] or [loot table][table]. In both cases, a list of functions is defined, which is run in order. During datagen, loot functions can be applied to `LootPoolSingletonContainer.Builder<?>`s, `LootPool.Builder`s and `LootTable.Builder`s by calling `#apply`. This article will outline the available loot functions, as well as how to create your own.

:::note
Loot functions cannot be applied to composite loot entries (subclasses of `CompositeEntryBase` and their associated builder classes). They must be added to each singleton entry manually.
:::

## Vanilla Loot Functions

_See also: [Item Modifiers][itemmodifiers] on the [Minecraft Wiki][mcwiki]_

TODO

## Custom Loot Functions

Loot conditions are a [registry]. Like many other registries, they use the pattern of "one type object, many instance objects". Additionally, like many other datapack-related systems, they use [codecs][codec]. To get started, we create our own class extending `LootItemFunction`. `LootItemFunction` extends `BiFunction<ItemStack, LootContext, ItemStack>`, so what we want is to use the existing item stack and the loot context to return a new, modified item stack.

Almost all loot functions don't directly extend `LootItemFunction`, but extend `LootItemConditionalFunction` instead. This class has built-in functionality for applying loot conditions to the function - the function is only applied if the loot conditions apply. For the sake of example, let's apply a random enchantment with a specified level to the item:

```java
// Code adapted from vanilla's EnchantRandomlyFunction class.
// LootItemConditionalFunction is an abstract class, not an interface, so we cannot use a record here.
public class RandomEnchantmentWithLevelFunction extends LootItemConditionalFunction {
    // Our context: an optional list of enchantments, and a level.
    private final Optional<HolderSet<Enchantment>> enchantments;
    private final int level;
    // Our codec.
    public static final MapCodec<RandomEnchantmentWithLevelFunction> CODEC =
            // #commonFields adds the conditions field.
            RecordCodecBuilder.create(inst -> commonFields(inst).and(inst.group(
                    RegistryCodecs.homogeneousList(Registries.ENCHANTMENT).optionalFieldOf("enchantments").forGetter(e -> e.options),
                    Codec.INT.fieldOf("level").forGetter(e -> e.level)
            ).apply(inst, RandomEnchantmentWithLevelFunction::new));
    // Our loot function type.
    public static final LootItemFunctionType TYPE = new LootItemFunctionType(CODEC);
    
    public RandomEnchantmentWithLevelFunction(List<LootItemCondition> conditions, Optional<HolderSet<Enchantment>> enchantments, int level) {
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
        List<Holder<Enchantment>> stream = this.enchantments
                .map(HolderSet::stream)
                .orElseGet(() -> context.getLevel().registryAccess().registryOrThrow(Registries.ENCHANTMENT).holders().map(Function.identity()))
                .filter(e -> e.value().canEnchant(stack))
                .toList();
        Optional<Holder<Enchantment>> optional = Util.getRandomSafe(list, random);
        if (optional.isEmpty()) {
            LOGGER.warn("Couldn't find a compatible enchantment for {}", stack);
        } else {
            if (stack.is(Items.BOOK)) {
                stack = new ItemStack(Items.ENCHANTED_BOOK);
            }
            stack.enchant(enchantment, Mth.nextInt(random, enchantment.value().getMinLevel(), enchantment.value().getMaxLevel()));
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
[entry]: index.md#loot-entry
[itemmodifiers]: https://minecraft.wiki/w/Item_modifier#JSON_format
[mcwiki]: https://minecraft.wiki
[pool]: index.md#loot-pool
[registry]: ../../../concepts/registries.md
[table]: index.md#loot-table
