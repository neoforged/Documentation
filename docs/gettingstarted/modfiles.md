# 모드 파일

모드 파일은 JAR에 어떤 모드가 들어있는지, '모드' 메뉴에 표시할 정보는 무엇인지, 게임에서 모드를 불러오는 방법을 결정하는 역할을 합니다.

## gradle.properties

`gradle.properties`는 모드 아이디, 버전 등의 여러 공통 속성들을 정의하는 파일입니다. 빌드 도중 Gradle은 이 파일의 속성값을 읽고  [mods.toml][modstoml]과 같은 파일에 적은 속성의 이름을 그 값으로 대체합니다. 이러면 여러 곳에서 사용하는 값을 모두 이 파일에서 관리할 수 있습니다.

대부분의 속성 값들의 역할은 [MDK의 `gradle.properties`][mdkgradleproperties]의 주석으로 기술되어 있습니다.

| 속성                        | 설명                                                                                                                                                       | 예시                                        |
|---------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------|
| `org.gradle.jvmargs`      | Gradle에 전달할 추가 JVM 인자를 지정합니다. 일반적으로 Gradle에 할당할 메모리를 설정하는 데 사용합니다. 이때 메모리는 마인크래프트가 아니라 Gradle에 부여됩니다.                                                    | `org.gradle.jvmargs=-Xmx3G`               |
| `org.gradle.daemon`       | Gradle 데몬 사용 여부를 지정합니다.                                                                                                                                  | `org.gradle.daemon=false`                 |
| `org.gradle.debug`        | Gradle의 디버그 모드 사용 여부를 지정합니다. 주로 디버그 로그를 출력할 때 사용합니다. 이 디버그 모드는 Gradle 자체 기능이며 마인크래프트와 무관합니다.                                                             | `org.gradle.debug=false`                  |
| `minecraft_version`       | 실행하는 마인크래프트 버전을 지정합니다. `neo_version`과 상응해야 합니다.                                                                                                          | `minecraft_version=1.20.2`                |
| `minecraft_version_range` | 모드를 사용 가능한 마인크래프트 버전 범위를 [`Maven 버전 범위`][mvr] 형식으로 지정합니다. 이때 [스냅숏, pre-release, release candidate][mcversioning]는 Maven 규약을 따르지 않기 때문에 버전 순서가 꼬일 수 있습니다. | `minecraft_version_range=[1.20.2,1.20.3)` |
| `neo_version`             | 모드를 개발하는 네오 포지 버전을 지정합니다. `minecraft_version`과 상응해야 합니다. 자세한 정보는 [NeoForge 버전 규약][neoversioning]에서 확인하세요.                                                | `minecraft_version=1.20.2`                |
| `neo_version_range`       | 모드를 사용 가능한 네오 포지 버전 범위를 [`Maven 버전 범위`][mvr] 형식으로 지정합니다.                                                                                                 | `minecraft_version_range=[1.20.2,1.20.3)` |
| `loader_version_range`    | 사용 가능한 모드 로더 버전 범위를 [`Maven 버전 범위`][mvr] 형식으로 지정합니다. 이때 모드 로더 버전 형식은 NeoForge 버전 규약과 무관합니다.                                                              | `loader_version_range=[1,)`               |
| `mod_id`                  | 모드의 아이디를 지정합니다. 아이디는 기억하기 쉽고 고유해야 합니다, 만약 두 개의 모드가 같은 id를 가진다면 게임을 불러오다가 충돌합니다. 또한 아이디는 레지스트리의 네임 스페이스에 사용됩니다.                                           | `mod_id=examplemod`                       |
| `mod_name`                | GUI에 표시되는 모드의 이름을 지정합니다. 기본적으로 모드 목록에만 표시되지만 [JEI][jei]와 같은 모드는 툴팁에서도 모드 이름을 띄웁니다.                                                                       | `mod_name=Example Mod`                    |
| `mod_license`             | 모드의 라이선스를 지정합니다. [SPDX 식별자][spdx], 또는 라이선스 본문의 링크를 쓰는 것을 권장드립니다. 자신에게 맞는 라이선스는 https://choosealicense.com/ 에서 고르실 수 있습니다.                                | `mod_license=MIT`                         |
| `mod_version`             | 모드 목록에 표시되는 모드의 버전을 지정합니다. 자세한 정보는 [버전 규약][versioning]을 확인하세요.                                                                                           | `mod_version=1.0`                         |
| `mod_group_id`            | [그룹 아이디][group]를 참고하세요.                                                                                                                                  | `mod_group_id=com.example.examplemod`     |
| `mod_authors`             | 모드 목록에 표시되는 모드 제작자를 지정합니다.                                                                                                                               | `mod_authors=ExampleModder`               |
| `mod_description`         | 모드 목록에 표시되는 모드의 설명을 지정합니다. 줄 바꿈 문자(`\n`)를 사용해 여러 줄로 나눌 수 있습니다.                                                                                           | `mod_authors=Example mod description.`    |
| `pack_format_number`      | 모드의 데이터 팩 및 리소스 팩의 버전 번호입니다. 모장은 버전 번호를 무작위로 증가시켜 현재 버전 번호를 찾아 사용하세요. 마인크래프트 1.20.2 기준으로 `18`을 사용합니다.                                                    | `pack_version_number=18`                  |

### 그룹 아이디

`build.gradle`의 `group` 속성은 maven에 모드를 업로드할 때만 필요하지만, 그래도 지정해 놓는 것이 좋습니다. `gradle.properties`에서 `mod_group_id` 값을 바꾸세요.

그룹 아이디는 최상위 패키지 이름으로 정하세요. 자세한 정보는 [패키지 구조][packaging]를 참고하세요.

```text
// gradle.properties에서
mod_group_id=com.example
```

자바 소스(`src/main/java`)의 패키지도 위 구조를 따라야 하며, 그 안에 모드 아이디를 이름으로 가지는 패키지를 만드세요: 

```text
com
- example (group 속성으로 정의한 최상위 패키지)
  - mymod (모드 아이디)
    - MyMod.java (ExampleMod.java의 이름을 바꾼 것)
```

## mods.toml

`mods.toml`은 `src/main/resources/META-INF/mods.toml`에 위치한 파일로, [TOML][toml] 문법을 사용해 모드의 메타데이터를 정의합니다. 또한 모드를 불러올 방법과, 모드 목록에 표시할 정보 등도 포함합니다. [MDK에 동봉된 `mods.toml`][mdkmodstoml]은 포함된 모든 속성의 역할을 주석으로 기술하며, 이는 아래에서 더 자세히 다루겠습니다.

`mods.toml`은 세 부분으로 나눌 수 있는데: 모드 파일에 적용되는 속성, 모드에 개별적으로 적용되는 속성, 그리고 모드 간 종속성입니다. 이중 일부는 무조건 명시되어야 하며 누락되면 실행 중 예외가 발생합니다.

:::note
MDK는 기본적으로 Gradle을 통해 여러 속성들을 `gradle.properties`의 내용으로 대체합니다. 예를 들어 `license="${mod_license}"`는 `license` 필드가 `gradle.properties`의 `mod_license`로 대체됩니다.
:::

### 모드 파일에 적용되는 속성

아래 속성들은 개별 모드가 아니라, 전체 JAR 파일 자체에 적용되는 속성으로, 사용할 모드 로더와 전역 설정 등을 포함합니다.

| 속성                   |   타입    |   기본값   |                                                                                           설명                                                                                            | 예시                                                                     |
|:---------------------|:-------:|:-------:|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|:-----------------------------------------------------------------------|
| `modLoader`          | string  | **필수**  | 사용할 모드 로더를 지정합니다. Kotlin처럼 다른 JVM 언어로 작성된 모드를 불러올 때, 또는 진입점을 찾는 방식을 변경할 때 사용합니다. 네오 포지는 기본적으로 Java 모드 로더 [`"javafml"`][javafml]과 lowcode/nocode 로더 [`"lowcodefml"`][lowcodefml]을 제공합니다. | `modLoader="javafml"`                                                  |
| `loaderVersion`      | string  | **필수**  |                                               사용할 모드 로더의 버전 범위를 [`Maven 버전 범위`][mvr] 형식으로 지정합니다. `javafml`과 `lowcodefml`는 버전 `1`을 사용합니다.                                                | `loaderVersion="[1,)"`                                                 |
| `license`            | string  | **필수**  |                             JAR에 포함된 모드들의 라이선스입니다. [SPDX 식별자][spdx], 또는 라이선스 본문의 링크를 쓰는 것을 권장드립니다. 자신에게 맞는 라이선스는 https://choosealicense.com/ 에서 고르실 수 있습니다.                             | `license="MIT"`                                                        |
| `showAsResourcePack` | boolean | `false` |                                                         만약 `true`인 경우 JAR의 리소스는 `Mod resources`로 병합되지 않고 `리소스 팩` 메뉴에 따로 나타납니다.                                                          | `showAsResourcePack=true`                                              |
| `services`           |  array  |  `[]`   |                                                                 JAR이 사용하는 서비스를 지정합니다. 네오 포지가 모드의 자바 모듈 정보를 만들 때 사용합니다.                                                                  | `services=["net.neoforged.neoforgespi.language.IModLanguageProvider"]` |
| `properties`         |  table  |  `{}`   |                                                      기타 속성을 정의합니다. `StringSubstitutor`를 통해 `${file.<key>}`를 정의된 속성값으로 대체할 수 있습니다.                                                       | `properties={"example"="1.2.3"}` (이후 `${file.example}`로 참조 가능)         |
| `issueTrackerURL`    | string  |  *없음*   |                                                                                 문제 발생 시 제보할 URL을 지정합니다.                                                                                 | `"https://github.com/neoforged/NeoForge/issues"`                       |

:::note
`services`는 [모듈 파일의 `uses` 구문][uses]과 일치하며, [특정 타입의 서비스를 사용하는 것][serviceload]을 허가합니다.

또는, 서비스 파일을 `src/main/resources/META-INF/services` 폴더에 만들어도 됩니다, 이때 파일 이름은 서비스의 전체 이름, 파일 내용은 불러올 서비스입니다. [예제로 AtlasViewer가 있습니다.][atlasviewer]
:::

### 모드에 적용되는 속성

모드에 적용되는 속성은 `[[mods]]` 헤더 아래 작성합니다. 이는 [테이블의 배열][array]입니다; 헤더가 다시 등장하기 전까진 같은 모드의 속성을 정의합니다.

```toml
# examplemod1의 속성들
[[mods]]
modId = "examplemod1"

# examplemod2의 속성들
[[mods]]
modId = "examplemod2"
```

| 속성              |   타입    |             기본값             |                                                                                       설명                                                                                       | 예시                                                              |
|:----------------|:-------:|:---------------------------:|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|:----------------------------------------------------------------|
| `modId`         | string  |           **필수**            |                             모드를 구분할 때 쓰는 고유 식별자를 지정합니다. 아이디는 무조건 `^[a-z][a-z0-9_]{1,63}$`에 상응해야 합니다. (2~64 길이의 문자열; 소문자로 시작함; 소문자, 숫자, 밑줄로만 이루어짐).                             | `modId="examplemod"`                                            |
| `namespace`     | string  |          `modId` 값          |                     모드의 네임 스페이스를 덮어쓸 때 사용합니다. 네임 스페이스 또한 `^[a-z][a-z0-9_.-]{1,63}$`에 상응해야 합니다. (2~64 길이의 문자열; 소문자로 시작함; 소문자, 숫자, 밑줄로만 이루어짐). 현재 사용되지 않습니다.                     | `namespace="example"`                                           |
| `version`       | string  |            `"1"`            | 모드의 버전을 지정합니다, [Maven 버전 규약][versioning]을 따라 하시는 걸 권장드립니다. `${file.jarVersion}`로 설정하시면, 빌드 도중 JAR manifest 파일의 `Implementation-Version` 속성값으로 대체됩니다. (개발 환경에선 `0.0NONE`으로 표시됨) | `version="1.20.2-1.0.0"`                                        |
| `displayName`   | string  |          `modId` 값          |                                                                            GUI에 표시할 모드의 이름을 지정합니다.                                                                             | `displayName="Example Mod"`                                     |
| `description`   | string  | `'''MISSING DESCRIPTION'''` |                                                         모드 목록에 표시할 설명을 지정합니다. 가능하다면 [여러 줄][multiline]로 나누는 것을 권장드립니다.                                                          | `description='''This is an example.'''`                         |
| `logoFile`      | string  |            *없음*             |                                모드 목록에 표시할 로고 이미지의 확장자를 포함한 이름을 지정합니다. 로고는 JAR의 최상위 폴더 또는 최상위 리소스 폴더에 있어야 합니다(예: MDK의 경우 `src/main/resources`).                                 | `logoFile="example_logo.png"`                                   |
| `logoBlur`      | boolean |           `true`            |                                          로고를 크게 늘릴 때 흐리게 만들지를 결정합니다. `true`는 로고를 그릴 때 `GL_LINEAR*`를 쓰고, `false`는 `GL_NEAREST*`를 씁니다.                                           | `logoBlur=false`                                                |
| `updateJSONURL` | string  |            *없음*             |                                                                  실행 중인 모드가 최신 버전인지 [확인할 때 쓰는][update] URL입니다.                                                                  | `updateJSONURL="https://example.github.io/update_checker.json"` |
| `features`      |  table  |            `{}`             |                                                                            [필요기능][features]을 참고하세요.                                                                            | `features={java_version="[17,)"}`                               |
| `modproperties` |  table  |            `{}`             |                                                                            모드에서 사용하는 기타 속성을 정의합니다.                                                                             | `modproperties={example="value"}`                               |
| `modUrl`        | string  |            *없음*             |                                                                       모드 다운로드 페이지의 URL입니다. 현재 사용되지 않습니다.                                                                       | `modUrl="https://neoforged.net/"`                               |
| `credits`       | string  |            *없음*             |                                                                        모드 목록에 표시할 개발에 도움을 준 이들을 지정합니다.                                                                         | `credits="The person over here and there."`                     |
| `authors`       | string  |            *없음*             |                                                                           모드 목록에 표시할 작성자 이름을 지정합니다.                                                                            | `authors="Example Person"`                                      |
| `displayURL`    | string  |            *없음*             |                                                                       모드 목록에 표시할 모드 소개 페이지의 URL을 지정합니다.                                                                        | `displayURL="https://neoforged.net/"`                           |
| `displayTest`   | string  |      `"MATCH_VERSION"`      |                                                                              [사이드][sides]를 참고하세요.                                                                              | `displayTest="NONE"`                                            |

:::note
일부 속성(`displayName`, `description`)은 언어 파일을 통해 다국어를 지원합니다. 자세한 사항은 [다국어 지원][i18n]을 참고하세요.
:::

#### 필요 기능

기능 시스템은 모드가 특정 설정, 소프트웨어, 또는 하드웨어 요구 사항을 지정할 때 사용합니다. 필요 기능은 충족되지 않으면 모드를 불러올 수 없고, 사용자에게 표시됩니다. 현재, 지원되는 필요 기능들은 다음과 같습니다:

|       기능        |                                                          설명                                                           | 예시                                  |
|:---------------:|:---------------------------------------------------------------------------------------------------------------------:|:------------------------------------|
| `java_version`  |                                    [Maven 버전 범위][mvr] 형식으로 사용 가능한 자바 버전 범위를 지정합니다.                                    | `features={java_version="[17,)"}`   |
| `openGLVersion` | [Maven 버전 범위][mvr] 형식으로 사용 가능한 OpenGL 버전 범위를 지정합니다. 마인크래프트는 OpenGL 3.2 이상에서 구동 가능하나, 필요하다면 더 높은 버전을 요구하도록 설정할 수 있습니다. | `features={openGLVersion="[4.6,)"}` |

### 모드 간 종속성

모드는 종속성을 가질 수 있습니다. 네오 포지는 모드를 불러오기 전에 종속성이 만족되는지 확인합니다. 아래 속성들은 [테이블 배열][array] 형식으로 작성하며 헤더로 `[[dependencies.<modid>]]`를 사용합니다.

| 속성             |   타입   |     기본값      |                                                                                                                                                                    설명                                                                                                                                                                     | 예시                                           |
|:---------------|:------:|:------------:|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|:---------------------------------------------|
| `modId`        | string |    **필수**    |                                                                                                                                                          필요한 다른 모드의 아이디를 지정합니다.                                                                                                                                                           | `modId="jei"`                                |
| `type`         | string | `"required"` | 해당 종속성의 유형을 지정합니다: `"required"`는 해당 종속성이 누락될 경우 모드를 불러올 수 없음을 의미하고, `"optional"`은 종속성이 누락되도 모드를 정상적으로 불러올 순 있음을 의미합니다. 이때 버전 호환성 검사는 두 경우 다 수행되며 `"optional"`이라도 호환되지 않는 종속성이 설치되어 있으면 오류가 발생합니다. `"incompatible"`은 해당 종속성이 존재하면 오류가 발생함을 의미합니다. `"discouraged"`는 해당 종속성이 존재해도 모드를 정상적으로 불러올 수 있으나, 그래도 제거하는 것을 권장함을 의미하며 사용자에게 경고를 띄웁니다. | `type="incompatible"`                        |
| `reason`       | string |  *nothing*   |                                                                                                                                                    종속성 검사가 실패할 경우 사용자에게 띄울 메세지를 지정합니다.                                                                                                                                                    |
| `versionRange` | string |     `""`     |                                                                                                                                   사용 가능한 종속성의 버전을 [Maven 버전 범위][mvr] 형식으로 지정합니다. 비워놓으면 버전이 상관없음을 의미합니다.                                                                                                                                   | `versionRange="[1, 2)"`                      |
| `ordering`     | string |   `"NONE"`   |                                                                                                                     해당 종속성을 모드보다 먼저 불러와야 하는지 (`"BEFORE"`), 또는 나중에 불러와야 하는지 (`"AFTER"`), 아니면 상관없는지 (`"NONE"`)를 지정합니다.                                                                                                                      | `ordering="AFTER"`                           |
| `side`         | string |   `"BOTH"`   |                                                                                                                          해당 종속성이 필요한 [물리 사이드][side]를 지정합니다. `"CLIENT"`, `"SERVER"`, 또는 `"BOTH"` 세 값 중 하나를 사용하세요.                                                                                                                          | `side="CLIENT"`                              |
| `referralUrl`  | string |  *nothing*   |                                                                                                                                                  종속성의 다운로드 페이지 URL을 지정합니다. 현재 사용하지 않습니다.                                                                                                                                                  | `referralUrl="https://library.example.com/"` |

:::danger
`ordering`을 잘못 설정하면 모드 간 순환 종속성이 발생할 수 있습니다, 예를 들어 모드 A와 모드 B가 서로보다 먼저(`"BEFORE"`) 불러와 지려고 하면 순환 종속성 발생해 게임이 충돌합니다.
:::

## 모드 진입점

이제 `mods.toml`을 작성했으므로 모드의 진입점을 설정해야 합니다. 진입점은 모드 실행을 시작하는 곳이며, `mods.toml`에 지정한 모드 로더가 결정합니다.

### `javafml`과 `@Mod`

`javafml`은 네오 포지가 자바 언어용으로 만든 모드 로더입니다. `@Mod` 어노테이션으로 표시된 클래스를 진입점으로 사용합니다. 이때 어노테이션은 `mods.toml`에 제시된 모드 아이디가 적혀있어야 합니다. 이후, 해당 클래스의 생성자에서 모드 초기화를 수행하세요. (예: [이벤트 등록][events] 또는 [`DeferredRegister`][registration] 설정)

```java
@Mod("examplemod") // mods.toml에 제시한 모드 아이디와 동일해야 함
public class Example {
  public Example(IEventBus modBus) { // 생성자 인자는 모드별 버스임
    // 초기화 작업 수행
  }
}
```

:::note
`mods.toml`의 모드 아이디와 `@Mod` 어노테이션은 1대1 대응해야 합니다. 다시 말해서, 각 모드 아이디는 `@Mod` 어노테이션에 한 번만 쓰여야 합니다.
:::

### `lowcodefml`

`lowcodefml`은 리소스 팩과 데이터 팩을 코드로 작성한 진입점 없이 모드처럼 배포할 때 사용합니다.

[array]: https://toml.io/ko/v1.0.0#%ED%85%8C%EC%9D%B4%EB%B8%94%EC%9D%98-%EB%B0%B0%EC%97%B4
[atlasviewer]: https://github.com/XFactHD/AtlasViewer/blob/1.20.2/neoforge/src/main/resources/META-INF/services/xfacthd.atlasviewer.platform.services.IPlatformHelper
[events]: ../concepts/events.md
[features]: #필요-기능
[group]: #그룹-아이디
[i18n]: ../concepts/internationalization.md#모드-속성
[javafml]: #javafml과-mod
[jei]: https://www.curseforge.com/minecraft/mc-mods/jei
[lowcodefml]: #lowcodefml
[mcversioning]: versioning.md#마인크래프트
[mdkgradleproperties]: https://github.com/neoforged/MDK/blob/main/gradle.properties
[mdkmodstoml]: https://github.com/neoforged/MDK/blob/main/src/main/resources/META-INF/mods.toml
[modstoml]: #modstoml
[mojmaps]: https://github.com/neoforged/NeoForm/blob/main/Mojang.md
[multiline]: https://toml.io/ko/v1.0.0#%EB%AC%B8%EC%9E%90%EC%97%B4
[mvr]: https://maven.apache.org/enforcer/enforcer-rules/versionRanges.html
[neoversioning]: versioning.md#네오-포지
[packaging]: ./structuring.md#패키징
[registration]: ../concepts/registries.md#deferredregister
[serviceload]: https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/ServiceLoader.html#load(java.lang.Class)
[sides]: ../concepts/sides.md
[spdx]: https://spdx.org/licenses/
[toml]: https://toml.io/ko
[update]: ../misc/updatechecker.md
[uses]: https://docs.oracle.com/javase/specs/jls/se17/html/jls-7.html#jls-7.7.3
[versioning]: ./versioning.md
