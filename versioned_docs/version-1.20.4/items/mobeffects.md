# Mob Effects & Potions

Status effects, sometimes known as potion effects and referred to in-code as `MobEffect`s, are effects that influence an entity every tick. This article explains how to use them, what the difference between an effect and a potion is, and how to add your own.

## Terminology

- A `MobEffect` affects an entity every tick. Like [blocks][block] or [items][item], `MobEffect`s are registry objects, meaning they must be [registered][registration] and are singletons.
  - An **instant mob effect** is a special kind of mob effect that is designed to be applied for one tick. Vanilla has two instant effects, Instant Health and Instant Harming.
- A `MobEffectInstance` is an instance of a `MobEffect`, with a duration, amplifier and some other properties set (see below). `MobEffectInstance`s are to `MobEffect`s what [`ItemStack`s][itemstack] are to `Item`s.
- A `Potion` is a collection of `MobEffectInstance`s. Vanilla mainly uses potions for the four potion items (read on), however, they can be applied to any item at will. It is up to the item if and how the item then uses the potion set on it.
- A **potion item** is an item that is meant to have a potion set on it. This is an informal term, the vanilla `PotionItem` class has nothing to do with this (it refers to the "normal" potion item). Minecraft currently has four potion items: potions, splash potions, lingering potions, and tipped arrows; however more may be added by mods.

## `MobEffect`s

To create your own `MobEffect`, extend the `MobEffect` class:

```java
public class MyMobEffect extends MobEffect {
    public MyMobEffect(MobEffectCategory category, int color) {
        super(category, color);
    }
    
    @Override
    public void applyEffectTick(LivingEntity entity, int amplifier) {
        // Apply your effect logic here.
    }
    
    // Whether the effect should apply this tick. Used e.g. by the Regeneration effect that only applies
    // once every x ticks, depending on the tick count and amplifier.
    @Override
    public boolean shouldApplyEffectTickThisTick(int tickCount, int amplifier) {
        return tickCount % 2 == 0; // replace this with whatever check you want
    }
    
    // Utility method that is called when the effect is first added to the entity.
    @Override
    public void onEffectStarted(LivingEntity entity, int amplifier) {
    }
}
```

Like all registry objects, `MobEffect`s must be registered, like so:

```java
//MOB_EFFECTS is a DeferredRegister<MobEffect>
public static final Supplier<MyMobEffect> MY_MOB_EFFECT = MOB_EFFECTS.register("my_mob_effect", () -> new MyMobEffect(
        //Can be either BENEFICIAL, NEUTRAL or HARMFUL. Used to determine the potion tooltip color of this effect.
        MobEffectCategory.BENEFICIAL,
        //The color of the effect particles.
        0xffffff
));
```

If you want your effect to act solely as a marker, you can also directly use the `MobEffect` class, like you can with the `Block` or `Item` classes.

The `MobEffect` class also provides default functionality for adding attribute modifiers to affected entities. For example, the speed effect adds an attribute modifier for movement speed. Effect attribute modifiers are added like so:

```java
public static final String MY_MOB_EFFECT_UUID = "01234567-89ab-cdef-0123-456789abcdef";
public static final Supplier<MyMobEffect> MY_MOB_EFFECT = MOB_EFFECTS.register("my_mob_effect", () -> new MyMobEffect(...)
        .addAttributeModifier(Attribute.ATTACK_DAMAGE, MY_MOB_EFFECT_UUID, 2.0, AttributeModifier.Operation.ADD)
);
```

:::note
The UUID used must be a valid and unique UUIDv4, as for some reason, Mojang decided to use UUIDs here instead of some text-based identifier. A UUID is best obtained through an online generator, for example [uuidgenerator.net][uuidgen].
:::

### `InstantenousMobEffect`

If you want to create an instant effect, you can use the helper class `InstantenousMobEffect` instead of the regular `MobEffect` class, like so:

```java
public class MyMobEffect extends InstantenousMobEffect {
    public MyMobEffect(MobEffectCategory category, int color) {
        super(category, color);
    }

    @Override
    public void applyEffectTick(LivingEntity entity, int amplifier) {
        // Apply your effect logic here.
    }
}
```

Then, register your effect like normal.

### Events

Many effects have their logic applied in other places. For example, the levitation effect is applied in the living entity movement handler. For modded `MobEffect`s, it often makes sense to apply them in an [event handler][events]. NeoForge also provides a few events related to effects:

- `MobEffectEvent.Applicable` is fired when the game checks whether a `MobEffectInstance` can be applied to an entity. This event can be used to deny or force adding the effect instance to the target.
- `MobEffectEvent.Added` is fired when the `MobEffectInstance` is added to the target. This event contains information about a previous `MobEffectInstance` that may have been present on the target.
- `MobEffectEvent.Expired` is fired when the `MobEffectInstance` expires, i.e. the timer goes to zero.
- `MobEffectEvent.Remove` is fired when the effect is removed from the entity through means other than expiring, e.g. through drinking milk or via commands.

## `MobEffectInstance`s

A `MobEffectInstance` is, simply put, an effect applied to an entity. Creating a `MobEffectInstance` is done by calling the constructor:

```java
MobEffectInstance instance = new MobEffectInstance(
        // The mob effect to use.
        MobEffects.REGENERATION,
        // The duration to use, in ticks. Defaults to 0 if not specified.
        500,
        // The amplifier to use. This is the "strength" of the effect, i.e. Strength I, Strength II, etc;
        // starting at 0. Defaults to 0 if not specified.
        0,
        // Whether the effect is an "ambient" effect, meaning it is being applied by an ambient source,
        // of which Minecraft currently has the beacon and the conduit. Defaults to false if not specified.
        false,
        // Whether the effect is visible in the inventory. Defaults to true if not specified.
        true,
        // Whether an effect icon is visible in the top right corner. Defaults to true if not specified.
        true
);
```

Several constructor overloads are available, omitting the last 1-5 parameters, respectively.

:::info
`MobEffectInstance`s are mutable. If you need a copy, call `new MobEffectInstance(oldInstance)`.
:::

### Using `MobEffectInstance`s

A `MobEffectInstance` can be added to an entity like so:

```java
MobEffectInstance instance = new MobEffectInstance(...);
entity.addEffect(instance);
```

Similarly, `MobEffectInstance` can also be removed from an entity. Since a `MobEffectInstance` overwrites pre-existing `MobEffectInstance`s of the same `MobEffect` on the entity, there can only ever be one `MobEffectInstance` per `MobEffect` and entity. As such, specifying the `MobEffect` suffices when removing:

```java
entity.removeEffect(MobEffects.REGENERATION);
```

:::info
`MobEffect`s can only be applied to `LivingEntity` or its subclasses, i.e. players and mobs. Things like items or thrown snowballs cannot be affected by `MobEffect`s.
:::

## `Potion`s

`Potion`s are created by calling the constructor of `Potion` with the `MobEffectInstance`s you want the potion to have. For example:

```java
//POTIONS is a DeferredRegister<Potion>
public static final Supplier<Potion> MY_POTION = POTIONS.register("my_potion", () -> new Potion(new MobEffectInstance(MY_MOB_EFFECT.get(), 3600)));
```

Note that the parameter of `new Potion` is a vararg. This means that you can add as many effects as you want to the potion. This also means that it is possible to create empty potions, i.e. potions that don't have any effects. Simply call `new Potion()` and you're done! (This is how vanilla adds the `awkward` potion, by the way.)

The name of the potion can be passed as the first constructor argument. It is used for translating; for example, the long and strong potion variants in vanilla use this to have the same names as their base variant. The name is not required; if it is omitted, the name will be queried from the registry.

The `PotionUtils` class offers various helper methods related to potions, such as `getPotion` and `setPotion` for item stacks (this can be any kind of item and is not limited to potion items), or `getColor` for getting a potion's display color.

### Brewing

Now that your potion is added, potion items are available for your potion. However, there is no way to obtain your potion in survival, so let's change that!

Potions are traditionally made in the Brewing Stand. Unfortunately, Mojang does not provide [datapack][datapack] support for brewing recipes, so we have to be a little old-fashioned and add our recipes through code. This is done like so:

```java
// The brewing ingredient. This is the item at the top of the brewing stand.
Ingredient brewingIngredient = Ingredient.of(Items.FEATHER);
BrewingRecipeRegistry.addRecipe(
        // The input potion ingredient, often an awkward potion. This is the item at the bottom of the brewing stand.
        // Does not need to be a potion, but typically is.
        PotionUtils.setPotion(new ItemStack(Items.POTION), Potions.AWKWARD),
        // Our brewing ingredient.
        brewingIngredient,
        // The resulting item stack. Does not need to be a potion, but typically is.
        PotionUtils.setPotion(new ItemStack(Items.POTION), MY_POTION)
);
// We also need to do this separately for splash potions and lingering potions.
// The tipped arrow recipe is taken care of by Minecraft's tipped arrow special crafting handler.
BrewingRecipeRegistry.addRecipe(
        PotionUtils.setPotion(new ItemStack(Items.SPLASH_POTION), Potions.AWKWARD),
        brewingIngredient,
        PotionUtils.setPotion(new ItemStack(Items.SPLASH_POTION), MY_POTION)
);
BrewingRecipeRegistry.addRecipe(
        PotionUtils.setPotion(new ItemStack(Items.LINGERING_POTION), Potions.AWKWARD),
        brewingIngredient,
        PotionUtils.setPotion(new ItemStack(Items.LINGERING_POTION), MY_POTION)
);
```

This should be called some time during setup, for example during [`FMLCommonSetupEvent`][commonsetup]. Make sure to wrap this into an `event.enqueueWork()` call, as the brewing recipe registry is not thread-safe.

[block]: ../blocks/index.md
[commonsetup]: ../concepts/events.md#event-buses
[datapack]: ../resources/server/index.md
[events]: ../concepts/events.md
[item]: index.md
[itemstack]: index.md#itemstacks
[registration]: ../concepts/registries.md
[uuidgen]: https://www.uuidgenerator.net/version4
