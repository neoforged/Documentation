配方
=======

配方是一种在Minecraft世界中将一些对象转换为其他对象的方式。虽然原版系统纯粹处理的是物品转换，但整个系统可以扩展，以使用程序员创建的任何对象。

基于数据的配方
-------------------

在原版中，大多数配方的实现都是通过JSON进行数据驱动的。这意味着不需要一个mod就可以创建一个新的配方，只需要一个[数据包][datapack]。如何在mod的`resources`文件夹中创建这些配方并放入其中的完整列表可以在[Minecraft Wiki][wiki]上找到。

可以在配方书中作为完成[进度][advancement]的奖励获取配方。配方进度总是以`minecraft:recipes/root`作为其父级，以避免在进度界面上显示。获得配方进度的默认条件是检查用户是否已经通过一次使用或通过如`/recipe`命令接收它，从而解锁了配方：

```js
// 在某个配方进度json中
"has_the_recipe": { // 条件标签
  // 如果使用了examplemod:example_recipe则成功
  "trigger": "minecraft:recipe_unlocked",
  "conditions": {
    "recipe": "examplemod:example_recipe"
  }
}
//...
"requirements": [
  [
    "has_the_recipe"
    // ... 解锁配方的其它要求标签对OR运算
  ]
]
```

基于数据的配方及其解锁的进度可以通过`RecipeProvider`[生成][datagen]。

配方管理器
--------------

配方是通过`RecipeManager`加载和存储的。任何与获取可用配方相关的操作都由此管理器处理。有两个重要的方法需要了解：

  方法             | 描述
 :---:            | :---
`getRecipeFor`    | 获取与当前输入匹配的第一个配方。
`getRecipesFor`   | 获取与当前输入匹配的所有配方。

每种方法都需要一个`RecipeType`，它表示正在采用什么方法使用配方（合成，熔炼等），一个`Container`，它保存了输入的配置，以及当前的等级，这个等级与容器一起传递给了`Recipe#matches`。

:::tip
Forge提供了`RecipeWrapper`实用类，它扩展了`Container`，用于包装围绕`IItemHandler`的对象，并将它们传递给需要`Container`参数的方法。

```java
// 在具有IItemHandlerModifiable handler的某个方法中
recipeManger.getRecipeFor(RecipeType.CRAFTING, new RecipeWrapper(handler), level);
```
:::

额外特性
-------------------

Forge对配方模式及其实现提供了一些额外的行为，以更好地控制系统。

### 配方的ItemStack结果

除了`minecraft:stonecutting`配方外，所有的原版配方序列化器都将`result`标签扩展为一个完整的`ItemStack`作为`JsonObject`，而不仅仅是在某些情况下的物品名称和数量。

```js
// 在某个配方JSON中
"result": {
  // 给出结果的注册物品的名称
  "item": "examplemod:example_item",
  // 返回的物品数量
  "count": 4,
  // 堆叠的标签数据，也可以是一个字符串
  "nbt": {
      // 在此添加标签数据
  }
}
```

:::note
`nbt`标签也可以是一个包含字符串化NBT（或SNBT）的字符串，用于无法正确表示为JSON对象的数据（如`IntArrayTag`）。
:::

### 条件配方

配方及其解锁的进度可以根据存在的信息（已加载的mod，存在的物品等）[有条件地加载和默认][conditional]。

### 更大的合成网格

默认情况下，原版声明了合成网格的最大宽度和高度为3x3的正方形。这可以通过在`FMLCommonSetupEvent`中调用`ShapedRecipe#setCraftingSize`并设定新的宽度和高度来扩展。

:::caution
`ShapedRecipe#setCraftingSize`是**不**线程安全的。因此，它应该通过`FMLCommonSetupEvent#enqueueWork`被加入到同步工作队列中。
:::

大的合成网格在配方中可以[生成数据][datagen]。

### 配料类型

添加了一些额外的[配料类型][ingredients]，以允许配方具有检查标签数据或将多个配料合并到一个输入检查器中。

[datapack]: https://minecraft.wiki/w/Data_pack
[wiki]: https://minecraft.wiki/w/Recipe
[advancement]: ../advancements.md
[datagen]: ../../../datagen/server/recipes.md
[conditional]: ../conditional.md#implementations
[ingredients]: ./ingredients.md#forge-types