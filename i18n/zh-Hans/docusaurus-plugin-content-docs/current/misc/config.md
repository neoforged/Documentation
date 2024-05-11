配置
=============

配置定义了可应用于模组实例的设置和用户偏好。NeoForge 使用 [TOML][toml] 文件并使用 [NightConfig][nightconfig] 进行读取的配置系统。

创建配置
------------------------

可以使用 `IConfigSpec` 的子类型来创建配置。NeoForge 通过 `ModConfigSpec` 实现了该类型，并通过 `ModConfigSpec.Builder` 启用其构建。该构建器可以通过 `Builder#push` 将配置值分成部分以创建一个部分，通过 `Builder#pop` 离开一个部分。然后，可以使用以下两种方法之一构建配置：

 方法     | 描述
 :---       | :---
`build`     | 创建 `ModConfigSpec`。
`configure` | 创建持有配置值的类和 `ModConfigSpec` 的一对。

:::note
`ModConfigSpec.Builder#configure` 通常与 `static` 块和一个类一起使用，该类作为其构造函数的一部分接受 `ModConfigSpec.Builder` 来附加和保存值：

```java
// 在某个配置类中
ExampleConfig(ModConfigSpec.Builder builder) {
  // 在此定义值的最终字段
}

// 某处可以访问构造函数
static {
  Pair<ExampleConfig, ModConfigSpec> pair = new ModConfigSpec.Builder()
    .configure(ExampleConfig::new);
  // 将配对值存储在某个常量字段中
}
```
:::

每个配置值可以提供额外的上下文以提供附加行为。必须在完全构建配置值之前定义上下文：

| 方法         | 描述                                                                                                 |
|:---------------|:------------------------------------------------------------------------------------------------------------|
| `comment`      | 提供配置值功能的描述。可以为多行注释提供多个字符串。 |
| `translation`  | 为配置值的名称提供翻译键。                                                |
| `worldRestart` | 必须在更改配置值之前重新启动世界。                                         |

### ConfigValue

可以使用提供的上下文（如果已定义）使用任何 `#define` 方法构建配置值。

所有配置值方法至少接受两个组件：

* 表示变量名称的路径：一个 `.` 分隔的字符串，表示配置值所在的部分
* 当没有有效配置时的默认值

`ConfigValue` 特定的方法接受两个额外的组件：

* 验证器，以确保反序列化的对象有效
* 表示配置值的数据类型的类

```java
// 对于某个 ModConfigSpec.Builder builder
ConfigValue<T> value = builder.comment("Comment")
  .define("config_value_name", defaultValue);
```

还可以使用 `ConfigValue#get` 获取值。值还被缓存以防止从文件中进行多次读取。

#### 额外的配置值类型

* **范围值**
    * 描述：值必须在定义的边界之间
    * 类型：`Comparable<T>`
    * 方法名：`#defineInRange`
    * 额外组件：
      * 配置值可能的最小值和最大值
      * 表示配置值的数据类型的类

:::note
`DoubleValue`、`IntValue` 和 `LongValue` 是范围值，它们将类指定为 `Double`、`Integer` 和 `Long`，分别。
:::

* **白名单值**
    * 描述：值必须在提供的集合中
    * 类型：`T`
    * 方法名：`#defineInList`
    * 额外组件：
      * 配置可以是哪些值的集合

* **列表值**
    * 描述：值是一系列条目
    * 类型：`List<T>`
    * 方法名：`#defineList`，如果列表可以为空，则为 `#defineListAllowEmpty`
    * 额外组件：
      * 验证器，以确保从列表中反序列化的元素有效

* **枚举值**
    * 描述：在提供的集合中的枚举值
    * 类型：`Enum<T>`
    * 方法名：`#defineEnum`
    * 额外组件：
      * 一个 getter，将字符串或整数转换为枚举
      * 配置可以是哪些值的集合

* **布尔值**
    * 描述：一个 `boolean` 值
    * 类型：`Boolean`
    * 方法名：`#define`

注册配置
---------------------------

一旦构建了 `ModConfigSpec`，就必须注册它以允许 NeoForge 加载、跟踪和根据需要同步配置设置。配置应该在模组构造函数中通过 `ModLoadingContext#registerConfig` 注册。可以使用给定的类型（表示配置所属的一侧）、`ModConfigSpec` 和可选的特定文件名为配置注册。

```java
// 在具有 ModConfigSpec CONFIG 的模组构造函数中
ModLoadingContext.get().registerConfig(Type.COMMON, CONFIG);
```

以下是可用的配置类型列表：

|  类型  |      加载      | 同步到客户端 |               客户端位置                |           服务器位置            | 默认文件后缀 |
|:------:|:----------------:|:----------------:|:--------------------------------------------:|:------------------------------------:|:--------------------|
| CLIENT | 仅客户端 |        否        |             `.minecraft/config`              |                 N/A                  | `-client`           |
| COMMON |  两边都有   |        否        |             `.minecraft/config`              |       `<server_folder>/config`       | `-common`           |
| SERVER | 仅服务器 |       是        | `.minecraft/saves/<level_name>/serverconfig` | `<server_folder>/world/serverconfig` | `-server`           |

:::tip
NeoForge 在其代码库中记录了[配置类型][type]。
:::

配置事件
--------------------

可以使用 `ModConfigEvent$Loading` 和 `ModConfigEvent$Reloading` 事件在加载或重新加载配置时执行的操作。必须将这些事件[注册][events]到模组事件总线上。

:::caution
这些事件适用于模组的所有配置；应使用提供的 `ModConfig` 对象来指示正在加载或重新加载的配置。
:::

[toml]: https://toml.io/
[nightconfig]: https://github.com/TheElectronWill/night-config
[type]: https://github.com/neoforged/FancyModLoader/blob/19d6326b810233e683f1beb3d28e41372e1e89d1/core/src/main/java/net/neoforged/fml/config/ModConfig.java#L83-L111
[events]: ../concepts/events.md#registering-an-event-handler
