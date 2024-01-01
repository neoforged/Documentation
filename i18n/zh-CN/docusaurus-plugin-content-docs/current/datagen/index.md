数据生成
========

数据生成器是以编程方式生成模组的资源（asset）和数据（data）的一种方式。它允许在代码中定义这些文件的内容并自动生成它们，而不必担心细节。

数据生成器系统由主类`net.minecraft.data.Main`加载。可以传递不同的命令行参数来自定义收集了哪些模组的数据，考虑了哪些现有文件等。负责数据生成的类是`net.minecraft.data.DataGenerator`。

MDK的`build.gradle`中的默认配置添加了用于运行数据生成器的`runData`任务。

现存的文件
---------
对未为数据生成而生成的纹理或其他数据文件的所有引用都必须引用系统上的现有文件。这是为了确保所有引用的纹理都在正确的位置，这样就可以找到并更正拼写错误。

`ExistingFileHelper`是负责验证这些数据文件是否存在的类。可以从`GatherDataEvent#getExistingFileHelper`中检索实例。

`--existing <folderpath>`参数允许在验证文件是否存在时使用指定的文件夹及其子文件夹。此外，`--existing-mod <modid>`参数允许将加载的模组的资源用于验证。默认情况下，只有普通的数据包和资源可用于`ExistingFileHelper`。

生成器模式
---------

数据生成器可以配置为运行4个不同的数据生成，这些数据生成是通过命令行参数配置的，并且可以通过`GatherDataEvent#include***`方法进行检查。

* __Client Assets__
  * 在`assets`中生成仅客户端文件：f方块/物品模型、方块状态JSON、语言文件等。
  * __`--client`__, `#includeClient`
* __Server Data__
  * 在`data`中生成仅服务端文件：配方、进度、标签等。
  * __`--server`__, `#includeServer`
* __Development Tools__
  * 运行一些开发工具：将SNBT转换为NBT，反之亦然，等等。
  * __`--dev`__, `#includeDev`
* __Reports__
  * 转储所有已注册的方块、物品、命令等。
  * __`--reports`__, `#includeReports`

所有的生成器都可以使用`--all`包含在内。

数据提供者
---------

数据提供者是实际定义将生成和提供哪些数据的类。所有数据提供者都实现`DataProvider`。Minecraft对大多数asset和data都有抽象实现，因此模组开发者只需要扩展和覆盖指定的方法。

当创建数据生成器时，在模组事件总线上触发`GatherDataEvent`，并且可以从事件中获取`DataGenerator`。使用`DataGenerator#addProvider`创建和注册数据提供者。

### 客户端资源（Assets）
* [`net.minecraftforge.common.data.LanguageProvider`][langgen] - 针对[语言设置][lang]；实现`#addTranslations`
* [`net.minecraftforge.common.data.SoundDefinitionsProvider`][soundgen] - 针对[`sounds.json`][sounds]；实现`#registerSounds`
* [`net.minecraftforge.client.model.generators.ModelProvider<?>`][modelgen] - 针对[模型]；实现`#registerModels`
    * [`ItemModelProvider`][itemmodelgen] - 针对物品模型
    * [`BlockModelProvider`][blockmodelgen] - 针对方块模型
* [`net.minecraftforge.client.model.generators.BlockStateProvider`][blockstategen] - 针对方块状态JSON以及其方块和物品模型；实现`#registerStatesAndModels`

### 服务端数据（Data）

**这些类在`net.minecraftforge.common.data`包之下**:

* [`GlobalLootModifierProvider`][glmgen] - 针对[全局战利品修改器][glm]；实现`#start`
* [`DatapackBuiltinEntriesProvider`][datapackregistriesgen] - 针对数据包注册表对象；向构造函数传递`RegistrySetBuilder`

**这些类在`net.minecraft.data`包之下**:

* [`loot.LootTableProvider`][loottablegen] - 针对[战利品表][loottable]；向构造函数传递`LootTableProvider$SubProviderEntry`
* [`recipes.RecipeProvider`][recipegen] - 针对[配方]以及其解锁的进度；实现`#buildRecipes`
* [`tags.TagsProvider`][taggen] - 针对[标签]；实现`#addTags`
* [`advancements.AdvancementProvider`][advgen] - 针对[进度]；向构造函数传递`AdvancementSubProvider`

[langgen]: ./client/localization.md
[lang]: https://minecraft.wiki/w/Language
[soundgen]: ./client/sounds.md
[sounds]: https://minecraft.wiki/w/Sounds.json
[modelgen]: ./client/modelproviders.md
[models]: ../resources/client/models/index.md
[itemmodelgen]: ./client/modelproviders.md#itemmodelprovider
[blockmodelgen]: ./client/modelproviders.md#blockmodelprovider
[blockstategen]: ./client/modelproviders.md#block-state-provider
[glmgen]: ./server/glm.md
[glm]: ../resources/server/glm.md
[datapackregistriesgen]: ./server/datapackregistries.md
[loottablegen]: ./server/loottables.md
[loottable]: ../resources/server/loottables.md
[recipegen]: ./server/recipes.md
[recipes]: ../resources/server/recipes/index.md
[taggen]: ./server/tags.md
[tags]: ../resources/server/tags.md
[advgen]: ./server/advancements.md
[advancements]: ../resources/server/advancements.md
