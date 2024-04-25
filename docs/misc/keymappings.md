# Key Mappings

一个按键映射或键绑定定义了应与输入相关联的特定操作：鼠标单击、按键等。每当客户端可以接受输入时，都可以检查键映射定义的每个操作。 此外，每个按键映射都可以通过[控制选项菜单][控制]分配给任何输入。

## 注册一个`KeyMapping`

可以通过仅在物理客户端上监听 [**mod 事件总线**][modbus] 上的 `RegisterKeyMappingsEvent` 并调用 `#register` 来注册 `KeyMapping`。

```java
// 在某个仅限物理客户端的类中

// KeyMapping 是惰性初始化的，因此在注册之前它不存在
public static final Lazy<KeyMapping> EXAMPLE_MAPPING = Lazy.of(() -> /*...*/);

// 事件仅在物理客户端上的 mod 事件总线上
@SubscribeEvent
public void registerBindings(RegisterKeyMappingsEvent event) {
  event.register(EXAMPLE_MAPPING.get());
}
```

## 创建 `KeyMapping`

可以使用其构造函数创建 `KeyMapping`。`KeyMapping` 接受一个[翻译键][tk]，用于定义映射的名称，映射的默认输入以及在[控制选项菜单][controls]中将映射放置在其中的类别的[翻译键][tk]。

:::tip
可以通过提供未由原版提供的自定义类别 [翻译键][tk] 来将 `KeyMapping` 添加到自定义类别中。自定义类别翻译键应包含 mod id（例如 `key.categories.examplemod.examplecategory`）。
:::

### 默认输入

每个键映射都与一个默认输入关联。这是通过 `InputConstants$Key` 提供的。每个输入由一个 `InputConstants$Type` 组成，用于定义提供输入的设备，以及一个整数，用于定义设备上关联的标识符。

原版提供了三种输入类型：`KEYSYM`，它使用提供的 `GLFW` 键令定义键盘，`SCANCODE`，它使用平台特定的扫描码定义键盘，以及 `MOUSE`，它定义了鼠标。

:::note
强烈建议使用 `KEYSYM` 而不是 `SCANCODE` 用于键盘，因为 `GLFW` 键令与任何特定的系统无关。您可以在 [GLFW 文档][keyinput] 上阅读更多信息。
:::

整数取决于所提供的类型。所有输入代码都在 `GLFW` 中定义：`KEYSYM` 令牌以 `GLFW_KEY_*` 为前缀，而 `MOUSE` 代码以 `GLFW_MOUSE_*` 为前缀。

```java
new KeyMapping(
  "key.examplemod.example1", // 将使用此翻译键进行本地化
  InputConstants.Type.KEYSYM, // 默认映射在键盘上
  GLFW.GLFW_KEY_P, // 默认键为 P
  "key.categories.misc" // 映射将位于杂项类别中
)
```

:::note
如果键映射不应映射到默认键，则应将输入设置为 `InputConstants#UNKNOWN`。原版构造函数将要求您通过 `InputConstants$Key#getValue` 提取输入代码，而 Forge 构造函数可以提供原始输入字段。
:::

### `IKeyConflictContext`

并非所有映射都在每个上下文中使用。某些映射仅在 GUI 中使用，而其他映射则仅在游戏中使用。为了避免在不同上下文中使用相同键的映射相互冲突，可以分配一个 `IKeyConflictContext`。

每个冲突上下文都包含两种方法：`#isActive`，定义映射是否可以在当前游戏状态下使用，以及 `#conflicts`，定义映射是否与同一冲突上下文中的键或不同冲突上下文中的键冲突。

目前，Forge 通过 `KeyConflictContext` 定义了三个基本上下文：`UNIVERSAL`，默认为意味着键可以在每个上下文中使用，`GUI`，意味着映射只能在打开 `Screen` 时使用，以及 `IN_GAME`，意味着映射只能在未打开 `Screen` 时使用。可以通过实现 `IKeyConflictContext` 来创建新的冲突上下文。

```java
new KeyMapping(
  "key.examplemod.example2",
  KeyConflictContext.GUI, // 只能在打开屏幕时使用映射
  InputConstants.Type.MOUSE, // 默认映射在鼠标上
  GLFW.GLFW_MOUSE_BUTTON_LEFT, // 默认鼠标输入为左键
  "key.categories.examplemod.examplecategory" // 映射将位于新示例类别中
)
```

### `KeyModifier`

模组可能不希望映射在按下修饰键时具有相同的行为（例如 `G` vs `CTRL + G`）。为解决这个问题，Forge 在构造函数中添加了一个额外的参数，以接受一个 `KeyModifier`，该修饰符可以应用控制（`KeyModifier#CONTROL`）、shift（`KeyModifier#SHIFT`）或 alt（`KeyModifier#ALT`）到任何输入。`KeyModifier#NONE` 是默认值，不会应用任何修饰符。

可以通过按住修饰键和相关输入来将修饰符添加到[控制选项菜单][controls]中。

```java
new KeyMapping(
  "key.examplemod.example3",
  KeyConflictContext.UNIVERSAL,
  KeyModifier.SHIFT, // 默认映射需要按住 shift
  InputConstants.Type.KEYSYM, // 默认映射在键盘上
  GLFW.GLFW_KEY_G, // 默认键为 G
  "key.categories.misc"
)
```

## 检查 `KeyMapping`

可以检查 `KeyMapping` 来查看是否已单击它。根据何时，映射可以在条件中用于应用相关逻辑。

### 在游戏中

在游戏中，应通过监听[**Forge 事件总线**][forgebus]上的 `ClientTickEvent` 并在 while 循环中检查 `KeyMapping#consumeClick` 来检查映射是否已被单击。`#consumeClick` 仅在执行输入的次数且尚未处理之前返回 `true`，因此不会

无限制地阻止游戏。

```java
// 事件仅在 Forge 事件总线上的物理客户端上
public void onClientTick(ClientTickEvent event) {
  if (event.phase == TickEvent.Phase.END) { // 由于每个刻度事件都调用两次，因此只调用一次代码
    while (EXAMPLE_MAPPING.get().consumeClick()) {
      // 在此处执行单击时要执行的逻辑
    }
  }
}
```

:::caution
不要将 `InputEvent` 用作 `ClientTickEvent` 的替代方案。键盘和鼠标输入各有单独的事件，因此它们不会处理任何额外的输入。
:::

### 在 GUI 内

在 GUI 中，可以在 `GuiEventListener` 方法之一中使用 `IForgeKeyMapping#isActiveAndMatches` 检查映射。可以检查的最常见方法是 `#keyPressed` 和 `#mouseClicked`。

`#keyPressed` 接受 `GLFW` 键令、平台特定的扫描码以及按下的修饰键的位字段。可以通过使用 `InputConstants#getKey` 创建输入来将键与映射进行检查。修饰符已经在映射方法本身中进行了检查。

```java
// 在某个 Screen 子类中
@Override
public boolean keyPressed(int key, int scancode, int mods) {
  if (EXAMPLE_MAPPING.get().isActiveAndMatches(InputConstants.getKey(key, scancode))) {
    // 在此处执行按键按下时要执行的逻辑
    return true;
  }
  return super.keyPressed(x, y, button);
} 
```

:::note
如果您不拥有要检查 **键** 的屏幕，则可以监听[**Forge 事件总线**][forgebus]上的 `ScreenEvent$KeyPressed` 的 `Pre` 或 `Post` 事件。
:::

`#mouseClicked` 接受鼠标的 x 位置、y 位置和单击的按钮。鼠标按钮可以使用 `InputConstants$Type#getOrCreate` 与 `MOUSE` 输入创建输入进行与映射的检查。

```java
// 在某个 Screen 子类中
@Override
public boolean mouseClicked(double x, double y, int button) {
  if (EXAMPLE_MAPPING.get().isActiveAndMatches(InputConstants.TYPE.MOUSE.getOrCreate(button))) {
    // 在此处执行鼠标单击时要执行的逻辑
    return true;
  }
  return super.mouseClicked(x, y, button);
} 
```

:::note
如果您不拥有要检查 **鼠标** 的屏幕，则可以监听[**Forge 事件总线**][forgebus]上的 `ScreenEvent$MouseButtonPressed` 的 `Pre` 或 `Post` 事件。
:::

[modbus]: ../concepts/events.md#event-buses
[controls]: https://minecraft.fandom.com/wiki/Controls
[tk]: ../resources/client/i18n.md#components
[keyinput]: https://www.glfw.org/docs/3.3/input_guide.html#input_key
[forgebus]: ../concepts/events.md#registering-an-event-handler
