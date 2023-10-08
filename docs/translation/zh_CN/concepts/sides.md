Minecraft中的端位
================

为Minecraft开发模组时需要理解的一个非常重要的概念是两个端位：*客户端*和*服务端*。关于端位有很多常见的误解和错误，这可能会导致bug，而这些bug虽然可能不会破坏游戏，但是一定能够产生意想不到的、往往不可预测的影响。

不同种类的端位
-------------

当我们说“客户端”或“服务端”时，我们通常会对所谈论的游戏的哪个部分有相当直观的理解。毕竟，客户端是用户交互的对象，服务端是用户连接多人游戏的地方。很简单，对吧？

而事实是，即使有两个这样的术语，也可能存在一些歧义。在这里，我们消除了“客户端”和“服务端”的四个可能含义的歧义：

* 物理客户端 - 无论何时从启动器启动Minecraft，*物理客户端*都是运行的整个程序。在游戏的图形化、可交互的生命周期中运行的所有线程、进程和服务都是物理客户端的一部分。
* 物理服务端 - 通常被称为dedicated服务端，*物理服务端*是在你启动任何类型的`minecraft_server.jar`时运行的整个程序，该程序不会显示可用于游玩的GUI。
* 逻辑服务端 - *逻辑服务端*运行游戏逻辑：生物的生成，天气，物品栏、生命值、AI的更新以及其他所有游戏机制。逻辑服务端存在于物理服务端中，但它也可以与逻辑客户端一起在物理客户端中运行，作为一个单机世界。逻辑服务端始终在名为`Server Thread`的线程中运行。
* 逻辑客户端 - *逻辑客户端*接受玩家的输入并将其转发到逻辑服务端。此外，它还从逻辑服务端接收信息，并以图形方式呈现给玩家。逻辑客户端在`Render Thread`中运行，但通常会派生出几个其他线程来处理音频和方块渲染批处理等事务。

在MinecraftForge代码库中，物理端由一个名为`Dist`的枚举表示，而逻辑端则由一个名为`LogicalSide`的枚举表示。

进行特定端位的操作
-----------------

### `Level#isClientSide`

这种boolean检查将是你最常用的检查端位的方法。在`Level`对象上查询此字段将建立该Level所属的**逻辑**端。也就是说，如果此字段为`true`，则该Level当前正在逻辑客户端上运行。如果该字段为`false`，则表示该Level正在逻辑服务端上运行。因此，物理服务端在该字段中总是包含`false`，但我们不能假设`false`意味着物理服务端，因为该字段对于物理客户端（换句话说，单机世界）内的逻辑服务端也可能是`false`。

当你需要确定是否应该运行游戏逻辑和其他机制时，请使用这种检查方式。例如，如果你想在玩家每次点击你的方块时伤害他们，或者让你的机器将泥土处理成钻石，你只有在确保`#isClientSide`为`false`后才能这样做。在最好的情况下，将游戏逻辑应用于逻辑客户端可能会导致去同步（幽灵实体、去同步状态等），在最坏的情况下会导致崩溃。

这种检查应该成为习惯。你很少需要除`DistExecutitor`以外的其他方式来确定端位和调整行为。

### `DistExecutor`

考虑到客户端和服务端的模组都使用同一个“通用”的jar，以及将物理端分离为两个jar，我们想到了一个重要的问题：我们该如何使用只存在于某一个物理端的代码？`net.minecraft.client`下的所有代码仅存在于物理客户端上。如果你编写的任何类以任何方式引用了上述包下的类型名称，那么当在不存在这些类型名称的环境中加载相应的类时，它们将导致游戏崩溃。初学者的一个非常常见的错误是在他们的方块或方块实体类中调用`Minecraft.getInstance().<doStuff>()`，一旦加载这些类，就会导致任何物理服务端崩溃。

我们如何解决这个问题？幸运的是，FML有一个`DistExecutor`，它提供了各种方法来在不同的物理端运行不同的方法，或者只在某一物理端运行单个方法。

!!! 注意
    对FML基于**物理**端进行检查的理解尤为重要。单机世界（包含逻辑服务端+物理客户端的逻辑客户端）将始终使用`Dist.CLIENT`！

`DistExecutor`的工作原理是接收所提供的执行方法的Supplier，通过利用[JVM指令`invokedynamic`][invokedynamic]有效地防止类加载。被执行的方法应该是静态的并且在不同的类中。此外，如果这个静态方法没有参数，则应使用该方法的引用，而不是一个执行方法的Supplier。

`DistExecutor`中有两个主要方法：`#runWhenOn`和`#callWhenOn`。方法接受的参数为将被执行的方法和该方法应该运行的物理端，该方法（将被执行的方法）既可有返回值，也可无返回值。

这两种方法被进一步细分为`#safe*`和`#unsafe*`变体。安全（safe）和不安全（unsafe）这两种命名方式其实差强人意。主要区别在于，在开发环境中，`#safe*`方法将验证所提供的执行方法是否是返回的对另一个类的方法引用的lambda，否则将抛出错误。在产品环境中，`#safe*`和`#unsafe*`在功能上是相同的。

```java
// 在一个客户端类中：ExampleClass
public static void unsafeRunMethodExample(Object param1, Object param2) {
  // ...
}

public static Object safeCallMethodExample() {
  // ...
}

// 在一个通用类中
DistExecutor.unsafeRunWhenOn(Dist.CLIENT, () -> ExampleClass.unsafeRunMethodExample(var1, var2));

DistExecutor.safeCallWhenOn(Dist.CLIENT, () -> ExampleClass::safeCallMethodExample);

```

!!! 警告
    由于`invokedynamic`在Java 9+中的工作方式发生了变化，`DistExecutor`方法的所有`#safe*`变体都会在开发环境中抛出封装在`BootstrapMethodError`中的原始异常。应该使用`#unsafe*`变体或对[`FMLEnvironment#dist`][dist]的检查作为替代。

### 线程组

如果`Thread.currentThread().getThreadGroup() == SidedThreadGroups.SERVER`为true，则很可能当前线程位于逻辑服务端上。否则，它很可能在逻辑客户端上。当你无法访问`Level`对象以检查`isClientSide`时，这对于检索**逻辑**端非常有用。它通过查看当前运行的线程组来*猜测*你处于哪个逻辑端。因为这是一种猜测，所以只有在用尽其他选项时才应该使用这种方法。在几乎所有情况下，你应该优先检查`Level#isClientSide`。

### `FMLEnvironment#dist`和`@OnlyIn`

`FMLEnvironment#dist`表示当前你的代码正在运行的**物理**端。由于它是在启动时确定的，所以它不依赖于猜测来返回结果。然而，在这方面的用例并不是很多。

使用`@OnlyIn(Dist)`注释对方法或字段进行注释会向加载器表明，应该将相应的成员在非指定的**物理**端中从定义里完全剥离。通常，这些只有在浏览反编译的Minecraft代码时才能看到，暗示着Mojang混淆器删除了的方法。**没有**理由直接使用此注释。请改用`DistExecutor`或检查`FMLEnvironment#dist`。

常见错误
--------

### 跨逻辑端访问

每当你想将信息从一个逻辑端发送到另一个逻辑端时，必须**始终**使用网络数据包。即便在单机场景中，将数据从逻辑服务端直接传输到逻辑客户端是非常诱人的。

实际上，这通常是通过静态字段无意中完成的。由于在单机场景中，逻辑客户端和逻辑服务端共享相同的JVM，因此向静态字段写入和从静态字段读取的线程都会导致各种竞争条件以及与线程相关的经典问题。

通过从逻辑服务端上运行或可以运行的公共代码访问仅物理客户端的类（如`Minecraft`），也可能会明确地犯下这个错误。对于在物理客户端中调试的初学者来说，这个错误很容易被忽略。代码会在那里工作，但它会立即在物理服务端上崩溃。


编写单端模组
-----------

在最近的版本中，Minecraft Forge从mods.toml中删除了一个“sidedness”属性。这意味着无论你的模组是加载在物理客户端还是物理服务端上，它们都可以工作。因此，对于单端模组，你通常会在`DistExecutor#safeRunWhenOn`或`DistExecutor#unsafeRunWhen`中注册事件处理程序，而不是直接调用模组构造函数中的相关注册方法。基本上，如果你的模组加载在错误的一端，它应该什么都不做，不监听任何事件，等等。单端模组本质上不应该注册方块、物品……因为它们也需要在另一端可用。

此外，如果你的模组是单端的，它通常不会禁止用户加入缺乏该模组的服务端。因此，你应该将mods.toml中的`displayTest`属性设置为任何必要的值。

```toml
[[mods]]
  # ...

  # MATCH_VERSION表示如果客户端和服务端上的版本不同，你的模组将导致红X。这是默认行为，如果你的模组有服务端和客户端元素，这就是你应该使用的。
  # IGNORE_SERVER_VERSION表示如果你的模组出现在服务端上但不在客户端上，它不会导致红X。如果你的模组是一个仅限服务端的模组，这就是你应该使用的。
  # IGNORE_ALL_VERSION表示如果你的模组出现在客户端或服务端上，它不会导致红X。这是一个特殊情况，只有当你的模组没有服务端成分时才应该使用。
  # NONE表示没有在你的模组上设置显示检测。你需要自己完成此操作，有关详细信息，请参阅IExtensionPoint.DisplayTest。你可以使用此值定义任何你想要的方案。
  # 重要提示：这不是关于你的模组加载在哪个环境（客户端或dedicated服务端）上的说明。你的模组必然会加载（也许什么都不做！）。
  displayTest="IGNORE_ALL_VERSION" # 如果未指定任何内容，则MATCH_VERSION为默认值 (#可选)
```

如果要使用自定义显示检测，则`displayTest`选项应设置为`NONE`，并且应注册`IExtensionPoint$displayTest`扩展：

```java
//确保另一个网络端上缺失的模组不会导致客户端将服务端显示为不兼容
ModLoadingContext.get().registerExtensionPoint(IExtensionPoint.DisplayTest.class, () -> new IExtensionPoint.DisplayTest(() -> NetworkConstants.IGNORESERVERONLY, (a, b) -> true));
```

这告诉客户端它应该忽略服务端版本不存在，服务端不应该告诉客户端这个模组应该存在。因此，这个代码片段适用于仅客户端和服务端的模组。


[invokedynamic]: https://docs.oracle.com/javase/specs/jvms/se17/html/jvms-6.html#jvms-6.5.invokedynamic
[dist]: #fmlenvironmentdist-and-onlyin
[structuring]: ../gettingstarted/modfiles.md#modstoml
