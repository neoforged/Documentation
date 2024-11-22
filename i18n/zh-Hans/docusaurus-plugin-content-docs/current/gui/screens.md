## 屏幕

在 Minecraft 中，屏幕通常是所有图形用户界面（GUI）的基础，用于接收用户输入、在服务器上验证输入，并将结果同步回客户端。它们可以与[菜单](menus)结合使用，创建用于类似库存的视图的通信网络，或者它们可以是独立的，由模组开发者通过自己的[网络](../networking/index.md)实现来处理。

屏幕由许多部分组成，这使得理解“屏幕”在 Minecraft 中实际上是什么变得困难。因此，本文档将介绍屏幕的每个组件以及它是如何应用的，然后讨论屏幕本身。

## 相对坐标

无论何时渲染任何东西，都需要一些标识符来指定其出现的位置。使用许多抽象化，Minecraft 的大多数渲染调用在一个坐标平面上接收 x、y 和 z 值。X 值从左到右增加，y 值从上到下增加，z 值从远到近增加。但是，这些坐标不是固定的范围。它们可以根据屏幕的大小和在选项中指定的比例而变化。因此，必须特别注意确保在渲染时的坐标值相对于可变的屏幕大小适当缩放。

有关如何使您的坐标相对的信息将在[屏幕](#屏幕)部分中提供。

:::caution
如果选择使用固定坐标或不正确地缩放屏幕，则渲染的对象可能会看起来奇怪或错位。检查坐标是否正确相对化的简单方法是单击您的视频设置中的“GUI 比例”按钮。此值用作除数以确定 GUI 应以哪个比例渲染。
:::

## GUI 图形

Minecraft 中渲染的任何 GUI 通常都是使用 `GuiGraphics` 进行的。`GuiGraphics` 是几乎所有渲染方法的第一个参数；它包含用于渲染常用对象的基本方法。这些方法分为五类：彩色矩形、字符串和纹理、物品和工具提示。还有一个用于渲染组件的额外方法（`#enableScissor` / `#disableScissor`）。`GuiGraphics` 还公开了 `PoseStack`，它应用了必要的转换，以便将组件正确渲染到屏幕上。此外，颜色采用[ARGB](https://en.wikipedia.org/wiki/RGBA_color_model#ARGB32)格式。

### 彩色矩形

通过位置颜色着色器绘制彩色矩形。可以绘制三种类型的彩色矩形。

首先是水平和垂直的一像素宽线，分别是 `#hLine` 和 `#vLine`。`#hLine` 接受两个 x 坐标，定义了左侧和右侧（包括在内），顶部 y 坐标和颜色。`#vLine` 接受左侧 x 坐标、两个 y 坐标，定义了顶部和底部（包括在内），以及颜色。

其次是 `#fill` 方法，它绘制一个矩形到屏幕上。线方法内部调用此方法。它接受左侧 x 坐标、顶部 y 坐标、右侧 x 坐标、底部 y 坐标和颜色。

最后是 `#fillGradient` 方法，它绘制一个具有垂直渐变的矩形。它接受右侧 x 坐标、底部 y 坐标、左侧 x 坐标、顶部 y 坐标、z 坐标、底部和顶部颜色。

### 字符串

字符串通过其 `Font` 绘制，通常包含正常、透明和偏移模式的自己的着色器。可以渲染两种对齐的字符串，每种字符串都带有背景阴影：左对齐字符串 (`#drawString`) 和居中对齐字符串 (`#drawCenteredString`)。这两种方法都接受要绘制字符串的字体、字符串本身、x 坐标（分别是字符串的左侧或中心）、顶部 y 坐标和颜色。

:::note
字符串通常应该作为 [`Component`](../resources/client/i18n.md#components) 传递，因为它们处理各种用例，包括该方法的其他两个重载。
:::

### 纹理

纹理通过贴图绘制，因此方法名为 `#blit`，在这种情况下，它复制图像的

位并直接将其绘制到屏幕上。这些是通过位置纹理着色器绘制的。虽然有许多不同的 `#blit` 重载，但我们只讨论两种静态 `#blit`。

第一个静态 `#blit` 接受六个整数，假定正在渲染的纹理位于一个 256 x 256 的 PNG 文件中。它接受左侧 x 和顶部 y 屏幕坐标，PNG 内部的左侧 x 和顶部 y 坐标，以及要渲染的图像的宽度和高度。

:::tip
必须指定 PNG 文件的大小，以便将坐标归一化为获取关联的 UV 值。
:::

第一个调用的静态 `#blit` 将此扩展为九个整数，仅假定图像位于 PNG 文件中。它接受左侧 x 和顶部 y 屏幕坐标，z 坐标（称为 blit 偏移量），PNG 内部的左侧 x 和顶部 y 坐标，要渲染的图像的宽度和高度，以及 PNG 文件的宽度和高度。

#### Blit 偏移量

在渲染纹理时，z 坐标通常设置为 blit 偏移量。偏移量负责在查看屏幕时正确分层渲染。具有较小 z 坐标的渲染在背景中渲染，反之，具有较大 z 坐标的渲染在前景中渲染。可以通过 `#translate` 方法直接在 `PoseStack` 本身上设置 z 偏移量。一些 `GuiGraphics` 方法内部应用了一些基本的偏移逻辑（例如物品渲染）。

:::caution
设置 blit 偏移量时，必须在渲染对象完成后重置它。否则，屏幕中的其他对象可能会以不正确的层次渲染，导致图形问题。建议在平移前推送当前姿势，然后在所有以偏移量渲染的对象完成后弹出。
:::

## 可渲染对象

`Renderable` 实际上是指可以被渲染的对象。这些包括屏幕、按钮、聊天框、列表等。`Renderable` 只有一个方法：`#render`。此方法接受用于将事物渲染到屏幕上的 `GuiGraphics`、鼠标的 x 和 y 位置（按相对屏幕大小缩放）、以及帧之间的时间差（自上一帧以来经过了多少个 tick）。

一些常见的可渲染对象是屏幕和“小部件”：通常渲染在屏幕上的可交互元素，如 `Button`、它的子类型 `ImageButton`，以及 `EditBox`，用于在屏幕上输入文本。

## GUI 事件侦听器

Minecraft 中呈现的任何屏幕都实现了 `GuiEventListener`。`GuiEventListener` 负责处理用户与屏幕的交互。这些包括鼠标（移动、点击、释放、拖动、滚动、悬停）和键盘（按下、释放、键入）的输入。每个方法返回关联动作是否成功地影响了屏幕。按钮、聊天框、列表等小部件也实现了此接口。

### 容器事件处理程序

与 `GuiEventListener` 几乎同义的是它们的子类型：`ContainerEventHandler`。这些负责处理在包含小部件的屏幕上的用户交互，管理当前聚焦的是哪个小部件以及如何应用相关交互。`ContainerEventHandler` 添加了三个额外功能：可交互的子元素、拖动和聚焦。

事件处理程序保存了子元素，用于确定元素的交互顺序。在鼠标事件处理程序中（不包括拖动），鼠标悬停在上面的第一个子元素将执行其逻辑。

通过鼠标拖动元素，通过 `#mouseClicked` 和 `#mouseReleased` 实现更精确的逻辑。

聚焦允许首先检查特定的子元素，并在事件执行期间处理它，例如在键盘事件或拖动鼠标期间。焦点通常通过 `#setFocused` 设置。此外，可以使用 `#nextFocusPath` 循环可交互的子元素，选择基于传递的 `FocusNavigationEvent` 的子元素。

:::note
屏幕通过 `AbstractContainerEventHandler` 实现了 `ContainerEventHandler`，它添加了拖动和聚焦子元素的设置和获取逻辑。
:::

## NarratableEntry

`NarratableEntry` 是可以通过 Minecraft 的辅助功能叙述功能讲述的元素。每个元素可以根据悬停或选择的内容提供不同的叙述，通常由焦点、悬停，然后是所有其他情况优先。

`NarratableEntry` 有三个方法：确定元素的优先级的一个方法 (`#narrationPriority`)，确定是否说出叙述的一个方法 (`#isActive`)，最后是向其关联输出提供叙述的一个方法 (`#updateNarration`)。

:::note
Minecraft 中的所有小部件都是 `NarratableEntry`，因此通常不需要手动实现它，如果使用可用的子类型。
:::

## 屏幕子类型

有了上述所有知识，就可以构建一个基本的屏幕了。为了更方便理解，屏幕的组件将按照它们通常出现的顺序而被提及。

首先，所有的屏幕都需要一个组件 `Component` 来表示屏幕的标题。这个组件通常由其子类型绘制到屏幕上。它仅在基本屏幕中用于叙述消息。

```java
// 在某个屏幕的子类中
public MyScreen(Component title) {
    super(title);
}
```

### 初始化

屏幕初始化后，将调用 `#init` 方法。`#init` 方法设置屏幕的初始设置，从 `ItemRenderer` 和 `Minecraft` 实例到由游戏缩放的相对宽度和高度。在这个方法中进行任何设置，比如添加小部件或预计算相对坐标。如果游戏窗口大小改变，将通过调用 `#init` 方法来重新初始化屏幕。

有三种方法可以向屏幕添加小部件，每种方法都有不同的作用：

方法                 | 描述
:---:                | :---
`#addWidget`         | 添加一个可交互且叙述的小部件，但不渲染。
`#addRenderableOnly` | 添加一个仅渲染的小部件；不可交互也不叙述。
`#addRenderableWidget` | 添加一个既可交互、叙述又可渲染的小部件。

通常情况下，最常用的是 `#addRenderableWidget`。

```java
// 在某个屏幕的子类中
@Override
protected void init() {
    super.init();

    // 添加小部件和预计算的值
    this.addRenderableWidget(new EditBox(/* ... */));
}
```

### 屏幕更新

屏幕也会使用 `#tick` 方法进行更新，以执行一些用于渲染目的的客户端逻辑。最常见的示例是用于闪烁光标的 `EditBox`。

```java
// 在某个屏幕的子类中
@Override
public void tick() {
    super.tick();

    // 添加 EditBox 中的更新逻辑
    this.editBox.tick();
}
```

### 输入处理

由于屏幕是 `GuiEventListener` 的子类型，输入处理程序也可以被覆盖，例如处理特定的[按键][keymapping]逻辑。

### 屏幕渲染

最后，屏幕通过作为 `Renderable` 子类型而提供的 `#render` 方法进行渲染。正如前面提到的，`#render` 方法在每一帧绘制屏幕上的所有内容，比如背景、小部件、工具提示等。默认情况下，`#render` 方法只会将小部件渲染到屏幕上。

屏幕中通常不由子类型处理的两个最常见的渲染内容是背景和工具提示。

背景可以使用 `#renderBackground` 进行渲染，其中一个方法接受一个 v 偏移量，用于在渲染屏幕时绘制选项背景，当背后的级别无法显示时使用。

工具提示通过 `GuiGraphics#renderTooltip` 或 `GuiGraphics#renderComponentTooltip` 进行渲染，它们可以接受正在渲染的文本组件、可选的自定义工具提示组件以及工具提示应该在屏幕上渲染的 x / y 相对坐标。

```java
// 在某个屏幕的子类中

// mouseX 和 mouseY 表示光标在屏幕上的缩放坐标
@Override
public void render(GuiGraphics graphics, int mouseX, int mouseY, float partialTick) {
    // 通常首先渲染背景
    this.renderBackground(graphics);

    // 在小部件之前渲染东西（背景纹理）

    // 如果这是屏幕的直接子类，则渲染小部件
    super.render(graphics, mouseX, mouseY, partialTick);

    // 在小部件之后渲染东西（工具提示）
}
```

### 关闭屏幕

当屏幕关闭时，两个方法处理清理工作：`#onClose` 和 `#removed`。

`#onClose` 在用户输入关闭当前屏幕时调用。通常用作销毁和保存屏幕内部流程的回调。这包括向服务器发送数据包。

`#removed` 在屏幕改变之前调用，并释放给垃圾收集器。这处理任何在屏幕打开之前未重置回初始状态的内容。

```java
// 在某个屏幕的子类中

@Override
public void onClose() {
    // 在这里停止任何处理程序

    // 最后调用，以防干扰覆盖
    super.onClose();
}

@Override
public void removed() {
    // 在这里重置初始状态

    // 最后调用，以防干扰覆盖
    super.removed()
;}
```

## `AbstractContainerScreen`

如果一个屏幕直接附加到一个[菜单][menus]上，则应该使用 `AbstractContainerScreen` 的子类。`AbstractContainerScreen` 作为菜单的渲染器和输入处理程序，并包含与插槽同步和交互的逻辑。因此，通常只需要覆盖或实现两个方法，就可以有一个可工作的容器屏幕。再次强调，为了更易于理解，容器屏幕的组件将按照它们通常出现的顺序进行说明。

通常，`AbstractContainerScreen` 需要三个参数：被打开的容器菜单（由泛型 `T` 表示）、玩家库存（仅用于显示名称

）和屏幕本身的标题。在这里，可以设置一些定位字段：

字段             | 描述
:---:             | :---
`imageWidth`      | 背景使用的纹理的宽度。这通常位于一个 256 x 256 的 PNG 内，默认为 176。
`imageHeight`     | 背景使用的纹理的高度。这通常位于一个 256 x 256 的 PNG 内，默认为 166。
`titleLabelX`     | 屏幕标题将被渲染的相对 x 坐标。
`titleLabelY`     | 屏幕标题将被渲染的相对 y 坐标。
`inventoryLabelX` | 玩家库存名称将被渲染的相对 x 坐标。
`inventoryLabelY` | 玩家库存名称将被渲染的相对 y 坐标。

:::caution
在前面的部分中，提到应该在 `#init` 方法中设置预计算的相对坐标。这仍然适用，因为这里提到的值不是预计算的坐标，而是静态值和相对化的坐标。

图像值是静态且不变的，因为它们代表背景纹理的大小。为了在渲染时更方便，`#init` 方法中预计算了两个附加值 (`leftPos` 和 `topPos`)，标记了背景将被渲染的左上角位置。标签坐标是相对于这些值的。

`leftPos` 和 `topPos` 也被用作渲染背景的便捷方式，因为它们已经表示传递到 `#blit` 方法的位置。
:::caution

```java
// 在某个 AbstractContainerScreen 子类中
public MyContainerScreen(MyMenu menu, Inventory playerInventory, Component title) {
    super(menu, playerInventory, title);

    this.titleLabelX = 10;
    this.inventoryLabelX = 10;

    /*
     * 如果 'imageHeight' 被改变，'inventoryLabelY' 也必须被
     * 改变，因为该值取决于 'imageHeight' 的值。
     */
}
```

### 菜单访问

由于菜单被传递到屏幕中，现在可以通过 `menu` 字段访问任何在菜单中并通过插槽、数据插槽或自定义系统同步的值。

### 容器更新

当玩家活着并且正在查看屏幕时，容器屏幕在 `#tick` 方法中进行更新，通过 `#containerTick` 进行。这基本上取代了容器屏幕内部的 `#tick` 方法，最常见的用法是进行食谱书的更新。

```java
// 在某个 AbstractContainerScreen 子类中
@Override
protected void containerTick() {
    super.containerTick();

    // 在这里更新内容
}
```

### 渲染容器屏幕

容器屏幕的渲染涉及三种方法：`#renderBg`，用于渲染背景纹理，`#renderLabels`，用于在背景上方渲染任何文本，以及 `#render`，它包含前两种方法，并提供了一个灰色背景和工具提示。

从 `#render` 开始，最常见的覆盖（通常是唯一的情况）添加了背景，调用 super 来渲染容器屏幕，并最后在其上渲染工具提示。

```java
// 在某个 AbstractContainerScreen 子类中
@Override
public void render(GuiGraphics graphics, int mouseX, int mouseY, float partialTick) {
    this.renderBackground(graphics);
    super.render(graphics, mouseX, mouseY, partialTick);

    /*
     * 这个方法由容器屏幕添加，用于渲染鼠标悬停插槽的工具提示。
     */
    this.renderTooltip(graphics, mouseX, mouseY);
}
```

在 super 中，调用了 `#renderBg` 来渲染屏幕的背景。最标准的表示使用了三个方法调用：两个用于设置，一个用于绘制背景纹理。

```java
// 在某个 AbstractContainerScreen 子类中

// 背景纹理的位置（assets/<namespace>/<path>）
private static final ResourceLocation BACKGROUND_LOCATION = new ResourceLocation(MOD_ID, "textures/gui/container/my_container_screen.png");

@Override
protected void renderBg(GuiGraphics graphics, float partialTick, int mouseX, int mouseY) {
    /*
     * 设置着色器使用的纹理位置。虽然最多可以设置12个纹理，但 'blit' 中使用的着色器
     * 只查看第一个纹理索引。
     */
    RenderSystem.setShaderTexture(0, BACKGROUND_LOCATION);

    /*
     * 将背景纹理渲染到屏幕上。'leftPos' 和 'topPos' 应该已经表示纹理应该渲染的
     * 左上角位置，因为它们是从 'imageWidth' 和 'imageHeight' 预计算出来的。两个
     * 零表示在 256 x 256 PNG 文件内的整数 u/v 坐标。
     */
    graphics.blit(BACKGROUND_LOCATION, this.leftPos, this.topPos, 0, 0, this.imageWidth, this.imageHeight);
}
```

最后，调用 `#renderLabels` 来在背景上方但工具提示下方渲染任何文本。这简单地使用字体来绘制关联的组件。

```java
// 在某个 AbstractContainerScreen 子类中
@Override
protected void renderLabels(GuiGraphics graphics, int mouseX, int mouseY) {
    super.renderLabels(graphics, mouseX, mouseY);

    // 假设我们有一些 Component 'label'
    // 'label' 将被绘制在 'labelX' 和 'labelY' 处
    graphics.drawString(this.font, this.label, this.labelX, this.labelY, 0x404040);
}
```

:::note
在渲染标签时，**不需要**指定 `leftPos` 和 `topPos` 偏移量。这些已经在 `PoseStack` 中被转换，因此该方法内的所有内容都相对于这些坐标进行绘制。
:::

## 注册 AbstractContainerScreen

要将 `AbstractContainerScreen` 与菜单一起使用，需要对其进行注册。可以在 [**mod 事件总线**][modbus] 的 `RegisterMenuScreensEvent` 中调用 `register` 方法来完成。

```java
// 事件在 mod 事件总线上监听
private void registerScreens(RegisterMenuScreensEvent event) {
    event.register(MY_MENU.get(), MyContainerScreen::new);
}
```

[menus]: ./menus.md
[network]: ../networking/index.md
[screen]: #the-screen-subtype
[argb]: https://en.wikipedia.org/wiki/RGBA_color_model#ARGB32
[component]: ../resources/client/i18n.md#components
[keymapping]: ../misc/keymappings.md#inside-a-gui
[modbus]: ../concepts/events.md#event-buses
