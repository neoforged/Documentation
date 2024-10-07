# 编解码器

编解码器是 Mojang 的 [DataFixerUpper] 库中的一种序列化工具，用于描述对象在不同格式之间的转换方式，如将对象从 `JsonElement` 的 JSON 格式转换为 NBT 的 `Tag` 格式。

## 使用编解码器

编解码器主要用于将 Java 对象编码（或序列化）成某种数据格式，并将格式化的数据对象解码（或反序列化）回其关联的 Java 类型。这通常通过 `Codec#encodeStart` 和 `Codec#parse` 来实现。

### 动态操作

为了确定将数据编码和解码至哪种中间文件格式，`#encodeStart` 和 `#parse` 都需要一个 `DynamicOps` 实例来定义该格式中的数据。

[DataFixerUpper] 库包含了 `JsonOps`，用于对存储在 [`Gson`][gson] 的 `JsonElement` 实例中的 JSON 数据进行编解码。`JsonOps` 支持两种 `JsonElement` 序列化版本：`JsonOps#INSTANCE` 定义了标准的 JSON 文件，而 `JsonOps#COMPRESSED` 允许将数据压缩成单一字符串。

```java
// 假设 exampleCodec 代表一个 Codec<ExampleJavaObject>
// 假设 exampleObject 为一个 ExampleJavaObject
// 假设 exampleJson 为一个 JsonElement

// 将 Java 对象编码为常规 JsonElement
exampleCodec.encodeStart(JsonOps.INSTANCE, exampleObject);

// 将 Java 对象编码为压缩的 JsonElement
exampleCodec.encodeStart(JsonOps.COMPRESSED, exampleObject);

// 将 JsonElement 解码为 Java 对象
// 假设 JsonElement 是正常解析的
exampleCodec.parse(JsonOps.INSTANCE, exampleJson);
```

Minecraft 还提供了 `NbtOps` 用于对存储在 `Tag` 实例中的 NBT 数据进行编解码。可以通过 `NbtOps#INSTANCE` 来引用。

```java
// 假设 exampleCodec 代表一个 Codec<ExampleJavaObject>
// 假设 exampleObject 为一个 ExampleJavaObject
// 假设 exampleNbt 为一个 Tag

// 将 Java 对象编码为 Tag
exampleCodec.encodeStart(JsonOps.INSTANCE, exampleObject);

// 将 Tag 解码为 Java 对象
exampleCodec.parse(JsonOps.INSTANCE, exampleNbt);
```

#### 格式转换

`DynamicOps` 还可以单独用来在两种不同的编码格式之间转换。这可以通过使用 `#convertTo` 并提供 `DynamicOps` 格式和要转换的编码对象来完成。

```java
// 将 Tag 转换为 JsonElement
// 假设 exampleTag 为一个 Tag
JsonElement convertedJson = NbtOps.INSTANCE.convertTo(JsonOps.INSTANCE, exampleTag);
```

### 数据结果

使用编解码器编码或解码数据时返回的 `DataResult` 将根据转换是否成功，持有转换后的实例或一些错误数据。当转换成功时，由 `#result` 提供的 `Optional` 将包含成功转换的对象。如果转换失败，由 `#error` 提供的 `Optional` 将包含 `PartialResult`，后者持有错误消息和根据编解码器部分转换的对象。

此外，`DataResult` 上有许多方法可以用来将结果或错误转换为所需格式。例如，`#resultOrPartial` 将返回一个 `Optional`，在成功时包含结果，在失败时包含部分转换的对象。此方法接受一个字符串消费者以确定如何报告错误消息（如果存在）。

```java
// 假设 exampleCodec 代表一个 Codec<ExampleJavaObject>
// 假设 exampleJson 为一个 JsonElement

// 将 JsonElement 解码为 Java 对象
DataResult<ExampleJavaObject> result = exampleCodec.parse(JsonOps.INSTANCE, exampleJson);

result
  // 获取结果或部分错误时的错误消息
  .resultOrPartial(errorMessage -> /* 处理错误消息 */)
  // 如果结果或部分存在，则进行某些操作
  .ifPresent(decodedObject

 -> /* 处理解码对象 */);
```

## 现有编解码器

### 原始类型

`Codec` 类包含了一些定义的原始类型的静态编解码器实例。

| 编解码器       | Java 类型  |
|------------|--------|
| `BOOL`     | `Boolean` |
| `BYTE`     | `Byte`  |
| `SHORT`    | `Short` |
| `INT`      | `Integer` |
| `LONG`     | `Long`   |
| `FLOAT`    | `Float`  |
| `DOUBLE`   | `Double` |
| `STRING`   | `String` |
| `BYTE_BUFFER` | `ByteBuffer` |
| `INT_STREAM`  | `IntStream`  |
| `LONG_STREAM` | `LongStream` |
| `PASSTHROUGH` | `Dynamic<?>` |
| `EMPTY`       | `Unit`       |

* `Dynamic` 是一个在支持的 `DynamicOps` 格式中编码值的对象。这些通常用于将编码对象格式转换为其他编码对象格式。
* `Unit` 是用于表示 `null` 对象的对象。

### 原版和 Forge

Minecraft 和 Forge 定义了许多常见对象的编解码器。一些示例包括用于 `ResourceLocation` 的 `ResourceLocation#CODEC`，用于 `DateTimeFormatter#ISO_INSTANT` 格式的 `Instant` 的 `ExtraCodecs#INSTANT_ISO8601`，以及用于 `CompoundTag` 的 `CompoundTag#CODEC`。

:::警告
使用 `JsonOps` 的 `CompoundTag` 不能从 JSON 解码数字列表。`JsonOps` 在转换时会将数字设置为其最窄类型。`ListTag` 强制其数据使用特定类型，因此不同类型的数字（例如 `64` 会是 `byte`，`384` 会是 `short`）在转换时会引发错误。
:::

原版和 Forge 注册也有针对注册表所包含对象类型的编解码器（例如 `Registry#BLOCK` 或 `ForgeRegistries#BLOCKS` 有一个 `Codec<Block>`）。`Registry#byNameCodec` 和 `IForgeRegistry#getCodec` 会将注册表对象编码为其注册名，或者如果压缩，则为整数标识符。原版注册表还有一个 `Registry#holderByNameCodec`，它将编码为注册名并解码为被 `Holder` 包装的注册表对象。

## 创建编解码器

可以为任何对象创建编解码器。为了便于理解，将显示等效的编码 JSON。

### 记录

编解码器可以通过使用记录来定义对象。每个记录编解码器定义了具有明确命名字段的任何对象。创建记录编解码器的方法有很多，但最简单的是通过 `RecordCodecBuilder#create`。

`RecordCodecBuilder#create` 接受一个函数，该函数定义了一个 `Instance` 并返回一个应用（`App`）到构建对象的对象。这可以与创建类*实例*和用于*应用*类的构造函数联系起来。

```java
// 一个需要创建编解码器的对象
public class SomeObject {

  public SomeObject(String s, int i, boolean b) { /* ... */ }

  public String s() { /* ... */ }

  public int i() { /* ... */ }

  public boolean b() { /* ... */ }
}
```

#### 字段

`Instance` 可以使用 `#group` 定义多达 16 个字段。每个字段必须是一个定义了对象被制造的实例及对象类型的应用。满足此要求的最简单方式是使用 `Codec`，设置字段的解码名称，并设置用于编码字段的 getter。

字段可以使用 `#fieldOf` 从 `Codec` 创建，如果字段是必需的，或使用 `#optionalFieldOf` 创建，如果字段被包装在 `Optional` 中或默认存在。任一方法都需要包含编码对象中字段名称的字符串。然后可以使用 `#forGetter` 设置用于编码字段的 getter，它接受一个函数，该函数给定对象，返回字段数据。

从那里

，生成的产品可以通过 `#apply` 应用，以定义如何为应用构建对象。为了方便起见，分组字段应按照它们在构造函数中出现的顺序列出，以便函数可以简单地是一个构造函数方法引用。

```java
public static final Codec<SomeObject> RECORD_CODEC = RecordCodecBuilder.create(instance -> // 给定一个实例
  instance.group( // 在实例中定义字段
    Codec.STRING.fieldOf("s").forGetter(SomeObject::s), // 字符串
    Codec.INT.optionalFieldOf("i", 0).forGetter(SomeObject::i), // 整数，默认为 0（如果字段不存在）
    Codec.BOOL.fieldOf("b").forGetter(SomeObject::b) // 布尔
  ).apply(instance, SomeObject::new) // 定义如何创建对象
);
```

```js
// 编码后的 SomeObject
{
  "s": "value",
  "i": 5,
  "b": false
}

// 另一个编码后的 SomeObject
{
  "s": "value2",
  // i 被省略，默认为 0
  "b": true
}
```

### 转换器

编解码器可以通过映射方法转换成等效或部分等效的表现形式。每个映射方法接收两个函数：一个用于将当前类型转换为新类型，另一个用于将新类型转换回当前类型。这是通过 `#xmap` 函数完成的。

```java
// 一个类
public class ClassA {

  public ClassB toB() { /* ... */ }
}

// 另一个等效的类
public class ClassB {

  public ClassA toA() { /* ... */ }
}

// 假设存在某个编解码器 A_CODEC
public static final Codec<ClassB> B_CODEC = A_CODEC.xmap(ClassA::toB, ClassB::toA);
```

如果类型部分等效，即转换过程中存在某些限制，则存在返回 `DataResult` 的映射函数，可用于在遇到异常或无效状态时返回错误状态。

是否 A 完全等同于 B | 是否 B 完全等同于 A | 转换方法
:---:                | :---:                | :---
是                  | 是                  | `#xmap`
是                  | 否                  | `#flatComapMap`
否                  | 是                  | `#comapFlatMap`
否                  | 否                  | `#flatXMap`

```java
// 给定一个字符串编解码器转换为整数
// 并非所有字符串都可以变成整数（A 与 B 非完全等效）
// 所有整数都可以变成字符串（B 与 A 完全等效）
public static final Codec<Integer> INT_CODEC = Codec.STRING.comapFlatMap(
  s -> { // 返回失败时包含错误的数据结果
    try {
      return DataResult.success(Integer.valueOf(s));
    } catch (NumberFormatException e) {
      return DataResult.error(s + " 不是一个整数。");
    }
  },
  Integer::toString // 常规函数
);
```

```js
// 将返回 5
"5"

// 将错误，不是整数
"value"
```

#### 范围编解码器

范围编解码器是 `#flatXMap` 的实现，如果值不在设定的最小值和最大值之间，则返回错误的 `DataResult`。如果值超出范围，仍会提供部分结果。分别有整数、浮点和双精度通过 `#intRange`、`#floatRange` 和 `#doubleRange` 实现。

```java
public static final Codec<Integer> RANGE_CODEC = Codec.intRange(0, 4);
```

```js
// 将有效，在 [0, 4] 内
4

// 将错误，在 [0, 4] 外
5
```

### 默认值

如果编码或解码的结果失败，可以通过 `Codec#orElse` 或 `Codec#orElseGet` 提供默认值。

```java
public static final Codec<Integer> DEFAULT_CODEC = Codec.INT.orElse(0); // 也可以通过 #orElseGet 提供值
```

```js
// 不是整数，默认为 0
"value"
```

### 单位

一个编解码器，提供代码中的值并不编码任何东西，可以使用 `Codec#unit` 表示。如果编解码器在数据对象中使用了一个不可编码的条目，这非常有用。

```java
public static final Codec<IForgeRegistry<Block>> UNIT_CODEC = Codec.unit(
  () -> ForgeRegistries.BLOCKS // 也可以是原始值
);
```

```js
// 这里没有任何内容，将返回方块注册表编解码器
```

### 列表

可以从对象编解码器生成一个对象列表的编解码器，通过 `Codec#listOf` 实现。

```java
// BlockPos#CODEC 是一个 Codec<BlockPos>
public static final Codec<List<BlockPos>> LIST_CODEC = BlockPos.CODEC.listOf();
```

```js
// 编码的 List<BlockPos>
[
  [1, 2, 3], // BlockPos(1, 2, 3)
  [4, 5, 6], // BlockPos(4, 5, 6)
  [7, 8, 9]  // BlockPos(7, 8, 9)
]
``

`

使用列表编解码器解码的列表对象存储在一个**不可变**列表中。如果需要可变列表，则应该对列表编解码器应用[变换器]。

### 映射

可以通过两个编解码器生成键和值对象映射的编解码器，通过 `Codec#unboundedMap` 实现。无界映射可以指定任何基于字符串的或转换为字符串的值作为键。

```java
// BlockPos#CODEC 是一个 Codec<BlockPos>
public static final Codec<Map<String, BlockPos>> MAP_CODEC = Codec.unboundedMap(Codec.STRING, BlockPos.CODEC);
```

```js
// 编码的 Map<String, BlockPos>
{
  "key1": [1, 2, 3], // key1 -> BlockPos(1, 2, 3)
  "key2": [4, 5, 6], // key2 -> BlockPos(4, 5, 6)
  "key3": [7, 8, 9]  // key3 -> BlockPos(7, 8, 9)
}
```

使用无界映射编解码器解码的映射对象存储在一个**不可变**映射中。如果需要可变映射，则应对映射编解码器应用[变换器]。

:::警告
无界映射只支持可以编码/解码为字符串的键。可以使用键值[对]列表编解码器来绕过此限制。
:::

### 对

可以通过两个编解码器生成对象对的编解码器，通过 `Codec#pair` 实现。

对编解码器通过首先解码对中的左对象，然后取剩下的编码对象部分并从中解码右对象来解码对象。因此，编解码器必须在解码后表达关于编码对象的某些信息（如[记录]），或者必须被增强为 `MapCodec` 并通过 `#codec` 转换为常规编解码器。这通常可以通过将编解码器作为某个对象的[字段]来实现。

```java
public static final Codec<Pair<Integer, String>> PAIR_CODEC = Codec.pair(
  Codec.INT.fieldOf("left").codec(),
  Codec.STRING.fieldOf("right").codec()
);
```

```js
// 编码的 Pair<Integer, String>
{
  "left": 5,       // fieldOf 查找左对象的 'left' 键
  "right": "value" // fieldOf 查找右对象的 'right' 键
}
```

:::tips
可以使用非字符串键的映射编解码器通过应用带有[变换器]的键值对列表来编码/解码。
:::

### Either 编解码器

可以通过两个编解码器生成一个针对某个对象数据的两种不同编解码方法的编解码器，使用 `Codec#either` 实现。

Either 编解码器首先尝试使用第一个编解码器解码对象。如果失败，它将尝试使用第二个编解码器。如果第二次也失败，那么 `DataResult` 将只包含第二次编解码器失败的错误。

```java
public static final Codec<Either<Integer, String>> EITHER_CODEC = Codec.either(
  Codec.INT,
  Codec.STRING
);
```

```js
// 编码 Either$Left<Integer, String>
5

// 编码 Either$Right<Integer, String>
"value"
```

:::tips
这可以与[变换器]结合使用，从两种不同的编码方法中获取特定对象。
:::

### 分派编解码器

编解码器可以拥有可以根据某些指定类型解码特定对象的子编解码器，通过 `Codec#dispatch` 实现。这通常用于包含编解码器的注册表，如规则测试或方块放置器。

分派编解码器首先尝试从某个字符串键（通常是 `type`）获取编码类型。从那里开始，解码类型，调用用于解码实际对象的特定编解码器的获取器。如果用于解码对象的 `DynamicOps` 压缩其映射，或者对象编解码器本身没有增强成 `MapCodec`（如记录或字段化原语），则对象需要存储在 `value` 键中。否则，对象将在与其余数据相同的级别上解码。

```java
// 定义我们的对象
public abstract class ExampleObject {

  // 定义用于指定编码对象类型的方法
  public abstract Codec<? extends ExampleObject> type();
}

// 创建存储字符串的简单对象
public class StringObject extends ExampleObject {

  public StringObject(String s) { /* ... */ }

  public String s() { /* ... */ }

  public Codec<? extends ExampleObject> type() {
    // 一个注册的注册表对象
    // "string":
    //   Codec.STRING.xmap(StringObject::new, StringObject::s)
    return STRING_OBJECT_CODEC.get();
  }
}

// 创建存储字符串和整数的复杂对象
public class ComplexObject extends ExampleObject {

  public ComplexObject(String s, int i) { /* ... */ }

  public String s() { /* ... */ }

  public int i() { /* ... */ }

  public Codec<? extends ExampleObject> type() {
    // 一个注册的注册表对象
    // "complex":
    //   RecordCodecBuilder.create(instance ->
    //     instance.group(
    //       Codec.STRING.fieldOf("s").forGetter(ComplexObject::s),
    //       Codec.INT.fieldOf("i").forGetter(ComplexObject::i)
    //     ).apply(instance, ComplexObject::new)
    //   )
    return COMPLEX_OBJECT_CODEC.get();
  }
}

// 假设存在一个 IForgeRegistry<Codec<? extends ExampleObject>> DISPATCH
public static final Codec<ExampleObject> = DISPATCH.getCodec() // 获取 Codec<Codec<? extends ExampleObject>>
  .dispatch(
    ExampleObject::type, // 从特定对象获取编解码器
    Function.identity() // 从注册表获取编解码器
  );
```

```js
// 简单对象
{
  "type": "string", // 对于 StringObject
  "value": "value" // 编解码器类型未从 MapCodec 增强，需要字段
}

// 复杂对象
{
  "type": "complex", // 对于 ComplexObject

  // 编解码器类型从 MapCodec 增强，可以内联
  "s": "value",
  "i": 0
}
```

[DataFixerUpper]: https://github.com/Mojang/DataFixerUpper
[gson]: https://github.com/google/gson
[transformer]: #transformer-codecs
[pair]: #pair
[records]: #records
[field]: #fields
