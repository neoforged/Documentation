原料
====

`Ingredient`是基于物品的输入的predicate处理器，用于检查某个`ItemStack`是否满足成为配方中有效输入的条件。所有接受输入的[原版配方][recipes]都使用`Ingredient`或`Ingredient`的列表，然后将其合并为单一的`Ingredient`。

自定义原料
---------

自定义原料可以通过将`type`设置为[原料的序列化器][serializer]的名称来指定，[复合原料][compound]除外。当没有指定类型时，`type`默认为原版原料`minecraft:item`。自定义原料也可以很容易地用于[数据生成][datagen]。

### Forge类型

Forge提供了一些额外的`Ingredient`类型供程序员实现。

#### CompoundIngredient

尽管它们在功能上是相同的，但复合原料取代了在配方中实现原料列表的方式。它们作为一个逻辑或（OR）集合工作，其中传入的物品栈必须至少在一个提供的原料中。进行此更改是为了允许自定义原料在列表中正确工作。因此，**无需指定类型**。

```js
// 对于某个输入
[
  // 这些原料中必须至少有一种必须匹配才能成功
  {
    // 原料
  },
  {
    // 自定义原料
    "type": "examplemod:example_ingredient"
  }
]
```

#### StrictNBTIngredient

`StrictNBTIngredient`比较`ItemStack`上的物品、耐久和共享标签（由`IForgeItem#getShareTag`定义），以保证确切的等效性。这可以通过将`type`指定为`forge:nbt`来使用。

```js
// 对于某个输入
{
  "type": "forge:nbt",
  "item": "examplemod:example_item",
  "nbt": {
    // 添加nbt数据（必须与物品栈上的数据完全匹配）
  }
}
```

### PartialNBTIngredient

`PartialNBTIngredient`是[`StrictNBTIngredient`][nbt]的宽松版本，因为它们与共享标签中指定的单个或一组物品以及仅键（由`IForgeItem#getShareTag`定义）进行比较。这可以通过将`type`指定为`forge:partial_nbt`来使用。

```js
// 对于某个输入
{
  "type": "forge:partial_nbt",

  // 'item'或'items'必须被指定
  // 如果都指定了，那么只有'item'会被读取
  "item": "examplemod:example_item",
  "items": [
    "examplemod:example_item",
    "examplemod:example_item2"
    // ...
  ],

  "nbt": {
    // 仅检查'key1'和'key2'的等效性
    // 不会检查物品栈中的所有其他键
    "key1": "data1",
    "key2": {
      // 数据2
    }
  }
}
```

### IntersectionIngredient

`IntersectionIngredient`工作为一个逻辑和（AND）集合，其中传入的物品必须与所有提供的原料匹配。必须至少提供两种原料。这可以通过将`type`指定为`forge:intersection`来使用。

```js
// 对于某个输入
{
  "type": "forge:intersection",

  // 所有这些原料都必须返回true才能成功
  "children": [
    {
      // 原料1
    },
    {
      // 原料2
    }
    // ...
  ]
}
```

### DifferenceIngredient

`DifferenceIngredient`工作为一个减法（SUB）集合，其中传入的物品栈必须与第一个原料匹配，但不能与第二个原料匹配。这可以通过将`type`指定为`forge:difference`来使用。

```js
// 对于某个输入
{
  "type": "forge:difference",
  "base": {
    // 该物品栈所存在的原料
  },
  "subtracted": {
    // 该物品栈所不存在的原料
  }
}
```

创建自定义原料
-------------

可以通过为创建的`Ingredient`子类实现`IIngredientSerializer`来创建自定义原料。

:::tip
    自定义原料应该是`AbstractIngredient`的子类，因为它提供了一些有用的抽象以便于实现。
:::

### 原料的子类

对于每个原料子类，有三种重要的方法需要实现：

 方法         | 描述
 :---:        | :---
getSerializer | 返回用于读取和写入原料的[serializer]。
test          | 如果输入对此原料有效，则返回true。
isSimple      | 如果原料与物品栈的标签匹配，则返回false。`AbstractIngredient`的子类需要定义此行为，而`Ingredient`子类默认返回true。

所有其他定义的方法都留给读者练习，以便根据原料子类的需要使用。

### IIngredientSerializer

`IIngredientSerializer`子类型必须实现三种方法：

 方法           | 描述
 :---:          | :---
parse (JSON)    | 将`JsonObject`转换为`Ingredient`。
parse (Network) | 返回用于解码`Ingredient`的网络缓冲区。
write           | 将一个`Ingredient`写入网络缓冲区。

此外，`Ingredient`子类应实现`Ingredient#toJson`，以便与[数据生成][datagen]一起使用。`AbstractIngredient`的子类使`#toJson`成为一个需要实现该方法的抽象方法。

之后，应声明一个静态实例来保存初始化的序列化器，然后在`RecipeSerializer`的`RegisterEvent`期间或在`FMLCommonSetupEvent`期间使用`CraftingHelper#register`进行注册。`Ingredient`子类在`Ingredient#getSerializer`中返回序列化器的静态实例。

```java
// 在某个序列化器类中
public static final ExampleIngredientSerializer INSTANCE = new ExampleIngredientSerializer();

// 在某个处理器类中
public void registerSerializers(RegisterEvent event) {
  event.register(ForgeRegistries.Keys.RECIPE_SERIALIZERS,
    helper -> CraftingHelper.register(registryName, INSTANCE)
  );
}

// 在某个原料类中
@Override
public IIngredientSerializer<? extends Ingredient> getSerializer() {
  return INSTANCE;
}
```

:::tip
    如果使用`FMLCommonSetupEvent`注册原料序列化器，则必须通过`FMLCommonSetupEvent#enqueueWork`将其排入同步工作队列，因为`CraftingHelper#register`不是线程安全的。
:::

[recipes]: https://minecraft.wiki/w/Recipe#List_of_recipe_types
[nbt]: #strictnbtingredient
[serializer]: #iingredientserializer
[compound]: #compoundingredient
[datagen]: ../../../datagen/server/recipes.md
