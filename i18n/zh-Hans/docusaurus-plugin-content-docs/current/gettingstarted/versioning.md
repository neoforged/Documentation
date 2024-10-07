# 版本管理

本文将详细解释 Minecraft 和 NeoForge 的版本管理方式，并为模组版本提供一些建议。

## Minecraft

Minecraft 使用[语义化版本控制][semver]（semantic versioning，简称 "semver"），格式为 `major.minor.patch`。例如，Minecraft 1.20.2 的主版本号（major）为 1，次版本号（minor）为 20，修订号（patch）为 2。

自从 2011 年 Minecraft 1.0 发布以来，Minecraft 的主版本号一直使用 `1`。在此之前，版本号方案经常变化，有诸如 `a1.1`（Alpha 1.1）、`b1.7.3`（Beta 1.7.3）甚至 `infdev` 版本，这些版本根本没有遵循明确的版本控制方案。由于 `1` 作为主版本号已经持续了十多年，并且鉴于 Minecraft 2 的内部笑话，通常认为这一情况不太可能改变。

### 快照版

快照版偏离了标准的 semver 方案。它们被标记为 `YYwWWa`，其中 `YY` 代表年份的最后两位数字（例如 `23`），`WW` 代表那年的周数（例如 `01`）。例如，快照 `23w01a` 是 2023 年第一周发布的快照。

`a` 后缀用于同一周发布两个快照的情况（第二个快照则被命名为 `23w01b`）。Mojang 过去偶尔使用过这种方式。此外，还有像 `20w14infinite` 这样的快照，它是[2020 年无限维度愚人节玩笑][infinite]。

### 预发布和候选发布版本

当快照周期接近完成时，Mojang 开始发布所谓的预发布版本。预发布版本被视为功能完整的版本，专注于修复bug。它们使用 semver 格式并附加 `-preX` 后缀。例如，1.20.2 的第一个预发布版本被命名为 `1.20.2-pre1`。通常会有多个预发布版本，相应地使用 `-pre2`、`-pre3` 等后缀。

类似地，当预发布周期完成时，Mojang 发布第一个候选发布版本（后缀为 `-rc1`，例如 `1.20.2-rc1`）。Mojang 的目标是发布一个候选版本，如果没有进一步的 bug 出现，则可以发布该版本。然而，如果出现意外的 bug，则可能会有 `-rc2`、`-rc3` 等版本，类似于预发布版本。

## NeoForge

NeoForge 使用一种调整过的 semver 系统：主版本号是 Minecraft 的次版本号，次版本号是 Minecraft 的修订号，而修订号则是“实际”的 NeoForge 版本。例如，NeoForge 20.2.59 是 Minecraft 1.20.2 的第 60 版（从 0 开始计数）。由于 `1` 作为开头的数字不太可能改变，请参见[上文][minecraft]了解原因。

NeoForge 的一些位置还使用了[Maven 版本范围][mvr]，例如 [`mods.toml`][modstoml] 文件中的 Minecraft 和 NeoForge 版本范围。这些主要与 semver 兼容，但有些例外（例如，它不考虑 `pre` 标签）。

## 模组

没有最佳的版本控制系统。不同的开发风格、项目范围等都会影响选择哪种版本控制系统的决定。有时，也可以组合使用多种版本控制系统。本节试图概述一些

常用的版本控制系统，并提供现实生活中的示例。

通常，模组的文件名看起来像 `modid-<version>.jar`。所以如果我们的模组ID是 `examplemod`，版本是 `1.2.3`，我们的模组文件将被命名为 `examplemod-1.2.3.jar`。

:::note
版本控制系统是建议，而不是严格执行的规则。特别是关于何时更改（"bump"）版本，以及以何种方式更改。如果您想使用不同的版本控制系统，没有人会阻止您。
:::

### 语义化版本控制

语义化版本控制（"semver"）包括三个部分：`major.minor.patch`。当对代码库进行重大更改时，主版本号会提升，这通常与重大新功能和错误修复相关。次版本号在引入次要功能时提升，修订号只包括错误修复时提升。

通常认为任何 `0.x.x` 版本都是开发版本，而第一个（完整）发布版本应该提升到 `1.0.0`。

"次要功能提升次版本号，错误修复提升修订号" 的规则在实践中经常被忽视。一个流行的例子是 Minecraft 本身，它通过次版本号进行重大功能更新，通过修订号进行次要功能更新，并在快照中修复错误（见上文）。

根据模组更新的频率，版本号可能会有所增减。例如，[Supplementaries][supplementaries]目前的版本为`2.6.31`（撰写本文时）。在`patch`版本中，出现三位或四位数字的情况完全有可能。

### “简化”与“扩展”语义化版本控制

有时候，我们可以看到只有两个数字的语义化版本控制，这种是一种“简化”语义化版本控制，或称为“2部分”语义化版本控制。这种版本号只包含`major.minor`模式。它通常用于只添加几个简单物体的小型模组，这类模组很少需要更新（除了Minecraft版本更新），常常永远停留在`1.0`版本。

而“扩展”语义化版本控制，或称为“4部分”语义化版本控制，包括四个数字（比如`1.0.0.0`）。根据模组的不同，其格式可能是`major.api.minor.patch`，或`major.minor.patch.hotfix`，或是完全不同的格式——没有统一的标准方式。

对于`major.api.minor.patch`，`major`版本与`api`版本是分离的。这意味着`major`（功能）位和`api`位可以独立提升。这种方式通常用于那些提供API供其他模组开发者使用的模组。例如，[Mekanism][mekanism]当前的版本是10.4.5.19（撰写本文时）。

对于`major.minor.patch.hotfix`，则是将修订级别分为两部分。这是[Create][create]模组使用的方法，目前版本为0.5.1f（撰写本文时）。注意，Create模组将hotfix表示为一个字母，而不是第四个数字，以保持与常规语义化版本控制的兼容。

:::info
简化语义化版本控制、扩展语义化版本控制、2部分语义化版本控制和4部分语义化版本控制并非官方术语或标准化格式。
:::

### Alpha、Beta、Release阶段

像Minecraft本身一样，模组开发通常也会经历软件工程中熟知的`alpha`/`beta`/`release`阶段，其中`alpha`代表不稳定/实验版本（有时也称为`experimental`或`snapshot`），`beta`代表半稳定版本，而`release`则代表稳定版本（有时用`stable`代替`release`）。

一些模组利用它们的主要版本号来表示Minecraft版本的更新。例如，[JEI][jei]使用`13.x.x.x`表示Minecraft 1.19.2，`14.x.x.x`表示1.19.4，以及`15.x.x.x`表示1.20.1（不存在1.19.3和1.20.0的版本）。其他一些模组则在模组名称后附加标签，例如[Minecolonies][minecolonies]模组，当前版本为`1.1.328-BETA`（撰写本文时）。

### 包含Minecraft版本

在模组文件名中包含其适用的Minecraft版本是常见做法。这使得最终用户更容易确定模组适用于哪个版本的Minecraft。这通常发生在模组版本之前或之后，前者比后者更常见。例如，JEI的最新版本`16.0.0.28`（撰写本文时）

适用于1.20.2，可能表示为`jei-1.20.2-16.0.0.28`或`jei-16.0.0.28-1.20.2`。

### 包含模组加载器

正如您可能知道的那样，NeoForge并非唯一的模组加载器，许多模组开发者在多个平台上开发。因此，需要一种方法来区分同一个模组、相同版本但适用于不同模组加载器的两个文件。

通常，这是通过在名称中包含模组加载器来实现的。例如，`jei-neoforge-1.20.2-16.0.0.28`、`jei-1.20.2-neoforge-16.0.0.28`或`jei-1.20.2-16.0.0.28-neoforge`都是有效的命名方式。对于其他模组加载器，`neoforge`部分会被替换为`forge`、`fabric`、`quilt`或您可能正在使用的其他模组加载器。

### Maven备注

Maven——用于依赖托管的系统，其版本控制系统在一些细节上与语义化版本控制不同（尽管基本的`major.minor.patch`模式仍然相同）。NeoForge的某些部分使用了相关的[Maven版本范围（MVR）][mvr]系统。在选择您的版本控制方案时，您应确保它与MVR兼容，否则模组将无法依赖您模组的特定版本！

[create]: https://www.curseforge.com/minecraft/mc-mods/create
[infinite]: https://minecraft.wiki/w/Java_Edition_20w14∞
[jei]: https://www.curseforge.com/minecraft/mc-mods/jei
[mekanism]: https://www.curseforge.com/minecraft/mc-mods/mekanism
[minecolonies]: https://www.curseforge.com/minecraft/mc-mods/minecolonies
[minecraft]: #minecraft
[modstoml]: modfiles.md#modstoml
[mvr]: https://maven.apache.org/enforcer/enforcer-rules/versionRanges.html
[mvr]: https://maven.apache.org/ref/3.5.2/maven-artifact/apidocs/org/apache/maven/artifact/versioning/ComparableVersion.html
[neoforge]: #neoforge
[pre]: #pre-releases
[rc]: #release-candidates
[semver]: https://semver.org/
[supplementaries]: https://www.curseforge.com/minecraft/mc-mods/supplementaries
