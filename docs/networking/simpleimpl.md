SimpleImpl
==========

SimpleImpl 은 `SimpleChannel`을 사용하는 패킷 통신 시스템에 주어진 이름입니다. 이 시스템을 사용하는 것은 가장 쉽게 서버와 클라이언트간 통신을 구현할 수 있는 방법입니다.

시작하기
---------------

가장 첫번째로 `SimpleChannel` 객체를 만들어야 합니다. 이는 `ModidPacketHandler` 처럼 따로 클래스를 만든 이후 거기서 하시는 것을 추천드립니다. 이때 만드시는 `SimpleChannel` 객체는 다음처럼 정적 필드로 만드세요:

```java
private static final String PROTOCOL_VERSION = "1";
public static final SimpleChannel INSTANCE = NetworkRegistry.newSimpleChannel(
  new ResourceLocation("mymodid", "main"),
  () -> PROTOCOL_VERSION,
  PROTOCOL_VERSION::equals,
  PROTOCOL_VERSION::equals
);
```

첫번째 인자는 채널의 이름입니다. 두번째 인자는 현재 프로토콜 버전을 반환하는 `Supplier<String>` 입니다. 세번째 인자는 연결을 시도하는 측의 프로토콜 버전이 클라이언트와 호환되는지 확인하는 `Predicate<String>`, 네번째 인자는 연결을 시도하는 측의 프로토콜 버전이 서버와 호환되는지 확인하는 `Predicate<String>` 입니다.
이 예제에서는 단순하게 접속하는 측의 프로토콜 버전이 `PROTOCOL_VERSION` 과 동일한지 바로 비교합니다, 즉 이 경우에서는 서버와 클라이언트의 `PROTOCOL_VERSION` 이 일치해야만 FML 이 로그인을 허용해 줍니다.

버전 확인
-------------------

만약 모드에서 만든 네트워크 채널이 반대쪽에 없어도 된다면, 또는 아예 포지가 없어도 된다면 버전 확인자들 (`Predicate<String>` 파라미터들)을 적절하게 정의하여 추가적인 "메타-버전" 들 또한 처리하도록 만들어야 합니다 (메타 버전들은 `NetworkRegistry` 에 정의되어 있습니다, 아래 나와있는 것은 String 이 아니고 필드 이름입니다). 이 버전들의 종류와 의미는 다음과 같습니다:

* `ABSENT` - 채널이 반대쪽에 없는 경우, 이때 반대쪽은 포지가 설치되어 있으며 다른 모드가 있을 수 있습니다.
* `ACCEPTVANILLA` - 반대쪽이 바닐라거나 포지가 없는 경우.

위 두 필드들은 반대쪽에 채널이 아예 없어 버전 확인자에서 비교할 프로토콜 버전이 없는 경우 대신 사용됩니다. 이 두 경우에 다 `false`를 반환하면 반대쪽에 채널이 있도록 강제할 수 있습니다. 위에 예제 코드를 그대로 복사해서 쓰시면 반대쪽에 채널이 있도록 강제합니다. 이 버전 확인 방식은 서버 목록 화면에서 호환성 체크를 할 때에도 사용됩니다, 이로 인해 초록색 체크 모양 또는 빨간색 X가 서버 목록에 표시될 수 있습니다.

패킷 등록하기
-------------------

그 다음으로 주고 받을 메세지들을 정의해야 합니다. 이는 `INSTANCE#registerMessage`를 이용해 할 수 있는데, 이 메서드는 5개의 인자를 받습니다:

- 첫번째 인자는 패킷을 판별할 때 사용할 판별자 입니다. ID 라고 부르기도 합니다. 이 판별자는 같은 채널에서는 고유하여야 합니다, 다른 채널끼리는 판별자가 같아도 문제가 발생하지 않습니다. 판별자로는 어떤 값을 사용하셔도 고유하기만 한다면 상관 없으니 지역 변수를 사용하여 메세지 하나 등록할 때 마다 `id++`를 하여 늘 고유한 값이 나오도록 하세요.
- 두번째 인자는 패킷 클래스 `MSG` 입니다.
- 세번째 인자는 `BiConsumer<MSG, FriendlyByteBuf>` 입니다, 패킷 클래스를 `FriendlyByteBuf` 에 작성하는 역할을 합니다.
- 네번째 인자는 `Function<FriendlyByteBuf, MSG>` 입니다, `FriendlyByteBuf` 로 부터 패킷 클래스를 읽어들이는 역할을 합니다.
- 마지막 인자는 `BiConsumer<MSG, Supplier<NetworkEvent.Context>>` 입니다, 패킷을 받을시 사용할 핸들러 입니다.

뒤 3개의 인자들은 정적 또는 인스턴스 메서드의 레퍼런스를 사용하여도 됩니다. 기억해두셔야 할 점은 `MSG#encode(FriendlyByteBuf)` 인스턴스 메서드는 `BiConsumer<MSG, FriendlyByteBuf>` 로 사용하실 수 있다는 것입니다; `MSG` 의 인스턴스는 암묵적으로 `BiConsumer`의 첫번째 인자로 사용됩니다.

패킷 핸들링 하기
----------------

패킷 핸들러에는 몇가지 강조할 사항이 있습니다: 패킷 핸들러는 메세지 클래스 뿐만 아니라, 네트워크 콘텍스트도 같이 반습니다. 이 콘텍스트를 사용해서, (서버에서 패킷을 받았다면) 패킷을 보낸 플레이어에 접근할 수 있고 스레드 안전성을 준수해야만 하는 작업들을 요청할 수 있습니다.

```java
public static void handle(MyMessage msg, Supplier<NetworkEvent.Context> ctx) {
  ctx.get().enqueueWork(() -> {
    // 스레드 안전성을 준수해야 하는 작업들 (대부분의 작업들이 이에 포함될 것입니다)
    ServerPlayerEntity sender = ctx.get().getSender(); // the client that sent this packet
    // 무언가 아무거나 더 하기
  });
  ctx.get().setPacketHandled(true);
}
```

서버에서 클라이언트로 보낸 패킷은 아예 다른 클래스에서 핸들링 해야 하며, `DistExecutor#unsafeRunWhenOn` 와 같은 방법을 사용해 물리 클라이언트에서만 실행되도록 하여야 합니다.

```java
// In Packet class
public static void handle(MyClientMessage msg, Supplier<NetworkEvent.Context> ctx) {
  ctx.get().enqueueWork(() ->
    // 확실하게 물리 클라이언트에서만 실행되도록 합니다.
    DistExecutor.unsafeRunWhenOn(Dist.CLIENT, () -> () -> ClientPacketHandlerClass.handlePacket(msg, ctx))
  );
  ctx.get().setPacketHandled(true);
}

// ClientPacketHandlerClass 내용
public static void handlePacket(MyClientMessage msg, Supplier<NetworkEvent.Context> ctx) {
  // 무언가 하기
}
```

`#setPacketHandled`를 여러번 사용하는 것을 보셨을텐데, 이는 네트워크 시스템에게 패킷이 성공적으로 처리되었음을 알리는 것입니다.

:::caution
마인크래프트 1.8 이후로는 패킷은 네트워크 스레드에서 처리됩니다.

즉 패킷 핸들러는 게임과 직접적으로 상호작용할 수 _없습니다_. 포지에서는 `NetworkEvent$Context`를 통해 간단하게 코드를 메인 스레드에서 실행하는 방법을 제공합니다. 이는 단순하게 `NetworkEvent$Context#enqueueWork(Runnable)`을 호출하는 것인데, 메인 스레드는 이때 전달된  `Runnable`을 빠른 시일내에 실행합니다.
:::

:::caution
서버에서 클라이언트에서 보낸 패킷을 처리하는 패킷 핸들러를 만들 때 주의하도록 하세요, 클라이언트가 서버에서 예기치 못한 데이터를 보내 취약점을 악용할 수 있습니다.

가장 흔한 사례는 **무작위 청크 생성** 입니다. 서버가 클라이언트에서 보낸 블록의 위치를 그대로 믿고 이를 이용해 블록/블록 엔티티에 접근하려고 할 때 문제가 발생할 수 있는데, 만약 아직 청크가 메모리 상에 존재하지 않는 곳에 있는 블록/블록 엔티티에 접근하려고 하면 서버에서는 디스크에서 불러오거나 새로 청크를 생성합니다. 이는 **심각한** 보안 취약점중 하나로, 흔적도 남기지 않고 서버 성능과 디스크 용량에 **매우 큰** 피해를 끼칠 수 있습니다.

이러한 공격을 막기 위해 일반적으로 많이 사용하는 방법은 `Level#hasChunkAt` 이 참인 곳만의 블록/블록 엔티티에 접근하는 것입니다. 이를 통해 메모리상에 존재하지 않는 청크에 접근하는 것을 막을 수 있습니다.
:::

패킷 보내기
---------------

### 서버에 보내기

서버로 패킷을 보내는 방법은 하나밖에 없습니다. 왜냐하면 클라이언트는 한번에 *하나의* 서버에만 접속할 수 있기 때문입니다. 패킷을 보내기 위해서는 이전에 정의한 `SimpleChannel`을 다시 사용할 것인데, 단순히 `INSTANCE.sendToServer(new MyMessage())`를 호출하세요. 이 메세지는 패킷에 알맞는 핸들러로 (만약 있다면)보내집니다.

### 클라이언트(들)에 보내기

패킷을 `SimpleChannel`을 사용해 직접적으로 클라이언트에 전송할 수 있습니다:

`INSTANCE.sendTo(new MyClientMessage(), serverPlayer.connection.getConnection(), NetworkDirection.PLAY_TO_CLIENT)`. 그러나 이 방식은 사용하기 불편할 수 있는데, 포지에서는 조금 더 쉽게 패킷을 보내주는 함수들을 제공합니다:

```java
// 플레이어 한명에게 보내기
INSTANCE.send(PacketDistributor.PLAYER.with(serverPlayer), new MyMessage());

// 이 레벨 청크를 추적하고 있는 모든 플레이어에게 보내기
INSTANCE.send(PacketDistributor.TRACKING_CHUNK.with(levelChunk), new MyMessage());

// 모든 플레이어에게 보내기
INSTANCE.send(PacketDistributor.ALL.noArg(), new MyMessage());
```

`PacketDistributor` 는 위에 나온 것 말고도 더 많은 종류가 있습니다; `PacketDistributor` 클래스의 문서를 통해 더 자세히 알아보실 수 있습니다.
