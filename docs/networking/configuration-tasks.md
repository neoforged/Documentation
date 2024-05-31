# 사전 설정

마인크래프트는 플레이어가 서버에 접속하기 전, 서버가 클라이언트를 설정하는 단계가 있습니다. 이 단계는 사전 설정 단계라 불리며, 바닐라에선 리소스팩 정보를 클라이언트에 보낼 때 사용합니다.

모드들도 이 단계에 패킷을 전송하여 추가 설정 정보를 보낼 수 있습니다.

## 사전 설정 추가하기

설정 단계에 패킷을 보내시려면 먼저 `RegisterConfigurationTasksEvent`를 통해 사전 설정을 등록하셔야 합니다.

```java
@SubscribeEvent
public static void register(final RegisterConfigurationTasksEvent event) {
    event.register(new MyConfigurationTask());
}
```

`RegisterConfigurationTasksEvent`는 모드별 버스에 방송되며, 새로 접속하는 클라이언트와 통신하는 패킷 리스너를 제공합니다. 이 리스너를 활용해 클라이언트에 귀하의 모드가 있는지 확인하고, 이에 맞는 사전 설정을 추가하실 수 있습니다.

## 사전 설정 구현하기

A configuration task is a simple interface: `ICustomConfigurationTask`. This interface has two methods: `void run(Consumer<CustomPacketPayload> sender);`, and `ConfigurationTask.Type type();` which returns the type of the configuration task. The type is used to identify the configuration task. An example of a configuration task is shown below:

```java
public record MyConfigurationTask implements ICustomConfigurationTask {
    public static final ConfigurationTask.Type TYPE = new ConfigurationTask.Type(new ResourceLocation("mymod", "my_task"));
    
    @Override
    public void run(final Consumer<CustomPacketPayload> sender) {
        final MyData payload = new MyData();
        sender.accept(payload); // 클라이언트에 사전 설정 패킷 MyData 전송
    }

    @Override
    public ConfigurationTask.Type type() {
        return TYPE; // 다른 사전 설정과 구분하기 위한 Type
    }
}
```

## 사전 설정 승인하기

서버는 각 사전 설정을 하나씩 수행합니다, 설정이 완료되었다고 승인되어야 다음 설정으로 넘어갑니다. 

사전 설정을 승인하는 데는 두 가지 방법이 있습니다: 

### 리스너 재사용하기

사전 설정에 있어 클라이언트의 응답이 필요 없을 경우 단순히 클라이언트의 리스너를 통해 서버에서 완료로 승인하면 됩니다.

```java
public record MyConfigurationTask(ServerConfigurationListener listener) implements ICustomConfigurationTask {
    public static final ConfigurationTask.Type TYPE = new ConfigurationTask.Type(new ResourceLocation("mymod", "my_task"));
    
    @Override
    public void run(final Consumer<CustomPacketPayload> sender) {
        final MyData payload = new MyData();
        sender.accept(payload);
        this.listener().finishCurrentTask(this.type());
    }

    @Override
    public ConfigurationTask.Type type() {
        return TYPE;
    }
}
```

클라이언트의 리스너는 아래와 같이 `RegisterConfigurationTasksEvent`에서 받아올 수 있습니다.

```java
@SubscribeEvent
public static void register(final RegisterConfigurationTasksEvent event) {
    event.register(new MyConfigurationTask(event.getListener()));
}
```

이러면 다음 사전 설정이 바로 수행되며 클라이언트의 응답은 필요 없습니다, 다시 말해서 클라이언트가 사전 설정을 완료하기까지 기다리지 않습니다.

### 클라이언트에서 사전 설정 승인하기

만약 클라이언트에서도 사전 설정이 성공했다고 승인해야 한다면, 아래와 같이 클라이언트가 설정 성공시 대답할 때 사용할 패킷을 정의하세요:

```java
public record AckPayload() implements CustomPacketPayload {
    public static final CustomPacketPayload.Type<AckPayload> TYPE = new CustomPacketPayload.Type<>(new ResourceLocation("mymod", "ack"));
    
    // Unit codec with no data to write
    public static final StreamCodec<ByteBuf, AckPayload> STREAM_CODEC = StreamCodec.unit(new AckPayload());

    @Override
    public CustomPacketPayload.Type<? extends CustomPacketPayload> type() {
        return TYPE;
    }
}
```

클라이언트는 서버에서 보낸 사전 설정 패킷을 완전히 처리한 이후, 위 패킷을 서버에 전송하여 설정이 완료되었음을 알릴 수 있습니다.

```java
public void onMyData(MyData data, IPayloadContext context) {
    context.enqueueWork(() -> {
        blah(data.name());
    })
    .exceptionally(e -> {
        // 예외 처리
        context.disconnect(Component.translatable("my_mod.configuration.failed", e.getMessage()));
        return null;
    })
    .thenAccept(v -> {
        context.reply(new AckPayload());
    });     
}
```

여기서 `onMyData`는 서버가 사전 설정 도중 보낸 패킷을 처리하는 함수입니다.

서버는 클라이언트의 대답을 받으면 사전 설정이 완료되었다고 승인하고, 이제 다음 설정 작업으로 넘어갑니다: 

```java
public void onAck(AckPayload payload, IPayloadContext context) {
    context.finishCurrentTask(MyConfigurationTask.TYPE);
}
```

여기서 `onAck`는 클라이언트가 보낸 승인 패킷을 처리하는 함수입니다.

## 로그인 지연

사전 설정이 승인되지 않는다면 서버는 계속 기다리고, 클라이언트는 게임에 접속하지 못합니다. 그러기에 설정 성공 시 무조건 완료로 표시되어야 하고, 실패 시 바로 클라이언트와의 연결을 끊어야 합니다.
