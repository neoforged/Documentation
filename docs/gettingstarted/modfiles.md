모드 파일 (mods.toml)
=========

모드 파일은 JAR에 어떤 모드가 들어있는지, '모드' 메뉴에 표시할 정보는 무엇인지, 게임에서 모드를 불러오는 방법을 결정하는 역할을 합니다.

mods.toml
---------

`mods.toml` 파일은 모드의 메타데이터를 정의하고, 'Mods' 메뉴에서 게임을 불러오는 방법을 포함하고 있습니다.

이 파일은 [TOML][toml] 확장자를 사용하며 `META-INF` 폴더에 존재해야 합니다.
모드 소스 폴더의 리소스 디렉토리에 'META-INF'가 존재합니다. (`src/main/resources/META-INF/mods.toml`)

다음은 `mods.toml` 의 예시입니다.

```toml
modLoader="javafml"
loaderVersion="[46,)"

license = "All Rights Reserved"
issueTrackerURL = "https://github.com/MinecraftForge/MinecraftForge/issues"
showAsResourcePack = false

[[mods]]
modId = "examplemod"
version = "1.0.0.0"
displayName = "예제 모드"
updateJSONURL = "https://files.minecraftforge.net/net/minecraftforge/forge/promotions_slim.json"
displayURL = "https://minecraftforge.net"
logoFile = "logo.png"
credits = "I'd like to thank my mother and father."
authors = "Author"
description = '''
  흙으로 다이아몬드를 만들 수 있게 합니다! 신성한 노치가 만들었습니다. Jeb이 무지개를 만들었듯이, Dinnerbone이 거꾸로 만들었듯이.
  '''
displayTest = "MATCH_VERSION"

[[dependencies.examplemod]]
  modId="forge"
  mandatory=true
  versionRange="[46,)"
  ordering="NONE"
  side="BOTH"

[[dependencies.examplemod]]
  modId="minecraft"
  mandatory=true
  versionRange="[1.20]"
  ordering="NONE"
  side="BOTH"
```

`mods.toml`은 세 부분으로 나뉩니다.

1. 모드 파일과 연결된 모드에 대한 비모드 특정 속성
2. 각 모드에 대한 섹션이 있는 모드 속성
3. 각 모드 또는 모드의 종속성에 대한 섹션이 있는 종속성 구성입니다.
4.

mods.toml 파일과 관련된 각 속성은 아래에서 설명됩니다.
`mods.toml` 파일과 관련된 각 속성은 아래에서 설명합니다. 아래의 `required`는
값을 지정하지 않으면 예외가 발생함을 의미합니다.

### 비모드 속성

비모드 관련 속성은 JAR과 관련된 속성으로, 모드 및 전역 메타데이터를 로드하는 방법을 나타냅니다.

| Property             |  Type   |    Default    |                                                                          Description                                                                          | Example                                                         |
|:---------------------|:-------:|:-------------:|:-------------------------------------------------------------------------------------------------------------------------------------------------------------:|:----------------------------------------------------------------|
| `modLoader`          | string  | **mandatory** | 모드에서 사용하는 언어 로더. Kotlin 오브젝트와 같은 대체 언어 구조 또는 인터페이스 및 메서드와 같은 진입점을 결정하는 등 다양한 방법으로 사용할 수 있습니다. Forge는 Java 로더 `"javafml"` 및 lowno 코드 로더 `"lowcodefml"`을 지원합니다. | `"javafml"`                                                     |
| `loaderVersion`      | string  | **mandatory** |                                   javafml 및 lowcodefml의 경우 Maven 버전 범위로 표시된 언어 로더의 허용 가능한 버전 범위입니다. 버전은 Forge 버전의 주요 버전입니다.                                   | `"[46,)"`                                                       |
| `license`            | string  | **mandatory** |                    JAR에 존재하는 모드의 라이센스입니다. [SPDX 식별자][spdx]를 사용하는걸 권장합니다. 또는 자신에게 맞는 라이센스 선택을 위해 https://choosealicense.com/ 를 이용할 수 있습니다.                     | `"MIT"`                                                         |
| `showAsResourcePack` | boolean |    `false`    |                                         만약 `true`인 경우 모드의 리소스는 `Mod resources` 과 병합되지 않고 `Resource Packs` 메뉴에 나타납니다.                                          | `true`                                                          |
| `services`           |  array  |     `[]`      |                                    모드에서 사용하는 서비스의 배열입니다. 이는 Java Platform Module System의 Forge 구현에서 모드의 생성된 모듈의 일부로 사용됩니다.                                    | `["net.minecraftforge.forgespi.language.IModLanguageProvider"]` |
| `properties`         |  table  |     `{}`      |                 이것은 StringSubstitutor에서 `${file.<key>}`를 해당 값으로 대체하기 위해 사용됩니다. 현재 [mod-specific properties][modsp]에서 version을 대체하는 데만 사용됩니다.                  | `{ "example" = "1.2.3" }` referenced by `${file.example}`       |
| `issueTrackerURL`    | string  |   *nothing*   |                                                             모드 관련 문제를 보고하고 추적하는 위치를 나타내는 URL입니다.                                                              | `"https://forums.minecraftforge.net/"`                          |

:::메모
`services` 속성은 [`uses` 지시문][uses]에서 지정하는 것과 기능적으로 동일하며, 주어진 유형의 서비스를 [*로드*][serviceload]할 수 있습니다.
:::

### 모드별 속성

모드별 속성은 `[[mods]]` 헤더를 사용해 지정된 모드에 연결합니다. [Array of table][array]입니다.
모든 키/값 속성은 다음 헤더까지 연결됩니다.

```toml
# examplemod1의 속성

[[mods]]
modId = "examplemod1"

# examplemod2의 속성
[[mods]]
modId = "examplemod2"
```

| 속성              |   타입    |           기본값           |                                                                                          설명                                                                                          | 예시                                                                                 
|:----------------|:-------:|:-----------------------:|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|:-----------------------------------------------------------------------------------
| `modId`         | string  |         **필수**          |                                  모드를 위한 고유 식별자입니다. 아이디는 다음 정규식에 매치되어야 합니다: `^[a-z][a-z0-9_]{1,63}$` (2~64 글자 사이, 모두 소문자를 사용해야 함, 숫자 또는 밑줄(_)을 허용함.)                                  | `"examplemod"`                                                                     
| `namespace`     | string  |       `modId` 의 값       |                                  모드의 이름을 재정의 하는 네임스페이스입니다: `^[a-z][a-z0-9_.-]{1,63}$` (2~26 글자 사이, 소문자로 시작, 전부 소문자, 밑줄(또는 대시), 점으로 구성됨) 현재 사용하지 않음.                                  | `"example"`                                                                        
| `version`       | string  |          `"1"`          | 모드의 버전입니다. 특별한 이유가 없다면 [Maven의 버전을 모드 버전으로 사용하기][mvnver]를 사용해주세요. 만약 `${file.jarVersion}` 으로 설정하면, JAR의 `Implementation-Version`  manifest 설정으로 대체됩니다. (개발 환경에선 `0.0NONE` 으로 표시됩니다.) | `"1.19.4-1.0.0.0"`                                                                 
| `displayName`   | string  |       `modId` 의 값       |                                                                      모드를 화면에 나타낼 때 사용합니다. (예시. 모드 목록, 모드 불일치).                                                                       | `"예제 모드"`                                                                          
| `description`   | string  | `"MISSING DESCRIPTION"` |                                                             모드 목록 화면에 표시되는 모드의 설명입니다. [TOML에서 문자열 여러줄 작성하기][multiline].                                                              | `"이것은 예제 모드입니다!"`                                                                  
| `logoFile`      | string  |         *비어있음*          |                                    모드 목록 화면에서 사용되는 이미지 파일의 이름과 확장자입니다. 로고는 JAR의 루트에 있거나 소스 루트에 직접 있어야 합니다(예: 기본 소스 세트의 경우 `src/main/resources`).                                     | `"example_logo.png"`                                                               
| `logoBlur`      | boolean |         `true`          |                                                      `logoFile`을 렌더링하기 위해 `GL_LINEAR`(true) 또는 `GL_NEAREST`(false)를 사용할지 여부입니다.                                                      | `false`                                                                            
| `updateJSONURL` | string  |         *비어있음*          |                                                           실행중인 모드가 최신 버전인지 확인하기 위해 [업데이트 확인][update] 에서 사용하는 JSON URL입니다.                                                            | `"https://files.minecraftforge.net/net/minecraftforge/forge/promotions_slim.json"` 
| `features`      |  table  |          `{}`           |                                                                                 '[features]'를 확인하세요.                                                                                 | `{ java_version = "17" }`                                                          
| `modproperties` |  table  |          `{}`           |                                                                  모드와 관련된 키/값 테이블입니다. 현재 포지에서는 사용하지 않지만 모드에서 사용합니다.                                                                   | `{ example = "value" }`                                                            
| `modUrl`        | string  |         *비어있음*          |                                                                          모드 다운로드 페이지의 URL입니다. 현재 사용되지 않습니다.                                                                          | `"https://files.minecraftforge.net/"`                                              
| `credits`       | string  |         *비어있음*          |                                                                             모드 목록에 표시되는 크레딧(또는 도움을 준 이들)                                                                             | `"어쩌고님과 저쩌고님에게 감사드립니다!"`                                                           
| `authors`       | string  |         *비어있음*          |                                                                                모드 목록에 표시되는 모드 작성자입니다.                                                                                | `"김모드개발자온세상을놀라게하다"`                                                                
| `displayURL`    | string  |         *비어있음*          |                                                                                모드 목록 화면에 표시되는 URL입니다.                                                                                | `"https://minecraftforge.net/"`                                                    
| `displayTest`   | string  |    `"MATCH_VERSION"`    |                                                                                  '[sides]'를 확인하세요.                                                                                   | `"NONE"`                                                                           

#### 필요 기능

이 설저을 통해 모드는 시스템을 로드할 때 특정 설정, 소프트웨어 또는 하드웨어를 사용할 수 있도록 요구할 수 있습니다.
기능이 만족되지 않으면 모드 로딩이 실패하고 사용자에게 요구 사항을 알립니다. 현재 Forge는 다음 기능을 제공합니다.

    기능     | 설명 | 예시

:--------------:| :---:       | :---
`java_version` | 허용되는 자바 버전의 범위입니다. [Maven 버전 범위][mvr]로 표시합니다.
이 버전은 마인크래프트에서 지원되는 버전이여야 합니다. | `"[17,)"`

### 종속성 구성

Mods can specify their dependencies, which are checked by Forge before loading the mods.
모드는 모드를 로드하기 전에 Forge에서 확인할 종속성을 지정할 수 있습니다.
These configurations are created using the [array of tables][array] `[[dependencies.<modid>]]` where `modid` is the
identifier of the mod the dependency is for.
이러한 구성은 [테이블 배열][array] `[[dependencies.<modid>]]` 처럼 작성합니다. 여기서 `modid`는 종속성 모드의 식별자입니다.

 속성             |   타입    |   기본값    |                                                      설명                                                      | 예시                               
:---------------|:-------:|:--------:|:------------------------------------------------------------------------------------------------------------:|:---------------------------------
 `modId`        | string  |  **필수**  |                                            종속성으로 사용할 모드의 식별자입니다.                                             | `"example_library"`              
 `mandatory`    | boolean |  **필수**  |                                      이 종속성이 발견되지 않는다면 게임을 충돌시킬지 여부입니다.                                       | `true`                           
 `versionRange` | string  |   `""`   |               언어 로더의 허용되는 버전 범위입니다. [Maven Version Range][mvr]로 표현해야 합니다. 비워놓으면 모든 버전을 허용합니다.                | `"[1, 2)"`                       
 `ordering`     | string  | `"NONE"` |        모드가 이 종속성 이전(`"BEFORE"`) 또는 이후(`"AFTER"`)에 로드되어야 하는지 여부를 정의합니다. 순서가 중요하지 않으면 `"NONE"`을 기입하세요.         | `"AFTER"`                        
 `side`         | string  | `"BOTH"` | 종속성이 [클라이언트 사이드 또는 서버사이드][dist]중 어디에 존재해야 하는지 정의합니다. 다음 3가지 값 중 하나여야 합니다:`"CLIENT"`, `"SERVER"`, 또는`"BOTH"`. | `"CLIENT"`                       
 `referralUrl`  | string  |  *비어있음*  |                                    종속성 다운로드 페이지에 대한 URL입니다. 현재 사용하지 않습니다.                                    | `"https://library.example.com/"` 

:::danger
두 모드의 'ordering'은 순환 종속성으로 인해 충돌을 일으킬 수 있습니다.
예를 들어, 모드 A는 모드 B `"BEFORE"`를 로드하고 모드 B는 모드 A `"BEFORE"`를 로드해야 합니다.
:::

모드 진입점
---------------

이제 `mods.toml`이 채워졌으므로 모드를 프로그래밍하기 위한 진입점을 제공해야 합니다.
진입점은 모드를 실행하기 위한 시작점이며, `mods.toml`에서 사용되는 언어 로더에 의해 결정됩니다.

### `javafml` 및 `@Mod`

`javafml` is a language loader provided by Forge for the Java programming language. The entrypoint is defined using a
public class with the `@Mod` annotation. The value of `@Mod` must contain one of the mod ids specified within
the `mods.toml`. From there, all initialization logic (
e.g., [registering events][events], [adding `DeferredRegister`s][registration]) can be specified within the constructor
of the class. The mod bus can be obtained from `FMLJavaModLoadingContext`.

`javafml`은 Java 프로그래밍 언어를 위해 Forge에서 제공하는 언어 로더입니다.
진입점은 `@Mod` 어노테이션이 있는 공개(public) 클래스를 사용하여 정의됩니다.
`@Mod`의 값은 `mods.toml` 내에 지정된 모드 ID 중 하나를 포함해야 합니다.
여기에서 모든 초기화 논리(예: [이벤트 등록][events], [`DeferredRegister` 추가][registration])를 클래스 생성자 내에서 지정할 수 있습니다.
모드 버스는 `FMLJavaModLoadingContext`에서 찾을 수 있습니다.

```java

@Mod("examplemod") // mods.toml 의 내용과 일치해야 합니다.
public class Example {

    public Example() {
        // 초기화 로직
        var modBus = FMLJavaModLoadingContext.get().getModEventBus();

        // ...
    }
}
```

### `lowcodefml`

`lowcodefml`은 코드 내 진입점 없이 모드를 데이터팩 및 리소스 팩을 배포하기 위해 사용되는 언어 로더입니다.
향후 최소한의 코딩이 필요할 수 있는 사소한 추가 사항에 대해 'nocodefml'이 아닌 'lowcodefml'라고 합니다.

[toml]: https://toml.io/
[mvr]: https://maven.apache.org/enforcer/enforcer-rules/versionRanges.html
[spdx]: https://spdx.org/licenses/
[modsp]: #모드별-속성
[uses]: https://docs.oracle.com/javase/specs/jls/se17/html/jls-7.html#jls-7.7.3
[serviceload]: https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/ServiceLoader.html#load(java.lang.Class)
[array]: https://toml.io/en/v1.0.0#array-of-tables
[mvnver]: ./versioning.md
[multiline]: https://toml.io/en/v1.0.0#string
[update]: ../misc/updatechecker.md
[features]: #필요-기능
[sides]: ../concepts/sides.md#한쪽-사이드-전용-모드-만들기
[dist]: ../concepts/sides.md#사이드의-종류들
[events]: ../concepts/events.md
[registration]: ../concepts/registries.md#deferredregister
