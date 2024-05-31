# Forge Update Checker

네오 포지는 가벼운 자동 업데이트 프레임워크를 제공합니다. 만약 업데이트가 가능한 모드가 있다면, 메인 메뉴의 "모드" 버튼과 모드 목록에 아이콘이 표시되고, 변경 사항도 그 옆에 같이 표시됩니다. 하지만 업데이트를 *자동으로 설치하진 않습니다*.

## 기초 설정

일단, `mods.toml`의 `updateJSONURL`을 변경하셔야 합니다. 이 값은 업데이트 정보를 담고 있는 JSON 파일을 제공하는 올바른 URL이어야 합니다. 이 파일을 언제든지 제공할 수만 있다면, 직접 구축하신 웹 서버, Github 등, 아무 데나 올리셔도 상관없습니다.

## 업데이트 JSON 형식

업데이트 JSON은 다음과 같은 간단한 형식을 가지고 있습니다:

```json5
{
  "homepage": "<모드 홈페이지>",
  "<mcversion>": {
    "<modversion>": "<변경 내역>", 
    // List all versions of your mod for the given Minecraft version, along with their changelogs
    // ...
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

This is fairly self-explanatory, but some notes:
 
- The link under `homepage` is the link the user will be shown when the mod is outdated.
- NeoForge uses an internal algorithm to determine whether one version string of your mod is "newer" than another. Most versioning schemes should be compatible, but see the `ComparableVersion` class if you are concerned about whether your scheme is supported. Adherence to [Maven versioning][mvnver] is highly recommended.
- The changelog string can be separated into lines using `\n`. Some prefer to include a abbreviated changelog, then link to an external site that provides a full listing of changes.
- Manually inputting data can be chore. You can configure your `build.gradle` to automatically update this file when building a release as Groovy has native JSON parsing support. Doing this is left as an exercise to the reader.

- Some examples can be found here for [nocubes][], [Corail Tombstone][corail] and [Chisels & Bits 2][chisel].

## 업데이트 확인 결과 이용하기

You can retrieve the results of the NeoForge Update Checker using `VersionChecker#getResult(IModInfo)`. You can obtain your `IModInfo` via `ModContainer#getModInfo`, where `ModContainer` can be added as a parameter to your mod constructor. You can obtain any other mod's `ModContainer` using `ModList.get().getModContainerById(<modId>)`. The returned object has a method `#status` which indicates the status of the version check.

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
