标签生成
======

通过继承`TagsProvider`并实现`#addTags`方法，可以为一个mod生成[标签]。实现后，必须将提供器[添加][datagen]到`DataGenerator`中。

```java
// 在MOD事件总线上
@SubscribeEvent
public void gatherData(GatherDataEvent event) {
    event.getGenerator().addProvider(
        // 通知生成器仅在生成服务器数据时运行
        event.includeServer(),
        // 继承自net.neoforged.neoforge.common.data.BlockTagsProvider
        output -> new MyBlockTagsProvider(
          output,
          event.getLookupProvider(),
          MOD_ID,
          event.getExistingFileHelper()
        )
    );
}
```

`TagsProvider`
--------------

标签提供器有两种用于生成标签的方法：通过`#tag`使用对象和其他标签创建一个标签，或者通过`#getOrCreateRawBuilder`使用其他对象类型的标签来生成标签数据。

:::note
通常，除非一个注册表包含来自不同注册表的对象的表示（例如，方块有项目表示以在库存中获得方块），否则提供器不会直接调用`#getOrCreateRawBuilder`。
:::

调用`#tag`时，会创建一个`TagAppender`，它作为链式消费者，用于向标签添加元素：

方法               | 描述
:---:              | :---
`add`              | 通过其资源键将一个对象添加到标签中。
`addOptional`      | 通过其名称将一个对象添加到标签中。如果对象不存在，则加载时将跳过该对象。
`addTag`           | 通过其标签键将一个标签添加到标签中。内标签中的所有元素现在都是外标签的一部分。
`addOptionalTag`   | 通过其名称将一个标签添加到标签中。如果标签不存在，则加载时将跳过该标签。
`replace`          | 当为`true`时，此标签从其他数据包添加的所有先前加载的条目将被丢弃。如果在此之后加载了一个数据包，那么它仍然会将条目追加到标签中。
`remove`           | 通过其名称或键从标签中移除一个对象或标签。

```java
// 在某个TagProvider#addTags中
this.tag(EXAMPLE_TAG)
  .add(EXAMPLE_OBJECT) // 将一个对象添加到标签中
  .addOptional(new ResourceLocation("othermod", "other_object")) // 向标签添加来自其他mod的对象

this.tag(EXAMPLE_TAG_2)
  .addTag(EXAMPLE_TAG) // 将一个标签添加到另一个标签
  .remove(EXAMPLE_OBJECT) // 从此标签中移除一个对象
```

:::important
如果你的mod的标签对其他mod的标签有软依赖（也就是说，其他mod可能在运行时不存在），那么你应该使用可选的方法来引用其他mod的标签。
:::

### 现有的供应商

Minecraft中包含了一些可以被子类化的特定注册表的标签供应商。另外，一些供应商包含了额外的辅助方法，可以更容易地创建标签。

注册对象类型             | 标签供应商
:---:                        | :---
`方块`                      | `BlockTagsProvider`\*
`物品`                       | `ItemTagsProvider`
`实体类型`                   | `EntityTypeTagsProvider`
`流体`                       | `FluidTagsProvider`
`游戏事件`                   | `GameEventTagsProvider`
`生物群系`                   | `BiomeTagsProvider`
`平面世界生成预设`   | `FlatLevelGeneratorPresetTagsProvider`
`世界预设`                 | `WorldPresetTagsProvider`
`结构`                       | `StructureTagsProvider`
`兴趣点类型`              | `PoiTypeTagsProvider`
`旗帜图案`                  | `BannerPatternTagsProvider`
`猫的品种`                  | `CatVariantTagsProvider`
`画的种类`                  | `PaintingVariantTagsProvider`
`乐器`                       | `InstrumentTagsProvider`
`伤害类型`                  | `DamageTypeTagsProvider`

\* `BlockTagsProvider` 是Forge所添加的 `TagsProvider`。

#### `ItemTagsProvider#copy`

方块在物品栏中有物品形式的表示。因此，许多的方块标签也可以是物品标签。为了方便地生成与方块标签具有相同条目的物品标签，可以使用 `#copy` 方法，此方法接收要复制的方块标签和要复制到的物品标签。

```java
// 在 ItemTagsProvider#addTags 中
this.copy(EXAMPLE_BLOCK_TAG, EXAMPLE_ITEM_TAG);
```

自定义标签提供者
--------------------

通过 `TagsProvider` 的子类，可以创建自定义的标签提供者，这需要传入注册键以生成标签。

```java
public RecipeTypeTagsProvider(PackOutput output, CompletableFuture<HolderLookup.Provider> registries, ExistingFileHelper fileHelper) {
  super(output, Registries.RECIPE_TYPE, registries, MOD_ID, fileHelper);
}
```

### 内在持有者标签提供者

其中一种特殊的 `TagProvider` 是 `IntrinsicHolderTagsProvider`。当通过这个提供者使用 `#tag` 创建标签时，对象本身可以通过 `#add` 将自己添加到标签中。为此，在构造函数中提供了一个将对象转换为其 `ResourceKey` 的函数。

```java
// `IntrinsicHolderTagsProvider` 的子类型
public AttributeTagsProvider(PackOutput output, CompletableFuture<HolderLookup.Provider> registries, ExistingFileHelper fileHelper) {
  super(
    output,
    ForgeRegistries.Keys.ATTRIBUTES,
    registries,
    attribute -> ForgeRegistries.ATTRIBUTES.getResourceKey(attribute).get(),
    MOD_ID,
    fileHelper
  );
}
```

[tags]: ../../resources/server/tags.md
[datagen]: ../index.md#data-providers
[custom]: ../../concepts/registries.md#custom-registries
