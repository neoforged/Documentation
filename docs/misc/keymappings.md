# 키 매핑

키 매핑(또는 키 바인딩)은 입력에 따라 특정 동작을 수행하는 것을 뜻합니다. 각 동작은 클라이언트가 입력을 처리할 때 수행되며 [조작 메뉴][controls]에서 아무 키에나 할당될 수 있습니다.

## 등록하기 `KeyMapping`

`KeyMapping`은 물리 클라이언트 [**모드 이벤트 버스**][modbus]에 `RegisterKeyMappingsEvent` 방송시 `#register`를 호출해 등록할 수 있습니다.

```java
// 물리 클라이언트 전용 클래스라 가정

// 키 매핑은 필요할 때 까지 초기화가 지연됨
public static final Lazy<KeyMapping> EXAMPLE_MAPPING = Lazy.of(() -> /*...*/);

// 아래 이벤트는 물리 클라이언트에서 모드 이벤트 버스에 방송됨
@SubscribeEvent
public void registerBindings(RegisterKeyMappingsEvent event) {
  event.register(EXAMPLE_MAPPING.get());
}
```

## `KeyMapping` 만들기

`KeyMapping`의 생성자는 키 매핑의 이름의 [번역 키][tk], 기본 입력 키, 그리고 [설정][controls]에서 키 매핑을 분류할 카테고리 이름의 [번역 키][tk]를 인자로 받습니다.

:::tip
기본 카테고리 이외의 카테고리 [번역 키][tk]를 사용해 새 카테고리를 만들 수 있습니다. 이때 번역 키는 모드 아이디를 포함하는 것이 좋습니다(예: `key.categories.examplemod.examplecategory`).
:::

### 기본 입력키

키 매핑은 기본 입력 키를 설정해야 합니다. 입력 키는 `InputConstants$Key`로 표현되고, 입력 기기의 종류를 식별하는 `InputConstants$Type`과 입력 코드를 대표하는 정수로 이루어져 있습니다.
바닐라 마인크래프트는 세 종류의 입력 기기를 지원하는데: `GLFW`를 통해 키보드 토큰을 전달 받는 `KEYSYM`, 플랫폼 전용 스캔 코드를 사용하는 `SCANCODE`, 마지막으로 마우스를 대표하는 `MOUSE` 입니다.

:::note
`GLFW` 키보드 토큰은 특정 플랫폼에 종속되지 않기 때문에 `SCANCODE`대신 `KEYSYM`을 사용하는 것을 강력히 권장드립니다. 자세한 내용은 [GLFW 문서][keyinput]에서 찾아보실 수 있습니다.
:::

입력 코드는 무슨 입력이냐에 따라 다른 것을 사용해야 합니다. `KEYSYM`의 `GLFW` 키보드 토큰은 `GLFW_KEY_*` 접미사가 붙으나 `MOUSE` 코드들은 `GLFW_MOUSE_*`를 사용합니다.

```java
new KeyMapping(
  "key.examplemod.example1", // 키 이름 번역을 위한 키
  InputConstants.Type.KEYSYM, // 입력 기기 종류
  GLFW.GLFW_KEY_P, // 기본 입력 키
  "key.categories.misc" // 이 키 매핑은 기타 카테고리에 들어감
)
```

:::note
만약 기본 입력 키를 설정하지 않으려면 `InputConstants#UNKNOWN`을 대신 사용하세요. 기본 생성자는 입력 코드를 `InputConstants.UNKNOWN.getValue()`로 제공해야 하나 포지에서 추가한 생성자는 바로 전달해도 됩니다.
:::

### `IKeyConflictContext`

모든 키 매핑이 언제나 쓰이는 것은 아닙니다. 몇몇 매핑은 GUI에서만 쓰이기도 하고, 어떤 것은 인 게임에서만 쓰입니다. 매핑이 사용되는 상황의 차이가 있음에도 불구하고 서로 겹치는 것을 막기 위해, 매핑의 맥락을 정의하는 `IKeyConflictContext`를 사용할 수 있습니다.

각 맥락은 두 개의 메소드를 정의합니다: 키 매핑이 현재 사용 가능한지 반환하는 `#isActive`, 그리고 다른 `IKeyConflictContext`와 충돌하는지를 반환하는 `#conflicts` 입니다.

현재 포지는 세 개의 맥락을 `KeyConflictContext`에 정의합니다: 키 매핑이 언제나 활성화 되는 `UNIVERSAL`, `Screen`이 열려 있어야만 작동하는 `GUI`, 마지막으로 `Screen`이 없을 때만 작동하는 `IN_GAME`이 있습니다. 새 맥락은 `IKeyConflictContext`를 구현해 만들 수 있습니다.

```java
new KeyMapping(
  "key.examplemod.example2",
  KeyConflictContext.GUI, // GUI가 열려 있을 때만 매핑 활성화
  InputConstants.Type.MOUSE, // 마우스로 부터 입력 받음
  GLFW.GLFW_MOUSE_BUTTON_LEFT, // 왼쪽 클릭을 입력 받음
  "key.categories.examplemod.examplecategory" // 매핑은 새로운 example 카테고리에 분류함
)
```

### `KeyModifier`

Modders may not want mappings to have the same behavior if a modifier key is held at the same (e.g. `G` vs `CTRL + G`). To remedy this, Forge adds an additional parameter to the constructor to take in a `KeyModifier` which can apply control (`KeyModifier#CONTROL`), shift (`KeyModifier#SHIFT`), or alt (`KeyModifier#ALT`) to any input. `KeyModifier#NONE` is the default and will apply no modifier.

A modifier can be added in the [controls option menu][controls] by holding down the modifier key and the associated input.

```java
new KeyMapping(
  "key.examplemod.example3",
  KeyConflictContext.UNIVERSAL,
  KeyModifier.SHIFT, // Default mapping requires shift to be held down
  InputConstants.Type.KEYSYM, // Default mapping is on the keyboard
  GLFW.GLFW_KEY_G, // Default key is G
  "key.categories.misc"
)
```

## Checking a `KeyMapping`

A `KeyMapping` can be checked to see whether it has been clicked. Depending on when, the mapping can be used in a conditional to apply the associated logic.

### Within the Game

Within the game, a mapping should be checked by listening to `ClientTickEvent` on the [**Forge event bus**][forgebus] and checking `KeyMapping#consumeClick` within a while loop. `#consumeClick` will return `true` only the number of times the input was performed and not already previously handled, so it won't infinitely stall the game.

```java
// Event is on the Forge event bus only on the physical client
public void onClientTick(ClientTickEvent event) {
  if (event.phase == TickEvent.Phase.END) { // Only call code once as the tick event is called twice every tick
    while (EXAMPLE_MAPPING.get().consumeClick()) {
      // Execute logic to perform on click here
    }
  }
}
```

:::caution
Do not use the `InputEvent`s as an alternative to `ClientTickEvent`. There are separate events for keyboard and mouse inputs only, so they wouldn't handle any additional inputs.
:::

### Inside a GUI

Within a GUI, a mapping can be checked within one of the `GuiEventListener` methods using `IForgeKeyMapping#isActiveAndMatches`. The most common methods which can be checked are `#keyPressed` and `#mouseClicked`. 

`#keyPressed` takes in the `GLFW` key token, the platform-specific scan code, and a bitfield of the held down modifiers. A key can be checked against a mapping by creating the input using `InputConstants#getKey`. The modifiers are already checked within the mapping methods itself.

```java
// In some Screen subclass
@Override
public boolean keyPressed(int key, int scancode, int mods) {
  if (EXAMPLE_MAPPING.get().isActiveAndMatches(InputConstants.getKey(key, scancode))) {
    // Execute logic to perform on key press here
    return true;
  }
  return super.keyPressed(x, y, button);
} 
```

:::note
If you do not own the screen which you are trying to check a **key** for, you can listen to the `Pre` or `Post` events of `ScreenEvent$KeyPressed` on the [**Forge event bus**][forgebus] instead.
:::

`#mouseClicked` takes in the mouse's x position, y position, and the button clicked. A mouse button can be checked against a mapping by creating the input using `InputConstants$Type#getOrCreate` with the `MOUSE` input.

```java
// In some Screen subclass
@Override
public boolean mouseClicked(double x, double y, int button) {
  if (EXAMPLE_MAPPING.get().isActiveAndMatches(InputConstants.TYPE.MOUSE.getOrCreate(button))) {
    // Execute logic to perform on mouse click here
    return true;
  }
  return super.mouseClicked(x, y, button);
} 
```

:::note
If you do not own the screen which you are trying to check a **mouse** for, you can listen to the `Pre` or `Post` events of `ScreenEvent$MouseButtonPressed` on the [**Forge event bus**][forgebus] instead.
:::

[modbus]: ../concepts/events.md#mod-event-bus
[controls]: https://minecraft.wiki/w/Options#Controls
[tk]: ../concepts/internationalization.md#translatablecontents
[keyinput]: https://www.glfw.org/docs/3.3/input_guide.html#input_key
[forgebus]: ../concepts/events.md#creating-an-event-handler
