# Mob Effects & Potions

状态效果，有时称为药水效果，并在代码中称为 `MobEffect`，是每个游戏刻对实体产生影响的效果。本文解释了如何使用它们，效果与药水之间的区别，以及如何添加自定义效果。

## 术语

- `MobEffect` 每个游戏刻对实体产生影响。与[方块][block]或[物品][item]一样，`MobEffect` 是注册对象，这意味着它们必须[注册][registration]并且是单例的。
  - **即时效果** 是一种特殊类型的效果，设计用于应用一次游戏刻。原版有两种即时效果，即即时治疗和即时伤害。
- `MobEffectInstance` 是 `MobEffect` 的实例，具有持续时间、增幅和一些其他设置（见下文）。`MobEffectInstance` 对于 `MobEffect` 就像 [`ItemStack`][itemstack] 对于 `Item` 一样。
- `Potion` 是一组 `MobEffectInstance`。原版主要用于四种药水物品（后文），但可以随意应用于任何物品。物品如何使用所设置的药水取决于物品本身。
- **药水物品** 是指应设置药水的物品。这是一个非正式的术语，原版中有四种药水物品：药水、溅射药水、挥发药水和毒箭；但是模组可能会添加更多。

## `MobEffect`s

要创建自己的 `MobEffect`，请扩展 `MobEffect` 类：

```java
public class MyMobEffect extends MobEffect {
    public MyMobEffect(MobEffectCategory category, int color) {
        super(category, color);
    }
    
    @Override
    public void applyEffectTick(LivingEntity entity, int amplifier) {
        // 在这里应用你的效果逻辑。
    }
    
    // 决定是否在此游戏刻应用效果。例如，恢复效果每 x 个游戏刻应用一次，具体取决于游戏刻和增幅。
    @Override
    public boolean shouldApplyEffectTickThisTick(int tickCount, int amplifier) {
        return tickCount % 2 == 0; // 用你想要的检查替换此处
    }
    
    // 当效果首次添加到实体时调用的实用方法。
    @Override
    public void onEffectStarted(LivingEntity entity, int amplifier) {
    }
}
```

像所有注册对象一样，`MobEffect` 必须像下面这样注册：

```java
// MOB_EFFECTS 是一个 DeferredRegister<MobEffect>
public static final Supplier<MyMobEffect> MY_MOB_EFFECT = MOB_EFFECTS.register("my_mob_effect", () -> new MyMobEffect(
        // 可以是 BENEFICIAL、NEUTRAL 或 HARMFUL。用于确定此效果的药水工具提示颜色。
        MobEffectCategory.BENEFICIAL,
        // 效果粒子的颜色。
        0xffffff
));
```

如果你的效果仅用作标记，你也可以直接使用 `MobEffect` 类，就像你可以使用 `Block` 或 `Item` 类一样。

`MobEffect` 类还为受影响实体添加属性修改器提供了默认功能。例如，速度效果会为移动速度添加属性修改器。效果属性修改器添加如下：

```java
public static final String MY_MOB_EFFECT_UUID = "01234567-89ab-cdef-0123-456789abcdef";
public static final Supplier<MyMobEffect> MY_MOB_EFFECT = MOB_EFFECTS.register("my_mob_effect", () -> new MyMobEffect(...)
        .addAttributeModifier(Attribute.ATTACK_DAMAGE, MY_MOB_EFFECT_UUID, 2.0, AttributeModifier.Operation.ADD)
);
```

:::note
使用的 UUID 必须是有效且唯一的 UUIDv4，因为出于某种原因，Mojang 决定在此处使用 UUID 而不是一些基于文本的标识符。最好

通过在线生成器获得 UUID，例如 [uuidgenerator.net][uuidgen]。
:::

### `InstantenousMobEffect`

如果要创建即时效果，可以使用助手类 `InstantenousMobEffect` 而不是常规的 `MobEffect` 类，如下所示：

```java
public class MyMobEffect extends InstantenousMobEffect {
    public MyMobEffect(MobEffectCategory category, int color) {
        super(category, color);
    }

    @Override
    public void applyEffectTick(LivingEntity entity, int amplifier) {
        // 在这里应用你的效果逻辑。
    }
}
```

然后，像平常一样注册你的效果。

### 事件

许多效果在其他地方应用它们的逻辑。例如，飘浮效果在生物移动处理程序中应用。对于模组 `MobEffect`，通常最好在[事件处理程序][events]中应用它们。NeoForge 还提供了一些与效果相关的事件：

- `MobEffectEvent.Applicable` 在游戏检查是否可以将 `MobEffectInstance` 应用于实体时触发。此事件可用于拒绝或强制向目标添加效果实例。
- `MobEffectEvent.Added` 当 `MobEffectInstance` 添加到目标时触发。此事件包含有关可能存在于目标上的先前 `MobEffectInstance` 的信息。
- `MobEffectEvent.Expired` 当 `MobEffectInstance` 到期时触发，即计时器归零时。
- `MobEffectEvent.Remove` 当通过除到期之外的方式从实体中移除效果时触发，例如通过喝牛奶或通过命令。

## `MobEffectInstance`s

简单来说，`MobEffectInstance` 是应用于实体的效果。通过调用构造函数创建 `MobEffectInstance`：

```java
MobEffectInstance instance = new MobEffectInstance(
        // 要使用的 mob 效果。
        MobEffects.REGENERATION,
        // 使用的持续时间，以游戏刻为单位。如果未指定，默认为 0。
        500,
        // 要使用的增幅。这是效果的 “强度”，例如，Strength I、Strength II 等；从 0 开始。如果未指定，默认为 0。
        0,
        // 是否为 “环境” 效果，表示它由环境源应用，Minecraft 目前有信标和导管。如果未指定，默认为 false。
        false,
        // 效果是否在库存中可见。如果未指定，默认为 true。
        true,
        // 是否在右上角可见效果图标。如果未指定，默认为 true。
        true
);
```

有几种构造函数重载，分别省略最后 1-5 个参数。

:::info
`MobEffectInstance` 是可变的。如果需要副本，请调用 `new MobEffectInstance(oldInstance)`。
:::

### 使用 `MobEffectInstance`

可以将 `MobEffectInstance` 添加到实体，如下所示：

```java
MobEffectInstance instance = new MobEffectInstance(...);
entity.addEffect(instance);
```

类似地，也可以从实体中移除 `MobEffectInstance`。由于 `MobEffectInstance` 覆盖了实体上的相同 `MobEffect` 的预先存在的 `MobEffectInstance`，因此每个 `MobEffect` 和实体只能有一个 `MobEffectInstance`。因此，在移除时只需指定 `MobEffect` 即可：

```java
entity.removeEffect(MobEffects.REGENERATION);
```

:::info
`MobEffect` 只能应用于 `LivingEntity` 或其子类，例如玩家和生物。例如物品或投掷雪球无法受到 `MobEffect` 的影响。
:::

## `Potion`s

`Potion`s 是通过调用 `Potion` 的构造函数并传递你想要的 `MobEffectInstance`s 来创建的。例如：

```java
// POTIONS 是一个 DeferredRegister<Potion>
public static final Supplier<Potion> MY_POTION = POTIONS.register("my_potion", () -> new Potion(new MobEffectInstance(MY_MOB_EFFECT.get(), 3600)));
```

请注意，`new Potion` 的参数是可变参数。这意味着你可以向药水添加任意数量的效果。这也意味着可以创建空药水，即不含任何效果的药水。只需调用 `new Potion()` 即可！（顺便说一句，这就是原版如何添加 `awkward` 药水的方式。）

药水的名称可以作为第一个构造函数参数传递。它用于翻译；例如，原版中的长效和强效药水变种使用此参数，使其与基本变种具有相同的名称。名称不是必需的；如果省略了名称，将从注册表中查询名称。

`PotionUtils` 类提供了与药水相关的各种辅助方法，例如 `getPotion` 和 `setPotion` 用于物品堆栈（这可以是任何类型的物品，不仅限于药水物品），或者 `getColor` 用于获取药水的显示颜色。

### 酿造

现在，你的药水已经添加，药水物品可以使用你的药水了。但是，在生存模式下没有办法获得你的药水，所以让我们改变一下！

传统上，药水是在酿造台上制作的。不幸的是，Mojang 没有为酿造配方提供 [数据包][datapack] 支持，因此我们必须有点老派，通过代码添加我们的配方。操作如下：

```java
// 酿造成分。这是在酿造台顶部的物品。
Ingredient brewingIngredient = Ingredient.of(Items.FEATHER);
BrewingRecipeRegistry.addRecipe(
        // 输入药水成分，通常是一种混合药水。这是在酿造台底部的物品。
        // 不一定要是药水，但通常是。
        PotionUtils.setPotion(new ItemStack(Items.POTION), Potions.AWKWARD),
        // 我们的酿造成分。
        brewingIngredient,
        // 结果物品堆栈。不一定要是药水，但通常是。
        PotionUtils.setPotion(new ItemStack(Items.POTION), MY_POTION)
);
// 对于溅射药水和挥发药水，我们还需要单独处理。
// 原版的毒箭配方由 Minecraft 的毒箭特殊配方处理。
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

这应该在设置期间的某个时间调用，例如在 [`FMLCommonSetupEvent`][commonsetup] 中。确保将此代码包装到 `event.enqueueWork()` 调用中，因为酿造配方注册表不是线程安全的。

[block]: ../blocks/index.md
[commonsetup]: ../concepts/events.md#event-buses
[datapack]: ../resources/server/index.md
[events]: ../concepts/events.md
[item]: index.md
[itemstack]: index.md#itemstacks
[registration]: ../concepts/registries.md
[uuidgen]: https://www.uuidgenerator.net/version4
