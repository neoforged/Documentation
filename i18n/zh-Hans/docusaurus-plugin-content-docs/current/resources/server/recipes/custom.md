自定义配方
==============

每个配方定义都由三个组件组成：持有数据和处理提供的输入的执行逻辑的`Recipe`实现，表示配方将在其中使用的类别或上下文的`RecipeType`，以及处理配方数据的解码和网络通信的`RecipeSerializer`。如何选择使用配方取决于实现者。

配方
------

`Recipe`接口描述了配方数据和执行逻辑。这包括匹配输入和提供相关的结果。由于配方子系统默认执行物品转换，因此通过`Container`子类型提供输入。

:::note
应该将传入配方的`Container`视为其内容是不可变的。任何可变操作都应该在输入的副本上执行，通过`ItemStack#copy`。
:::

要能够从管理器获取配方实例，`#matches`必须返回true。此方法检查提供的容器，看看相关的输入是否有效。可以通过调用`Ingredient#test`来使用`Ingredient`进行验证。

如果选择了配方，那么就使用`#assemble`进行构建，这可能使用来自输入的数据来创建结果。

:::note
`#assemble`应该总是产生一个唯一的`ItemStack`。如果不确定`#assemble`是否这样做，那么在返回之前在结果上调用`ItemStack#copy`。
:::

大多数其他的方法纯粹是为了与配方书的集成。

```java
public record ExampleRecipe(Ingredient input, int data, ItemStack output) implements Recipe<Container> {
  // Implement methods here
}
```

:::note
虽然在上面的例子中使用了记录（record），但在您自己的实现中不要求这样做。
:::

RecipeType
----------

`RecipeType`负责定义配方将在其中使用的类别或上下文。例如，如果一个配方要在熔炉中熔炼，它会有一个`RecipeType#SMELTING`的类型。在高炉中爆炸熔炼将会有一个`RecipeType#BLASTING`的类型。

如果没有现有的类型与配方将要使用的上下文匹配，那么必须[注册][forge]一个新的`RecipeType`。

然后，新的配方子类型必须通过`Recipe#getType`返回`RecipeType`实例。

```java
// For some RegistryObject<RecipeType> EXAMPLE_TYPE
// In ExampleRecipe
@Override
public RecipeType<?> getType() {
  return EXAMPLE_TYPE.get();
}
```

RecipeSerializer
----------------

`RecipeSerializer`负责解码JSON文件，并且负责与网络上相关的`Recipe`子类型进行通信。每个由序列化器解码的配方被保存为`RecipeManager`内的一个唯一实例。必须[注册][forge]一个`RecipeSerializer`。

对于`RecipeSerializer`，只需要实现三个方法：

 方法         | 描述
 :---:        | :---
fromJson    | 将JSON解码为`Recipe`子类型。
toNetwork   | 将`Recipe`编码到缓冲区以发送给客户端。配方标识符不需要被编码。
fromNetwork | 从服务器发送的缓冲区解码`Recipe`。配方标识符不需要被解码。

然后，`RecipeSerializer`实例必须通过新配方子类型的`Recipe#getSerializer`返回。

```java
// For some RegistryObject<RecipeSerializer> EXAMPLE_SERIALIZER
// In ExampleRecipe
@Override
public RecipeSerializer<?> getSerializer() {
  return EXAMPLE_SERIALIZER.get();
}
```

:::tip
有一些有用的方法可以使阅读和写入配方数据更加容易。`Ingredient`可以使用`#fromJson`、`#toNetwork`和`#fromNetwork`，而`ItemStack`可以使用`CraftingHelper#getItemStack`、`FriendlyByteBuf#writeItem`和`FriendlyByteBuf#readItem`。
:::

构建JSON
-----------------

自定义配方JSON存储在与其他[配方][json]相同的地方。指定的`type`应表示**配方序列化器**的注册名。在解码过程中，序列化器指定任何额外的数据。
```js
{
  // The custom serializer registry name
  "type": "examplemod:example_serializer",
  "input": {
    // Some ingredient input
  },
  "data": 0, // Some data wanted for the recipe
  "output": {
    // Some stack output
  }
}
```

非物品逻辑
--------------

如果物品不被用作配方的输入或结果的一部分，那么[`RecipeManager`][manager]提供的正常方法将不会有用。相反，应该向自定义`Recipe`实例添加一个额外的方法，用于测试配方的有效性和/或提供结果。从那里，可以通过`RecipeManager#getAllRecipesFor`获取特定`RecipeType`的所有配方，然后使用新实现的方法检查和/或提供结果。

```java
// In some Recipe subimplementation ExampleRecipe

// Checks the block at the position to see if it matches the stored data
boolean matches(Level level, BlockPos pos);

// Creates the block state to set the block at the specified position to
BlockState assemble(RegistryAccess access);

// In some manager class
public Optional<ExampleRecipe> getRecipeFor(Level level, BlockPos pos) {
  return level.getRecipeManager()
    .getAllRecipesFor(exampleRecipeType) // Gets all recipes
    .stream() // Looks through all recipes for types
    .filter(recipe -> recipe.matches(level, pos)) // Checks if the recipe inputs are valid
    .findFirst(); // Finds the first recipe whose inputs match
}
```

数据生成
---------------

所有自定义配方，无论输入或输出数据如何，都可以使用`RecipeProvider`将其创建为用于[数据生成][datagen]的`FinishedRecipe`。

[forge]: ../../../concepts/registries.md#methods-for-registering
[json]: https://minecraft.wiki/w/Recipe#JSON_format
[manager]: ./index.md#recipe-manager
[datagen]: ../../../datagen/server/recipes.md#custom-recipe-serializers
