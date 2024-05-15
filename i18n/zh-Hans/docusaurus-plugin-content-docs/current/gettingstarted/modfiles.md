# Mod Files

Mod文件负责确定哪些模组被打包到您的JAR文件中，显示在“Mods”菜单中的信息，以及您的模组在游戏中应如何加载。

## gradle.properties

`gradle.properties`文件保存了您的模组的各种常见属性，例如模组ID或模组版本。在构建过程中，Gradle会读取这些文件中的值，并将它们内联到各种位置，如[mods.toml][modstoml]文件中。这样，您只需要在一个地方更改值，然后它们就会为您在所有地方应用。

大多数值也在[MDK的`gradle.properties`文件]中以注释形式解释。

## mods.toml

位于`src/main/resources/META-INF/mods.toml`的`mods.toml`文件是一个[TOML][toml]格式的文件，定义了您的模组的元数据。它还包含了有关如何将您的模组加载到游戏中的附加信息，以及显示在“Mods”菜单中的显示信息。[MDK提供的`mods.toml`文件][mdkmodstoml]包含解释每个条目的注释，这里将更详细地解释。

`mods.toml`可以分为三部分：非模组特定属性，这些属性与模组文件相关联；模组属性，每个模组有一个部分；依赖配置，每个模组的依赖项有一个部分。与`mods.toml`文件关联的某些属性是强制性的；强制性属性需要指定一个值，否则会抛出异常。

### 非模组特定属性

非模组特定属性与JAR本身相关联，指示如何加载模组以及任何额外的全局元数据。

### 模组特定属性

模组特定属性通过`[[mods]]`头部与指定的模组关联。这是一个[表的数组][array]；所有键/值属性都将附加到该模组，直到下一个头部。

### 依赖配置

模组可以指定它们的依赖关系，NeoForge在加载模组之前会检查这些配置。这些配置是使用`[[dependencies.<modid>]]`创建的，其中`modid`是消耗依赖项的模组的标识符。

## Mod 入口点

现在`mods.toml`已经填写完毕，我们需要为模组提供一个入口点。入口点本质上是执行模组的起点。入口点本身由`mods.toml`中使用的语言加载器确定。

### `javafml` 和 `@Mod`

`javafml`是NeoForge为Java编程语言提供的语言加载器。入口点是使用带有`@Mod`注解的公共类定义的。`@Mod`的值必须包含`mods.toml`中指定的模组ID之一。从那里开始，所有初始化逻辑（例如[注册事件][events]或[添加`DeferredRegister`][registration]）可以在类的构造函数中指定。

```java
@Mod("examplemod") // 必须与mods.toml中的模组ID匹配
public class Example {
  public Example(IEventBus modBus) { // 参数是模组特定的事件总线，例如用于注册和事件
    // 在这里初始化逻辑
  }
}
```

:::tips
`mods.toml`文件中的模组和`@Mod`入口点必须有1对1的匹配。这意味着对于每个定义的模组，必须有一个带有该模组ID的`@Mod`注解。
:::

### `lowcodefml`

`lowcodefml`是一种语言加载器，用作以模组形式分发数据包和资源包，而无需代码内入口点。它被指定为`lowcodefml`而不是`nocodefml`，因为未来可能需要最小的代码添加。

[array]: https://toml.io/en/v1.0.0#array-of-tables
[atlasviewer]: https://github.com/XFactHD/AtlasViewer/blob/1.20.2/neoforge/src/main/resources/META-INF/services/xfacthd.atlasviewer.platform.services.IPlatformHelper
[events]: ../concepts/events.md
[features]: #features
[group]: #the-group-id
[i18n]: ../resources/client/i18n.md#translating-mod-metadata
[javafml]: #javafml-and-mod
[jei]: https://www.curseforge.com/minecraft/mc-mods/jei
[lowcodefml]: #lowcodefml
[mcversioning]: versioning.md#minecraft
[mdkgradleproperties]: https://github.com/neoforged/MDK/blob/main/gradle.properties
[mdkmodstoml]: https://github.com/neoforged/MDK/blob/main/src/main/resources/META-INF/mods.toml
[modstoml]: #modstoml
[mojmaps]: https://github.com/neoforged/NeoForm/blob/main/Mojang.md
[multiline]: https://toml.io/en/v1.0.0#string
[mvr]: https://maven.apache.org/enforcer/enforcer-rules/versionRanges.html
[neoversioning]: versioning.md#neoforge
[packaging]: ./structuring.md#packaging
[registration]: ../concepts/registries.md#deferredregister
[serviceload]: https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/ServiceLoader.html#load(java.lang.Class)
[sides]: ../concepts/sides.md
[spdx]: https://spdx.org/licenses/
[toml]: https://toml.io/
[update]: ../misc/updatechecker.md
[uses]: https://docs.oracle.com/javase/specs/jls/se17/html/jls-7.html#jls-7.7.3
[versioning]: ./versioning.md
