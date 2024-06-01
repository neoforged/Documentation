---
sidebar_position: 3
---
# 이벤트

이벤트는 게임에서 특정 사건이 발생했다고 알리는 시스템으로, 네오 포지의 주요 기능중 하나입니다. 예를 들어, 플레이어가 우클릭 할 때, 엔티티가 점프할 때, 블록을 그릴 때, 게임을 불러올 때 등에 이벤트가 방송되며, 모드는 이벤트에 구독하여 사건 발생시 특정 동작을 수행할 수 있습니다.

이벤트는 버스에 방송되며, 버스를 통해 이벤트에 구독합니다. 이때 이벤트는 알맞은 버스에만 방송됩니다. 게임 플레이중에 일어나는 사건들은 메인 버스(`NeoForge.EVENT_BUS`)에 방송되고, 그 외 모드 초기화에 사용되는 이벤트들은 각 모드별로 생성되는 버스에 방송됩니다. 여기에 방송되는 이벤트들은 대부분 더 빠른 초기화를 위해 여러 모드에 병렬적으로 방송됩니다(메인 버스는 메인 스레드만 사용하여 이벤트를 병렬적으로 방송하지 못합니다). 자세한 사항은 [아래][modbus]를 참고하세요.

## 이벤트에 핸들러 등록하기

핸들러는 이벤트 방송시 실행되는 함수입니다. 구독한 이벤트를 인자로 받고 `void`를 반환합니다. 핸들러를 이벤트에 구독시키는 방법은 여러가지가 있습니다. 

### `IEventBus#addListener`

가장 단순하게 핸들러를 구독하는 방법으로, 아래처럼 메서드 참조를 등록하는 것입니다:

```java
@Mod("yourmodid")
public class YourMod {
    public YourMod(IEventBus modBus) { // 모드별 버스는 생성자 인자로 전달받음
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

위처럼 직접 메서드를 지정해 등록하는 것 말고도, 어노테이션으로 특정 함수가 핸들러라고 표기할 수도 있습니다. 핸들러들을 정의한 클래스의 인스턴스를 버스에 등록하면 자동으로 `@SubscriveEvent`로 표기된 모든 함수들이 핸들러로 등록됩니다: 

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
        NeoForge.EVENT_BUS.register(new EventHandler());
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
        NeoForge.EVENT_BUS.register(EventHandler.class);
    }
}
```

### `@EventBusSubscriber`

위에서 한 단계 더 나아가, 핸들러를 정의한 클래스 자체를 `@EventBusSubscriber`로 표기할 수도 있습니다. 네오 포지는 이 어노테이션으로 표기된 클래스들을 찾아 자동으로 이벤트 버스에 등록합니다. 이는 `NeoForge.EVENT_BUS.register(EventHandler.class)`를 호출하는 것과 동일하기에 모든 핸들러는 정적 함수여야 합니다.

필수는 아니지만 위 어노테이션의 `modid` 값을 지정하는 것을 강력히 권장드립니다, 어떤 모드의 핸들러인지 구분하기 쉬워 오류 해결이 더 수월하기 때문입니다 (특히 모드끼리 충돌날 때).

```java
@EventBusSubscriber(modid = "yourmodid")
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

이벤트의 필드와 메서드들은 발생한 사건의 세부 정보를 담고 있고, 사건의 추후 흐름을 조작하는데 사용합니다. 예를 들어 새로운 엔티티가 소환되었다면, 이때 방송되는 이벤트는 추가되는 엔티티와 레벨을 담고 있을 것이며, 이들을 조작하여 엔티티 소환 과정에 간섭할 수 있습니다.

### 클래스 상관 관계

일부 이벤트들은 `Event`를 바로 상속하지 않고, 대신 `Event`의 하위 클래스를 상속합니다. 예를 들어 블록 관련 이벤트들은 `BlockEvent`를 대신 상속하고, 엔티티 관련 이벤트들은 `EntityEvent`를 상속합니다. 이 둘은 추상 클래스라서 구독할 수 없습니다.

:::danger
추상 클래스인 이벤트를 구독하면 만들면 게임이 충돌합니다.
:::

### 취소 가능한 이벤트

일부 이벤트들은 사건 자체를 중단하는데 사용할 수 있습니다. 이들은 `ICancellableEvent` 인터페이스를 구현합니다. 이벤트는 `#setCanceled(boolean canceled)`로 취소할 수 있으며, 취소 여부는 `#isCanceled()`로 확인할 수 있습니다. 이벤트가 취소되면 다른 핸들러들은 실행되지 않으며, 이벤트를 발생시킨 사건이 중단됩니다. 예를 들어 엔티티가 도약할 때 방송되는 `LivingJumpEvent`를 취소하면 도약이 중단됩니다. 

이벤트 취소 여부와 관계 없이 언제나 핸들러를 실행하려면 `IEventBus#addListener`(또는 `@SubscribeEvent`)의 `receiveCanceled`를 `true`로 지정하세요.

### 이벤트의 결과

일부 이벤트는 취소만 하는 것 보다 더 유연하게 사건의 흐름을 조작할 수 있습니다. 이런 이벤트들은 결과를 가지며, 이 결과에 따라 사건의 흐름이 달라집니다. 예를 들어 플레이어의 이름표를 그릴 때 방송되는 `RenderNameTagEvent`는 `TriState`를 결과로 가집니다. `TriState`는 `#TRUE`(강행), `#DEFAULT`(기본), `#FALSE`(차단) 이 세가지 값을 가지는 열거형으로, 결과가 `#TRUE`일 땐 웅크리기 여부와 관계 없이 이름표를 강제로 표시하고, `#DEFAULT`는 바닐라랑 똑같이 웅크리기를 하면 이름표를 숨깁니다. `#FALSE`는 이름표를 언제나 숨깁니다. 이런 이벤트들은 대개 결과로 `TriState`를 사용하지만, 몇몇은 `MobDespawnEvent`와 같이 이벤트 클래스 자체적으로 `Result` 열거형을 정의하기도 합니다.

이런 이벤트들의 결과는 `set`으로 시작하는 메서드로 바꿀 수 있습니다.

```java
// 아래 두 핸들러가 메인 버스에 올바르게 등록되어 있다고 가정함

@SubscribeEvent
public void renderNameTag(RenderNameTagEvent event) {
    // 이 이벤트는 결과로 TriState를 사용함
    event.setCanRender(TriState.FALSE);
}

@SubscribeEvent
public void mobDespawn(MobDespawnEvent event) {
    // 이 이벤트는 결과로 MobDespawnEvent.Result를 사용함
    event.setResult(MobDespawnEvent.Result.DENY);
}
```

### 우선순위

핸들러는 실행될 우선순위도 설정할 수 있습니다. 우선순위는 `EventPriority`에 정의되어 있으며, 높은 순위에서 낮은 순위 순서대로 다섯가지 값이 있는데: `HIGHEST`, `HIGH`, `NORMAL` (기본값), `LOW`, `LOWEST` 입니다. 같은 우선순위를 가지는 이벤트 핸들러는 버스에 등록된 순서로 실행됩니다, 이는 메인 버스에선 대체로 모드를 불러온 순서와 유사하고 모드별 이벤트 버스에선 정확히 일치합니다. 

우선순위는 `IEventBus#addListener`(또는 `@SubscribeEvent`)의 `priority`로 설정합니다. 이때 병렬적으로 방송되는 이벤트는 우선순위를 무시합니다.

### 클라이언트 전용 이벤트

일부 이벤트들은 [클라이언트][side]에서만 방송됩니다. 이 이벤트들에 구독한 핸들러들은 클라이언트 전용 코드를 사용하니 버스에 등록할 때 주의하세요.

`IEventBus#addListener()`를 사용해 이 이벤트들에 구독한다면, 먼저 핸들러를 클라이언트 전용 클래스에 작성한 다음, `FMLEnvironment.dist`, 또는 모드 진입 지점의 `Dist` 인자 등을 통해 물리 사이드가 클라이언트임을 확인하고, 그 다음에 핸들러를 등록하세요.

`@EventBusSubscriber`를 사용해 이 이벤트들에 구독한다면, 어노테이션의 `value`에 다음과 같이 물리 사이드를 클라이언트라고 지정하세요: `@EventBusSubscriber(value = Dist.CLIENT, modid = "yourmodid")`.

## 이벤트 버스들

대부분의 이벤트들은 메인 버스, `NeoForge.EVENT_BUS`에 방송되지만, 그 외는 모드별 버스에 방송됩니다. 모드별 버스에 방송되는 이벤트들은 구분을 위해 `IModBusEvent`를 구현합니다.

모드별 버스는 모드 진입점의 생성자의 인자로 전달됩니다. 여기에 핸들러들을 등록하세요. 만약 핸들러를 `@EventBusSubscriber`로 자동으로 구독하신다면 어노테이션의 인자로 버스를 다음과 같이 지정할 수 있습니다: `@EventBusSubscriber(bus = Bus.MOD, modid = "yourmodid")`. 버스는 기본값으로 `Bus.GAME`, 즉 메인 버스입니다.

### 모드 생명주기

모드 버스에 방송되는 이벤트들은 모드의 생명주기를 알리는데 사용됩니다. 생명주기는 게임이 지금 무엇을 불러오고 있는지, 모드가 무엇을 초기화 해야 하는지 알릴 때 사용되며 게임을 처음 시작하고 불러올 때 방송됩니다. 이 이벤트들은 대개 `ParallelDispatchEvent`의 자식 클래스이며, 병렬적으로 방송됩니다. 만약 메인 스레드에서 실행해야 하는 코드가 있다면, `#enqueueWork(Runnable runnable)`을 호출하세요.

모드의 생명주기는 크게 다음과 같은 순서를 따릅니다:

- 모드 진입 지점이 호출됨. 이벤트 핸들러를 등록할 것.
- `@EventBusSubscriber`로 표기된 클래스들을 찾고 등록함.
- `FMLConstructModEvent`가 방송됨.
- 레지스트리 이벤트가 방송됨: [레지스트리 생성을 알리는 `NewRegistryEvent`][newregistry], [데이터팩 레지스트리 생성을 알리는 `DataPackRegistryEvent.NewRegistry`][newdatapackregistry], [각 레지스트리마다 방송되는 `RegisterEvent`][registerevent].
- `FMLCommonSetupEvent`가 방송됨. 기타 모드 초기화가 여기서 이뤄짐.
- [사이드 초기화][side] 이벤트가 방송됨: 물리 클라이언트에선 `FMLClientSetupEvent`, 물리 서버에선 `FMLDedicatedServerSetupEvent`가 방송됨.
- `InterModComms`를 처리함(아래 참고).
- `FMLLoadCompleteEvent`가 방송됨.

#### `InterModComms`

`InterModComms`은 모드들끼리 메세지로 통신할 때 사용하는 시스템입니다, 모드간 호환성에 중요한 역할을 합니다. 이 클래스는 모드들이 보낸 모든 메세지들을 저장합니다. `InterModComms`의 메서드들은 어떤 스레드에서 호출해도 안전합니다(thread-safe). 이 시스템은 두 개의 이벤트를 방송하는데: `InterModEnqueueEvent`와 `InterModProcessEvent` 입니다.

`InterModEnqueueEvent`는 메세지를 전송할 때를 알리는 이벤트 입니다, 핸들러에서 `InterModComms#sendTo`를 호출해 다른 모드에 메세지를 전송하세요. 이때 메세지를 받을 모드의 아이디, 각 메세지를 구분하기 위한 키, 메세지의 내용을 생성하는 `Supplier`를 담아서 보냅니다. 또한 선택적으로 메세지를 보낸 모드의 아이디도 담을 수 있습니다.

이후, 메세지를 처리할 때를 알리는 `InterModProcessEvent`가 방송되면, 핸들러에서 `InterModComms#getMessages`로 수신한 모든 메세지(`IMCMessage`)들을 받을 수 있습니다. `IMCMessage`는 위에서 메세지를 보낼 때와 같이 수신자, 송신자, 키, 메세지 내용을 생성하는 `Supplier`를 담고 있습니다.

### 기타 모드 버스 이벤트

생명주기 이벤트 이외에도 기타 초기화 이벤트가 있습니다. 아래 이벤트들은 병렬적으로 방송되지 않습니다:

- `RegisterColorHandlersEvent`
- `ModelEvent.BakingCompleted`
- `TextureAtlasStitchedEvent`

:::warning
위 이벤트들은 버전 호환성을 위해 모드 버스에서 방송된 것이며, 언젠가 메인 버스로 옮겨질 예정입니다.
:::

[modbus]: #이벤트-버스들
[newdatapackregistry]: registries.md#custom-datapack-registries
[newregistry]: registries.md#custom-registries
[registerevent]: registries.md#registerevent
[side]: sides.md
