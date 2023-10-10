模组生命周期
===========

在模组加载过程中，各种生命周期事件在模组特定的事件总线上触发。在这些事件期间许多操作被执行，例如[注册对象][registering]、准备[数据生成][datagen]或[与其他模组通信][imc]。

事件监听器应使用`@EventBusSubscriber(bus = Bus.MOD)`或在模组构造函数中被注册：

```Java
@Mod.EventBusSubscriber(modid = "mymod", bus = Mod.EventBusSubscriber.Bus.MOD)
public class MyModEventSubscriber {
  @SubscribeEvent
  static void onCommonSetup(FMLCommonSetupEvent event) { ... }
}

@Mod("mymod")
public class MyMod {
  public MyMod() {
    FMLModLoadingContext.get().getModEventBus().addListener(this::onCommonSetup);
  } 

  private void onCommonSetup(FMLCommonSetupEvent event) { ... }
}
```

:::danger
    大多数生命周期事件都是并行触发的（多线程——译者注）：所有模组都将同时接收相同的事件。
    
    模组必须注意线程安全，就像调用其他模组的API或访问原版系统一样。延迟代码，以便稍后通过`ParallelDispatchEvent#enqueueWork`执行。
:::

注册表事件
---------

注册表事件是在模组实例构造之后激发的。注册表事件有三种：`NewRegistryEvent`、`DataPackRegistryEvent$NewRegistry`和`RegisterEvent`。这些事件在模组加载期间同步触发。

`NewRegistryEvent`允许模组开发者使用`RegistryBuilder`类注册自己的自定义注册表。

`DataPackRegistryEvent$NewRegistry`允许模组开发者通过提供`Codec`对JSON中的对象进行编码和解码来注册自定义数据包注册表。

`RegisterEvent`用于[将对象注册到注册表中][registering]。每个注册表都会触发该事件。

数据生成
-------

如果游戏被设置为运行[数据生成器][datagen]，那么`GatherDataEvent`将是最后一个触发的事件。此事件用于将模组的数据提供者注册到其关联的数据生成器。此事件也是同步触发的。

通用初始化
---------

`FMLCommonSetupEvent`用于物理客户端和物理服务端通用的操作，例如注册[Capability][capabilities]。

单端初始化
---------

单端初始化事件在其各自的[物理端][sides]触发：物理客户端上触发`FMLClientSetupEvent`，dedicated服务端上触发`FMLDedicatedServerSetupEvent`。这就是应该进行各物理端特定的初始化的地方，例如注册客户端键盘绑定。

InterModComms
-------------

这是模组间可以相互通信以实现跨模组兼容性的地方。有两个相关的事件：`InterModEnqueueEvent`和`InterModProcessEvent`。

`InterModComms`是负责为模组间交换消息的类。其方法在生命周期事件期间可以安全调用，因为它有`ConcurrentMap`支持。

在`InterModEnqueueEvent`期间，使用`InterModComms#sendTo`以向不同的模组发送消息。这些方法接收所发消息的目的模组的mod id、与消息数据相关的键以及持有消息数据的Supplier。此外，还可以指定消息的发送者，但默认情况下，它将是调用者的mod id。

之后在`InterModProcessEvent`期间，使用`InterModComms#getMessages`获取所有接收到的消息的Stream。提供的mod id几乎总是先前调用发送消息方法的模组的mod id。此外，可以指定一个Predicate来对消息键进行过滤。这将返回一个带有`IMCMessages`的Stream，其中包含数据的发送方、数据的接收方、数据键以及所提供的数据本身。

:::caution
    还有另外两个生命周期事件：`FMLConstructModEvent`，在模组实例构造之后但在`RegisterEvent`之前直接触发；`FMLLoadCompleteEvent`，在`InterModComms`事件之后触发，用于模组加载过程完成时。
:::

[registering]: ./registries.md#methods-for-registering
[capabilities]: ../datastorage/capabilities.md
[datagen]: ../datagen/index.md
[imc]: ./lifecycle.md#intermodcomms
[sides]: ./sides.md
