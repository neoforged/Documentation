# 资源

资源是游戏使用的外部文件，但不包括代码。在 Minecraft 生态系统中，最常见的资源类型是纹理，但还有许多其他类型的资源。当然，所有这些资源都需要代码端的消费系统，因此本节也将对这些系统进行分组。

Minecraft 通常有两种资源：客户端资源，称为资产，以及服务器端资源，称为数据。资产主要是显示信息，例如纹理、显示模型、翻译或声音，而数据包括影响游戏玩法的各种内容，如战利品表、配方或世界生成信息。它们分别从资源包和数据包中加载。NeoForge 为每个模组生成内置的资源包和数据包。

无论资源包还是数据包，通常都需要一个 [`pack.mcmeta` 文件][packmcmeta]，在过去的 Forge 版本中也是如此。然而，NeoForge 为您在运行时生成了这些文件，因此您无需再担心。

如果您对某个格式感到困惑，请查看原版资源。您的 NeoForge 开发环境不仅包含原版代码，还包含原版资源。它们可以在 External Resources 部分（IntelliJ）/Project Libraries 部分（Eclipse）中找到，名称为 `ng_dummy_ng.net.minecraft:client:client-extra:<minecraft_version>`（对于 Minecraft 资源）或 `ng_dummy_ng.net.neoforged:neoforge:<neoforge_version>`（对于 NeoForge 资源）。

## 资产

_另见：[Minecraft Wiki 上的资源包][mcwikiresourcepacks]_

资产，或客户端资源，是所有仅在[客户端][sides]上相关的资源。它们从资源包中加载，有时也被称为旧术语纹理包（源自旧版本，当时它们只能影响纹理）。资源包基本上是一个 `assets` 文件夹。`assets` 文件夹包含资源包包含的各种命名空间的子文件夹；每个命名空间是一个子文件夹。例如，一个模组的资源包可能包含 `coolmod` 命名空间，但可能还包括其他命名空间，例如 `minecraft`。

NeoForge 自动将所有模组资源包收集到 `Mod resources` 包中，该包位于资源包菜单中的 Selected Packs 边的底部。当前无法禁用 `Mod resources` 包。但是，位于 `Mod resources` 包上方的资源包可以覆盖位于其下的资源包中定义的资源。这种机制允许资源包制作者覆盖您的模组资源，并允许模组开发者覆盖 Minecraft 资源。

资源包可以包含 [模型][models]、[方块状态文件][bsfile]、[纹理][textures]、[声音][sounds]、[粒子定义][particles] 和 [翻译文件][translations]。

## 数据

_另见：[Minecraft Wiki 上的数据包][mcwikidatapacks]_

与资产不同，数据是所有[服务器][sides]资源的术语。与资源包类似，数据通过数据包加载。像资源包一样，数据包由 [`pack.mcmeta` 文件][packmcmeta] 和一个名为 `data` 的根文件夹组成。然后，同样像资源包一样，`data` 文件夹包含数据包包含的各种命名空间的子文件夹；每个命名空间是一个子文件夹。例如，一个模组的数据包可能包含 `coolmod` 命名空间，但可能还包括其他命名空间，例如 `minecraft`。

NeoForge 在创建新世界时自动应用所有模组数据包。当前无法禁用模组数据包。但是，大多数数据文件可以通过具有更高优先级的数据包覆

盖（因此可以通过替换为空文件来删除）。通过将数据包放置在世界的 `datapacks` 子文件夹中，然后通过 [`/datapack`][datapackcmd] 命令启用或禁用它们，可以启用或禁用额外的数据包。

:::info
目前没有内置的方法将一组自定义数据包应用到每个世界。然而，有许多模组可以实现这一点。
:::

数据包可能包含影响以下事物的文件夹：

| 文件夹名称 | 内容 |
|---------|------|
| `advancements` | [进度][advancements] |
| `damage_type` | 伤害类型 |
| `loot_tables` | [战利品表][loottables] |
| `recipes` | [配方][recipes] |
| `structures` | 结构 |
| `tags` | [标签][tags] |
| `dimension`, `dimension_type`, `worldgen`, `neoforge/biome_modifiers` | 世界生成文件 |
| `neoforge/global_loot_modifiers` | [全局战利品修饰器][glm] |

此外，它们还可能包含一些与命令集成的系统的子文件夹。这些系统很少与模组一起使用，但无论如何都值得一提：

| 文件夹名称 | 内容 |
|---------|------|
| `chat_type` | [聊天类型][chattype] |
| `functions` | [功能][function] |
| `item_modifiers` | [物品修饰器][itemmodifier] |
| `predicates` | [条件判断][predicate] |

## `pack.mcmeta`

_另见：[Minecraft Wiki 上的 `pack.mcmeta` (资源包)][packmcmetaresourcepack] 和 `pack.mcmeta` (数据包)][packmcmetadatapack]_

`pack.mcmeta` 文件保存资源包或数据包的元数据。对于模组来说，NeoForge 让这个文件变得多余，因为 `pack.mcmeta` 是合成生成的。如果您仍需要一个 `pack.mcmeta` 文件，完整的规范可以在链接的 Minecraft Wiki 文章中找到。

## 数据生成

数据生成，俗称 datagen，是一种以编程方式生成 JSON 资源文件的方式，以避免手动编写它们时的繁琐和容易出错的过程。这个名字有点误导，因为它适用于资产和数据。

Datagen 通过为您生成的客户端和服务器运行配置旁的数据运行配置来运行。数据运行配置遵循[模组生命周期][lifecycle]，直到注册事件触发之后。然后触发 [`GatherDataEvent`][event]，在该事件中，您可以注册您要生成的对象，以数据提供者的形式，将所述对象写入磁盘，并结束过程。

所有数据提供者都扩展了 `DataProvider` 接口，通常需要重写一个方法。以下是 Minecraft 和 NeoForge 提供的一些值得注意的数据生成器（链接文章提供了更多信息，如辅助方法）：

| 类 | 方法 | 生成 | 方面 | 备注 |
|---|----|-----|----|----|
| [`BlockStateProvider`][blockstateprovider] | `registerStatesAndModels()` | 方块状态文件，方块模型 | 客户端 | |
| [`ItemModelProvider`][itemmodelprovider] | `registerModels()` | 物品模型 | 客户端 | |
| [`LanguageProvider`][langprovider] | `addTranslations()` | 翻译 | 客户端 | 构造函数还需要传递语言。 |
| [`ParticleDescriptionProvider`][particleprovider] | `addDescriptions()` | 粒子定义 | 客户端 | |
| [`SoundDefinitionsProvider`][soundprovider] | `registerSounds()` | 声音定义 | 客户端 | |
| [`AdvancementProvider`][advancementprovider] | `generate()` | 进度 | 服务器 | 确保使用 NeoForge 变体，而不是 Minecraft 本身

。 |
| [`LootTableProvider`][loottableprovider] | `generate()` | 战利品表 | 服务器 | 需要额外的方法和类才能正常工作，详情请参阅链接文章。 |
| [`RecipeProvider`][recipeprovider] | `buildRecipes(RecipeOutput)` | 配方 | 服务器 | |
| [多个 `TagsProvider` 的子类][tagsprovider] | `addTags(HolderLookup.Provider)` | 标签 | 服务器 | 存在几个专门的子类，例如 `BlockTagsProvider`。如果您需要的不存在，请扩展 `TagsProvider`（或适用时扩展 `IntrinsicHolderTagsProvider`），将您的标签类型作为泛型参数。 |
| [`DatapackBuiltinEntriesProvider`][datapackprovider] | N/A | 数据包内置条目，例如世界生成 | 服务器 | 详情请参阅链接文章。 |
| [`DataMapProvider`][datamapprovider] | `gather()` | 数据映射条目 | 服务器 | |
| [`GlobalLootModifierProvider`][glmprovider] | `start()` | 全局战利品修饰器 | 服务器 | |

所有这些提供者都遵循相同的模式。首先，创建一个子类并添加您自己要生成的资源。然后，在[事件处理器][eventhandler]中添加提供者。使用 `RecipeProvider` 的一个示例：

```java
public class MyRecipeProvider extends RecipeProvider {
    public MyRecipeProvider(PackOutput output) {
        super(output);
    }
    
    @Override
    protected void buildRecipes(RecipeOutput output) {
        // 在这里注册您的配方。
    }
}

@Mod.EventBusSubscriber(bus = Mod.EventBusSubscriber.Bus.MOD, modid = "examplemod")
public class MyDatagenHandler {
    @SubscribeEvent
    public static void gatherData(GatherDataEvent event) {
        // 数据生成器可能需要这些作为构造函数参数。
        // 详情请参阅下文每个部分。
        DataGenerator generator = event.getGenerator();
        PackOutput output = generator.getPackOutput();
        ExistingFileHelper existingFileHelper = event.getExistingFileHelper();
        CompletableFuture<HolderLookup.Provider> lookupProvider = event.getLookupProvider();
        
        // 注册提供者。
        generator.addProvider(
                // 一个布尔值，确定是否实际生成数据。
                // 事件提供了确定这一点的方法：
                // event.includeClient(), event.includeServer(),
                // event.includeDev() 和 event.includeReports()。
                // 由于配方是服务器数据，我们只在服务器数据生成中运行它们。
                event.includeServer(),
                // 我们的提供者。
                new MyRecipeProvider(output)
        );
        // 在这里注册其他数据提供者。
    }
}
```

事件提供了一些上下文供您使用：

- `event.getGenerator()` 返回您注册提供者的 `DataGenerator`。
- `event.getPackOutput()` 返回 `PackOutput`，一些提供者用它来确定文件输出位置。
- `event.getExistingFileHelper()` 返回 `ExistingFileHelper`，用于提供者需要引用其他文件的事物（例如，可以指定父文件的方块模型）。
- `event.getLookupProvider()` 返回 `CompletableFuture<HolderLookup.Provider>`，主要用于标签和数据生成注册表引用其他尚未存在的元素。
- `event.includeClient()`、`event.includeServer()`、`event.includeDev()` 和 `event.includeReports()` 是 `boolean` 方法，允许您检查是否启用了特定的命令行参数。

### 命令行参数

数据生成器可以接受几个命令行参数：

- `--mod examplemod`: 告诉数据生成器为此模组运行数据生成。NeoGradle 为所属模组 ID 自动添加此项，如果您有多个模组在一个项目中，请添加此项。
- `--output path/to/folder`: 告诉数据生成器输出到给定文件夹。建议使用 Gradle 的 `file(...).getAbsolutePath()` 为您生成绝对路径（相对于项目根目录的路径）。默认为 `file('src/generated/resources').getAbsolutePath()`。
- `--existing path/to/folder`: 告诉数据生成器

在检查现有文件时考虑给定文件夹。与输出一样，建议使用 Gradle 的 `file(...).getAbsolutePath()`。
- `--existing-mod examplemod`: 告诉数据生成器在检查现有文件时考虑给定模组的 JAR 文件中的资源。
- 生成器模式（所有这些都是布尔参数，不需要任何额外的参数）：
  - `--includeClient`: 是否生成客户端资源（资产）。在运行时检查 `GatherDataEvent#includeClient()`。
  - `--includeServer`: 是否生成服务器资源（数据）。在运行时检查 `GatherDataEvent#includeServer()`。
  - `--includeDev`: 是否运行开发工具。通常不应由模组使用。在运行时检查 `GatherDataEvent#includeDev()`。
  - `--includeReports`: 是否转储注册对象列表。在运行时检查 `GatherDataEvent#includeReports()`。
  - `--all`: 启用所有生成器模式。

所有参数可以通过在 `build.gradle` 中添加以下内容来添加到运行配置中：

```groovy
runs {
    // 这里有其他运行配置
    
    data {
        programArguments.addAll '--arg1', 'value1', '--arg2', 'value2', '--all' // 布尔参数没有值
    }
}
```

例如，要复制默认参数，您可以指定以下内容：

```groovy
runs {
    // 这里有其他运行配置
    
    data {
        programArguments.addAll '--mod', 'examplemod', // 插入您自己的模组 ID
                '--output', file('src/generated/resources').getAbsolutePath(),
                '--includeClient',
                '--includeServer'
    }
}
```

[advancementprovider]: ../datagen/advancements.md
[advancements]: server/advancements.md
[blockstateprovider]: client/models/datagen.md#block-model-datagen
[bsfile]: client/models/index.md#blockstate-files
[chattype]: https://minecraft.wiki/w/Chat_type
[datamap]: ../datamaps/index.md
[datamapprovider]: ../datamaps/index.md#datagen
[datapackcmd]: https://minecraft.wiki/w/Commands/datapack
[datapackprovider]: ../concepts/registries.md#data-generation-for-datapack-registries
[event]: ../concepts/events.md
[eventhandler]: ../concepts/events.md#registering-an-event-handler
[function]: https://minecraft.wiki/w/Function_(Java_Edition)
[glm]: server/glm.md
[glmprovider]: ../datagen/glm.md
[itemmodelprovider]: client/models/datagen.md#item-model-datagen
[itemmodifier]: https://minecraft.wiki/w/Item_modifier
[langprovider]: client/i18n.md#datagen
[lifecycle]: ../concepts/events.md#the-mod-lifecycle
[loottableprovider]: ../datagen/loottables.md
[loottables]: server/loottables.md
[mcwiki]: https://minecraft.wiki
[mcwikidatapacks]: https://minecraft.wiki/w/Data_pack
[mcwikiresourcepacks]: https://minecraft.wiki/w/Resource_pack
[models]: client/models/index.md
[packmcmeta]: #pack.mcmeta
[packmcmetadatapack]: https://minecraft.wiki/w/Data_pack#pack.mcmeta
[packmcmetaresourcepack]: https://minecraft.wiki/w/Resource_pack#Contents
[particleprovider]: client/particles.md#datagen
[particles]: client/particles.md
[predicate]: https://minecraft.wiki/w/Predicate
[recipeprovider]: ../datagen/recipes.md
[recipes]: server/recipes/index.md
[sides]: ../concepts/sides.md
[soundprovider]: client/sounds.md#datagen
[sounds]: client/sounds.md
[tags]: server/tags.md
[tagsprovider]: ../datagen/tags.md
[textures]: client/textures.md
[translations]: client/i18n.md#language-files
