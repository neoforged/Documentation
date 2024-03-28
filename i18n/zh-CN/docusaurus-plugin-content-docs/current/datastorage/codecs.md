# 编解码器（Codecs）

编解码器（Codecs）是源于Mojang的[DataFixerUpper]的一个序列化工具，用于描述对象如何在不同格式之间转换，例如JSON的`JsonElement`和NBT的`Tag`。

## 编解码器的使用

编解码器主要用于将Java对象编码或序列化为某种数据格式类型，并将格式化的数据对象解码或反序列化为其关联的Java类型。这通常分别使用`Codec#encodeStart`和`Codec#parse`来完成。

### DynamicOps

为了确定要编码和解码的中间文件格式，`#encodeStart`和`#parse`都需要一个`DynamicOps`实例来定义该格式中的数据。

[DataFixerUpper]库包含`JsonOps`，用于对存储在[`Gson`的][gson]`JsonElement`实例中的JSON数据进行编码。`JsonOps`支持两个版本的`JsonElement`序列化：定义标准JSON文件的`JsonOps#INSTANCE`和允许将数据压缩为单个字符串的`JsonOps#COMPRESSED`。

```java
// 让exampleCodec代表一个Codec<ExampleJavaObject>
// 让exampleObject是一个ExampleJavaObject
// 让exampleJson是一个JsonElement

// 将Java对象编码为常规的JsonElement
exampleCodec.encodeStart(JsonOps.INSTANCE, exampleObject);

// 将Java对象编码为压缩的JsonElement
exampleCodec.encodeStart(JsonOps.COMPRESSED, exampleObject);

// 将JsonElement解码为Java对象
// 假设JsonElement被普通地转换
exampleCodec.parse(JsonOps.INSTANCE, exampleJson);
```

Minecraft还提供了`NbtOps`来对存储在`Tag`实例中的NBT数据进行编解码。其可以使用`NbtOps#INSTANCE`被引用。

```java
// 让exampleCodec代表一个Codec<ExampleJavaObject>
// 让exampleObject是一个ExampleJavaObject
// 让exampleNbt是一个Tag

// 将Java对象编码为Tag
exampleCodec.encodeStart(JsonOps.INSTANCE, exampleObject);

// 将Tag解码为Java对象
exampleCodec.parse(JsonOps.INSTANCE, exampleNbt);
```

#### 格式的转换

`DynamicOps`还可以单独用于在两种不同的编码格式之间进行转换。这可以使用`#convertTo`并提供`DynamicOps`格式和要转换的编码对象来完成。

```java
// 将Tag转换为JsonElement
// 让exampleTag是一个Tag
JsonElement convertedJson = NbtOps.INSTANCE.convertTo(JsonOps.INSTANCE, exampleTag);
```

### DataResult

使用编解码器编码或解码的数据返回一个`DataResult`，它保存转换后的实例或一些错误数据，具体取决于转换是否成功。转换成功后，`#result`提供的`Optional`将包含成功转换的对象。如果转换失败，`#error`提供的`Optional`将包含`PartialResult`，其中包含错误消息和部分转换的对象，具体取决于编解码器。

此外，`DataResult`上有许多方法可用于将结果或错误转换为所需格式。例如，`#resultOrPartial`将返回一个`Optional`，其中包含成功时的结果，以及失败时部分转换的对象。该方法接收字符串Consumer，以确定如何报告错误消息（如果存在）。

```java
// 让exampleCodec代表一个Codec<ExampleJavaObject>
// 让exampleJson是一个JsonElement

// 将JsonElement解码为Java对象
DataResult<ExampleJavaObject> result = exampleCodec.parse(JsonOps.INSTANCE, exampleJson);

result
  // 获取结果或部分结果（当错误时），并报告错误消息
  .resultOrPartial(errorMessage -> /* 处理错误消息 */)
  // 如果结果或部分结果存在，做一些事情
  .ifPresent(decodedObject -> /* 处理解码后的对象 */);
```

## 现存的编解码器

### 原始类型

`Codec`类包含某些已定义的原始类型的编解码器的静态实例。

Codec         | Java类型
:---:         | :---
`BOOL`        | `Boolean`
`BYTE`        | `Byte`
`SHORT`       | `Short`
`INT`         | `Integer`
`LONG`        | `Long`
`FLOAT`       | `Float`
`DOUBLE`      | `Double`
`STRING`      | `String`
`BYTE_BUFFER` | `ByteBuffer`
`INT_STREAM`  | `IntStream`
`LONG_STREAM` | `LongStream`
`PASSTHROUGH` | `Dynamic<?>`\*
`EMPTY`       | `Unit`\*\*

\* `Dynamic`是一个对象，它包含以支持的`DynamicOps`格式编码的值。这些通常用于将编码对象格式转换为其他编码对象格式。

\*\* `Unit`是一个用于表示`null`对象的对象。

### 原版和Forge

Minecraft和Forge为经常编码和解码的对象定义了许多编解码器。一些示例包括`ResourceLocation`的`ResourceLocation#CODEC`，`DateTimeFormatter#ISO_INSTANT`格式的`Instant`的`ExtraCodecs#INSTANT_ISO8601`，以及`CompoundTag`的`CompoundTag#CODEC`。

:::danger
    `CompoundTag`无法使用`JsonOps`解码JSON中的数字列表。转换时，`JsonOps`将数字设置为其最窄的类型。`ListTag`强制为其数据指定一个特定类型，因此具有不同类型的数字（例如，`64`将是`byte`，`384`为`short`）将在转换时引发错误。
:::

原版和Forge注册表也具有注册表所包含对象类型的编解码器（例如`Registry#BLOCK`或`ForgeRegistries#BLOCKS`具有`Codec<Block>`）。`Registry#byNameCodec`和`IForgeRegistry#getCodec`将把注册表对象编码为其注册表名称，或者如果被压缩，则编码为整数标识符。原版注册表还有一个`Registry#holderByNameCodec`，它编码为注册表名称，并解码为`Holder`中包装的注册表对象。

## 创建编解码器

可以创建用于对任何对象进行编码和解码的编解码器。为了便于理解，将展示等效的编码JSON。

### 记录

编解码器可以通过使用记录来定义对象。每个记录编解码器都定义了具有显式命名字段的任何对象。创建记录编解码器的方法有很多，但最简单的是通过`RecordCodecBuilder#create`。

`RecordCodecBuilder#create` takes in a function which defines an `Instance` and returns an application (`App`) of the object. A correlation can be drawn to creating a class *instance* and the constructors used to *apply* the class to the constructed object.
`RecordCodecBuilder#create`接受一个定义`Instance`的函数，并返回对象的应用（`App`）。一个为创建类*实例*和用于将该类*应用*于所构造对象的构造函数的关联可被绘制。

```java
// 要为其创建编解码器的某个对象
public class SomeObject {

  public SomeObject(String s, int i, boolean b) { /* ... */ }

  public String s() { /* ... */ }

  public int i() { /* ... */ }

  public boolean b() { /* ... */ }
}
```

#### 字段

一个`Instance`可以使用`#group`定义多达16个字段。每个字段都必须是一个应用，定义为其创建对象的实例和对象的类型。满足这一要求的最简单方法是使用`Codec`，设置要解码的字段的名称，并设置用于编码字段的getter。

如果字段是必需的，则可以使用`#fieldOf`从`Codec`创建字段；如果字段被包装在`Optional`或默认值中，则使用`#optionalFieldOf`创建字段。任一方法都需要一个字符串，该字符串包含编码对象中字段的名称。然后，可以使用`#forGetter`设置用于对字段进行编码的getter，接受一个给定对象并返回字段数据的函数。

从那里，可以通过`#apply`应用生成的产品，以定义实例应如何构造应用的对象。为了方便起见，分组字段应该按照它们在构造函数中出现的顺序列出，这样函数就可以简单地作为构造函数方法引用。

```java
public static final Codec<SomeObject> RECORD_CODEC = RecordCodecBuilder.create(instance -> // 给定一个实例
  instance.group( // 定义该实例内的字段
    Codec.STRING.fieldOf("s").forGetter(SomeObject::s), // 字符串
    Codec.INT.optionalFieldOf("i", 0).forGetter(SomeObject::i), // 整数，当字段不存在时默认为0
    Codec.BOOL.fieldOf("b").forGetter(SomeObject::b) // 布尔值
  ).apply(instance, SomeObject::new) // 定义如何创建该对象
);
```

```js
// 已编码的SomeObject
{
  "s": "value",
  "i": 5,
  "b": false
}

// 另一个已编码的SomeObject
{
  "s": "value2",
  // i被忽略，默认为0
  "b": true
}
```

### 转换器

编解码器可以通过映射方法转换为等效或部分等效的表示。每个映射方法都有两个函数：一个将当前类型转换为新类型，另一个将新类型转换回当前类型。这是通过`#xmap`函数完成的。

```java
// A类
public class ClassA {

  public ClassB toB() { /* ... */ }
}

// 另一个等效的类
public class ClassB {

  public ClassA toA() { /* ... */ }
}

// 假设有一个编解码器A_CODEC
public static final Codec<ClassB> B_CODEC = A_CODEC.xmap(ClassA::toB, ClassB::toA);
```

如果一个类型是部分等效的，这意味着在转换过程中存在一些限制，则存在返回`DataResult`的映射函数，每当达到异常或无效状态时，该函数可用于返回错误状态。

A是否完全等效于B            | B是否完全等效于A            | 转换方法
:---:                      | :---:                      | :---
是                         | 是                         | `#xmap`
是                         | 否                         | `#flatComapMap`
否                         | 是                         | `#comapFlatMap`
否                         | 否                         | `#flatXMap`

```java
// 给定一个字符串编码器用于转换为一个整数
// 并非所有字符串都能成为整数（A不完全等效于B）
// 所有整数都能成为字符串（B完全等效于A）
public static final Codec<Integer> INT_CODEC = Codec.STRING.comapFlatMap(
  s -> { // 返回含有错误或失败的数据结果
    try {
      return DataResult.success(Integer.valueOf(s));
    } catch (NumberFormatException e) {
      return DataResult.error(s + " is not an integer.");
    }
  },
  Integer::toString // 常规函数
);
```

```js
// 将会返回5
"5"

// 将会产生错误，不是一个整数
"value"
```

#### 范围编解码器

范围编解码器是`#flatXMap`的实现，如果值不包含在设置的最小值和最大值之间，则返回错误`DataResult`。如果超出界限，该值仍将作为部分结果提供。分别通过`#intRange`、`#floatRange`和`#doubleRange`实现了整数（int）、浮点数（float）和双精度小数（double）。

```java
public static final Codec<Integer> RANGE_CODEC = Codec.intRange(0, 4); 
```

```js
// 将会合法，在[0, 4]范围内
4

// 将会产生错误，在[0, 4]范围外
5
```

### 默认值

如果编码或解码的结果失败，则可以通过`Codec#orElse`或`Codec#orElseGet`提供默认值。

```java
public static final Codec<Integer> DEFAULT_CODEC = Codec.INT.orElse(0); // Can also be a supplied value via #orElseGet
```

```js
// 不是一个整数，默认为0
"value"
```

### Unit

提供代码内的值并编码为空的编解码器可以使用`Codec#unit`来表示。如果编解码器在数据对象中使用了不可编码的条目，这将非常有用。

```java
public static final Codec<IForgeRegistry<Block>> UNIT_CODEC = Codec.unit(
  () -> ForgeRegistries.BLOCKS // 也可以是一个原始值
);
```

```js
// 此处无内容，将会返回方块注册表编解码器
```

### List

对象列表的编解码器可以通过`Codec#listOf`从对象编解码器生成。

```java
// BlockPos#CODEC是一个Codec<BlockPos>
public static final Codec<List<BlockPos>> LIST_CODEC = BlockPos.CODEC.listOf();
```

```js
// 已编码的List<BlockPos>
[
  [1, 2, 3], // BlockPos(1, 2, 3)
  [4, 5, 6], // BlockPos(4, 5, 6)
  [7, 8, 9]  // BlockPos(7, 8, 9)
]
```

使用列表编解码器解码的列表对象存储在**不可变**列表中。如果需要可变列表，则应将[转换器][transformer]应用于列表编解码器。

### Map

键和值对象映射（Map）的编解码器可以通过`Codec#unboundedMap`从两个编解码器生成。无边界映射可以指定任何基于字符串或经过字符串转换的值作为键。

```java
// BlockPos#CODEC是一个Codec<BlockPos>
public static final Codec<Map<String, BlockPos>> MAP_CODEC = Codec.unboundedMap(Codec.STRING, BlockPos.CODEC);
```

```js
// 已编码的Map<String, BlockPos>
{
  "key1": [1, 2, 3], // key1 -> BlockPos(1, 2, 3)
  "key2": [4, 5, 6], // key2 -> BlockPos(4, 5, 6)
  "key3": [7, 8, 9]  // key3 -> BlockPos(7, 8, 9)
}
```

使用无界映射编解码器解码的映射对象存储在**不可变**映射中。如果需要一个可变映射，则应该将[转换器][transformer]应用于映射编解码器。

:::danger
    无界映射仅支持对字符串进行编码/解码的键。键值[对][pair]列表编解码器可以用来绕过这个限制。
:::

### Pair

对象对的编解码器可以通过`Codec#pair`从两个编解码器生成。

成对编解码器通过首先解码成对中的左对象，然后取编码对象的剩余部分并从中解码右对象来解码对象。因此，编解码器必须在解码后表达关于编码对象的某些内容（例如[记录][records]），或者必须将它们扩充为`MapCodec`，并通过`#codec`转换为常规编解码器。这通常可以通过使编解码器成为某个对象的[字段][field]来实现。

```java
public static final Codec<Pair<Integer, String>> PAIR_CODEC = Codec.pair(
  Codec.INT.fieldOf("left").codec(),
  Codec.STRING.fieldOf("right").codec()
);
```

```js
// 已编码的Pair<Integer, String>
{
  "left": 5,       // fieldOf查询'left'键以获取左对象
  "right": "value" // fieldOf查询'right'键以获取右对象
}
```

:::tip
    可以使用[转换器][transformer]应用的键值对列表对具有非字符串键的映射编解码器进行编码/解码。
:::

### Either

用于编码/解码某些对象数据的两种不同方法的编解码器可以通过`Codec#either`从两个编解码器生成。

Either编解码器尝试使用第一编解码器对对象进行解码。如果失败，它将尝试使用第二个编解码器进行解码。如果也失败了，那么`DataResult`将只包含第二个编解码器失败的错误。

```java
public static final Codec<Either<Integer, String>> EITHER_CODEC = Codec.either(
  Codec.INT,
  Codec.STRING
);
```

```js
// 已编码的Either$Left<Integer, String>
5

// 已编码的Either$Right<Integer, String>
"value"
```

:::tip
    这可以与[转换器][transformer]结合使用，从两种不同的编码方法中获取特定对象。
:::

### Dispatch

编解码器可以具有子解码器，子解码器可以通过`Codec#dispatch`基于某个指定类型对特定对象进行解码。这通常用于包含编解码器的注册表中，例如规则测试或方块放置器。

Dispatch编解码器首先尝试从某个字符串关键字（通常为`type`）中获取编码类型。从那里，类型被解码，为用于解码实际对象的特定编解码器调用getter。如果用于解码对象的`DynamicOps`压缩了其映射，或者对象编解码器本身没有扩充为`MapCodec`（例如记录或已部署的基本类型），则需要将对象存储在`value`键中。否则，对象将在与其余数据相同的级别上进行解码。

```java
// 定义我们的对象
public abstract class ExampleObject {

  // 定义用于指定要编码的对象类型的方法
  public abstract Codec<? extends ExampleObject> type();
}

// 创建存储字符串的简单对象
public class StringObject extends ExampleObject {

  public StringObject(String s) { /* ... */ }

  public String s() { /* ... */ }

  public Codec<? extends ExampleObject> type() {
    // 一个已注册的注册表对象
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
    // 一个已注册的注册表对象
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

// 假设有一个IForgeRegistry<Codec<? extends ExampleObject>> DISPATCH
public static final Codec<ExampleObject> = DISPATCH.getCodec() // 获取Codec<Codec<? extends ExampleObject>>
  .dispatch(
    ExampleObject::type, // 从特定对象获取编解码器
    Function.identity() // 从注册表获取编解码器
  );
```

```js
// 简单对象
{
  "type": "string", // 对于StringObject
  "value": "value" // MapCodec不需要编解码器类型参数，需要字段
}

// 复杂对象
{
  "type": "complex", // 对于ComplexObject

  // MapCodec不需要编解码器类型参数，可被内联
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
