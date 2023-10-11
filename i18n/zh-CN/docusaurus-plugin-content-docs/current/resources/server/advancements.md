进度
====

进度是玩家可以实现的任务，可以推进游戏的进度。进度可以基于玩家可能直接参与的任何动作来触发。

原版中的所有进度实现都是通过JSON进行数据驱动的。这意味着模组不需要创建新的进度，只需要[数据包][datapack]。关于如何创建这些进度并将其放入模组的`resources`中的完整列表可以在[Minecraft Wiki][wiki]上找到。此外，进度可以[有条件加载和或保持默认][conditional]，这取决于存在的信息（模组被加载、物品的存在等）。

进度标准
--------

若要解锁一个进度，必须满足指定的标准。通过执行某个动作时执行的触发器来跟踪标准：杀死实体、更改物品栏、给动物喂食等。任何时候将进度加载到游戏中，定义的标准都会被读取并添加为触发器的监听器。然后调用一个触发器函数（通常称为`#trigger`），该函数检查所有监听器当前状态是否满足进度标准的条件。只有在通过完成所有条件获得进度后，才会删除进度的标准监听器。

需求被定义为包含字符串数组的一个数组，该数组表示在进度中指定的标准的名称。一旦满足一个字符串数组的条件，就完成了进度：

```js
// 在某个进度JSON中

// 所定义的要满足的标准的列表
"criteria": {
  "example_criterion1": { /*...*/ },
  "example_criterion2": { /*...*/ },
  "example_criterion3": { /*...*/ },
  "example_criterion4": { /*...*/ }
},

// 该进度只能解锁一次
// - 标准1和2均被满足
// 或
// - 标准3和4均被满足
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

原版定义的标准触发器列表可以在`CriteriaTriggers`中找到。此外，JSON格式是在[Minecraft Wiki][triggers]上定义的。

### 自定义标准触发器

可以通过为已创建的`AbstractCriterionTriggerInstance`子类实现`SimpleCriterionTrigger`来创建自定义条件触发器。

### AbstractCriterionTriggerInstance子类

`AbstractCriterionTriggerInstance`表示在`criteria`对象中定义的单个标准。触发器实例负责保存定义的条件，返回输入是否与条件匹配，并将实例写入JSON用于数据生成。

条件通常通过构造函数传递。`AbstractCriterionTriggerInstance`父级构造函数要求实例将触发器的注册表名和玩家必须满足的条件定义为`ContextAwarePredicate`。触发器的注册表名称应该直接提供给父级，而玩家的条件应该是构造函数参数。

```java
// 其中ID是该触发器的注册表名称
public ExampleTriggerInstance(ContextAwarePredicate player, ItemPredicate item) {
  super(ID, player);
  // 存储必须满足的物品条件
}
```

:::caution
    通常，触发器实例有一个静态构造函数，允许轻松创建这些实例以生成数据。这些静态工厂方法也可以静态导入，而不是类本身。

    ```java
    public static ExampleTriggerInstance instance(ContextAwarePredicate player, ItemPredicate item) {
      return new ExampleTriggerInstance(player, item);
    }
    ```
:::

此外，应该重写`#serializeToJson`方法。该方法应该将实例的条件添加到其他JSON数据中。

```java
@Override
public JsonObject serializeToJson(SerializationContext context) {
  JsonObject obj = super.serializeToJson(context);
  // 将条件写入json中
  return obj;
}
```

最后，应该添加一个方法，该方法接受当前数据状态并返回用户是否满足必要条件。玩家的条件已经通过`SimpleCriterionTrigger#trigger(ServerPlayer, Predicate)`进行了检查。大多数触发器实例称这个方法为`#matches`。

```java
// 此方法对于每个实例都是唯一的，因此不会被重写
public boolean matches(ItemStack stack) {
  // 由于ItemPredicate与一个物品栈匹配，因此一个物品栈是输入
  return this.item.matches(stack);
}
```

### SimpleCriterionTrigger

`SimpleCriterionTrigger<T>`子类，其中`T`是触发器实例的类型，负责指定触发器的注册表名、创建触发器实例以及检查触发器实例和在成功时运行附加监听器的方法。

触发器的注册表名称被提供给`#getId`。这应该与提供给触发器实例的注册表名称相匹配。

触发器实例是通过`#createInstance`创建的。此方法从JSON中读取一个标准。

```java
@Override
public ExampleTriggerInstance createInstance(JsonObject json, ContextAwarePredicate player, DeserializationContext context) {
  // 从JSON中读取条件：item
  return new ExampleTriggerInstance(player, item);
}
```

最后，定义了一个方法来检查所有触发器实例，并在满足它们的条件时运行监听器。此方法接受`ServerPlayer`和`AbstractCriterionTriggerInstance`子类中匹配的方法定义的任何其他数据。此方法应在内部调用`SimpleCriterionTrigger#trigger`以正确处理检查所有监听器。大多数触发器实例从称这个方法为`#trigger`。

```java
// 此方法对于每个触发器都是唯一的，因此不会被重写
public void trigger(ServerPlayer player, ItemStack stack) {
  this.trigger(player,
    // AbstractCriterionTriggerInstance子类中的条件检查器方法
    triggerInstance -> triggerInstance.matches(stack)
  );
}
```

之后，应在`FMLCommonSetupEvent`期间使用`CriteriaTriggers#register`注册实例。

!!! 重要
    `CriteriaTriggers#register`必须通过`FMLCommonSetupEvent#enqueueWork`排入同步工作队列，因为该方法不是线程安全的。

### 触发器的调用

每当执行被检查的操作时，都应该调用`SimpleCriterionTrigger`子类定义的`#trigger`方法。

```java
// 在执行操作的某段代码中
// 其中EXAMPLE_CRITERIA_TRIGGER是自定义标准触发器
public void performExampleAction(ServerPlayer player, ItemStack stack) {
  // 运行代码以执行操作
  EXAMPLE_CRITERIA_TRIGGER.trigger(player, stack);
}
```

进度奖励
--------

当进度达成时，可以给予奖励。其可以是经验点数、战利品表、配方书的配方的组合，也可以是作为创造模式玩家执行的[函数][function]。

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
