数据包注册表对象生成
==================

Datapack registry objects can be generated for a mod by constructing a new `DatapackBuiltinEntriesProvider` and providing a `RegistrySetBuilder` with the new objects to register. The provider must be [added][datagen] to the `DataGenerator`.
通过构造新的`DatapackBuiltinEntriesProvider`并为`RegistrySetBuilder`提供要注册的新对象，可以为模组生成数据包注册表对象。该提供者必须被[添加][datagen]到`DataGenerator`中。

!!! 注意
    `DatapackBuiltinEntriesProvider`是`RegistriesDatapackGenerator`之上的一个Forge扩展，它可以正确处理引用现有数据包注册表对象而不会分解条目。因此，本文档将使用`DatapackBuiltinEntriesProvider`。

```java
// 在模组事件总线上
@SubscribeEvent
public void gatherData(GatherDataEvent event) {
    event.getGenerator().addProvider(
        // 告诉生成器仅在生成服务端资源时运行
        event.includeServer(),
        output -> new DatapackBuiltinEntriesProvider(
          output,
          event.getLookupProvider(),
          // 包含要生成的数据包注册表对象的生成器
          new RegistrySetBuilder().add(/* ... */),
          // 用于生成的数据包注册表对象的mod id集合
          Set.of(MOD_ID)
        )
    );
}
```

`RegistrySetBuilder`
--------------------

`RegistrySetBuilder`负责构建游戏中使用的所有数据包注册表对象。生成器可以为注册表添加一个新条目，然后注册表可以将对象注册到该注册表中。

首先，可以通过调用构造函数来初始化`RegistrySetBuilder`的新实例。然后，可以调用`#add`方法（它接受注册表的`ResourceKey`，一个包含`BootstapContext`的`RegistryBootstrap` Consumer来注册对象，以及一个可选的`Lifecycle`参数来指示注册表的当前生命周期状态）来处理特定注册表进行注册。

```java
new RegistrySetBuilder()
  // 创建已配置的特性
  .add(Registries.CONFIGURED_FEATURE, bootstrap -> {
    // 在此处注册已配置的特性
  })
  // 创建已放置的特性
  .add(Registries.PLACED_FEATURE, bootstrap -> {
    // 在此处注册已放置的特性
  });
```

!!! 注意
    通过Forge创建的数据包注册表也可以通过传递相关的`ResourceKey`来使用该生成器生成它们的对象。

使用`BootstapContext`注册
-------------------------

生成器提供的`BootstapContext`中的`#register`方法可用于注册对象。它采用`ResourceKey`表示对象的注册表名称、要注册的对象，以及一个可选的`Lifecycle`参数来指示注册表对象的当前生命周期状态。

```java
public static final ResourceKey<ConfiguredFeature<?, ?>> EXAMPLE_CONFIGURED_FEATURE = ResourceKey.create(
  Registries.CONFIGURED_FEATURE,
  new ResourceLocation(MOD_ID, "example_configured_feature")
);

// 在某个恒定的位置或参数中
new RegistrySetBuilder()
  // 创建已配置的特性
  .add(Registries.CONFIGURED_FEATURE, bootstrap -> {
    // 在此处注册已配置的特性
    bootstrap.register(
      // 已配置的特性的资源键
      EXAMPLE_CONFIGURED_FEATURE,
      new ConfiguredFeature<>(
        Feature.ORE, // 创建一个矿物特性
        new OreConfiguration(
          List.of(), // 不做任何事情
          8 // 在最多8个矿脉中
        )
      )
    );
  })
  // 创建已放置的特性
  .add(Registries.PLACED_FEATURE, bootstrap -> {
    // 在此处注册已放置的特性
  });
```

### Datapack Registry Object Lookup

有时，数据包注册表对象可能希望使用其他数据包注册表对象或包含数据包注册表对象的标签。在这种情况下，你可以使用`BootstapContext#lookup`查找另一个数据包注册表以获得`HolderGetter`。从那里，你可以通过`#getOrThrow`传递相关的键，获得数据包注册表对象的`Holder$Reference`或标签的`HolderSet$Named`。

```java
public static final ResourceKey<ConfiguredFeature<?, ?>> EXAMPLE_CONFIGURED_FEATURE = ResourceKey.create(
  Registries.CONFIGURED_FEATURE,
  new ResourceLocation(MOD_ID, "example_configured_feature")
);

public static final ResourceKey<PlacedFeature> EXAMPLE_PLACED_FEATURE = ResourceKey.create(
  Registries.PLACED_FEATURE,
  new ResourceLocation(MOD_ID, "example_placed_feature")
);

// 在某个恒定的位置或参数中
new RegistrySetBuilder()
  // 创建已配置的特性
  .add(Registries.CONFIGURED_FEATURE, bootstrap -> {
    // 在此处注册已配置的特性
    bootstrap.register(
      // 已配置的特性的资源键
      EXAMPLE_CONFIGURED_FEATURE,
      new ConfiguredFeature(/* ... */)
    );
  })
  // 创建已放置的特性
  .add(Registries.PLACED_FEATURE, bootstrap -> {
    // 在此处注册已放置的特性

    // 获取已配置的特性的注册表
    HolderGetter<ConfiguredFeature<?, ?>> configured = bootstrap.lookup(Registries.CONFIGURED_FEATURE);

    bootstrap.register(
      // 已放置的特性的资源键
      EXAMPLE_PLACED_FEATURE,
      new PlacedFeature(
        configured.getOrThrow(EXAMPLE_CONFIGURED_FEATURE), // 获取已配置的特性
        List.of() // 并对于放置位置不做任何事情
      )
    )
  });
```

[datagen]: ../index.md#data-providers