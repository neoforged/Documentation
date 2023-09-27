The Capability System
=====================

Capabilities allow exposing features in a dynamic and flexible way without having to resort to directly implementing many interfaces.

In general terms, each capability provides a feature in the form of an interface.

NeoForge adds capability support to Blocks, BlockEntities, Entities and ItemStacks, which can be exposed by attaching them through the RegisterCapabilitiesEvent. This will be explained in more detail in the following sections.

NeoForge-provided Capabilities
---------------------------

NeoForge provides three capabilities: `IItemHandler`, `IFluidHandler` and `IEnergyStorage`

`IItemHandler` exposes an interface for handling inventory slots. It replaces the old `Container` and `WorldlyContainer` with an automation-friendly system.

`IFluidHandler` exposes an interface for handling fluid inventories.

`IEnergyStorage` exposes an interface for handling energy containers. It is based on the RedstoneFlux API by TeamCoFH.

Using an Existing Capability
----------------------------

The method `#getCapability` in `IForgeitemStack` and in `Entity` can be used to query the capabilities present in the associated provider objects. To query the capabilities for a `Block` or `BlockEntity` you use `IForgeLevel#getCapability` with the context you have.

In order to obtain a capability, you will need to refer it by its unique instance. In the case of the `IItemHandler`, this capability is primarily stored in the fields of `ForgeCapabilities.ItemHandler`.

The `#getCapability` method has a second parameter, of a generic type controlled by the capability, which may be used to request the specific instance. The nullability of the context depends on the capability. Capabilities with Void as context type only accept null. Null context usually request a view of the capability for information purposes. If the capability is not available for a particular provider, it will return `null` instead.

Exposing a Capability
---------------------

During game launch, after Registries have been initialized, the RegisterCapabilitiesEvent is being fired, you can call `registerBlock`, `registerBlockEntity`, `registerEntity` and `registerItem` to register your capabilities on the specified game objects. `registerBlockEntity` and `registerEntity` both use their type for registering to all instances.

These methods require you to provide the `ICapabilityProvider` or `IBlockCapabilityProvider` interfaces. You can use the context to expose different slots based on which direction is being queried, you can test this with the `side` parameter as an example for the context usage.

Block capabilities must be invalidated at the end of the provider's lifecycle via `IForgeLevel#invalidateCapabilities`. This is done automatically on block breaking and placing as well as chunk loading and unloading. You only have to notify the Level if you provide a new one or your old one is no longer valid aside from this.

```java
// Some event listener
public static void registerVanillaProviders(RegisterCapabilitiesEvent event) {
  event.registerBlockEntity(ForgeCapabilities.ItemHandler.BLOCK, BlockEntityTypes.MY_BLOCKENTITY, (be, side) -> 
    return be.getItemHandler(side)
  );  
}
// Somewhere in your BlockEntity subclass
IItemHandler itemandler;
public ItemHandler getItemHandler(Direction side) {
  return itemHandler;
}
```

It is strongly suggested that direct checks in code are used to test for capabilities instead of attempting to rely on maps or other data structures, since capability tests can be done by many objects every tick, and they need to be as fast as possible in order to avoid slowing down the game.

Creating your own Capability
----------------------------

Your capability has to be registered before or during `RegisterCapabilitiesEvent`. For that you have to call `#create` or `#createVoid` methods on `BlockCapability`, `EntityCapability`, `ItemCapability` or other custom CapabilityManager.

The first parameter is it's name. That means that the same type interface can be used in multiple capabilities. The second parameter is the type class, the API that will be returned by `#getCapability`. The third parameter is the context that has to be used to query the capability.
```java
BlockCapability.create(forge("item_handler"), IItemHandler.class, Direction.class);
```

[handled]: ../concepts/events.md#creating-an-event-handler
[network]: ../networking/index.md
