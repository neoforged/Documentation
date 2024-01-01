版本号
======

在一般项目中，语义式的版本号（格式为`MAJOR.MINOR.PATCH`）被经常使用。然而，在长期性地修改的情况下，使用格式`MCVERSION-MAJORMOD.MAJORAPI.MINOR.PATCH`可能更有利于将模组的创世性的修改与API变更性的修改区分开来。

:::note
    Forge使用[Maven版本范围][cmpver]来比较版本字符串，这与Semantic Versioning 2.0.0规范不完全兼容，例如“prerelease”标签。
:::

样例
----

以下是在不同情形下能递增各种变量的示例列表。

* `MCVERSION`
  * 始终与该模组所适用的Minecraft版本相匹配。
* `MAJORMOD`
  * 移除物品、方块、方块实体等。
  * 改变或移除之前存在的机制。
  * 升级到新的Minecraft版本。
* `MAJORAPI`
  * 更改枚举的顺序或变量。
  * 更改方法的返回类型。
  * 一并移除公共方法。
* `MINOR`
  * 添加物品、方块、方块实体等。
  * 添加新机制。
  * 废弃公共方法。（这不是一次`MAJORAPI`递增，因为它并未改变API。）
* `PATCH`
  * Bug修复。

当递增任何变量时，所有更小级别的变量都应重置为`0`。例如，如果`MINOR`递增，`PATCH`将变为`0`。如果`MAJORMOD`递增，则所有其他变量将变为`0`。

### 项目初始阶段

如果你正处于模组的初始开发阶段（在任何正式发布之前），`MAJORMOD`和`MAJORAPI`应始终为`0`。只有`MINOR`和`PATCH`应该在每次构建你的模组时更新。一旦你构建了一个官方版本（大多数情况下应使用稳定的API），你应该将`MAJORMOD`增加到版本`1.0.0.0`。有关任何进一步的开发阶段，请参阅本文档的[预发布][pre]和[候选发布][rc]部分。

### 多个Minecraft版本

如果模组升级到新版本的Minecraft，而旧版本将只会得到bug修复，则`PATCH`变量应根据升级前的版本进行更新。如果模组针对旧版本和新版本的Minecraft都仍在积极开发中，建议将该版本附加到**所有**两个Minecraft版本号之后。例如，如果模组由于Minecraft版本的更改而升级到`3.0.0.0`版本，那么旧版本的模组也应该更新到`3.0.0.0`。又例如，旧版本将变成`1.7.10-3.0.0.0`版本，而新版本将变成`1.8-3.0.0.0`版本。如果在为新的Minecraft版本构建时模组本身并没有任何更改，那么除了Minecraft版本之外的所有变量都应该保持不变。

### 最终发布

当放弃对某个Minecraft版本的支持时，针对该版本的最后一个模组构建版本应该有`-final`后缀。这意味着模组对于所表示的`MCVERSION`将不再支持，玩家应该升级到模组所支持的新版本的Minecraft，以继续接收更新和bug修复。

### 预发布

（本指南不使用`-pre`，因为在撰写本文时，它不是`-beta`的有效别名。）请注意，已经发布的版本和首次发布之前的版本不能进入预发布；变量（主要是`MINOR`，但`MAJORAPI`和`MAJORMOD`也可以预发布）应该在添加`-beta`后缀之前进行相应的更新。首次发布之前的版本只是在建版本。

### 候选发布

候选发布在实际版本更替之前充当预发布。这些版本应该附加`-rcX`，其中`X`是候选版本的数量，理论上，只有在修复bug时才应该增加。已经发布的版本无法接收候选版本；在添加`-rc`后缀之前，应该相应地更新变量（主要是`MINOR`，但`MAJORAPI`和`MAJORMOD`也可以预发布）。当作为稳定构建版本发布候选版本时，它既可以与上一个候选版本完全相同，也可以有更多的bug修复。

[semver]: https://semver.org/
[cmpver]: https://maven.apache.org/ref/3.5.2/maven-artifact/apidocs/org/apache/maven/artifact/versioning/ComparableVersion.html
[pre]: #pre-releases
[rc]: #release-candidates
