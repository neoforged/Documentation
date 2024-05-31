# 레벨 데이터

레벨 데이터는 (Saved Data, SD) 레벨 자체에 추가 데이터를 저장하는데 사용합니다.

_만약 데이터가 특정 블록 엔티티, 청크, 엔티티 전용이라면, [부착 데이터](attachments.md)를 대신 쓰시는걸 권장드립니다._

# 선언하기

레벨 데이터는 `SavedData`로 표현됩니다. 이때 주목해야 할 메서드 두 개가 있는데:

- `save`: 레벨에 NBT 데이터를 저장합니다.
- `setDirty`: 데이터가 바뀌었다고 표시합니다. 이를 호출하지 않으면 `#save`가 호출되지 않아 데이터가 저장되지 않습니다.

## 레벨에 데이터 추가하기

모든 레벨 데이터는 동적으로 불러와지고 추가됩니다; 저장된 적이 없는 데이터는 존재하지 않습니다.

레벨 데이터는 `DimensionDataStorage`로 관리합니다, 이는 `ServerChunkCache#getDataStorage` 또는 `ServerLevel#getDataStorage`를 통해 접근할 수 있습니다. 이후 `DimensionDataStorage#computeIfAbsent`를 호출하여 데이터에 접근하거나 없다면 생성할 수 있습니다.

`DimensionDataStorage#computeIfAbsent`는 두 개의 인자를 받는데, `SavedData.Factory`, 그리고 데이터 파일 이름 입니다. `SavedData.Factory`는 NBT로부터 데이터를 읽어올 함수와, 새로운 데이터를 생성하는 `Supplier`로 이루어져 있습니다.

예를 들어, "example" 이라는 이름의 데이터를 네더에 추가한다면, `./<레벨 폴더>/DIM-1/data/example.dat`이라는 파일이 생성될 것이며 코드는 아래와 같습니다:

```java
public ExampleSavedData create() {
  return new ExampleSavedData(0);
}

public ExampleSavedData load(CompoundTag tag, HolderLookup.Provider lookupProvider) {
  ExampleSavedData data = this.create();
  // 여기서 tag로부터 데이터를 불러오세요
  return data;
}

// 데이터를 다른곳에서 불러올때
netherDataStorage.computeIfAbsent(new Factory<>(this::create, this::load), "example");
```

만약 레벨이 불러와지지 않았다면 그 레벨의 데이터 또한 사용할 수 없습니다. 하지만 오버월드는 언제나 존재하기에 데이터를 오버월드에 추가하면 언제든지 사용하실 수 있습니다. 오버월드는 `MinecraftServer#overworld`로 접근하실 수 있습니다. 
