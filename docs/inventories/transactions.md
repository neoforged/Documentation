# Transactions

Transactions are a NeoForged-added system for managing the communication between different inventories transferring their contents. Each transfer is managed through three basic concepts: the `Resource`s being transferred, the `ResourceHandler`s representing the inventories, and the `Transaction` facilitating the communication.

## Resources

`Resource`s represent the backing object that is transacted upon. Each `Resource` is meant to be immutable, containing what kind of object is used, not the number of objects being transferred. For example, the transaction 'five apples for an emerald', contains the `Resource`s 'apple' and 'emerald', not 'five apples' and 'one emerald'.

As such, every `Resource` has the following three properties:

* **Immutability**: Anything stored in the `Resource` object should be non-changing.
* **Count Agnostic**: The `Resource` does not contain any information about how much of an object there is.
* **Equality**: No matter how the `Resource` is constructed, if they represent the same object, they must be equal.

NeoForge provides resources for [items] (via `ItemResource`) and fluids (via `FluidResource`) by representing the object along with its unique [data components][datacomponent].

```java
// Create the resource from its backing object
ItemResource item = ItemResource.of(Items.EMERALD);

ItemStack stack = new ItemStack(Items.APPLE);
stack.set(DataComponents.CUSTOM_NAME, Component.literal("Apple?"));
ItemResource itemWithComponents = ItemResource.of(stack);

FluidResource fluid = FluidResource.of(Fluids.WATER);
```

We can also create our own `Resource` like so:

```java
// Let's assume we are trying to represent the following object:
public class ExampleObject {
    public static final ExampleObject EMPTY = new ExampleObject(-1, 0, Map.of());

    public static final Codec<ExampleObject> CODEC = RecordCodecBuilder.of(instance ->
        instance.group(
            ExtraCodecs.NON_NEGATIVE_INT.fieldOf("id").forGetter(ExampleObject::id),
            ExtraCodecs.NON_NEGATIVE_INT.optionalFieldOf("count", 1).forGetter(ExampleObject::count),
            Codec.unboundedMap(Codec.STRING, Codec.BOOL).optionalFieldOf("flags", Map::of).forGetter(ExampleObject::flags)
        ).apply(instance, ExampleObject::new)
    );

    private final int id;
    private final Map<String, Boolean> flags;
    private int count;

    public ExampleObject(int id, int count, Map<String, Boolean> flags) {
        // ...
    }

    public int id() {
        return this.id;
    }

    public int count() {
        return this.count;
    }

    public void setCount(int count) {
        this.count = count;
    }

    public Map<String, Boolean> flags() {
        return this.flags;
    }
}

// Create our resource.
public final class ExampleResource implements Resource {

    private final ExampleObject object;

    public ExampleResource(ExampleObject object) {
        // Enforce immutability and ignore count.
        this.object = new ExampleObject(
            object.id(), 1, ImmutableMap.copyOf(object.flags())
        );
    }

    public int id() {
        return this.object.id();
    }

    public Map<String, Boolean> flags() {
        return this.object.flags();
    }

    // Defines when the backing object is considered empty.
    // This is the only method that `Resource` defines.
    @Override
    public boolean isEmpty() {
        return this.object.id() == -1;
    }

    // Equality for classes is defined by implementing `hashCode`
    // and `equals`. Records already do this for you.
    @Override
    public int hashCode() {
        // Since our backing object is not unique by itself, we
        // extract the components that make it unique and construct
        // the hash.
        return Objects.hash(this.object.id(), this.object.flags());
    }

    @Override
    public boolean equals(Object obj) {
        // Check identity equality.
        if (this == obj) return true;
        // Check if same class.
        if (obj == null || this.getClass() != obj.getClass()) return false;
        // Check the individual components of the resource.
        ExampleResource other = (ExampleResource) obj;
        return this.object.id() == other.object.id()
            && this.object.flags().equals(other.object.flags());
    }

    // Just an ease of convenience to more easily understand what
    // the resource is representing.
    @Override
    public String toString() {
        return Integer.toString(this.object.id()) + "[" 
            + this.object.flags().size() + "]";
    }
}
```

:::note
While `Resource`s can be used for primitives, they are not strictly necessary (e.g., energy does not have a `Resource` as it is backed by a `long`). However, it does require reimplementing some of the resource behavior yourself, as the [handler system described below][handler] requires the use of a `Resource`.
:::

## Resource Handlers

`ResourceHandler<T>`s represent the backing inventories within a transaction, where `T` is the type of the `Resource` backing the object. Each handler maps to its associated contents using an index (e.g., index `0` maps to the first slot, index `1` maps to the second, etc). For every index, you can check whether a `Resource` can be contained at the location (`isValid`) or what `Resource` is already stored there (`getResource`). You can also check how many `Resource`s can be stored at the location (`getCapacityAsLong` / `getCapacityAsInt`) along with how many of a `Resource` is stored there (`getAmountAsLong` / `getAmountAsInt`). The number of indices accessible to the handler represents its `size`.

To modify the contents of the backing inventory, `ResourceHandler` provides two methods: `insert` to put a `Resource` in, and `extract` to take a `Resource` out. `insert` and `extract` take in three arguments: the `Resource` being operated upon, the `int` amount to put in / take out, and a `TransactionContext` representing what [transaction] that is performing the operation, returning the amount put in / taken out. Both of these methods will find the first indices available to put in / take out the contents to / from. If the handler should only transact on one specific index, then both `insert` and `extract` provide an overload that takes in the `int` index to put in / take out `Resource`s to / from.

```java
// For some ResourceHandler<ItemResource> handler

// Get the resource stored in the handler.
ItemResource item = handler.getResource(0);
int count = handler.getAmountAsInt(0);

// Get information about the handler itself.
int handlerSize = handler.size();
int indexCapacity = handler.getCapacityAsInt(0);
boolean canAcceptApples = handler.isValid(0, ItemResource.of(Items.APPLE));
```

There are many different types of `ResourceHandler`s depending on what the backing inventory is. Some handlers wrap around existing vanilla inventories (e.g., `VanillaContainerWrapper` for [`Container`s][container], `PlayerInventoryWrapper` for [player `Inventory`s][playerinv], `LivingEntityEquipmentWrapper` for a [living entity's][livingentity] equipment slots).

```java
// Wrapping around an existing container.
Container container = new SimpleContainer(5);
ResourceHandler<ItemResource> containerWrapper = VanillaContainerWrapper.of(container);

// Wrapping around a `Player` player inventory.
ResourceHandler<ItemResource> playerInv = PlayerInventoryWrapper.of(player);

// Wrapping around a specific equipment slot for some LivingEntity entity.
ResourceHandler<ItemResource> head = LivingEntityEquipmentWrapper.of(entity, EquipmentSlot.HEAD);
```

Other handlers are themselves inventories, providing a convenience for those wanting to make use of the system without much implementing (e.g., `ItemStacksResourceHandler` for a list of [`ItemStack`s][itemstack], `FluidStacksResourceHandler` for a list of `FluidStack`s).

```java
// Creating an `ItemStack` storage.
ItemStacksResourceHandler itemStorage = new ItemStacksResourceHandler(5);

// Creating a `FluidStack` storage.
FluidStacksResourceHandler fluidStorage = new FluidStacksResourceHandler(
    // The size of the handler
    5,
    // The maximum capacity of every index
    1000
);
```

:::note
If you plan to use one of the `StacksResourceHandler`s as an inventory, it is highly recommended to override `onContentsChanged` to handle any disk writing or network syncing.

```java
// Example for block entities
public class ExampleBlockEntity extends BlockEntity {

    private final ItemStacksResourceHandler storage = new ItemStacksResourceHandler(5) {
        @Override
        protected void onContentsChanged(int index, ItemStack previousContents) {
            // Schedule the block entity for saving
            BlockEntity.this.setChanged();
        }
    };

    // ...
}
```

:::

We can also create our own `ResourceHandler` like so:

```java
public class ExampleResourceHandler implements ResourceHandler<ExampleResource> {

    private ExampleObject object;

    public ExampleResourceHandler(ExampleObject object) {
        this.object = object;
    }
    
    @Override
    public int size() {
        // The size of the handler.
        return 1;
    }

    @Override
    public ExampleResource getResource(int index) {
        // Gets the resource at the desired index.

        // Check the bounds.
        Objects.checkIndex(index, this.size());
        // Then get the resource.
        return new ExampleResource(this.object);
    }

    @Override
    public long getAmountAsLong(int index) {
        // Gets the amount from the content.
        Objects.checkIndex(index, this.size());
        return this.object.count();
    }

    @Override
    public long getCapacityAsLong(int index, ExampleResource resource) {
        // The capacity at a given index for the stored resource.
        Objects.checkIndex(index, this.size());
        return Integer.MAX_VALUE;
    }

    @Override
    public boolean isValid(int index, ExampleResource resource) {
        // Whether the resource can be set at the index, regardless of its
        // current contents.
        Objects.checkIndex(index, this.size());
        // Make sure the resource isn't empty.
        TransferPreconditions.checkNonEmpty(resource);
        return true;
    }

    @Override
    public int insert(int index, ExampleResource resource, int amount, TransactionContext transaction) {
        // Inserts the resource into the given index, returning the amount put in.

        // Validate arguments.
        Objects.checkIndex(index, size());
        TransferPreconditions.checkNonEmptyNonNegative(resource, amount);

        // Check whether the resource can be inserted from this location.
        ExampleObject current = this.object;
        if (current.count() == 0 || (current.id() == resource.id() && current.flags().equals(resource.flags()) && this.isValid(index, resource))) {
            // Compute the amount to insert.
            int insertedAmount = Math.min(amount, this.getCapacityAsInt(index, resource) - current.count());

            if (insertedAmount > 0) {
                // Update the content.
                if (current.count() == 0) {
                    this.object = new ExampleObject(
                        resource.id(), insertedAmount, new HashMap<>(resource.flags())
                    );
                } else {
                    this.object.setCount(current.count() + insertedAmount);
                }

                // Return the amount inserted.
                return insertedAmount;
            }
        }

        // If not matching, insert nothing.
        return 0;
    }

    @Override
    public int extract(int index, ExampleResource resource, int amount, TransactionContext transaction) {
        // Extracts the contents from the given index, returning the amount taken out.

        // Validate arguments.
        Objects.checkIndex(index, size());
        TransferPreconditions.checkNonEmptyNonNegative(resource, amount);

        // Check whether the resource can be extracted from this location.
        ExampleObject current = this.object;
        if (current.id() == resource.id() && current.flags().equals(resource.flags())) {
            // Compute the amount to extract.
            int extracted = Math.min(current.count(), amount);

            if (extracted > 0) {
                // Update the content.
                this.object.setCount(current.count() - extracted);

                // Return the amount extracted.
                return extracted;
            }
        }

        // If not matching, extract nothing.
        return 0;
    }
}
```

Or for a `StacksResourceHandler`:

```java
public class ExampleStacksResourceHandler extends StacksResourceHandler<ExampleObject, ExampleResource> {

    public ExampleStacksResourceHandler(int size) {
        super(size, ExampleObject.EMPTY, ExampleObject.CODEC);
    }

    public ExampleStacksResourceHandler(NonNullList<ExampleObject> objects) {
        super(objects, ExampleObject.EMPTY, ExampleObject.CODEC);
    }

    @Override
    public ExampleResource getResourceFrom(ExampleObject object) {
        // Constructs the resource from the content.
        return new ExampleResource(object);
    }

    @Override
    public int getAmountFrom(ExampleObject object) {
        // Gets the amount from the content.
        return object.count();
    }

    @Override
    protected ExampleObject getStackFrom(ExampleResource resource, int amount) {
        // Create the content from its resource.
        return new ExampleObject(resource.id(), amount, new HashMap<>(resource.flags()));
    }

    @Override
    protected int getCapacity(int index, ExampleResource resource) {
        // The capacity at a given index for the stored resource.
        return Integer.MAX_VALUE;
    }

    @Override
    protected ExampleObject copyOf(ExampleObject object) {
        // Constructs a copy of the content.
        return new ExampleObject(object.id(), object.count(), new HashMap<>(object.flags()));
    }

    @Override
    public boolean matches(ExampleObject object, ExampleResource resource) {
        // Check if an object matches the stored resource.
        return object.id() == resource.id() && object.flags().equals(resource.flags());
    }
}
```

:::tip
NeoForge also provides a `ResourceStacksResourceHandler`, using `ResourceStack`s as the stored contents, for `Resource` implementations that are themselves the actual objects within an inventory.
:::

### Energy Handler

`EnergyHandler` is a trimmed down version of `ResourceHandler`, only containing one index storing a `long`. As such, it only checks how many units can be stored (`getCapacityAsLong` / `getCapacityAsInt`) along with how many units already stored (`getAmountAsLong` / `getAmountAsInt`). Additionally, `insert` and `extract` no longer take in an index since there's only one, and also no longer require a `Resource`, as the backing object is a primitive.

Like `ResourceHandler`, there are different types of `EnergyHandler`s depending on your use case. The most common one is `SimpleEnergyHandler`, which provides a basic implementation along with a limit for insert / extract.

```java
// Create an energy handler.
EnergyHandler energy = new SimpleEnergyHandler(1000);
```

### Item Access

`ItemAccess` is also a trimmed down version of `ResourceHandler`, providing access to a single item in a specific storage location. This is typically used within [item capabilities][capabilities] to modify the item the capability is attached to. As such, it only provides the resource (`getResource`) and amount of the item currently present (`getAmount`). Additionally, `insert` and `extract` no longer take in an index since there's only one. However, as items can also store data, the `ItemAccess` provides a way to access the stored data in through [capabilities] via `getCapability`, assuming it is an `ItemCapability` with an `ItemAccess` context.

Like `ResourceHandler`, there are different types of `ItemAccess`es depending on usecase. The two most common are `PlayerItemAccess`, which wraps around a specific slot in the player inventory; and `HandlerItemAccess`, which wraps around a specific index in a `ResourceHandler`.

```java
// Create an item access for some location.
// Assume we have some `Player` player.
ItemAccess access = ItemAccess.forPlayerInteraction(player, InteractionHand.MAIN_HAND);

// Get the data about the referenced item
ItemResource item = access.getResource();
int count = access.getAmount();

// Gets the item capability on the stack.
// For example, if the item is a fluid container:
ResourceHandler<FluidResource> fluidContainer = access.getCapability(Capabilities.Fluid.ITEM);
```

## Transferring Between Handlers

`Transaction`s facilitate the transfer of `Resource`s between `ResourceHandler`s. Here, resources are `insert`ed and `extract`ed from their `ResourceHandler`s. A transfer is considered valid or complete after insertion and extraction once `Transaction#commit` has been called.

`Transaction` is `AutoCloseable`, meaning the standard way to initiate a transaction is through a try-with-resources block using `Transaction#openRoot`:

```java
// Let's assume we have two `ResourceHandler<ItemResource>`s apples, emeralds.

// Open the transaction.
try (Transaction tx = Transaction.openRoot()) {
    // Insert and extract from resource handlers.
    ItemResource appleResource = ItemResource.of(Items.APPLE);
    ItemResource emeraldResource = ItemResource.of(Items.EMERALD);

    int numOfApples = apples.extract(appleResource, 5, tx);
    int numOfEmeralds = emeralds.extract(emeraldResource, 1, tx);

    // Perform any validation necessary.
    if (numOfApples == 5 && numOfEmeralds == 1) {
        numOfEmeralds = apples.insert(emeraldResource, numOfEmeralds, tx);
        numOfApples = emeralds.insert(appleResource, numOfApples, tx);

        if (numOfApples == 5 && numOfEmeralds == 1) {
            // Mark the transaction as complete.
            tx.commit();
        }
    }
}
```

:::tip

`ResourceHandlerUtil` provides a number of useful methods for checking the current state of a `ResourceHandler` or transacting between handlers in general. For example, the emerald to apples trade above could've been simplified like so:

```java
// Let's assume we have two `ResourceHandler<ItemResource>`s apples, emeralds.

// Open the transaction.
try (Transaction tx = Transaction.openRoot()) {
    // Insert and extract from resource handlers.
    ItemResource appleResource = ItemResource.of(Items.APPLE);
    ItemResource emeraldResource = ItemResource.of(Items.EMERALD);

    int applesMoved = ResourceHandlerUtil.moveStacking(
        // Moving from apples -> emeralds.
        apples, emeralds,
        // Checks what resource(s) to move.
        appleResource::equals,
        // The number of the resource to move.
        5,
        // The transaction context.
        tx
    );
    int emeraldsMoved = ResourceHandlerUtil.moveStacking(
        emeralds, apples, emeraldResource::equals, 1, tx
    );;

    // Perform any validation necessary.
    if (applesMoved == 5 && emeraldsMoved == 1) {
        // Mark the transaction as complete.
        tx.commit();
    }
}
```

:::

`Transaction`s can also have `Transaction`s within themselves via `Transation#open` if multiple are occurring at the same time.

```java
// Open the transaction.
try (Transaction tx = Transaction.openRoot()) {
    // Transaction A
    try (Transaction atx = Transaction.open(tx)) {
        // Insert and extract from resource handlers.

        // ...

        // Mark as complete.
        atx.commit();
    }

    // Transaction B
    try (Transaction btx = Transaction.open(tx)) {
        // Insert and extract from resource handlers.

        // ...

        // Maybe this one was invalid, so don't mark as complete.
    }

    // Mark the root transaction as successful such that the successful
    // inner transactions are completed.
    tx.commit();
}
```

### Taking Snapshots

On its own, `Transaction#commit` does nothing. As such, the insertions and extractions performed are permanent regardless of whether the transfer was successful or not. What we want is that for any `Transaction`, the transfer only happens if it is `commit`ted. Otherwise, the transfer should be reverted.

This is where the `SnapshotJournal<T>` comes in. As the name implies, it can take a `T` 'snapshot' of the current handler state right before modifying its contents. Then, it can either release the snapshot if the transaction was successful, or it can revert the handler back to its previous state. Each `SnapshotJournal` must implement at least two methods: `createSnapshot` to actually create the saved state, and `revertToSnapshot` to revert the handler back to the specified state. If any backing objects need to be notified or updated due to the changes in the handler, then the journal can also override `onRootCommit` to handle these changes.

All NeoForge `ResourceHandler` implementations use the `SnapshotJournal` in some fashion, either directly on the handler itself or as a field within. It's only when making new `ResourceHandler`s that the `SnapshotJournal` needs to be implemented.

```java
// We can use the stored object as the snapshot value since we only ever
// need to keep track of one index.
public class ExampleResourceHandler extends SnapshotJournal<ExampleObject> implements ResourceHandler<ExampleResource> {

    private ExampleObject object;

    public ExampleResourceHandler(ExampleObject object) {
        // ...
    }
    
    // ...

    @Override
    protected ExampleObject createSnapshot() {
        // Create a snapshot of the object.
        // This should be immutable.
        ExampleObject original = this.object;
        this.object = new ExampleObject(
            original.id(), original.count(), ImmutableMap.copyOf(original.flags())
        );
        return original;
    }

    @Override
    protected void revertToSnapshot(ExampleObject snapshot) {
        // Reverts the state of the handler to the snapshot.
        this.object = snapshot;
    }

    // We need to update the insert and extract methods to make snapshots before
    // every modification.

    @Override
    public int insert(int index, ExampleResource resource, int amount, TransactionContext transaction) {
        // Inserts the resource into the given index, returning the amount put in.

        // Validate arguments.
        Objects.checkIndex(index, size());
        TransferPreconditions.checkNonEmptyNonNegative(resource, amount);

        // Check whether the resource can be inserted from this location.
        ExampleObject current = this.object;
        if (current.count() == 0 || (current.id() == resource.id() && current.flags().equals(resource.flags()) && this.isValid(index, resource))) {
            // Compute the amount to insert.
            int insertedAmount = Math.min(amount, this.getCapacityAsInt(index, resource) - current.count());

            if (insertedAmount > 0) {
                // Snapshot the handler before modifying the contents.
                this.updateSnapshots(transaction);

                // Update the content.
                if (current.count() == 0) {
                    this.object = new ExampleObject(
                        resource.id(), insertedAmount, new HashMap<>(resource.flags())
                    );
                } else {
                    this.object.setCount(current.count() + insertedAmount);
                }

                // Return the amount inserted.
                return insertedAmount;
            }
        }

        // If not matching, insert nothing.
        return 0;
    }

    @Override
    public int extract(int index, ExampleResource resource, int amount, TransactionContext transaction) {
        // Extracts the contents from the given index, returning the amount taken out.

        // Validate arguments.
        Objects.checkIndex(index, size());
        TransferPreconditions.checkNonEmptyNonNegative(resource, amount);

        // Check whether the resource can be extracted from this location.
        ExampleObject current = this.object;
        if (current.id() == resource.id() && current.flags().equals(resource.flags())) {
            // Compute the amount to extract.
            int extracted = Math.min(current.count(), amount);

            if (extracted > 0) {
                // Snapshot the handler before modifying the contents.
                this.updateSnapshots(transaction);

                // Update the content.
                this.object.setCount(current.count() - extracted);

                // Return the amount extracted.
                return extracted;
            }
        }

        // If not matching, extract nothing.
        return 0;
    }
}
```

With that, our transactions will now properly handle the state of the inventories as well:

```java
// Let's assume we have two `ResourceHandler<ExampleResource>`s exampleA, exampleB.

// Open the transaction.
try (Transaction tx = Transaction.openRoot()) {
    // Insert and extract from resource handlers
    ExampleResource resource = new ExampleResource(new ExampleObject(0, 1, Map.of()));

    // Try to extract and insert the desired resource
    if (exampleA.extract(resource, 1, tx) == 1 && exampleB.insert(resource, 1, tx) == 1) {
        // If successful, commit the transaction to make the change permanent.
        tx.commit();
    }

    // Otherwise, the transaction is aborted and the two handlers will revert their
    // contents to before the transaction occurred.
}
```

[capabilities]: capabilities.md
[container]: container.md
[datacomponent]: ../items/datacomponents.md
[handler]: #resource-handlers
[items]: ../items/index.md
[itemstack]: ../items/index.md#itemstacks
[livingentity]: ../entities/livingentity.md
[playerinv]: container.md#containers-on-players-player-inventory
[transaction]: #transferring-between-handlers
