文本组件
========

`Component`是一个文本持有者，可以通过其子类型`MutableComponent`对其进行格式化并与其他组件链接。可以使用以下可用静态辅助方法之一创建组件：

| 方法名称        | 描述                                                                                                                               |
|----------------|------------------------------------------------------------------------------------------------------------------------------------|
| `literal`      | 其创建一个组件，该组件简单地封装传入的文本。                                                                                           |
| `nullToEmpty`  | 其与`#literal`相同，只是当传递null时，其会创建一个空组件                                                                               |
| `translatable` | 其创建一个组件，该组件以本地化文本的形式展示给用户，请阅读[国际化][internationalization]了解更多详细信息。                                |
| `empty`        | 其创建一个空组件                                                                                                                    |
| `keybind`      | 其创建一个组件，该组件表示为传递的[键盘布局][keymapping]中的当前键盘键的名称。                                                           |
| `nbt`          | 其创建一个组件，用于表示由`dataSource`内部的`path`指定的nbt数据                                                                        |
| `score`        | 其创建一个组件，用于表示由[实体选择器][selectors]`name`指定的实体的`objective`的分数。                                                  |
| `selector`     | 其创建一个组件，用于显示由[实体选择器][选择器]`pattern`选择的实体的名称列表。                                                            |

组件的文本内容由`ComponentContents`表示。值得注意的是，其子类型`TranslatableContents`不仅支持[本地化][internationalization]，还支持[文本格式化][formatting]。

应用格式
--------

组件可以通过`Style`进行格式化（例如，粗体、单击操作、颜色）。`Style`是不可变的，每次修改时都会创建一个新的`Style`。空样式`Style#EMPTY`可以用作配置的基础。

可以使用`#applyTo(Style other)`将多个样式合并在一起；`other`将覆盖当前对象的所有未配置项。

配置样式后，可以将其应用于具有`MutableComponent#setStyle`用于覆盖的组件，或具有`#withStyle`用于合并的组件：
```java
// 创建MutableComponent以包装文本"Hello!"
MutableComponent text = Component.literal("Hello!");

// 复制空样式并将颜色设置为蓝色并使其变为斜体
Style blueItalic = Style.EMPTY
        .withColor(0x0000FF)
        .withItalic(true);

// 复制空样式并将颜色设置为红色
Style red = Style.EMPTY 
        .withColor(0xFF0000);

// 复制空样式并使其变为粗体
Style bold = Style.EMPTY
        .withBold(true);

// 复制空样式并使其同时带下划线和删除线
Style doubleLines = Style.EMPTY
        .withUnderlined(true)
        .withStrikethrough(true);

// 将文本的样式设置为蓝色和斜体
text.setStyle(blueItalic);

// 将蓝色和斜体覆盖为红色、粗体、下划线和删除线
text.withStyle(red).withStyle(bold).withStyle(doubleLines);
```
这将创建一个带有两行的红色粗体文本：
![red_hello]

链接组件
--------

`MutableComponent#append`可以将多个组件链接在一起。可以使用`MutableComponent#getSiblings`检索链接的组件。

`Component`像树一样存储其同级，并按预定顺序遍历；父样式与其同级样式合并。
![tree]

下面的代码将创建一个具有与上例中相同结构的组件：
```java
// 创建仅文本组件
MutableComponent first = Component.literal("first ");
MutableComponent second = Component.literal("second ");
MutableComponent third = Component.literal("third ");
MutableComponent fourth = Component.literal("fourth ");
MutableComponent fifth = Component.literal("fifth ");
MutableComponent sixth = Component.literal("sixth ");
MutableComponent seventh = Component.literal("seventh ");

// 创建带有样式的组件
MutableComponent red = Component.litearl("red ").withStyle(Style.EMPTY.withColor(0xFF0000));
MutableComponent blue = Component.literal("blue ").withStyle(Style.EMPTY.withColor(0x0000FF));
MutableComponent bold = Component.literal("bold ").withStyle(Style.EMPTY.withBold(true));

// 以与下图相同的方式为所创建的组件组织结构
red.append(first).append(blue).append(seventh);
blue.append(second).append(third).append(bold);
bold.append(fourth).append(fifth).append(sixth);
```
![style_annotated]

文本格式化
----------

文本格式化是将数据作为文本插入到预定义的较大文本中的过程。它可以用于显示坐标、显示单位测量值等。**格式说明符**用于指示文本可以插入的位置。

`TranslatableContents`允许两种类型的格式说明符：`%s`和`%n$s`。该组件使用第二个参数，表示为`args`，用于保存要插入以代替格式说明符的对象。

`%s`按其出现的顺序被替换为`args`的元素，即，第一个`%s`被替换为`args`的第一个元素，依此类推。
`%n$s`是位置说明符；每个位置说明符可以通过数字`n`表示`args`中的哪个元素将替换说明符。
* 使用`[1, 2, 3]`作为`args`格式化`x:%s y:%s z:%s`将得到`x:1 y:2 z:3`
* 使用`17`作为`args`格式化`Time: %1$s ms`将得到`Time: 17 ms`
* 使用`[10.2, Dev]`作为`args`格式化`Player name: %2$s, HP: %1$s`将得到`Player name: Dev, HP: 10.2`

`args`中的任何`Component`元素都将转换为格式化的文本字符串。

[internationalization]: ../concepts/internationalization.md
[selectors]: https://minecraft.wiki/w/Target_selectors
[red_hello]: /img/component_red_hello.png
[style_annotated]: /img/component_style_annotated.png
[formatting]: #text-formatting
[tree]: /img/component_graph.png
[keymapping]: ./keymappings.md
