# 네오 포지 시작하기

이 섹션은 네오 포지를 통한 모드 개발 환경 구성과 모드 실행 및 테스트 방법에 대해 다룹니다.

## 사전 준비

- 자바 프로그래밍 언어, 특히 객체 지향, 다형성, 제너릭, 그리고 함수형 기능들에 친숙해야 함.
- 자바 17 개발 키트 (JDK) 및 64비트 자바 가상 머신 (JVM). 네오 포지는 [마이크로소프트의 OpenJDK][jdk]를 공식적으로 지원하고 권장하지만, 다른 JDK를 쓰셔도 무관합니다.

:::caution
64비트 JVM을 사용하고 있는지 확인하세요. 터미널에서 `java -version` 명령을 사용하여 확인할 수 있습니다. 32비트 JVM은 오래되어 문제가 발생할 수 있습니다.
:::

- IDE를 통한 개발에 친숙해야 함.
  - 네오 포지는 공식적으로 Gradle과 연동되는 [IntelliJ IDEA][intellij]와 [Eclipse][eclipse]를 지원하지만, 필요하다면 Netbeans, Visual Studio Code, Emacs와 같은 아무 IDE나 사용하셔도 됩니다.
- [Git][git]과 [GitHub][github]에 친숙해야 함. 요구 사항은 아니지만 개발에 큰 도움이 됩니다.

## 개발 환경 구성하기

- 깃헙에서 [모드 개발 키트 (MDK)][mdk] 리포지토리를 열고, "Use this template"을 클릭한 다음 새로 만든 리포지토리를 개발할 컴퓨터에 클론 하세요.
   - 깃헙을 쓰고 싶지 않거나 구버전, 또는 다른 브랜치의 코드를 대신 받고 싶다면 ZIP으로 대신 다운로드하셔도 됩니다.
- IDE에서 MDK를 Gradle 프로젝트로 여세요. Eclipse와 Intellij IDEA는 자동으로 Gradle 연동을 수행하지만, 사용하시는 IDE에 이 기능이 없다면 터미널에서 `gradlew`를 실행하세요.
   - 처음으로 개발 환경을 구성될 땐 네오 포지의 모든 종속성을 내려받습니다. 이때 마인크래프트 또한 내려받아 디컴파일 합니다. 이 작업은 인터넷과 컴퓨터 사양에 따라 최대 한 시간 정도 소요될 수 있습니다.
   - Gradle은 구성 파일이 수정될 때마다 갱신해야 합니다. IDE 자체 기능으로 갱신하시거나 터미널에서 `gradlew` 명령을 실행하세요.

## 모드 정보 바꾸기

모드의 대부분 속성들은 `gradle.properties`에서 바꿀 수 있습니다. 이 파일은 모드의 이름, 버전 등의 기본적인 속성 값들을 정의합니다. 자세한 정보는 `gradle.properties`의 주석 또는 [해당 파일의 문서][properties]를 참고하세요.

모드의 빌드 과정을 바꾸시려면 `build.gradle` 파일을 수정하세요. 네오 포지의 Gradle 플러그인인 NeoGradle은 여러 속성 값으로 설정할 수 있으며, 이중 일부는 동봉된 `build.gradle`에서 다룹니다. 자세한 정보는 [NeoGradle 문서][neogradle]를 참고하세요.

:::caution
`build.gradle`과 `settings.gradle`은 정확히 무엇을 어떻게 바꾸는지 아실 때에만 수정하세요. 대부분의 기본 속성들은 `gradle.properties`에서 바꿀 수 있습니다.
:::

## 모드 빌드 및 테스트

모드를 빌드하려면 `gradlew build`를 실행하세요. 출력 파일은 `build/libs`에 `<archivesBaseName>-<version>.jar` 형식의 이름으로 저장됩니다. `<archivesBaseName>`과 `<version>`은 `build.gradle`이 지정하는 속성이며 기본값으로 각각 `gradle.properties`가 정의하는 `mod_id`와 `mod_version`을 사용합니다. 이 출력 파일은 네오 포지가 설치된 마인크래프트의 `mods` 폴더에 넣거나 모드 배포 플랫폼에 업로드할 수 있습니다.

모드를 테스트 환경에서 실행하려면 생성된 실행 구성을 사용하거나 Gradle 작업을 실행하세요.(예: `gradlew runClient`) 마인크래프트가 구성에서 지정한 폴더(예: `runs/client` 또는 `runs/server`)에서 추가한 소스 셋과 함께 실행됩니다. MDK는 기본적으로 `main` 소스 셋을 포함하기에, `src/main/java`에 포함된 모든 코드가 실행할 때 추가됩니다.

### 서버에서 테스트하기

실행 구성 또는 `gradlew runServer`를 통해 전용 서버를 실행하시면 바로 종료될 텐데, 서버를 실행하기 위해선 마인크래프트 EULA에 동의하셔야 합니다. 실행 폴더의 `eula.txt`를 수정하세요.

이후, 서버가 실행될 것이며 `localhost`(또는 `127.0.0.1`) 주소로 열립니다. 그러나 온라인 모드가 활성화되어 있어 공식 모장 계정만 접속할 수 있습니다. 기본 개발자 계정은 인증이 불가능하기에, 서버를 종료하고, `server.properties`에서 `online-mode`를 `false`로 설정하세요. 이젠 서버에 정상적으로 접속하실 수 있을 겁니다.

:::tip
모드는 전용 서버에서 테스트하시는걸 권장드립니다. 모드가 [클라이언트 전용][client]이라고 해도 서버에서 테스트해 아무런 동작도 하지 않는지 확인해야 합니다.
:::

[client]: ../concepts/sides.md#한쪽-사이드-전용-모드-만들기
[eclipse]: https://www.eclipse.org/downloads/
[git]: https://www.git-scm.com/
[github]: https://github.com/
[intellij]: https://www.jetbrains.com/idea/
[jdk]: https://learn.microsoft.com/en-us/java/openjdk/download#openjdk-17
[mdk]: https://github.com/neoforged/MDK
[neogradle]: https://docs.neoforged.net/neogradle/docs/
[properties]: modfiles.md#gradleproperties
