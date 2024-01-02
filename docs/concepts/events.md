이벤트
======

포지는 이벤트 버스를 이용하여 여러 모드들이 바닐라 마인크래프트의 여러 이벤트에 반응할 수 있도록 해줍니다.

예를 들어, 막대기를 우클릭 하였을때 이벤트가 방송되고 모드는 이에 반응하여 어떠한 동작을 수행할 수 있습니다.

대부분의 게임속 이벤트들은 메인 이벤트 버스인 `NeoForge#EVENT_BUS`에 방송됩니다. 이 버스는 모든 모드가 공유합니다. 가끔 모드 각각에 방송되어야는 이벤트도 있는데, 이땐 각 모드별로 네오 포지가 생성하는 [모드 이벤트 버스](#모드-이벤트-버스)를 사용합니다.

이벤트 핸들러는 버스에 등록되어, 특정 이벤트에 반응하는 메서드 입니다.

이벤트 핸들러 만들기
-------------------------

이벤트 핸들러 메서드들은 결과를 반환하지 않고 인자가 하나만 있습니다. 이 메서드들은 정적이어도 되고 아니어도 됩니다.

이벤트 핸들러들은 `IEventBus#addListener`를 사용하여 바로 등록하실 수 있습니다. 만약 이벤트가 제너릭 클래스이고, `GenericEvent<T>` 의 자식 클래스일 경우 `IEventBus#addGenericListener`를 대신 사용하실 수 있습니다, 둘 다 전달될 메서드를 표현하는 `Consumer`를 인자로 받습니다. 제너릭 이벤트에 반응할 핸들러들은 타입 인자또한 전달하여야 합니다. 이벤트 핸들러들은 무조건 모드의 메인 클래스의 생성자에서 등록되어야 합니다.

```java
// ExampleMod라는 모드 메인 클래스

// 이 이벤트는 모드 버스에서 방송됩니다
private void modEventHandler(RegisterEvent event) {
    // Do things here
}

// 이 이벤트는 포지 버스에서 방송됩니다
private static void forgeEventHandler(AttachCapabilitiesEvent<Entity> event) {
    // ...
}

// 모드의 생성자
modEventBus.addListener(this::modEventHandler);
forgeEventBus.addGenericListener(Entity.class, ExampleMod::forgeEventHandler);
```

### 어노테이션을 활용한 이벤트 핸들러

이 이벤트 핸들러는 `EntityItemPickupEvent` 에 반응합니다, 이름에서 알 수 있다싶이, `Entity` 가 아이템을 주울 때 모드 버스에 방송됩니다.

```java
public class MyForgeEventHandler {
    @SubscribeEvent
    public void pickupItem(EntityItemPickupEvent event) {
        System.out.println("아이템을 주웠습니다!!");
    }
}
```

이 이벤트 핸들러를 등록하기 위해서는 `NeoForge.EVENT_BUS.register(...)`를 사용하세요. 그리고 이 메서드에 이벤트 핸들러 메서드가 있는 클래스의 인스턴스를 매개변수로 전달하세요. 만약 핸들러를 모드별 버스에 등록하고 싶다면 `FMLJavaModLoadingContext.get().getModEventBus().register(...)`를 대신 사용하세요.

### 어노테이션을 활용한 정적 이벤트 핸들러

이벤트 핸들러를 정적으로 만들 수도 있습니다. 이 메서드에도 `@SubscribeEvent` 어노테이션이 있습니다. 위에서 사용한 인스턴스를 통한 이벤트 핸들러와의 차이점은 메서드가 정적이라는 것입니다. 정적 이벤트 핸들러를 등록하기 위해서는 클래스의 인스턴스가 아니고, 클래스 그 자체가 전달되어야 합니다. 그 예로:

```java
public class MyStaticForgeEventHandler {
    @SubscribeEvent
    public static void arrowNocked(ArrowNockEvent event) {
        System.out.println("화살 당겨짐!");
    }
}
```

이는 `NeoForge.EVENT_BUS.register(MyStaticForgeEventHandler.class)`를 통해 등록합니다.

### 자동으로 정적 이벤트 핸들러 등록하기

`@Mod$EventBusSubscriber` 어노테이션은 클래스에 사용할 수 있습니다. 만약 이를 사용할 시, 그 클래스는 자동으로 `NeoForge#EVENT_BUS` 에 `@Mod` 클래스가 초기화될 때 등록됩니다. 이는 `NeoForge.EVENT_BUS.register(AnnotatedClass.class)` 구문을 `@Mod` 클래스의 생성자에서 사용하는 것과 동일합니다.

`@Mod$EventBusSubscriber` 는 아무 버스나 사용할 수 있습니다. 이를 사용할 때 모드의 아이디를 전달하는 것이 권장되는데, 이는 어노테이션만으로는 무슨 모드의 이벤트 핸들러인지 구별할 수 없기 때문입니다. 또, 이벤트를 들을 버스를 전달하는 것 또한 권장되는데, 무슨 버스의 이벤트를 듣는지 표시하기 때문입니다. 또, `Dist` 값을 지정하여 어떤 물리 사이드에서 이벤트 핸들러가 동작할 것인지를 설정하실 수 있습니다. 이를 통해 특정 물리 사이드에서는 아예 이벤트 핸들러가 등록되지 않도록 할 수 있습니다.

이를 이용한, `RenderLevelStageEvent` 이벤트에 반응하는, 클라이언트에만 존재하는 정적 이벤트 핸들러 입니다.

```java
@Mod.EventBusSubscriber(modid = "mymod", bus = Bus.FORGE, value = Dist.CLIENT)
public class MyStaticClientOnlyEventHandler {
    @SubscribeEvent
    public static void drawLast(RenderLevelStageEvent event) {
        System.out.println("월드 그리는중!");
    }
}
```

:::note
이를 이용하면 클래스의 인스턴스가 아닌 클래스 그 자체가 등록됩니다. 그렇기에 등록되는 모든 이벤트 핸들러는 정적이어야 제대로 동작합니다!
:::

이벤트 취소하기
---------

취소할 수 있는 이벤트는 클래스 정의에 `@Cancelable`로 표시되어 있습니다. 이러한 이벤트들은 포지에서 `Event#isCancelable`의 함수 본문에 `return true`를 주입하여 언제나 `true`를 반환하도록 합니다. 이벤트는 `Event#setCanceled(boolean canceled)`를 통해 취소할 수 있으며, `false`를 인자로 전달하는 것으로 "취소를 취소"하실 수 있습니다.

:::danger
`@Cancelable`이 없는 이벤트를 취소하려고 하면 `UnsuppoortedOperationException`가 발생해 게임이 충돌하게 됩니다!
:::

결과
-------

몇몇 이벤트들은 취소 여부 확인만으론 충분한 흐름 제어를 할 수 없어 `DENY`, `DEFAULT`, `ALLOW` 이 세가지 결과를 표현할 수 있는 `Event$Result`를 사용합니다. 이러한 이벤트들은 `@HasResult`로 표시되어 있습니다. `DENY`는 처리 중단, `DEFAULT`는 기본 바닐라 로직 실행, `ALLOW`는 강제 동작 실행을 의미합니다. 결과는 `Event#setResult`를 사용해 지정할 수 있습니다.

:::caution
각 이벤트들이 결과를 응용하는 방식은 다르기 때문에 이벤트의 Javadoc을 충분히 숙지하도록 하세요!
:::

우선순위
--------

이벤트 핸들러의 실행 순서에는 우선순위가 있습니다. `@SubscribeEvent`와 `IEventBus#addListener`는 우선순위를 지정하기 위한 `priority`를 선택 인자로 받습니다. 우선순위는 `EventPriority` 열거형으로 정의되는데, (`HIGHEST`, `HIGH`, `NORMAL`, `LOW`, `LOWEST`)가 있습니다. `HIGHEST`의 우선순위가 가장 높고 `LOWEST`가 가장 낮습니다.

이벤트 상속
----------

일부 이벤트들은 역할을 세부적으로 나누거나 하나의 범주로 묶기 위해 상속을 사용하기도 합니다. 이벤트 핸들러는 반응할 이벤트의 모든 자식클래스에도 반응합니다.

모드 이벤트 버스
-------------

귀하의 모드의 모드별 버스를 사용하시려면, [메인 클래스 생성자][ctor-injection]에 `IModEventBus`를 추가하세요.

모드 이벤트 버스는 주로 초기화를 위한 생명주기 이벤트를 방송할 때 사용합니다. 모드 버스에 방송되는 이벤트들은 전부 `IModBusEvent`를 구현합니다. 이 이벤트들은 대개 병렬적으로 방송되기에 다른 모드의 코드를 직접적으로 호출할 순 없으며, `InterModComms`을 대신 사용하세요.

모드 이벤트 버스에는 대표적으로 아래 [생명주기] 이벤트들이 방송됩니다.

* `FMLCommonSetupEvent`
* `FMLClientSetupEvent`/`FMLDedicatedServerSetupEvent`
* `InterModEnqueueEvent`
* `InterModProcessEvent`

:::note
`FMLClientSetupEvent` 와 `FMLDedicatedServerSetupEvent` 는 올바른 물리 사이드에서만 방송됩니다!
:::

위 생명주기 이벤트들은 모두 병렬적으로 처리되며, `ParallelDispatchEvent`의 하위 클래스 입니다. 위 이벤트 도중 메인 스레드에서 코드를 실행하려면 `#enqueueWork`를 사용하세요.

생명주기 이벤트 이외에도, 모드별 버스에서 방송되는 기타 객체 등록 및 초기화를 위한 이벤트도 있습니다. 이 이벤트들은 위와 다르게 병렬적으로 방송되지 않으며 대표적으로 아래 네 개가 있습니다:

* `RegisterColorHandlersEvent`
* `ModelEvent$BakingCompleted`
* `TextureStitchEvent`
* `RegisterEvent`

일반적으로, 모드의 초기화에 사용되는 이벤트는 모드별 버스에 방송됩니다.

[생명주기]: ./lifecycle.md
[ctor-injection]: ../gettingstarted/modfiles.md#javafml과-mod
