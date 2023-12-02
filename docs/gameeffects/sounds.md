효과음
======

효과음은 `SoundEvent`로 대표되며, 레지스트리에 [등록][registration]

`sounds.json`
-------------

이 JSON 파일은 효과음 이벤트, 파일, 자막 등을 정의합니다. `sounds.json`은 모드의 리소스 폴더 최상위(`assets/<modid>/sounds.json`)에 있어야 합니다.

이 파일의 전체 규격은 [위키][wiki]에 있지만, 아래 예제에서도 중요한 부분들을 보여줍니다:

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

최상위 객체 아래 각 키은 효과음 이벤트들에 해당합니다, 이때 네임스페이스를 지정하지 않는데, 이는 JSON이 포함된 폴더에서 유추합니다. 각 효과음 이벤트는 효과음을 재생할 때 보여줄 자막과 재생할 효과음 파일의 위치를 지정합니다. 이때, 효과음 파일의 위치가 배열로 주어지는데, 이는 게임이 여러 개의 효과음 중 하나를 골라 재생할 수 있도록 하기 위함입니다.

위 예시는 효과음 파일을 지정하는 두 가지 방법을 보여주는데, 일반적으로 배경음악과 같은 긴 음악 파일은 `stream` 옵션을 활용하여 메모리 및 로딩 시간을 절약하기 위하여 두 번째 방법으로 지정합니다. 두 번째 방법은 효과음의 크기(`volume`), 음 높이(`pitch`), 그리고 무작위로 선택할 때의 가중치(`weight`) 또한 지정할 수 있습니다.

재생할 효과음 파일의 위치는 `assets/<namespace>/sounds/<path>.ogg`로 정의합니다, 예를 들어 `mymod:open_chest_sound_file` 는 `assets/mymod/sounds/open_chest_sound_file.ogg`를, `mymod:music/epic_music`은 `assets/mymod/sounds/music/epic_music.ogg`를 가리킵니다.

`sounds.json`또한 [생성될 수 있습니다][datagen].

효과음 이벤트 정의하기
---------------------

서버에서 효과음을 참조하기 위해선, `sounds.json`에 정의된 효과음에 해당하는 `SoundEvent`가 무조건 필요합니다. `SoundEvent`는 `sounds.json`의 각 효과음 이벤트들을 대표하는 클래스로, 게임 로딩 중 [등록하여][registration] 생성합니다.

서버에서 클라이언트에 효과음을 재생하도록 하기 위해 `SoundEvent`를 사용합니다. 만약 모드가 API를 제공한다면, 모드에서 생성한 `SoundEvent`또한 API의 일부로 포함하는 것이 좋습니다.

!!! note
`sounds.json`에 정의되는 모든 효과음들은 이에 해당하는 `SoundEvent`가 존재하지 않아도 여전히 클라이언트는 인식합니다! 다시 말하지만 `SoundEvent`는 서버에서 클라이언트가 인식하는 효과음을 참조하기 위해서 존재합니다!

효과음 재생하기
--------------

효과음을 재생하는 방법은 여러 개가 존재하기에, 무엇을 사용해야 할지 헷갈릴 수 있습니다.

아래 메서드들은 전부 위에서 등록한 `SoundEvent`를 인자로 받습니다. 또한 **서버와 클라이언트는 `SoundEvent`를 [다르게 처리합니다][sides].**

### `Level`

1. <a name="level-playsound-pbecvp"></a> `playSound(Player, BlockPos, SoundEvent, SoundCategory, volume, pitch)`

   - 단순히 `BlockPos#getCenter`를 이용해 [(2)번 메서드를](#level-playsound-pxyzecvp) 호출합니다.

2. <a name="level-playsound-pxyzecvp"></a> `playSound(Player, double x, double y, double z, SoundEvent, SoundCategory, volume, pitch)`

   - **클라이언트**: 만약 인자로 전달된 플레이어가 **메인 클라이언트 플레이어**일 경우에만 효과음을 재생합니다.
   - **서버**: 인자로 전달된 플레이어를 **제외한** 모두에게 효과음을 재생합니다.
   - **사용법**: 만약 플레이어에 의해 실행되는 로직이 클라이언트와 서버에서 동시에 실현되고, 효과음 또한 재생해야 한다면 사용합니다. 해당 로직을 처리할 때, 클라이언트는 자기가 직접 효과음을 재생할 것이고, 서버에서는 이미 해당 플레이어가 스스로 효과음을 재생하고 있으니 해당 플레이어에겐 효과음 패킷을 보내지 않습니다. 이뿐만 아니라, 레벨 내 특정 좌표에서 효과음을 재생할 때 플레이어 인자로 `null`을 전달해 모두에게 재생할 수도 있습니다.

3. <a name="level-playsound-xyzecvpd"></a> `playLocalSound(double x, double y, double z, SoundEvent, SoundCategory, volume, pitch, distanceDelay)`

   - **클라이언트 Behavior**: 단순히 클라이언트에서 효과음을 재생합니다. 만약`distanceDelay`가 `true`라면, 효과음 재생 위치로부터 플레이어의 거리에 따라 효과음을 나중에 재생합니다.
   - **서버**: 아무것도 안 함.
   - **사용법**: 이 메서드는 클라이언트 전용이니, 효과음을 재생하는 커스텀 패킷이나 자기한테만 들리는 효과음, 또는 번개와 같은 클라이언트 전용 특수효과의 효과음을 구현할 때 유용합니다.

### `ClientLevel`

1. <a name="clientlevel-playsound-becvpd"></a> `playLocalSound(BlockPos, SoundEvent, SoundCategory, volume, pitch, distanceDelay)`
   - 단순히 `BlockPos#getCenter`를 이용해 `Level`의 [(3)번 메서드를](#level-playsound-xyzecvpd) 호출합니다.

### `Entity`

1. <a name="entity-playsound-evp"></a> `playSound(SoundEvent, volume, pitch)`
   - 단순히 `Level`의 [(2)번 메서드를](#level-playsound-pxyzecvp) 호출합니다, 플레이어 인자로 `null`을 전달합니다.
   - **클라이언트**: 아무것도 안 함.
   - **서버**: 엔티티 근처의 모든 플레이어에게 해당 효과음 재생.
   - **사용법**: 플레이어가 아닌 엔티티의 효과음을 서버에서 재생할 때 사용함.

### `Player`

1. <a name="player-playsound-evp"></a> `playSound(SoundEvent, volume, pitch)` ([`Entity`의 메서드를 오버라이드함](#entity-playsound-evp))
   - 단순히 `Level`의 [(2)번 메서드를](#level-playsound-pxyzecvp) 호출합니다, 플레이어 인자로 `this`를 전달합니다.
   - **클라이언트**: 해당 효과음 재생.
   - **서버**: 전달된 플레이어를 *제외*한 나머지 플레이어들에게 효과음을 재생함.
   - **사용법**: `Level`과 유사하게, 양쪽 [사이드][sides]에서 실행되는 로직이 효과음을 재생할 때 사용합니다, 클라이언트는 알아서 자기 자신에게 효과음을 재생하고, 서버는 이미 효과음을 재생하고 있는 해당 클라이언트를 제외한 모두에게 효과음 패킷을 보냅니다.

[loc]: ../concepts/resources.md#resourcelocation
[wiki]: https://minecraft.wiki/w/Sounds.json
[datagen]: ../datagen/client/sounds.md
[registration]: ../concepts/registries.md#객체-등록하기
[sides]: ../concepts/sides.md
