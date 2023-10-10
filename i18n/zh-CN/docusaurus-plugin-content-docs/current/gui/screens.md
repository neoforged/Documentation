# 屏幕（Screens）

屏幕通常是Minecraft中所有图形用户界面（GUI）的基础：接收用户输入，在服务端上验证，并将生成的操作同步回客户端。它们可以与[菜单（Menus）][menus]相结合，为类似物品栏的视图创建通信网络，也可以是独立的，模组开发者可以通过自己的[网络][network]实现来处理。

屏幕由许多部分组成，因此很难完全理解Minecraft中的“屏幕”到底是什么。因此，在讨论屏幕本身之前，本文档将介绍屏幕的每个组件及其应用方式。

## 相对坐标

每当渲染任何东西时，都需要有一些标识符来指定它将出现的位置。通过大量的抽象，Minecraft的大多数渲染调用都在坐标平面中采用x、y和z值。x值从左到右递增，y从上到下递增，z从远到近递增。但是，坐标并不是固定在指定的范围内。它们可以根据屏幕的大小和选项中指定的比例进行更改。因此，在渲染时必须格外小心，以确保坐标值正确缩放到可更改的屏幕大小。

关于如何将坐标相对化的信息将在[屏幕][screen]部分中呈现。

!!! 重要
    如果选择使用固定坐标或不正确地缩放屏幕，则渲染的对象可能看起来很奇怪或错位。检查坐标是否正确相对化的一个简单方法是单击视频设置中的“Gui比例”按钮。在确定GUI渲染的比例时，此值用作显示器宽度和高度的除数。

## Gui图形

Minecraft渲染的任何GUI通常都是使用`GuiGraphics`完成的。`GuiGraphics`是几乎所有渲染方法的第一个参数；它包含渲染常用对象的基本方法。它们分为五类：彩色矩形、字符串、纹理、物品和提示信息。还有一种用于呈现组件片段的附加方法（`#enableScissor`/`#disableScissor`）。`GuiGraphics`还公开了`PoseStack`，它应用了正确渲染组件所需的转换。此外，颜色采用[ARGB][argb]格式。

### 彩色矩形

彩色矩形是通过位置颜色着色器绘制的。有三种类型的彩色矩形可以绘制。

首先，有一条彩色的水平和垂直一像素宽的线，分别为`#hLine`和`#vLine`。`#hLine`接受两个x坐标，定义左侧和右侧（包括）、顶部y坐标和颜色。`#vLine`接受左侧的x坐标、定义顶部和底部（包括）的两个y坐标以及颜色。

其次，还有`#fill`方法，它在屏幕上绘制一个矩形。Line方法在内部调用此方法。其接受左x坐标、上y坐标、右x坐标、下y坐标和颜色。

最后，还有`#fillGradient`方法，它绘制一个具有垂直梯度的矩形。这包括右x坐标、下y坐标、左x坐标、上y坐标、z坐标以及底部和顶部的颜色。

### 字符串

字符串是通过其`Font`绘制的，通常由它们自己的普通、透视和偏移模式的着色器组成。可以渲染两种对齐的字符串，每种都有一个后阴影：左对齐字符串（`#drawString`）和居中对齐字符串（`#drawCenteredString`）。这两者都采用了字符串将被渲染的字体、要绘制的字符串、分别表示字符串左侧或中心的x坐标、顶部的y坐标和颜色。

:::caution
    字符串通常应作为[`Component`][component]传入，因为它们处理各种用例，包括方法的另外两个重载。
:::

### 纹理

纹理是通过blitting的方式绘制的，因此方法名为`#blit`，为此，它复制图像的比特并将其直接绘制到屏幕上。这些是通过位置纹理着色器绘制的。虽然有许多不同的`#blit`重载，但我们只讨论两个静态的`#blit`。

第一个静态`#blit`取六个整数，并假设渲染的纹理位于256 x 256 PNG文件上。它接受左侧x和顶部y屏幕坐标，PNG中的左侧x和底部y坐标，以及要渲染的图像的宽度和高度。

:::caution
    必须指定PNG文件的大小，以便可以规范化坐标以获得关联的UV值。
:::

第一个`#blit`所调用的另一个静态`#blit`将参数扩展为九个整数，仅假设图像位于PNG文件上。它获取左侧x和顶部y屏幕坐标、z坐标（称为blit偏移）、PNG中的左侧x和上部y坐标、要渲染的图像的宽度和高度以及PNG文件的宽度和高。

#### Blit偏移

渲染纹理时的z坐标通常设置为blit偏移。偏移量负责在查看屏幕时对渲染进行适当分层。z坐标较小的渲染在背景中渲染，反之亦然，z坐标较大的渲染在前景中渲染。z偏移量可以通过`#translate`直接设置在`PoseStack`本身上。一些基本的偏移逻辑在`GuiGraphics`的某些方法（例如物品渲染）中内部应用。

!!! 重要
    设置blit偏移时，必须在渲染对象后重置它。否则，屏幕内的其他对象可能会在不正确的层中渲染，从而导致图形问题。建议在平移前推动当前姿势，然后在偏移处完成所有渲染后弹出。

## Renderable

`Renderable`本质上是被渲染的对象。其中包括屏幕、按钮、聊天框、列表等。`Renderable`只有一个方法：`#render`。这需要用于将十五渲染到屏幕上的`GuiGraphics`，以正确渲染可渲染的、缩放到相对屏幕大小的鼠标的x和y位置，以及游戏刻增量（自上一帧以来经过了多少游戏刻）。

一些常见的可渲染文件是屏幕和“小部件”：通常在屏幕上渲染的可交互元素，如`Button`、其子类型`ImageButton`和用于在屏幕上输入文本的`EditBox`。

## GuiEventListener

在Minecraft中呈现的任何屏幕都实现了`GuiEventListener`。`GuiEventListener`负责处理用户与屏幕的交互。其中包括来自鼠标（移动、单击、释放、拖动、滚动、鼠标悬停）和键盘（按下、释放、键入）的输入。每个方法都返回关联的操作是否成功影响了屏幕。按钮、聊天框、列表等小工具也实现了这个界面。

### ContainerEventHandler

与`GuiEventListener`几乎同义的是它们的子类型：`ContainerEventHandler`。它们负责处理包含小部件的屏幕上的用户交互，管理当前聚焦的内容以及相关交互的应用方式。`ContainerEventHandler`添加了三个附加功能：可交互的子项、拖动和聚焦。

事件处理器包含用于确定元素交互顺序的子级。在鼠标事件处理器（不包括拖动）期间，鼠标悬停的列表中的第一个子级将执行其逻辑。

用鼠标拖动元素，通过`#mouseClicked`和`#mouseReleased`实现，可以提供更精确的执行逻辑。

聚焦允许在事件执行期间，例如在键盘事件或拖动鼠标期间，首先检查并处理特定的子项。焦点通常通过`#setFocused`设置。此外，可以使用`#nextFocusPath`循环可交互的子级，根据传入的`FocusNavigationEvent`选择子级。

:::caution
    屏幕通过`AbstractContainerEventHandler`实现了`ContainerEventHandler`和`GuiComponent`，添加了setter和getter逻辑用于拖动和聚焦子级。
:::

## NarratableEntry

`NarratableEntry`是可以通过Minecraft的无障碍讲述功能进行讲述的元素。每个元素可以根据悬停或选择的内容提供不同的叙述，通常按焦点、悬停以及所有其他情况进行优先级排序。

`NarratableEntry`有三种方法：一种是确定元素的优先级（`#narrationPriority`），一种是决定是否说出讲述（`#isActive`），最后一种是将讲述提供给相关的输出（说出或读取）（`#updateNarration`）。

:::caution
    Minecraft中的所有小部件都是`NarratableEntry`，因此如果使用可用的子类型，通常不需要手动实现。
:::

## 屏幕子类型

利用以上所有知识，可以构建一个简单的屏幕。为了更容易理解，屏幕的组件将按通常遇到的顺序提及。

首先，所有屏幕都包含一个`Component`，其表示屏幕的标题。此组件通常由其子类型之一绘制到屏幕上。它仅用于讲述消息的基本屏幕。

```java
// 在某个Screen子类中
public MyScreen(Component title) {
    super(title);
}
```

### 初始化

一旦屏幕被初始化，就会调用`#init`方法。`#init`方法将屏幕内的初始设置从`ItemRenderer`和`Minecraft`实例设置为游戏缩放的相对宽度和高度。任何设置，如添加小部件或预计算相对坐标，都应该用这种方法完成。如果调整游戏窗口的大小，屏幕将通过调用`#init`方法重新初始化。

有三种方法可以将小部件添加到屏幕中，每种方法都有各自的用途：

方法                   | 描述
:---:                  | :---
`#addWidget`           | 添加一个可交互和讲述但不被渲染的小部件。
`#addRenderableOnly`   | 添加一个只会被渲染的小部件；它既不可互动，也不可被讲述。
`#addRenderableWidget` | 添加一个可交互、讲述和被渲染的小部件。

通常，`#addRenderableWidget`将是最常用的。

```java
// 在某个Screen子类中
@Override
protected void init() {
    super.init();

    // 添加小部件和已预计算的值
    this.addRenderableWidget(new EditBox(/* ... */));
}
```

### 计时屏幕

屏幕也会使用`#tick`方法计时来执行某种级别的客户端逻辑以进行渲染。最常见的例子是`EditBox`的光标闪烁。

```java
// 在某个Screen子类中
@Override
public void tick() {
    super.tick();

    // 在editBox中为EditBox添加计时逻辑
    this.editBox.tick();
}
```

### 输入处理

由于屏幕是`GuiEventListener`的子类型，输入处理器也可以被覆盖，例如用于处理特定[按键][keymapping]上的逻辑。

### 屏幕的渲染

最后，屏幕是通过作为`Renderable`子类型提供的`#render`方法进行渲染的。如前所述，`#render`方法绘制屏幕必须渲染每一帧的所有内容，如背景、小部件、提示文本等。默认情况下，`#render`方法仅将小部件渲染到屏幕上。

在通常不由子类型处理的屏幕中渲染的两件最常见的事情是背景和提示文本。

背景可以使用`#renderBackground`进行渲染，其中一种方法在无法渲染屏幕后面的级别时，每当渲染屏幕时，都会将v偏移值作为选项背景。

提示文本通过`GuiGraphics#renderTooltip`或`GuiGraphics#renderComponentTooltip`进行渲染，它们可以接受正在渲染的文本组件、可选的自定义提示文本示组件以及提示文本应在屏幕上渲染的x/y相对坐标。

```java
// 在某个Screen子类中

// mouseX和mouseY指示鼠标光标在屏幕上的缩放坐标
@Override
public void render(GuiGraphics graphics, int mouseX, int mouseY, float partialTick) {
    // 通常首先渲染背景
    this.renderBackground(graphics);

    // 在此处渲染在小部件之前渲染的内容（背景纹理）

    // 然后是窗口小部件，如果这是Screen的直接子项
    super.render(graphics, mouseX, mouseY, partialTick);

    // 在小部件之后渲染的内容（工具提示）
}
```

### 屏幕的关闭

当屏幕关闭时，有两种方法处理屏幕的关闭：`#onClose`和`#removed`。

每当用户做出关闭当前屏幕的输入时，就会调用`#onClose`。此方法通常用作回调，以销毁和保存屏幕本身中的任何内部进程。这包括向服务端发送数据包。

`#removed`在屏幕更改并被释放到垃圾收集器之前被调用。这将处理任何尚未重置回屏幕打开前初始状态的内容。

```java
// 在某个Screen子类中

@Override
public void onClose() {
    // 在此处停止任何处理器

    // 最后调用，以防干扰重写后的方法体
    super.onClose();
}

@Override
public void removed() {
    // 在此处重置初始状态

    // 最后调用，以防干扰重写后的方法体
    super.removed()
;}
```

## `AbstractContainerScreen`

如果一个屏幕直接连接到[菜单（Menu）][menus]，那么其应改为继承`AbstractContainerScreen`。`AbstractContainerScreen`充当菜单的渲染器和输入处理程序，包含用于与Slot同步和交互的逻辑。因此，通常只需要重写或实现两个方法就可以拥有一个可工作的容器屏幕。同样，为了更容易理解，容器屏幕的组件将按通常遇到的顺序提及。

`AbstractContainerScreen`通常需要三个参数：打开的容器菜单（用泛型`T`表示）、玩家物品栏（仅用于显示名称）和屏幕本身的标题。在这里，可以设置多个定位字段：

字段              | 描述
:---:             | :---
`imageWidth`      | 用于背景的纹理的宽度。这通常位于256 x 256的PNG中，默认值为176。
`imageHeight`     | 用于背景的纹理的高度。这通常位于256 x 256的PNG中，默认值为166。
`titleLabelX`     | 将渲染屏幕标题的位置的相对x坐标。
`titleLabelY`     | 将渲染屏幕标题的位置的相对y坐标。
`inventoryLabelX` | 将渲染玩家物品栏名称的位置的相对x坐标。
`inventoryLabelY` | 将渲染玩家物品栏名称的位置的相对y坐标。

!!! 重要
    在上一节中提到应该在`#init`方法中设置预先计算的相对坐标。这仍然保持正确，因为这里提到的值不是预先计算的坐标，而是静态值和相对坐标。

    图像值是静态的且不变，因为它们表示背景纹理大小。为了在渲染时更容易，在`#init`方法中预先计算了两个附加值（`leftPos`和`topPos`），该方法标记了将渲染背景的左上角。标签坐标相对于这些值。

    `leftPos`和`topPos`也被用作渲染背景的方便方式，因为它们已经表示要传递到`#blit`方法中的位置。

```java
// 在某个AbstractContainerScreen子类中
public MyContainerScreen(MyMenu menu, Inventory playerInventory, Component title) {
    super(menu, playerInventory, title);

    this.titleLabelX = 10;
    this.inventoryLabelX = 10;

    /*
     * 如果'imageHeight'已更改，则还必须更改'inventoryLabelY'，因为该值取决于'imageHeight'值。
     */
}
```

### 屏幕的访问

当菜单被传递给屏幕时，菜单中的任何值（通过Slot、数据Slot或自定义系统）都可以通过`menu`字段访问。

### 容器的计时

当玩家活着并通过`#containerTick`查看屏幕时，容器屏幕在`#tick`方法中计时。这基本上取代了容器屏幕中的`#tick`，其最常见的用法是在配方书中计时。

```java
// 在某个AbstractContainerScreen子类中
@Override
protected void containerTick() {
    super.containerTick();

    // 在此处对某些事计时
}
```

### 容器屏幕的渲染

容器屏幕通过三种方法进行渲染：`#renderBg`，用于渲染背景纹理；`#renderLabels`，用于在背景顶部渲染任何文本；以及`#render`，除了提供灰色背景和提示文本外，还包含前两种方法。

从`#render`开始，最常见的重写（通常是唯一的情况）是添加背景，调用super来渲染容器屏幕，以及最后在其顶部渲染提示文本。

```java
// 在某个AbstractContainerScreen子类中
@Override
public void render(GuiGraphics graphics, int mouseX, int mouseY, float partialTick) {
    this.renderBackground(graphics);
    super.render(graphics, mouseX, mouseY, partialTick);

    /*
     * 该方法由容器屏幕添加，用于渲染悬停在其上的任何Slot的提示文本。
     */
    this.renderTooltip(graphics, mouseX, mouseY);
}
```

在super中，`#renderBg`被调用以渲染屏幕的背景。最标准的代表是使用三个方法调用：两个用于设置，一个用于绘制背景纹理。

```java
// 在某个AbstractContainerScreen子类中

// 背景纹理的位置（assets/<namespace>/<path>）
private static final ResourceLocation BACKGROUND_LOCATION = new ResourceLocation(MOD_ID, "textures/gui/container/my_container_screen.png");

@Override
protected void renderBg(GuiGraphics graphics, float partialTick, int mouseX, int mouseY) {
    /*
     * 将背景纹理渲染到屏幕上。'leftPos'和'topPos'应该已经表示纹理应该渲染
     * 的左上角，因为它是根据'imageWidth'和'imageHeight'预计算的。两个零
     * 表示256 x 256 PNG文件中的整数u/v坐标。
     */
    graphics.blit(BACKGROUND_LOCATION, this.leftPos, this.topPos, 0, 0, this.imageWidth, this.imageHeight);
}
```

最后，调用`#renderLabels`来渲染背景上方但提示文本下方的任何文本。这个简单的调用使用字体来绘制相关的组件。

```java
// 在某个AbstractContainerScreen子类中
@Override
protected void renderLabels(GuiGraphics graphics, int mouseX, int mouseY) {
    super.renderLabels(graphics, mouseX, mouseY);

    // 假设我们有个组件'label'
    // 'label'在'labelX'和'labelY'处被绘制
    graphics.drawString(this.font, this.label, this.labelX, this.labelY, 0x404040);
}
```

:::caution
    渲染标签时，**不**需要指定`leftPos`和`topPos`偏移量。这些已经在`PoseStack`中进行了转换，因此该方法中的所有内容都是相对于这些坐标绘制的。
:::

## 注册一个AbstractContainerScreen

要将`AbstractContainerScreen`与菜单一起使用，需要对其进行注册。这可以通过调用[**模组事件总线**][modbus]上的`FMLClientSetupEvent`中的`MenuScreens#register`来完成。

```java
// 该事件已在模组事件总线上被监听
private void clientSetup(FMLClientSetupEvent event) {
    event.enqueueWork(
        // 假设：RegistryObject<MenuType<MyMenu>> MY_MENU
        // 假设MyContainerScreen<MyMenu>，其接受三个参数
        () -> MenuScreens.register(MY_MENU.get(), MyContainerScreen::new)
    );
}
```

:::danger
    `MenuScreens#register`不是线程安全的，因此它需要在并行调度事件提供的`#enqueueWork`内部调用。
:::

[menus]: ./menus.md
[network]: ../networking/index.md
[screen]: #the-screen-subtype
[argb]: https://en.wikipedia.org/wiki/RGBA_color_model#ARGB32
[component]: ../concepts/internationalization.md#translatablecontents
[keymapping]: ../misc/keymappings.md#inside-a-gui
[modbus]: ../concepts/events.md#mod-event-bus
