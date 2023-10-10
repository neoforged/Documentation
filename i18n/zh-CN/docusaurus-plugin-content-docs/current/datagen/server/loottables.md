战利品表生成
===========

可以通过构造新的`LootTableProvider`并提供`LootTableProvider$SubProviderEntry`来为模组生成[战利品表][loottable]。该提供者必须被[添加][datagen]到`DataGenerator`中。

```java
// 在模组事件总线上
@SubscribeEvent
public void gatherData(GatherDataEvent event) {
    event.getGenerator().addProvider(
        // 告诉生成器仅在生成服务端资源时运行
        event.includeServer(),
        output -> new MyLootTableProvider(
          output,
          // 指定需要生成的表的注册表名称，或者可留空
          Collections.emptySet(),
          // 生成战利品的子提供者
          List.of(subProvider1, subProvider2, /*...*/)
        )
    );
}
```

`LootTableSubProvider`
----------------------

每个`LootTableProvider$SubProviderEntry`接受一个提供的`LootTableSubProvider`，该`LootTableSubProvider`为给定的`LootContextParamSet`生成战利品表。`LootTableSubProvider`包含一个方法，该方法采用编写器（`BiConsumer<ResourceLocation, LootTable.Builder>`）来生成表。

```java
public class ExampleSubProvider implements LootTableSubProvider {

  // 用于为包装Supplier创建工厂方法
  public ExampleSubProvider() {}

  // 用于生成战利品表的方法
  @Override
  public void generate(BiConsumer<ResourceLocation, LootTable.Builder> writer) {
    // 在此处通过调用writer#accept生成战利品表
  }
}
```

The table can then be added to `LootTableProvider#getTables` for any available `LootContextParamSet`:

```java
// 在将会传递给LootTableProvider构造函数的列表中
new LootTableProvider.SubProviderEntry(
  ExampleSubProvider::new,
  // 'empty'参数集的战利品表生成器
  LootContextParamSets.EMPTY
)
```

### `BlockLootSubProvider`和`EntityLootSubProvider`子类

对于`LootContextParamSets#BLOCK`和`#ENTITY`，有一些特殊类型（分别为`BlockLootSubProvider`和`EntityLootSubProvider`），它们提供了额外的帮助方法来创建和验证是否存在战利品表。

`BlockLootSubProvider`的构造函数接受一个物品列表和一个`FeatureFlagSet`，前者是耐爆炸的，用于确定如果方块爆炸，是否可以生成战利品表，后者用于确定是否启用了该方块，以便为其生成战利品表。

```java
// 在某个BlockLootSubProvider子类中
public MyBlockLootSubProvider() {
  super(Collections.emptySet(), FeatureFlags.REGISTRY.allFlags());
}
```

`EntityLootSubProvider`的构造函数接受一个`FeatureFlagSet`，它确定是否启用了实体类型，以便为其生成战利品表。

```java
// 在某个EntityLootSubProvider子类中
public MyEntityLootSubProvider() {
  super(FeatureFlags.REGISTRY.allFlags());
}
```

要使用它们，所有注册的对象必须分别提供给`BlockLootSubProvider#getKnownBlocks`和`EntityLootSubProvider#getKnownEntityTypes`。这些方法是为了确保Iterable中的所有对象都有一个战利品表。

:::tip
    如果`DeferredRegister`用于注册模组的对象，则可以通过`DeferredRegister#getEntries`向`#getKnown*`方法提供条目：

    ```java
    // 在针对某个DeferredRegister BLOCK_REGISTRAR的某个BlockLootSubProvider子类中
    @Override
    protected Iterable<Block> getKnownBlocks() {
      return BLOCK_REGISTRAR.getEntries() // 获取所有已注册的条目
        .stream() // 流播所有已包装的对象
        .flatMap(RegistryObject::stream) // 如果可行，获取该对象
        ::iterator; // 创建该Iterable
    }
    ```
:::

战利品表本身可以通过实现`#generate`方法来添加。

```java
// 在某个BlockLootSubProvider子类中
@Override
public void generate() {
  // 在此处添加战利品表
}
```

战利品表生成器
-------------

要生成战利品表，它们被`LootTableSubProvider`接受为`LootTable$Builder`。之后，在`LootTableProvider$SubProviderEntry`中设置指定的`LootContextParamSet`，然后通过`#build`生成。在构建之前，生成器可以指定影响战利品表功能的条目、条件和修改器。

:::caution
    战利品表的功能非常广泛，因此本文档不会对其进行全面介绍。取而代之的是，将对每个组件进行简要描述。每个组件的特定子类型可以使用IDE找到。它们的实现将留给读者练习。
:::

### LootTable

战利品表是基本对象，可以使用`LootTable#lootTable`将其转换为所需的`LootTable$Builder`。战利品表可以通过池列表（通过`#withPool`）以及修改这些池的结果物品的功能（通过`#apply`）来构建，池列表按指定的顺序应用。

### LootPool

战利品池代表一个执行操作的组，并且可以使用`LootPool#lootPool`生成`LootPool$Builder`。每个战利品池都可以指定定义池中操作的条目（通过`#add`）、定义是否应该执行池中的操作的条件（通过`#when`）以及修改条目的结果物品的功能（通过`#apply`）。每个池可以按指定次数执行（通过`#setRolls`）。此外，还可以指定奖金执行（通过`#setBonusRolls`），这取决于执行者的运气。

### LootPoolEntryContainer

战利品条目定义了选择时要执行的操作，通常是生成物品。每个条目都有一个关联的[已注册的][registered]`LootPoolEntryType`。它们也有自己的关联生成器，为`LootPoolEntryContainer$Builder`的子类型。多个条目可以同时执行（通过`#append`）或顺序执行，直到一个条目失败为止（通过`#then`）。此外，条目可以在失败时默认为另一个条目（通过`#otherwise`）。

### LootItemCondition

战利品条件定义了执行某些操作所需满足的要求。每个条件都有一个关联的[已注册的][registered]`LootItemConditionType`。它们也有自己的关联生成器，为`LootItemCondition$Builder`的子类型。默认情况下，所有指定的战利品条件都必须返回true才能执行操作。战利品条件也可以指定为只有一个必须返回true（通过`#or`）。此外，条件的结果输出可以反转（通过`#invert`）。

### LootItemFunction

战利品函数在将执行结果传递给输出之前会对其进行修改。每个函数都有一个关联的[已注册的][registered]`LootItemFunctionType`。它们也有自己的关联生成器，为`LootItemFunction$Builder`的子类型。

#### NbtProvider

NBT提供者是由`CopyNbtFunction`定义的一种特殊类型的函数。它们定义了从何处提取标记信息。每个提供者都有一个关联的[已注册的][registered]`LootNbtProviderType`。

### NumberProvider

数字提供者决定战利品池执行的次数。每个提供者都有一个关联的[已注册的][registered]`LootNumberProviderType`。

#### ScoreboardNameProvider

记分牌提供者是由`ScoreboardValue`定义的一种特殊类型的数字提供者。他们定义了记分牌的名称，以获取要执行的掷数。每个提供者都有一个关联的[已注册的][registered]`LootScoreProviderType`。

[loottable]: ../../resources/server/loottables.md
[datagen]: ../index.md#data-providers
[registered]: ../../concepts/registries.md#registries-that-arent-forge-registries
