标签 (Tags)
====

标签是游戏中对象的广义集合，用于将相关事物分组在一起并提供快速的成员检查。

声明您自己的分组
----------------------------
标签在您的模组的[数据包][datapack]中声明。例如，一个给定标识符为`modid:foo/tagname`的`TagKey<Block>`将引用在`/data/<modid>/tags/blocks/foo/tagname.json`的标签。`Block`、`Item`、`EntityType`、`Fluid`和`GameEvent`的标签使用它们的文件夹位置的复数形式，而所有其他注册表使用单数版本（`EntityType`使用文件夹`entity_types`，而`Potion`则使用文件夹`potion`）。
同样，您可以通过声明自己的JSON来附加或覆盖在其他域中声明的标签，比如Vanilla。
例如，要将您自己模组的树苗添加到Vanilla的树苗标签，您需要在`/data/minecraft/tags/blocks/saplings.json`中指定，如果`replace`选项为false，那么Vanilla将在重新加载时将所有内容合并到一个标签中。
如果`replace`为true，则指定`replace`的json之前的所有条目将被删除。
列出的不存在的值将导致标签出错，除非该值使用`id`字符串和`required`布尔值列出且设置为false，如下例：

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

请参阅[Vanilla wiki][tags]了解基本语法的描述。

此外，Forge在Vanilla语法上进行了扩展。
您可以声明一个与`values`数组格式相同的`remove`数组。列在这里的任何值都将从标签中删除。这作为Vanilla `replace`选项的更细粒度版本。

在代码中使用标签
------------------
所有注册表的标签都会在登录和重新加载时自动从服务器发送到任何远程客户端。`Block`、`Item`、`EntityType`、`Fluid`和`GameEvent`是特殊情况，因为它们有`Holder`，允许通过对象本身访问可用的标签。

:::note
未来版本的Minecraft中可能会删除侵入式的`Holder`。如果它们被删除，下面的方法可以用来查询相关的`Holder`。
:::

### ITagManager

Forge包装的注册表提供了一个额外的帮助器，通过`ITagManager`来创建和管理标签，可以通过`IForgeRegistry#tags`获得。标签可以使用`#createTagKey`或`#createOptionalTagKey`创建。也可以分别使用`#getTag`或`#getReverseTag`检查标签或注册对象。

#### 自定义注册表

自定义注册表可以在构建它们的`DeferredRegister`时通过`#createTagKey`或`#createOptionalTagKey`创建标签。然后可以通过调用`DeferredRegister#makeRegistry`获得的`IForgeRegistry`来检查它们的标签或注册对象。

### 引用标签

有四种创建标签包装的方法：

方法                              | 适用于
:---:                             | :---
`*Tags#create`                    | `BannerPattern`、`Biome`、`Block`、`CatVariant`、`DamageType`、`EntityType`、`FlatLevelGeneratorPreset`、`Fluid`、`GameEvent`、`Instrument`、`Item`、`PaintingVariant`、`PoiType`、`Structure`和`WorldPreset`，其中`*`代表这些类型之一。
`ITagManager#createTagKey`        | Forge包装的vanilla注册表，注册表可以从`ForgeRegistries`获得。
`DeferredRegister#createTagKey`   | 自定义forge注册表。
`TagKey#create`                   | 没有forge包装的vanilla注册表，注册表可以从`Registry`获得。

注册对象可以通过它们的`Holder`或对于vanilla或forge注册表对象分别通过`ITag`/`IReverseTag`检查它们的标签或注册对象。

Vanilla注册表对象可以使用`Registry#getHolder`或`Registry#getHolderOrThrow`抓取它们关联的holder，然后使用`Holder#is`比较注册表对象是否有标签。

Forge注册表对象可以使用`ITagManager#getTag`或`ITagManager#getReverseTag`抓取它们的标签定义，然后分别使用`ITag#contains`或`IReverseTag#containsTag`比较注册表对象是否有标签。

包含标签的注册表对象包含一个称为`#is`的方法，在它们的注册表对象或状态感知类中，用以检查对象是否属于某个标签。

作为一个示例：

```java
public static final TagKey<Item> myItemTag = ItemTags.create(new ResourceLocation("mymod", "myitemgroup"));

public static final TagKey<Potion> myPotionTag = ForgeRegistries.POTIONS.tags().createTagKey(new ResourceLocation("mymod", "mypotiongroup"));

public static final TagKey<VillagerType> myVillagerTypeTag = TagKey.create(Registries.VILLAGER_TYPE, new ResourceLocation("mymod", "myvillagertypegroup"));

// In some method:

ItemStack stack = /*...*/;
boolean isInItemGroup = stack.is(myItemTag);

Potion potion = /*...*/;
boolean isInPotionGroup  = ForgeRegistries.POTIONS.tags().getTag(myPotionTag).contains(potion);

ResourceKey<VillagerType> villagerTypeKey = /*...*/;
boolean isInVillagerTypeGroup = BuiltInRegistries.VILLAGER_TYPE.getHolder(villagerTypeKey).map(holder -> holder.is(myVillagerTypeTag)).orElse(false);
```

约定
-----------

有几个约定将有助于在生态系统中促进兼容性：

* 如果有Vanilla标签适合您的方块或物品，请将其添加到该标签中。参见[Vanilla标签列表][taglist]。
* 如果有Forge标签适合您的方块或物品，请将其添加到该标签中。可以在[GitHub][forgetags]上查看Forge声明的标签列表。
* 如果您觉得有一组东西应该被社区共享，请使用`forge`命名空间而不是您的mod id。
* 标签命名约定应遵循Vanilla约定。特别是，物品和方块分组应使用复数而不是单数（例如，`minecraft:logs`，`minecraft:saplings`）。
* 物品标签应按照它们的类型排序到子目录中（例如，`forge:ingots/iron`，`forge:nuggets/brass`等）。

从OreDictionary迁移
----------------------------

* 对于配方，可以直接在vanilla配方格式中使用标签（见下文）。
* 要在代码中匹配物品，请参阅上述部分。
* 如果您正在声明一种新类型的物品分组，请遵循一些命名约定：
  * 使用`domain:type/material`。当名称是所有modders都应采用的常见名称时，使用`forge`域。
  * 例如，铜锭应在`forge:ingots/brass`标签下注册，钴粒则应在`forge:nuggets/cobalt`标签下注册。

在配方和成就中使用标签
--------------------------------------

Vanilla直接支持标签。有关使用详细信息，请参阅相应的Vanilla wiki页面，包括[配方]和[成就]。

[datapack]: ./index.md
[tags]: https://minecraft.wiki/w/Tag#JSON_format
[taglist]: https://minecraft.wiki/w/Tag#List_of_tags
[forgetags]: https://github.com/neoforged/NeoForge/tree/1.20.x/src/generated/resources/data/forge/tags
[recipes]: https://minecraft.wiki/w/Recipe#JSON_format
[advancements]: https://minecraft.wiki/w/Advancement
