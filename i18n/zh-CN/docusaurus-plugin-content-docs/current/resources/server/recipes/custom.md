自定义配方
=========

每个配方定义都由三个组件组成：`Recipe`实现，它保存数据并用所提供的输入处理执行逻辑，`RecipeType`表示配方将用于的类别或上下文，以及`RecipeSerializer`，它处理配方数据的解码和网络通信。如何选择使用配方取决于实施者。

配方
----

`Recipe`接口描述配方数据和执行逻辑。这包括匹配输入并提供相关联的结果。由于配方子系统默认执行物品转换，因此输入是通过`Container`子类型提供的。

!!! 重要
    传递到配方中的`Container`应被视为其内容是不可变的。任何可变操作都应该通过`ItemStack#copy`对输入的一份副本执行。

为了能够从管理器获得配方实例，`#matches`必须返回true。此方法根据提供的容器进行检查，以查看相关联的输入是否有效。`Ingredient`可以通过调用`Ingredient#test`进行验证。

如果已经选择了配方，则使用`#assemble`构建配方，该`#assemble`可以使用来自输入的数据来创建结果。

:::tip
    `#assemble`应始终生成唯一的”`ItemStack`。如果不确定`#assemble`是否执行此操作，请在返回之前对结果调用`ItemStack#copy`。
:::

大多数其他方法纯粹是为了与配方相结合。

```java
public record ExampleRecipe(Ingredient input, int data, ItemStack output) implements Recipe<Container> {
  // 在此处实现方法
}
```

:::caution
    虽然在上面的示例中使用了一个记录，但在你自己的实现中不需要这样做。
:::

RecipeType
----------

`RecipeType`负责定义配方将在其中使用的类别或上下文。例如，如果一个配方要在熔炉中熔炼，它的类型将是`RecipeType#BLASTING`。在高炉中进行熔炼的类型为`RecipeType#BLASTING`。

如果现有类型中没有一个与配方将在其中使用的上下文匹配，则必须[注册][forge]一个新的`RecipeType`。

`RecipeType`实例必须由新配方子类型中的`Recipe#getType`返回。

```java
// 对于某个RegistryObject<RecipeType> EXAMPLE_TYPE
// 在ExampleRecipe中
@Override
public RecipeType<?> getType() {
  return EXAMPLE_TYPE.get();
}
```

RecipeSerializer
----------------

`RecipeSerializer`负责解码JSON，并通过网络为关联的`Recipe`子类型进行通信。序列化器解码的每个配方都保存为`RecipeManager`中的唯一实例。`RecipeSerializer`必须[已被注册][forge]。

`RecipeSerializer`只需要实现三个方法：

 方法       | 描述
 :---:      | :---
fromJson    | 将JSON解码为`Recipe`子类型。
toNetwork   | 将`Recipe`编码到缓冲区以发送到客户端。配方标识符无需编码。
fromNetwork | 从服务端发送的缓冲区中解码`Recipe`。配方标识符不需要解码。

然后，新配方子类型中的`Recipe#getSerializer`必须返回该`RecipeSerializer`实例。

```java
// 对于某个RegistryObject<RecipeSerializer> EXAMPLE_SERIALIZER
// 在ExampleRecipe中
@Override
public RecipeSerializer<?> getSerializer() {
  return EXAMPLE_SERIALIZER.get();
}
```

:::tip
    有一些有用的方法可以让配方的读写数据变得更容易。`Ingredient`可以使用`#fromJson`、`#toNetwork`和`#fromNetwork`，而`ItemStack`可以使用`CraftingHelper#getItemStack`、`FriendlyByteBuf#writeItem`和`FriendlyByteBuf#readItem`。
:::

构建JSON
--------

自定义配方JSON与其他[配方][json]存储在同一个位置。指定的`type`应表示**配方序列化器**的注册表名称。任何附加数据都是由序列化器在解码期间指定的。

```js
{
  // 自定义序列化器的注册表名称
  "type": "examplemod:example_serializer",
  "input": {
    // 某些原料输入
  },
  "data": 0, // 配方所需的一些数据
  "output": {
    // 某些物品栈输出
  }
}
```

非物品逻辑
---------

如果物品未用作配方输入或结果的一部分，则[`RecipeManager`][manager]中提供的常规方法将无效。相反，应将用于测试配方有效性和/或提供结果的附加方法添加到自定义`Recipe`实例中。从那里，特定`RecipeType`的所有配方都可以通过`RecipeManager#getAllRecipesFor`获得，然后使用新实现的方法进行检查和/或提供结果。

```java
// 在某个Recipe子实现ExampleRecipe中

// 检查该位置的方块，看它是否与存储的数据匹配
boolean matches(Level level, BlockPos pos);

// 创建要将指定位置的方块设置为的方块状态
BlockState assemble(RegistryAccess access);

// 在某个管理器类中
public Optional<ExampleRecipe> getRecipeFor(Level level, BlockPos pos) {
  return level.getRecipeManager()
    .getAllRecipesFor(exampleRecipeType) // 获取所有配方
    .stream() // 在所有配方中查阅类型
    .filter(recipe -> recipe.matches(level, pos)) // 检查该配方输入是否合法
    .findFirst(); // 查找与输入匹配的第一个配方
}
```

数据生成
-------

所有自定义配方，无论输入或输出数据如何，都可以使用`RecipeProvider`创建到用于[数据生成][datagen]的`FinishedRecipe`中。

[forge]: ../../../concepts/registries.md#methods-for-registering
[json]: https://minecraft.fandom.com/wiki/Recipe#JSON_format
[manager]: ./index.md#recipe-manager
[datagen]: ../../../datagen/server/recipes.md#custom-recipe-serializers
