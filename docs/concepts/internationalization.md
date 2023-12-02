다국어 지원
=====================================

마인크래프트는 다국어를 국제화(Internationalization, i18n라고 하기도 합니다.)와 현지화를 통해 지원합니다. 국제화는 다양한 언어를 지원할때 코드의 변경이 필요하지 않도록 하는 설계 방법입니다, 그리고 현지화는 표시되는 글자들을 유저의 언어에 맞게 바꾸는 과정입니다.

국제화와 현지화는 문자열 치환을 통해 이루어집니다. 국제화는 _번역 키값_을 사용하는데, 번역 키값은 표시 가능한 텍스트로 치환 가능한 문자열입니다. 예를 들어, 흙 블록의 이름 "Dirt" 는 `block.minecraft.dirt` 라는 번역 키값을 표시 가능한 텍스트로 치환하여 얻을 수 있습니다. 이를 통해 표시 가능한 텍스트들을 사용자의 언어에 관계없이 참조할 수 있으며, 새로운 언어를 지원하기 위해 게임의 코드를 수정할 필요가 없습니다.

현지화는 게임의 언어 설정을 따라 진행됩니다. 클라이언트에서는 언어 설정에서 다른 국가의 언어를 사용할 수 있지만, 전용 서버에서는 오직 `en_us` (영어)만이 지원됩니다. 지원되는 언어들은 [마인크래프트 위키][langs]에서 확인하실 수 있습니다.

언어 파일
--------------

마인크래프트가 지원하는 언어들은 그 언어용 언어 파일이 각각 존재하고, 이 언어 파일들은 `asset/[네임 스페이스]/lang/[언어 코드].json` 에 위치합니다. (예: `examplemod`를 모드 아이디로 가지는 모드의 한국어 언어 파일은 `assets/examplemod/lang/ko_kr.json` 에 위치합니다.) 이 파일은 번역 키값을 실제 텍스트로 변환해주는 간단한 json 파일 입니다. 언어 파일들의 인코딩은 무조건 UTF-8이어야 합니다. 구버전 .lang 파일들은 [변환기][converter]를 통해 .json으로 변환할 수 있습니다. `.lang` 파일의 각 줄은 `<번역 키값>`:`<텍스트>` 형식으로 작성되어 있습니다.

```js
{
  "item.examplemod.example_item": "예시 아이템 이름",
  "block.examplemod.example_block": "예시 블록 이름",
  "commands.examplemod.examplecommand.error": "예시 커맨드 오류!"
}
```

블록과 아이템에서 사용하기
---------------------------

블록, 아이템, 발전과제와 같은 게임의 여러 요소들은 번역 키값의 형태가 정해져있는데, 아이템은 `item.<네임 스페이스>.<경로>`, 블록은 `block.<네임 스페이스>.<경로>` 와 같은 형태를 가지고 있습니다. 이러한 형태는 각 클래스의 `#getDescriptionId` 메서드에서 정합니다. 또, 아이템은 `#getDescriptionId(ItemStack)` 메서드도 있는데, 이 메서드를 재정의하여 아이템의 NBT에 따라 다른 번역 키값을 사용하실 수도 있습니다.

`#getDescriptionId` 는 대개 레지스트리 이름의 겹점(:)을 점으로 대체한 것(예: "examplemod:example_item" -> "examplemod.example_item") 앞에 `block.` 이나 `item.` 이 붙은 문자열을 번역 키값으로 반환합니다(예: "item.examplemod.example_item"). `BlockItem`은 예외적으로 `Item#getDescriptionId`를 재정의하여 자신이 상징하는 블록의 번역 키값을 대신 사용합니다. 예를 들어 아이템 `examplemod:example_item`의 이름은 다음과 같이 정의합니다:

```json
{
  "item.examplemod.example_item": "예시 아이템 이름"
}
```

:::note
번역 키값은 텍스트 식별을 위한 것일 뿐입니다, 이를 레지스트리 객체를 구분하는데 사용하지 마세요, 꼭 레지스트리 이름을 대신 사용하세요!
:::

현지화 하는법
--------------------

:::caution
많은 분들이 자주 하시는 실수가, 서버와 클라이언트의 언어 설정이 다를 수 있는데도 서버에서 먼저 현지화를 하고 클라이언트에 텍스트를 전송하는 것입니다. 

서버는 클라이언트가 직접 현지화를 하도록 `TranslatableContents` 등을 사용해야 합니다.
:::

### `net.minecraft.client.resources.language.I18n` (클라이언트 전용)

**이 클래스는 클라이언트에만 존재합니다!** 이를 서버에서 사용하려고 하면 예외가 발생하고 게임이 충돌합니다.

- `get(String, Object...)` 는 번역 키값을 텍스트로 치환하고 여기에 포매팅까지 적용하는 메서드입니다. 사용법은 `String.format(String, Object...)`과 비슷한데, 첫번째 인자는 번역 키값, 그 이후 가변 인자는 텍스트 중간에 삽입할 객체들 입니다. `%s`와 같은 서식 지정자는 사용하실 수 없습니다.

### `TranslatableContents`

`TranslatableContents`는 문자열 치환과 포매팅이 나중에 이루어지는 `ComponentContents` 입니다. 클라이언트에서 직접 언어 설정에 맞는 문자열로 치환하여 플레이어에게 메시지를 보낼 때 유용합니다.

`TranslatableContents(String, Object...)`의 첫번째 인자는 번역 키값이고, 나머지는 [포매팅][formatting]에 사용됩니다.

`MutableComponent`는 `Component#translatable`에 위 생성자와 동일한 인자를 전달하거나, `MutableComponent#create`에 직접 `TranslatableContents`를 넘겨 생성하실 수 있습니다.
자세한 내용은 [components]를 참고하세요.

### `TextComponentHelper`

- `createComponentTranslation(CommandSource, String, Object...)`는 클라이언트와 서버간 메시지를 주고 받을 때 유용합니다. 모드가 설치된 서버에 바닐라 클라이언트가 접속할 수도 있는데, 만약 메시지의 수신자가 바닐라 클라이언트라면 현지화에 필요한 언어 데이터가 없을 것이니 서버가 직접 자신의 언어로 현지화한 메시지를 클라이언트에 전송합니다. 만약 수신자가 바닐라 클라이언트가 아니라면 단순하게 `TranslatableComponent`를 생성합니다.

[langs]: https://minecraft.wiki/w/Language#Languages
[converter]: https://tterrag.com/lang2json/
[formatting]: ../misc/components.md#text-formatting
[components]: ../misc/components.md
