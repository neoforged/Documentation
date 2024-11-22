# 成就生成
======================

[成就] 可以通过构建一个新的 `AdvancementProvider` 并提供 `AdvancementSubProvider` 来为模组生成。成就可以手动创建和提供，或者为了方便，使用 `Advancement$Builder` 创建。提供者必须[添加][datagen]到 `DataGenerator` 中。

:::note
Forge 提供了一个扩展的 `AdvancementProvider`，名为 `ForgeAdvancementProvider`，它更适合生成成就。因此，本文档将使用 `ForgeAdvancementProvider` 以及子提供者接口 `ForgeAdvancementProvider$AdvancementGenerator`。
:::

```java
// 在 MOD 事件总线上
@SubscribeEvent
public void gatherData(GatherDataEvent event) {
    event.getGenerator().addProvider(
        // 仅在生成服务器数据时运行生成器
        event.includeServer(),
        output -> new ForgeAdvancementProvider(
          output,
          event.getLookupProvider(),
          event.getExistingFileHelper(),
          // 生成成就的子提供者
          List.of(subProvider1, subProvider2, /*...*/)
        )
    );
}
```

`ForgeAdvancementProvider$AdvancementGenerator`
-----------------------------------------------

`ForgeAdvancementProvider$AdvancementGenerator` 负责生成成就，包含一个方法，该方法接收注册表查找、写入者 (`Consumer<Advancement>`) 和现有文件助手。

```java
// 在 ForgeAdvancementProvider$AdvancementGenerator 的某个子类中或作为 lambda 引用

@Override
public void generate(HolderLookup.Provider registries, Consumer<Advancement> writer, ExistingFileHelper existingFileHelper) {
  // 在这里构建成就
}
```

`Advancement$Builder`
---------------------

`Advancement$Builder` 是一个便利的实现，用于创建用于生成的 `Advancement`。它允许定义父成就、显示信息、完成成就时的奖励以及解锁成就的要求。只需指定要求即可创建一个 `Advancement`。

虽然不是必需的，但有几个方法是重要的：

方法           | 描述
:---:          | :---
`parent`       | 设置此成就直接链接到的成就。可以指定成就的名称或如果由模组制作者生成，则指定成就本身。
`display`      | 设置显示在聊天、弹窗和成就屏幕上的信息。
`rewards`      | 设置完成此成就时获得的奖励。
`addCriterion` | 为成就添加条件。
`requirements` | 指定条件是否必须全部为真，或者至少有一个为真。可以使用额外的重载来混合这些操作。

一旦 `Advancement$Builder` 准备好建造，应调用 `#save` 方法，该方法需要写入者、成就的注册名和用于检查提供的父项是否存在的文件助手。

```java
// 在某个 ForgeAdvancementProvider$AdvancementGenerator#generate(registries, writer, existingFileHelper) 中
Advancement example = Advancement.Builder.advancement()
  .addCriterion("example_criterion", triggerInstance) // 如何解锁成就
  .save(writer, name, existingFileHelper); // 将数据添加到构建器
```

[成就]: ../../resources/server/advancements.md
[datagen]: ../index.md#data-providers
[conditional]: ../../resources/server/conditional.md
