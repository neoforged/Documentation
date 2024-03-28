音效
====

术语
----

| 术语            | 描述           |
|----------------|----------------|
|  音效事件       | 触发音效效果的东西。例子包括`minecraft:block.anvil.hit`或`botania:spreader_fire`。 |
| 音效类别        | 音效的类别，例如`player`、`block`或只不过是`master`。音效设置GUI中的滑块展示这些类别。 |
|   音效文件      | 字面意义上的磁盘上播放的文件：一个.ogg文件。 |

`sounds.json`
-------------

此JSON定义音效事件，并定义它们播放的音效文件、字幕等。音效事件用[`ResourceLocation`][loc]标识。`sounds.json`应该位于资源命名空间的根目录（`assets/<namespace>/sounds.json`），且在该命名空间中定义音效事件（`assets/<namespace>/soundes.json`在名称空间`namespace`中定义音效事件。）。

原版[wiki][]上提供了完整的规范，但这个例子强调了重要的部分：

```js
{
  "open_chest": {
    "subtitle": "mymod.subtitle.open_chest",
    "sounds": [ "mymod:open_chest_sound_file" ]
  },
  "epic_music": {
    "sounds": [
      {
        "name": "mymod:music/epic_music",
        "stream": true
      }
    ]
  }
}
```

在顶级对象的下面，每个键都对应一个音效事件。请注意，没有给出命名空间，因为它取自JSON本身的命名空间。每个事件指定启用字幕时要显示的本地化翻译键。最后，指定要播放的实际音效文件。请注意，该值是一个数组；如果指定了多个音效文件，则每当触发音效事件时，游戏将随机选择一个播放。

这两个示例代表了指定音效文件的两种不同方式。[wiki]有精确的细节，但一般来说，长音效文件（如背景音乐或音乐光盘）应该使用第二种形式，因为"stream"参数告诉Minecraft不要将整个音效文件加载到内存中，而是从磁盘流形式传输。第二种形式还可以指定音效文件的音量、音高和重量。

在所有情况下，命名空间`namespace`和路径`path`的音效文件路径都是`assets/<namespace>/sounds/<path>.ogg`。因此，`mymod:open_chest_sound_file`指向`assets/mymod/sounds/open_chest_sound_file.ogg`，而`mymod:music/epic_music`指向`assets/mymod/sounds/music/epic_music.ogg`。

`sounds.json`可以是[数据生成][datagen]的。

创建音效事件
-----------

为了引用服务端上的音效，必须创建一个在`sounds.json`中包含相应条目的`SoundEvent`。然后必须对`SoundEvent`进行[注册][registration]。通常，用于创建音效事件的位置应设置为其注册表名称。

`SoundEvent`作为对音效的一个引用，并被传递以播放它们。如果一个模组有API，应该在API中公开它的`SoundEvent`。

:::caution
    只要音效在`sounds.json`中被注册，它就仍然可以在逻辑客户端上被引用，而不管是否存在引用其的`SoundEvent`。
:::

播放音效
-------

原版有很多播放音效的方法，有时很难清楚该用哪种。

请注意，每个方法都要接受一个`SoundEvent`，即上面注册的事件。此外，术语 *“服务端行为”* 和 *“客户端行为”* 指其分别的[**逻辑**端][side]。

### `Level`

1. <a name="level-playsound-pbecvp"></a> `playSound(Player, BlockPos, SoundEvent, SoundSource, volume, pitch)`
    - 简单地转发到[重载 (2)](#level-playsound-pxyzecvp)，在给定的`BlockPos`的每个坐标上加0.5。

2. <a name="level-playsound-pxyzecvp"></a> `playSound(Player, double x, double y, double z, SoundEvent, SoundSource, volume, pitch)`
    - **客户端行为**: 如果传入的玩家是*客户端*玩家，则向客户端玩家播放该音效事件。
    - **服务端行为**: 向附近的所有人播放音效事件，除了传入的玩家以外。玩家可以为`null`。
    - **用法**: 行为之间的对应关系意味着这两个方法将从一些玩家启动的代码中调用，这些代码将同时在两逻辑端运行：逻辑客户端处理向用户播放，逻辑服务端处理其他所有听到它的人，而不向原始用户重新播放。它们还可以用于在服务端端的任何位置播放任何音效，方法是在逻辑服务端上调用它并传入`null`玩家，从而让每个人都能听到。

3. <a name="level-playsound-xyzecvpd"></a> `playLocalSound(double x, double y, double z, SoundEvent, SoundSource, volume, pitch, distanceDelay)`
    - **客户端行为**: 只是在客户端存档播放音效事件。如果`distanceDelay`为`true`，则根据音效与玩家的距离来延迟音效。
    - **服务端行为**: 不做任何事情。
    - **用法**: 此方法仅适用于客户端，因此对于在自定义数据包中发送的音效或其他仅客户端效果类型的音效非常有用。打雷就用了该方法。

### `ClientLevel`

1. <a name="clientlevel-playsound-becvpd"></a> `playLocalSound(BlockPos, SoundEvent, SoundSource, volume, pitch, distanceDelay)`
    - 简单地转发到`Level`的[overload (3)](#level-playsound-xyzecvpd)，在给定的`BlockPos`的每个坐标上加0.5。

### `Entity`

1. <a name="entity-playsound-evp"></a> `playSound(SoundEvent, volume, pitch)`
    - 简单地转发到`Level`的[overload (2)](#level-playsound-pxyzecvp)，将玩家传递为`null`。
    - **客户端行为**: 不做任何事情。
    - **服务端行为**: 向该实体所在位置的所有人播放音效事件。
    - **用法**: 在服务端从任何非玩家实体发出任何音效。

### `Player`

1. <a name="player-playsound-evp"></a> `playSound(SoundEvent, volume, pitch)` (overriding the one in [`Entity`](#entity-playsound-evp))
    - 简单地转发到`Level`的[overload (2)](#level-playsound-pxyzecvp)，将玩家传递为`null`。
    - **客户端行为**: 不做任何事情，参见[`LocalPlayer`](#localplayer-playsound-evp)中的重载。
    - **服务端行为**: 向附近*除了*该玩家以外的所有人播放该音效。
    - **用法**: 参见[`LocalPlayer`](#localplayer-playsound-evp)。

### `LocalPlayer`

1. <a name="localplayer-playsound-evp"></a> `playSound(SoundEvent, volume, pitch)` (overriding the one in [`Player`](#player-playsound-evp))
    - 简单地转发到`Level`的[overload (2)](#level-playsound-pxyzecvp)，将玩家传递为`this`。
    - **客户端行为**: 仅仅播放该音效事件。
    - **服务端行为**: 该方法仅客户端适用。
    - **用法**: 就像`Level`中的方法一样，玩家类中的这两个重写似乎是针对在两端同时运行的代码。客户端处理向用户播放音效，而服务端处理其他所有听到音效的人，而不向原始用户重新播放。

[loc]: ../concepts/resources.md#resourcelocation
[wiki]: https://minecraft.wiki/w/Sounds.json
[datagen]: ../datagen/client/sounds.md
[registration]: ../concepts/registries.md#methods-for-registering
[sides]: ../concepts/sides.md
