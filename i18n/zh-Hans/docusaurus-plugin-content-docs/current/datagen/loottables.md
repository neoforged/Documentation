# 战利品表生成
=====================

通过构建一个新的 `LootTableProvider` 并提供 `LootTableProvider$SubProviderEntry`，可以为模组生成[战利品表][loottable]。提供者必须被[添加][datagen]到 `DataGenerator`。

```java
// 在 MOD 事件总线上
@SubscribeEvent
public void gatherData(GatherDataEvent event) {
    event.getGenerator().addProvider(
        // 告诉生成器仅在生成服务器数据时运行
        event.includeServer(),
        output -> new MyLootTableProvider(
          output,
          // 指定需要生成的表的注册名称，或者可以留空
          Collections.emptySet(),
          // 生成战利品的子提供者
          List.of(subProvider1, subProvider2, /*...*/)
        )
    );
}
```

`LootTableSubProvider`
----------------------

每个 `LootTableProvider$SubProviderEntry` 都接收一个 `LootTableSubProvider`，它为给定的 `LootContextParamSet` 生成战利品表。`LootTableSubProvider` 包含一个方法，该方法接收写入者（`BiConsumer<ResourceLocation, LootTable.Builder>`）来生成表。

```java
public class ExampleSubProvider implements LootTableSubProvider {

  // 用于创建封装 Supplier 的工厂方法
  public ExampleSubProvider() {}

  // 用于生成战利品表的方法
  @Override
  public void generate(BiConsumer<ResourceLocation, LootTable.Builder> writer) {
    // 在这里通过调用 writer#accept 生成战利品表
  }
}
```

然后可以将表添加到 `LootTableProvider#getTables` 中，适用于任何可用的 `LootContextParamSet`：

```java
// 传递到 LootTableProvider 构造函数的列表中
new LootTableProvider.SubProviderEntry(
  ExampleSubProvider::new,
  // 为 'empty' 参数集生成战利品表
  LootContextParamSets.EMPTY
)
```

### `BlockLootSubProvider` 和 `EntityLootSubProvider` 子类

对于 `LootContextParamSets#BLOCK` 和 `#ENTITY`，有特殊类型（分别是 `BlockLootSubProvider` 和 `EntityLootSubProvider`），它们提供额外的辅助方法来创建和验证是否存在战利品表。

`BlockLootSubProvider` 的构造函数接受一个物品列表，用于确定如果一个方块被爆炸时是否可以生成战利品表，以及一个 `FeatureFlagSet`，用于确定是否启用了方块以便为其生成战利品表。

```java
// 在某个 BlockLootSubProvider 子类中
public MyBlockLootSubProvider() {
  super(Collections.emptySet(), FeatureFlags.REGISTRY.allFlags());
}
```

`EntityLootSubProvider` 的构造函数接受一个 `FeatureFlagSet`，用于确定是否启用了实体类型以便为其生成战利品表。

```java
// 在某个 EntityLootSubProvider 子类中
public MyEntityLootSubProvider() {
  super(FeatureFlags.REGISTRY.allFlags());
}
```

要使用它们，所有已注册的对象必须分别提供给 `BlockLootSubProvider#getKnownBlocks` 和 `EntityLootSubProvider#getKnownEntityTypes`。这些方法确保迭代中的所有对象都有一个战利品表。

:::tip
如果使用 `DeferredRegister` 来注册模组的对象，则 `#getKnown*` 方法可以通过 `DeferredRegister#getEntries` 提供条目：

```java
// 在某个 BlockLootSubProvider 子类中，用于某个 DeferredRegister BLOCK_REGISTRAR
@Override
protected Iterable<Block> getKnownBlocks() {
  return BLOCK_REGISTRAR.getEntries() // 获取所有注册的条目
    .stream() // 流式处理封装的对象
    .flatMap(RegistryObject::stream) // 如果可用，则获取对象
    ::iterator; // 创建迭代器
}
```
:::

通过实现 `#generate` 方法可以添加战利品表。

```java
// 在某个 BlockLootSubProvider 子类中
@Override
public void

 generate() {
  // 在这里添加战利品表
}
```

战利品表生成器
-------------------

战利品表通过 `LootTableSubProvider` 接收为 `LootTable$Builder`。之后，指定的 `LootContextParamSet` 在 `LootTableProvider$SubProviderEntry` 中设置，然后通过 `#build` 构建。在构建之前，构建器可以指定条目、条件和修饰符，这些因素影响战利品表的功能。

:::note
战利品表的功能非常广泛，本文档无法全部涵盖。相反，每个组件将简要描述。每个组件的具体子类型可以使用 IDE 查找。它们的实现将留给读者作为练习。
:::

### LootTable

战利品表是基本对象，可以使用 `LootTable#lootTable` 转换为所需的 `LootTable$Builder`。战利品表可以通过指定的方式构建，包括一系列池（通过 `#withPool` 应用）以及函数（通过 `#apply`），用于修改这些池的结果物品。

### LootPool

战利品池代表一个执行操作的组，并可以使用 `LootPool#lootPool` 生成一个 `LootPool$Builder`。每个战利品池可以指定条目（通过 `#add`），这些条目定义池中的操作，条件（通过 `#when`）定义是否应执行池中的操作，以及函数（通过 `#apply`）修改条目的结果物品。每个池可以执行尽可能多的次数（通过 `#setRolls`）。此外，还可以指定额外的执行次数（通过 `#setBonusRolls`），这受到执行者幸运值的影响。

### LootPoolEntryContainer

战利品条目定义了选中时要执行的操作，通常生成物品。每个条目都有一个相关的、[已注册][registered]的 `LootPoolEntryType`。它们还有自己的相关构建器，这些构建器是 `LootPoolEntryContainer$Builder` 的子类型。多个条目可以同时执行（通过 `#append`）或顺序执行，直到一个失败（通过 `#then`）。此外，条目可以在失败时默认为另一个条目（通过 `#otherwise`）。

### LootItemCondition

战利品条件定义了执行某些操作所需满足的要求。每个条件都有一个相关的、[已注册][registered]的 `LootItemConditionType`。它们还有自己的相关构建器，这些构建器是 `LootItemCondition$Builder` 的子类型。默认情况下，指定的所有战利品条件必须为真，才能执行操作。也可以指定战利品条件，使得只需一个条件为真即可（通过 `#or`）。此外，条件的结果输出可以被反转（通过 `#invert`）。

### LootItemFunction

战利品函数在将执行结果传递给输出之前修改结果。每个函数都有一个相关的、[已注册][registered]的 `LootItemFunctionType`。它们还有自己的相关构建器，这些构建器是 `LootItemFunction$Builder` 的子类型。

#### NbtProvider

NBT 提供者是由 `CopyNbtFunction` 定义的特殊类型函数。它们定义了从哪里拉取标签信息。每个提供者都有一个相关的、[已注册][registered]的 `LootNbtProviderType`。

### NumberProvider

数字提供者决定战利品池执行的次数。每个提供者都有一个相关的、[已注册][registered]的 `LootNumberProviderType`。

#### ScoreboardNameProvider

记分板提供者是由 `ScoreboardValue` 定义的一种特殊类型的数字提供者。它们定义了从哪个记分板拉取执行次数的名字。每个提供者都有一个关联的[已注册][registered]`LootScoreProviderType`。

[loottable]: ../../resources/server/loottables.md
[datagen]: ../index.md#data-providers
[registered]: ../../concepts/registries.md
