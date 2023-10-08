Saved Data
==========

Saved Data（SD）系统是存档Capability功能的替代方案，可以按存档附加数据。

声明
----

Each SD implementation must subtype the `SavedData` class. There are two important methods to be aware of:
每个SD实现都必须继承`SavedData`类。有两种重要方法需要注意：

* `save`：允许实现将NBT数据写入该存档。
* `setDirty`：在更改数据后必须调用的方法，以通知游戏有需要写入的更改。如果未调用，将不会调用`#save`，并且现有数据将持久存在。

附加到存档
---------

任何`SavedData`都是动态加载和/或附加到一个存档的。因此，如果一个`SavedData`从来没有在一个存档上创建过，那么它就不存在了。

`SavedData`是从`DimensionDataStorage`创建和加载的，借助`ServerChunkCache#getDataStorage`或`ServerLevel#getDataStorage`都可以访问该存储。从那里，您可以通过调用`DimensionDataStorage#computeIfAbsent`来获取或创建SD的实例。这将尝试获取SD的当前实例（如果存在），或者创建一个新实例并加载所有可用数据。

`DimensionDataStorage#computeIfAbsent`接受三个参数：一个将NBT数据加载到SD并返回它的函数，一个构造SD新实例的Supplier，以及存储在所实现的存档的`data`文件夹中的`.dat`文件的名称。

例如，如果一个SD在下界中被命名为"example"，那么一个文件将在`./<level_folder>/DIM-1/data/example.dat`创建并且将这样实现：

```java
// 在某个类中
public ExampleSavedData create() {
  return new ExampleSavedData();
}

public ExampleSavedData load(CompoundTag tag) {
  ExampleSavedData data = this.create();
  // 加载saved data
  return data;
}

// 在该类的某个方法中
netherDataStorage.computeIfAbsent(this::load, this::create, "example");
```

要在多个存档之间保持SD，应将SD连接到主世界，其可以从`MinecraftServer#overworld`获得。主世界是唯一一个从未完全卸载的维度，因此非常适合在其上存储多存档数据。
