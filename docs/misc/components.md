Text Components
==================

컴포넨트(`Component`)는 텍스트를 저장하는 타입입니다, 하위 타입인 `MutableComponent`를 이용해 다른 컴포넨트와 연결 및 서식을 적용할 수 있습니다. 컴포넨트는 아래 정적 메서드들로 생성할 수 있습니다:

| 메서드 이름         | 설명                                                                     |
|----------------|------------------------------------------------------------------------|
| `literal`      | 전달된 텍스트를 그대로 저장하는 컴포넨트 생성.                                             |
| `nullToEmpty`  | `#literal`과 동일하나 null 전달시 빈 컴포넨트 생성.                                   |
| `translatable` | 사용자 언어에 맞춰 표시되는 텍스트 생성, 자세한 사항은 [다국어 지원][internationalization]을 참고하세요. |
| `empty`        | 빈 컴포넨트 생성.                                                             |
| `keybind`      | 전달된 [키 매핑][keymapping]의 이름을 표시하는 컴포넨트 생성.                              |
| `nbt`          | nbt `dataSource`의 `path`에 해당하는 데이터를 표시하는 컴포넨트 생성.                      |
| `score`        | [엔티티 지정자][selectors]에 해당하는 엔티티들의 스코어보드 `objective` 점수를 표시하는 컴포넨트 생성.   |
| `selector`     | [엔티티 지정자][selectors] `pattern`에 해당하는 엔티티들의 이름들을 표시하는 컴포넨트 생성.          |

컴포넨트의 텍스트는 `ComponentContents`로 표현됩니다. `ComponentContents`의 하위 타입 중 하나인 `TranslatableContents`는 [번역][internationalization]뿐 아니라 [서식][formatting]도 지원합니다.

스타일 적용하기
--------------

컴포넨트는 `Style`을 이용해 굵기, 색상 등의 스타일이 적용될 수 있습니다. `Style`은 불변 객체로, 수정될 때 마다 새로운 `Style`을 대신 만듭니다. 빈 스타일 `Style#EMPTY`를 수정해 원하시는 스타일을 만드실 수 있습니다.

여러 스타일은 `#applyTo(Style other)`를 이용해 합칠 수 있습니다; 이때 `other`는 `this`의 지정되지 않은 구성을 덮어씌웁니다.

스타일을 구성하셨다면, `MutableComponent#setStyle`를 통해 컴포넨트의 스타일을 덮어씌우거나, `#withStyle`로 기존 스타일과 합칠 수 있습니다:
```java
// "Hello!"를 감싸는 컴포넨트 생성
MutableComponent text = Component.literal("Hello!");

// 빈 스타일을 복사하고 파란색, 기울임 적용
Style blueItalic = Style.EMPTY
        .withColor(0x0000FF)
        .withItalic(true);

// 빈 스타일을 복사하고 빨간색 적용
Style red = Style.EMPTY 
        .withColor(0xFF0000);

// 빈 스타일을 복사하고 굵기 적용
Style bold = Style.EMPTY
        .withBold(true);

// 빈 스타일을 복사하고 밑줄, 취소선 적용
Style doubleLines = Style.EMPTY
        .withUnderlined(true)
        .withStrikethrough(true);

// 컴포넨트의 스타일을 파란색, 기울임으로 적용
text.setStyle(blueItalic);

// 컴포넨트의 파란색, 기울임 스타일을 빨간색, 굵음, 밑줄, 취소선 스타일로 변경
text.withStyle(red).withStyle(bold).withStyle(doubleLines);
```
위 코드는 빨갛고, 굵고, 줄이 두 개 쳐진 텍스트를 만듭니다:
![red_hello]

컴포넨트 연결하기
-------------------

`MutableComponent#append`는 여러 컴포넨트들을 연결합니다. 이때 연결된 컴포넨트들은 `MutableComponent#getSiblings`로 참조할 수 있습니다.

`Component`는 연결된 컴포넨트들을 전위 순회 트리에 저장합니다; 부모의 스타일이 자식에 적용됩니다.
![tree]

아래 코드는 위 사진과 동일한 구조의 컴포넨트를 만듭니다:
```java
// 텍스트만 담는 컴포넨트 생성
MutableComponent first = Component.literal("first ");
MutableComponent second = Component.literal("second ");
MutableComponent third = Component.literal("third ");
MutableComponent fourth = Component.literal("fourth ");
MutableComponent fifth = Component.literal("fifth ");
MutableComponent sixth = Component.literal("sixth ");
MutableComponent seventh = Component.literal("seventh ");

// 스타일이 적용된 컴포넨트 생성
MutableComponent red = Component.litearl("red ").withStyle(Style.EMPTY.withColor(0xFF0000));
MutableComponent blue = Component.literal("blue ").withStyle(Style.EMPTY.withColor(0x0000FF));
MutableComponent bold = Component.literal("bold ").withStyle(Style.EMPTY.withBold(true));

// 위 사진과 동일한 구조로 연결
red.append(first).append(blue).append(seventh);
blue.append(second).append(third).append(bold);
bold.append(fourth).append(fifth).append(sixth);
```
![style_annotated]

서식 지정하기
---------------

서식은 사전에 지정된 텍스트에 데이터를 삽입하는 방식입니다. 사용자의 좌표를 표시하거나, ms, km/s와 같은 단위를 값과 함께 띄우는 등의 목적으로 사용할 수 있습니다. 이때 **서식 지정자**를 활용해 데이터가 텍스트 어디에 삽입될 수 있는지를 지정합니다.

`TranslatableContents`는 두 가지의 서식 지정자를 지원하는데: `%s`와  `%n$s` 입니다. 컴포넨트 생성자의 두 번째 인자인 `args`에 삽입될 데이터를 담을 수 있습니다.

`%s`는 텍스트에 등장하는 순서대로 `args`의 원소로 대체됩니다, 예를 들어 첫 번째 `%s`는 `args`의 첫 번째 원소로 대체됩니다.
`%n$s`는 자신을 대체할 `args`의 원소 인덱스를 `n`에 숫자를 대신 적어 지정할 수 있습니다.
* 서식 `x:%s y:%s z:%s`에 `[1, 2, 3]`을 `args`로 전달하면 `x:1 y:2 z:3`로 변함
* 서식 `Time: %1$s ms`에 `17`을 `args`로 전달하면 `Time: 17 ms`로 변함
* 서식 `Player name: %2$s, HP: %1$s`에 `[10.2, Dev]`를 `args`로 전달하면 `Player name: Dev, HP: 10.2`로 변함

만약 `args`의 원소가 `Component`라면 해당 `Component` 자체의 서식 또한 적용되어 전체 텍스트에 삽입됩니다.

[internationalization]: ../concepts/internationalization.md
[selectors]: https://minecraft.wiki/w/Target_selectors
[red_hello]: /img/component_red_hello.png
[style_annotated]: /img/component_style_annotated.png
[formatting]: #서식-지정하기
[tree]: /img/component_graph.png
[keymapping]: ./keymappings.md
