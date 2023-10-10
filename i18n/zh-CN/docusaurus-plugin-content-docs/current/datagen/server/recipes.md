配方生成
========

可以通过子类化`RecipeProvider`并实现`#buildRecipes`来为模组生成配方。一旦Consumer接受`FinishedRecipe`视图，就会提供一个用于生成数据的配方。`FinishedRecipe`既可以手动创建和提供，也可以为方便起见，使用`RecipeBuilder`创建。

实现后，该提供者必须被[添加][datagen]到`DataGenerator`。

```java
// 在模组事件总线上
@SubscribeEvent
public void gatherData(GatherDataEvent event) {
    event.getGenerator().addProvider(
        // 告诉生成器仅在生成服务端资源时运行
        event.includeServer(),
        MyRecipeProvider::new
    );
}
```

`RecipeBuilder`
---------------

`RecipeBuilder`是一个方便的实现，用于创建要生成的`FinishedRecipe`。它提供了解锁、分组、保存和获取配方结果的基本定义。这分别通过`#unlockedBy`、`#group`、`#save`和`#getResult`来完成。

!!! 重要
    原版配方生成器中不支持配方中的[`ItemStack`输出][stack]。对于现有的原版配方序列化器，必须以不同的方式构建`FinishedRecipe`才能生成此数据。

!!! 警告
    正在生成的物品结果必须指定有效的`RecipeCategory`；否则，将引发`NullPointerException`。

除[`SpecialRecipeBuilder`]外的所有配方构建器都需要指定一个进度标准。如果玩家以前使用过配方，则所有配方都会生成解锁配方的标准。然而，必须指定一个额外的标准，允许玩家在没有任何先验知识的情况下获得配方。如果指定的任何标准为真，则玩家将获得配方书的配方。

!!! 提示
    配方标准通常使用`InventoryChangeTrigger`在用户物品栏中存在某些物品时解锁配方。

### ShapedRecipeBuilder

`ShapedRecipeBuilder`用于生成有序配方。该生成器可以通过`#shaped`进行初始化。保存前可以指定配方组、输入符号模式、配料的符号定义和配方解锁条件。

```java
// 在RecipeProvider#buildRecipes(writer)中
ShapedRecipeBuilder builder = ShapedRecipeBuilder.shaped(RecipeCategory.MISC, result)
  .pattern("a a") // 创建配方图案
  .define('a', item) // 定义符号代表什么
  .unlockedBy("criteria", criteria) // 该配方如何解锁
  .save(writer); // 将数据加入生成器
```

#### 附加验证检查

有序配方在构建前进行了一些额外的验证检查：

* 图案必须被定义且接受多于一个物品。
* 所有图案行的宽度必须相同。
* 一个符号不能被定义多次。
* 空格字符（`' '`）被保留用于表示格中无物品，因此无法被定义。
* 图案必须使用用户定义的全部符号。

### ShapelessRecipeBuilder

`ShapelessRecipeBuilder`用于生成无序配方。该生成器可以通过`#shapeless`进行初始化。保存前可以指定配方组、输入原料和配方解锁条件。

```java
// 在RecipeProvider#buildRecipes(writer)中
ShapelessRecipeBuilder builder = ShapelessRecipeBuilder.shapeless(RecipeCategory.MISC, result)
  .requires(item) // 将物品加入配方
  .unlockedBy("criteria", criteria) // 该配方如何解锁
  .save(writer); // 将数据加入生成器
```

### SimpleCookingRecipeBuilder

`SimpleCookingRecipeBuilder`用于生成熔炼、高炉熔炼、烟熏和篝火烹饪配方。此外，使用`SimpleCookingSerializer`的自定义烹饪配方也可以是使用该生成器生成的数据。生成器可以分别通过`#smelting`、`#blasting`、`#smoking`、`#campfireCooking`或`#cooking`进行初始化。保存前可以指定配方组和配方解锁条件。

```java
// 在RecipeProvider#buildRecipes(writer)中
SimpleCookingRecipeBuilder builder = SimpleCookingRecipeBuilder.smelting(input, RecipeCategory.MISC, result, experience, cookingTime)
  .unlockedBy("criteria", criteria) // 该配方如何解锁
  .save(writer); // 将数据加入生成器
```

### SingleItemRecipeBuilder

`SingleItemRecipeBuilder`用于生成切石配方。此外，使用类似`SingleItemRecipe$Serializer`的序列化器的自定义但物品配方也可以是使用该生成器生成的数据。生成器可以分别通过`#stonecutting`或通过构造函数进行初始化。保存前可以指定配方组和配方解锁条件。

```java
// 在RecipeProvider#buildRecipes(writer)中
SingleItemRecipeBuilder builder = SingleItemRecipeBuilder.stonecutting(input, RecipeCategory.MISC, result)
  .unlockedBy("criteria", criteria) // 该配方如何解锁
  .save(writer); // 将数据加入生成器
```

非`RecipeBuilder`生成器
-----------------------

由于缺少前面提到的所有配方所使用的功能，一些配方生成器没有实现`RecipeBuilder`。

### SmithingTransformRecipeBuilder

`SmithingTransformRecipeBuilder`用于生成转换物品的锻造配方。此外，使用序列化器（如`SmithingTransformRecipe$Serializer`）的自定义配方也可以是使用此生成器生成的数据。生成器可以分别通过`#smithing`或通过构造函数进行初始化。保存前可以指定配方解锁条件。

```java
// 在RecipeProvider#buildRecipes(writer)中
SmithingTransformRecipeBuilder builder = SmithingTransformRecipeBuilder.smithing(template, base, addition, RecipeCategory.MISC, result)
  .unlocks("criteria", criteria) // 该配方如何解锁
  .save(writer, name); // 将数据加入生成器
```

### SmithingTrimRecipeBuilder

`SmithingTrimRecipeBuilder`用于生成盔甲装饰的锻造配方。此外，使用类似`SmithingTrimRecipe$Serializer`的序列化器的自定义升级配方也可以是使用该生成器生成的数据。生成器可以分别通过`#smithingTrim`或通过构造函数进行初始化。保存前可以指定配方解锁条件。

```java
// 在RecipeProvider#buildRecipes(writer)中
SmithingTrimRecipe builder = SmithingTrimRecipe.smithingTrim(template, base, addition, RecipeCategory.MISC)
  .unlocks("criteria", criteria) // 该配方如何解锁
  .save(writer, name); // 将数据加入生成器
```

### SpecialRecipeBuilder

`SpecialRecipeBuilder` is used to generate empty JSONs for dynamic recipes that cannot easily be constrained to the recipe JSON format (dying armor, firework, etc.). The builder can be initialized via `#special`.

```java
// 在RecipeProvider#buildRecipes(writer)中
SpecialRecipeBuilder.special(dynamicRecipeSerializer)
  .save(writer, name); // 将数据加入生成器
```

条件性配方
---------

[条件性配方][conditional]也可以是通过`ConditionalRecipe$Builder`生成的数据。生成器可以使用`#builder`获得。

每个配方的条件可以通过首先调用`#addCondition`，然后在指定所有条件后调用`#addRecipe`来指定。这个过程可以重复多次，只要程序员愿意。

在指定了所有配方后，可以在最后使用`#generateAdvancement`为每个配方添加进度。或者，可以使用`#setAdvancement`设置条件性进度。

```java
// 在RecipeProvider#buildRecipes(writer)中
ConditionalRecipe.builder()
  // 为该配方添加条件
  .addCondition(...)
  // 添加当条件为true时返回的配方
  .addRecipe(...)

  // 为下一个配方添加接下来的条件
  .addCondition(...)
  // 添加当条件为true时返回的下一个配方
  .addRecipe(...)

  // 创建条件性进度，其使用上面配方中的条件和所解锁的进度
  .generateAdvancement()
  .build(writer, name);
```

### IConditionBuilder

为了简化向条件配方添加条件而不必手动构造每个条件实例，扩展的`RecipeProvider`可以实现`IConditionBuilder`。该接口添加了可以轻松构造条件实例的方法。

```java
// 在ConditionalRecipe$Builder#addCondition中
(
  // 如果'examplemod:example_item'
  // 或（OR）'examplemod:example_item2'存在
  // 并且（AND）
  // 非FALSE（NOT FALSE）

  // Methods are defined by IConditionBuilder
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
-----------------

自定义配方序列化器可以是通过创建可以构造`FinishedRecipe`的生成器生成的数据。完成的配方将配方数据及其所解锁的进度（如果存在）编码为JSON。此外，还指定了配方的名称和序列化器，以了解在加载时向何处写入以及可以解码对象的内容。构造完`FinishedRecipe`后，只需将其传递给`RecipeProvider#buildRecipes`提供的`Consumer`。

!!! 提示
    `FinishedRecipe`足够灵活，任何对象转换都可以是数据生成的，而不仅仅是物品。

[datagen]: ../index.md#data-providers
[ingredients]: ../../resources/server/recipes/ingredients.md#forge-types
[stack]: ../../resources/server/recipes/index.md#recipe-itemstack-result
[conditional]: ../../resources/server/conditional.md
[special]: #specialrecipebuilder
