# 이벤트

이벤트 시스템은 네오 포지의 주요 기능중 하나입니다. 게임에서 여러 사건이 발생하면 이벤트가 방송됩니다. 예를 들어, 플레이어가 우클릭 할 때의 이벤트, 엔티티가 점프할 때의 이벤트, 블록을 그릴 때의 이벤트, 게임을 불러올 때의 이벤트 등이 있습니다. 모드는 이벤트에 핸들러를 구독시켜, 이벤트 방송시 특정 동작을 수행할 수 있습니다.

이벤트는 알맞는 이벤트 버스에만 방송됩니다. 버스중 가장 많이 쓰이는 것은 메인 이벤트 버스, `NeoForge.EVENT_BUS` 입니다, 게임 플레이중 일어나는 여러 사건들의 이벤트가 여기서 방송됩니다. 그 외에는 모드 초기화에 사용되는 모드별 버스가 있습니다. 이 버스는 각 모드마다 하나씩 생성되며, 여기에 방송되는 이벤트들은 대개 더 빠른 초기화를 위해 병렬적으로 방송됩니다 (메인 이벤트 버스는 메인 스레드만 사용하여 이벤트를 병렬적으로 방송하지 못합니다). 자세한 사항은 [아래][modbus]를 참고하세요.

## 이벤트 핸들러 등록하기

이벤트 핸들러는 구독된 이벤트를 인자로 받고 `void`를 반환하는 함수입니다. 이벤트에 핸들러를 구독시키는 방법은 여러가지가 있습니다. 

### `IEventBus#addListener`

가장 단순하게 핸들러를 등록하는 방법은 메서드 참조를 아래처럼 등록하는 것입니다:

```java
@Mod("yourmodid")
public class YourMod {
    public YourMod(IEventBus modBus) {
        NeoForge.EVENT_BUS.addListener(YourMod::onLivingJump);
    }

    // 엔티티가 점프를 할 때 마다 반칸씩 회복시킴.
    private static void onLivingJump(LivingJumpEvent event) {
        Entity entity = event.getEntity();
        // 오직 서버에서만 회복시킴
        if (!entity.level().isClientSide()) {
            entity.heal(1);
        }
    }
}
```

### `@SubscribeEvent`

위처럼 직접 메서드 참조를 전달하는 것 말고도, 어노테이션으로 특정 함수가 핸들러라고 표기할 수도 있습니다. 핸들러들이 정의된 클래스의 인스턴스를 버스에 등록하면 자동으로 `@SubscriveEvent`로 표기된 모든 핸들러들을 등록합니다: 

```java
public class EventHandler {
    @SubscribeEvent
    public void onLivingJump(LivingJumpEvent event) {
        Entity entity = event.getEntity();
        if (!entity.level().isClientSide()) {
            entity.heal(1);
        }
    }
}

@Mod("yourmodid")
public class YourMod {
    public YourMod(IEventBus modBus) {
        // 자동으로 EventHandler 클래스의 모든 핸들러들을 등록함
        NeoForge.EVENT_BUS.addListener(new EventHandler());
    }
}
```

만약 이벤트 핸들러들이 전부 정적 메서드라면 위처럼 인스턴스 대신 클래스 자체를 넘겨도 됩니다:

```java
public class EventHandler {
	@SubscribeEvent
    public static void onLivingJump(LivingJumpEvent event) {
        Entity entity = event.getEntity();
        if (!entity.level().isClientSide()) {
            entity.heal(1);
        }
    }
}

@Mod("yourmodid")
public class YourMod {
    public YourMod(IEventBus modBus) {
        NeoForge.EVENT_BUS.addListener(EventHandler.class);
    }
}
```

### `@Mod.EventBusSubscriber`

위에서 한 단계 더 나아가, 이벤트 핸들러가 정의된 클래스 자체를 `@Mod.EventBusSubscriber`로 표기할 수도 있습니다. 네오 포지는 자동으로 이 어노테이션으로 표기된 클래스들을 찾아 이벤트 버스에 등록합니다, 그러면 모드 생성자에서 이벤트 관리를 하지 않아도 됩니다. 결국에는 생성자 맨 아래에서 `NeoForge.EVENT_BUS.register(EventHandler.class)`를 호출하는 것과 동일하기에 모든 핸들러는 정적 메서드여야 합니다.

필수는 아니지만 어노테이션의 `modid` 값을 지정하는 것을 강력히 권장드립니다, 핸들러에서 오류 발생시 무슨 핸들러인지 구분하기 더 쉽기 때문입니다 (특히 모드끼리 충돌날 때).

```java
@Mod.EventBusSubscriber(modid = "yourmodid")
public class EventHandler {
    @SubscribeEvent
    public static void onLivingJump(LivingJumpEvent event) {
        Entity entity = event.getEntity();
        if (!entity.level().isClientSide()) {
            entity.heal(1);
        }
    }
}
```

## 이벤트의 특성들

### 필드와 메서드

말 그대로 이벤트가 가지는 필드와 메서드입니다. 발생한 사건의 세부 정보를 담고 있고, 사건의 추후 흐름을 조작하는데 사용합니다. 예를 들어 새로운 엔티티가 소환되었다면, 이때 방송되는 이벤트는 추가되는 엔티티와 레벨을 담고 있을 것이며, 이들을 조작하여 엔티티 소환 과정에 간섭할 수 있습니다.

### 클래스 상관 관계

일부 이벤트들은 `Event`를 바로 상속하지 않고, 대신 `Event`의 하위 클래스를 상속합니다. 예를 들어 블록 관련 이벤트들은 블록 정보를 포함하는 `BlockEvent`를 대신 상속하고, 엔티티 관련 이벤트들은 엔티티 정보를 포함하는 `EntityEvent`를 상속합니다. 이 하위 클래스들은 추상 클래스라서 구독할 수 없습니다.

:::danger
추상 클래스를 구독하는 이벤트 핸들러를 만들면 게임이 충돌합니다.
:::

### 취소 가능한 이벤트

일부 이벤트들은 `ICancellableEvent` 인터페이스를 구현합니다. 이 이벤트들은 `#setCanceled(boolean canceled)`로 취소할 수 있으며, 이벤트 취소 여부는 `#isCanceled()`로 확인할 수 있습니다. 이벤트가 취소되면 다른 구독된 핸들러들은 실행되지 않으며, 이벤트를 발생시킨 사건이 중단됩니다. 예를 들어 생물이 도약할 때 방송되는 `LivingJumpEvent`를 취소하면 도약이 중단됩니다. 

이벤트 취소 여부와 관계 없이 언제나 핸들러를 실행하려면 `IEventBus#addListener`(또는 `@SubscribeEvent`)의 `receiveCanceled`를 `true`로 지정하세요.

### 결과

일부 이벤트들은 결과(`Result`)를 가집니다. 결과는 세 가지로 나뉘는데: 사건을 중단시키는 `DENY`, 사건을 강행시키는 `ALLOW`, 사건에 간섭하지 않는 `DEFAULT`가 있습니다. 이벤트의 결과는 `Event#setResult`로 지정할 수 있습니다. 결과를 가지는 이벤트들은 `@HasResult`로 표기되어 있습니다/

:::caution
`Result`는 추후 제거될 예정이며, 각 이벤트마다 결과를 표현하는 열거형을 따로 만들 것입니다.
:::

### 우선순위

이벤트 핸들러의 우선순위도 설정할 수 있습니다. `EventPriority`에는 순서대로 다섯가지 값이 있는데: `HIGHEST`, `HIGH`, `NORMAL` (기본값), `LOW`, `LOWEST` 입니다. 이벤트 핸들러는 `HIGHEST`부터 `LOWEST` 순서대로 실행됩니다. 같은 우선순위를 가지는 이벤트 핸들러는 버스에 등록된 순서로 실행되며, 이는 메인 이벤트 버스에선 대체로 모드를 불러온 순서와 유사하며 모드별 이벤트 버스에선 정확히 일치합니다. 

우선순위는 `IEventBus#addListener`(또는 `@SubscribeEvent`)의 `priority`로 설정합니다. 이때 병렬적으로 방송되는 이벤트는 우선순위가 무시됩니다.

### 사이드 전용 이벤트

일부 이벤트들은 한쪽 [사이드][side]에서만 방송됩니다. 그 예로, 렌더링 관련 이벤트들은 클라이언트에서만 방송됩니다. 이 이벤트들에 구독한 핸들러들은 클라이언트 전용 코드를 사용하니 버스에 등록할 때 사이드를 맞춰야 합니다.

`IEventBus#addListener()` 사용시, `FMLEnvironment.dist`를 확인해 맞는 사이드에서 핸들러를 등록해야 하며, 클라이언트 전용 코드는 다른 클래스를 만들어 작성하세요.

`@Mod.EventBusSubscriber` 사용시, 어노테이션의 `value` 값에 다음과 같이 사이드를 지정할 수 있습니다: `@Mod.EventBusSubscriber(value = Dist.CLIENT, modid = "yourmodid")`.

## 이벤트 버스들

대부분의 이벤트들은 메인 이벤트 버스, `NeoForge.EVENT_BUS`에 방송되지만, 그 외는 모드별 버스에 방송됩니다. 여기에 방송되는 이벤트는 구분을 위해 `IModBusEvent`를 구현합니다.

메인 클래스 생성자의 인자로 모드별 버스를 추가할 수 있습니다. 여기에 핸들러들을 등록하세요. 만약 `@Mod.EventBusSubscriber`를 사용하신다면 어노테이션의 인자로 버스를 다음과 같이 지정할 수 있습니다: `@Mod.EventBusSubscriber(bus = Bus.MOD, modid = "yourmodid")`. 버스는 기본값으로 `Bus.FORGE`, 즉 메인 이벤트 버스입니다.

### 모드 생명주기

모드별 버스에 방송되는 이벤트들은 대개 모드의 생명주기를 알리기 위한 것입니다. 이 이벤트들은 게임을 시작하면서 한 번만 방송됩니다, 그리고 대개 모든 모드들에 병렬적으로 방송됩니다. 그렇기에 메인 스레드에서 실행해야 하는 코드가 있다면 `#enqueueWork(Runnable runnable)`를 사용하세요.

모드의 생명주기는 크게 다음과 같은 순서를 따릅니다:

- 모드의 생성자가 호출됨. 여기, 또는 다음 단계에서 이벤트 핸들러를 등록할 것.
- `@Mod.EventBusSubscriber`로 표기된 클래스들을 찾고 등록함.
- `FMLConstructModEvent`가 방송됨.
- 레지스트리 이벤트가 방송됨: [레지스트리 생성을 알리는 `NewRegistryEvent`][newregistry], [데이터팩 레지스트리 생성을 알리는 `DataPackRegistryEvent.NewRegistry`][newdatapackregistry], [객체를 등록할 때라고 알리는 `RegisterEvent`][registerevent].
- `FMLCommonSetupEvent`가 방송됨. 기타 모드 초기화가 여기서 이뤄짐.
- [사이드 초기화][side] 이벤트가 방송됨: 물리 클라이언트에선 `FMLClientSetupEvent`, 물리 서버에선 `FMLDedicatedServerSetupEvent`.
- `InterModComms`를 처리함(아래 참고).
- `FMLLoadCompleteEvent`가 방송됨.

#### `InterModComms`

`InterModComms`은 모드들끼리 메세지로 통신하게 해주는 시스템입니다, 모드간 호환성에 중요한 역할을 합니다. 이 클래스는 모드들이 보낸 모든 메세지들을 저장하고, 각 메서드들은 어떤 스레드에서 호출해도 안전합니다(thread-safe). 이 시스템은 두 개의 이벤트로 동작하는데: `InterModEnqueueEvent`와 `InterModProcessEvent` 입니다.

`InterModEnqueueEvent`는 메세지를 전송할 때를 알리는 이벤트로, `InterModComms#sendTo`를 호출해 다른 모드에 메세지를 전송할 수 있습니다. 이때 메세지를 받을 모드의 아이디, 각 메세지를 구분하기 위한 키, 메세지의 내용을 생성하는 `Supplier`를 메세지에 담아서 보냅니다. 또한 선택적으로 메세지를 보낸 모드의 아이디도 담을 수 있습니다.

이후, 메세지를 처리할 때를 알리는 `InterModProcessEvent`가 방송되면, `InterModComms#getMessages`로 수신한 모든 메세지(`IMCMessage`)들의 스트림을 받을 수 있습니다. `IMCMessage`는 메세지의 수신자 및 송신자, 키, 메세지 내용의 `Supplier`를 담고 있습니다.

### 기타 모드 버스 이벤트

생명주기 이벤트 이외에도 기타 초기화 이벤트가 있습니다. 아래 이벤트들은 병렬적으로 방송되지 않습니다:

- `RegisterColorHandlersEvent`
- `ModelEvent.BakingCompleted`
- `TextureStitchEvent`

:::warning
위 이벤트들은 언젠가 메인 이벤트 버스로 옮겨질 예정입니다.
:::

[modbus]: #event-buses
[newdatapackregistry]: registries.md#custom-datapack-registries
[newregistry]: registries.md#custom-registries
[registerevent]: registries.md#registerevent
[side]: sides.md
