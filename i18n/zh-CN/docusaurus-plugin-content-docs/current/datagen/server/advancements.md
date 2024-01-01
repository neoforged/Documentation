进度生成
========

可以通过构建新的`AdvancementProvider`并提供`AdvancementSubProvider`来为模组生成[进度][Advancements]。进度既可以手动创建和提供，也可以为方便起见，使用`Advancement$Builder`创建。该提供者必须被[添加][datagen]到`DataGenerator`中。

:::caution
    Forge为`AdvancementProvider`提供了一个名为`ForgeAdvancementProvider`的扩展，它可以更好地集成以生成进度。因此，本文档将使用`ForgeAdvancementProvider`和子提供者接口`ForgeAdvancementProvider$AdvancementGenerator`。
:::

```java
// 在模组事件总线上
@SubscribeEvent
public void gatherData(GatherDataEvent event) {
    event.getGenerator().addProvider(
        // 告诉生成器仅在生成服务端资源时运行
        event.includeServer(),
        output -> new ForgeAdvancementProvider(
          output,
          event.getLookupProvider(),
          event.getExistingFileHelper(),
          // 生成进度的子提供者
          List.of(subProvider1, subProvider2, /*...*/)
        )
    );
}
```

`ForgeAdvancementProvider$AdvancementGenerator`
-----------------------------------------------

`ForgeAdvancementProvider$AdvancementGenerator`负责生成进度，包含一个接受注册表查找的方法、写入器（`Consumer<Advancement>`）和现有文件助手..

```java
// 在ForgeAdvancementProvider$AdvancementGenerator的某个子类中，或作为一个lambda引用

@Override
public void generate(HolderLookup.Provider registries, Consumer<Advancement> writer, ExistingFileHelper existingFileHelper) {
  // 在此处构建进度
}
```

`Advancement$Builder`
---------------------

`Advancement$Builder`是一个方便的实现，用于创建要生成的`Advancement`。它允许定义父级进度、显示信息、进度完成时的奖励以及解锁进度的要求。只需指定要求即可创建`Advancement`。

尽管不是必需的，但有许多方法很重要：

方法           | 描述
:---:          | :---
`parent`       | 设置此进度直接链接到的进度。可以指定进度的名称，也可以指定进度本身（如果它是由模组开发者生成的）。
`display`      | 设置要显示在聊天、toast和进度屏幕上的信息。
`rewards`      | 设置此进度完成时获得的奖励。
`addCriterion` | 为此进度添加一个条件。
`requirements` | 指定是所有条件都必须返回true，还是至少有一个条件必须返回true。可以使用额外的重载来混合和匹配这些操作。

一旦准备好构建`Advancement$Builder`，就应该调用`#save`方法，该方法接受写入器、进度的注册表名以及用于检查提供的父级是否存在的文件助手。

```java
// 在某个ForgeAdvancementProvider$AdvancementGenerator#generate(registries, writer, existingFileHelper)中
Advancement example = Advancement.Builder.advancement()
  .addCriterion("example_criterion", triggerInstance) // 该进度如何解锁
  .save(writer, name, existingFileHelper); // 将数据加入生成器
```

[advancements]: ../../resources/server/advancements.md
[datagen]: ../index.md#data-providers
[conditional]: ../../resources/server/conditional.md
