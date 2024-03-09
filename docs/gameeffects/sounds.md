효과음
=====

효과음은 게임속 상황을 오디오로 게임속 상황을 생동감 있게 전달하는 방법입니다.

용어 정리
-----------

| 용어      | 설명                                                                           |
|---------|------------------------------------------------------------------------------|
| 효과음 이벤트 | 효과음을 재생하는 객체로, `minecraft:block.anvil.hit`, `botania:spreader_fire` 등이 있습니다. |
| 효과음 종류  | 효과음의 종류, 또는 채널을 의미합니다. `플레이어`, `블록` 등 소리 설정 GUI에서 개별적으로 음량을 조절할 수 있습니다.      |
| 효과음 파일  | 효과음으로 재생될 일반 소리 파일입니다. .ogg를 확장자로 사용합니다.                                     |

`sounds.json`
-------------

이 JSON 파일은 효과음 이벤트, 파일과 자막 등을 정의합니다. `sounds.json`은 모드의 리소스 폴더 최상위(`assets/<modid>/sounds.json`)에 있어야 하며, 여기서 정의한 효과음 이벤트는 [리소스 위치][loc]으로 구분합니다.

이 파일의 전체 규격은 [위키][wiki]에 있지만, 아래 예시에서 핵심적인 부분을 참고하세요:

```js
{
  "open_chest": {
    "subtitle": "mymod.subtitle.open_chest",
    "sounds": [ "mymod:open_chest_sound_file" ]
  },
  "epic_music": {
    "sounds": [
      {
        "name": "mymod:music/epic_music",
        "stream": true,
        "pitch": 1.1,
        "volume": 1.1,
        "weight": 2
      }
    ]
  }
}
```

최상위 객체 아래 각 키는 효과음 이벤트들에 해당합니다, 이때 네임스페이스는 JSON이 포함된 폴더에서 유추됩니다. 각 효과음 이벤트는 효과음을 재생할 때 보여줄 자막과 효과음 파일의 위치를 지정합니다. 이때 파일의 위치는 배열로 지정하는데, 이는 게임이 여러 개의 효과음 중 하나를 골라 재생할 수 있도록 하기 위함입니다.

위 예시는 효과음 파일을 지정하는 두 가지 방법을 보여주는데, 일반적으로 배경음악과 같은 긴 음악 파일은 `stream` 옵션을 활용하여 메모리 및 로딩 시간을 절약합니다. 그 외의도 효과음의 크기(`volume`), 음 높이(`pitch`), 그리고 무작위로 선택할 때의 가중치(`weight`) 또한 지정할 수 있습니다.

재생할 효과음 파일의 위치는 `assets/<namespace>/sounds/<path>.ogg`로 정의합니다, 예를 들어 `mymod:open_chest_sound_file` 는 `assets/mymod/sounds/open_chest_sound_file.ogg`를, `mymod:music/epic_music`은 `assets/mymod/sounds/music/epic_music.ogg`를 가리킵니다.

`sounds.json`또한 [생성될 수 있습니다][datagen].

효과음 이벤트 정의하기
---------------------

서버에서 효과음을 참조하기 위해선, `sounds.json`에 정의된 효과음에 해당하는 `SoundEvent`가 필요합니다. `SoundEvent`는 `sounds.json`의 각 효과음 이벤트들을 대표하는 클래스로, 게임을 불러올 때 [등록 및 생성][registration]합니다.

만약 모드의 API를 공개할 계획이라면, `SoundEvent`또한 공개 API의 일부로 포함하는 것이 좋습니다.

:::note
`sounds.json`에 정의되는 모든 효과음들은 이에 해당하는 `SoundEvent`가 존재하지 않아도 논리 클라이언트는 인식할 수 있습니다.
:::

효과음 재생하기
--------------

효과음을 재생하는 방법은 여러 개가 존재하기에, 아래는 언제 무슨 메서드를 사용하는지 다룹니다.

아래 메서드들은 전부 위에서 등록한 `SoundEvent`를 인자로 받습니다. 또한 [**서버와 클라이언트간 기능이 다르기에**][sides] 각각 구분해서 다룹니다.

### `Level`

1. <a name="level-playsound-pbecvp"></a> `playSound(Player, BlockPos, SoundEvent, SoundCategory, volume, pitch)`

   - 단순히 `BlockPos#getCenter`를 이용해 [(2)번 메서드를](#level-playsound-pxyzecvp) 호출합니다.

2. <a name="level-playsound-pxyzecvp"></a> `playSound(Player, double x, double y, double z, SoundEvent, SoundCategory, volume, pitch)`

   - **클라이언트**: 만약 인자로 전달된 플레이어가 **메인 클라이언트 플레이어**일 경우에만 효과음을 재생합니다.
   - **서버**: 인자로 전달된 플레이어를 **제외한** 모두에게 효과음을 재생합니다.
   - **사용법**: 효과음을 재생하는 코드가 [양쪽 사이드][sides]에서 실행될 때 사용합니다. 효과음을 재생한 플레이어는 클라이언트가 직접 재생할 것이고, 서버에서는 이미 스스로 효과음을 재생하고 있는 플레이어를 제외한 주변 사람들에게 효과음 패킷을 전송합니다. 만약 효과음을 재생한 원인이 플레이어가 아니라면 첫번째 인자로 `null`을 전달해 모두에게 효과음 패킷을 전송할 수 있습니다.

3. <a name="level-playsound-xyzecvpd"></a> `playLocalSound(double x, double y, double z, SoundEvent, SoundCategory, volume, pitch, distanceDelay)`

   - **클라이언트**: 단순히 클라이언트에서 효과음을 재생합니다. 만약`distanceDelay`가 `true`라면, 효과음 재생 위치로부터 플레이어의 거리에 따라 효과음을 나중에 재생합니다.
   - **서버**: 아무 동작도 하지 않습니다.
   - **사용법**: 이 메서드는 클라이언트 전용이니, 효과음을 재생하는 커스텀 패킷이나 자기한테만 들리는 효과음, 또는 번개와 같은 클라이언트 전용 특수효과의 효과음을 구현할 때 유용합니다.

### `ClientLevel`

1. <a name="clientlevel-playsound-becvpd"></a> `playLocalSound(BlockPos, SoundEvent, SoundCategory, volume, pitch, distanceDelay)`
   - 단순히 `BlockPos#getCenter`를 이용해 `Level`의 [(3)번 메서드를](#level-playsound-xyzecvpd) 호출합니다.

### `Entity`

1. <a name="entity-playsound-evp"></a> `playSound(SoundEvent, volume, pitch)`
   - 단순히 `Level`의 [(2)번 메서드를](#level-playsound-pxyzecvp) 호출합니다, 플레이어 인자로 `null`을 전달합니다.
   - **클라이언트**: 아무 동작도 하지 않습니다.
   - **서버**: 엔티티 근처의 모든 플레이어에게 효과음을 재생합니다.
   - **사용법**: 서버에서 플레이어가 아닌 엔티티의 효과음을 재생할 때 사용합니다.

### `Player`

1. <a name="player-playsound-evp"></a> `playSound(SoundEvent, volume, pitch)` ([`Entity`의 메서드를 재정의함](#entity-playsound-evp))
   - 단순히 `Level`의 [(2)번 메서드를](#level-playsound-pxyzecvp) 호출합니다, 플레이어 인자로 `this`를 전달합니다.
   - **클라이언트**: 아무런 동작도 하지 않습니다. [`LocalPlayer`](#localplayer-playsound-evp)에서 해당 메서드를 재정의합니다.
   - **서버**: 전달된 플레이어를 *제외*한 나머지 플레이어들에게 효과음을 재생합니다.
   - **사용법**: [`LocalPlayer`](#localplayer-playsound-evp)를 참고하세요.

### `LocalPlayer`

1. <a name="localplayer-playsound-evp"></a> `playSound(SoundEvent, volume, pitch)` ([`Player`의 메서드를 재정의함]
   - 단순히 `Level`의 [(2)번 메서드를](#level-playsound-pxyzecvp) 호출합니다, 플레이어 인자로 `this`를 전달합니다.
   - **클라이언트**: 효과음을 재생합니다.
   - **서버**: 이 메서드는 클라이언트 전용입니다.
   - **Usage**: `Level`과 유사하게, 양쪽 [사이드][sides]에서 실행되는 코드가 효과음을 재생할 때 사용합니다, 클라이언트는 알아서 자기 자신에게 효과음을 재생하고, 서버는 이미 효과음을 재생하고 있는 해당 클라이언트를 제외한 주변 사람들에게 효과음 패킷을 보냅니다.


[loc]: ../misc/resourcelocation.md
[wiki]: https://minecraft.wiki/w/Sounds.json
[datagen]: ../datagen/client/sounds.md
[registration]: ../concepts/registries.md#객체-등록하기
[sides]: ../concepts/sides.md
