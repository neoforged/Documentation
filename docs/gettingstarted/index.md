# 포지 시작하기

:::caution
NeoForged가 생긴지 얼마 되지 않았기 때문에, 문서의 내용이 최신 정보가 아닐 수 있습니다.

NeoForged가 첫 번째 릴리즈를 출시하기 전까지 Forge 문서를 참조해야 합니다. 이 문서는 Forge 문서의 1.20 버전을 기반으로 합니다.
:::

이전에 Forge 모드를 만든 적이 없는 경우 이 섹션에서는 Forge 개발 환경을 설정하는 데 필요한 최소한의 정보를 제공합니다. 문서의 나머지 부분은 여기에서 어디로 가야 하는지에 대한 것입니다
당신이 포지 모드를 만들어 본 적이 한 번도 없는 경우, 이 섹션에서는 Forge 개발 환경을 설정하기 위해 필요한 최소한의 정보를 제공합니다.
문서의 나머지 부분은 어느 페이지로 이동해야 하는지에 대해 작성합니다.

## 준비하기

- 자바 17 개발 키트 (JDK) 및 64비트 전용 자바 가상 머신 (JVM)을 설치하세요. Forge는 공식적으로 [Eclipse Temurin][jdk]를 지원하며 권장합니다.

:::caution

64비트 JVM을 사용하고 있는지 확인하세요.
터미널에서 `java -version` 명령을 사용하여 확인할 수 있습니다.
만약 32비트 JVM을 사용한다면 ForgeGradle이 충돌을 일으킬 수 있습니다.

:::

- 만약 당신이 IDE(통합 개발 환경)에 익숙하다면
    - Gradle이 통합된 IDE를 사용하는 것이 좋습니다.

## 시작하기

1. 모드 개발자 키트(MDK)를 [포지 파일 사이트][files]에서 'Mdk'를 다운로드 하세요.
   가능하다면 최신 버전의 Forge를 사용하는 것이 권장됩니다.
2. 다운로드한 MDK를 빈 폴더에 압축 해제합니다. 이 폴더는 gradle 및 `src` 라는 하위 폴더를 포함하는 예제 모드를 포함하고 있습니다.

:::info

다음과 같은 파일을 다른 모드에서 재사용 할 수 있습니다:

- `gradle` 폴더
- `build.gradle`
- `gradlew`
- `gradlew.bat`
- `settings.gradle`

`src` 하위 폴더는 작업 공간 간에 복사할 필요가 없습니다. 그러나 java (`src/main/java`)와 리소스 (`src/main/resources`)가 나중에 생성된 경우 Gradle을 새로고침 할
필요가 있을 수 있습니다.
:::

3. 선택한 IDE를 엽니다:
    - Forge는 명시적으로 Eclipse와 IntelliJ IDEA에서의 개발을 지원하지만 Visual Studio Code용 실행 구성이 있습니다.
      또는 원한다면 Apache NetBeans에서부터 Vim / Emacs까지 모든 환경을 사용할 수 있습니다.
    - Eclipse와 IntelliJ IDEA에선 기본적으로 설치되고 실행 구성이 활성화 되며, 모드 프로젝트를 가져오기(import)나 열기(open) 시 초기 워크스페이스 설정의 나머지 부분을 자동으로
      처리합니다.
      이에는 Mojang, MinecraftForge 등에서 필요한 패키지를 다운로드하는 것도 포함됩니다. Visual Studio Code에서는 이와 동일한 작업을 수행하려면 'Gradle for Java'
      플러그인이 필요합니다.
    - Gradle과 관련된 변경 사항에 대해 프로젝트를 새로고침 하려면 Gradle을 호출해야 합니다 (
      예: `build.gradle`, `settings.gradle` 등의 관련 파일). 일부 IDE에는 이를 수행하는 '새로고침' 버튼이 있지만, 터미널을 통해 `gradlew`를 통해 실행할 수도
      있습니다.
4. IDE별 실행 구성 생성:
    - **Eclipse**: `genEclipseRuns` 작업을 실행합니다.
    - **IntelliJ IDEA**: `genIntellijRuns` 작업을 실행합니다. "모듈이 지정되지 않았습니다"라는 오류가 발생하는 경우
      [`ideaModule` 속성][config]을 'main' 모듈로 설정하십시오 (일반적으로 `${project.name}.main`).
    - **Visual Studio Code**: `getVSCodeRuns` 작업을 실행합니다.
    - **다른 IDE들**: `gradle run*`를 사용하여 직접 구성을 실행할 수 있습니다. (
      예: `runClient`, `runServer`, `runData`, `runGameTestServer`)

## 사용자 지정 모드 정보

`build.gradle` 파일을 편집하여 모드 빌드 방법(예: 파일 이름, 아티팩트 버전 등)을 사용자 지정합니다.

:::danger
당신이 무엇을 하는지 이해하지 못하는 경우 `settings.gradle`을 편집하지 마세요.
파일은 [ForgeGradle]의 저장소에 대한 정보를 포함하고 있기 때문에 이해 없이 편집하면 곤란할 수 있습니다.
:::

### 권장되는 `build.gradle` 사용자 정의

#### 모드 ID 교체

`mods.toml` 및 [modfile][modfiles]을 포함한 모든 파일에서 `examplemod`를 당신의 모드 ID로 교체하세요.
이는 `base.archivesName`을 설정하여 빌드된 파일의 이름을 변경하는 것도 포함됩니다. (일반적으로 모드 아이디로 설정됩니다, 아래 참조)

```gradle
// build.gradle 에서
base.archivesName = 'mymod'
```

:::info

현재 Forge MDK는 `base.archivesName` 대신에 아티팩트 이름을 설정하기 위해 `archivesBaseName`을 사용합니다.
`archivesBaseName`가 Gradle 9에서 제거될 예정이며, 향후 버전의 ForgeGradle이 지원할 것이기 때문에
`base.archivesName`을 사용하는 것을 권장합니다. 아래와 같이 `archivesBaseName`을 아직 사용할 수 있습니다:

다음을 설정하여 `archivesBaseName`를 계속 사용할 수 있습니다.:

```gradle
// build.gradle 에서
base.archivesName = 'mymod'
```

:::

#### 그룹 ID

`group` 속성은 [최상위 패키지][packaging]으로 설정해야 하며, 다음과 같이 소유한 도메인 또는 이메일 주소여야 합니다:

|  타입   |         값         | 최상위 패키지             |
|:-----:|:-----------------:|:--------------------|
|  도메인  |    example.com    | `com.example`       |
| 서브도메인 | example.github.io | `io.github.example` |
|  이메일  | example@gmail.com | `com.gmail.example` |

```gradle
// build.gradle 에서
group = 'com.example'
```

Java 소스(`src/main/java`) 내의 패키지도 이제 모드 ID 를 나타내는 내부 패키지와 함께 이 구조를 준수해야 합니다.

```text
com
- example (그룹 속성에 지정된 최상위 패키지)
  - mymod (모드의 ID)
    - MyMod.java (또는 최신 MDK에서 ExampleMod.java)
```

#### 버전

`version` 속성을 현재 모드의 버전으로 설정하세요. 꼭 사용하길 권장합니다. 작성 방법에 대해서는 [Maven 버전 관리의 변형][mvnver]을 참고하세요.

```gradle
// build.gradle 에서
version = '1.19.4-1.0.0.0'
```

### 추가 구성

추가 구성은 [ForgeGradle] 문서에서 찾을 수 있습니다.

## 모드 빌드 및 테스트

1. 당신의 모드를 빌드하기 위해선, `gradlew build`을 실행하세요. 출력 결과는 `build/libs`에 `[archivesBaseName]-[version].jar` 같은 이름으로 표시됩니다.
   이 모드를 마인크래프트 폴더의 `mods` 폴더에 넣어 실행해볼 수 있습니다.
1. 모드를 테스트 환경에서 실행하려면 실행 구성을 사용하거나 관련된 작업 (예: `gradlew runClient`)을 사용할 수 있습니다.
   이렇게 하면 실행 디렉토리 (기본값은 'run')에서 Minecraft가 실행되며 지정된 모든 소스 세트도 함께 실행됩니다.
   기본 MDK에는 `main` 소스 세트가 포함되어 있으므로 `src/main/java`에 작성된 모든 코드가 적용됩니다.
1. 전용 서버를 실행하는 경우 실행 구성이나 `gradlew runServer`를 통해 실행하더라도 서버가 처음에 즉시 종료됩니다.
   서버를 사용하려면 실행 디렉토리의 `eula.txt` 파일을 편집하여 Minecraft EULA를 수락해야 합니다.
   한번 수락하면 서버가 로드되며, 이후 `localhost`에 직접 연결하여 접속할 수 있습니다.

:::tip

전용 서버 환경에서 항상 모드를 테스트하길 권장합니다.
[클라이언트 전용 모드][client]의 경우 서버가 실행될때 아무 작업도 실행하지 않아야 하기 때문입니다.
:::

[jdk]: https://adoptium.net/temurin/releases?version=17 "Eclipse Temurin 17 Prebuilt Binaries"

[ForgeGradle]: https://docs.minecraftforge.net/en/fg-5.x

[files]: https://files.minecraftforge.net "Forge Files distribution site"

[config]: https://docs.minecraftforge.net/en/fg-5.x/configuration/runs/

[modfiles]: ./modfiles.md

[packaging]: ./structuring.md#packaging

[mvnver]: ./versioning.md

[client]: ../concepts/sides.md#writing-one-sided-mods
