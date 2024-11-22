# 成就

成就是玩家可以完成的任务，可能会推进游戏的进程。玩家可能直接参与的任何动作都可以触发成就。

所有原版内的成就实现都通过JSON进行数据驱动。这意味着创建新的成就不需要mod，只需要一个[data pack][datapack]。关于如何创建并将这些成就放入mod的`resources`的完整列表，可以在[Minecraft Wiki][wiki]上找到。此外，根据存在的信息（加载的模组，存在的项目等），成就可以有条件地[加载和默认][conditional]。和其他数据驱动的功能一样，成就可以通过[data generators][datagen]来生成。

## 成就条件

为了解锁一个成就，必须满足指定的条件。条件通过触发器进行跟踪，当执行某个动作时触发：杀死实体，改变库存，繁殖动物等。每当一个成就被加载到游戏中，定义的条件就会被读取并添加为触发器的监听器。然后调用一个触发器函数（通常命名为`#trigger`），检查所有监听器是否当前状态满足成就条件。只有在完成所有要求并获得成就后，成就的条件监听器才会被移除。

要求被定义为一个字符串数组的数组，表示在成就上指定的条件的名称。一旦满足一个条件的字符串数组，成就就完成了：

```js
// In some advancement JSON

// List of defined criteria to meet
"criteria": {
  "example_criterion1": { /*...*/ },
  "example_criterion2": { /*...*/ },
  "example_criterion3": { /*...*/ },
  "example_criterion4": { /*...*/ }
},

// This advancement is only unlocked once
// - Criteria 1 AND 2 have been met
// OR
// - Criteria 3 and 4 have been met
"requirements": [
  [
    "example_criterion1",
    "example_criterion2"
  ],
  [
    "example_criterion3",
    "example_criterion4"
  ]
]
```

原版定义的条件触发器列表可以在`CriteriaTriggers`中找到。此外，JSON格式在[Minecraft Wiki][triggers]上有定义。

### 自定义条件触发器

自定义条件触发器由两部分组成：触发器，它在你指定的某个时候在代码中被激活，通过调用`#trigger`，和实例，它定义了触发器应在何种条件下授予条件。触发器扩展了`SimpleCriterionTrigger<T>`，而实例实现了`SimpleCriterionTrigger.SimpleInstance`。泛型值`T`代表触发器实例类型。

### The SimpleCriterionTrigger.SimpleInstance实现

`SimpleCriterionTrigger.SimpleInstance`代表在`criteria`对象中定义的单个条件。触发器实例负责保存定义的条件，并返回输入是否匹配条件。

条件通常通过构造函数传入。`SimpleCriterionTrigger.SimpleInstance`接口只需要一个函数，名为`#player`，它返回玩家必须满足的条件，作为一个`Optional<ContextAwarePredicate>`。如果子类是一个Java记录，有一个这种类型的`player`参数（如下所示），那么自动生成的`#player`方法就足够了。

```java
public record ExampleTriggerInstance(Optional<ContextAwarePredicate> player, ItemPredicate item) implements SimpleCriterionTrigger.SimpleInstance {
  // extra methods here
}
```

:::note
通常，触发器实例具有静态辅助方法，这些方法可以根据实例的参数构造完整的`Criterion<T>`对象。这使得这些实例可以在数据生成期间轻松创建，但这是可选的。

```java
// In this example, EXAMPLE_TRIGGER is a DeferredHolder<CriterionTrigger<?>>
public static Criterion<ExampleTriggerInstance> instance(ContextAwarePredicate player, ItemPredicate item) {
  return EXAMPLE_TRIGGER.get().createCriterion(new ExampleTriggerInstance(Optional.of(player), item));
}
```
:::

最后，应该添加一个方法，该方法输入当前的数据状态，并返回用户是否满足了必要的条件。玩家的条件已经通过`SimpleCriterionTrigger#trigger(ServerPlayer, Predicate)`进行了检查。大多数触发器实例将这个方法称为`#matches`。

```java
// This method is unique for each instance and is as such not overridden
public boolean matches(ItemStack stack) {
  // Since ItemPredicate matches a stack, a stack is the input
  return this.item.matches(stack);
}
```

### SimpleCriterionTrigger

`SimpleCriterionTrigger<T>`子类负责指定一个编解码器来[序列化]触发器实例`T`，并提供一个方法来检查触发器实例并在成功时运行已附加的监听器。

后者是通过定义一个方法来检查所有的触发器实例，并在满足条件时运行监听器来完成的。该方法接收`ServerPlayer`和`SimpleCriterionTrigger.SimpleInstance`子类中匹配方法定义的其他数据。该方法应内部调用`SimpleCriterionTrigger#trigger`以正确处理检查所有监听器。大多数触发器实例将这个方法称为`#trigger`。

```java
// This method is unique for each trigger and is as such not a method to override
public void trigger(ServerPlayer player, ItemStack stack) {
  this.trigger(player,
    // The condition checker method within the SimpleCriterionTrigger.SimpleInstance subclass
    triggerInstance -> triggerInstance.matches(stack)
  );
}
```

最后，实例必须在`Registries.TRIGGER_TYPE`注册表上注册。关于如何进行注册的技巧可以在[Registries][registration]下找到。

### 序列化

必须定义一个[编解码器]来序列化和反序列化触发器实例。原版通常在实例实现中创建这个编解码器作为一个常量，然后通过触发器的`#codec`方法返回。


```java
class ExampleTrigger extends SimpleCriterionTrigger<ExampleTrigger.ExampleTriggerInstance> {
  @Override
  public Codec<ExampleTriggerInstance> codec() {
    return ExampleTriggerInstance.CODEC;
  }
  // ...
  public class ExampleTriggerInstance implements SimpleCriterionTrigger.SimpleInstance {
    public static final Codec<ExampleTriggerInstance> CODEC = ...;
    // ...
  }
}
```

对于之前提到的带有`ContextAwarePredicate`和`ItemPredicate`的记录示例，编解码器可以是：
```java
RecordCodecBuilder.create(instance -> instance.group(
  ExtraCodecs.strictOptionalField(EntityPredicate.ADVANCEMENT_CODEC, "player").forGetter(ExampleTriggerInstance::player),
  ItemPredicate.CODEC.fieldOf("item").forGetter(ExampleTriggerInstance::item)
).apply(instance, ExampleTriggerInstance::new));
``````

### 调用触发器

每当执行正在检查的动作时，应该调用由`SimpleCriterionTrigger`子类定义的`#trigger`方法。

```java
// In some piece of code where the action is being performed
// Again, EXAMPLE_TRIGGER is a supplier for the registered instance of the custom criteria trigger
public void performExampleAction(ServerPlayer player, ItemStack stack) {
  // Run code to perform action
  EXAMPLE_TRIGGER.get().trigger(player, stack);
}
```

## 成就奖励

当一个成就完成时，可能会给予奖励。这些奖励可以是经验点数、战利品表、食谱书中的食谱，或者作为创造者玩家执行的[函数]的组合。

```js
// In some advancement JSON
"rewards": {
  "experience": 10,
  "loot": [
    "minecraft:example_loot_table",
    "minecraft:example_loot_table2"
    // ...
  ],
  "recipes": [
    "minecraft:example_recipe",
    "minecraft:example_recipe2"
    // ...
  ],
  "function": "minecraft:example_function"
}
```

[datapack]: https://minecraft.wiki/w/Data_pack
[wiki]: https://minecraft.wiki/w/Advancement/JSON_format
[conditional]: ./conditional.md#implementations
[function]: https://minecraft.wiki/w/Function_(Java_Edition)
[triggers]: https://minecraft.wiki/w/Advancement/JSON_format#List_of_triggers
[datagen]: ../../datagen/server/advancements.md#advancement-generation
[codec]: ../../datastorage/codecs.md
[registration]: ../../concepts/registries.md#methods-for-registering
[serialize]: #serialization
