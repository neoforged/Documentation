Forge更新检查器
====================

Forge提供了一个非常轻量级的、可选择的更新检查框架。如果任何mod有可用的更新，它将在主菜单的“Mods”按钮和mod列表上显示一个闪烁的图标，以及相应的更新日志。它*不会*自动下载更新。

入门指南
---------------

首先，您需要在您的 `mods.toml` 文件中指定 `updateJSONURL` 参数。该参数的值应该是一个指向更新JSON文件的有效URL。此文件可以托管在您自己的Web服务器、GitHub或任何您想要的地方，只要所有使用您的mod的用户都可以可靠地访问它。

更新JSON格式
------------------

JSON本身具有相对简单的格式，如下所示：

```js
{
  "homepage": "<您的mod的主页/下载页面>",
  "<mcversion>": {
    "<modversion>": "<此版本的更新日志>", 
    // 列出给定Minecraft版本的所有版本的您的mod，以及它们的更新日志
    // ...
  },
  "promos": {
    "<mcversion>-latest": "<modversion>",
    // 声明给定Minecraft版本的最新的“最新”版本的您的mod
    "<mcversion>-recommended": "<modversion>",
    // 声明给定Minecraft版本的最新的“稳定”版本的您的mod
    // ...
  }
}
```

这相当容易理解，但一些注意事项：

* `homepage` 下的链接是当mod过期时将向用户显示的链接。
* Forge使用内部算法来确定您的mod的一个版本字符串是否比另一个版本字符串“更新”。大多数版本方案都应该是兼容的，但如果您担心您的方案是否受支持，请参阅 `ComparableVersion` 类。强烈建议遵循[Maven版本规范][mvnver]。
* 更新日志字符串可以使用 `\n` 分隔成行。一些人喜欢包含一个简短的更新日志，然后链接到一个提供完整更改列表的外部网站。
* 手动输入数据可能会很烦琐。您可以将您的 `build.gradle` 配置为在构建发布时自动更新此文件，因为 Groovy 具有原生的JSON解析支持。将此操作留给读者作为练习。

- 这里有一些示例，[nocubes][], [Corail Tombstone][corail] 和 [Chisels & Bits 2][chisel]。

检索更新检查结果
-------------------------------

您可以使用 `VersionChecker#getResult(IModInfo)` 检索 Forge 更新检查器的结果。您可以通过 `ModContainer#getModInfo` 获取您的 `IModInfo`。您可以在构造函数中使用 `ModLoadingContext.get().getActiveContainer()`，`ModList.get().getModContainerById(<your modId>)` 或 `ModList.get().getModContainerByObject(<your mod instance>)` 获取您的 `ModContainer`。您可以使用 `ModList.get().getModContainerById(<modId>)` 获取任何其他 mod 的 `ModContainer`。返回的对象具有一个 `#status` 方法，该方法指示版本检查的状态。

|          状态 | 描述 |
|----------------:|:------------|
|        `FAILED` | 版本检查器无法连接到提供的URL。 |
|    `UP_TO_DATE` | 当前版本等于推荐版本。 |
|         `AHEAD` | 如果没有最新版本，当前版本比推荐版本新。 |
|      `OUTDATED` | 有新的推荐或最新版本。 |
| `BETA_OUTDATED` | 有新的最新版本。 |
|          `BETA` | 当前版本等于或比最新版本更新。 |
|       `PENDING` | 请求的结果尚未完成，因此您应该稍后重试。 |

返回的对象还将具有目标版本和任何在 `update.json` 中指定的更新日志行。

[mvnver]: ../gettingstarted/versioning.md
[nocubes]: https://cadiboo.github.io/projects/nocubes/update.json
[corail]: https://github.com/Corail31/tombstone_lite/blob/master/update.json
[chisel]: https://github.com/Aeltumn/Chisels-and-Bits-2/blob/master/update.json
