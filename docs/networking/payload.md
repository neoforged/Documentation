# 注册负载

负载是在客户端和服务器之间发送任意数据的一种方法。它们使用从 `RegisterPayloadHandlerEvent` 事件中获取的 `IPayloadRegistrar` 进行注册，该事件可以为给定的命名空间检索到。
```java
@SubscribeEvent
public static void register(final RegisterPayloadHandlerEvent event) {
    final IPayloadRegistrar registrar = event.registrar("mymod");
}
```

假设我们想要发送以下数据：
```java
public record MyData(String name, int age) {}
```

然后，我们可以实现 `CustomPacketPayload` 接口来创建一个可用于发送和接收此数据的负载。
```java
public record MyData(String name, int age) implements CustomPacketPayload {
    
    public static final ResourceLocation ID = new ResourceLocation("mymod", "my_data");
    
    public MyData(final FriendlyByteBuf buffer) {
        this(buffer.readUtf(), buffer.readInt());
    }
    
    @Override
    public void write(final FriendlyByteBuf buffer) {
        buffer.writeUtf(name());
        buffer.writeInt(age());
    }
    
    @Override
    public ResourceLocation id() {
        return ID;
    }
}
```
从上面的示例中可以看出，`CustomPacketPayload` 接口要求我们实现 `write` 和 `id` 方法。`write` 方法负责将数据写入缓冲区，而 `id` 方法负责返回此负载的唯一标识符。
然后，我们还需要一个读取器来稍后进行注册，在这里我们可以使用自定义构造函数从缓冲区中读取数据。

最后，我们可以使用注册器注册此负载：
```java
@SubscribeEvent
public static void register(final RegisterPayloadHandlerEvent event) {
    final IPayloadRegistrar registrar = event.registrar("mymod");
    registrar.play(MyData.ID, MyData::new, handler -> handler
            .client(ClientPayloadHandler.getInstance()::handleData)
            .server(ServerPayloadHandler.getInstance()::handleData));
}
```
分解上面的代码，我们可以注意到几件事情：
- 注册器有一个 `play` 方法，可用于注册在游戏播放阶段发送的负载。
  - 此代码中未显示的方法还有 `configuration` 和 `common`，但它们也可以用于为配置阶段注册负载。`common` 方法可用于同时为配置和游戏播放阶段注册负载。
- `MyData` 的构造函数被用作方法引用，以创建负载的读取器。
- 注册方法的第三个参数是一个回调，用于注册负载到达客户端或服务器端时的处理程序。
  - `client` 方法用于在负载到达客户端时注册处理程序。
  - `server` 方法用于在负载到达服务器端时注册处理程序。
  - 在注册器本身上还有一个次要的注册方法 `play`，它接受客户端和服务器端的处理程序，可以用于同时为两端注册处理程序。

现在我们已经注册了负载，我们需要实现一个处理程序。
在此示例中，我们将特别关注客户端端处理程序，但服务器端处理程序非常相似。
```java
public class ClientPayloadHandler {
    
    private static final ClientPayloadHandler INSTANCE = new ClientPayloadHandler();
    
    public static ClientPayloadHandler getInstance() {
        return INSTANCE;
    }
    
    public void handleData(final MyData data, final PlayPayloadContext context) {
        // 处理数据，在网络线程上
        blah(data.name());
        
        // 在主游戏线程上处理数据
        context.workHandler().submitAsync(() -> {
            blah(data.age());
        })
        .exceptionally(e -> {
            // 处理异常
            context.packetHandler().disconnect(Component.translatable("my_mod.networking.failed", e.getMessage()));
            return null;
        });
    }
}
```
这里需要注意几件事情：
- 此处处理方法获取负载和上下文对象。上下文对象对于播放和配置阶段是不同的，如果注册了一个通用负载，则需要接受两个上下文的超类型。
- 负载方法的处理程序在网络线程上调用，因此重要的是在此处进行所有繁重的工作，而不是阻塞主游戏线程。
- 如果要在主游戏线程上运行代码，可以使用上下文的 `workHandler` 提交任务到主线程。
  - `workHandler` 将返回一个在主线程上完成的 `CompletableFuture`，可以用于提交任务到主线程。
  - 注意：返回的是 `CompletableFuture`，这意味着您可以将多个任务链接在一起，并在单个位置处理异常。
  - 如果不在 `CompletableFuture` 中处理异常，则它将被忽略，**您将不会收到任何通知**。

现在您知道了如何为您的模组促进客户端和服务器之间的通信，您可以开始实现自己的负载。
有了自己的负载，您就可以使用它们来配置客户端和服务器，使用[配置任务][]。

[配置任务]: ./configuration-tasks.md
