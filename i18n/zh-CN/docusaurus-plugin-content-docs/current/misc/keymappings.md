# 键盘布局

键盘布局（键映射）或键盘绑定定义了应与输入绑定的特定操作：鼠标单击、按键等。每当客户端可以进行输入时，都可以检查键盘布局定义的每个操作。此外，每个键盘布局都可以通过[控制选项菜单][controls]分配给任何输入。

## 注册一个`KeyMapping`

`KeyMapping`可以通过仅在物理客户端上监听[**模组事件总线**][modbus]上的`RegisterKeyMappingsEvent`并调用`#register`来注册。

```java
// 在某个仅物理客户端的类中

// 键盘布局是延迟初始化的，因此在注册之前它不存在
public static final Lazy<KeyMapping> EXAMPLE_MAPPING = Lazy.of(() -> /*...*/);

// 事件仅在物理客户端上的模组事件总线上
@SubscribeEvent
public void registerBindings(RegisterKeyMappingsEvent event) {
  event.register(EXAMPLE_MAPPING.get());
}
```

## 创建一个`KeyMapping`

`KeyMapping`可以使用其构造函数创建。`KeyMapping`接受一个定义映射名称的[翻译键][tk]，映射的默认输入，以及定义映射将放在[控制选项菜单][controls]中的类别的[翻译键][tk]。

:::tip
    通过提供原版未提供的类别[翻译键][tk]，可以将`KeyMapping`添加到自定义类别中。自定义类别转换键应包含mod id（例如`key.categories.examplemod.examplecategory`）。
:::

### 默认输入

每个键映射都有一个与其关联的默认输入。这是通过`InputConstants$Key`提供的。每个输入由一个`InputConstants$Type`和一个整数组成，前者定义了提供输入的设备，后者定义了设备上输入的相关标识符。

原版提供三种类型的输入：`KEYSYM`，通过提供的`GLFW`键标记定义键盘，`SCANCODE`，通过平台特定扫描码定义键盘，以及`MOUSE`，定义鼠标。

:::caution
    强烈建议键盘使用`KEYSYM`而不是`SCANCODE`，因为`GLFW`键令牌不与任何特定系统绑定。你可以在[GLFW文档][keyinput]上阅读更多内容。
:::

整数取决于提供的类型。所有输入代码都在`GLFW`中定义：`KEYSYM`令牌以`GLFW_KEY_*`为前缀，而`MOUSE`代码以`GLFW_MOUSE_*`作为前缀。

```java
new KeyMapping(
  "key.examplemod.example1", // 将使用该翻译键进行本地化
  InputConstants.Type.KEYSYM, // 在键盘上的默认映射
  GLFW.GLFW_KEY_P, // 默认键为P
  "key.categories.misc" // 映射将在杂项（misc）类别中
)
```

:::caution
    如果键映射不应映射到默认值，则应将输入设置为`InputConstants#UNKNOWN`。原版构造函数将要求你通过`InputConstants$Key#getValue`提取输入代码，而Forge构造函数可以提供原始输入字段。
:::

### `IKeyConflictContext`

并非所有映射都用于每个上下文。有些映射仅在GUI中使用，而另一些映射仅在游戏中使用。为了避免在不同上下文中使用的同一键的映射相互冲突，可以分配`IKeyConflictContext`。

每个冲突上下文包含两种方法：`#isActive`，定义映射是否可以在当前游戏状态下使用；`#conflicts`，定义在相同或不同的冲突上下文中映射是否与键冲突。

目前，Forge通过`KeyConflictContext`定义了三个基本上下文：`UNIVERSAL`，这是默认的，意味着密钥可以在每个上下文中使用；`GUI`，这意味着映射只能在`Screen`打开时使用；`IN_GAME`，意味着映射只有在`Screen`未打开时才能使用。可以通过实现`IKeyConflictContext`来创建新的冲突上下文。

```java
new KeyMapping(
  "key.examplemod.example2",
  KeyConflictContext.GUI, // 映射只能在当一个屏幕打开时使用
  InputConstants.Type.MOUSE, // 在鼠标上的默认映射
  GLFW.GLFW_MOUSE_BUTTON_LEFT, // 在鼠标左键上的默认鼠标输入
  "key.categories.examplemod.examplecategory" // 映射将在新的示例类别中
)
```

### `KeyModifier`

如果修改键保持不变（例如`G`与`CTRL + G`），则修改器可能不希望映射具有相同的行为。为了解决这个问题，Forge在构造函数中添加了一个额外的参数来接受一个`KeyModifier`，它可以将control（`KeyModifier#CONTROL`）、shift（`KeyModifier#SHIFT`）或alt（`KeyModifier#ALT`）映射到任何输入。`KeyModifier#NONE`是默认值，不会应用任何修改器。

通过接纳修饰符键和相关输入，可以在[控制选项菜单][controls]中添加修改器。

```java
new KeyMapping(
  "key.examplemod.example3",
  KeyConflictContext.UNIVERSAL,
  KeyModifier.SHIFT, // 默认映射要求shift被按下
  InputConstants.Type.KEYSYM, // 默认映射在键盘上
  GLFW.GLFW_KEY_G, // 默认键为G
  "key.categories.misc"
)
```

## 检查一个`KeyMapping`

可以检查`KeyMapping`以查看它是否已被单击。根据时间的不同，可以在条件中使用映射来应用关联的逻辑。

### 在游戏内

在游戏内，应通过在[**Forge事件总线**][forgebus]上监听`ClientTickEvent`并在while循环中检查`KeyMapping#consumeClick`来检查映射。`#consumeClick`仅当输入已执行但之前尚未处理的次数时才会返回`true`，因此不会无限拖延游戏。

```java
// 事件仅在物理客户端上的Forge事件总线上
public void onClientTick(ClientTickEvent event) {
  if (event.phase == TickEvent.Phase.END) { // 仅调用代码一次，因为tick事件在每个tick调用两次
    while (EXAMPLE_MAPPING.get().consumeClick()) {
      // 在此处执行单击时的逻辑
    }
  }
}
```

:::danger
    不要将`InputEvent`用作`ClientTickEvent`的替代项。只有键盘和鼠标输入有单独的事件，所以它们不会处理任何额外的输入。
:::

### Inside a GUI

在GUI内，可以使用`IForgeKeyMapping#isActiveAndMatches`在其中一个`GuiEventListener`方法中检查映射。可以检查的最常见方法是`#keyPressed`和`#mouseClicked`。

`#keyPressed`接收`GLFW`键令牌、特定于平台的扫描代码和按下的修改器的位字段。通过使用`InputConstants#getKey`创建输入，可以根据映射检查键。修改器已经在映射方法本身中进行了检查。

```java
// 在某个Screen子类中
@Override
public boolean keyPressed(int key, int scancode, int mods) {
  if (EXAMPLE_MAPPING.get().isActiveAndMatches(InputConstants.getKey(key, scancode))) {
    // 在此处执行按键时的逻辑
    return true;
  }
  return super.keyPressed(x, y, button);
} 
```

:::caution
    如果你不拥有要检查**键**的屏幕，你可以在[**Forge事件总线**][forgebus]上监听`ScreenEvent$KeyPressed`的`Pre`或`Post`事件。
:::

`#mouseClicked`获取鼠标的x位置、y位置和单击的按钮。通过使用带有`MOUSE`输入的`InputConstants$Type#getOrCreate`创建输入，可以根据映射检查鼠标按钮。

```java
// 在某个Screen子类中
@Override
public boolean mouseClicked(double x, double y, int button) {
  if (EXAMPLE_MAPPING.get().isActiveAndMatches(InputConstants.TYPE.MOUSE.getOrCreate(button))) {
    // 在此处执行鼠标单击时的逻辑
    return true;
  }
  return super.mouseClicked(x, y, button);
} 
```

:::caution
    如果你不拥有要检查**鼠标**的屏幕，你可以在[**Forge事件总线**][forgebus]上监听`ScreenEvent$MouseButtonPressed`的`Pre`或`Post`事件。
:::

[modbus]: ../concepts/events.md#mod-event-bus
[controls]: https://minecraft.wiki/w/Options#Controls
[tk]: ../concepts/internationalization.md#translatablecontents
[keyinput]: https://www.glfw.org/docs/3.3/input_guide.html#input_key
[forgebus]: ../concepts/events.md#creating-an-event-handler
