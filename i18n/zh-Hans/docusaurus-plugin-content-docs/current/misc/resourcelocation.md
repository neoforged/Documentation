# 资源位置

`ResourceLocation` 是 Minecraft 中最重要的内容之一。它们用作[注册表][registries]中的键，作为数据或资源文件的标识符，作为代码中模型的引用，以及许多其他地方。`ResourceLocation` 由两部分组成：命名空间和路径，由 `:` 分隔。

命名空间表示资源位置所指的 mod、资源包或数据包。例如，具有模组 ID `examplemod` 的模组将使用 `examplemod` 命名空间。Minecraft 使用 `minecraft` 命名空间。可以根据需要定义额外的命名空间，只需创建相应的数据文件夹，这通常是由数据包执行的，以将其逻辑与 Vanilla 分开。

路径是指你的命名空间内的任何对象的引用。例如，`minecraft:cow` 是指 `minecraft` 命名空间中名为 `cow` 的对象 - 通常此位置将用于从实体注册表中获取 cow 实体。另一个示例是 `examplemod:example_item`，它可能用于从项注册表中获取模组的 `example_item`。

`ResourceLocation` 只能包含小写字母、数字、下划线、点和连字符。路径可能还包含斜杠。请注意，由于 Java 模块的限制，模组 ID 不得包含连字符，这意味着模组命名空间也不得包含连字符（路径仍然允许包含）。

:::info
`ResourceLocation` 本身并不表示我们要使用它的对象的类型。例如，名为 `minecraft:dirt` 的对象存在于多个位置。由接收 `ResourceLocation` 的对象决定将对象与其关联。
:::

可以通过调用 `new ResourceLocation("examplemod", "example_item")` 或 `new ResourceLocation("examplemod:example_item")` 来创建新的 `ResourceLocation` 实例。如果使用后者，并且字符串不包含 `:`，则整个字符串将用作路径，而 `minecraft` 将用作命名空间。因此，例如 `new ResourceLocation("example_item")` 将导致 `minecraft:example_item`。

可以使用 `ResourceLocation#getNamespace()` 和 `#getPath()` 分别检索 `ResourceLocation` 的命名空间和路径，并通过 `ResourceLocation#toString()` 检索组合形式。

`ResourceLocation` 是不可变的。`ResourceLocation` 上的所有实用方法，例如 `withPrefix` 或 `withSuffix`，都返回一个新的 `ResourceLocation`。

## 解析 `ResourceLocation`

某些位置，例如注册表，直接使用 `ResourceLocation`。然而，其他一些位置将根据需要解析 `ResourceLocation`。例如：

- `ResourceLocation` 用作 GUI 背景的标识符。例如，熔炉 GUI 使用资源位置 `minecraft:textures/gui/container/furnace.png`。这映射到磁盘上的文件 `assets/minecraft/textures/gui/container/furnace.png`。请注意，在此资源位置中需要 `.png` 后缀。
- `ResourceLocation` 用作方块模型的标识符。例如，泥土的方块模型使用资源位置 `minecraft:block/dirt`。这映射到磁盘上的文件 `assets/minecraft/models/block/dirt.json`。请注意，在此资源位置中不需要 `.json` 后缀。还请注意，此资源位置自动映射到 `models` 子文件夹。
- `ResourceLocation` 用作配方的标识符。例如，铁块的合成配方使用资源位置 `minecraft:iron_block`。这映射到磁盘上的文件 `data/minecraft/recipes/iron_block.json`。请注意，在此资源位置中不需要 `.json` 后缀。还请注意，此资源位置自动映射到 `recipes` 子文件夹。

`ResourceLocation` 是否需要文件后缀，以及资源位置解析为什么内容，取决于使用情况。

## `ModelResourceLocation`

`ModelResourceLocation` 是一种特殊类型的资源位置，包含第三部分，称为变体。Minecraft 主要用于区分模型的不同变体，在不同的显示上下文中使用不同的变体（例如三叉戟，在第一人称、第三人称和库存中有不同的模型）。对于项，变体始终为 `inventory`，对于块状态，变体是由属性-值对的逗号分隔字符串组成的（例如 `facing=north,waterlogged=false`），对于没有块状态属性的块为空。

变体附加到常规资源位置，以及 `#`。例如，钻石剑的项模型的完整名称是 `minecraft:diamond_sword#inventory`。然而，在大多数情况下，`inventory` 变体可以省略。

`ModelResourceLocation` 是一个[仅客户端][sides]的类。这意味着引用该类的服务器将因为 `NoClassDefFoundError` 而崩溃。

## `ResourceKey`

`ResourceKey` 将注册表 ID 与注册表名称结合在一起。一个示例是具有注册表 ID `minecraft:item` 和注册表名称 `minecraft:diamond_sword` 的注册表键。与 `ResourceLocation` 不同，`ResourceKey` 实际上指代一个唯一的元素，因此能够清楚地识别一个元素。它们通常用于许多不同的注册表相互接触的情况。一个常见的用例是数据包，特别是世界生成。

可以通过静态方法 `ResourceKey#create(ResourceKey<? extends Registry<T>>, ResourceLocation)` 创建新的 `ResourceKey`。这里的第二个参数是注册表名称，而第一个参数是所谓的注册表键。注册表键是一种特殊的 `ResourceKey`，其注册表是根注册表（即所有其他注册表的注册表）。可以通过 `ResourceKey#createRegistryKey(ResourceLocation)` 创建所需注册表的注册表键。

`ResourceKey` 在创建时进行了内部化。这意味着可以并且鼓励通过引用相等性（`==`）进行比较，但它们的创建相对较昂贵。

[registries]: ../concepts/registries.md
[sides]: ../concepts/sides.md
