# 스크린

스크린(Screen)은 마인크래프트의 모든 GUI의 기반이 됩니다: 사용자의 입력을 받고, 서버에서 검증한 다음, 그 결과를 다시 클라이언트에 전송합니다. 이들은 [메뉴][menus]와 결합하여 인벤토리를 통한 통신 기능을 구현할 수 있고, 아니면 직접 [패킷][network]을 만들 수도 있습니다.

스크린은 여러가지로 구성되어 있어 하나로 정리하기 어렵기에, 이 문서에선 각 부분을 상세히 다루고 나서 스크린을 만들도록 하겠습니다. 

## 상대 좌표

화면에 무언가를 띄우기 위해선 UI의 위치를 지정해야 합니다. 마인크래프트는 x, y, z를 사용해 위치를 지정합니다. x는 왼쪽에서 오른쪽, y는 위에서 아래,, z는 멀리서 가까이 올 수록 값이 증가합니다. 하지만 이 좌표들의 범위는 고정되어 있지 않고 화면의 크기나 설정의 GUI 비율에 따라 달라질 수 있습니다. 그렇기에 화면의 크기에 따라 좌표값의 규모를 맞추는 것이 중요합니다.

좌표를 화면 크기에 상대적으로 맞추는 법은 [스크린][screen] 섹션에서 다룹니다.

:::caution
만약 고정 좌표를 사용하거나 화면의 규모에 좌표를 맞추지 못한다면 표시되는 요소들이 잘못된 곳에 배치될 수 있습니다. 비디오 설정의 `GUI 비율`을 바꿔가며 확인하시길 권장드립니다. 이 설정값은 UI의 가로/세로 길이를 나눌 때 사용됩니다. 
:::

## Gui Graphics

마인크래프트가 띄우는 모든 GUI는 `GuiGraphics`를 사용합니다. `GuiGraphics`는 마인크래프트의 모든 렌더링 함수의 첫번째 인자로, GUI에 많이 사용되는 요소를 띄우기 위해 필요한 기본 메서드들을 제공합니다. 이들은 대개 다음으로 나눌 수 있는데: 색칠된 직사각형, 문자열, 텍스쳐, 아이템, 그리고 툴팁입니다. 추가로 컴포넨트의 일부만 렌더링하는 함수도 있습니다(`#enableScissor` / `#disableScissor`). `GuiGraphics`은 UI 요소 이동에 필요한 `PoseStack`도 제공합니다. 또한, [ARGB][argb] 포맷을 사용합니다.

### 색칠된 직사각형

색칠된 직사각형은 위치&색상 쉐이더를 사용해 그려집니다. 마인크래프트는 세 종류의 직사각형을 그릴 수 있는데:
1. 픽셀 두깨의 수평/수직선. `#hLine`로 수평선, `#vLine`로 수직선을 구릴 수 있음. `#hLine`은 왼쪽 끝, 오른쪽 끝 픽셀의 x 좌표, 선이 놓여질 y 좌표, 그리고 색상을 인자로 받음. `#vLine`은 선이 놓여질 x 좌표, 맨 위 픽셀과 맨 아래 픽셀의 y 좌표, 그리고 색상을 인자로 받음.
2. 직사각형을 그리는 `#fill` 함수, 위 `#hLine`과 `#vLine`은 내부적으로 `#fill`을 호출함. 왼쪽 위 픽셀의 x, y 좌표, 그리고 오른쪽 아래 픽셀의 x, y 좌표, 그리고 색상을 인자로 받음.
3. 그라데이션을 적용하는 `#fillGradient` 함수, 그라데이션은 수직 방향으로 적용됨. 오른쪽 아래 픽셀의 x, y 좌표, 왼쪽 위 픽셀의 x, y 좌표, z 좌표, 그리고 아래, 위 색상을 인자로 받음.

### 문자열

문자열은 `Font`를 사용해 그립니다, `Font`는 대개 투명도, 오프셋, 법선 등을 위해 자체적인 쉐이더를 사용합니다. 문자열은 왼쪽(`#drawString`), 또는 가운데(`#drawCenteredString`)에 정렬될 수 있고, 두 메서드 모두 사용할 폰트, 그릴 문자열, 문자열의 왼쪽 또는 중앙의 x 좌표, y좌표, 색상, 그리고 선택적으로 그림자 여부를 인자로 받습니다. 

:::note
문자열은 일반적으로 기능이 많은 [컴포넌트][component]로 다룹니다. 위 두 메서드는 `String` 말고 `Component`도 받습니다.
:::

### 텍스쳐 (TODO, ChampionAsh한테 고치라고 하기)

텍스쳐는 비트 블록 전송(blit)을 통해 그립니다. `#blit` 메서드는 이미지를 복사해 바로 화면에 그립니다. 이때 위치&텍스쳐 쉐이더를 사용합니다. `#blit`은 오버로드가 매우 많지만, 아래에선 정수를 인자로 받는 `#blit` 메서드만 다루겠습니다.

The first static `#blit` takes in six integers and assumes the texture being rendered is on a 256 x 256 PNG file. It takes in the left x and top y screen coordinate, the left x and top y coordinate within the PNG, and the width and height of the image to render.

:::tip
The size of the PNG file must be specified so that the coordinates can be normalized to obtain the associated UV values.
:::

The static `#blit` which the first calls expands this to nine integers, only assuming the image is on a PNG file. It takes in the left x and top y screen coordinate, the z coordinate (referred to as the blit offset), the left x and top y coordinate within the PNG, the width and height of the image to render, and the width and height of the PNG file.

#### 비트 블록 전송 오프셋

텍스쳐의 z 좌표에 오프셋을 더할 수 있습니다. 이때 오프셋과 z값의 합이 낮은 순서대로 먼저 그려지고 합이 높은 텍스쳐는 그 위에 덧씌워 집니다. `PoseStack`의 `#translate`로 오프셋을 지정할 수 있습니다.

:::caution
오프셋을 변경하고 나면 무조건 원래 값으로 복원해야 합니다, 그렇지 않으면 텍스쳐를 그리는 순서가 꼬일 수 있습니다. 일반적으로 현재 행렬을 `PoseStack#push`로 저장한 다음 렌더링이 끝나면 `#pop`으로 복원합니다.
:::

## Renderable

`Renderable`s are essentially objects that are rendered. These include screens, buttons, chat boxes, lists, etc. `Renderable`s only have one method: `#render`. This takes in the `GuiGraphics` used to render things to the screen, the x and y positions of the mouse scaled to the relative screen size, and the tick delta (how many ticks have passed since the last frame).

Some common renderables are screens and 'widgets': interactable elements which typically render on the screen such as `Button`, its subtype `ImageButton`, and `EditBox` which is used to input text on the screen.

## GuiEventListener

Any screen rendered in Minecraft implements `GuiEventListener`. `GuiEventListener`s are responsible for handling user interaction with the screen. These include inputs from the mouse (movement, clicked, released, dragged, scrolled, mouseover) and keyboard (pressed, released, typed). Each method returns whether the associated action affected the screen successfully. Widgets like buttons, chat boxes, lists, etc. also implement this interface.

### ContainerEventHandler

Almost synonymous with `GuiEventListener`s are their subtype: `ContainerEventHandler`s. These are responsible for handling user interaction on screens which contain widgets, managing which is currently focused and how the associated interactions are applied. `ContainerEventHandler`s add three additional features: interactable children, dragging, and focusing.

Event handlers hold children which are used to determine the interaction order of elements. During the mouse event handlers (excluding dragging), the first child in the list that the mouse hovers over has their logic executed.

Dragging an element with the mouse, implemented via `#mouseClicked` and `#mouseReleased`, provides more precisely executed logic.

Focusing allows for a specific child to be checked first and handled during an event's execution, such as during keyboard events or dragging the mouse. Focus is typically set through `#setFocused`. In addition, interactable children can be cycled using `#nextFocusPath`, selecting the child based upon the `FocusNavigationEvent` passed in.

:::note
Screens implement `ContainerEventHandler` through `AbstractContainerEventHandler`, which adds in the setter and getter logic for dragging and focusing children.
:::

## NarratableEntry

`NarratableEntry`s are elements which can be spoken about through Minecraft's accessibility narration feature. Each element can provide different narration depending on what is hovered or selected, prioritized typically by focus, hovering, and then all other cases.

`NarratableEntry`s have three methods: one which determines the priority of the element (`#narrationPriority`), one which determines whether to speak the narration (`#isActive`), and finally one which supplies the narration to its associated output, spoken or read (`#updateNarration`). 

:::note
All widgets from Minecraft are `NarratableEntry`s, so it typically does not need to be manually implemented if using an available subtype.
:::

## The Screen Subtype

With all of the above knowledge, a basic screen can be constructed. To make it easier to understand, the components of a screen will be mentioned in the order they are typically encountered.

First, all screens take in a `Component` which represents the title of the screen. This component is typically drawn to the screen by one of its subtypes. It is only used in the base screen for the narration message.

```java
// In some Screen subclass
public MyScreen(Component title) {
    super(title);
}
```

### Initialization

Once a screen has been initialized, the `#init` method is called. The `#init` method sets the initial settings inside the screen from the `ItemRenderer` and `Minecraft` instance to the relative width and height as scaled by the game. Any setup such as adding widgets or precomputing relative coordinates should be done in this method. If the game window is resized, the screen will be reinitialized by calling the `#init` method.

There are three ways to add a widget to a screen, each serving a separate purpose:

Method                 | Description
:---:                  | :---
`#addWidget`           | Adds a widget that is interactable and narrated, but not rendered.
`#addRenderableOnly`   | Adds a widget that will only be rendered; it is not interactable or narrated.
`#addRenderableWidget` | Adds a widget that is interactable, narrated, and rendered.

Typically, `#addRenderableWidget` will be used most often.

```java
// In some Screen subclass
@Override
protected void init() {
    super.init();

    // Add widgets and precomputed values
    this.addRenderableWidget(new EditBox(/* ... */));
}
```

### Ticking Screens

Screens also tick using the `#tick` method to perform some level of client side logic for rendering purposes. The most common example is the `EditBox` for the blinking cursor.

```java
// In some Screen subclass
@Override
public void tick() {
    super.tick();

    // Add ticking logic for EditBox in editBox
    this.editBox.tick();
}
```

### Input Handling

Since screens are subtypes of `GuiEventListener`s, the input handlers can also be overridden, such as for handling logic on a specific [key press][keymapping].

### Rendering the Screen

Finally, screens are rendered through the `#render` method provided by being a `Renderable` subtype. As mentioned, the `#render` method draws the everything the screen has to render every frame, such as the background, widgets, tooltips, etc. By default, the `#render` method only renders the widgets to the screen.

The two most common things rendered within a screen that is typically not handled by a subtype is the background and the tooltips.

The background can be rendered using `#renderBackground`, with one method taking in a v Offset for the options background whenever a screen is rendered when the level behind it cannot be.

Tooltips are rendered through `GuiGraphics#renderTooltip` or `GuiGraphics#renderComponentTooltip` which can take in the text components being rendered, an optional custom tooltip component, and the x / y relative coordinates on where the tooltip should be rendered on the screen.

```java
// In some Screen subclass

// mouseX and mouseY indicate the scaled coordinates of where the cursor is in on the screen
@Override
public void render(GuiGraphics graphics, int mouseX, int mouseY, float partialTick) {
    // Background is typically rendered first
    this.renderBackground(graphics);

    // Render things here before widgets (background textures)

    // Then the widgets if this is a direct child of the Screen
    super.render(graphics, mouseX, mouseY, partialTick);

    // Render things after widgets (tooltips)
}
```

### Closing the Screen

When a screen is closed, two methods handle the teardown: `#onClose` and `#removed`.

`#onClose` is called whenever the user makes an input to close the current screen. This method is typically used as a callback to destroy and save any internal processes in the screen itself. This includes sending packets to the server.

`#removed` is called just before the screen changes and is released to the garbage collector. This handles anything that hasn't been reset back to its initial state before the screen was opened.

```java
// In some Screen subclass

@Override
public void onClose() {
    // Stop any handlers here

    // Call last in case it interferes with the override
    super.onClose();
}

@Override
public void removed() {
    // Reset initial states here

    // Call last in case it interferes with the override
    super.removed()
;}
```

## `AbstractContainerScreen`

If a screen is directly attached to a [menu][menus], then an `AbstractContainerScreen` should be subclassed instead. An `AbstractContainerScreen` acts as the renderer and input handler of a menu and contains logic for syncing and interacting with slots. As such, only two methods typically need to be overridden or implemented to have a working container screen. Once again, to make it easier to understand, the components of a container screen will be mentioned in the order they are typically encountered.

An `AbstractContainerScreen` typically requires three parameters: the container menu being opened (represented by the generic `T`), the player inventory (only for the display name), and the title of the screen itself. Within here, a number of positioning fields can be set:

Field             | Description
:---:             | :---
`imageWidth`      | The width of the texture used for the background. This is typically inside a PNG of 256 x 256 and defaults to 176.
`imageHeight`     | The width of the texture used for the background. This is typically inside a PNG of 256 x 256 and defaults to 166.
`titleLabelX`     | The relative x coordinate of where the screen title will be rendered.
`titleLabelY`     | The relative y coordinate of where the screen title will be rendered.
`inventoryLabelX` | The relative x coordinate of where the player inventory name will be rendered.
`inventoryLabelY` | The relative y coordinate of where the player inventory name will be rendered.

:::caution
In a previous section, it mentioned that precomputed relative coordinates should be set in the `#init` method. This still remains true, as the values mentioned here are not precomputed coordinates but static values and relativized coordinates.

The image values are static and non changing as they represent the background texture size. To make things easier when rendering, two additional values (`leftPos` and `topPos`) are precomputed in the `#init` method which marks the top left corner of where the background will be rendered. The label coordinates are relative to these values.

The `leftPos` and `topPos` is also used as a convenient way to render the background as they already represent the position to pass into the `#blit` method.
:::caution

```java
// In some AbstractContainerScreen subclass
public MyContainerScreen(MyMenu menu, Inventory playerInventory, Component title) {
    super(menu, playerInventory, title);

    this.titleLabelX = 10;
    this.inventoryLabelX = 10;

    /*
     * If the 'imageHeight' is changed, 'inventoryLabelY' must also be
     * changed as the value depends on the 'imageHeight' value.
     */
}
```

### Menu Access

As the menu is passed into the screen, any values that were within the menu and synced (either through slots, data slots, or a custom system) can now be accessed through the `menu` field.

### Container Tick

Container screens tick within the `#tick` method when the player is alive and looking at the screen via `#containerTick`. This essentially takes the place of `#tick` within container screens, with its most common usage being to tick the recipe book.

```java
// In some AbstractContainerScreen subclass
@Override
protected void containerTick() {
    super.containerTick();

    // Tick things here
}
```

### Rendering the Container Screen

The container screen is rendered across three methods: `#renderBg`, which renders the background textures, `#renderLabels`, which renders any text on top of the background, and `#render` which encompass the previous two methods in addition to providing a grayed out background and tooltips.

Starting with `#render`, the most common override (and typically the only case) adds the background, calls the super to render the container screen, and finally renders the tooltips on top of it.

```java
// In some AbstractContainerScreen subclass
@Override
public void render(GuiGraphics graphics, int mouseX, int mouseY, float partialTick) {
    this.renderBackground(graphics);
    super.render(graphics, mouseX, mouseY, partialTick);

    /*
     * This method is added by the container screen to render
     * the tooltip of the hovered slot.
     */
    this.renderTooltip(graphics, mouseX, mouseY);
}
```

Within the super, `#renderBg` is called to render the background of the screen. The most standard representation uses three method calls: two for setup and one to draw the background texture.

```java
// In some AbstractContainerScreen subclass

// The location of the background texture (assets/<namespace>/<path>)
private static final ResourceLocation BACKGROUND_LOCATION = new ResourceLocation(MOD_ID, "textures/gui/container/my_container_screen.png");

@Override
protected void renderBg(GuiGraphics graphics, float partialTick, int mouseX, int mouseY) {
    /*
     * Sets the texture location for the shader to use. While up to
     * 12 textures can be set, the shader used within 'blit' only
     * looks at the first texture index.
     */
    RenderSystem.setShaderTexture(0, BACKGROUND_LOCATION);

    /*
     * Renders the background texture to the screen. 'leftPos' and
     * 'topPos' should already represent the top left corner of where
     * the texture should be rendered as it was precomputed from the
     * 'imageWidth' and 'imageHeight'. The two zeros represent the
     * integer u/v coordinates inside the 256 x 256 PNG file.
     */
    graphics.blit(BACKGROUND_LOCATION, this.leftPos, this.topPos, 0, 0, this.imageWidth, this.imageHeight);
}
```

Finally, `#renderLabels` is called to render any text above the background, but below the tooltips. This simply calls uses the font to draw the associated components.

```java
// In some AbstractContainerScreen subclass
@Override
protected void renderLabels(GuiGraphics graphics, int mouseX, int mouseY) {
    super.renderLabels(graphics, mouseX, mouseY);

    // Assume we have some Component 'label'
    // 'label' is drawn at 'labelX' and 'labelY'
    graphics.drawString(this.font, this.label, this.labelX, this.labelY, 0x404040);
}
```

:::note
When rendering the label, you do **not** need to specify the `leftPos` and `topPos` offset. Those have already been translated within the `PoseStack` so everything within this method is drawn relative to those coordinates.
:::

## Registering an AbstractContainerScreen

To use an `AbstractContainerScreen` with a menu, it needs to be registered. This can be done by calling `MenuScreens#register` within the `FMLClientSetupEvent` on the [**mod event bus**][modbus].

```java
// Event is listened to on the mod event bus
private void clientSetup(FMLClientSetupEvent event) {
    event.enqueueWork(
        // Assume RegistryObject<MenuType<MyMenu>> MY_MENU
        // Assume MyContainerScreen<MyMenu> which takes in three parameters
        () -> MenuScreens.register(MY_MENU.get(), MyContainerScreen::new)
    );
}
```

:::danger
`MenuScreens#register` is not thread-safe, so it needs to be called inside `#enqueueWork` provided by the parallel dispatch event.
:::

[menus]: ./menus.md
[network]: ../networking/index.md
[screen]: #the-screen-subtype
[argb]: https://en.wikipedia.org/wiki/RGBA_color_model#ARGB32
[component]: ../concepts/internationalization.md#translatablecontents
[keymapping]: ../misc/keymappings.md#inside-a-gui
[modbus]: ../concepts/events.md#모드-이벤트-버스
