标签生成
========

可以通过子类化`TagsProvider`并实现`#addTags`来为模组生成[标签][Tags]。实现后，该提供者必须被[添加][datagen]到`DataGenerator`中。

```java
// 在模组事件总线上
@SubscribeEvent
public void gatherData(GatherDataEvent event) {
    event.getGenerator().addProvider(
        // 告诉生成器仅在生成服务端资源时运行
        event.includeServer(),
        // 扩展net.minecraftforge.common.data.BlockTagsProvider
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

标签提供者有两种用于生成标签的方法：通过`#tag`创建带有对象和其他标签的标签，或通过`#getOrCreateRawBuilder`使用其他对象类型的标签生成标签数据。

:::caution
    通常，提供者不会直接调用`#getOrCreateRawBuilder`，除非注册表包含来自不同注册表的对象表示（方块具有物品表示以获得物品栏中的方块）。
:::

当调用`#tag`时，将创建一个`TagAppender`，它充当要添加到标签中的元素的可链接Consumer：

方法             | 描述
:---:            | :---
`add`            | 通过对象的资源键将对象添加到标签中。
`addOptional`    | 通过对象的名称将对象添加到标签中。如果对象不存在，则加载时将跳过该对象。
`addTag`         | 通过标签键将标签添加到标签中。内部标签中的所有元素现在都是外部标签的一部分。
`addOptionalTag` | 通过标签的名称将标签添加到标签中。如果标签不存在，则加载时将跳过该标签。
`replace`        | 当为`true`时，从其他数据包添加到此标签的所有先前加载的条目都将被丢弃。如果在这个数据包之后加载了一个数据包，那么它仍然会将条目附加到标签中。
`remove`         | 通过对象或标签的名称或键从标签中删除对象或标签。

```java
// 在某个TagProvider#addTags中
this.tag(EXAMPLE_TAG)
  .add(EXAMPLE_OBJECT) // 向该标签添加一个对象
  .addOptional(new ResourceLocation("othermod", "other_object")) // 向该标签添加一个来自其他模组的对象

this.tag(EXAMPLE_TAG_2)
  .addTag(EXAMPLE_TAG) // 向该标签添加一个标签
  .remove(EXAMPLE_OBJECT) // 从该标签中移除一个对象
```

!!! 重要
    如果模组的标签软依赖于另一个模组的标签（另一个模组可能在运行时存在，也可能不存在），则应使用可选方法引用其他模组的标签。

### Existing Providers

Minecraft包含一些用于某些注册表的标签提供者，这些注册表可以被子类化。此外，一些提供者包含额外的辅助方法，以便更容易地创建标签。

注册表对象类型                | 标签提供者
:---:                        | :---
`Block`                      | `BlockTagsProvider`\*
`Item`                       | `ItemTagsProvider`
`EntityType`                 | `EntityTypeTagsProvider`
`Fluid`                      | `FluidTagsProvider`
`GameEvent`                  | `GameEventTagsProvider`
`Biome`                      | `BiomeTagsProvider`
`FlatLevelGeneratorPreset`   | `FlatLevelGeneratorPresetTagsProvider`
`WorldPreset`                | `WorldPresetTagsProvider`
`Structure`                  | `StructureTagsProvider`
`PoiType`                    | `PoiTypeTagsProvider`
`BannerPattern`              | `BannerPatternTagsProvider`
`CatVariant`                 | `CatVariantTagsProvider`
`PaintingVariant`            | `PaintingVariantTagsProvider`
`Instrument`                 | `InstrumentTagsProvider`
`DamageType`                 | `DamageTypeTagsProvider`

\* `BlockTagsProvider`是一个由Forge添加的`TagsProvider`。

#### `ItemTagsProvider#copy`

方块具有用于在物品栏中获取它们的物品表示。因此，许多方块标签也可以是物品标签。为了容易地生成与方块标签具有相同条目的物品标签，可以使用`#copy`方法，该方法接受要从中复制的方块标签和要复制到的物品标签。

```java
// 在ItemTagsProvider#addTags中
this.copy(EXAMPLE_BLOCK_TAG, EXAMPLE_ITEM_TAG);
```

自定义标签提供者
---------------

可以通过`TagsProvider`子类创建自定义标签提供者，该子类接受注册表键来为其生成标签。

```java
public RecipeTypeTagsProvider(PackOutput output, CompletableFuture<HolderLookup.Provider> registries, ExistingFileHelper fileHelper) {
  super(output, Registries.RECIPE_TYPE, registries, MOD_ID, fileHelper);
}
```

### Intrinsic Holder Tags Providers

一种特殊类型的`TagProvider`是`IntrinsicHolderTagsProvider`。当通过`#tag`使用此提供者创建标签时，可以使用对象本身通过`#add`将自己添加到标签中。为此，在构造函数中提供了一个函数，将对象转换为其`ResourceKey`。

```java
// `IntrinsicHolderTagsProvider`的子类型
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
[custom]: ../../concepts/registries.md#creating-custom-forge-registries
