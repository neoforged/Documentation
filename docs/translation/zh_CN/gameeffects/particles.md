粒子效果
=======

粒子是游戏中的一种效果，用于打磨游戏，以更好地提高沉浸感。由于它们的创建和引用方法，其有用性也需要非常谨慎地对待。

创建一个粒子
-----------

粒子被分解为仅用于显示粒子的[**仅客户端**][sides]实现和用于引用来自服务端的粒子或同步数据的通用实现。

| 类               | 物理端 | 描述         |
| :---             | :---:  |     :---    |
| ParticleType     | BOTH   | 粒子类型定义的注册表对象，用于引用任一端位的粒子 |
| ParticleOptions    | BOTH   | 用于将来自网络或命令的信息同步到相关客户端的数据保持器 |
| ParticleProvider | CLIENT | 由`ParticleType`注册的工厂，用于从关联的`ParticleOptions`构造`Particle`。 |
| Particle         | CLIENT | 要在关联客户端上显示的可渲染逻辑 |

### ParticleType

`ParticleType`是定义特定粒子类型的注册表对象，并提供对两端位特定粒子的可用引用。因此，每个`ParticleType`都必须[注册][registration]。

每个`ParticleType`都有两个参数：一个`overrideLimiter`，用于确定粒子是否在不考虑距离的情况下渲染，以及一个`ParticleOptions$Deserializer`，用于读取客户端上发送的`ParticleOptions`。由于基类`ParticleType`是抽象类，因此需要实现一个方法：`#codec`。其表示如何对与该类型相关的`ParticleOptions`进行编码和解码。

!!! 注意
    `ParticleType#codec`仅在用于原版实现的生物群系编解码器中使用。

在大多数情况下，不需要将任何粒子数据发送到客户端。对于这些例子，更容易创建`SimpleParticleType`的新实例：一个对`ParticleType`和`ParticleOptions`的实现，除了类型之外，它不向客户端发送任何自定义数据。除了红石粉之外，对于着色和依赖方块/物品的粒子而言，大多数原版实现还使用`SimpleParticleType`。

!!! 重要
    如果仅在客户端上引用，则生成粒子时`ParticleType`非必要。但是，有必要使用`ParticleEngine`中的任何预构建逻辑，或者从服务端生成粒子。

### ParticleOptions

`ParticleOptions`表示每个粒子所接收的数据。它还用于发送通过服务端生成的粒子的数据。所有粒子生成方法都接受一个`ParticleOptions`，这样它就知道粒子的类型以及与生成方法关联的数据。

`ParticleOptions`被拆分为三种方法：

| 方法           | 描述        |
| :---           | :---        |
| getType        | 获取粒子的类型定义，或`ParticleType`
| writeToNetwork | 将粒子数据写入服务端上的缓冲区以发送到客户端
| writeToString  | 将粒子数据写入字符串

这些对象要么是根据需要动态构建的，要么是作为`SimpleParticleType`的结果而产生的单体。

#### ParticleOptions$Deserializer

要在客户端上接收`ParticleOptions`，或引用命令中的数据，必须通过`ParticleOptions$Deserializer`对粒子数据进行反序列化。`ParticleOptions$Deserializer`中的每个方法都对等`ParticleOptions`的编码方法：

| 方法        | ParticleOptions编码器 | 描述         |
| :---        | :---:                 | :---        |
| fromCommand | writeToString         | 从字符串（通常是从命令）中解码粒子数据。 |
| fromNetwork | writeToNetwork        | 解码客户端缓冲区中的粒子数据。 |

当需要发送自定义粒子数据时，此对象会传递到`ParticleType`的构造函数中。

### Particle

`Particle`提供将所述数据绘制到屏幕上所需的渲染逻辑。要创建任何`Particle`，必须实现两个方法：

| 方法          | 描述        |
| :---          | :---        |
| render        | 将粒子渲染到屏幕上。 |
| getRenderType | 获取粒子的渲染类型。 |

用于渲染纹理的`Particle`的一个常见子类是`TextureSheetParticle`。虽然需要实现`#getRenderType`，但无论设置了什么纹理sprite，都将在粒子的位置进行渲染。

#### ParticleRenderType

`ParticleRenderType`是`RenderType`的一个变体，它为该类型的每个粒子构造启动和拆卸阶段，然后通过`Tesselator`同时渲染所有粒子。粒子可以使用六种不同的渲染类型。

| 渲染类型                    | 描述        |
| :---                       | :---        |
| TERRAIN_SHEET              | 渲染纹理位于可用方块内的粒子。 |
| PARTICLE_SHEET_OPAQUE      | 渲染纹理不透明且位于可用粒子内的粒子。 |
| PARTICLE_SHEET_TRANSLUCENT | 渲染纹理为半透明且位于可用粒子内的粒子。 |
| PARTICLE_SHEET_LIT         | 与`PARTICLE_SHEET_OPAQUE`相同，但不使用粒子着色器。 |
| CUSTOM                     | 提供混合和深度遮罩的设置，但不提供将在`Particle#render`中实现的渲染功能。 |
| NO_RENDER                  | 粒子将永远不会渲染。 |

实现自定义渲染类型将留给读者练习。

### ParticleProvider

最后，粒子通常是通过`ParticleProvider`创建的。工厂有一个单一的方法`ParticleProvider`，用于在给定粒子数据、客户端存档、位置和移动增量的情况下创建粒子。由于`Particle`不受任何特定`ParticleType`的约束，因此可以根据需要在不同的工厂中重复使用。

必须通过订阅**模组事件总线**上的`RegisterParticleProvidersEvent`以注册`ParticleProvider`。在事件中，可以通过向方法提供工厂实例，通过`#registerSpecial`注册工厂。

!!! 重要
    `RegisterParticleProvidersEvent`应仅在客户端上调用，因此在某些客户端类中被单端化独立，并被`DistExecutor`或`@EventBusSubscriber`引用。

#### ParticleDescription、SpriteSet、以及SpriteParticleRegistration

有三种粒子渲染类型不能使用上述注册方法： `PARTICLE_SHEET_OPAQUE`、`PARTICLE_SHEET_TRANSLUCENT`和`PARTICLE_SHEET_LIT`。这是因为这三种粒子渲染类型都使用由`ParticleEngine`直接加载的sprite集。因此，所提供的纹理必须通过不同的方法获得和注册。这将假设你的粒子是`TextureSheetParticle`的子类型，因为这是该逻辑的唯一原版实现。

要将纹理添加到粒子，必须将一个新的JSON文件添加到`assets/<modid>/particles`。这被称为`ParticleDescription`。该文件的名称将代表工厂所附加的`ParticleType`的注册表名称。每个粒子JSON都是一个对象。该对象存储单个关键的`textures`，该键包含`ResourceLocation`的一个数组。此处表示的任何`<modid>:<path>`纹理都将指向`assets/<modid>/textures/particle/<path>.png`处的纹理。

```js
{
  "textures": [
    // Will point to a texture located in
    // assets/mymod/textures/particle/particle_texture.png
    "mymod:particle_texture",
    // Textures should by ordered by drawing order
    // e.g. particle_texture will render first, then particle_texture2
    //      after some time
    "mymod:particle_texture2"
  ]
}
```

若要引用一个粒子纹理，`TextureSheetParticle`的子类型应采用`SpriteSet`或从`SpriteSet`获得的`TextureAtlasSprite`。`SpriteSet`包含一个纹理列表，这些纹理引用了我们的`ParticleDescription`定义的sprite。`SpriteSet`有两个方法，这两个方法都以不同的方法获取`TextureAtlasSprite`。第一种方法接受两个整数。其背后的实现允许sprite在老化时进行纹理更改。第二种方法接受一个`Random`实例，从sprite集中获取随机纹理。可以使用`SpriteSet`中的一个辅助方法在`TextureSheetParticle`中设置sprite：`#pickSprite`使用拾取纹理的随机方法，`#setSpriteFromAge`使用两个整数的百分比方法拾取纹理。

要注册这些粒子纹理，需要向`RegisterParticleProvidersEvent#registerSpriteSet`方法提供一个`SpriteParticleRegistration`。此方法接收一个`SpriteSet`，其中包含粒子的相关sprite集，并创建一个`ParticleProvider`来创建粒子。最简单的实现方法可以通过在某个类上实现`ParticleProvider`并让构造函数接受`SpriteSet`来完成。然后，`SpriteSet`可以正常地传递给粒子。

!!! 注意
    如果你注册的是仅包含一个纹理的`TextureSheetParticle`子类型，则可以转而向`#registerSprite`方法提供`ParticleProvider$Sprite`，其与`ParticleProvider`具有基本相同的功能接口方法。

生成一个粒子
-----------

粒子可以在任一存档实例中生成。但是，每一端都有一种特定的方式来生成粒子。如果在`ClientLevel`上，可以调用`#addParticle`来生成粒子，或者可以调用`#addAlwaysVisibleParticle`以生成从任何距离可见的粒子。如果在`ServerLevel`上，则可以调用`#sendParticles`向客户端发送数据包以生成粒子。在服务端上调用两个`ClientLevel`方法将会一无所获。

[sides]: ../concepts/sides.md
[registration]: ../concepts/registries.md#methods-for-registering
