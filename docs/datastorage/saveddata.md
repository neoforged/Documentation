# 레벨 저장 데이터

레벨 저장 데이터는 (또는 Saved Data, SD) 레벨 자체에 추가 데이터를 저장하는데 사용합니다.

_만약 데이터가 특정 블록 엔티티, 청크, 엔티티 전용이라면, [부착 데이터](attachments.md)를 대신 쓰시는걸 권장드립니다._

# 선언하기

레벨에 저장될 데이터는 `SavedData`로 표현됩니다. 이때 주목해야 할 메서드 두 개가 있는데:

* `save`: NBT 데이터를 레벨에 작성합니다.
* `setDirty`: 데이터가 바뀌었다고 표시합니다. 이를 호출하지 않으면 `#save`가 호출되지 않아 데이터가 갱신되지 않습니다.

## 레벨에 추가하기

모든 `SavedData`는 동적으로 불러와지고 레벨에 추가됩니다; 저장된 적이 없는 SD는 존재하지 않습니다.

`SavedData`는 `DimensionDataStorage`로 생성하고 불러옵니다, 이는 `ServerChunkCache#getDataStorage` 또는 `ServerLevel#getDataStorage`를 통해 접근할 수 있습니다. 이후 `DimensionDataStorage#computeIfAbsent`를 호출하여 데이터에 접근하거나 없다면 생성할 수 있습니다.

`DimensionDataStorage#computeIfAbsent`는 두 개의 인자를 받는데, 첫번째는 `SavedData.Factory`, `data` 폴더에 저장될 `.dat` 파일 이름입니다. `SavedData.Factory`는 NBT로부터 SD를 불러오는 함수와 새로운 SD를 생성하는 `Supplier`로 이루어져 있습니다.

예를 들어, "example" 이라는 이름의 데이터를 네더에 추가한다면, `./<레벨 폴더>/DIM-1/data/example.dat`에 새로운 파일이 생성될 것이며 코드는 아래와 같습니다:

```java
public ExampleSavedData create() {
  return new ExampleSavedData(0);
}

public ExampleSavedData load(CompoundTag tag) {
  ExampleSavedData data = this.create();
  data.integer = tag.getInt("integer");
  return data;
}

// 데이터를 다른곳에서 불러올때
        netherDataStorage.computeIfAbsent(new Factory<>(this::create, this::load), "example");
```

SD를 레벨 상관없이 어디에서나 사용하시려면, 단순히 오버월드에 추가하시면 됩니다, `MinecraftServer#overworld`로 오버월드의 인스턴스를 얻을 수 있습니다. 오버월드는 유일하게 완전히 언로드되는 일이 없는 레벨로, 언제든지 안전하게 접근할 수 있습니다.
