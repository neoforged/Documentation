国际化与本地化
=============

国际化（Internationalization），简称I18n，是一种设计代码的方式，以便不需要进行任何更改即可适应各种语言。本地化（Localization）是使显示的文本适应用户语言的过程。

I18n是使用 _翻译键_ 来实现的。翻译键是一个字符串，用于指定一段不使用特定语言的可显示文本。例如，`block.minecraft.dirt`是引用泥土方块名称的翻译键。这样，可显示文本可被引用，而不必考虑特定的语言。这些代码不需要任何更改即可适应新的语言。

本地化将在游戏的语言设置中进行。在Minecraft客户端中，语言环境由语言设置指定。在dedicated服务端上，唯一支持的语言设置是`en_us`。可用语言地区的列表可以在[Minecraft Wiki][langs]上找到。

语言文件
-------

语言文件由`assets/[namespace]/lang/[locale].json`定位（例如，`examplemod`提供的所有美国英语翻译都在`assets/examplemod/lang/en_us.json`中）。文件格式只是从翻译键到值的json映射。文件必须使用UTF-8编码。可以使用[转换器][converter]将旧的.lang文件转换为json。

```js
{
  "item.examplemod.example_item": "Example Item Name",
  "block.examplemod.example_block": "Example Block Name",
  "commands.examplemod.examplecommand.error": "Example Command Errored!"
}
```

对方块和物品的用法
-----------------

Block、Item和其他一些Minecraft类都内置了用于显示其名称的翻译键。这些转换键是通过重写`#getDescriptionId`指定的。Item还具有`#getDescriptionId(ItemStack)`，重写该方法后可以根据所给ItemStack NBT提供不同的翻译键。

默认情况下，`#getDescriptionId`将返回以`block.`或`item.`为前缀的方块或物品的注册表名称，冒号由句点代替。默认情况下，`BlockItem`覆盖此方法以获取其对应的`Block`的翻译密钥。例如，ID为`examplemod:example_item`的物品实际上需要语言文件中的以下行：

```js
{
  "item.examplemod.example_item": "Example Item Name"
}
```

:::caution
    翻译键的唯一目的是国际化。不要把它们用于代码的逻辑处理部分。请改用注册表名称。
:::


本地化相关方法
-------------

:::danger
    一个常见的问题是让服务端为客户端进行本地化。服务端只能在自己的语言设置中进行本地化，这不一定与所连接的客户端的语言设置相匹配。
    
    为了尊重客户端的语言设置，服务端应该让客户端使用`TranslatableComponent`或其他保留语言中性翻译键的方法在自己的语言设置中本地化文本。
:::

### `net.minecraft.client.resources.language.I18n` (仅客户端)

**这个I18n类仅在Minecraft客户端上有效！**它旨在由仅在客户端上运行的代码使用。尝试在服务端上使用它会引发异常并崩溃。

- `get(String, Object...)`使用格式采取客户端的语言设置进行本地化。第一个参数是翻译键，其余的是`String.format(String, Object...)`的格式化参数。

### `TranslatableContents`

`TranslatableContents`是一个经过惰性的本地化和格式化的`ComponentContents`。它在向玩家发送消息时非常有用，因为它将在玩家自己的语言设置中自动本地化。

`TranslatableContents(String, Object...)`构造函数的第一个参数是翻译键，其余参数用于格式化。唯一支持的格式说明符是`%s`和`%1$s`、`%2$s`、`%3$s`等。格式化参数可能是将插入到格式化结果文本中并保留其所有属性的`Component`。

通过传入`TranslatableContents`的参数，可以使用`Component#translatable`创建`MutableComponent`。它也可以使用`MutableComponent#create`通过传入`ComponentContents`本身来创建。

### `TextComponentHelper`

- `createComponentTranslation(CommandSource, String, Object...)`根据接收者创建本地化并格式化的`MutableComponent`。如果接收者是一个原版客户端，那么本地化和格式化就很容易完成。如果没有，本地化和格式化将使用包含`TranslatableContents`的`Component`惰性地进行。只有当服务端允许原版客户端连接时，这才有用。

[langs]: https://minecraft.fandom.com/wiki/Language#Languages
[converter]: https://tterrag.com/lang2json/
