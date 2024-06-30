# Loot Conditions

Loot conditions can be used to check whether a [loot entry][entry] or [loot pool][pool] should be used in the current context. In both cases, a list of conditions is defined; the entry or pool is only used if all conditions pass. During datagen, they are added to a `LootPoolEntryContainer.Builder<?>` or `LootPool.Builder` by calling `#when` with an instance of the desired condition. This article will outline the available loot conditions, as well as how to create your own.

## Vanilla Loot Conditions

_See also: [Item Predicates][itempredicates] on the [Minecraft Wiki][mcwiki]_

TODO

## NeoForge Loot Conditions

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

During datagen, call `LootTableIdCondition#builder` with the desired loot table id to construct an instance of this condition.

### `neoforge:can_item_perform_ability`

This condition only returns true if the item in the `tool` loot context parameter (`LootContextParams.TOOL`), usually the item used to break the block or kill the entity, can perform the specified [`ItemAbility`][itemability].

```json5
// In some loot pool or pool entry
{
  "conditions": [
    {
      "condition": "neoforge:can_item_perform_ability",
      // Will only apply if the tool can strip a log like an axe
      "ability": "axe_strip"
    }
  ]
}
```

During datagen, call `CanItemPerformAbility#canItemPerformAbility` with the id of the desired item ability to construct an instance of this condition.

## Custom Loot Conditions

Loot conditions are a [registry]. Like many other registries, they use the pattern of "one type object, many instance objects". Additionally, like many other datapack-related systems, they use [codecs][codec]. To get started, we create our loot item condition class. For the sake of example, let's assume we only want the condition to pass if the player killing the mob has a certain xp level:

```java
public record HasXpLevelCondition(int level) implements LootItemCondition {
    // Add the context we need for this condition. In our case, this will be the xp level the player must have.
    public static final MapCodec<HasXpLevelCondition> CODEC = RecordCodecBuilder.create(inst -> inst.group(
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

[codec]: ../../../datastorage/codecs.md
[entry]: index.md#loot-entry
[glm]: glm.md
[itemability]: ../../../items/tools.md#itemabilitys
[itempredicates]: https://minecraft.wiki/w/Predicate#Predicate_JSON_format
[mcwiki]: https://minecraft.wiki
[pool]: index.md#loot-pool
[registry]: ../../../concepts/registries.md
