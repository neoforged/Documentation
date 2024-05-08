# 声音

虽然声音对于任何事情都不是必需的，但它们可以使模组感觉更加细腻和生动。Minecraft为你提供了各种注册和播放声音的方式，本文将对此进行说明。

## 术语

Minecraft的声音引擎使用多种术语来指代不同的事物：

- **声音事件**：声音事件是一个在代码中的触发器，它告诉声音引擎播放某个特定的声音。`SoundEvent`也是你需要注册到游戏中的东西。
- **声音类别**或**声音源**：声音类别是声音的粗略分组，可以单独切换。声音选项GUI中的滑块代表这些类别：`master`（主音量）、`block`（方块）、`player`（玩家）等等。在代码中，它们可以在`SoundSource`枚举中找到。
- **声音定义**：将声音事件映射到一个或多个声音对象的映射，加上一些可选的元数据。声音定义位于命名空间的[`sounds.json`文件][soundsjson]中。
- **声音对象**：由声音文件位置加上一些可选的元数据组成的JSON对象。
- **声音文件**：磁盘上的声音文件。Minecraft仅支持`.ogg`格式的声音文件。

:::danger
由于OpenAL（Minecraft的音频库）的实现方式，为了让你的声音具有衰减效果——即根据玩家与声源的距离声音变小或变大——你的声音文件必须是单声道（单通道）。立体声（多通道）声音文件不会受到衰减的影响，并且总是在玩家的位置播放，这使它们成为环境声音和背景音乐的理想选择。也看看[MC-146721][bug]。
:::

## 创建`SoundEvent`

`SoundEvent`是[注册对象][registration]，意味着它们必须通过`DeferredRegister`注册到游戏中，并且是单例的：

```java
public class MySoundsClass {
    // Assuming that your mod id is examplemod
    public static final DeferredRegister<SoundEvent> SOUND_EVENTS =
            DeferredRegister.create(BuiltInRegistries.SOUND_EVENT, "examplemod");
    
    // All vanilla sounds use variable range events.
    public static final Supplier<SoundEvent> MY_SOUND = SOUND_EVENTS.register(
            "my_sound", // must match the resource location on the next line
            () -> SoundEvent.createVariableRangeEvent(new ResourceLocation("examplemod", "my_sound"))
    );
    
    // There is a currently unused method to register fixed range (= non-attenuating) events as well:
    public static final Supplier<SoundEvent> MY_FIXED_SOUND = SOUND_EVENTS.register("my_fixed_sound",
            // 16 is the default range of sounds. Be aware that due to OpenAL limitations,
            // values above 16 have no effect and will be capped to 16.
            () -> SoundEvent.createFixedRangeEvent(new ResourceLocation("examplemod", "my_fixed_sound"), 16)
    );
}
```

当然，不要忘记在[模组构造器][modctor]中将你的注册表添加到[模组事件总线][modbus]中：

```java
public ExampleMod(IEventBus modBus) {
    MySoundsClass.SOUND_EVENTS.register(modBus);
    // other things here
}
```

然后，你就有了一个声音事件！

## `sounds.json`

_另见：[Minecraft Wiki][mcwiki]上的[sounds.json][mcwikisounds]_

现在，为了将你的声音事件连接到实际的声音文件，我们需要创建声音定义。一个命名空间的所有声音定义都存储在一个名为`sounds.json`的文件中，也就是声音定义文件，直接放在命名空间的根目录下。每个声音定义都是声音事件id（如`my_sound`）到JSON声音对象的映射。注意，声音事件id不指定命名空间，因为这已经由声音定义文件所在的命名空间确定。一个示例的`sounds.json`看起来像这样：

```json5
{
  // Sound definition for the sound event "examplemod:my_sound"
  "my_sound": {
    // List of sound objects. If this contains more than one element, an element will be chosen randomly.
    "sounds": [
      // Only name is required, all other properties are optional.
      {
        // Location of the sound file, relative to the namespace's sounds folder.
        // This example references a sound at assets/examplemod/sounds/sound_1.ogg.
        "name": "examplemod:sound_1",
        // May be "sound" or "event". "sound" causes the name to refer to a sound file.
        // "event" causes the name to refer to another sound event. Defaults to "sound".
        "type": "sound",
        // The volume this sound will be played at. Must be between 0.0 and 1.0 (default).
        "volume": 0.8,
        // The pitch value the sound will be played at.
        // Must be between 0.0 and 2.0. Defaults to 1.0.
        "pitch": 1.1,
        // Weight of this sound when choosing a sound from the sounds list. Defaults to 1.
        "weight": 3,
        // If true, the sound will be streamed from the file instead of loaded all at once.
        // Recommended for sound files that are more than a few seconds long. Defaults to false.
        "stream": true,
        // Manual override for the attenuation distance. Defaults to 16. Ignored by fixed range sound events.
        "attenuation_distance": 8,
        // If true, the sound will be loaded into memory on pack load, instead of when the sound is played.
        // Vanilla uses this for underwater ambience sounds. Defaults to false.
        "preload": true
      },
      // Shortcut for { "name": "examplemod:sound_2" }
      "examplemod:sound_2"
    ]
  },
  "my_fixed_sound": {
    // Optional. If true, replaces sounds from other resource packs instead of adding to them.
    // See the Merging chapter below for more information.
    "replace": true,
    // The translation key of the subtitle displayed when this sound event is triggered.
    "subtitle": "examplemod.my_fixed_sound",
    "sounds": [
      "examplemod:sound_1",
      "examplemod:sound_2"
    ]
  }
}
```

### 合并

与大多数其他资源文件不同，`sounds.json`文件不会覆盖它们下面的包中的值。相反，它们被合并在一起，然后解释为一个组合的`sounds.json`文件。考虑在两个不同资源包RP1和RP2中的两个`sounds.json`文件里定义了声音`sound_1`、`sound_2`、`sound_3`和`sound_4`，其中RP2位于RP1下面：

RP1中的`sounds.json`：

```json5
{
  "sound_1": {
    "sounds": [
      "sound_1"
    ]
  },
  "sound_2": {
    "replace": true,
    "sounds": [
      "sound_2"
    ]
  },
  "sound_3": {
    "sounds": [
      "sound_3"
    ]
  },
  "sound_4": {
    "replace": true,
    "sounds": [
      "sound_4"
    ]
  }
}
```

RP2中的`sounds.json`：

```json5
{
  "sound_1": {
    "sounds": [
      "sound_5"
    ]
  },
  "sound_2": {
    "sounds": [
      "sound_6"
    ]
  },
  "sound_3": {
    "replace": true,
    "sounds": [
      "sound_7"
    ]
  },
  "sound_4": {
    "replace": true,
    "sounds": [
      "sound_8"
    ]
  }
}
```

游戏最终会使用的组合（合并）的`sounds.json`文件，在内存中看起来会像这样（这个文件从不会被写在任何地方）：

```json5
{
  "sound_1": {
    // replace false and false: add from lower pack, then from upper pack
    "sounds": [
      "sound_5",
      "sound_1"
    ]
  },
  "sound_2": {
    // replace true in upper pack and false in lower pack: add from upper pack only
    "sounds": [
      "sound_2"
    ]
  },
  "sound_3": {
    // replace false in upper pack and true in lower pack: add from lower pack, then from upper pack
    // Would still discard values from a third resource pack sitting below RP2
    "sounds": [
      "sound_7",
      "sound_3"
    ]
  },
  "sound_4": {
    // replace true and true: add from upper pack only
    "sounds": [
      "sound_8"
    ]
  }
}
```

## 播放声音

Minecraft提供了各种播放声音的方法，有时不清楚应该使用哪一个。所有的方法都接受一个`SoundEvent`，可以是你自己的，也可以是原版的（原版声音事件可以在`SoundEvents`类中找到）。以下的方法描述，客户端和服务器分别指的是[逻辑客户端和逻辑服务器][sides]。

### `Level`

- `playSound(Player player, double x, double y, double z, SoundEvent soundEvent, SoundSource soundSource, float volume, float pitch)`
  - 客户端行为：如果传入的玩家是本地玩家，则在给定位置为玩家播放声音事件，否则无操作。
  - 服务器行为：向所有除传入的玩家以外的玩家发送一个数据包，指示客户端在给定位置为玩家播放声音事件。
  - 用法：从将在两侧运行的客户端启动的代码中调用。服务器不会对发起播放的玩家播放声音，以防止对他们播放两次声音事件。或者，从服务器启动的代码（如[block entity][be]）中调用，并使用`null`作为玩家，对所有人播放声音。
- `playSound(Player player, BlockPos pos, SoundEvent soundEvent, SoundSource soundSource, float volume, float pitch)`
  - 转发到第一个方法，其中`x`、`y`和`z`分别取`pos.getX() + 0.5`、`pos.getY() + 0.5`和`pos.getZ() + 0.5`的值。
- `playLocalSound(double x, double y, double z, SoundEvent soundEvent, SoundSource soundSource, float volume, float pitch, boolean distanceDelay)`
  - 客户端行为：在给定位置为玩家播放声音。不向服务器发送任何内容。如果`distanceDelay`是`true`，则根据距离玩家的距离延迟声音。
  - 服务器行为：无操作。
  - 用法：从服务器发送的自定义数据包中调用。原版用这个方法播放雷声。

### `ClientLevel`

- `playLocalSound(BlockPos pos, SoundEvent soundEvent, SoundSource soundSource, float volume, float pitch, boolean distanceDelay)`
  - 转发到`Level#playLocalSound`，其中`x`、`y`和`z`分别取`pos.getX() + 0.5`、`pos.getY() + 0.5`和`pos.getZ() + 0.5`的值。

### `Entity`

- `playSound(SoundEvent soundEvent, float volume, float pitch)`
  - 转发到`Level#playSound`，其中玩家为`null`，声音源为`SoundSource.ENTITY`，实体的位置为x/y/z，其他参数为传入的参数。

### `Player`

- `playSound(SoundEvent soundEvent, float volume, float pitch)` （覆盖`Entity`中的方法）
  - 转发到`Level#playSound`，其中玩家为`this`，声音源为`SoundSource.PLAYER`，玩家的位置为x/y/z，其他参数为传入的参数。因此，客户端/服务器的行为模仿`Level#playSound`：
    - 客户端行为：在给定位置为客户端玩家播放声音事件。
    - 服务器行为：除了调用此方法的玩家，对给定位置附近的所有人播放声音事件。

## 数据生成

声音文件本身当然不能被[数据生成][datagen]，但是`sounds.json`文件可以。为了做到这一点，我们扩展`SoundDefinitionsProvider`并覆盖`registerSounds()`方法：

```java
public class MySoundDefinitionsProvider extends SoundDefinitionsProvider {
    // Parameters can be obtained from GatherDataEvent.
    public MySoundDefinitionsProvider(PackOutput output, ExistingFileHelper existingFileHelper) {
        // Use your actual mod id instead of "examplemod".
        super(output, "examplemod", existingFileHelper);
    }

    @Override
    public void registerSounds() {
        // Accepts a Supplier<SoundEvent>, a SoundEvent, or a ResourceLocation as the first parameter.
        add(MySoundsClass.MY_SOUND, SoundDefinition.definition()
                // Add sound objects to the sound definition. Parameter is a vararg.
                .with(
                        // Accepts either a string or a ResourceLocation as the first parameter.
                        // The second parameter can be either SOUND or EVENT, and can be omitted if the former.
                        sound("examplemod:sound_1", SoundDefinition.SoundType.SOUND)
                                // Sets the volume. Also has a double counterpart.
                                .volume(0.8f)
                                // Sets the pitch. Also has a double counterpart.
                                .pitch(1.2f)
                                // Sets the weight.
                                .weight(2)
                                // Sets the attenuation distance.
                                .attenuationDistance(8)
                                // Enables streaming.
                                // Also has a parameterless overload that defers to stream(true).
                                .stream(true)
                                // Enables preloading.
                                // Also has a parameterless overload that defers to preload(true).
                                .preload(true),
                        // The shortest we can get.
                        sound("examplemod:sound_2")
                )
                // Sets the subtitle.
                .subtitle("sound.examplemod.sound_1")
                // Enables replacing.
                .replace(true)
        );
    }
}
```

与所有数据提供器一样，不要忘记将提供者注册到事件中：

```java
@SubscribeEvent
public static void gatherData(GatherDataEvent event) {
    DataGenerator generator = event.getGenerator();
    PackOutput output = generator.getPackOutput();
    ExistingFileHelper existingFileHelper = event.getExistingFileHelper();

    // other providers here
    generator.addProvider(
            event.includeClient(),
            new MySoundDefinitionsProvider(output, existingFileHelper)
    );
}
```

[bug]: https://bugs.mojang.com/browse/MC-146721
[datagen]: ../index.md#data-generation
[mcwiki]: https://minecraft.wiki
[mcwikisounds]: https://minecraft.wiki/w/Sounds.json
[modbus]: ../../concepts/events.md#event-buses
[modctor]: ../../gettingstarted/modfiles.md#javafml-and-mod
[registration]: ../../concepts/registries.md
[sides]: ../../concepts/sides.md#the-logical-side
[soundsjson]: #soundsjson
