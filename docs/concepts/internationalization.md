다국어 지원
=====================================

마인크래프트는 다국어를 국제화(Internationalization, i18n라고 하기도 합니다.)와 현지화를 통해 지원합니다. 국제화는 다양한 언어를 지원할때 코드의 변경이 필요하지 않도록 하는 설계 방법입니다, 그리고 현지화는 표시되는 글자들을 유저의 언어에 맞게 바꾸는 과정입니다.

국제화와 현지화는 문자열 치환을 통해 이루어집니다. 국제화는 _번역 키값_을 사용하는데, 번역 키값은 표시 가능한 텍스트로 치환 가능한 문자열입니다. 예를 들어, 흙 블록의 이름 "Dirt" 는 `block.minecraft.dirt` 라는 번역 키값을 표시 가능한 텍스트로 치환하여 얻을 수 있습니다. 이를 통해 표시 가능한 텍스트들을 사용자의 언어에 관계없이 참조할 수 있으며, 새로운 언어를 지원하기 위해 게임의 코드를 수정할 필요가 없습니다.

현지화는 게임의 언어 설정을 따라 진행됩니다. 클라이언트에서는 언어 설정에서 다른 국가의 언어를 사용할 수 있지만, 전용 서버에서는 오직 `en_us` (영어)만이 지원됩니다. 지원되는 언어들은 [마인크래프트 위키][언어]에서 확인하실 수 있습니다.

언어 파일
--------------

마인크래프트가 지원하는 언어들은 그 언어용 언어 파일이 각각 존재하고, 이 언어 파일들은 `asset/[네임 스페이스]/lang/[언어 코드].json` 에 위치합니다. (예: `examplemod`를 모드 아이디로 가지는 모드의 한국어 언어 파일은 `assets/examplemod/lang/ko_kr.json` 에 위치합니다.) 이 파일은 번역 키값을 실제 텍스트로 변환해주는 간단한 json 파일 입니다. 언어 파일들의 인코딩은 무조건 UTF-8이어야 합니다. 구버전 .lang 파일들은 [변환기][변환기]를 통해 .json으로 변환할 수 있습니다. `.lang` 파일의 각 줄은 `<번역 키값>`:`<텍스트>` 형식으로 작성되어 있습니다.

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

`#getDescriptionId` 는 대개 레지스트리 이름의 겹점(:)을 점으로 대체한 것(예: "examplemod:example_item" -> "examplemod.example_item") 앞에 `block.` 이나 `item.` 이 붙은 문자열을 번역 키값으로 반환합니다(예: "item.examplemod.example_item"). `BlockItem` 은 `Item#getDescriptionId`를 재정의하여 자신이 상징하는 블록의 번역 키값을 대신 사용하도록 되어 있습니다.

아이템 `examplemod:example_item` 의 이름은 다음처럼 지정하실 수 있습니다:

```json
{
  "item.examplemod.example_item": "예시 아이템 이름"
}
```

:::note
번역 키값은 텍스트 식별을 위한 것일 뿐입니다, 이를 레지스트리 객체를 구분하는데 사용하지 마세요, 꼭 레지스트리 이름을 대신 사용하세요!
:::


`Component` and `ComponentContents`
--------------------

현지화 가능한 텍스트는 일종의 트리 구조로 나타낼 수 있습니다, 각 노드는 `Component`로, 노드들의 텍스트로 변환 가능한 데이터는 `ComponentContents`로 표현합니다. `Component`의 자식 노드들은 `Component#getSiblings`로 받아올 수 있으며(메서드 이름 단어가 잘못된거 압니다), 나중에 `Component`를 사용자에게 표시할 때는 해당 `Component` 자체의 `ComponentContents`, 그리고 자식들것을 순서대로 덧붙여 하나의 문자열로 만듭니다. 각 `Component`에는 글꼴, 굵기, 기울임 등을 지정하는 `Style`이 있는데, 자식 `Component`는 부모의 `Style`을 상속합니다. 

`Component`는 `Component`의 유일한 구현체인 `MutableComponent`를 생성하고 `ComponentContents`를 담는 여러 정적 메서드들을 제공합니다. 또는 `MutableComponent#create(ComponentContents)`에 직접 `ComponentContents`를 전달하여 생성하실 수도 있습니다.

`ComponentContents`는 임의의 데이터를 텍스트에 담기 위해 어떻게 글자로 변환해야 하는지를 정의하는데 사용됩니다. 예를 들어, 키바인드 데이터를 담을 수 있는 `ComponentContents`를 만들고, 이를 글자로 변환할 땐 해당 키바인드의 이름으로 변환하도록 할 수 있습니다(`KeybindContents`가 이런 역할을 합니다). 아니면, 번역 키 값을 데이터로 가지는 `ComponentContents`를 만들고 나중에 이를 텍스트로 변환할 때는 번역된 텍스트로 치환하도록 만들 수도 있습니다, 궁극적으로 현지화를 이루는 것이죠(`TranslatableContents`가 이런 역할을 합니다).

:::caution
많은 모드들에서 서버에서 직접 번역 키값을 미리 텍스트로 치환한 다음 클라이언트에 전송하는 실수를 저지릅니다.

서버의 언어 설정은 클라이언트와 다를 수 있기 때문에 서버는 `TranslatableContents` 와 번역 키값을 사용하여 클라이언트가 직접 번역을 수행하도록 해야 합니다.
:::

현지화 하는법
--------------------

### `net.minecraft.client.resources.language.I18n` (클라이언트 전용)

**이 클래스는 클라이언트에만 존재합니다!** 이를 서버에서 사용하려고 하면 예외가 발생하고 게임이 충돌합니다.

- `get(String, Object...)` 는 번역 키값을 텍스트로 치환하고 여기에 포매팅까지 적용하는 메서드입니다. 사용법은 `String.format(String, Object...)`과 비슷한데, 첫번째 인자는 번역 키값, 그 이후 가변 인자는 텍스트 중간에 삽입할 객체들 입니다. `%s`와 같은 서식 지정자는 사용하실 수 없습니다.

### `TranslatableContents`

`TranslatableContents` 는 문자열 치환과 포매팅이 나중에 이루어지는 `ComponentContents` 입니다. 클라이언트에서 직접 언어 설정에 맞는 문자열로 번역 키값을 수행하도록 할 수 있어 플레이어에게 메세지를 보낼 때 유용합니다.

`TranslatableContents(String, Object...)`의 사용법도 `String.format(String, Object...)`과 유사합니다; 첫번째 인자는 번역 키값, 그 이후 가변인자는 포매팅에 사용됩니다. 이때 `%1$s`, `%2$s`, `%3$s`, 그리고 `%s`와 같은 서식 지정자들을 사용하실 수 있습니다. 만약 `Component`를 가변 인자중 하나로 전달하신다면 해당 `Component`의 스타일과 같은 성질들은 그대로 유지되어 표시됩니다.

### `TextComponentHelper`

- `createComponentTranslation(CommandSource, String, Object...)`는 `CommandSource`에 보낼 목적으로 `MutableComponent`를 생성할 때 유용합니다. 만약 수신자가 바닐라 클라이언트라면, 직접 문자열 치환과 포매팅을 진행하기 위한 언어 데이터가 없을 것이니 영어로 된 텍스트를 그대로 담고 있는 `MutableComponent`를 생성합니다. 그외에는 `TranslatableComponent`를 담고 있는 `MutableComponent`를 생성합니다.

[언어]: https://minecraft.fandom.com/ko/wiki/%EC%96%B8%EC%96%B4
[변환기]: https://tterrag.com/lang2json/
