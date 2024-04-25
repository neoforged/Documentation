标签生成
==============

通过子类化 `TagsProvider` 并实现 `#addTags` 方法，可以为一个模组生成[标签]。在实现之后，必须将提供者[添加][datagen]到 `DataGenerator` 中。

```java
// 在 MOD 事件总线上
@SubscribeEvent
public void gatherData(GatherDataEvent event) {
    event.getGenerator().addProvider(
        // 仅在生成服务器数据时运行生成器
        event.includeServer(),
        // 扩展 net.neoforged.neoforge.common.data.BlockTagsProvider
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

标签提供者有两种用于生成标签的方法：通过 `#tag` 创建带有对象和其他标签的标签，或者使用其他对象类型的标签生成标签数据通过 `#getOrCreateRawBuilder`。

:::note
通常，提供者不会直接调用 `#getOrCreateRawBuilder`，除非注册表包含来自不同注册表的对象的表示（方块有物品表示以获取存储在库存中的方块）。
:::

当调用 `#tag` 时，将创建一个 `TagAppender`，它作为一种可链接的元素消费者添加到标签中：

方法           | 描述
:---:          | :---
`add`          | 通过其资源键将对象添加到标签中。
`addOptional`  | 通过其名称将对象添加到标签中。如果对象不存在，则在加载时将跳过该对象。
`addTag`       | 通过其标签键将标签添加到标签中。内部标签中的所有元素现在都是外部标签的一部分。
`addOptionalTag` | 通过其名称将标签添加到标签中。如果标签不存在，则在加载时将跳过该标签。
`replace`      | 当为 `true` 时，将丢弃从其他数据包添加到此标签中的所有先前加载的条目。如果在加载此数据包之后加载了一个数据包，则仍将将条目附加到标签。
`remove`       | 通过其名称或键从标签中删除对象或标签。

```java
// 在某些 TagProvider#addTags 中
this.tag(EXAMPLE_TAG)
  .add(EXAMPLE_OBJECT) // 向标签中添加对象
  .addOptional(new ResourceLocation("othermod", "other_object")) // 向标签中添加来自其他模组的对象

this.tag(EXAMPLE_TAG_2)
  .addTag(EXAMPLE_TAG) // 向标签中添加标签
  .remove(EXAMPLE_OBJECT) // 从此标签中移除对象
```

:::important
如果模组的标签在某些情况下依赖于其他模组的标签（其他模组可能在运行时存在或不存在），则应使用可选的方法引用其他模组的标签。
:::

### 现有提供者

Minecraft 包含一些特定注册表的标签提供者，可以进行子类化。此外，一些提供者包含附加的辅助方法，以更轻松地创建标签。

注册表对象类型         | 标签提供者
:---:                  | :---
`Block`                | `BlockTagsProvider`\*
`Item`                 | `ItemTagsProvider`
`EntityType`           | `EntityTypeTagsProvider`
`Fluid`                | `FluidTagsProvider`
`GameEvent`            | `GameEventTagsProvider`
`Biome`                | `BiomeTagsProvider`
`FlatLevelGeneratorPreset`   | `FlatLevelGeneratorPresetTagsProvider`
`WorldPreset`          | `WorldPresetTagsProvider`
`Structure`            | `StructureTagsProvider`
`PoiType`              | `PoiTypeTagsProvider`
`BannerPattern`        | `BannerPatternTagsProvider`
`CatVariant`           | `CatVariantTagsProvider`
`PaintingVariant`      | `PaintingVariantTagsProvider`
`Instrument`           | `InstrumentTagsProvider`
`DamageType`           | `DamageTypeTagsProvider`

\* `BlockTagsProvider` 是 Forge 添加的 `TagsProvider`。

#### `ItemTagsProvider#copy`

方块具有物品表示以在库存中获取它们。因此，许多方块标签也可以是物品标签。为了轻松生成具有与方块标签相同条目的物品标签，可以使用 `#copy` 方法，该方法接受要从中复制的方块标签和要复制到的物品标签。

```java
// 在 ItemTagsProvider#addTags 中
this.copy(EXAMPLE_BLOCK_TAG, EXAMPLE_ITEM_TAG);
```

自定义标签提供者
--------------------

可以通过一个接受注册表键以生成标签的 `TagsProvider` 子类来创建自定义标签提供者。

```java
public RecipeTypeTagsProvider(PackOutput output, CompletableFuture<HolderLookup.Provider> registries, ExistingFileHelper fileHelper) {
  super(output, Registries.RECIPE_TYPE, registries, MOD_ID, fileHelper);
}
```

### 内置持有者标签提供者

一种特殊类型的 `TagProvider` 是 `IntrinsicHolderTagsProvider`。通过此提供者使用 `#tag` 创建标签时，对象本身可以通过 `#add` 添加到标签中。为了实现这一点，在构造函数中提供了一个函数，用于将对象转换为其 `ResourceKey`。

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

[标签]: ../../resources/server/tags.md
[datagen]: ../index.md#数据提供者
[custom]: ../../concepts/registries.md#自定义注册表
