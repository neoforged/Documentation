# 새로운 패킷 등록하기

패킷은 임의의 데이터를 클라이언트와 서버가 서로 주고받을 때 사용합니다. 각 패킷은 한 네임 스페이스 아래 `PayloadRegistrar`(패킷 집합)에 등록하며, 이는 `RegisterPayloadHandlerEvent`를 통해 받을 수 있습니다.

```java
@SubscribeEvent
public static void register(final RegisterPayloadHandlerEvent event) {
    // Sets the current network version
    final PayloadRegistrar registrar = event.registrar("1");
}
```

예를 들어 아래 데이터를 전송한다고 할 때:

```java
public record MyData(String name, int age) {}
```

`CustomPacketPayload`인터페이스를 구현하여 네트워크로 전송될 수 있도록 만드세요.

```java
public record MyData(String name, int age) implements CustomPacketPayload {
    
    public static final CustomPacketPayload.Type<MyData> TYPE = new CustomPacketPayload.Type<>(new ResourceLocation("mymod", "my_data"));

    // Each pair of elements defines the stream codec of the element to encode/decode and the getter for the element to encode
    // 'name' will be encoded and decoded as a string
    // 'age' will be encoded and decoded as an integer
    // The final parameter takes in the previous parameters in the order they are provided to construct the payload object
    public static final StreamCodec<ByteBuf, MyData> STREAM_CODEC = StreamCodec.composite(
        ByteBufCodecs.STRING_UTF8,
        MyData::name,
        ByteBufCodecs.VAR_INT,
        MyData::age,
        MyData::new
    )
    
    @Override
    public CustomPacketPayload.Type<? extends CustomPacketPayload> type() {
        return TYPE;
    }
}
```

As you can see from the example above the `CustomPacketPayload` interface requires us to implement the `type` method. The `type` method is responsible for returning a unique identifier for this payload. We then also need a reader to register this later on with the `StreamCodec` to read and write the payload data.

마지막으로, 위 패킷 집합에 등록하세요:

```java
@SubscribeEvent
public static void register(final RegisterPayloadHandlerEvent event) {
    final PayloadRegistrar registrar = event.registrar("1");
    registrar.playBidirectional(
        MyData.Type,
        MyData.STREAM_CODEC,
        new DirectionalPayloadHandler<>(
            ClientPayloadHandler::handleData,
            ServerPayloadHandler::handleData
        )
    );
}
```

Dissecting the code above we can notice a couple of things:
- The registrar has `play*` methods, that can be used for registering payloads which are sent during the play phase of the game.
    - Not visible in this code are the methods `configuration*` and `common*`; however, they can also be used to register payloads for the configuration phase. The `common` method can be used to register payloads for both the configuration and play phase simultaneously.
- The registrar uses a `*Bidirectional` method, that can be used for registering payloads which are sent to both the logical server and logical client.
    - Not visible in this code are the methods `*ToClient` and `*ToServer`; however, they can also be used to register payloads to only the logical client or only the logical server, respectively.
- The type of the payload is used as a unique identifier for the payload.
- The [stream codec][streamcodec] is used to read and write the payload to and from the buffer sent across the network
- The payload handler is a callback for when the payload arrives on one of the logical sides.
    - If a `*Bidirectional` method is used, a `DirectionalPayloadHandler` can be used to provide two separate payload handlers for each of the logical sides.

이제 새로운 패킷을 등록했으니 수신 시 수행할 동작을 구현하겠습니다. 간결함을 위해 클라이언트 수신시 동작만 다루겠지만, 서버도 이와 동일합니다.

```java
public class ClientPayloadHandler {
    
    public static void handleData(final MyData data, final IPayloadContext context) {
        // 네트워크 스레드에서 패킷 데이터 사용
        blah(data.name());
        
        // 메인 스레드에서 데이터 사용
        context.enqueueWork(() -> {
            blah(data.age());
        })
        .exceptionally(e -> {
            // 예외 처리
            context.disconnect(Component.translatable("my_mod.networking.failed", e.getMessage()));
            return null;
        });
    }
}
```

위 예시에서 주목하실 점은:

- 패킷 처리 함수는 패킷만 받는 게 아니라, 패킷을 누가 수신했는지, 보낸 사람은 누군지 등을 내포하는 맥락(context)도 전달받습니다. `#play`로 등록한 패킷과 `#configuration`으로 등록한 패킷은 전달받는 맥락의 타입이 다르기 때문에(`PlayPayloadContext` vs `ConfigurationPayloadContext`), 패킷 집합에 `#common`을 통해 등록하셨다면 `IPayloadContext`를 대신 인자로 받으셔야 합니다.
- 패킷 처리 함수는 네트워크 스레드에서 호출됩니다. 본 게임과 병렬적으로 실행되기 때문에 부하가 큰 작업은 여기서 수행하세요.
- 만약 메인 스레드에서 코드를 실행해야 한다면 `enqueueWork`를 통해 메인 스레드에 작업을 전송하실 수 있습니다.
  - 위 메서드는 메인 스레드에 작업을 전송할 `ISynchronizedWorkHandler`를 반환합니다.
  - `submitAsync`는 `CompletableFuture`를 반환합니다. 한번에 다른 `Future`와 엮고 예외처리를 하실 수 있습니다.
  - `CompletableFuture`의 예외를 처리하지 않으시면 무시되어 **오류가 났는지도 모를 수 있습니다**.

Now that you know how you can facilitate the communication between the client and the server for your mod, you can start implementing your own payloads.
With your own payloads you can then use those to configure the client and server using [Configuration Tasks][]

[configuration]: ./configuration-tasks.md
[streamcodec]: ./streamcodecs.md
