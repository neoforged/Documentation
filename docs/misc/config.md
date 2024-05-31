# 모드 설정 파일

설정 파일은 모드를 설정할 수 있도록 하고 기본값을 정의합니다. 네오 포지는 설정 파일로 [TOML][toml]을 사용하며, [NightConfig][nightconfig]를 사용하여 설정 파일을 읽습니다.

## 설정 파일 만들기

설정 파일은 `IConfigSpec`을 구현하는 것으로 정의할 수 있습니다. 네오 포지의 `ModConfigSpec`은 해당 인터페이스를 구현하며, `ModConfigSpec$Builder`를 활용해 해당 클래스를 생성합니다. `Builder#push`를 이용해 새로운 섹션에 들어갈 수 있고, `Builder#pop`으로 나올 수 있습니다. 이후, 아래 두 메서드를 이용하여 설정을 생성하실 수 있습니다:

| 메서드 이름      | 설명                                               |
|:------------|:-------------------------------------------------|
| `build`     | `ModConfigSpec` 생성.                              |
| `configure` | 모드 설정 값들을 지니고 있는 타입 T와 `ModConfigSpec`의 Pair 생성. |

:::note
`ModConfigSpec$Builder#configure`는 일반적으로 `static`에서 사용되며, 이때 생성자 인자 중 하나로 `ModConfigSpec$Builder`를 받는 타입 T를 사용합니다:

```java
// 모드 설정 클래스에서
ExampleConfig(ModConfigSpec.Builder builder) {
    // Define values here in final fields
}

// 모드 설정 클래스를 사용하는 곳에서
static {
    Pair<ExampleConfig, ModConfigSpec> pair = new ModConfigSpec.Builder()
        .configure(ExampleConfig::new);
    // Store pair values in some constant field
}
```
:::

각 설정 값들은 추가 설명 또한 지정받을 수 있습니다. 이러한 추가 설명은 모드 설정을 생성하기 전에 지정해야 합니다:

| 메서드 이름         | 설명                                     |
|:---------------|:---------------------------------------|
| `comment`      | 해당 설정값의 역할을 추가할 때 사용함. 한 줄 또는 여러 줄 가능. |
| `translation`  | 해당 설정값의 번역 키값을 지정함.                    |
| `worldRestart` | 해당 설정값을 적용하기 위해 월드를 다시시작 해야 하는지 지정함.   |

### ConfigValue

설정값은 `#define*` 메서드들을 활용해 정의할 수 있습니다.

이 메서드들은 최소한 아래 두 개를 인자로 받는데:

- 해당 설정값의 경로, `List<String>` 또는 `.`으로 구분된 `String`을 사용함. `.`으로 구분된 `String`은 `.`을 기준으로 `List<String>`으로 분할함. 이 경로는 설정값의 이름과 경로를 전부 포함함.
- 올바른 설정 파일이 존재하지 않을 때 사용할 기본값

`ConfigValue` 전용 머세드는 아래 두 개의 추가 구성 요소가 필요한데:

- 비직렬화된 객체가 올바른지 확인하는 검사기
- 해당 설정값의 클래스

```java
// ModConfigSpec$Builder를 사용하는 곳 어딘가
ConfigValue<T> value = builder.comment("Comment")
    .define("config_value_name", defaultValue);
```

비직렬화된 설정값은 `ConfigValue#get`을 활용해 얻을 수 있습니다. 이 값들은 중간에 캐싱되어 파일을 여러 번 읽는 것을 방지합니다.

#### 유용할 만한 설정값 타입들

- **범위가 지정된 값**
    - 설명: 값은 무조건 지정된 범위 안에 있어야 함
    - 타입: `Comparable<T>`
    - 메서드 이름: `#defineInRange`
    - 추가 구성 요소:
        - 최소와 최댓값
        - 설정값을 표현할 수 있는 클래스

:::note
포지는 기본적으로 `DoubleValue`, `IntValue`, `LongValue`를 제공합니다.
:::

- **화이트리스트 값**
    - 설명: 설정값은 무조건 전달된 리스트 안 객체여야 함
    - 타입: `T`
    - 메서드 이름 Name: `#defineInList`
    - 추가 구성 요소:
        - 허용된 설정값들의 리스트

- **리스트 값**
    - 설명: 여러 요소를 포함하는 리스트를 값으로 가지는 설정
    - 타입: `List<T>`
    - 메서드 이름: `#defineList`, 빈 리스트를 허용한다면 `#defineListAllowEmpty`
    - 추가 구성 요소:
        - 리스트의 구성 요소가 올바른지 확인하는 검사기

- **열거형 값**
    - 설명: An enum value in the supplied collection
    - 타입: `Enum<T>`
    - 메서드 이름: `#defineEnum`
    - 추가 구성 요소:
        - 정수, 또는 문자열을 열거형 값 중 하나로 변환해 줄 함수
        - 허용된 설정값들의 컬렉션

- **불린 값**
    - 설명: `boolean` 값
    - 타입: `Boolean`
    - 이름: `#define`

## 설정 등록하기

`ModConfigSpec`의 인스턴스를 생성하셨다면 이를 네오 포지에 등록해야 자동으로 불러오고, 추적하고, 동기화할 수 있습니다. 모드 생성자에서 `ModContainer#registerConfig` 를 호출하여 다음과 같이 설정을 등록하실 수 있습니다, 이때 해당 설정을 사용할 사이드와, 생성하신 `ModConfigSpec`, 그리고 선택 사항으로 설정 파일의 이름을 인자로 전달합니다:

```java
// In the main mod file with a ModConfigSpec CONFIG
public ExampleMod(ModContainer container) {
    container.registerConfig(ModConfig.Type.COMMON, CONFIG);

    // Do other things
}
```

설정 파일을 사용할 수 있는 사이드 목록들:

|  사이드   |  불러옴 여부  | 클라이언트와 동기화 되는가? |                클라이언트에서의 파일 위치                |             서버에서의 파일 위치              | 파일 접미사    |
|:------:|:--------:|:---------------:|:--------------------------------------------:|:------------------------------------:|:----------|
| CLIENT |  클라이언트만  |       안 함       |             `.minecraft/config`              |                 N/A                  | `-client` |
| COMMON | 양측 사이드 다 |       안 함       |             `.minecraft/config`              |       `<server_folder>/config`       | `-common` |
| SERVER |  서버에서만   |        함        | `.minecraft/saves/<level_name>/serverconfig` | `<server_folder>/world/serverconfig` | `-server` |

:::tip
자세한 내용은 네오 포지의 [Javadoc][type]을 참고하세요.
:::

## 설정 관련 이벤트

설정 파일을 처음으로 불러오거나 다시 불러올 때 이벤트 `ModConfigEvent.Loading`와 `ModConfigEvent.Reloading`가 방송됩니다. 이 이벤트들은 [모드 버스에서 방송됩니다][events].

:::caution
해당 이벤트들은 모든 모드에서 방송될 수 있습니다, 제공되는 `ModConfig`를 이용해서 어떤 모드의 설정이 변경되는지 반드시 구분하도록 하세요.
:::

[toml]: https://toml.io/ko/v1.0.0
[nightconfig]: https://github.com/TheElectronWill/night-config
[type]: https://github.com/neoforged/FancyModLoader/blob/19d6326b810233e683f1beb3d28e41372e1e89d1/core/src/main/java/net/neoforged/fml/config/ModConfig.java#L83-L111
[events]: ../concepts/events.md#이벤트-핸들러-등록하기
