# 粒子效果

粒子效果是能够美化游戏并增加沉浸感的2D效果。它们可以在客户端和服务器端[side]产生，但由于它们主要是视觉效果，关键部分只存在于物理（和逻辑）客户端。

## 注册粒子效果

### `ParticleType`

粒子效果是使用`ParticleType`注册的。这与`EntityType`或`BlockEntityType`类似，有一个`Particle`类 - 每个产生的粒子都是该类的一个实例 -，然后有`ParticleType`类，保存一些共有信息，用于注册。`ParticleType`是一个[注册表]，这意味着我们想要使用`DeferredRegister`来注册它们，就像所有其他注册的对象一样：

```java
public class MyParticleTypes {
    // Assuming that your mod id is examplemod
    public static final DeferredRegister<ParticleType<?>> PARTICLE_TYPES =
            DeferredRegister.create(BuiltInRegistries.PARTICLE_TYPE, "examplemod");
    
    // The easiest way to add new particle types is reusing vanilla's SimpleParticleType.
    // Implementing a custom ParticleType is also possible, see below.
    public static final Supplier<SimpleParticleType> MY_PARTICLE = PARTICLE_TYPES.register(
            // The name of the particle type.
            "my_particle",
            // The supplier. The boolean parameter denotes whether setting the Particles option in the
            // video settings to Minimal will affect this particle type or not; this is false for
            // most vanilla particles, but true for e.g. explosions, campfire smoke, or squid ink.
            () -> new SimpleParticleType(false)
    );
}
```

:::info
如果您需要在服务器端处理粒子效果，那么`ParticleType`是必需的。客户端也可以直接使用`Particle`。
:::

### `Particle`

`Particle`是稍后被生成到世界中并显示给玩家的实体。虽然你可以扩展`Particle`并自己实现一些功能，但在许多情况下，扩展`TextureSheetParticle`可能会更好，因为这个类为你提供了如动画和缩放等功能的助手，而且还为你实现了实际的渲染（如果直接扩展`Particle`，你需要自己实现这些功能）。

`Particle`的大多数属性是由如`gravity`，`lifetime`，`hasPhysics`，`friction`等字段控制的。唯一有意义的自我实现方法是`tick`和`move`，这两个方法都正如你所期望的那样进行操作。因此，自定义的粒子类通常很简短，例如，只包括一个构造函数，设置一些字段并让超类处理剩下的事情。一个基本的实现可能看起来像这样：

```java
public class MyParticle extends TextureSheetParticle {
    private final SpriteSet spriteSet;
    
    // First four parameters are self-explanatory. The SpriteSet parameter is provided by the
    // ParticleProvider, see below. You may also add additional parameters as needed, e.g. xSpeed/ySpeed/zSpeed.
    public MyParticle(ClientLevel level, double x, double y, double z, SpriteSet spriteSet) {
        super(level, x, y, z);
        this.spriteSet = spriteSet;
        this.gravity = 0; // Our particle floats in midair now, because why not.
    }
    
    @Override
    public void tick() {
        // Set the sprite for the current particle age, i.e. advance the animation.
        setSpriteFromAge(spriteSet);
        // Let super handle further movement. You may replace this with your own movement if needed.
        // You may also override move() if you only want to modify the built-in movement.
        super.tick();
    }
}
```

### `ParticleProvider`

接下来，粒子类型必须注册一个`ParticleProvider`。`ParticleProvider`是一个仅在客户端的类，负责通过`createParticle`方法实际创建我们的`Particle`。虽然这里可以包含更复杂的代码，但许多粒子提供器的实现可能非常简单，如下所示：

```java
// The generic type of ParticleProvider must match the type of the particle type this provider is for.
public class MyParticleProvider implements ParticleProvider<SimpleParticleType> {
    // A set of particle sprites.
    private final SpriteSet spriteSet;
    
    // The registration function passes a SpriteSet, so we accept that and store it for further use.
    public MyParticleProvider(SpriteSet spriteSet) {
        this.spriteSet = spriteSet;
    }
    
    // This is where the magic happens. We return a new particle each time this method is called!
    // The type of the first parameter matches the generic type passed to the super interface.
    @Override
    public Particle createParticle(SimpleParticleType type, ClientLevel level,
            double x, double y, double z, double xSpeed, double ySpeed, double zSpeed) {
        // We don't use the type and speed, and pass in everything else. You may of course use them if needed.
        return new MyParticle(level, x, y, z, spriteSet);
    }
}
```

然后，您的粒子提供器必须在[客户端][side] [mod bus][modbus] [event] `RegisterParticleProvidersEvent`中与粒子类型关联：

```java
@SubscribeEvent
public static void registerParticleProviders(RegisterParticleProvidersEvent event) {
    // There are multiple ways to register providers, all differing in the functional type they provide in the
    // second parameter. For example, #registerSpriteSet represents a Function<SpriteSet, ParticleProvider<?>>:
    event.registerSpriteSet(MyParticleTypes.MY_PARTICLE.get(), MyParticleProvider::new);
    // Other methods include #registerSprite, which is essentially a Supplier<TextureSheetParticle>,
    // and #registerSpecial, which maps to a Supplier<Particle>. See the source code of the event for further info.
}
```

### 粒子定义

最后，我们必须将我们的粒子类型与一个纹理关联起来。与物品被关联到一个物品模型相似，我们将我们的粒子类型与所谓的粒子定义（或粒子描述）关联起来。粒子定义是`assets/<namespace>/particles`目录中的一个JSON文件，它的名称与粒子类型相同（例如，对于上述示例是`my_particle.json`）。粒子定义JSON的格式如下：

```json5
{
  // A list of textures that will be played in order. Will loop if necessary.
  // Texture locations are relative to the textures/particle folder.
  "textures": [
    "examplemod:my_particle_0",
    "examplemod:my_particle_1",
    "examplemod:my_particle_2",
    "examplemod:my_particle_3"
  ]
}
```

请注意，仅当使用精灵集粒子时才需要粒子定义文件。单精灵粒子直接映射到`assets/<namespace>/textures/particle/<particle_name>.png`的纹理文件，特殊粒子提供器可以做任何你想做的事情。

:::danger
不匹配的精灵集粒子工厂列表和粒子定义文件，即没有相应粒子工厂的粒子描述，或者反之亦然，将会抛出异常！
:::

### 数据生成

粒子定义文件也可以通过扩展`ParticleDescriptionProvider`并覆写`#addDescriptions()`方法来进行[数据生成][datagen]：

```java
public class MyParticleDescriptionProvider extends ParticleDescriptionProvider {
    // Get the parameters from GatherDataEvent.
    public AMParticleDefinitionsProvider(PackOutput output, ExistingFileHelper existingFileHelper) {
        super(output, existingFileHelper);
    }

    // Assumes that all the referenced particles actually exists. Replace "examplemod" with your mod id.
    @Override
    protected void addDescriptions() {
        // Adds a single sprite particle definition with the file at
        // assets/examplemod/textures/particle/my_single_particle.png.
        sprite(MyParticleTypes.MY_SINGLE_PARTICLE.get(), new ResourceLocation("examplemod", "my_single_particle"));
        // Adds a multi sprite particle definition, with a vararg parameter. Alternatively accepts a list.
        spriteSet(MyParticleTypes.MY_MULTI_PARTICLE.get(),
                new ResourceLocation("examplemod", "my_multi_particle_0"),
                new ResourceLocation("examplemod", "my_multi_particle_1"),
                new ResourceLocation("examplemod", "my_multi_particle_2")
        );
        // Alternative for the above, appends "_<index>" to the base name given, for the given amount of textures.
        spriteSet(MyParticleTypes.MY_ALT_MULTI_PARTICLE.get(),
                // The base name.
                new ResourceLocation("examplemod", "my_multi_particle"),
                // The amount of textures.
                3,
                // Whether to reverse the list, i.e. start at the last element instead of the first.
                false
        );
    }
}
```

不要忘了向 `GatherDataEvent` 添加提供器:

```java
@SubscribeEvent
public static void gatherData(GatherDataEvent event) {
    DataGenerator generator = event.getGenerator();
    PackOutput output = generator.getPackOutput();
    ExistingFileHelper existingFileHelper = event.getExistingFileHelper();

    // other providers here
    generator.addProvider(
            event.includeClient(),
            new MyParticleDescriptionProvider(output, existingFileHelper)
    );
}
```

### 自定义 `ParticleType`

虽然在大多数情况下，`SimpleParticleType`就足够了，但有时需要在服务器端为粒子附加额外的数据。这就需要一个自定义的`ParticleType`和一个关联的自定义`ParticleOptions`。让我们从`ParticleOptions`开始，因为这是实际存储信息的地方：

```java
public class MyParticleOptions implements ParticleOptions {
    // Does not need any parameters, but may define any fields necessary for the particle to work.
    public MyParticleOptions() {}
    
    @Override
    public void writeToNetwork(FriendlyByteBuf buf) {
        // Write your custom info to the given buffer.
    }

    @Override
    public String writeToString() {
        // Return a stringified version of your custom info, for use in commands.
        // We don't have any info in this type, so we return the empty string.
        return "";
    }
    
    // The deserializer object to use. We will discuss how to use this in a moment.
    public static final ParticleOptions.Deserializer<MyParticleOptions> DESERIALIZER =
        new ParticleOptions.Deserializer<MyParticleOptions>() {
            public MyParticleOptions fromCommand(ParticleType<MyParticleOptions> type, StringReader reader)
                    throws CommandSyntaxException {
                // You may deserialize things using the given StringReader and pass them to your
                // particle options object if needed.
                return new MyParticleOptions();
            }
            
            public MyParticleOptions fromNetwork(ParticleType<MyParticleOptions> type, FriendlyByteBuf buf) {
                // Similar to above, deserialize any needed info from the given buffer.
                return new MyParticleOptions();
            }
        };
}
```

然后我们在我们的自定义`ParticleType`中使用这个`ParticleOptions`实现...

```java
public class MyParticleType extends ParticleType<MyParticleOptions> {
    // The boolean parameter again determines whether to limit particles at lower particle settings.
    // See implementation of the MyParticleTypes class near the top of the article for more information.
    public MyParticleType(boolean overrideLimiter) {
        // Pass the deserializer to super.
        super(overrideLimiter, MyParticleOptions.DESERIALIZER);
    }
    
    // Mojang is moving towards codecs for particle types, so expect the old deserializer approach to vanish soon.
    // We define our codec and then return it in the codec() method. Since our example uses no parameters
    // for serialization, we use an empty unit codec. Refer to the Codecs article for more information.
    public static final Codec<MyParticleOptions> CODEC = Codec.unit(new MyParticleOptions());
    
    @Override
    public Codec<MyParticleOptions> codec() {
        return CODEC;
    }
}
```

... 并在注册过程中引用它：

```java
public static final Supplier<MyParticleType> MY_CUSTOM_PARTICLE = PARTICLE_TYPES.register(
        "my_custom_particle",
        () -> new MyParticleType(false));
```

## 生成粒子

作为之前的提醒，服务器只知道`ParticleType`和`ParticleOption`，而客户端直接使用与`ParticleType`关联的`ParticleProvider`提供的`Particle`。因此，生成粒子的方式根据你所在的方面有很大的不同。

- **通用代码**：调用`Level#addParticle`或`Level#addAlwaysVisibleParticle`。这是创建对所有人都可见的粒子的首选方式。
- **客户端代码**：使用通用代码方式。或者，选择你喜欢的粒子类创建一个`new Particle()`，并用那个粒子调用`Minecraft.getInstance().particleEngine#add(Particle)`。注意，这种方式添加的粒子只会显示给客户端，因此其他玩家看不到。
- **服务器代码**：调用`ServerLevel#sendParticles`。在原版中被`/particle`命令使用。

[datagen]: ../index.md#data-generation
[event]: ../../concepts/events.md
[modbus]: ../../concepts/events.md#event-buses
[registry]: ../../concepts/registries.md
[side]: ../../concepts/sides.md
