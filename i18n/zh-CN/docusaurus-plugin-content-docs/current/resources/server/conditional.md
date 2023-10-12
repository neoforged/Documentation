条件性加载数据
=============

有时，模组开发者可能希望包括一些使用来自另一个模组的信息的数据驱动的对象，而不必明确地使该模组成为依赖项。其他情况可能是，当某些对象存在时，将其与其他模组编写的条目交换。这可以通过条件子系统来完成。

实现
----

目前，条件加载已针对配方和进度实现。对于任何有条件的配方或进度，都会加载一个条件到数据对的列表。如果为列表中的某个数据指定的条件为true，则返回该数据。否则，将丢弃该数据。

```js
{
  // 需要为配方指定类型，因为它们可以具有自定义序列化器
  // 进度不需要这种类型
  "type": "forge:conditional",
  
  "recipes": [ // 或'advancements'（对于进度）
    {
      // 要检查的条件
      "conditions": [
        // 该列表中的条件用逻辑和（AND）相连
        {
          // 条件1
        },
        {
          // 条件2
        }
      ],
      "recipe": { // 或'advancement'（对于进度）
        // 如果所有条件都成功，则使用的配方
      }
    },
    {
      // 如果上一个条件失败，则接下来要检查的条件
    },
  ]
}
```

通过`ConditionalRecipe$Builder`和`ConditionalAdvancement$Builder`，条件加载的数据还具有用于[数据生成][datagen]的包装。

条件
----

条件是通过将`type`设置为[`IConditionSerializer#getID`][serializer]指定的条件名称来指定的。

### True和False

布尔条件不包含任何数据，并返回条件的期望值。它们用`forge:true`和`forge:false`来表示。

```js
// 对于某个条件
{
  // 将始终返回true（或为'forge:false'时始终返回false）
  "type": "forge:true"
}
```

### Not、And和Or

布尔运算符条件由正在操作的条件组成，并应用以下逻辑。它们用`forge:not`、`forge:and`和`forge:or`表示。


```js
// 对于某个条件
{
  // 反转存储条件的结果
  "type": "forge:not",
  "value": {
    // 一个条件
  }
}
```

```js
// 对于某个条件
{
  // 将存储条件用逻辑和（AND）相连（或为'forge:or'时将存储条件用逻辑或（OR）相连）
  "type": "forge:and",
  "values": [
    {
      // 第一个条件
    },
    {
      // 第二个要用逻辑和（AND）连接的条件（或为'forge:or'时用逻辑或（OR）连接）
    }
  ]
}
```

### 模组被加载

只要在当前应用程序中加载了具有给定id的指定模组，`ModLoadedCondition`就会返回true。其由`forge:mod_loaded`表示。

```js
// 对于某个条件
{
  "type": "forge:mod_loaded",
   // 如果'examplemod'已被加载，则返回true
  "modid": "examplemod"
}
```

### 物品存在

只要给定物品已在当前应用程序中注册，`ItemExistsCondition`就会返回true。其由`forge:item_exists`表示。

```js
// 对于某个条件
{
  "type": "forge:item_exists",
   // 如果'examplemod:example_item'已被注册，则返回true
  "item": "examplemod:example_item"
}
```

### 标签为空

只要给定的物品标签中没有物品，`TagEmptyCondition`就会返回true。其由`forge:tag_empty`表示。

```js
// 对于某个条件
{
  "type": "forge:tag_empty",
   // 如果'examplemod:example_tag'是一个没有条目的物品标签，则返回true
  "tag": "examplemod:example_tag"
}
```

创建自定义条件
-------------

可以通过实现`ICondition`及与其关联的`IConditionSerializer`来创建自定义条件。

### ICondition

任何条件只需要实现两种方法：

方法   | 描述
:---:  | :---
getID  | 该条件的注册表名称。必须等效于[`IConditionSerializer#getID`][serializer]。仅用于[数据生成][datagen]。
test   | 当条件满足时返回true。

:::caution
    每个`#test`都可以访问一些代表游戏状态的`IContext`。目前，从注册表中只能获取标签。
:::

### IConditionSerializer

序列化器需要实现三种方法：

方法   | 描述
:---:  | :---
getID  | 该条件的注册表名称。必须等效于[`ICondition#getID`][condition]。
read   | 从JSON中读取条件数据。
write  | 将给定的条件数据写入JSON。

:::caution
    条件序列化器不负责写入或读取序列化器的类型，类似于Minecraft中的其他序列化器实现。
:::

之后，应声明一个静态实例来保存初始化的序列化器，然后在`RecipeSerializer`的`RegisterEvent`期间或在`FMLCommonSetupEvent`期间使用`CraftingHelper#register`进行注册。

```java
// 在某个序列化器类中
public static final ExampleConditionSerializer INSTANCE = new ExampleConditionSerializer();

// 在某个处理器类中
public void registerSerializers(RegisterEvent event) {
  event.register(ForgeRegistries.Keys.RECIPE_SERIALIZERS,
    helper -> CraftingHelper.register(INSTANCE)
  );
}
```

:::note
    如果使用`FMLCommonSetupEvent`注册条件序列化器，则必须通过 `FMLCommonSetupEvent#enqueueWork`将其排入同步工作队列，因为`CraftingHelper#register`不是线程安全的。
:::

[datagen]: ../../datagen/server/recipes.md
[serializer]: #iconditionserializer
[condition]: #icondition
