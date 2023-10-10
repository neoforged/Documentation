Capability系统
==============

Capability允许以动态和灵活的方式公开Capability，而不必直接实现许多接口。

一般来说，每个Capability都以接口的形式提供了一个Capability。

Forge为BlockEntity、Entity、ItemStack、Level和LevelChunk添加了Capability支持，这些Capability可以通过事件附加它们，也可以通过重写你自己的对象实现中的Capability方法来公开。这将在接下来的章节中进行更详细的解释。

Forge提供的Capability
---------------------

Forge提供三种Capability：`IItemHandler`、`IFluidHandler`和`IEnergyStorage`。

`IItemHandler`公开了一个用于处理物品栏Slot的接口。它可以应用于BlockEntity（箱子、机器等）、Entity（额外的玩家Slot、生物/生物物品栏/袋子）或ItemStack（便携式背包等）。它用一个自动化友好的系统取代了旧的`Container`和`WorldlyContainer`。

`IFluidHandler`公开了一个用于处理流体物品栏的接口。它也可以应用于BlockEntitiy、Entity或ItemStack。

`IEnergyStorage`公开了一个用于处理能源容器的接口。它可以应用于BlockEntity、Entity或ItemStack。它基于TeamCoFH的RedstoneFlux API。

使用现存的Capability
-------------------

如前所述，BlockEntity、Entity和ItemStack通过`ICapabilityProvider`接口实现了Capability提供者Capability。此接口添加了方法`#getCapability`，该方法可用于查询相关提供者对象中存在的Capability。

为了获得一个Capability，你需要通过它的唯一实例来引用它。在`IItemHandler`的情况下，此Capability主要存储在`ForgeCapabilities#ITEM_HANDLER`中，但也可以使用`CapabilityManager#get`获取其他实例引用。

```java
public static final Capability<IItemHandler> ITEM_HANDLER = CapabilityManager.get(new CapabilityToken<>(){});
```

当被调用时，`CapabilityManager#get`为你的相关类型提供一个非null的Capability。匿名的`CapabilityToken`允许Forge保持软依赖系统，同时仍然拥有获得正确Capability所需的泛型信息。

!!! 重要
    即使你在任何时候都可以使用非null的Capability，但这并不意味着该Capability本身是可用的或已注册的。这可以通过`Capability#isRegistered`进行检查。

`#getCapability`方法有另一个参数，类型为`Direction`，可用于请求那一面的特定实例。如果传递`null`，则可以假设请求来自方块内，或者来自某个侧面没有意义的地方，例如不同的维度。在这种情况下，将请求一个不关侧面的一个通用的Capability实例。`#getCapability`的返回类型将对应于传递给方法的Capability中声明的类型的`LazyOptional`。对于物品处理器Capability，其为`LazyOptional<IItemHandler>`。如果该Capability不适用于特定的提供者，它将返回一个空的`LazyOptional`。

公开一个Capability
------------------

为了公开一个Capability，你首先需要一个底层Capability类型的实例。请注意，你应该为每个保有该Capability的对象分配一个单独的实例，因为该Capability很可能与所包含的对象绑定。

在`IItemHandler`的情况下，默认实现使用`ItemStackHandler`类来指定多个Slot，该类在构造函数中有一个可选参数。然而，应避免依赖这些默认实现的存在，因为Capability系统的目的是防止在不存在Capability的情况下出现加载错误，因此如果Capability已注册，则应在检查测试之后对实例化进行保护（请参阅上一节中关于`CapabilityManager#get`的备注）。

一旦你拥有了自己的Capability接口实例，你将希望通知Capability系统的用户你公开了此Capability，并提供接口引用的`LazyOptional`。这是通过重写`#getCapability`方法来完成的，并将Capability实例与你要公开的Capability进行比较。如果你的机器根据被查询的一侧有不同的Slot，你可以使用`side`参数进行测试。对于实体和物品栈，此参数可以忽略，但仍然可以将侧面作为上下文，例如玩家上的不同护甲Slot（`Direction#UP`暴露玩家的头盔Slot），或物品栏中的周围方块（`Direction#WEST`暴露熔炉的输入Slot）。不要忘记回到`super`，否则现有的附加Capability将停止工作。

在提供者生命周期结束时，必须通过`LazyOptional#invalidate`使Capability失效。对于拥有的BlockEntitiy和Entity，`LazyOptional`可以在`#invalidateCaps`内失效。对于非拥有者提供者，提供失效过程的Runnable应传递到`AttachCapabilitiesEvent#addListener`中。

```java
// 在你BlockEntity子类中的某处
LazyOptional<IItemHandler> inventoryHandlerLazyOptional;

// 被提供的对象（例如：() -> inventoryHandler）
// 确保惰性，因为初始化只应在需要时发生
inventoryHandlerLazyOptional = LazyOptional.of(inventoryHandlerSupplier);

@Override
public <T> LazyOptional<T> getCapability(Capability<T> cap, Direction side) {
  if (cap == ForgeCapabilities.ITEM_HANDLER) {
    return inventoryHandlerLazyOptional.cast();
  }
  return super.getCapability(cap, side);
}

@Override
public void invalidateCaps() {
  super.invalidateCaps();
  inventoryHandlerLazyOptional.invalidate();
}
```

:::tip
    如果给定对象上只公开了一个Capability，则可以使用`Capability#orEmpty`作为if/else语句的替代语句。

    ```java
    @Override
    public <T> LazyOptional<T> getCapability(Capability<T> cap, Direction side) {
      return ForgeCapabilities.ITEM_HANDLER.orEmpty(cap, inventoryHandlerLazyOptional);
    }
    ```
:::

`Item`是一种特殊情况，因为它们的Capability提供者存储在`ItemStack`上。相反的是，应该通过`Item#initCapabilities`附加提供者。其应该在物品栈的生命周期中保持你的Capability。

强烈建议在代码中使用直接检查来测试Capability，而不是试图依赖Map或其他数据结构，因为每个游戏刻都可以由许多对象进行Capability测试，并且它们需要尽可能快，以避免减慢游戏速度。

Capability的附加
----------------

如前所述，可以使用`AttachCapabilitiesEvent`将Capability附加到现有提供者、`Level`和`LevelChunk`。同一事件用于所有可以提供Capability的对象。`AttachCapabilitiesEvent`有5个有效的泛型类型，提供以下事件：

* `AttachCapabilitiesEvent<Entity>`: 仅为实体触发。
* `AttachCapabilitiesEvent<BlockEntity>`: 仅为方块实体触发。
* `AttachCapabilitiesEvent<ItemStack>`: 仅为物品栈触发。
* `AttachCapabilitiesEvent<Level>`: 仅为存档触发。
* `AttachCapabilitiesEvent<LevelChunk>`: 仅为存档区块触发。

泛型类型不能比上述类型更具体。例如：如果要将Capability附加到`Player`，则必须订阅`AttachCapabilitiesEvent<Entity>`，然后在附加Capability之前确定所提供的对象是`Player`。

在所有情况下，该事件都有一个方法`#addCapability`，可用于将Capability附加到目标对象。不是将Capability本身添加到列表中，而是添加Capability提供者，这些提供者有机会仅从某些面返回Capability。虽然提供者只需要实现`ICapabilityProvider`，但如果该Capability需要持久存储数据，则可以实现`ICapabilitySerializable<T extends Tag>`，该Capability除了返回Capability外，还将提供标签保存/加载Capability。

有关如何实现`ICapabilityProvider`的信息，请参阅[公开一个Capability][expose]部分。

创建你自己的Capability
---------------------

Capability可通过以下两种方式之一被注册：`RegisterCapabilitiesEvent`或`@AutoRegisterCapability`。

### RegisterCapabilitiesEvent

通过向`#register`方法提供Capability类型的类，可以使用`RegisterCapabilitiesEvent`注册Capability。该事件在模组事件总线上[被处理][handled]。

```java
@SubscribeEvent
public void registerCaps(RegisterCapabilitiesEvent event) {
  event.register(IExampleCapability.class);
}
```

### @AutoRegisterCapability

Capability也可通过使用`@AutoRegisterCapability`注释以被注册。

```java
@AutoRegisterCapability
public interface IExampleCapability {
  // ...
}
```

LevelChunk和BlockEntity的Capability的持久化
------------------------------------------

与Level、Entity和ItemStack不同，LevelChunk和BlockEntity只有在标记为脏时才会写入磁盘。因此，LevelChunk或BlockEntity具有持久状态的Capability实现应确保无论何时其状态发生变化，其所有者都被标记为脏。

`ItemStackHandler`通常用于BlockEntity中的物品栏，它有一个可重写的方法`void onContentsChanged(int slot)`，用于将BlockEntity标记为脏。

```java
public class MyBlockEntity extends BlockEntity {

  private final IItemHandler inventory = new ItemStackHandler(...) {
    @Override
    protected void onContentsChanged(int slot) {
      super.onContentsChanged(slot);
      setChanged();
    }
  }

  // ...
}
```

向客户端同步数据
---------------

默认情况下，Capability数据不会发送到客户端。为了改变这一点，模组必须使用数据包管理自己的同步代码。

在三种不同的情况下，你可能希望发送同步数据包，所有这些情况都是可选的：

1. 当实体在存档中生成或放置方块时，你可能希望与客户端共享初始化指定的值。
2. 当存储的数据发生更改时，你可能需要通知部分或全部正在监视的客户端。
3. 当新客户端开始查看实体或方块时，你可能希望将现有数据通知它。

有关实现网络数据包的更多信息，请参阅[网络][network]页面。

在玩家死亡时的持久化
-------------------

默认情况下，Capability数据不会在死亡时持续存在。为了改变这一点，在重生过程中克隆玩家实体时，必须手动复制数据。

这可以通过`PlayerEvent$Clone`完成，方法是从原始实体读取数据并将其分配给新实体。在这种情况下，`#isWasDeath`方法可以用于区分死后重生和从末地返回。这一点很重要，因为从末地返回时数据已经存在，因此在这种情况下必须注意不要重复值。

[expose]: #exposing-a-capability
[handled]: ../concepts/events.md#creating-an-event-handler
[network]: ../networking/index.md
