配置
====

配置定义了可以应用于模组实例的设置和Consumer偏好。Forge使用一个采用[TOML][toml]文件的配置系统，并使用[NightConfig][nightconfig]进行读取。

创建一个配置
-----------

可以使用`IConfigSpec`的子类型创建配置。Forge通过`ForgeConfigSpec`实现该类型，并通过`ForgeConfigSpec$Builder`实现其构造。生成器可以通过`Builder#push`创建一个部分，通过`Builder#pop`留下一个部分以将配置值分隔为多个部分。之后，可以使用以下两种方法之一构建配置：

 方法       | 描述
 :---       | :---
`build`     | 创建`ForgeConfigSpec`.
`configure` | 创建一对包含配置值和`ForgeConfigSpec`的类。

!!! 注意
    `ForgeConfigSpec$Builder#configure`通常与`static`块和一个类一起使用，该类将`ForgeConfigSpec$Builder`作为其构造函数的一部分，用于附加和保存值：

    ```java
    // 在某个配置类中
    ExampleConfig(ForgeConfigSpec.Builder builder) {
      // 在此处在final字段中定义值
    }

    // 在该构造函数可被访问的某处
    static {
      Pair<ExampleConfig, ForgeConfigSpec> pair = new ForgeConfigSpec.Builder()
        .configure(ExampleConfig::new);
      // 在某个常量字段中存储成对的值
    }
    ```

可以为每个配置值提供额外的上下文，以提供额外的行为。必须先定义上下文，然后才能完全生成配置值：

方法         | 描述
:---         | :---
`comment`      | 提供配置值的作用说明。可以为多行注释提供多个字符串。
`translation`  | 为配置值的名称提供翻译键。
`worldRestart` | 必须重新启动世界，才能更改配置值。

### ConfigValue

配置值可以使用所提供的上下文（如果已定义）使用任何`#define`方法构建。

所有配置值方法都至少接受两个组件：

* 表示变量名称的路径：一个被`.`分隔的字符串，表示配置值所在的部分
* 不存在有效配置时的默认值

特定于`ConfigValue`的方法包含两个附加组件：

* 用于确保反序列化对象有效的验证器
* 表示配置值的数据类型的类

```java
// 对于某个ForgeConfigSpec$Builder生成器
ConfigValue<T> value = builder.comment("Comment")
  .define("config_value_name", defaultValue);
```

可以使用`ConfigValue#get`获取值本身。这些值会被额外缓存，以防止从文件中进行多次读取。

#### 附加的配置值类型

* **范围值**
    * 描述: 值必须在所定义的范围之间
    * 类型: `Comparable<T>`
    * 方法名称: `#defineInRange`
    * 附加组件:
      * 配置值可能的最小值和最大值
      * 表示配置值的数据类型的类

!!! 注意
    `DoubleValue`、`IntValue`和`LongValue`是将类型分别指定为`Double`、`Integer`和`Long`的范围值。

* **白名单值**
    * 描述: 值必须在所提供的集合中
    * 类型: `T`
    * 方法名称: `#defineInList`
    * 附加组件:
      * 配置所允许的值的集合

* **列表值**
    * 描述: 值是一个条目列表
    * 类型: `List<T>`
    * 方法名称: `#defineList`，`#defineListAllowEmpty`（如果列表可为空）
    * 附加组件:
      * 用于确保列表中反序列化元素有效的验证器

* **枚举值**
    * 描述: 在所提供的集合中的一个枚举值
    * 类型: `Enum<T>`
    * 方法名称: `#defineEnum`
    * 附加组件:
      * A getter to convert a string or integer into an enum
      * A collection of the allowed values the configuration can be

* **布尔值**
    * 描述: A `boolean` value
    * 类型: `Boolean`
    * 方法名称: `#define`

注册一个配置
-----------

一旦构建了`ForgeConfigSpec`，就必须对其进行注册，以允许Forge根据需要加载、跟踪和同步配置设置。配置应通过`ModLoadingContext#registerConfig`在模组构造函数中注册。配置可以注册为表示配置所属侧的给定类型`ForgeConfigSpec`，以及配置的特定文件名（可选）。

```java
// 在具有一个ForgeConfigSpec CONFIG的模组构造函数中
ModLoadingContext.get().registerConfig(Type.COMMON, CONFIG);
```

以下是可用的配置类型的列表：

类型   | 被加载            | 同步到客户端      | 客户端位置                                    | 服务端位置                            | 默认文件后缀
:---:  | :---:            | :---:            | :---:                                        | :---:                                | :---
CLIENT | 仅在客户端        | 否               | `.minecraft/config`                          | N/A                                  | `-client`
COMMON | 在两端           | 否               | `.minecraft/config`                          | `<server_folder>/config`             | `-common`
SERVER | 仅在服务端        | 是               | `.minecraft/saves/<level_name>/serverconfig` | `<server_folder>/world/serverconfig` | `-server`

!!! 提示
    Forge在相应的代码库中用文档详述了[配置类型][type]。

配置事件
--------

每当加载或重新加载配置时发生的操作可以使用`ModConfigEvent$Loading`和`ModConfigEvent$Reloading`事件来完成。事件必须[注册][events]到模组事件总线。

!!! 警告
    这些事件对于模组的所有配置都被调用；所提供的`ModConfig`对象应被用于表示正在加载或重新加载哪个配置。

[toml]: https://toml.io/
[nightconfig]: https://github.com/TheElectronWill/night-config
[type]: https://github.com/MinecraftForge/MinecraftForge/blob/c3e0b071a268b02537f9d79ef8e7cd9b100db416/fmlcore/src/main/java/net/minecraftforge/fml/config/ModConfig.java#L108-L136
[events]: ../concepts/events.md#creating-an-event-handler
