# 事件系统

NeoForge 的核心特性之一是其事件系统。在游戏中，各种事件根据游戏内的不同动作而触发。比如玩家右键点击、玩家或其他实体跳跃、方块渲染、游戏加载时等，都会触发相应的事件。模组开发者可以为这些事件编写处理函数，并在函数中实现他们期望的行为。

这些事件会在相应的事件总线上触发。其中最重要的是 `NeoForge.EVENT_BUS`。此外，在游戏启动期间，系统会为每个加载的模组生成一个独立的模组总线，并传递给模组的构造函数。许多模组总线事件是并行触发的，这与总在同一个线程上运行的主总线事件不同，这种设计显著提高了启动速度。更多细节，请参考[下文][modbus]。

## 注册事件处理函数

注册事件处理函数有多种方式。所有这些方式的共同点是，每个事件处理函数都是一个只接收单一事件参数并且不返回结果（即返回类型为 `void`）的方法。

### `IEventBus#addListener`

最简单的注册方法是直接引用方法，如下所示：

```java
@Mod("yourmodid")
public class YourMod {
    public YourMod(IEventBus modBus) {
        NeoForge.EVENT_BUS.addListener(YourMod::onLivingJump);
    }

    // 每次实体跳跃时为其恢复半颗心的生命值。
    private static void onLivingJump(LivingJumpEvent event) {
        Entity entity = event.getEntity();
        // 仅在服务器端进行治疗
        if (!entity.level().isClientSide()) {
            entity.heal(1);
        }
    }
}
```

### `@SubscribeEvent`

另一种方式是使用注解来驱动事件处理，为处理函数添加 `@SubscribeEvent` 注解。然后将包含该处理函数的类的实例传递给事件总线，从而注册该实例中所有带有 `@SubscribeEvent` 注解的事件处理函数：

```java
public class EventHandler {
    @SubscribeEvent
    public void onLivingJump(LivingJumpEvent event) {
        Entity entity = event.getEntity();
        if (!entity.level().isClientSide()) {
            entity.heal(1);
        }
    }
}

@Mod("yourmodid")
public class YourMod {
    public YourMod(IEventBus modBus) {
        NeoForge.EVENT_BUS.addListener(new EventHandler());
    }
}
```

你还可以通过将所有事件处理函数设置为静态，并直接传递类本身，而不是类的实例来实现：

```java
public class EventHandler {
	@SubscribeEvent
    public static void onLivingJump(LivingJumpEvent event) {
        Entity entity = event.getEntity();
        if (!entity.level().isClientSide()) {
            entity.heal(1);
        }
    }
}

@Mod("yourmodid")
public class YourMod {
    public YourMod(IEventBus modBus) {
        NeoForge.EVENT_BUS.addListener(EventHandler.class);
    }
}
```

### `@Mod.EventBusSubscriber`

我们可以进一步优化，将事件处理类标注为 `@Mod.EventBusSubscriber`。这个注解会被 NeoForge 自动识别，允许你从模组构造函数中移除所有与事件相关的代码。实际上，这等同于在模组构造结束时调用 `NeoForge.EVENT_BUS.register(EventHandler.class)`。这也意味着所有的处理函数必须设置为静态。

虽然不是必须的，但强烈建议在注解中指定 `modid` 参数，以便在处理模组冲突时能够更容易进行调试。

```java
@Mod.EventBusSubscriber(modid = "yourmodid")
public class EventHandler {
    @SubscribeEvent
    public static void onLivingJump(LivingJumpEvent event) {
        Entity entity = event.getEntity();
        if (!entity.level().isClientSide()) {
            entity.heal(1);
        }
    }
}
```

### 生命周期事件

大多数模组总

线事件被称为生命周期事件。生命周期事件在每个模组的生命周期中仅在启动时运行一次。很多这类事件是并行触发的，如果你想要在主线程上运行这些事件的代码，可以使用 `#enqueueWork(Runnable runnable)` 方法将它们加入队列。

生命周期事件通常按以下顺序进行：

- 调用模组构造函数。在这里或下一步注册你的事件处理函数。
- 所有的 `@Mod.EventBusSubscriber` 被调用。
- 触发 `FMLConstructModEvent` 事件。
- 触发注册事件，包括 [`NewRegistryEvent`][newregistry]、[`DataPackRegistryEvent.NewRegistry`][newdatapackregistry] 以及每个注册表的 [`RegisterEvent`][registerevent]。
- 触发 `FMLCommonSetupEvent` 事件。这是进行各种杂项设置的阶段。
- 根据服务器类型触发侧边设置事件：如果在客户端，则为 `FMLClientSetupEvent`；如果在服务器，则为 `FMLDedicatedServerSetupEvent`。
- 处理 `InterModComms`（详情见下文）。
- 触发 `FMLLoadCompleteEvent` 事件。

#### `InterModComms`

`InterModComms` 是一个系统，允许模组开发者向其他模组发送消息以实现功能兼容。这个系统保存了模组的消息，所有方法都是线程安全的。主要通过两个事件推动：`InterModEnqueueEvent` 和 `InterModProcessEvent`。

在 `InterModEnqueueEvent` 期间，你可以使用 `InterModComms#sendTo` 向其他模组发送消息。这些方法接受要发送消息到的模组的 ID、与消息数据相关的键（以区分不同的消息），以及持有消息数据的 `Supplier`。发送者可以选择性指定。

接着，在 `InterModProcessEvent` 期间，你可以使用 `InterModComms#getMessages` 获取作为 `IMCMessage` 对象的所有接收到的消息的流。这些消息包含了数据的发送者、预期的接收者、数据键和实际数据的供应商。

### 其他模组总线事件

除了生命周期事件外，还有一些其他在模组总线上触发的杂项事件，主要是出于历史原因。这些事件通常不是并行运行的，与生命周期事件相反。例如：

- `RegisterColorHandlersEvent`
- `ModelEvent.BakingCompleted`
- `TextureStitchEvent`

:::warning
计划在未来版本中将大多数这些事件转移到主事件总线上。
:::

[modbus]: #event-buses
[newdatapackregistry]: registries.md#custom-datapack-registries
[newregistry]: registries.md#custom-registries
[registerevent]: registries.md#registerevent
[side]: sides.md
