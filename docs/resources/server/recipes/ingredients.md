配料
===========

`Ingredient`是针对基于物品的输入的谓词处理器，它检查某个`ItemStack`是否满足作为配方有效输入的条件。所有采用输入的[原版配方][recipes]都使用一个`Ingredient`或一系列`Ingredient`，然后合并为一个单一的`Ingredient`。

自定义配料
------------------

可以通过将`type`设置为[配料序列化器][serializer]的名称来指定自定义配料，[复合配料][compound]除外。当未指定类型时，`type`默认为原版配料`minecraft:item`。自定义配料也可以轻松地用于[数据生成][datagen]。

### Forge 类型

Forge为程序员提供了一些额外的`Ingredient`类型。

#### CompoundIngredient

虽然它们在功能上是相同的，但复合配料替换了在配方中实现配料列表的方式。它们作为一个集合OR操作，传入的堆叠必须至少在提供的配料中的一个中。这个更改是为了让自定义配料能在列表中正常工作。因此，**无需**指定类型。

```js
// For some input
[
  // At least one of these ingredients must match to succeed
  {
    // Ingredient
  },
  {
    // Custom ingredient
    "type": "examplemod:example_ingredient"
  }
]
```

#### StrictNBTIngredient

`StrictNBTIngredient`会比较`ItemStack`上的物品、损坏和共享标签（由`IForgeItem#getShareTag`定义）以确保完全等价。这可以通过将`type`指定为`forge:nbt`来使用。

```js
// For some input
{
  "type": "forge:nbt",
  "item": "examplemod:example_item",
  "nbt": {
    // Add nbt data (must match exactly what is on the stack)
  }
}
```

### PartialNBTIngredient

`PartialNBTIngredient`是[`StrictNBTIngredient`][nbt]的一个更宽松的版本，因为它们只比较一个或一组物品，并且只比较在共享标签（由`IForgeItem#getShareTag`定义）中指定的键。这可以通过将`type`指定为`forge:partial_nbt`来使用。

```js
// For some input
{
  "type": "forge:partial_nbt",

  // Either 'item' or 'items' must be specified
  // If both are specified, only 'item' will be read
  "item": "examplemod:example_item",
  "items": [
    "examplemod:example_item",
    "examplemod:example_item2"
    // ...
  ],

  "nbt": {
    // Checks only for equivalency on 'key1' and 'key2'
    // All other keys in the stack will not be checked
    "key1": "data1",
    "key2": {
      // Data 2
    }
  }
}
```

### IntersectionIngredient

`IntersectionIngredient`作为一个集合AND操作，传入的堆叠必须匹配所有提供的配料。至少必须向此提供两种配料。这可以通过将`type`指定为`forge:intersection`来使用。

```js
// For some input
{
  "type": "forge:intersection",

  // All of these ingredients must return true to succeed
  "children": [
    {
      // Ingredient 1
    },
    {
      // Ingredient 2
    }
    // ...
  ]
}
```

### DifferenceIngredient

`DifferenceIngredient`作为一个集合减法（SUB）操作，传入的堆叠必须匹配第一个配料，但不得匹配第二个配料。这可以通过将`type`指定为`forge:difference`来使用。

```js
// For some input
{
  "type": "forge:difference",
  "base": {
    // Ingredient the stack is in
  },
  "subtracted": {
    // Ingredient the stack is NOT in
  }
}
```

创建自定义配料
---------------------------

可以通过为创建的`Ingredient`子类实现`IIngredientSerializer`来创建自定义配料。

:::提示
自定义配料应该子类化`AbstractIngredient`，因为它为实施提供了一些有用的抽象。
:::

### Ingredient子类

每个配料子类要实施三个重要的方法：

 方法       | 描述
 :---:        | :---
getSerializer | 返回用于读写配料的[序列化器]。
test         | 如果输入对于这个配料是有效的，返回true。
isSimple     | 如果配料匹配堆栈的标签，则返回false。`AbstractIngredient`子类需要定义这种行为，而`Ingredient`子类默认返回`true`。

所有其他定义的方法留给读者根据需要使用配料子类。

### IIngredientSerializer

`IIngredientSerializer`子类型必须实现三个方法：

 方法         | 描述
 :---:          | :---
parse (JSON)    | 将`JsonObject`转化为`Ingredient`。
parse (Network) | 读取网络缓冲区以解码一个`Ingredient`。
write           | 将一个`Ingredient`写入网络缓冲区。

此外，`Ingredient`子类应该实现`Ingredient#toJson`以用于[data generation][datagen]。`AbstractIngredient`子类将`#toJson`设置为抽象方法，要求实现该方法。

然后，应声明一个静态实例来保存初始化的序列化器，然后使用`CraftingHelper#register`在`RecipeSerializer`的`RegisterEvent`或`FMLCommonSetupEvent`期间注册。`Ingredient`子类在`Ingredient#getSerializer`中返回序列化器的静态实例。

```java
// In some serializer class
public static final ExampleIngredientSerializer INSTANCE = new ExampleIngredientSerializer();

// In some handler class
public void registerSerializers(RegisterEvent event) {
  event.register(ForgeRegistries.Keys.RECIPE_SERIALIZERS,
    helper -> CraftingHelper.register(registryName, INSTANCE)
  );
}

// In some ingredient subclass
@Override
public IIngredientSerializer<? extends Ingredient> getSerializer() {
  return INSTANCE;
}
```

:::tip
如果使用`FMLCommonSetupEvent`来注册配料序列化器，必须通过`FMLCommonSetupEvent#enqueueWork`将其加入到同步工作队列，因为`CraftingHelper#register`不是线程安全的。
:::

[recipes]: https://minecraft.wiki/w/Recipe#List_of_recipe_types
[nbt]: #strictnbtingredient
[serializer]: #iingredientserializer
[compound]: #compoundingredient
[datagen]: ../../../datagen/server/recipes.md
