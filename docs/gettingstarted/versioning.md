버전 관리
==========

In general projects, [semantic versioning][semver] is often used (which has the format `MAJOR.MINOR.PATCH`). However, in
the case of modding it may be more beneficial to use the format `MCVERSION-MAJORMOD.MAJORAPI.MINOR.PATCH` to be able to
differentiate between world-breaking and API-breaking changes of a mod.

일반적인 프로젝트에서는 [시멘틱 버전 관리][semver]를 많이 사용합니다('MAJOR.MINOR.PATCH' 형식).
그러나 모드의 경우 'MCVERSION-MAJORMOD.MAJORAPI.MINOR.PATCH' 형식을 사용하는 것이 유리할 수 있습니다.
(세계가 깨지거나 API가 작동하지 않는 등 마인크래프트에서 발생하는 주요 문제를 구분하기 위해)

:::caution
Forge는 [Maven 버전 범위][cmpver]를 사용하여 버전 문자열을 비교하는데, 이는 'prerelease' 태그와 같은 Semantic Versioning 2.0.0 과 완전히 호환되지 않습니다.
:::

Examples
--------

Here is a list of examples that can increment the various variables.

* `MCVERSION`
    * Always matches the Minecraft version the mod is for.
* `MAJORMOD`
    * Removing items, blocks, block entities, etc.
    * Changing or removing previously existing mechanics.
    * Updating to a new Minecraft version.
* `MAJORAPI`
    * Changing the order or variables of enums.
    * Changing return types of methods.
    * Removing public methods altogether.
* `MINOR`
    * Adding items, blocks, block entities, etc.
    * Adding new mechanics.
    * Deprecating public methods. (This is not a `MAJORAPI` increment since it doesn't break an API.)
* `PATCH`
    * Bugfixes.

예시들
--------

다음은 버전의 변수와 변경시킬 수 있는 요인입니다.

* `MCVERSION`
    * 항상 모드가 필요로 하는 마인크래프트 버전과 일치해야 합니다.
* `MAJORMOD`
    * 아이템, 블록, 블록 엔터티 등을 제거합니다.
    * 이전에 존재한 로직을 변경하거나 제거합니다.
    * 새로운 마인크래프트 버전으로 업데이트합니다.
* `MAJORAPI`
    * 이넘(enum)의 순서나 변수를 변경합니다.
    * 메서드의 반환 타입을 변경합니다.
    * 특정 메서드를 완전히 제거합니다.
* `MINOR`
    * 아이템, 블록, 블록 엔터티 등을 추가합니다.
    * 새로운 로직 추가합니다.
    * 공개 메서드를 폐기합니다. (이것은 API를 깨뜨리지 않기 때문에 `MAJORAPI` 증가가 아닙니다.)
* `PATCH`
    * 버그 수정입니다.

어떤 변수를 증가시킬 때, 그보다 낮은 변수들은 모두 `0`으로 재설정되어야 합니다.
예를 들어, `MINOR`가 증가하면 `PATCH`는 `0`이 됩니다.
만약 `MAJORMOD`가 증가하면 다른 모든 변수들은 `0`이 됩니다.

### 진행 중인 작업

모드의 초기 개발 단계에서 (공식 릴리스 이전에), `MAJORMOD`와 `MAJORAPI`는 항상 `0`으로 유지되어야 합니다.
빌드할 때마다 `MINOR`과 `PATCH`만 업데이트되어야 합니다. 공식 릴리스를 빌드하면 (`MAJORAPI`가 안정된 상태로 대부분 시간이 소요됩니다),
`MAJORMOD`를 버전 `1.0.0.0`으로 증가시키는 것이 좋습니다. 추가 개발 단계에서는 이 문서의 [사전 릴리스][pre] 및 [릴리스 후보][rc]
섹션을 참조하십시오.

### 여러 마인크래프트 버전

모드가 새로운 마인크래프트 버전으로 업그레이드되고 이전 버전은 버그 수정만 받을 경우, `PATCH` 변수는 업그레이드 전 버전을 기반으로 업데이트되어야 합니다.
만약 모드가 이전 버전과 새로운 버전의 마인크래프트에서 모두 활발히 개발 중이라면, **둘 다** 빌드 번호에 버전을 추가하는 것이 좋습니다.
예를 들어, 모드가 마인크래프트 버전 변경으로 인해 `3.0.0.0`으로 업그레이드된다면, 이전 모드도 `3.0.0.0`으로 업데이트해야 합니다.
이전 버전은 예를 들어 `1.7.10-3.0.0.0` 버전이 되며, 새로운 버전은 `1.8-3.0.0.0` 버전이 됩니다.
더 이상의 변경 사항이 없는 경우, 새로운 마인크래프트 버전을 위해 빌드할 때 Minecraft 버전을 제외한 모든 변수는 동일하게 유지되어야 합니다.

### 최종 릴리스

특정 마인크래프트 버전의 지원을 중단하는 경우, 해당 버전의 마지막 빌드에는 `-final` 접미사가 추가되어야 합니다.
이는 해당 `MCVERSION`에 대한 모드 지원이 더 이상 되지 않을 것임을 나타내며, 플레이어들은 업데이트와 버그 수정을 계속받기 위해
새로운 버전의 모드로 업그레이드해야 한다는 것을 의미합니다.

### 사전 릴리스

아직 완전하지 않은 새로운 기능들을 릴리스하는 사전 릴리스도 가능합니다. 이는 어떤 의미에서 "베타"로 볼 수 있습니다.
이러한 버전은 `-betaX`와 같은 형식으로 버전 번호에 추가되어야 합니다. 여기서 `X`는 사전 릴리스의 번호입니다.
(본 안내서는 `-pre` 대신 `-beta`를 사용하지 않습니다. 현재 작성 시점에서는 `-pre`는 `-beta`의 유효한 별칭이 아닙니다.)
이미 릴리스된 버전과 초기 릴리스 이전의 버전은 사전 릴리스로 들어갈 수 없습니다. 사전 릴리스를 추가하기 전에 변수들 (`MINOR` 주로, `MAJORAPI`와 `MAJORMOD`도 가능)
를 적절하게 업데이트해야 합니다. 초기 릴리스 이전의 버전은 단순히 진행 중인 작업 빌드입니다.

### 릴리스 후보

릴리스 후보는 실제 버전 변경 전의 사전 릴리스 역할을 합니다. 이러한 버전은 `-rcX`와 같은 형식으로 버전 번호에 추가되어야 합니다.
여기서 `X`는 릴리스 후보의 번호이며, 이론적으로 버그 수정만을 위해 증가시켜야 합니다.
이미 릴리스된 버전은 릴리스 후보를 받을 수 없습니다. 릴리스 후보를 추가하기 전에 변수들 (`MINOR` 주로, `MAJORAPI`와 `MAJORMOD`도 가능)
를 적절하게 업데이트해야 합니다. 릴리스 후보를 안정 버전 빌드로 릴리스할 때, 마지막 릴리스 후보와 완전히 동일하게 또는 몇 가지 더 많은 버그 수정이 포함될 수 있습니다.


[semver]: https://semver.org/

[cmpver]: https://maven.apache.org/ref/3.5.2/maven-artifact/apidocs/org/apache/maven/artifact/versioning/ComparableVersion.html

[pre]: #pre-releases

[rc]: #release-candidates
