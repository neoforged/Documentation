# 功能

功能（Capabilities）允许以动态和灵活的方式公开特性，无需直接实现许多接口。

通常来说，每个功能都以接口的形式提供一个特性。

NeoForge 为方块、实体和物品堆叠添加了功能支持。
这将在以下部分中更详细地解释。

## 为什么使用功能

功能旨在将**能做什么**与**如何做**分离开来，适用于方块、实体或物品堆叠。
如果您正在考虑功能是否适合某项工作，请问自己以下问题：
1. 我只关心方块、实体或物品堆叠能做什么，而不关心它如何做吗？
2. 这个 **能做什么**，也就是行为，是否只对某些方块、实体或物品堆叠有效，而不是所有？
3. 这个 **如何做**，即行为的实现，是否依赖于具体的方块、实体或物品堆叠？

以下是一些良好的功能使用示例：
- *“我希望我的流体容器能与其他模组的流体容器兼容，但我不知道每个流体容器的具体情况。”* - 是的，使用 `IFluidHandler` 功能。
- *“我想计算某个实体中有多少物品，但我不知道实体可能如何存储它们。”* - 是的，使用 `IItemHandler` 功能。
- *“我想给某个物品堆叠充能，但我不知道物品堆叠可能如何存储能量。”* - 是的，使用 `IEnergyStorage` 功能。
- *“我想对玩家当前瞄准的任何方块应用颜色，但我不知道方块将如何变化。”* - 是的。NeoForge 没有提供给方块上色的功能，但你可以自己实现。

以下是不推荐使用功能的示例：
- *“我想检查某个实体是否在我的机器范围内。”* - 不，使用帮助方法代替。

## NeoForge 提供的功能

NeoForge 为以下三个接口提供了功能：`IItemHandler`，`IFluidHandler` 和 `IEnergyStorage`。

`IItemHandler` 公开了处理库存槽的接口。`IItemHandler` 类型的功能有：
- `Capabilities.ItemHandler.BLOCK`：方块的自动化可访问库存（用于箱子、机器等）。
- `Capabilities.ItemHandler.ENTITY`：实体的库存内容（额外的玩家槽位、怪物/生物的库存/包）。
- `Capabilities.ItemHandler.ENTITY_AUTOMATION`：实体的自动化可访问库存（船、矿车等）。
- `Capabilities.ItemHandler.ITEM`：物品堆叠的内容（便携背包等）。

`IFluidHandler` 公开了处理流体库存的接口。`IFluidHandler` 类型的功能有：
- `Capabilities.FluidHandler.BLOCK`：方块的自动化可访问流体库存。
- `Capabilities.FluidHandler.ENTITY`：实体的流体库存。
- `Capabilities.FluidHandler.ITEM`：物品堆叠的流体库存。
这个功能是特殊的 `IFluidHandlerItem` 类型，因为桶装液体的方式有所不同。

`IEnergyStorage` 公开了处理能量容器的接口。它基于 TeamCoFH 的 RedstoneFlux API。`IEnergyStorage` 类型的功能有：
- `Capabilities.EnergyStorage.BLOCK`：方块内部的能量。
- `Capabilities.EnergyStorage.ENTITY`：实体内部的能量。
- `Capabilities.EnergyStorage.ITEM`：物品堆叠内部的能量。

## 创建功能

NeoForge为方块、实体和物品堆叠支持功能性。功能性允许在一定逻辑下查找某些API的实现。在NeoForge中实现了以下几种功能性：
- `BlockCapability`：适用于方块和方块实体的功能性；行为依赖于特定的`Block`。
- `EntityCapability`：适用于实体的功能性；行为依赖于特定的`EntityType`。
- `ItemCapability`：适用于物品堆叠的功能性；行为依赖于特定的`Item`。

:::tip
为了与其他模组兼容，如果可能的话，我们建议使用NeoForge在`Capabilities`类中提供的功能性。否则，您可以按照本节所述创建自己的功能性。
:::

创建功能性是单个函数调用，结果对象应该存储在一个`static final`字段中。必须提供以下参数：
- 功能性的名称。多次创建相同名称的功能性将始终返回相同的对象。不同名称的功能性是**完全独立的**，可以用于不同的目的。
- 正在查询的行为类型。这是`T`类型参数。
- 查询中的附加上下文类型。这是`C`类型参数。

例如，以下是如何声明侧向感知方块`IItemHandler`的功能性：

```java
public static final BlockCapability<IItemHandler, @Nullable Direction> ITEM_HANDLER_BLOCK =
    BlockCapability.create(
        // 提供一个名称以唯一标识功能性。
        new ResourceLocation("mymod", "item_handler"),
        // 提供查询的类型。在这里，我们希望查找`IItemHandler`实例。
        IItemHandler.class,
        // 提供上下文类型。我们将允许查询接收额外的`Direction side`参数。
        Direction.class);
```

对于方块来说，`@Nullable Direction`是如此常见，以至于有一个专门的助手函数：

```java
public static final BlockCapability<IItemHandler, @Nullable Direction> ITEM_HANDLER_BLOCK =
    BlockCapability.createSided(
        // 提供一个名称以唯一标识功能性。
        new ResourceLocation("mymod", "item_handler"),
        // 提供查询的类型。在这里，我们希望查找`IItemHandler`实例。
        IItemHandler.class);
```

如果不需要上下文，则应使用`Void`。对于无上下文的功能性也有专门的助手函数：

```java
public static final BlockCapability<IItemHandler, Void> ITEM_HANDLER_NO_CONTEXT =
    BlockCapability.createVoid(
        // 提供一个名称以唯一标识功能性。
        new ResourceLocation("mymod", "item_handler_no_context"),
        // 提供查询的类型。在这里，我们希望查找`IItemHandler`实例。
        IItemHandler.class);
```

对于实体和物品堆叠，`EntityCapability`和`ItemCapability`分别存在类似的方法。

## 查询功能性
一旦我们在一个静态字段中拥有了`BlockCapability`、`EntityCapability`或`ItemCapability`对象，我们就可以查询一个功能性。

对于实体和物品堆叠，我们可以尝试使用`getCapability`找到功能性的实现。如果结果是`null`，则没有可用的实现。

例如：

```java
var object = entity.getCapability(CAP, context);
if (object != null) {
    // 使用object
}
```
```java
var object = stack.getCapability(CAP, context);
if (object != null) {
    // 使用object
}
```

方块功能性的使用略有不同，因为没有方块实体的方块也可以拥有功能性。现在，查询是在一个`level`上进行的，有一个我们正在寻找的`pos`位置作为附加参数：

```java
var object = level.getCapability(CAP, pos, context);
if (object != null) {
    // 使用object
}
```

如果已知方块实体和/或方块状态，可以传递它们以节省查询时间：

```java
var object = level.getCapability(CAP, pos, blockState, blockEntity, context);
if (object != null) {
    // 使用object
}
```

为了给出一个更具体的示例，以下是如何从`Direction.NORTH`侧查询方块的`IItemHandler`功能性：

```java
IItemHandler handler = level.getCapability(Capabilities.ItemHandler.BLOCK, pos, Direction.NORTH);
if (handler != null) {
    // 使用handler进行某些物品相关操作。
}
```

当查询某个功能性时，系统会在后台执行以下步骤：
1. 如果它们没有被提供的话，获取方块实体和方块状态。
2. 获取注册的功能性提供者。（下文会有更多相关信息）
3. 遍历提供者并询问他们是否能提供该功能性。
4. 提供者中的一个将返回功能性实例，可能会分配一个新对象。

尽管实现相当高效，但对于频繁进行的查询，例如每个游戏刻，这些步骤可能会占用大量服务器时间。`BlockCapabilityCache` 系统为在特定位置频繁查询的能力提供了巨大的速度提升。

:::tip
通常，`BlockCapabilityCache` 会被创建一次，然后存储在执行频繁功能性查询的对象的字段中。何时何地存储缓存取决于您。
:::

要创建缓存，请使用要查询的功能性，级别，位置和查询上下文调用 `BlockCapabilityCache.create`。

```java
// 声明字段：
private BlockCapabilityCache<IItemHandler, @Nullable Direction> capCache;

// 稍后，例如在方块实体的 `onLoad` 中：
this.capCache = BlockCapabilityCache.create(
        Capabilities.ItemHandler.BLOCK, // 要缓存的功能性
        level, // 世界级别
        pos, // 目标位置
        Direction.NORTH // 上下文
);
```

然后通过 `getCapability()` 查询缓存：
```java
IItemHandler handler = this.capCache.getCapability();
if (handler != null) {
    // 对某些与物品相关的操作使用 handler。
}
```

**缓存会被垃圾收集器自动清除，无需注销。**

也可以接收到功能性对象变更的通知！这包括功能性变化（`oldHandler != newHandler`）、变得不可用（`null`）或再次变得可用（不再是 `null`）。

创建缓存时需要两个额外的参数：
- 一个有效性检查，用于确定缓存是否仍然有效。
在作为方块实体字段的最简单用法中，`() -> !this.isRemoved()` 就可以了。
- 一个失效监听器，当功能性改变时被调用。
这是您可以对功能性变更、移除或出现做出反应的地方。

```java
// 带有可选的失效监听器：
this.capCache = BlockCapabilityCache.create(
        Capabilities.ItemHandler.BLOCK, // 要缓存的功能性
        level, // 世界级别
        pos, // 目标位置
        Direction.NORTH, // 上下文
        () -> !this.isRemoved(), // 有效性检查（因为缓存可能会比它所属的对象更久存在）
        () -> onCapInvalidate() // 失效监听器
);
```

## 方块功能性失效
:::info
失效功能是专门针对方块功能性的。实体和物品堆叠的功能性不能被缓存，因此不需要失效处理。
:::

为了确保缓存可以正确更新它们存储的功能性，**模组开发者必须在功能性改变、出现或消失时调用 `level.invalidateCapabilities(pos)`**。
```java
// 每当一个功能性改变、出现或消失时：
level.invalidateCapabilities(pos);
```

NeoForge已经处理了常见情况，例如区块的加载/卸载和方块实体的创建/移除，但其他情况需要模组开发者明确处理。例如，模组开发者必须在以下情况中使功能性失效：
- 如果先前返回的功能性不再有效。
- 如果放置或状态变化的功能性提供方块（没有方块实体），通过覆写 `onPlace`。
- 如果移除的功能性提供方块（没有方块实体），通过覆写 `onRemove`。

对于一个简单的方块示例，参考 `ComposterBlock.java` 文件。

更多信息，请参考 [`IBlockCapabilityProvider`][block-cap-provider] 的 javadoc。

## 注册功能性
功能性*提供者*是最终提供功能性的东西。功能性提供者是一个函数，可以返回一个功能性实例，或者如果不能提供功能性，就返回 `null`。提供者特定于：
- 它们为之提供服务的给定功能性，以及
- 它们为之提供服务的方块实例、方块实体类型、实体类型或物品实例。

它们需要在 `RegisterCapabilitiesEvent` 中注册。

方块提供者使用 `registerBlock` 进行注册。例如：
```java
private static void registerCapabilities(RegisterCapabilitiesEvent event) {
    event.registerBlock(
        Capabilities.ItemHandler.BLOCK, // 注册的功能性
        (level, pos, state, be, side) -> <返回 IItemHandler>,
        // 注册的方块
        MY_ITEM_HANDLER_BLOCK,
        MY_OTHER_ITEM_HANDLER_BLOCK);
}
```

通常，注册将特定于一些方块实体类型，因此提供了 `registerBlockEntity` 辅助方法：
```java
    event.registerBlockEntity(
        Capabilities.ItemHandler.BLOCK, // 注册的功能性
        MY_BLOCK_ENTITY_TYPE, // 注册的方块实体类型
        (myBlockEntity, side) -> <为 myBlockEntity 和 side 返回 IItemHandler>);
```

如果之前由方块或方块实体提供者返回的功能性不再有效，**您必须通过调用 `level.invalidateCapabilities(pos)` 来使缓存失效**。有关更多信息，请参考上文的[失效部分][invalidation]。

实体的注册类似，使用 `registerEntity`：
```java
event.registerEntity(
    Capabilities.ItemHandler.ENTITY, // 要注册的功能性
    MY_ENTITY_TYPE, // 要注册的实体类型
    (myEntity, context) -> <返回 myEntity 的 IItemHandler>);
```

物品的注册也类似。注意，提供者接收堆叠：
```java
event.registerItem(
    Capabilities.ItemHandler.ITEM, // 要注册的功能性
    (itemStack, context) -> <返回 itemStack 的 IItemHandler>,
    // 要注册的物品
    MY_ITEM,
    MY_OTHER_ITEM);
```

## 为所有对象注册功能性

如果由于某种原因您需要为所有方块、实体或物品注册一个提供者，您将需要遍历相应的注册表并为每个对象注册提供者。

例如，NeoForge使用这个系统为所有的 `BucketItem`（不包括子类）注册一个流体处理器功能性：
```java
// 作为参考，您可以在 `CapabilityHooks` 类中找到这段代码。
for (Item item : BuiltInRegistries.ITEM) {
    if (item.getClass() == BucketItem.class) {
        event.registerItem(Capabilities.FluidHandler.ITEM, (stack, ctx) -> new FluidBucketWrapper(stack), item);
    }
}
```

按照注册的顺序请求提供者提供功能性。如果您想在NeoForge已经为您的某个对象注册的提供者之前运行，请使用更高优先级注册您的 `RegisterCapabilitiesEvent` 处理器。例如：
```java
modBus.addListener(RegisterCapabilitiesEvent.class, event -> {
    event.registerItem(
        Capabilities.FluidHandler.ITEM,
        (stack, ctx) -> new MyCustomFluidBucketWrapper(stack),
        // 要注册的方块
        MY_CUSTOM_BUCKET);
}, EventPriority.HIGH); // 使用 HIGH 优先级在 NeoForge 之前注册！
```
查看 [`CapabilityHooks`][capability-hooks] 以获取 NeoForge 本身注册的提供者列表。

[block-cap-provider]: https://github.com/neoforged/NeoForge/blob/1.20.x/src/main/java/net/neoforged/neoforge/capabilities/IBlockCapabilityProvider.java
[capability-hooks]: https://github.com/neoforged/NeoForge/blob/1.20.x/src/main/java/net/neoforged/neoforge/capabilities/CapabilityHooks.java
[invalidation]: #block-capability-invalidation
