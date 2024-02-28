# 새로운 패킷 등록하기

패킷은 임의의 데이터를 클라이언트와 서버가 서로 주고받을 때 사용합니다. 각 패킷은 한 네임 스페이스 아래 `IPayloadRegistrar`(패킷 집합)에 등록하며, 이는 `RegisterPayloadHandlerEvent`를 통해 받을 수 있습니다.  
```java
@SubscribeEvent
public static void register(final RegisterPayloadHandlerEvent event) {
    final IPayloadRegistrar registrar = event.registrar("mymod");
}
```

예를 들어 아래 데이터를 전송한다고 할 때:
```java
public record MyData(String name, int age) {}
```

`CustomPacketPayload`인터페이스를 구현하여 네트워크로 전송될 수 있도록 만드세요.
```java
public record MyData(String name, int age) implements CustomPacketPayload {
    
    public static final ResourceLocation ID = new ResourceLocation("mymod", "my_data");
    
    public MyData(final FriendlyByteBuf buffer) {
        this(buffer.readUtf(), buffer.readInt());
    }
    
    @Override
    public void write(final FriendlyByteBuf buffer) {
        buffer.writeUtf(name());
        buffer.writeInt(age());
    }
    
    @Override
    public ResourceLocation id() {
        return ID;
    }
}
```
위 예시에 나온 것처럼 `CustomPacketPayload`는 `write`, `id` 메서드가 필요합니다. `write`는 버퍼에 데이터를 작성할 때 사용하고, `id`는 각 패킷을 구분할 때 사용합니다. 이뿐만 아니라 버퍼에서 데이터를 읽어 패킷을 복호화하는 메서드도 필요합니다. 위 예제에선 생성자를 통해 버퍼를 읽습니다.

마지막으로, 위 패킷 집합에 등록하세요:
```java
@SubscribeEvent
public static void register(final RegisterPayloadHandlerEvent event) {
    final IPayloadRegistrar registrar = event.registrar("mymod");
    registrar.play(MyData.ID, MyData::new, handler -> handler
            .client(ClientPayloadHandler.getInstance()::handleData)
            .server(ServerPayloadHandler.getInstance()::handleData));
}
```
위 코드를 들여다보면 몇 가지 중요 사항을 발견할 수 있습니다:
- 패킷 집합엔 `play` 메서드가 있습니다, 이는 게임 플레이 중 전송될 패킷을 등록할 때 사용합니다.
  - `play` 말고도 로그인 이전 사전 설정에 사용하는 `configuration`도 있으며, 게임 플레이와 사전 설정 단계에서 동시에 사용할 패킷을 등록하는 `common`도 있습니다.
- `MyData`를 버퍼에서 읽는 메서드로 생성자를 사용했습니다.
- 위 메서드의 세 번째 인자는 패킷이 클라이언트, 또는 서버에 도착했을 때 실행할 동작을 지정합니다.
  - `client` 메서드는 패킷이 클라이언트에 도착했을 때 실행할 동작을 지정합니다.
  - `server` 메서드는 패킷이 서버에 도착했을 때 실행할 동작을 지정합니다.
  - 또한, `play`는 한 번에 클라이언트와 서버에서 동일한 동작을 지정해 주는 동명 메서드가 있습니다.

이제 새로운 패킷을 등록했으니 수신 시 수행할 동작을 구현하겠습니다. 간결함을 위해 클라이언트 수신시 동작만 다루겠지만, 서버도 이와 동일합니다.
```java
public class ClientPayloadHandler {
    
    private static final ClientPayloadHandler INSTANCE = new ClientPayloadHandler();
    
    public static ClientPayloadHandler getInstance() {
        return INSTANCE;
    }
    
    public void handleData(final MyData data, final PlayPayloadContext context) {
        // 네트워크 스레드에서 패킷 데이터 사용
        blah(data.name());
        
        // 메인 스레드에서 데이터 사용
        context.workHandler().submitAsync(() -> {
            blah(data.age());
        })
        .exceptionally(e -> {
            // 예외 처리
            context.packetHandler().disconnect(Component.translatable("my_mod.networking.failed", e.getMessage()));
            return null;
        });
    }
}
```
위 예시에서 주목하실 점은:
- 패킷 처리 함수는 패킷만 받는 게 아니라, 패킷을 누가 수신했는지, 보낸 사람은 누군지 등을 내포하는 맥락(context)도 전달받습니다. `#play`로 등록한 패킷과 `#configuration`으로 등록한 패킷은 전달받는 맥락의 타입이 다르기 때문에(`PlayPayloadContext` vs `ConfigurationPayloadContext`), 패킷 집합에 `#common`을 통해 등록하셨다면 `IPayloadContext`를 대신 인자로 받으셔야 합니다.
- 패킷 처리 함수는 네트워크 스레드에서 호출됩니다. 본 게임과 병렬적으로 실행되기 때문에 부하가 큰 작업은 여기서 수행하세요.
- 만약 메인 스레드에서 코드를 실행해야 한다면 `workHandler`를 통해 메인 스레드에 작업을 전송하실 수 있습니다.
  - `workHandler`는 메인 스레드에 작업을 전송할 `ISynchronizedWorkHandler`를 반환합니다.
  - `submitAsync`는 `CompletableFuture`를 반환합니다. 한번에 다른 `Future`와 엮고 예외처리를 하실 수 있습니다.
  - `CompletableFuture`의 예외를 처리하지 않으시면 무시되어 **오류가 났는지도 모를 수 있습니다**.

이제 클라이언트와 서버 간 통신하는 법을 알았으니 새로운 패킷을 만들어 보세요. 직접 만든 패킷을 사전 설정 단계에서 사용하시려면 [여기][Configuration Tasks]를 참고하세요. 

[Configuration Tasks]: ./configuration-tasks.md
