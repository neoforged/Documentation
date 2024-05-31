---
sidebar_position: 2
---
# 사이드

마인크래프트도 다른 프로그램들처럼 클라이언트-서버 구조를 따릅니다, 클라이언트는 사용자에게 데이터를 표시하고, 서버는 데이터를 처리합니다. 이들을 사이드라 칭합니다. 컴퓨터를 자주 사용하시거나, 특히 게임좀 해보신 분들이라면 이 둘이 뭔지 잘 알겁니다, 그렇죠?

사실 아닙니다, 마인크래프트는 사이드를 구분하는 방법이 두 가지라 모드 개발에 많은 혼란을 유발합니다. 사이드를 나누는 기준은 논리, 그리고 물리가 있습니다.  

## 논리 vs 물리 사이드

### 물리 사이드

물리 사이드는 무슨 프로그램을 실행했느냐로 사이드를 구분합니다. 예를 들어 **물리 클라이언트**는 Minecraft Launcher에서 플레이 버튼을 눌러 실행하는 게임을 의미합니다. 물리 클라이언트의 "물리"는 실행한 것이 "클라이언트 프로그램"임을 의미합니다. 그래픽, 소리와 같은 기능은 물리 클라이언트에서만 사용 가능합니다. 그 반대로, **물리 서버**는 전용 서버를 의미하며, 버킷과 같은 마인크래프트 서버 JAR 파일로 실행한 프로그램을 의미합니다. 전용 서버는 관리를 위한 기초적인 GUI를 제공하지만, 3D 그래픽이나 소리와 같은 클라이언트 전용 기능들이 전부 누락되어 있습니다. 전용 서버에서 클라이언트 전용 기능을 사용하려 하면 클래스를 찾을 수 없다며 충돌이 일어나 주의해야 합니다.

### 논리 사이드

논리 사이드는 마인크래프트 내부 구조에서 사이드를 나누는 기준입니다. **논리 서버**는 게임의 메카닉을 처리하는 코드입니다. 날씨 변동, 엔티티 소환, 시간의 흐름 등은 논리 서버에서 처리하며, 인벤토리 아이템, 체력과 같은 데이터도 서버가 관리합니다. 그 반대로, **논리 클라이언트**는 화면에 데이터를 띄우는 역할을 합니다. 마인크래프트는 클라이언트 코드를 분리해 `net.minecraft.client` 패키지에 작성합니다. 그리고 렌더 스레드에서 이 코드를 실행합니다. 그 외 나머지는 공용 코드로 취급되어, 클라이언트 및 서버 둘 다에서 사용할 수 있습니다.

### 차이가 뭔가요?

논리 사이드와 물리 사이드의 차이를 아래 예를 들어 설명하겠습니다:

- 플레이어가 **멀티 플레이어** 서버에 접속함: 플레이어의 물리 클라이언트 프로그램의 논리 클라이언트 부분이 물리 서버의 논리 서버 부분에 접속한 것.
- 플레이어가 **싱글 플레이어** 월드에 접속함: 플레이어의 물리 클라이언트 프로그램의 논리 서버 부분가 실행됨. 이후 논리 클라이언트가 이 논리 서버에 접속함. 네트워크로 비유하자면, `localhost`에 접속한 것과 유사함(네트워크 소켓은 사용하지 않음).

위 상황을 살펴보면 문제가 드러나는데: 물리 클라이언트의 논리 서버에선 코드가 잘 실행되더라도, 물리 서버의 논리 서버에선 오류가 발생할 수 있습니다. 그렇기에 무조건 모드를 전용 서버에서도 테스트 해야 합니다. `NoClassDefFoundError`와 `ClassNotFoundException`는 클라이언트와 서버의 코드를 제대로 분리하지 못해 발생하는 예외로, 모드 개발시 가장 많이 발생합니다. 이것 말고도 하나의 정적 필드를 양 논리 사이드에서 사용하는 것도 문제인데, 오류가 나긴 한건지, 뭐가 잘못된건지 드러나지 않기 때문입니다.

:::tip
사이드끼리 데이터를 전달해야 한다면 무조건 [패킷][networking]을 사용하세요.
:::

네오 포지에선 물리 사이드는 `Dist`, 논리 사이드는 `LogicalSide`가 대표합니다.

:::info
옛날에는 전용 서버 JAR에 클라이언트엔 없는 클래스가 일부 있었습니다. 하지만 최근 버전은 그렇지 않으며, 물리 서버는 물리 클라이언트의 일부라 볼 수 있습니다.
:::

## 사이드 전용 기능 만들기

### `Level#isClientSide()`

이 메서드는 사이드를 확인하는데 가장 많이 사용되며, `Level` 객체를 이용해 현재 **논리 사이드**가 어디인지 확인합니다: 반환값이 `true`라면 논리 클라이언트, `false`라면 논리 서버입니다. 물리 서버에서는 언제나 `false`만 반환되지만, `false`가 반환되었다고 물리 서버라 단정지을 순 없습니다, 물리 클라이언트의 논리 서버도 `false`를 반환하기 때문입니다(예: 싱글 플레이어 월드).

게임 메카닉을 처리해야 할지 결정할 때 이 메서드를 사용하세요. 엔티티의 위치, 체력, 플레이어의 동작, 아이템의 갯수와 종류, 블록 등의 정보를 수정하는 코드는 무조건 논리 서버에서만 실행해야 합니다. 논리 클라이언트에서 위 정보를 수정하면 동기화가 깨져 운 좋으면 시각적 오류(유령 엔티티, 가짜 블록 등)가 발생하고, 운 없으면 게임이 충돌합니다.

:::tip
`Level` 객체를 사용할 수 있다면 사이드를 확인할 땐 거의 이 방법만 사용하세요.
:::

### `FMLEnvironment.dist`

`FMLEnvironment.dist`는 `Level#isClientSide()`와 다르게, **물리** 사이드를 확인할 때 사용합니다. 만약 이 필드의 값이 `Dist.CLIENT`라면 물리 클라이언트, `Dist.DEDICATED_SERVER`라면 물리 서버입니다.


#### `@Mod`

Checking the physical environment is important when dealing with client-only classes. The recommended way to separate code that should only be executed on one physical client is by specifying a separate [`@Mod` annotation][mod], setting the `dist` parameter to the physical side the mod class should be loaded on:

```java
@Mod("examplemod")
public class ExampleMod {
    public ExampleMod(IEventBus modBus) {
        // Perform logic in that should be executed on both sides
    }
}

@Mod(value = "examplemod", dist = Dist.CLIENT) 
public class ExampleModClient {
    public ExampleModClient(IEventBus modBus) {
        // Perform logic in that should only be executed on the physical client
        Minecraft.getInstance().whatever();
    }
}

@Mod(value = "examplemod", dist = Dist.DEDICATED_SERVER) 
public class ExampleModDedicatedServer {
    public ExampleModDedicatedServer(IEventBus modBus) {
        // Perform logic in that should only be executed on the physical server
    }
}
```

```java

```

:::tip
모드는 물리 사이드 어디에 설치하든 동작해야 합니다. 다시 말해 클라이언트 전용 모드를 만들더라도 물리 사이드가 클라이언트인지 확인하세요, 그리고 물리 사이드가 서버라면 모든 기능을 비활성화 하세요.
:::

[networking]: ../networking/index.md
[mod]: ../gettingstarted/modfiles.md#javafml-and-mod
