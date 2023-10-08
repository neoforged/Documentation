游戏测试
========

游戏测试是运行游戏内单元测试的一种方式。该系统被设计为可扩展的，并可并行高效地运行大量不同的测试。测试对象交互和行为只是该框架众多应用程序中的一小部分。

创建一个游戏测试
---------------

一个标准的游戏测试遵循以下三个基本步骤：

1. 加载一个结构或模板，其中包含测试交互或行为的场景（scene）。
1. 一种方法执行要在场景中执行的逻辑。
1. 逻辑执行的方法。如果达到成功状态，则测试成功。否则，测试将失败，结果将存储在场景附近的讲台（lectern）内。

因此，要创建游戏测试，必须有一个现有的模板来保存场景的初始开始状态和一个提供执行逻辑的方法。

### 测试方法

游戏测试方法是一个`Consumer<GameTestHelper>`引用，这意味着它接受一个`GameTestHelper`，但不返回任何内容。要识别游戏测试方法，它必须具有`@GameTest`注释：

```java
public class ExampleGameTests {
  @GameTest
  public static void exampleTest(GameTestHelper helper) {
    // 做一些事情
  }
}
```

`@GameTest`注释还包含配置游戏测试运行方式的成员。

```java
// 在某个类中
@GameTest(
  setupTicks = 20L, // 该测试花费20个tick来设置执行
  required = false // 失败将记录到日志，但不会影响批处理的执行
)
public static void exampleConfiguredTest(GameTestHelper helper) {
  // 做一些事情
}
```

#### 相对定位

所有`GameTestHelper`方法都使用结构方块的当前位置将结构模板场景中的相对坐标转换为其绝对坐标。为了便于在相对定位和绝对定位之间进行转换，可以分别使用`GameTestHelper#absolutePos`和`GameTestHelper#relativePos`。

结构模板的相对位置可以在游戏中通过[test命令][test]加载结构，将玩家放置在所需位置，最后运行`/test pos`命令来获得。这将获取玩家相对于玩家200个方块内最近结构的坐标。该命令将相对位置导出为聊天中的可复制文本组件，用作最终的本地变量。

!!! 提示
    `/test pos`生成的局部变量可以通过将其附加到命令末尾来指定其引用名称：

    ```bash
    /test pos <var> # 导出'final BlockPos <var> = new BlockPos(...);'
    ```

#### 成功完成

游戏测试方法负责一件事：在有效完成时标记测试是否成功。如果在超时之前没有达到成功状态（如`GameTest#timeoutTicks`所定义），则测试自动失败。

`GameTestHelper`中有许多抽象方法，可用于定义成功状态；然而，有四个是非常重要的。

方法                 | 描述
:---:                | :---
`#succeed`           | 测试被标记为成功。
`#succeedIf`         | 如果没有抛出`GameTestAssertException`，则会立即测试所提供的`Runnable`并成功。如果测试在该瞬时tick上没有成功，则将其标记为失败。
`#succeedWhen`       | 所提供的`Runnable`在超时之前每tick都会进行测试，如果对其中一个tick的检查没有引发`GameTestAssertException`，则会成功。
`#succeedOnTickWhen` | 提供的`Runnable`在指定的tick上进行测试，如果没有抛出`GameTestAssertException`，则会成功。如果`Runnable`在任何其他tick上成功，则将其标记为失败。

!!! 重要
    游戏测试每tick都会执行，直到测试被标记为成功。因此，在给定的tick上安排成功的方法必须小心，不要总是在之前的tick上失败。

#### 计划操作

并非所有操作都会在测试开始时发生。操作可以安排在特定的时间或间隔进行：

方法             | 描述
:---:            | :---
`#runAtTickTime` | 操作将在指定的tick上运行。
`#runAfterDelay` | 操作将在当前tick后`x`tick时运行。
`#onEachTick`    | 操作在每个tick都会运行。

#### 断言

在游戏测试期间的任何时候，都可以进行断言以检查给定条件是否为真。`GameTestHelper`中有许多断言方法；然而，它简化为在不满足适当状态时抛出`GameTestAssertException`。

### 生成的测试方法

如果需要动态生成游戏测试方法，则可以创建测试方法生成器。这些方法不接受任何参数，并返回一个`TestFunction`的集合。要识别测试方法生成器，它必须具有`@GameTestGenerator`注释：

```java
public class ExampleGameTests {
  @GameTestGenerator
  public static Collection<TestFunction> exampleTests() {
    // 返回一个TestFunction的集合
  }
}
```

#### TestFunction

`TestFunction`是`@GameTest`注释和运行测试的方法所包含的包装信息。

!!! 提示
    任何使用`@GameTest`注释的方法都会使用`GameTestRegistry#turnMethodIntoTestFunction`转换为`TestFunction`。该方法可以用作创建`TestFunction`的引用，而无需使用注释。

### 批量处理

游戏测试可以批量执行，而不是按注册顺序执行。可以通过提供相同的`GameTest#batch`字符串将测试添加到批次中。

批处理本身并没有提供任何有用的东西。但是，批处理可以用于在测试运行的当前存档上执行设置和拆卸（teardown）状态。这是通过用`@BeforeBatch`注释方法来完成的，用`@AfterBatch`来进行设置或拆卸。`#batch`方法必须与提供给游戏测试的字符串匹配。

批处理方法是`Consumer<ServerLevel>`引用，这意味着它们接受`ServerLevel`而不返回任何内容：

```java
public class ExampleGameTests {
  @BeforeBatch(batch = "firstBatch")
  public static void beforeTest(ServerLevel level) {
    // 进行设置（setup）
  }

  @GameTest(batch = "firstBatch")
  public static void exampleTest2(GameTestHelper helper) {
    // 做一些事情
  }
}
```

注册一个游戏测试
---------------

游戏测试必须注册后才能在游戏中运行。有两种方法：通过`@GameTestHolder`注释或`RegisterGameTestsEvent`。这两种注册方法仍然需要用`@GameTest`、`@GameTestGenerator`、`@BeforeBatch`或`@AfterBatch`对测试方法进行注释。

### GameTestHolder

`@GameTestHolder`注释注册类型（类、接口、枚举或记录）中的任何测试方法。`@GameTestHolder`包含一个具有多种用途的单一方法。在该实例中，提供的`#value`必须是模组的mod id；否则，测试将不会在默认配置下运行。

```java
@GameTestHolder(MODID)
public class ExampleGameTests {
  // ...
}
```

### RegisterGameTestsEvent

`RegisterGameTestsEvent`也可以使用`#register`注册类或方法。事件监听器必须[添加][event]到模组事件总线。以这种方式注册的测试方法必须在每个用`@GameTest`注释的方法上向`GameTest#templateNamespace`提供其mod id。

```java
// 在某个类中
public void registerTests(RegisterGameTestsEvent event) {
  event.register(ExampleGameTests.class);
}

// 在ExampleGameTests中
@GameTest(templateNamespace = MODID)
public static void exampleTest3(GameTestHelper helper) {
  // 进行设置（setup）
}
```

!!! 注意
    提供给`GameTestHolder#value`和`GameTest#templateNamespace`的值可能与当前的mod id不同。需要更改[buildscript][namespaces]中的配置。

结构模板
--------

游戏测试是在由结构或模板加载的场景中执行的。所有模板都定义了场景的尺寸以及将要加载的初始数据（方块和实体）。模板必须存储为`data/<namespace>/structures`中的`.nbt`文件。

!!! 提示
    可以使用结构方块创建和保存结构模板。

模板的位置由以下几个因素指定：

* 模板的命名空间是否被指定。
* 类是否应被加到模板的名称之前。
* 模板的名称是否被指定。

模板的命名空间由`GameTest#templateNamespace`确定，如果未指定则由`GameTestHolder#value`确定，如果两者都未指定则由`minecraft`确定。

如果将`@PrefixGameTestTemplate`应用于具有测试注释的类或方法并设置为`false`，则简单类名不会前置于模板的名称。否则，简单类名将变为小写并加上前缀，然后在模板名之前加上一个点。

模板的名称由`GameTest#template`决定。如果未指定，则使用方法的小写名称。

```java
// 所有结构的modid将为MODID
@GameTestHolder(MODID)
public class ExampleGameTests {

  // 类名已前置，模板名称未指定
  // 模板位置位于'modid:examplegametests.exampletest'
  @GameTest
  public static void exampleTest(GameTestHelper helper) { /*...*/ }

  // 类名未前置，模板名称未指定
  // 模板位置位于'modid:exampletest2'
  @PrefixGameTestTemplate(false)
  @GameTest
  public static void exampleTest2(GameTestHelper helper) { /*...*/ }

  // 类名已前置，模板名称已指定
  // 模板位置位于'modid:examplegametests.test_template'
  @GameTest(template = "test_template")
  public static void exampleTest3(GameTestHelper helper) { /*...*/ }

  // 类名未前置，模板名称已指定
  // 模板位置位于'modid:test_template2'
  @PrefixGameTestTemplate(false)
  @GameTest(template = "test_template2")
  public static void exampleTest4(GameTestHelper helper) { /*...*/ }
}
```

运行游戏测试
-----------

可以使用`/test`命令运行游戏测试。`test`命令具有高度可配置性；但是，只有少数几个对运行测试很重要：

子命令      | 描述
:---:       | :---
`run`       | 运行指定的测试：`run <test_name>`
`runall`    | 运行所有可用的测试。
`runthis`   | 运行离玩家15个方块内最近的测试。
`runthese`  | 运行离玩家200个方块内的测试。
`runfailed` | 运行上一次运行中失败的所有测试。

!!! 注意
    子命令跟在test命令后面：`/test <subcommand>`。

构建脚本（buildscript）配置
--------------------------

游戏测试在构建脚本（`build.gradle`文件）中提供额外的配置设置，以运行并集成到不同的设置中。

### 启用其他命名空间

如果构建脚本是[按照推荐的方式进行设置][buildscript]的，那么只会启用当前mod id下的游戏测试。要使其他命名空间能够从中加载游戏测试，运行配置必须将属性`forge.enabledGameTestNamespaces`设置为一个字符串，指定用逗号分隔的每个命名空间。如果属性为空或未设置，则将加载所有命名空间。

```gradle
// 在某个运行配置里面
property 'forge.enabledGameTestNamespaces', 'modid1,modid2,modid3'
```

!!! 警告
    命名空间之间不能有空格；否则，将无法正确加载命名空间。

### 游戏测试服务端运行配置

游戏测试服务端是一种运行构建服务端的特殊配置。构建服务端返回所需的失败游戏测试数的退出代码。所有失败的测试都被记录到日志，无论是必需的还是可选的。此服务端可以使用`gradlew runGameTestServer`运行。

### 在其他运行配置中启用游戏测试

默认情况下，只有`client`、`server`和`gameTestServer`运行配置启用了游戏测试。如果另一个运行配置应该运行游戏测试，则`forge.enableGameTest`属性必须设置为`true`。

```gradle
// 在一个运行配置里面
property 'forge.enableGameTest', 'true'
```

[test]: #running-game-tests
[namespaces]: #enabling-other-namespaces
[event]: ../concepts/events.md#creating-an-event-handler
[buildscript]: ../gettingstarted/index.md#simple-buildgradle-customizations
