全局战利品修改器生成
==================

可以通过子类化`GlobalLootModifierProvider`并实现`#start`来为模组生成[全局战利品修改器（GLM）][glm]。每个GLM都可以通过调用`#add`并指定要序列化的修改器和[修改器实例][instance]的名称来添加生成。实现后，该提供者必须被[添加][datagen]到`DataGenerator`中。

```java
// 在模组事件总线上
@SubscribeEvent
public void gatherData(GatherDataEvent event) {
    event.getGenerator().addProvider(
        // 告诉生成器仅在生成服务端资源时运行
        event.includeServer(),
        output -> new MyGlobalLootModifierProvider(output, MOD_ID)
    );
}

// 在某个GlobalLootModifierProvider#start中
this.add("example_modifier", new ExampleModifier(
  new LootItemCondition[] {
    WeatherCheck.weather().setRaining(true).build() // 当下雨时执行
  },
  "val1",
  10,
  Items.DIRT
));
```

[glm]: ../../resources/server/glm.md
[instance]: ../../resources/server/glm.md#igloballootmodifier
[datagen]: ../index.md#data-providers
