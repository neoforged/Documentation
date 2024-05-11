# Named Binary Tag (NBT)

NBT 是 Minecraft 最初时期由 Notch 本人引入的一种格式，它在整个 Minecraft 代码库中广泛用于数据存储。

## 规范

NBT 规范与 JSON 规范类似，但有一些区别：

- 存在字节、短整型、长整型和浮点型的明确类型，分别以 `b`、`s`、`l` 和 `f` 为后缀，类似于在 Java 代码中的表示方式。
  - 双精度浮点型也可以用 `d` 后缀，但这不是必需的，类似于 Java 代码中的可选 `i` 后缀不被允许。
  - 后缀不区分大小写。例如，`64b` 与 `64B` 相同，`0.5F` 与 `0.5f` 相同。
- 布尔类型不存在，而是用字节表示。`true` 变为 `1b`，`false` 变为 `0b`。
  - 当前实现将所有非零值视为 `true`，因此 `2b` 也会被视为 `true`。
- NBT 中不存在 `null` 的等效物。
- 键周围的引号是可选的。所以 JSON 属性 `"duration": 20` 在 NBT 中可以表示为 `duration: 20` 或 `"duration": 20`。
- 在 JSON 中被称为子对象的东西，在 NBT 中被称为**复合标签**（或简称复合）。
- NBT 列表不能混合匹配类型，不同于 JSON。列表类型由第一个元素确定，或在代码中定义。
  - 然而，列表的列表可以混合匹配不同的列表类型。因此，一个列表包含两个列表，其中第一个是字符串列表，第二个是字节列表，是允许的。
- 存在特殊的**数组**类型，它们不同于列表，但遵循包含元素在方括号中的模式。有三种数组类型：
  - 字节数组，以 `B;` 开头。例如：`[B;0b,30b]`
  - 整数数组，以 `I;` 开头。例如：`[I;0,-300]`
  - 长整型数组，以 `L;` 开头。例如：`[L;0l,240l]`
- 列表、数组和复合标签中允许有尾随逗号。

## NBT 文件

Minecraft 广泛使用 `.nbt` 文件，例如 [datapacks][datapack] 中的结构文件。包含区域内容（即一系列区块）的区域文件（`.mca`），以及游戏中不同位置使用的各种 `.dat` 文件，也是 NBT 文件。

NBT 文件通常使用 GZip 压缩。因此，它们是二进制文件，不能直接编辑。

## NBT 在代码中的使用

与 JSON 类似，所有 NBT 对象都是封闭对象的子对象。让我们创建一个：

```java
CompoundTag tag = new CompoundTag();
```

现在我们可以将数据放入该标签：

```java
tag.putInt("Color", 0xffffff);
tag.putString("Level", "minecraft:overworld");
tag.putDouble("IAmRunningOutOfIdeasForNamesHere", 1d);
```

这里存在几个辅助方法，例如，`putIntArray` 也有一个便利方法，除了标准变体接受 `int[]` 外，还接受 `List<Integer>`。

当然，我们也可以从该标签中获取值：

```java
int color = tag.getInt("Color");
String level = tag.getString("Level");
double d = tag.getDouble("IAmRunningOutOfIdeasForNamesHere");
```

如果不存在，数字类型将返回 0。字符串将返回 `""` 如果不存在。更复杂的类型（列表、数组、复合标签）如果不存在会抛出异常。

因此，我们

希望通过检查标签元素是否存在来进行防护：

```java
boolean hasColor = tag.contains("Color");
boolean hasColorMoreExplicitly = tag.contains("Color", Tag.TAG_INT);
```

`TAG_INT` 常量在 `Tag` 中定义，这是所有标签类型的超接口。大多数标签类型除了 `CompoundTag` 外大多是内部的，例如 `ByteTag` 或 `StringTag`，尽管如果你偶然遇到一些，直接的 `CompoundTag#get` 和 `#put` 方法可以与它们一起工作。

不过，有一个明显的例外：`ListTag`。处理这些是特别的，因为当通过 `CompoundTag#getList` 获取列表标签时，你还必须指定列表类型。例如，获取字符串列表会像这样工作：

```java
ListTag list = tag.getList("SomeListHere", Tag.TAG_STRING);
```

类似地，创建 `ListTag` 时，也必须在创建过程中指定列表类型：

```java
ListTag list = new ListTag(List.of("Value1", "Value2"), Tag.TAG_STRING);
```

最后，直接在其他 `CompoundTag` 中操作 `CompoundTag` 利用 `CompoundTag#get` 和 `#put`：

```java
tag.put("Tag", new CompoundTag());
tag.get("Tag");
```

## NBT 的用途

NBT 在 Minecraft 中有很多用途。一些最常见的例子包括 [`ItemStack`][itemstack]、[`BlockEntity`][blockentity] 和 `Entity`。

## 另见

- [Minecraft Wiki 上的 NBT 格式][nbtwiki]

[blockentity]: ../blockentities/index.md
[datapack]: ../resources/server/index.md
[itemstack]: ../items/index.md#itemstacks
[nbtwiki]: https://minecraft.wiki/w/NBT_format
