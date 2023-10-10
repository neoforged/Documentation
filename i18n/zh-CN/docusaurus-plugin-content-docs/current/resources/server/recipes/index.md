配方
====

配方是一种将一定数量的对象转换为Minecraft世界中其他对象的方法。尽管原版系统纯粹处理物品转换，但整个系统可以扩展为使用程序员创建的任何对象。

由数据驱动的配方
-----------------

原版中的大多数配方实现都是通过JSON进行数据驱动的。这意味着创建新配方不需要模组，只需要[数据包][datapack]。关于如何创建这些配方并将其放入模组的`resources`文件夹的完整列表可以在[Minecraft Wiki][wiki]上找到。

可以在配方书中获得配方，作为完成[进度][advancement]的奖励。配方进度总是以`minecraft:recipes/root`为其父项，以免出现在进度屏幕上。获得配方进度的默认标准是检查用户是否已通过一次使用解锁配方或通过某个如`/recipe`的命令接收配方：

```js
// 在某个配方进度json中
"has_the_recipe": { // 条件标签
  // 如果examplemod:example_recipe被使用，则成功
  "trigger": "minecraft:recipe_unlocked",
  "conditions": {
    "recipe": "examplemod:example_recipe"
  }
}
//...
"requirements": [
  [
    "has_the_recipe"
    // ... 解锁配方所需的其他用逻辑或相连的条件标签
  ]
]
```

由数据驱动的配方及其解锁的进度可以通过`RecipeProvider`[生成][datagen]。

配方管理器
-----------

配方是通过`RecipeManager`加载和存储的。任何与获取可用配方相关的操作都由该管理器负责。有两种重要的方法需要了解：

 方法           | 描述
 :---:          | :---
`getRecipeFor`  | 获取与当前输入匹配的第一个配方。
`getRecipesFor` | 获取与当前输入匹配的所有配方。

每个方法都接受一个`RecipeType`，表示使用配方的方法（合成、烧炼等），一个保存输入配置的`Container`，以及与容器一起传递给`Recipe#matches`的当前存档。

!!! 重要
    Forge提供了`RecipeWrapper`实用类，该类扩展了`Container`，用于包装`IItemHandler`，并将其传递给需要`Container`参数的方法。

    ```java
    // 在具有IItemHandlerModifiable处理器的某给方法中
    recipeManger.getRecipeFor(RecipeType.CRAFTING, new RecipeWrapper(handler), level);
    ```

附加特性
--------

Forge为配方纲要及其实现提供了一些额外的行为，以更好地控制系统。

### 配方的ItemStack结果

除了`minecraft:stonecutting`配方外，所有原版配方序列化器都会扩展`result`标签，以将完整的`ItemStack`作为`JsonObject`，而不是在某些情况下仅仅是物品名称和数量。

```js
// 在某个配方JSON中
"result": {
  // 要作为结果提供的注册表物品的名称
  "item": "examplemod:example_item",
  // 要返回的物品数量
  "count": 4,
  // 物品栈的标签数据，也可以是一个字符串
  "nbt": {
      // 在此处添加标签数据
  }
}
```

:::caution
    `nbt`标签也可以是一个字符串，其中包含无法正确表示为JSON对象（如`IntArrayTag`）的数据的字符串化NBT（或SNBT）。
:::

### 条件性配方

配方及其所解锁的进度可以[有条件地加载和保持默认][conditional]，具体取决于存在的信息（模组的被加载、物品的存在等）。

### 更大的合成网格

默认情况下，原版声明合成网格的最大宽度和高度为3x3正方形。这可以通过在`FMLCommonSetupEvent`中使用新的宽度和高度调用`ShapedRecipe#setCraftingSize`来扩展。

:::danger
    `ShapedRecipe#setCraftingSize`**不**是线程安全的。因此，它应该通过`FMLCommonSetupEvent#enqueueWork`排入同步工作队列。
:::

配方中较大的合成网格可以是[数据生成的][datagen]。

### 原料类型

一些额外的[原料类型][ingredients]被添加，以允许配方具有检查标签数据或将多种原料组合到单个输入检查器中的输入。

[datapack]: https://minecraft.fandom.com/wiki/Data_pack
[wiki]: https://minecraft.fandom.com/wiki/Recipe
[advancement]: ../advancements.md
[datagen]: ../../../datagen/server/recipes.md
[cap]: ../../../datastorage/capabilities.md
[conditional]: ../conditional.md#implementations
[ingredients]: ./ingredients.md#forge-types
