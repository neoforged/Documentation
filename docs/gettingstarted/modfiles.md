# 모드 파일

모드 파일은 JAR에 어떤 모드가 들어있는지, '모드' 메뉴에 표시할 정보는 무엇인지, 게임에서 모드를 불러오는 방법을 결정하는 역할을 합니다.

## `gradle.properties`

`gradle.properties`는 모드 아이디, 버전 등의 여러 공통 속성들을 정의하는 파일입니다. 빌드 도중 Gradle은 이 파일의 속성값을 읽고  [neoforge.mods.toml][neoforgemodstoml]과 같은 파일에 적은 속성의 이름을 그 값으로 대체합니다. 이러면 여러 곳에서 사용하는 값을 모두 이 파일에서 관리할 수 있습니다.

대부분의 속성 값들의 역할은 [MDK의 `gradle.properties`][mdkgradleproperties]의 주석으로 기술되어 있습니다.

| Property                  | Description                                                                                                                                                                                                                             | Example                                    |
|---------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------|
| `org.gradle.jvmargs`      | Allows you to pass extra JVM arguments to Gradle. Most commonly, this is used to assign more/less memory to Gradle. Note that this is for Gradle itself, not Minecraft.                                                                 | `org.gradle.jvmargs=-Xmx3G`                |
| `org.gradle.daemon`       | Whether Gradle should use the daemon when building.                                                                                                                                                                                     | `org.gradle.daemon=false`                  |
| `org.gradle.debug`        | Whether Gradle is set to debug mode. Debug mode mainly means more Gradle log output. Note that this is for Gradle itself, not Minecraft.                                                                                                | `org.gradle.debug=false`                   |
| `minecraft_version`       | The Minecraft version you are modding on. Must match with `neo_version`.                                                                                                                                                                | `minecraft_version=1.20.6`                 |
| `minecraft_version_range` | The Minecraft version range this mod can use, as a [Maven Version Range][mvr]. Note that [snapshots, pre-releases and release candidates][mcversioning] are not guaranteed to sort properly, as they do not follow maven versioning.    | `minecraft_version_range=[1.20.6,1.21)`    |
| `neo_version`             | The NeoForge version you are modding on. Must match with `minecraft_version`. See [NeoForge Versioning][neoversioning] for more information on how NeoForge versioning works.                                                           | `neo_version=20.6.62`                      |
| `neo_version_range`       | The NeoForge version range this mod can use, as a [Maven Version Range][mvr].                                                                                                                                                           | `neo_version_range=[20.6.62,20.7)`         |
| `loader_version_range`    | The version range of the mod loader this mod can use, as a [Maven Version Range][mvr]. Note that the loader versioning is decoupled from NeoForge versioning.                                                                           | `loader_version_range=[1,)`                |
| `mod_id`                  | See [The Mod ID][modid].                                                                                                                                                                                                                | `mod_id=examplemod`                        |
| `mod_name`                | The human-readable display name of your mod. By default, this can only be seen in the mod list, however, mods such as [JEI][jei] prominently display mod names in item tooltips as well.                                                | `mod_name=Example Mod`                     |
| `mod_license`             | The license your mod is provided under. It is suggested that this is set to the [SPDX identifier][spdx] you are using and/or a link to the license. You can visit https://choosealicense.com/ to help pick the license you want to use. | `mod_license=MIT`                          |
| `mod_version`             | The version of your mod, shown in the mod list. See [the page on Versioning][versioning] for more information.                                                                                                                          | `mod_version=1.0`                          |
| `mod_group_id`            | See [The Group ID][group].                                                                                                                                                                                                              | `mod_group_id=com.example.examplemod`      |
| `mod_authors`             | The authors of the mod, shown in the mod list.                                                                                                                                                                                          | `mod_authors=ExampleModder`                |
| `mod_description`         | The description of the mod, as a multiline string, shown in the mod list. Newline characters (`\n`) can be used and will be replaced properly.                                                                                          | `mod_description=Example mod description.` |

### The Mod ID

The mod ID is the main way your mod is distinguished from others. It is used in a wide variety of places, including as the namespace for your mod's [registries][registration], and as your [resource and data pack][resource] namespaces. Having two mods with the same id will prevent the game from loading.

As such, your mod ID should be something unique and memorable. Usually, it will be your mod's display name (but lower case), or some variation thereof. Mod IDs may only contain lowercase letters, digits and underscores, and must be between 2 and 64 characters long (both inclusive).

:::info
Changing this property in the `gradle.properties` file will automatically apply the change everywhere, except for the [`@Mod` annotation][javafml] in your main mod class. There, you need to change it manually to match the value in the `gradle.properties` file.
:::

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

## `neoforge.mods.toml`

`neoforge.mods.toml`은 `src/main/resources/META-INF/neoforge.mods.toml`에 위치한 파일로, [TOML][toml] 문법을 사용해 모드의 메타데이터를 정의합니다. 또한 모드를 불러올 방법과, 모드 목록에 표시할 정보 등도 포함합니다. [MDK에 동봉된 `neoforge.mods.toml`][mdkneoforgemodstoml]은 포함된 모든 속성의 역할을 주석으로 기술하며, 이는 아래에서 더 자세히 다루겠습니다.

`neoforge.mods.toml`은 세 부분으로 나눌 수 있는데: 모드 파일에 적용되는 속성, 모드에 개별적으로 적용되는 속성, 그리고 모드 간 종속성입니다. 이중 일부는 무조건 명시되어야 하며 누락되면 실행 중 예외가 발생합니다.

:::note
MDK는 기본적으로 Gradle을 통해 여러 속성들을 `gradle.properties`의 내용으로 대체합니다. 예를 들어 `license="${mod_license}"`는 `license` 필드가 `gradle.properties`의 `mod_license`로 대체됩니다.
:::

### JAR에 적용되는 속성

아래 속성들은 개별 모드가 아니라, 전체 JAR 파일 자체에 적용되는 속성으로, 사용할 모드 로더와 전역 설정 등을 포함합니다.

| 속성                   |   타입    |   기본값   |                                                                                           설명                                                                                            | 예시                                                                     |
|:---------------------|:-------:|:-------:|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|:-----------------------------------------------------------------------|
| `modLoader`          | string  | **필수**  | 사용할 모드 로더를 지정합니다. Kotlin처럼 다른 JVM 언어로 작성된 모드를 불러올 때, 또는 진입점을 찾는 방식을 변경할 때 사용합니다. 네오 포지는 기본적으로 Java 모드 로더 [`"javafml"`][javafml]과 lowcode/nocode 로더 [`"lowcodefml"`][lowcodefml]을 제공합니다. | `modLoader="javafml"`                                                  |
| `loaderVersion`      | string  | **필수**  |                                               사용할 모드 로더의 버전 범위를 [`Maven 버전 범위`][mvr] 형식으로 지정합니다. `javafml`과 `lowcodefml`는 버전 `1`을 사용합니다.                                                | `loaderVersion="[1,)"`                                                 |
| `license`            | string  | **필수**  |                             JAR에 포함된 모드들의 라이선스입니다. [SPDX 식별자][spdx], 또는 라이선스 본문의 링크를 쓰는 것을 권장드립니다. 자신에게 맞는 라이선스는 https://choosealicense.com/ 에서 고르실 수 있습니다.                             | `license="MIT"`                                                        |
| `showAsResourcePack` | boolean | `false` |                                                         만약 `true`인 경우 JAR의 리소스는 `Mod resources`로 병합되지 않고 `리소스 팩` 메뉴에 따로 나타납니다.                                                          | `showAsResourcePack=true`                                              |
| `services`           |  array  |  `[]`   |                                                                 JAR이 사용하는 서비스를 지정합니다. 네오 포지가 모드의 자바 모듈 정보를 만들 때 사용합니다.                                                                  | `services=["net.neoforged.neoforgespi.language.IModLanguageProvider"]` |
| `properties`         |  table  |  `{}`   |                                                      기타 속성을 정의합니다. `StringSubstitutor`를 통해 `${file.<key>}`를 정의된 속성값으로 대체할 수 있습니다.                                                       | `properties={"example"="1.2.3"}` (이후 `${file.example}`로 참조 가능)         |
| `issueTrackerURL`    | string  |  _없음_   |                                                                                 문제 발생 시 제보할 URL을 지정합니다.                                                                                 | `"https://github.com/neoforged/NeoForge/issues"`                       |

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

| Property        | Type     | Default                      | Description                                                                                                                                                                                                                                                                    | Example                                                         |
|-----------------|----------|------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------|
| `modId`         | string   | **mandatory**                | See [The Mod ID][modid].                                                                                                                                                                                                                                                       | `modId="examplemod"`                                            |
| `namespace`     | string   | value of `modId`             | An override namespace for the mod. Must also be a valid [mod ID][modid], but may additionally include dots or dashes. Currently unused.                                                                                                                                        | `namespace="example"`                                           |
| `version`       | string   | `"1"`                        | The version of the mod, preferably in a [variation of Maven versioning][versioning]. When set to `${file.jarVersion}`, it will be replaced with the value of the `Implementation-Version` property in the JAR's manifest (displays as `0.0NONE` in a development environment). | `version="1.20.2-1.0.0"`                                        |
| `displayName`   | string   | value of `modId`             | The display name of the mod. Used when representing the mod on a screen (e.g., mod list, mod mismatch).                                                                                                                                                                        | `displayName="Example Mod"`                                     |
| `description`   | string   | `'''MISSING DESCRIPTION'''`  | The description of the mod shown in the mod list screen. It is recommended to use a [multiline literal string][multiline]. This value is also translatable, see [Translating Mod Metadata][i18n] for more info.                                                                | `description='''This is an example.'''`                         |
| `logoFile`      | string   | _nothing_                    | The name and extension of an image file used on the mods list screen. The logo must be in the root of the JAR or directly in the root of the source set (e.g. `src/main/resources` for the main source set).                                                                   | `logoFile="example_logo.png"`                                   |
| `logoBlur`      | boolean  | `true`                       | Whether to use `GL_LINEAR*` (true) or `GL_NEAREST*` (false) to render the `logoFile`. In simpler terms, this means whether the logo should be blurred or not when trying to scale the logo.                                                                                    | `logoBlur=false`                                                |
| `updateJSONURL` | string   | _nothing_                    | A URL to a JSON used by the [update checker][update] to make sure the mod you are playing is the latest version.                                                                                                                                                               | `updateJSONURL="https://example.github.io/update_checker.json"` |
| `features`      | table    | `{}`                         | See [features].                                                                                                                                                                                                                                                                | `features={java_version="[17,)"}`                               |
| `modproperties` | table    | `{}`                         | A table of key/values associated with this mod. Unused by NeoForge, but is mainly for use by mods.                                                                                                                                                                             | `modproperties={example="value"}`                               |
| `modUrl`        | string   | _nothing_                    | A URL to the download page of the mod. Currently unused.                                                                                                                                                                                                                       | `modUrl="https://neoforged.net/"`                               |
| `credits`       | string   | _nothing_                    | Credits and acknowledges for the mod shown on the mod list screen.                                                                                                                                                                                                             | `credits="The person over here and there."`                     |
| `authors`       | string   | _nothing_                    | The authors of the mod shown on the mod list screen.                                                                                                                                                                                                                           | `authors="Example Person"`                                      |
| `displayURL`    | string   | _nothing_                    | A URL to the display page of the mod shown on the mod list screen.                                                                                                                                                                                                             | `displayURL="https://neoforged.net/"`                           |
| `displayTest`   | string   | `"MATCH_VERSION"`            | See [sides].                                                                                                                                                                                                                                                                   | `displayTest="NONE"`                                            |

#### 필요 기능

기능 시스템은 모드가 특정 설정, 소프트웨어, 또는 하드웨어 요구 사항을 지정할 때 사용합니다. 필요 기능은 충족되지 않으면 모드를 불러올 수 없고, 사용자에게 표시됩니다. 현재, 지원되는 필요 기능들은 다음과 같습니다:

|       기능        |                                                          설명                                                           | 예시                                  |
|:---------------:|:---------------------------------------------------------------------------------------------------------------------:|:------------------------------------|
| `java_version`  |                                    [Maven 버전 범위][mvr] 형식으로 사용 가능한 자바 버전 범위를 지정합니다.                                    | `features={java_version="[17,)"}`   |
| `openGLVersion` | [Maven 버전 범위][mvr] 형식으로 사용 가능한 OpenGL 버전 범위를 지정합니다. 마인크래프트는 OpenGL 3.2 이상에서 구동 가능하나, 필요하다면 더 높은 버전을 요구하도록 설정할 수 있습니다. | `features={openGLVersion="[4.6,)"}` |

### Access Transformer-Specific Properties

[Access Transformer-specific properties][accesstransformer] are tied to the specified access transformer using the `[[accessTransformers]]` header. This is an [array of tables][array]; all key/value properties will be attached to that access transformer until the next header. The access transformer header is optional; however, when specified, all elements are mandatory.

| Property |  Type  |    Default    |             Description              |     Example     |
|:--------:|:------:|:-------------:|:------------------------------------:|:----------------|
| `file`   | string | **mandatory** | See [Adding ATs][accesstransformer]. | `file="at.cfg"` |

### Dependency Configurations

모드는 종속성을 가질 수 있습니다. 네오 포지는 모드를 불러오기 전에 종속성이 만족되는지 확인합니다. 아래 속성들은 [테이블 배열][array] 형식으로 작성하며 헤더로 `[[dependencies.<modid>]]`를 사용합니다.

| 속성             |   타입   | 기본값          | 설명                                                                                                                                                                                                                                                                                                                                        | 예시                                           |
|----------------|--------|--------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------|
| `modId`        | string | **필수**       | 필요한 다른 모드의 아이디를 지정합니다.                                                                                                                                                                                                                                                                                                                    | `modId="jei"`                                |
| `type`         | string | `"required"` | 해당 종속성의 유형을 지정합니다: `"required"`는 해당 종속성이 누락될 경우 모드를 불러올 수 없음을 의미하고, `"optional"`은 종속성이 누락되도 모드를 정상적으로 불러올 순 있음을 의미합니다. 이때 버전 호환성 검사는 두 경우 다 수행되며 `"optional"`이라도 호환되지 않는 종속성이 설치되어 있으면 오류가 발생합니다. `"incompatible"`은 해당 종속성이 존재하면 오류가 발생함을 의미합니다. `"discouraged"`는 해당 종속성이 존재해도 모드를 정상적으로 불러올 수 있으나, 그래도 제거하는 것을 권장함을 의미하며 사용자에게 경고를 띄웁니다. | `type="incompatible"`                        |
| `reason`       | string | *nothing*    | 종속성 검사가 실패할 경우 사용자에게 띄울 메세지를 지정합니다.                                                                                                                                                                                                                                                                                                       |
| `versionRange` | string | `""`         | 사용 가능한 종속성의 버전을 [Maven 버전 범위][mvr] 형식으로 지정합니다. 비워놓으면 버전이 상관없음을 의미합니다.                                                                                                                                                                                                                                                                     | `versionRange="[1, 2)"`                      |
| `ordering`     | string | `"NONE"`     | 해당 종속성을 모드보다 먼저 불러와야 하는지 (`"BEFORE"`), 또는 나중에 불러와야 하는지 (`"AFTER"`), 아니면 상관없는지 (`"NONE"`)를 지정합니다.                                                                                                                                                                                                                                          | `ordering="AFTER"`                           |
| `side`         | string | `"BOTH"`     | 해당 종속성이 필요한 [물리 사이드][side]를 지정합니다. `"CLIENT"`, `"SERVER"`, 또는 `"BOTH"` 세 값 중 하나를 사용하세요.                                                                                                                                                                                                                                                   | `side="CLIENT"`                              |
| `referralUrl`  | string | *nothing*    | 종속성의 다운로드 페이지 URL을 지정합니다. 현재 사용하지 않습니다.                                                                                                                                                                                                                                                                                                   | `referralUrl="https://library.example.com/"` |

:::danger
`ordering`을 잘못 설정하면 모드 간 순환 종속성이 발생할 수 있습니다, 예를 들어 모드 A와 모드 B가 서로보다 먼저(`"BEFORE"`) 불러와 지려고 하면 순환 종속성 발생해 게임이 충돌합니다.
:::

## 모드 진입점

이제 `neoforge.mods.toml`을 작성했으므로 모드의 진입점을 설정해야 합니다. 진입점은 모드 실행을 시작하는 곳이며, `neoforge.mods.toml`에 지정한 모드 로더가 결정합니다.

### `javafml`과 `@Mod`

`javafml`은 네오 포지가 자바 언어용으로 만든 모드 로더입니다. `@Mod` 어노테이션으로 표시된 클래스를 진입점으로 사용합니다. 이때 어노테이션은 `neoforge.mods.toml`에 제시된 모드 아이디가 적혀있어야 합니다. 이후, 해당 클래스의 생성자에서 모드 초기화를 수행하세요. (예: [이벤트 등록][events] 또는 [`DeferredRegister`][registration] 설정)

The main mod class must only have one public constructor; otherwise a `RuntimeException` will be thrown. The constructor may have **any** of the following arguments in **any** order; none of them are explicitly required. However, no duplicate parameters are allowed.

Argument Type     | Description                                                                                              |
------------------|----------------------------------------------------------------------------------------------------------|
`IEventBus`       | The [mod-specific event bus][modbus] (needed for registration, events, etc.)                             |
`ModContainer`    | The abstract container holding this mod's metadata                                                       |
`FMLModContainer` | The actual container as defined by `javafml` holding this mod's metadata; an extension of `ModContainer` |
`Dist`            | The [physical side][sides] this mod is loading on                                                        |

```java
@Mod("examplemod") // Must match a mod id in the neoforge.mods.toml
public class ExampleMod {
    // Valid constructor, only uses two of the available argument types
    public ExampleMod(IEventBus modBus, ModContainer container) {
        // Initialize logic here
    }
}
```

By default, a `@Mod` annotation is loaded on both [sides]. This can be changed by specifying the `dist` parameter:

```java
// Must match a mod id in the neoforge.mods.toml
// This mod class will only be loaded on the physical client
@Mod(value = "examplemod", dist = Dist.CLIENT) 
public class ExampleModClient {
    // Valid constructor
    public ExampleModClient(FMLModContainer container, IEventBus modBus, Dist dist) {
        // Initialize client-only logic here
    }
}
```

:::note
An entry in `neoforge.mods.toml` does not need a corresponding `@Mod` annotation. Likewise, an entry in the `neoforge.mods.toml` can have multiple `@Mod` annotations, for example if you want to separate common logic and client only logic.
:::

### `lowcodefml`

`lowcodefml`은 리소스 팩과 데이터 팩을 코드로 작성한 진입점 없이 모드처럼 배포할 때 사용합니다.

[accesstransformer]: ../advanced/accesstransformers.mdx#adding-ats
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
[mdkneoforgemodstoml]: https://github.com/neoforged/MDK/blob/main/src/main/resources/META-INF/neoforge.mods.toml
[neoforgemodstoml]: #neoforgemodstoml
[modbus]: ../concepts/events.md#event-buses
[modid]: #the-mod-id
[mojmaps]: https://github.com/neoforged/NeoForm/blob/main/Mojang.md
[multiline]: https://toml.io/ko/v1.0.0#%EB%AC%B8%EC%9E%90%EC%97%B4
[mvr]: https://maven.apache.org/enforcer/enforcer-rules/versionRanges.html
[neoversioning]: versioning.md#네오-포지
[packaging]: ./structuring.md#패키징
[registration]: ../concepts/registries.md#deferredregister
[resource]: ../resources/index.md
[serviceload]: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/ServiceLoader.html#load(java.lang.Class)
[sides]: ../concepts/sides.md
[spdx]: https://spdx.org/licenses/
[toml]: https://toml.io/ko
[update]: ../misc/updatechecker.md
[uses]: https://docs.oracle.com/javase/specs/jls/se21/html/jls-7.html#jls-7.7.3
[versioning]: ./versioning.md
