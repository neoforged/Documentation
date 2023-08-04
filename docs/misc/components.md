Text Components
==================

A `Component` is a holder for text which can be formatted and chained with other components via its subtype `MutableComponent`. A component can be created using one of the available static helpers:

| Method Name    | Description                                                                                                                        |
|----------------|------------------------------------------------------------------------------------------------------------------------------------|
| `literal`      | it creates a component which simply wraps the passed in text.                                                                      |
| `nullToEmpty`  | it's the same as `#literal` except it creates an empty component if null has been passed                                           |
| `translatable` | it creates a component which is represented as localized text to user, read [internationalization] for more details.               |
| `empty`        | it creates an empty component                                                                                                      |
| `keybind`      | it creates a component which is represented as the name of current keyboard key of the passed [key mapping][keymapping].           |
| `nbt`          | it creates a component for representing nbt data specified by `path` inside `dataSource`                                           |
| `score`        | it creates a component for representing the `objective`'s score of an entity specified by the [entity selector][selectors] `name`. |
| `selector`     | it creates a component for displaying the list of names of entities selected by the [entity selector][selectors] `pattern`.        |

A component's text contents are represented by `ComponentContents`. Notably, the subtype `TranslatableContents` not only supports [localization][internalization] but also [text formatting][formatting].

Applying Style
--------------

Components can be formatted (e.g., bold, click actions, color) via `Style`s. `Style`s are immutable, creating a new `Style` each time when modified. The empty style `Style#EMPTY` can be used as a base for configuration.

Multiple styles can be merged together with `#applyTo(Style other)`; `other` will override all non-configured of the current object.

After configuring a style, it can be applied to a component with either `MutableComponent#setStyle` for overwriting, or `#withStyle` for merging:
```java
// Creates MutableComponent wrapping literal "Hello!"
MutableComponent text = Component.literal("Hello!");

// Copies empty style and sets color to blue and makes it italic
Style blueItalic = Style.EMPTY
        .withColor(0x0000FF)
        .withItalic(true);

// Copies empty style and sets color to red
Style red = Style.EMPTY 
        .withColor(0xFF0000);

// Copies empty style and makes it bold
Style bold = Style.EMPTY
        .withBold(true);

// Copies empty style and makes it both underlined and strikethrough
Style doubleLines = Style.EMPTY
        .withUnderlined(true)
        .withStrikethrough(true);

// Sets style of the text to be blue and italic
text.setStyle(blueItalic);

// Overwrites blue and italic style to be red, bold, underlined, and strikethrough
text.withStyle(red).withStyle(bold).withStyle(doubleLines);
```
This creates a red, bold text with two lines:
![red_hello]

Chaining Components
-------------------

`MutableComponent#append` can chain multiple components together. Chained components can be retrieved with `MutableComponent#getSiblings`.

`Component` stores its siblings like a tree and is traversed in preorder; the parent style is merged with those of its siblings.
![tree]

The code below will create a component with the same structure in the above example:
```java
// Create text only components
MutableComponent first = Component.literal("first ");
MutableComponent second = Component.literal("second ");
MutableComponent third = Component.literal("third ");
MutableComponent fourth = Component.literal("fourth ");
MutableComponent fifth = Component.literal("fifth ");
MutableComponent sixth = Component.literal("sixth ");
MutableComponent seventh = Component.literal("seventh ");

// Create components with style
MutableComponent red = Component.litearl("red ").withStyle(Style.EMPTY.withColor(0xFF0000));
MutableComponent blue = Component.literal("blue ").withStyle(Style.EMPTY.withColor(0x0000FF));
MutableComponent bold = Component.literal("bold ").withStyle(Style.EMPTY.withBold(true));

// Structure created components in the same way as the image
red.append(first).append(blue).append(seventh);
blue.append(second).append(third).append(bold);
bold.append(fourth).append(fifth).append(sixth);
```
![style_annotated]

Text Formatting
---------------

Text formatting is the process of inserting data as text into predefined larger text. It can be used for displaying coordinates, showing unit measurements, etc. **Format specifiers** are used for indicating where a text can be inserted.

`TranslatableContents` allows two types of format specifiers: `%s` and `%n$s`. The component uses the second parameter onwards, denoted as `args` , for holding what object to insert in place of a format specifier.

`%s` is replaced with elements of `args` in order they appear, i.e., the first `%s` is replaced with the first element of `args`, and so on.
`%n$s` is positional specifier; each positional specifier can denote which element in `args` will replace the specifier via the number `n`.
* Formatting `x:%s y:%s z:%s` with `[1, 2, 3]` as `args` results in `x:1 y:2 z:3`
* Formatting `Time: %1$s ms` with `17` as `args` results in `Time: 17 ms`
* Formatting `Player name: %2$s, HP: %1$s` with `[10.2, Dev]` as `args` results in `Player name: Dev, HP: 10.2`

Any `Component` element within `args` will be transformed into a formatted text string.

[internalization]: ../concepts/internationalization.md
[selectors]: https://minecraft.fandom.com/wiki/Target_selectors
[red_hello]: /img/component_red_hello.png
[style_annotated]: /img/component_style_annotated.png
[formatting]: #text-formatting
[tree]: /img/component_graph.png
[keymapping]: ../misc/keymappings.md