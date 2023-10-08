Forge更新检查器
==============

Forge提供了一个非常轻量级的可选择性加入的更新检查框架。如果任何模组有可用的更新，它将在主菜单和模组列表的'Mods'按钮上显示一个闪烁的图标，以及相应的更改日志。它*不会*自动下载更新。

入门
----

你要做的第一件事是在`mods.toml`文件中指定`updateJSONURL`参数。此参数的值应该是指向更新JSON文件的有效URL。这个文件可以托管在你自己的网络服务器、GitHub或任何你想要的地方，只要你的模组的所有用户都能可靠地访问它。

更新JSON格式
------------

JSON本身有一个相对简单的格式，如下所示：

```js
{
  "homepage": "<homepage/download page for your mod>",
  "<mcversion>": {
    "<modversion>": "<changelog for this version>", 
    // 列出给定Minecraft版本的所有模组版本，以及它们的更改日志
    // ...
  },
  "promos": {
    "<mcversion>-latest": "<modversion>",
    // 为给定的Minecraft版本声明你的模组的最新"bleeding-edge"版本
    "<mcversion>-recommended": "<modversion>",
    // 为给定的Minecraft版本声明你的模组的最新"stable"版本
    // ...
  }
}
```

这是不言自明的，但需要注意：

* `homepage`下的链接是当模组过时时将向用户显示的链接。
* Forge使用内部算法来确定你的模组的一个版本字符串是否比另一个“新”。大多数版本控制方案应该是兼容的，但如果你担心方案是否受支持，请参阅`ComparableVersion`类。强烈建议遵守[Maven版本控制][mvnver]。
* 可以使用`\n`将变更日志字符串分隔成多行。有些人更喜欢包含一个简略的变更日志，然后链接到一个提供完整变更列表的外部网站。
* 手动输入数据可能很麻烦。你可以将`build.gradle`配置为在构建版本时自动更新此文件，因为Groovy具有本地JSON解析支持。这将留给读者练习。

- 这里可以找到一些例子，例如[nocubes][]、[Corail Tombstone][corail]和[Chisels & Bits 2][chisel]。

检索更新检查结果
---------------

你可以使用`VersionChecker#getResult(IModInfo)`检索Forge更新检查器的结果。你可以通过`ModContainer#getModInfo`获取你的`IModInfo`。你可以在构造函数中使用`ModLoadingContext.get().getActiveContainer()`、`ModList.get().getModContainerById(<你的modId>)`或`ModList.get().getModContainerByObject(<你的模组实例>)`来获取`ModContainer`。你可以使用`ModList.get().getModContainerById(<modId>)`获取任何其他模组的`ModContainer`。返回的对象有一个方法`#status`，表示版本检查的状态。

|          状态   | 描述        |
|----------------:|:------------|
|        `FAILED` | 版本检查器无法连接到提供的URL。 |
|    `UP_TO_DATE` | 当前版本等于推荐版本。 |
|         `AHEAD` | 如果没有最新版本，则当前版本比推荐版本更新。 |
|      `OUTDATED` | 有一个新的推荐版本或最新版本。 |
| `BETA_OUTDATED` | 有一个新的最新版本。 |
|          `BETA` | 当前版本等于或高于最新版本。 |
|       `PENDING` | 请求的结果尚未完成，因此你应该稍后再试。 |

返回的对象还将具有`update.json`中指定的目标版本和任何变更日志行。

[mvnver]: ../gettingstarted/versioning.md
[nocubes]: https://cadiboo.github.io/projects/nocubes/update.json
[corail]: https://github.com/Corail31/tombstone_lite/blob/master/update.json
[chisel]: https://github.com/Aeltumn/Chisels-and-Bits-2/blob/master/update.json
