事件
====

Forge使用事件总线以允许模组拦截来自各种原版和模组行为的事件。

例如：右键单击原版的木棍时，一个事件可被触发以用于执行操作。

用于大多数事件的主事件总线位于`MinecraftForge#EVENT_BUS`。在`FMLJavaModLoadingContext#getModEventBus`中还有另一个用于特定于模组事件的事件总线，你应该只在特定情况下使用它。关于该事件总线的更多信息可以在下面找到。

每个事件都在其中一条总线上触发：大多数事件在主要的Forge事件总线上触发，但也有一些在特定于模组的事件总线上触发。

事件处理器是某个已注册到事件总线的方法。

创建一个事件处理器
----------------

事件处理器方法只有一个参数，不返回结果。该方法可以是静态的，也可以是实例化的，具体取决于实现。

事件处理器可以使用`IEventBus#addListener`直接注册，或对于泛型事件（`GenericEvent<T>`的子类）使用`IEventBus#addGenericListener`直接注册。任一监听器注册方法接收表示方法引用的Consumer。泛型事件处理器还需要指定泛型的具体类型。事件处理器必须在模组主类的构造函数中注册。

```java
// 在模组主类ExampleMod中

// 该事件位于模组事件总线上
private void modEventHandler(RegisterEvent event) {
	// Do things here
}

// 该事件位于Forge事件总线上
private static void forgeEventHandler(AttachCapabilitiesEvent<Entity> event) {
	// ...
}

// 在模组构造函数内
modEventBus.addListener(this::modEventHandler);
forgeEventBus.addGenericListener(Entity.class, ExampleMod::forgeEventHandler);
```

### 实例化的已注释的事件处理器

该事件处理器监听`EntityItemPickupEvent`，正如名称所述，每当`Entity`拾取一件物品时，该事件就会被发布到事件总线。

```java
public class MyForgeEventHandler {
	@SubscribeEvent
	public void pickupItem(EntityItemPickupEvent event) {
		System.out.println("Item picked up!");
	}
}
```

要注册这个事件处理器，请使用`MinecraftForge.EVENT_BUS.register(...)`并向其传递事件处理器所在类的一个实例。如果要将此处理器注册到特定于模组的事件总线，则应使用`FMLJavaModLoadingContext.get().getModEventBus().register(...)`。

### 静态的已注释的事件处理器

事件处理器也可以是静态的。处理事件的方法仍然使用`@SubscribeEvent`进行注释。与实例化的事件处理器的唯一区别是它也被标记为`static`。要注册静态的事件处理器，传入类的实例是不行的。必须传入类本身。例如：

```java
public class MyStaticForgeEventHandler {
	@SubscribeEvent
	public static void arrowNocked(ArrowNockEvent event) {
		System.out.println("Arrow nocked!");
	}
}
```

其必须像这样注册：`MinecraftForge.EVENT_BUS.register(MyStaticForgeEventHandler.class)`。

### 自动注册静态的事件处理器

类可以使用`@Mod$EventBusSubscriber`进行注释。当`@Mod`类本身被构造时，这样的类会自动注册到`MinecraftForge#EVENT_BUS`。这实质上相当于在`@Mod`类的构造函数的末尾添加`MinecraftForge.EVENT_BUS.register(AnnotatedClass.class);`。

你可以向`@Mod$EventBusSubscriber`注释指明所要监听的总线。建议你也指定mod id，因为注释在处理的过程中可能无法确定它，以及你所注册的总线，因为它作为一个保障可以确保你所注册的是正确的总线。你还可以指定要加载此事件处理器的`Dist`或物理端。这可用于保证不在dedicated服务器上加载客户端特定的事件处理器。

下面是静态事件处理器监听`RenderLevelStageEvent`的示例，该处理器将仅在客户端上调用：

```java
@Mod.EventBusSubscriber(modid = "mymod", bus = Bus.FORGE, value = Dist.CLIENT)
public class MyStaticClientOnlyEventHandler {
	@SubscribeEvent
	public static void drawLast(RenderLevelStageEvent event) {
		System.out.println("Drawing!");
	}
}
```

!!! 注意
    这不会注册类的实例；它注册类本身（即事件处理方法必须是静态的）。

事件的取消
---------

如果一个事件可以被取消，它将带有`@Cancelable`注释，并且方法`Event#isCancelable()`将返回`true`。可取消事件的取消状态可以通过调用`Event#setCanceled(boolean canceled)`来修改，其中传递布尔值`true`意为取消事件，传递布尔值`false`被解释为“不取消”事件。但是，如果无法取消事件（如`Event#isCancelable()`所定义），则无论传递的布尔值如何，都将抛出`UnsupportedOperationException`，因为不可取消事件事件的取消状态被认为是不可变的。

!!! 重要
	并非所有事件都可以取消！试图取消不可取消的事件将导致抛出未经检查的`UnsupportedOperationException`，可能将导致游戏崩溃！在尝试取消某个事件之前，请始终使用`Event#isCancelable()`检查该事件是否可以取消！

事件的结果
---------

某些事件具有`Event$Result`。结果可以是以下三种情况之一：`DENY`（停止事件）、`DEFAULT`（使用默认行为）和`ALLOW`（强制执行操作，而不管最初是否执行）。事件的结果可以通过调用`#setResult`并用一个`Event$Result`来设置。并非所有事件都有结果；带有结果的事件将用`@HasResult`进行注释。

!!! 重要
    不同的事件可能以不同的方式处理结果，在使用事件的结果之前请参阅事件的JavaDoc。

事件处理优先级
-------------

事件处理方法（用`@SubscribeEvent`标记）具有优先级。你可以通过设置注释的`priority`值来安排事件处理方法的优先级。优先级可以是`EventPriority`枚举的任何值（`HIGHEST`、`HIGH`、`NORMAL`、`LOW`和`LOWEST`）。优先级为`HIGHEST`的事件处理器首先执行，然后按降序执行，直到最后执行的`LOWEST`为止。

子事件
------

许多事件本身都有不同的变体。这些变体事件可以不尽相同，但都基于一个共同的因素（例如`PlayerEvent`），也可以是具有多个阶段的事件（例如`PotionBrewEvent`）。请注意，如果你监听父类事件，你的事件处理方法也将收到其*所有*子类事件。

模组事件总线
-----------

模组事件总线主要用于监听模组应该初始化的生命周期事件。模组总线上的每个事件类型都需要实现`IModBusEvent`。其中许多事件也是并行运行的（多线程——译者注），因此多个模组可以同时被初始化。这意味着你不能在这些事件中直接执行来自其他模组的代码。为此，请使用`InterModComms`系统。

以下是在模组事件总线上的模组初始化期间调用的四个最常用的生命周期事件：

* `FMLCommonSetupEvent`
* `FMLClientSetupEvent`和`FMLDedicatedServerSetupEvent`
* `InterModEnqueueEvent`
* `InterModProcessEvent`

!!! 注意
	`FMLClientSetupEvent`和`FMLDedicatedServerSetupEvent`仅在各自的分发版本（物理端——译者注）上调用。

这四个生命周期事件都是并行运行的，因为它们都是`ParallelDispatchEvent`的子类。如果你想在任何`ParallelDispatchEvent`期间在主线程上运行运行代码，可以使用`#enqueueWork`来执行此操作。

除了生命周期事件之外，还有一些在模组事件总线上触发的杂项事件，你可以在其中注册、设置或初始化各种事情。与生命周期事件相比，这些事件中的大多数不是并行运行的。举几个例子：

* `RegisterColorHandlersEvent`
* `ModelEvent$BakingCompleted`
* `TextureStitchEvent`
* `RegisterEvent`

一个很好的经验法则是：当事件应该在模组初始化期间处理时，就在模组事件总线上触发事件。
