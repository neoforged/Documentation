# 使用配置任务

客户端和服务器的网络协议有一个特定的阶段，服务器可以在玩家实际加入游戏之前配置客户端。
这个阶段称为配置阶段，例如，原版服务器用它来向客户端发送资源包信息。

这个阶段也可以被 mod 用来在玩家加入游戏之前配置客户端。

## 注册配置任务
使用配置阶段的第一步是注册一个配置任务。
这可以通过在 `OnGameConfigurationEvent` 事件中注册新的配置任务来完成。
```java
@SubscribeEvent
public static void register(final OnGameConfigurationEvent event) {
    event.register(new MyConfigurationTask());
}
```
`OnGameConfigurationEvent` 事件在 mod 总线上触发，并暴露了服务器用来配置相关客户端的当前监听器。
Modder 可以使用暴露的监听器来判断客户端是否运行了 mod，并在是这样的情况下注册一个配置任务。

## 实现配置任务
配置任务是一个简单的接口：`ICustomConfigurationTask`。
这个接口有两个方法：`void run(Consumer<CustomPacketPayload> sender);`，和 `ConfigurationTask.Type type();` 返回配置任务的类型。
类型用于标识配置任务。
下面是一个配置任务的示例：
```java
public record MyConfigurationTask implements ICustomConfigurationTask {
    public static final ConfigurationTask.Type TYPE = new ConfigurationTask.Type(new ResourceLocation("mymod:my_task"));
    
    @Override
    public void run(final Consumer<CustomPacketPayload> sender) {
        final MyData payload = new MyData();
        sender.accept(payload);
    }

    @Override
    public ConfigurationTask.Type type() {
        return TYPE;
    }
}
```

## 确认配置任务
您的配置在服务器上执行，服务器需要知道何时可以执行下一个配置任务。
这可以通过确认所述配置任务的执行来完成。

有两种主要方式可以实现这一点：

### 捕获监听器
当客户端不需要确认配置任务时，可以捕获监听器，并可以直接在服务器端确认配置任务。
```java
public record MyConfigurationTask(ServerConfigurationListener listener) implements ICustomConfigurationTask {
    public static final ConfigurationTask.Type TYPE = new ConfigurationTask.Type(new ResourceLocation("mymod:my_task"));
    
    @Override
    public void run(final Consumer<CustomPacketPayload> sender) {
        final MyData payload = new MyData();
        sender.accept(payload);
        listener.finishCurrentTask(type());
    }

    @Override
    public ConfigurationTask.Type type() {
        return TYPE;
    }
}
```
要使用这样的配置任务，需要在 `OnGameConfigurationEvent` 事件中捕获监听器。
```java
@SubscribeEvent
public static void register(final OnGameConfigurationEvent event) {
    event.register(new MyConfigurationTask(event.listener()));
}
```
然后，在当前配置任务完成后，下一个配置任务将立即执行，客户端不需要确认配置任务。
此外，服务器将不会等待客户端正确处理发送的载荷。

### 确认配置任务
当客户端需要确认配置任务时，您将需要向客户端发送自己的载荷：
```java
public record AckPayload() implements CustomPacketPayload {
    public static final ResourceLocation ID = new ResourceLocation("mymod:ack");
    
    @Override
    public void write(final FriendlyByteBuf buffer) {
        // 无需写入数据
    }

    @Override
    public ResourceLocation id() {
        return ID;
    }
}
```
当服务器端配置任务发送的有效载荷被正确处理时，您可以向服务器发送此载荷以确认配置任务。
```java
public void onMyData(MyData data, ConfigurationPayloadContext context) {
    context.submitAsync(() -> {
        blah(data.name());
    })
    .exceptionally(e -> {
        // 处理异常
        context.packetHandler().disconnect(Component.translatable("my_mod.configuration.failed", e.getMessage()));
        return null;
    })
    .thenAccept(v -> {
        context.replyHandler().send(new AckPayload());
    });     
}
```
其中 `onMyData` 是处理由服务器端配置任务发送的载荷的处理程序。

当服务器接收到此载荷时，将确认配置任务，并将执行下一个配置任务：
```java
public void onAck(AckPayload payload, ConfigurationPayloadContext context) {
    context.taskCompletedHandler().onTaskCompleted(MyConfigurationTask.TYPE);
}
```
其中 `onAck` 是处理由客户端发送的载荷的处理程序。

## 阻塞登录过程
当配置未被确认时，服务器将永远等待，客户端将永远无法加入游戏。
因此，始终确认配置任务非常重要，除非配置任务失败，然后您可以断开客户端的连接。
