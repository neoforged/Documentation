# 全局战利品修改器生成
===============================

通过继承 `GlobalLootModifierProvider` 并实现 `#start` 方法，可以为模组生成[全局战利品修改器 (GLMs)][glm]。通过调用 `#add` 并指定修改器的名称和将被序列化的[修改器实例][instance]，可以添加生成每个 GLM。实现后，必须将提供者[添加][datagen]到 `DataGenerator`。

```java
// 在 MOD 事件总线上
@SubscribeEvent
public void gatherData(GatherDataEvent event) {
    event.getGenerator().addProvider(
        // 通知生成器仅在生成服务器数据时运行
        event.includeServer(),
        output -> new MyGlobalLootModifierProvider(output, MOD_ID)
    );
}

// 在某个 GlobalLootModifierProvider#start 中
this.add("example_modifier", new ExampleModifier(
  new LootItemCondition[] {
    WeatherCheck.weather().setRaining(true).build() // 在下雨时执行
  },
  "val1",
  10,
  Items.DIRT
));
```

[glm]: ../../resources/server/glm.md
[instance]: ../../resources/server/glm.md#igloballootmodifier
[datagen]: ../index.md#data-providers
