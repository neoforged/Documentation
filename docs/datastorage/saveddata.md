# 保存的数据系统

保存的数据（SD）系统可用于在各级别上保存额外数据。

_如果数据特定于某些方块实体、区块或实体，请考虑使用[数据附件](attachments)。_

## 声明

每个 SD 实现必须是 `SavedData` 类的子类型。有两个重要方法需要注意：

* `save`：允许实现将 NBT 数据写入级别。
* `setDirty`：在更改数据后必须调用的方法，以通知游戏需要写入的更改。如果不调用，`#save` 将不会被调用，原始数据将保持不变。

## 附加到级别

任何 `SavedData` 都是动态加载和/或附加到级别的。因此，如果一个级别上从未创建过，那么它将不存在。

`SavedData` 是从 `DimensionDataStorage` 创建和加载的，可以通过调用 `ServerChunkCache#getDataStorage` 或 `ServerLevel#getDataStorage` 访问。从那里，您可以通过调用 `DimensionDataStorage#computeIfAbsent` 来获取或创建您的 SD 实例。这将尝试获取当前存在的 SD 实例，或创建一个新实例并加载所有可用数据。

`DimensionDataStorage#computeIfAbsent` 接受两个参数。第一个是 `SavedData.Factory` 的实例，它包括一个供应商来构建一个新的 SD 实例和一个函数，以将 NBT 数据加载到 SD 并返回它。第二个参数是实施级别的 `data` 文件夹中存储的 `.dat` 文件的名称。名称必须是有效的文件名，不能包含 `/` 或 `\`。

例如，如果一个 SD 在下界被命名为 "example"，则会在 `./<level_folder>/DIM-1/data/example.dat` 创建一个文件，并且会像这样实现：

```java
// 在某个类中
public ExampleSavedData create() {
  return new ExampleSavedData();
}

public ExampleSavedData load(CompoundTag tag) {
  ExampleSavedData data = this.create();
  // 加载保存的数据
  return data;
}

// 在类中的某个方法内
netherDataStorage.computeIfAbsent(new Factory<>(this::create, this::load), "example");
```

如果一个 SD 不特定于一个级别，那么 SD 应该附加到主世界，可以从 `MinecraftServer#overworld` 获取。主世界是唯一从不完全卸载的维度，因此非常适合在其上存储多级别数据。
