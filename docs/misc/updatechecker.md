포지 자동 업데이트 시스템
====================

포지는 가벼운 자동 업데이트 프레임워크를 제공합니다. 만약 업데이트가 가능한 모드가 있다면, 메인 메뉴의 "모드" 버튼과 모드 목록에 아이콘이 표시되고, 변경 사항도 그 옆에 같이 표시됩니다. 하지만 업데이트를 *자동으로 설치하진 않습니다*.

기초 설정
---------------

일단, `mods.toml`의 `updateJSONURL`을 변경하셔야 합니다. 이 값은 업데이트 정보를 담고 있는 JSON 파일을 제공하는 올바른 URL이어야 합니다. 이 파일을 언제든지 제공할 수만 있다면, 직접 구축하신 웹 서버, Github 등, 아무 데나 올리셔도 상관없습니다.

업데이트 JSON 형식
------------------

업데이트 JSON은 다음과 같은 간단한 형식을 가지고 있습니다:

```js
{
  "homepage": "<모드 홈페이지>",
  "<mcversion>": {
    "<modversion>": "<변경 내역>", 
    "<modversion>": "<변경 내역>", 
    "<modversion>": "<변경 내역>", 
    "<modversion>": "<변경 내역>", 
    //.........
  },
  "promos": {
    "<mcversion>-latest": "<modversion>",
    // 해당 마인크래프트 버전에서 가장 최신 모드 버전을 선언합니다.
    "<mcversion>-recommended": "<modversion>",
    // 해당 마인크래프트 버전에서 안정된 모드 버전을 선언합니다.
    // ...
  }
}
```

형식이 간단하여 긴 설명이 필요하지 않으나, 알아두셔야 할 점이 몇 가지 있습니다:

* `homepage`는 모드를 업데이트해야 할 때 사용자에게 표시될 링크입니다.

* 포지는 직접 버전 문자열을 비교하는 알고리즘을 구현합니다. 대부분의 버전 형식이랑 호환되지만, 사용하고자 하시는 버전 형식이 제대로 처리될지 확실하게 알고 싶으시다면 `ComparableVersion`을 참고하여 주세요. 저희는 [Maven 버전 규약][mvnver]을 사용하시는 것을 강력히 추천드립니다.

* 변경 내역 문자열은 `\n`을 사용해 여러 줄로 나눌 수 있습니다. 이때 여기 적는 변경 내역에는 요약본만 적어두고 전체 변경 내역은 다른 사이트에서 참고할 수 있도록 링크를 걸어두실 수도 있습니다.

* 직접 업데이트 JSON 파일을 작성하는 것은 귀찮을 수 있습니다. Groovy는 기본적으로 JSON을 지원하니, `build.gradle`을 이용해 자동으로 이 JSON 파일을 작성하도록 하실 수도 있습니다. 구체적인 방법은 여러분들에게 숙제로 남겨드리죠. :)
- 참고할만한 업데이트 JSON 예제들입니다: [nocubes][], [Corail Tombstone][corail], [Chisels & Bits 2][chisel].

업데이트 확인 결과 이용하기
-------------------------------

모드 버전 업데이트 확인 결과를 코드에서 이용하시려면 `VersionChecker#getResult(IModInfo)`를 호출하시면 됩니다. `IModInfo`는 `ModContainer#getModInfo`를 통해 얻으실 수 있고, `ModContainer`는 모드 메인 클래스의 생성자에서 `ModLoadingContext.get().getActiveContainer`를 호출하시거나, `ModList.get().getModContainerById("모드 아이디")`, 또는 `ModList.get().getModContainerByObject(모드 메인 클래스 인스턴스)`로 얻으실 수 있습니다, 다른 모드의 `ModContainer`는 해당 모드의 아이디를 이용하여 얻으실 수 있습니다. `VersionChecker#getResult`가 반환한 객체의 `#status` 메서드는 버전 업데이트 확인 결과를 반환합니다.

|          Status | 설명                              |
|----------------:|:--------------------------------|
|        `FAILED` | 버전 업데이트 시스템이 제공된 URL에 접속할 수 없음. |
|    `UP_TO_DATE` | 현재 버전이 최신 안정 버전과 동일.            |
|         `AHEAD` | 현재 버전이 최신 안정 버전보다 높음.           |
|      `OUTDATED` | 최신 안정 버전으로 업데이트가 가능함.           |
| `BETA_OUTDATED` | 최신 베타 버전으로 업데이트가 가능함.           |
|          `BETA` | 현재 버전이 최신 베타 버전 이상임.            |
|       `PENDING` | 아직 업데이트 확인이 끝나지 않았음.            |

`VersionChecker#getResult`는 업데이트 가능 버전 및 변경 내역 또한 포함하고 있습니다.

[mvnver]: ../gettingstarted/versioning.md
[nocubes]: https://cadiboo.github.io/projects/nocubes/update.json
[corail]: https://github.com/Corail31/tombstone_lite/blob/master/update.json
[chisel]: https://github.com/Aeltumn/Chisels-and-Bits-2/blob/master/update.json
