Text Components
==================

`Component` is a holder for text which can be formatted and chained with other components.
The subtype `MutableComponent` is used to apply formats and chain other compoennts.

* `Component#literal(String text)` - creates component whose represented text is simply `text` that was passed in.
* `Component#nullToEmpty(@Nullable String text)` - same as `#literal` except it creates empty component if null has been passed 
* `Component#translatable(String translationKey)` - creates component which is represented as localized text to user, read [internationalization] for more details.
* `Component#empty()` - creates empty component
* `Component#keybind(String name)` - creates component which is represented as name of a Keyboard key for passed keybind.
* `Component#nbt(String path, boolean interpreting, Optional<Component> separator, DataSource dataSource)` - creates component for representing nbt data specified by `path` inside `dataSource`
* `Component#score(String name, String objective)` - creates component for representing `objective`'s score of entity specified by [entity selector][selectors] `name`.
* `Component#selector(String pattern, Optional<Component> separator)` - creates component for displaying names of entities selected by [entity selector][selectors] `pattern`.

Applying Style
==============

Components can be formatted (e.g. bold, click actions, color) via `Style`s.
Style is immutable objects and any modification to already existing style will instead create new instance. Its constructor is `private` so you'll have to copy and reconfigure `Style.EMPTY`.

Style's default configurations are `null` instead of concrete value. This means not explicitly specified configuration may be overridden.
After configuring style to your preference, you can apply it to your component with either `MutableComponent#setStyle` for overwriting previous style, or `#withStyle` for only applying non-null configurations to already existing style.

Here's an example of how you can stylize your component:
```java
MutableComponent text = Component.literal("Hello!"); // Creates MutableComponent wrapping literal "Hello!"

Style blueItalic = Style.EMPTY // Copies empty style and sets color to blue and makes it italic
        .withColor(0x0000FF)
        .withItalic(true);
Style red = Style.EMPTY // Copies empty style and sets color to red
        .withColor(0xFF0000);
Style bold = Style.EMPTY // Copies empty style and makes it bold
        .withBold(true);

Style doubleLines = Style.EMPTY // Copies empty style and makes it both underlined and strikethrough
        .withUnderlined(true)
        .withStrikethrough(true);

text.setStyle(blue); // Sets style of the text to be blue and italic
text.withStyle(red).withStyle(bold).withStyle(doubleLines); // Overwrites blue and italic style to be red, bold, underlined, and strikethrough
```
This results in red, bold text with two lines.

Chaining Components
===================

`MutableComponent` can have additional components chained as siblings with `MutableComponent#append`. Chained components can be retrieved with `MutableComponent#getSiblings`.

`Component` stores its siblings like a tree, and its style is inherited to its siblings.
Below example will progressively apply style on top of each other:
```java
Style bold = Style.EMPTY.withBold(true);
Style italic = Style.EMPTY.withItalic(true);
Style strike = Style.EMPTY.withStrikethrough(true);
Style underlined = Style.EMPTY.withUnderlined(true);

MutableComponent a = Component.literal("a");
MutableComponent b = Component.literal("b").setStyle(bold);
MutableComponent c = Component.literal("c").setStyle(italic);
MutableComponent d = Component.literal("d").setStyle(strike);
MutableComponent e = Component.literal("e").setStyle(underlined);
a.append(b);
b.append(c);
c.append(d);
d.append(e);
```
[Here's how it looks like in-game][style_annotated]

`ComponentContents`
===================

Component's text contents are handled by `ComponentContents`, it holds data and defines how to represent it as text.
Here's the list of predefined `ComponentContents`:
* `LiteralContents(String text)` - represents passed string literal as is.
* `TranslatableContents(String translationKey, Object[] args)` - represents passed `translationkey` as localized text. `args` is inserted in place of format specifiers such as `%s` and `%1$s`, read [formatting] for more details.
* `KeybindContents(String name)` - represents keybind name such as `tutorial.move.title` as name of Keyboard Key.
* `NbtContents(String path, boolean interpreting, Optional<Component> separator, DataSource dataSource)` - represents data from `dataSource` specified by `path`. `separator` will be used when there are multiple entities.
* `ScoreContents(String name, String objective)` - represents `objectives`'s score of entities selected by [entity selector][selectors] `name`  .
* `SelectorContents(String pattern, Optional<Component> separator)` - represents entity selector specified by [entity selector][selectors] `pattern` as a list of selected entities' display names. `separator` will be used when there are multiple entities.

You may have discovered that parameters of constructors are same as static helper methods of `Component`.
In fact, those helper methods simply create contents with passed parameter and returns `MutableComponent` wrapping it.

Text Formatting
==========

Text formatting is the process of inserting data as text into predefined larger text, such as displaying coordinate with x, y, z annotation, showing number with respectful units alongside, etc.
Usually special notation called **format specifiers** are used for indicating where a text can be inserted into.

In Minecraft, only `TranslatableContents` supports formatting, and it uses two types of format specifiers: `%s` and `%1$s`, `%2$s`, `%3$s`. `TranslatableContents`'s `args` are inserted in place of format specifiers.
`%s` is replaced with elements of `args` in order they appear, i.e., First `%s` is replaced with a first element of `args`, and so on.
`%n$s` is positional specifier, they can specify which element to replace them with number `n`.
Here's an example on how format specifier works in practice:
* Formatting `%s %s %s` with `[1, 2, 3]` results in `1 2 3`
* Formatting `%1$s, %2$s, %3$s` with `[1, 2, 3]` results in `1, 2, 3`
* Formatting `%3$s - %2$s - %1$s` with `[1, 2, 3]` results in `3 - 2 - 1`

`args`'s elements may be `Component`s that will be inserted into the resulting formatted text with all their attributes preserved.

[internalization]: ../concepts/internationalization.md
[selectors]: https://minecraft.fandom.com/wiki/Target_selectors
[style_annotated]: /img/component_style_annotated.png
[formatting]: #text-formatting