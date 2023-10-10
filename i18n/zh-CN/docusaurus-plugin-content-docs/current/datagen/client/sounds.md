音效定义生成
===========

通过子类化`SoundDefinitionsProvider`并实现`#registerSounds`，可以为模组生成`sounds.json`文件。实现后，必须将提供者[添加][datagen]到`DataGenerator`中。

```java
// 在模组事件总线上
@SubscribeEvent
public void gatherData(GatherDataEvent event) {
    event.getGenerator().addProvider(
        // 告诉生成器仅在生成客户端资源时运行
        event.includeClient(),
        output -> new MySoundDefinitionsProvider(output, MOD_ID, event.getExistingFileHelper())
    );
}
```

添加一个音效
-----------

可以通过`#add`指定音效名称和定义来生成音效定义。音效名称可以从[`SoundEvent`][soundevent]、`ResourceLocation`或字符串中提供。

:::danger
    提供的音效名称将始终假定命名空间是提供给提供者的构造函数的mod id。没有对音效名称的命名空间执行验证！
:::

### `SoundDefinition`

可以使用`#definition`创建`SoundDefinition`。定义包含用于定义音效实例的数据。

定义指定了一些方法：

方法       | 描述
:---:      | :---
`with`     | 添加选择定义时可能播放的音效。
`subtitle` | 设置定义的翻译键。
`replace`  | 当为`true`时，将删除其他`sounds.json`为该定义定义的音效，而不是附加到该定义。

### `SoundDefinition$Sound`

提供给`SoundDefinition`的音效可以使用`SoundDefinitionsProvider#sound`指定。这些方法采用音效的引用和`SoundType`（如果已指定）。

`SoundType`可以是两个值之一：

音效类型   | 定义
:---:      | :---
`SOUND`    | 指定位于`assets/<namespace>/sounds/<path>.ogg`的音效的一个引用。
`EVENT`    | 指定由`sounds.json`定义的另一个音效的名称的引用。

从`SoundDefinitionsProvider#sound`创建的每个`Sound`都可以指定关于如何加载和播放所提供音效的其他配置：

方法                  | 描述
:---:                 | :---
`volume`              | 设置音效的音量大小，必须大于`0`。
`pitch`               | 设置音效的音高大小，必须大于`0`。
`weight`              | 设置音效被选定时播放音效的可能性。
`stream`              | 当为`true`时，从文件中读取音效，而不是将音效加载到内存中。推荐用于长音效：背景音乐、音乐唱片等。
`attenuationDistance` | 设置可以听到音效的所距离的方块数。
`preload`             | 当为`true`时，一旦加载资源包，就会立即将音效加载到内存中。

```java
// 在某个SoundDefinitionsProvider#registerSounds中
this.add(EXAMPLE_SOUND_EVENT, definition()
  .subtitle("sound.examplemod.example_sound") // 设置翻译键
  .with(
    sound(new ResourceLocation(MODID, "example_sound_1")) // 设置第一个音效
      .weight(4) // 具有4 / 5 = 80%的播放机率
      .volume(0.5), // 将调用此音效的所有音量缩放一半
    sound(new ResourceLocation(MODID, "example_sound_2")) // 设置第二个音效
      .stream() // 流播该音效
  )
);

this.add(EXAMPLE_SOUND_EVENT_2, definition()
  .subtitle("sound.examplemod.example_sound") // 设置翻译键
  .with(
    sound(EXAMPLE_SOUND_EVENT.getLocation(), SoundType.EVENT) // 从'EXAMPLE_SOUND_EVENT'添加音效
      .pitch(0.5) // 将调用此音效的所有音高缩放一半
  )
);
```

[datagen]: ../index.md#data-providers
[soundevent]: ../../gameeffects/sounds.md#creating-sound-events
