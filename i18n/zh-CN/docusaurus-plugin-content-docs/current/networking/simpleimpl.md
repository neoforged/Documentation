SimpleImpl
==========

SimpleImpl是围绕`SimpleChannel`类的数据包系统的名称。使用此系统是迄今为止在客户端和服务端之间发送自定义数据的最简单方法。

快速入门
--------

首先，你需要创建`SimpleChannel`对象。我们建议你在单独的类中执行此操作，可能类似于`ModidPacketHandler`。将`SimpleChannel`创建为此类中的静态字段，如下所示：

```java
private static final String PROTOCOL_VERSION = "1";
public static final SimpleChannel INSTANCE = NetworkRegistry.newSimpleChannel(
  new ResourceLocation("mymodid", "main"),
  () -> PROTOCOL_VERSION,
  PROTOCOL_VERSION::equals,
  PROTOCOL_VERSION::equals
);
```

第一个参数是通道的名称。第二个参数是返回当前网络协议版本的`Supplier<String>`。第三个和第四个参数分别是`Predicate<String>`，分别检查传入的连接协议版本是否与客户端或服务端网络兼容。在这里，我们只需直接与`PROTOCOL_VERSION`字段进行比较，这意味着客户端和服务端`PROTOCOL_VERSION`必须始终匹配，否则FML将拒绝登录。

版本检查器
---------

如果你的模组不要求另一端拥有特定的网络通道，或者根本不要求对方是Forge实例，你应该注意正确定义你的版本兼容性检查器（`Predicate<String>`参数），以处理版本检查器可以接收的其他“元版本”（在`NetworkRegistry`中定义）。这些是：

* `ABSENT` - 如果该通道在另一个端点上丢失。请注意，在这种情况下，端点仍然是Forge端点，并且可能具有其他模组。
* `ACCEPTVANILLA` - 如果端点是原版（或非Forge）端点（如Fabric——译者注）。

对两者返回`false`意味着该通道必须存在于另一端上。如果你只是复制上面的代码，这就是它的作用。请注意，在列表ping兼容性检查期间也会使用这些值，该检查负责在多人服务器选择屏幕中显示绿色复选框/红叉。

注册数据包
---------

接下来，我们必须声明要发送和接收的消息类型。这是使用`INSTANCE#registerMessage`完成的，它接受5个参数：

- 第一个参数是数据包的鉴别器。这是数据包的每个通道的唯一ID。我们建议你使用本地变量来保存ID，然后使用`id++`调用registerMessage。这将保证100%的唯一ID。
- 第二个参数是实际的数据包类`MSG`。
- 第三个参数是`BiConsumer<MSG, FriendlyByteBuf>`，负责将消息编码到所提供的`FriendlyByteBuf`中。
- 第四个参数是`Function<FriendlyByteBuf, MSG>`，负责从所提供的`FriendlyByteBuf`中解码消息。
- 最后一个参数是负责处理消息本身的`BiConsumer<MSG, Supplier<NetworkEvent.Context>>`。

最后三个参数可以是Java中静态方法或实例方法的方法引用。请记住，实例方法`MSG#encode(FriendlyByteBuf)`仍然满足`BiConsumer<MSG, FriendlyByteBuf>`；`MSG`只不过成为隐含的第一个自变量。

处理数据包
---------

在数据包处理器中，有几件事需要强调。数据包处理器同时具有对其可用消息对象和网络上下文。该上下文允许访问发送数据包的玩家（如果在服务端上），并允许一种方式将线程安全工作排入队列。

```java
public static void handle(MyMessage msg, Supplier<NetworkEvent.Context> ctx) {
  ctx.get().enqueueWork(() -> {
    // 要求线程安全的工作（大多数工作）
    ServerPlayer sender = ctx.get().getSender(); // 发送该数据包的客户端
    // 处理一些事情
  });
  ctx.get().setPacketHandled(true);
}
```

从服务端发送到客户端的数据包应在另一个类中进行处理，并通过`DistExecutor#unsafeRunWhenOn`进行包装。

```java
// 在Packet类中
public static void handle(MyClientMessage msg, Supplier<NetworkEvent.Context> ctx) {
  ctx.get().enqueueWork(() ->
    // 确保其仅在物理客户端上执行
    DistExecutor.unsafeRunWhenOn(Dist.CLIENT, () -> () -> ClientPacketHandlerClass.handlePacket(msg, ctx))
  );
  ctx.get().setPacketHandled(true);
}

// 在ClientPacketHandlerClass中
public static void handlePacket(MyClientMessage msg, Supplier<NetworkEvent.Context> ctx) {
  // 处理一些事情
}
```

请注意`#setPacketHandled`的存在，它用于告诉网络系统该数据包已成功完成处理。


:::danger
    从Minecraft 1.8开始，默认情况下在网络线程上处理数据包。

    这意味着你的处理器 _不_ 能直接与大多数游戏对象交互。Forge提供了一种方便的方法，可以通过提供的`NetworkEvent$Context`在主线程上执行代码。只需调用`NetworkEvent$Context#enqueueWork(Runnable)`，它将在下一次有机会时调用主线程上的给定`Runnable`。
:::

:::danger
    在服务端上处理数据包时要采取防御措施。客户端可能试图通过发送意外数据来对数据包处理过程施压。

    一个常见的问题是易受**任意区块生成**的攻击。当服务端信任客户端发送的方块位置来访问方块和块方实体时，通常会发生这种情况。当访问存档中的未加载区域中的方块和方块实体时，服务端将会要么生成要么从磁盘加载该区域，然后立即将其写入磁盘。利用这一点，可以在不留下痕迹的情况下对服务端的性能和存储空间造成**灾难性破坏**。

    为了避免这个问题，一个普遍的经验法则是，仅访问`Level#hasChunkAt`为true的方块和方块实体。
:::


发送数据包
---------

### 向服务端发送

只有一种方法可以将数据包发送到服务端。这是因为客户端一次只能连接到一个服务端。要做到这一点，我们必须再次使用前面定义的`SimpleChannel`。只需调用`INSTANCE.sendToServer(new MyMessage())`。消息将被发送到对应其类型的处理器（如果存在）。

### 向客户端发送

数据包可以使用`SimpleChannel`直接发送到客户端：`HANDLER.sendTo(new MyClientMessage(), serverPlayer.connection.getConnection(), NetworkDirection.PLAY_TO_CLIENT)`。但是，这可能很不方便。Forge有一些可以使用的便利功能：

```java
// 向一位玩家发送
INSTANCE.send(PacketDistributor.PLAYER.with(serverPlayer), new MyMessage());

// 向正在追踪该存档某个区块的所有玩家发送
INSTANCE.send(PacketDistributor.TRACKING_CHUNK.with(levelChunk), new MyMessage());

// 向所有已连接的玩家发送
INSTANCE.send(PacketDistributor.ALL.noArg(), new MyMessage());
```

还有其他类型的`PacketDistributor`可用；有关更多详细信息，请查看`PacketDistributor`类的文档。
