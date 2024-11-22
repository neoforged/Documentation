配方生成
=================

可以通过继承 `RecipeProvider` 并实现 `#buildRecipes` 来为模组生成配方。一旦消费者接受了 `FinishedRecipe` 视图，就会为数据生成提供配方。 `FinishedRecipe` 可以手动创建和提供，或者为方便起见，使用 `RecipeBuilder` 创建。

实现后，必须将提供者[添加][datagen]到 `DataGenerator`。

```java
// 在MOD事件总线上
@SubscribeEvent
public void gatherData(GatherDataEvent event) {
    event.getGenerator().addProvider(
        // 告诉生成器只在服务器数据生成时运行
        event.includeServer(),
        MyRecipeProvider::new
    );
}
```

`RecipeBuilder`
---------------

`RecipeBuilder` 是创建 `FinishedRecipe` 以便于生成的便利实现。它提供了解锁、分组、保存和获取配方结果的基本定义。分别通过 `#unlockedBy`、 `#group`、 `#save` 和 `#getResult` 实现。

:::important
在原生配方构建器中不支持配方的 [`ItemStack` 输出][stack]。必须以不同的方式构建 `FinishedRecipe`，以便现有的原生配方序列化器可以生成这些数据。
:::

:::warning
正在生成的物品结果必须有一个有效的 `RecipeCategory` 指定，否则会抛出 `NullPointerException`。
:::

除了 [`SpecialRecipeBuilder`]，所有的配方构建器都需要指定一个进步条件。所有的配方都会生成一个条件，如果玩家之前使用过这个配方，就会解锁这个配方。然而，必须指定一个额外的条件，允许玩家在没有任何先验知识的情况下获取到配方。如果指定的任何一个条件为真，那么玩家就会在配方书中获取到配方。

:::tip
配方条件通常使用 `InventoryChangeTrigger` 来在用户的库存中存在某些物品时解锁配方。
:::

### ShapedRecipeBuilder

`ShapedRecipeBuilder` 用于生成有形状的配方。构建器可以通过 `#shaped` 初始化。可以在保存之前指定配方组、输入符号模式、成分的符号定义和配方解锁条件。

```java
// 在 RecipeProvider#buildRecipes(writer) 中
ShapedRecipeBuilder builder = ShapedRecipeBuilder.shaped(RecipeCategory.MISC, result)
  .pattern("a a") // 创建配方模式
  .define('a', item) // 定义符号代表的物品
  .unlockedBy("criteria", criteria) // 配方的解锁方式
  .save(writer); // 将数据添加到构建器中
```

#### 额外的验证检查

在构建之前，有形状的配方会进行一些额外的验证检查：

* 必须定义一个模式，并且需要输入超过一个物品。
* 所有模式行的宽度必须相同。
* 一个符号不能被定义多次。
* 空格字符 (`' '`) 是为了表示插槽中没有物品而保留的，因此不能被定义。
* 模式必须使用用户定义的所有符号。

### ShapelessRecipeBuilder

`ShapelessRecipeBuilder` 用于生成无形状的配方。可以通过 `#shapeless` 初始化构建器。在保存之前，可以指定配方组、输入成分和配方解锁条件。

```java
// 在 RecipeProvider#buildRecipes(writer) 中
ShapelessRecipeBuilder builder = ShapelessRecipeBuilder.shapeless(RecipeCategory.MISC, result)
  .requires(item) // 将物品添加到配方中
  .unlockedBy("criteria", criteria) // 配方的解锁方式
  .save(writer); // 将数据添加到构建器中
```

### SimpleCookingRecipeBuilder

`SimpleCookingRecipeBuilder` 用于生成熔炼、爆炸、烟熏和营火烹饪配方。此外，使用 `SimpleCookingSerializer` 的自定义烹饪配方也可以使用这个构建器进行数据生成。可以分别通过 `#smelting`、 `#blasting`、 `#smoking`、 `#campfireCooking` 或 `#cooking` 初始化构建器。在保存之前，可以指定配方组和配方解锁条件。

```java
// 在 RecipeProvider#buildRecipes(writer) 中
SimpleCookingRecipeBuilder builder = SimpleCookingRecipeBuilder.smelting(input, RecipeCategory.MISC, result, experience, cookingTime)
  .unlockedBy("criteria", criteria) // 配方的解锁方式
  .save(writer); // 将数据添加到构建器中
```

### SingleItemRecipeBuilder

`SingleItemRecipeBuilder` 用于生成石切配方。此外，使用类似 `SingleItemRecipe$Serializer` 的序列化器的自定义单物品配方也可以使用这个构建器进行数据生成。可以通过 `#stonecutting` 或者构造函数分别初始化构建器。在保存之前，可以指定配方组和配方解锁条件。

```java
// 在 RecipeProvider#buildRecipes(writer) 中
SingleItemRecipeBuilder builder = SingleItemRecipeBuilder.stonecutting(input, RecipeCategory.MISC, result)
  .unlockedBy("criteria", criteria) // 配方的解锁方式
  .save(writer); // 将数据添加到构建器中
```

非 `RecipeBuilder` 构建器
----------------------------

一些配方构建器由于缺少所有先前提到的配方使用的功能而不实现 `RecipeBuilder`。

### SmithingTransformRecipeBuilder

`SmithingTransformRecipeBuilder` 用于生成将物品转化的铁匠配方。此外，使用类似 `SmithingTransformRecipe$Serializer` 的序列化器的自定义配方也可以使用这个构建器进行数据生成。可以通过 `#smithing` 或者构造函数分别初始化构建器。在保存之前，可以指定配方解锁条件。

```java
// 在 RecipeProvider#buildRecipes(writer) 中
SmithingTransformRecipeBuilder builder = SmithingTransformRecipeBuilder.smithing(template, base, addition, RecipeCategory.MISC, result)
  .unlocks("criteria", criteria) // 配方的解锁方式
  .save(writer, name); // 将数据添加到构建器中
```

### SmithingTrimRecipeBuilder

`SmithingTrimRecipeBuilder` 用于生成用于装甲修剪的铁匠配方。此外，使用类似 `SmithingTrimRecipe$Serializer` 的序列化器的自定义升级配方也可以使用这个构建器进行数据生成。可以通过 `#smithingTrim` 或者构造函数分别初始化构建器。在保存之前，可以指定配方解锁条件。

```java
// 在 RecipeProvider#buildRecipes(writer) 中
SmithingTrimRecipe builder = SmithingTrimRecipe.smithingTrim(template, base, addition, RecipeCategory.MISC)
  .unlocks("criteria", criteria) // 配方的解锁方式
  .save(writer, name); // 将数据添加到构建器中
```

### SpecialRecipeBuilder

`SpecialRecipeBuilder` 用于为不能轻易约束到配方 JSON 格式（如染色护甲、焰火等）的动态配方生成空的 JSON。可以通过 `#special` 初始化构建器。

```java
// 在 RecipeProvider#buildRecipes(writer) 中
SpecialRecipeBuilder.special(dynamicRecipeSerializer)
  .save(writer, name); // 将数据添加到构建器中
```
条件性配方
-------------------

[条件性配方][conditional] 也可以通过 `ConditionalRecipe$Builder` 进行数据生成。可以使用 `#builder` 获取构建器。

可以先调用 `#addCondition` 来指定每个配方的条件，然后在所有条件都指定后调用 `#addRecipe`。这个过程可以重复多次，由程序员自行决定。

在所有配方都指定之后，可以在最后使用 `#generateAdvancement` 为每个配方添加进步（advancements）。或者，可以使用 `#setAdvancement` 设置条件性进步。

```java
// 在 RecipeProvider#buildRecipes(writer) 中
ConditionalRecipe.builder()
  // 添加配方的条件
  .addCondition(...)
  // 当条件为真时返回配方
  .addRecipe(...)

  // 添加下一个配方的条件
  .addCondition(...)
  // 当下一个条件为真时返回下一个配方
  .addRecipe(...)

  // 创建使用上述配方中的条件和解锁进步的条件性进步
  .generateAdvancement()
  .build(writer, name);
```

### IConditionBuilder

为了简化向条件性配方添加条件，而不必手动构造每个条件实例，扩展的 `RecipeProvider` 可以实现 `IConditionBuilder`。接口添加了轻松构造条件实例的方法。

```java
// 在 ConditionalRecipe$Builder#addCondition 中
(
  // 如果 'examplemod:example_item'
  // 或者 'examplemod:example_item2' 存在
  // 并且
  // 非FALSE

  // 方法由 IConditionBuilder 定义
  and( 
    or(
      itemExists("examplemod", "example_item"),
      itemExists("examplemod", "example_item2")
    ),
    not(
      FALSE()
    )
  )
)
```

自定义配方序列化器
-------------------------

通过创建一个可以构造 `FinishedRecipe` 的构建器，可以数据生成自定义配方序列化器。完成的配方将配方数据编码为JSON，并在存在时将其解锁进步也编码为JSON。此外，还需要指定配方的名称和序列化器，以知道写入位置以及加载时能解码对象的内容。一旦构造了 `FinishedRecipe`，只需将其传递给 `RecipeProvider#buildRecipes` 提供的 `Consumer`。

:::tip
`FinishedRecipe` 足够灵活，可以数据生成任何对象转换，不仅仅是物品。
:::

[datagen]: ../index.md#data-providers
[ingredients]: ../../resources/server/recipes/ingredients.md#forge-types
[stack]: ../../resources/server/recipes/index.md#recipe-itemstack-result
[conditional]: ../../resources/server/conditional.md
[special]: #specialrecipebuilder
