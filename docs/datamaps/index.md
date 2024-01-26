# Data Maps

A registry data map contains data-driven, reloadable objects that can be attached to a registry object.  
This system allows more easily data-driving game behaviour, as they provide functionality such as syncing or conflict resolution, leading to a better and more configurable user experience.  

You can think of tags as entry->boolean maps, while data maps are more flexible entry->object maps.

A data map can be attached to both static, built-in, registries and dynamic data-driven datapack registries.

## Registration
A data map type should be statically created and then registered to the `RegisterDataMapTypesEvent` (which is fired on the mod event bus). The `DataMapType` can be created using a `DataMapType$Builder`, through `DataMapType#builder`.  

A simple `DataMapType` has two generic arguments: `T` (the values that are being attached) and `R` (the type of the registry the data map is for). A data map of `SomeObject`s that are attached to `Item`s can, as such, be represented as `DataMapType<SomeObject, Item>`.  

Data maps are serialized and deserialized using [Codecs](../datastorage/codecs.md).

Let's take the following record representing the data map value as an example:
```java
public record DropHealing(
        float amount, float chance
) {
    public static final Codec<DropHealing> CODEC = RecordCodecBuilder.create(in -> in.group(
            Codec.FLOAT.fieldOf("amount").forGetter(DropHealing::amount),
            Codec.floatRange(0, 1).fieldOf("chance").forGetter(DropHealing::chance)
    ).apply(in, DropHealing::new));
}
```

:::warning
The value should be an *immutable* object, as otherwise weird behaviour can be caused if the object is attached to all values within a tag (since no copy is created).
:::

For the purposes of this example, we will use this data map to heal players when they drop an item.  
The `DataMapType` can be created as such:
```java
public static final DataMapType<DropHealing, Item> DROP_HEALING = DataMapType.builder(
        new ResourceLocation("mymod:drop_healing"), Registries.ITEM, DropHealing.CODEC
).build();
```
and then registered to the `RegisterDataMapTypesEvent` using `RegisterDataMapTypesEvent#register`.

## Syncing
A synced data map will have its values synced to clients. A data map can be marked as synced using `DataMapType$Builder#synced(Codec<T> networkCodec, boolean mandatory)`.   
The values of the data map will then be synced using the `networkCodec`.  
If the `mandatory` flag is set to `true`, clients that do not support the data map (including Vanilla clients) will not be able to connect to the server, nor vice-versa. A non-mandatory data map is, on the other side, optional, so it will not prevent any clients from joining.

## JSON Structure and location
Data maps are loaded from a JSON file located at `:mapNamespace/data_maps/:registryNamespace/:registryPath/:mapPath.json`.  
For more information, please [check out the dedicated page](./structure.md).

## Usage
As data maps can be used on any registry, they can be queried through `Holder`s, and not through the actual registry objects.  
You can query a data map value using `Holder#getData(DataMapType)`. If that object doesn't have a value attached, the method will return `null`.

:::note
Only reference holders will return a value in that method. `Named` holders will **not**.  Generally, you will only encounter reference holders (which are returned by methods such as `Registry#wrapAsHolder`, `Registry#getHolder` or the different `builtInRegistryHolder` methods).
:::

To continue the example above, we can implement our intended behaviour as follows:
```java
public static void onItemDrop(final ItemTossEvent event) {
    final ItemStack stack = event.getEntity().getItem();
    // ItemStack has a getItemHolder method that will return a Holder<Item> which points to the item the stack is of
    //highlight-next-line
    final DropHealing value = stack.getItemHolder().getData(DROP_HEALING);
    // Since getData returns null if the item will not have a drop healing value attached, we guard against it being null
    if (value != null) {
        // And here we simply use the values
        if (event.getPlayer().level().getRandom().nextFloat() > value.chance()) {
            event.getPlayer().heal(value.amount());
        }
    }
}
```

## Advanced data maps
Advanced data maps are data maps which have added functionality. Namely, the ability of merging values and selectively removing them, through a remover. Implementing some form of merging and removers is highly recommended for data maps whose values are collection-likes (like `Map`s or `List`s).

`AdvancedDataMapType` have one more generic besides `T` and `R`: `VR extends DataMapValueRemover<T, R>`. This additional generic allows you to datagen remove objects with increased type safety, but it can otherwise be ignored and treated as wilcard (`?`) for most use cases.

### Creation
You create an `AdvancedDataMapType` using `AdvancedDataMapType#builder`. Unlike the normal builder, the builder returned by that method will have two more methods (`merger` and `remover`), and it will return an `AdvancedDataMapType`.  

Registration methods remain the same.

### Mergers
An advanced data map can provide a `DataMapValueMerger` through `AdvancedDataMapType#merger`. This merger will be used to handle conflicts between data packs that attempt to attach a value to the same object.  
The merger will be given the two conflicting values, and their sources (as an `Either<TagKey<R>, ResourceKey<R>>` since values can be attached to all entries within a tag, not just individual entries), and is expected to return the value that will actually be attached.  
Generally, mergers should simply merge the values, and should not perform "hard" overwrites unless necessary (i.e. if merging isn't possible). A value can be overwritten by specifying the object-level `replace` field, which will bypass the merger.

We provide some default mergers for merging lists, sets and maps in `DataMapValueMerger`.  

The default merger (`DataMapValueMerger#defaultMerger`) has the typical first come last serverd priority-based overwriting behaviour that you'd expect from normal data packs, where the newest value always wins.

### Removers
An advanced data map can provide a `DataMapValueRemover` through `AdvancedDataMapType#remover`. The remover will allow selective removals of data map values, effectively decomposition.  
While by default a datapack can only remove the whole object attached to a registry entry, with a remover it can remove just speciffic values from the attached object (i.e. just the entry with a given key in the case of a map, or the entry with a specific property in the case of a list).  

The codec that is passed to the builder will decode removers that will then be given the value currently attached and its source, and is expected to create a new object that will have the properties requested by the `remove` object removed. Alternatively, an empty `Optional` will lead to the value being completely removed.  

An example of a remover that will remove a value with a specific key from a `Map`-based data map:
```java
public record MapRemover(String key) implements DataMapValueRemover<Map<String, String>, Item> {
    public static final Codec<MapRemover> CODEC = Codec.STRING.xmap(MapRemover::new, MapRemover::key);
    
    @Override
    public Optional<Map<String, String>> remove(Map<String, String> value, Registry<Item> registry, Either<TagKey<Item>, ResourceKey<Item>> source, Item object) {
        final Map<String, String> newMap = new HashMap<>(value);
        newMap.remove(key);
        return Optional.of(newMap);
    }
}
```

With the remover above in mind, we're attaching maps of string to string to items. Take the following data map JSON file:
```js
{
    "values": {
        //highlight-start
        "minecraft:carrot": {
            "somekey1": "value1",
            "somekey2": "value2"
        }
        //highlight-end
    }
}
```
That file will attach the map `[somekey1=value1, somekey2=value2]` to the `minecraft:carrot` item. Now, another datapack can come on top of it and remove just the value with the `somekey1` key, as such:
```js
{
    "remove": {
        // As the remover is decoded as a string, we can use a string as the value here. If it were decoded as an object, we would have needed to use an object.
        //highlight-next-line
        "minecraft:carrot": "somekey1"
    }
}
```
After the second datapack is read and applied, the new value attached to the `minecraft:carrot` item will be `[somekey2=value2]`.

## Datagen
Data maps can be generated through `DataMapProvider`.  
You should extend that class, and then override the `generate` method to create your entries, similar to tag generation.

Considering the drop healing example from the start, we could generate some values as follows:
```java
public class DropHealingGen extends DataMapProvider {

    public DropHealingGen(PackOutput packOutput, CompletableFuture<HolderLookup.Provider> lookupProvider) {
        super(packOutput, lookupProvider);
    }

    @Override
    protected void gather() {
        // In the examples below, we do not need to forcibly replace any value as that's the default behaviour since a merger isn't provided, so the third parameter can be false.

        // If you were to provide a merger for your data map, then the third parameter will cause the old value to be overwritten if set to true, without invoking the merger
        builder(DROP_HEALING)
                // Always give entities that drop any item in the minecraft:fox_food tag 12 hearts
                .add(ItemTags.FOX_FOOD, new DropHealing(12, 1f), false)
                // Have a 10% chance of healing entities that drop an acacia boat by one point
                .add(Items.ACACIA_BOAT.builtInRegistryHolder(), new DropHealing(1, 0.1f), false);
    }
}
```