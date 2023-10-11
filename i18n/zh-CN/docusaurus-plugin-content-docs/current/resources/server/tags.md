标签
====

标签是游戏中用于将相关事物分组在一起并提供快速成员身份检查的通用对象集。

声明你自己的组别
---------------
标签在你的模组的[数据包][datapack]中声明。例如，给定标识符为`modid:foo/tagname`的`TagKey<Block>`将引用位于`/data/<modid>/tags/blocks/foo/tagname.json`的标签。`Block`、`Item`、`EntityType`、`Fluid`以及`GameEvent`的标签，将使用复数形式作为其文件夹位置，而所有其他注册表使用单数形式（`EntityType`使用文件夹`entity_types`，而`Potion`将使用文件夹`potion`）。
类似地，你可以通过声明自己的JSON来附加或覆盖在其他域（如原版）中声明的标签。
例如，要将你自己的模组的树苗添加到原版树苗标签中，你可以在`/data/minecraft/tags/blocks/saplings.json`中指定它，如果`replace`选项为false，原版将在重载时将所有内容合并到一个标签中。
如果`replace`为true，那么指定`replace`的json之前的所有条目都将被删除。
列出的不存在的值将导致标签出错，除非使用`id`字符串和设置为false的`required`布尔值列出该值，如以下示例所示：

```js
{
  "replace": false,
  "values": [
    "minecraft:gold_ingot",
    "mymod:my_ingot",
    {
      "id": "othermod:ingot_other",
      "required": false
    }
  ]
}
```

有关基本语法的描述，请参阅[原版wiki][tags]。

原版语法上还有一个Forge扩展。
你可以声明一个与`values`数组格式相同的`remove`数组。此处列出的任何值都将从标签中删除。这相当于原版`replace`选项的细粒度版本。


在代码中使用标签
---------------
登录和重新加载时，所有注册表的标签都会自动从服务器发送到任何远程客户端。`Block`、`Item`、`EntityType`、`Fluid`和`GameEvent`都被特殊地包装，因为它们具有`Holder`，允许通过对象本身访问可用标签。

:::caution
    在未来版本的Minecraft中，侵入性的`Holder`可能会被移除。如果被移除了，则可以使用以下方法来查询关联的`Holder`。
:::

### ITagManager

Forge封装的注册表提供了一个额外的帮助，用于通过`ITagManager`创建和管理标签，该标签可以通过`IForgeRegistry#tags`获得。可以使用`#createTagKey`或`#createOptionalTagKey`创建标签。标签或注册表对象也可以分别使用`#getTag`或`#getReverseTag` 检查。

#### 自定义注册表

自定义注册表可以在分别通过`#createTagKey`或`#createOptionalTagKey`构造其`DeferredRegister`时创建标签。然后，可以使用通过调用`DeferredRegister#makeRegistry`获得的`IForgeRegistry`来检查它们的标签或注册表对象。

### 引用标签

创建标签包装有四种方法：

方法                            | 对于
:---:                           | :---
`*Tags#create`                  | `BannerPattern`、`Biome`、`Block`、`CatVariant`、`DamageType`、`EntityType`、`FlatLevelGeneratorPreset`、`Fluid`、`GameEvent`、`Instrument`、`Item`、`PaintingVariant`、`PoiType`、`Structure`以及`WorldPreset`，其中`*`代表这些类型之一。
`ITagManager#createTagKey`      | 由Forge包装的原版注册表，可从`ForgeRegistries`取得。
`DeferredRegister#createTagKey` | 自定义的Forge注册表。
`TagKey#create`                 | 无Forge包装的原版注册表，可从`Registry`取得。

注册表对象可以通过其`Holder`或通过`ITag`/`IReverseTag`分别检查其标签或注册表对象是否为原版或Forge注册表对象。

原版注册表对象可以使用`Registry#getHolder`或`Registry#getHolderOrThrow`获取其关联的持有者，然后使用`Holder#is`比较注册表对象是否有标签。

Forge注册表对象可以使用`ITagManager#getTag`或`ITagManager#getReverseTag`获取其标签定义，然后分别使用`ITag#contains`或`IReverseTag#containsTag`比较注册表对象是否有标签。

持有标签的注册表对象在其注册表对象或状态感知类中包含一个名为`#is`的方法，以检查该对象是否属于某个标签。

举一个例子：
```java
public static final TagKey<Item> myItemTag = ItemTags.create(new ResourceLocation("mymod", "myitemgroup"));

public static final TagKey<Potion> myPotionTag = ForgeRegistries.POTIONS.tags().createTagKey(new ResourceLocation("mymod", "mypotiongroup"));

public static final TagKey<VillagerType> myVillagerTypeTag = TagKey.create(Registries.VILLAGER_TYPE, new ResourceLocation("mymod", "myvillagertypegroup"));

// 在某个方法中：

ItemStack stack = /*...*/;
boolean isInItemGroup = stack.is(myItemTag);

Potion potion = /*...*/;
boolean isInPotionGroup  = ForgeRegistries.POTIONS.tags().getTag(myPotionTag).contains(potion);

ResourceKey<VillagerType> villagerTypeKey = /*...*/;
boolean isInVillagerTypeGroup = BuiltInRegistries.VILLAGER_TYPE.getHolder(villagerTypeKey).map(holder -> holder.is(myVillagerTypeTag)).orElse(false);
```

惯例
----

有几个惯例将有助于促进该生态系统中的兼容性：

* 如果有适合你的方块或物品的原版标签，请将其添加到该标签中。请参阅[原版标签列表][taglist]。
* 如果有一个Forge标签适合你的方块或物品，请将其添加到该标签中。Forge声明的标签列表可以在[GitHub][forgetags]上看到。
* 如果有一组你认为应该由社区共享的东西，请使用`forge`命名空间，而不是你的mod id。
* 标签命名约定应遵循原版约定。特别是，物品和方块组别是复数而不是单数（例如`minecraft:logs`、`minecraft:saplings`）。
* 物品标签应根据其类型分类到子目录中（例如`forge:ingots/iron`、`forge:nuggets/brass`等）。


从OreDictionary迁移
-------------------

* 对于配方，标签可以直接以原版配方格式使用（见下文）。
* 有关代码中的匹配物品，请参阅上面的章节。
* 如果你要声明一种新类型的物品组别，请遵循以下几个命名约定：
  * 使用`domain:type/material`。当名称是所有模组开发者都应该采用的通用名称时，请使用`forge`域。
  * 例如，铜锭应在`forge:ingots/brass`标签下注册，钴粒应在`forge:nuggets/cobalt`标签下注册。


在配方和进度中使用标签
--------------------

原版直接支持标签。有关用法的详细信息，请参阅[配方][recipes]和[进度][advancements]的原版wiki页面。

[datapack]: ./index.md
[tags]: https://minecraft.wiki/w/Tag#JSON_format
[taglist]: https://minecraft.wiki/w/Tag#List_of_tags
[forgetags]: https://github.com/MinecraftForge/MinecraftForge/tree/1.19.x/src/generated/resources/data/forge/tags
[recipes]: https://minecraft.wiki/w/Recipe#JSON_format
[advancements]: https://minecraft.wiki/w/Advancement
