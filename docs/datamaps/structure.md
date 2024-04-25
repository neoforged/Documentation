# JSON结构
对于此页面，我们将使用一个数据映射作为例子，其对象具有两个浮点键：`amount` 和 `chance`。该对象的编码可以在[这里](./index.md#registration)找到。

## 地址
数据映射加载自位于 `mapNamespace/data_maps/registryNamespace/registryPath/mapPath.json` 的JSON文件，其中：
- `mapNamespace` 是数据映射ID的命名空间
- `mapPath` 是数据映射ID的路径
- `registryNamespace` 是注册表ID的命名空间
- `registryPath` 是注册表ID的路径

:::note
如果是 `minecraft`，则省略注册表命名空间。
:::

示例：
- 对于名为 `mymod:drop_healing` 的数据映射，用于 `minecraft:item` 注册表（如示例中），路径将是 `mymod/data_maps/item/drop_healing.json`。
- 对于名为 `somemod:somemap` 的数据映射，用于 `minecraft:block` 注册表，路径将是 `somemod/data_maps/block/somemap.json`。
- 对于名为 `example:stuff` 的数据映射，用于 `somemod:custom` 注册表，路径将是 `example/data_maps/somemod/custom/stuff.json`。

## 全局 `replace` 字段
JSON文件具有一个可选的全局 `replace` 字段，类似于标签，当其为 `true` 时，将移除该数据映射的所有先前附加值。这对于想要完全改变整个数据映射的数据包非常有用。

## 加载条件
数据映射文件支持在根级别和条目级别通过 `neoforge:conditions` 数组支持[加载条件](../resources/server/conditional)。

## 添加值
可以使用 `values` 映射将值附加到对象。每个键将代表要附加值的单个注册表条目的ID，或者一个以 `#` 开头的标签键。如果是一个标签，那么相同的值将附加到该标签的所有条目上。
键将是要附加的对象。

```js
{
    "values": {
        // 为胡萝卜项附加一个值
        "minecraft:carrot": {
            "amount": 12,
            "chance": 1
        },
        // 将一个值附加到 logs 标签的所有项上
        "#minecraft:logs": {
            "amount": 1,
            "chance": 0.1
        }
    }
}
```

:::info
上述结构将在[高级数据映射](./index.md#advanced-data-maps)的情况下调用合并器。如果你不想为特定的对象调用合并器，那么你将不得不使用类似于这样的结构：
```js
{
    "values": {
        // 覆盖胡萝卜项的值
        "minecraft:carrot": {
            // 高亮下一行
            "replace": true,
            // 新的值将在 value 子对象下
            "value": {
                "amount": 12,
                "chance": 1
            }
        }
    }
}
```
:::

## 移除值

JSON文件也可以通过使用 `remove` 数组，从对象中移除先前附加的值：
```js
{
    // 移除附加到苹果和土豆的值
    "remove": ["minecraft:apple", "minecraft:potato"]
}
```
数组包含一系列要从其中移除值的注册表条目ID或标签。

:::warning
移除操作在当前JSON文件的值被附加后进行，所以你可以使用移除功能来移除通过标签附加到对象的值：
```js
{
    "values": {
        "#minecraft:logs": 12
    },
    // 从金合欢原木移除值，这样所有原木除了金合欢都将附加值 12
    "remove": ["minecraft:acacia_log"]
}
```
:::

:::info
在提供自定义移除器的[高级数据映射](./index.md#advanced-data-maps)的情况下，可以通过将 `remove` 数组转换为映射来提供移除器的参数。
假设移除器对象被串行化为字符串，并且为基于 `Map` 的数据映射移除具有给定键的值：
```js
{
    "remove": {
        // 移除器将从值（这种情况下为 `somekey1`）反串行化
        // 并应用于附加到胡萝卜项的值
        "minecraft:carrot": "somekey1"
    }
}
```
:::
