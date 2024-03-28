模组文件
=======

模组文件负责确定哪些文件会被打包到你模组的JAR文件中，在“Mods”菜单中显示哪些信息，以及你的模组如何被加载到游戏中。

mods.toml
---------

`mods.toml`定义你的一个或多个模组的元数据。它也包含一些附加信息，这些信息将在Mods菜单中被展示，并决定你的模组如何被加载进游戏。

该文件采用[Tom's Obvious Minimal Language][toml]（简称TOML）格式。这个文件必须保存在你所使用的源码集的resource目录中的`META-INF`文件夹下（例如对于`main`源码集，其路径为`src/main/resources/META-INF/mods.toml`）。`mods.toml`文件看起来长这样：

```toml
modLoader="javafml"
loaderVersion="[46,)"

license="All Rights Reserved"
issueTrackerURL="https://github.com/MinecraftForge/MinecraftForge/issues"
showAsResourcePack=false

[[mods]]
  modId="examplemod"
  version="1.0.0.0"
  displayName="Example Mod"
  updateJSONURL="https://files.minecraftforge.net/net/minecraftforge/forge/promotions_slim.json"
  displayURL="https://minecraftforge.net"
  logoFile="logo.png"
  credits="I'd like to thank my mother and father."
  authors="Author"
  description='''
  Lets you craft dirt into diamonds. This is a traditional mod that has existed for eons. It is ancient. The holy Notch created it. Jeb rainbowfied it. Dinnerbone made it upside down. Etc.
  '''
  displayTest="MATCH_VERSION"

[[dependencies.examplemod]]
  modId="forge"
  mandatory=true
  versionRange="[46,)"
  ordering="NONE"
  side="BOTH"

[[dependencies.examplemod]]
  modId="minecraft"
  mandatory=true
  versionRange="[1.20]"
  ordering="NONE"
  side="BOTH"
```

`mods.toml`被分为三个部分：非模组特定属性，与模组文件相关联；模组特定属性，对每个模组都有单独的小节；以及依赖配置，对每个模组依赖都有单独的小节。下面将解释与`mods.toml`文件相关的各个属性，其中`required`表示必须指定一个值，否则将引发异常。

### 非模组特定属性

非模组特定属性是与JAR文件本身相关的属性，指明如何加载模组和任何附加的全局元数据。

属性                 | 类型    | 缺省值         | 描述        | 样例
:---                 | :---:   | :---:         | :---:       | :---
`modLoader`          | string  | **必需** | 模组所使用的语言加载器。可用于支持额外的语言结构，如为主文件定义的Kotlin对象，或确定入口点的不同方法，如接口或方法。Forge提供Java加载器`"javafml"`和低/无代码加载器`"lowcodefml"`。 | `"javafml"`
`loaderVersion`      | string  | **必需** | 可接受的语言加载器版本范围，以[Maven版本范围][mvr]表示。对于`javafml`和`lowcodefml`，其版本是Forge版本的主版本号。 | `"[46,)"`
`license`            | string  | **必需** | 该JAR文件中的模组所遵循的许可证。建议将其设置为你正在使用的[SPDX标识符][spdx]和/或许可证的链接。你可以访问 https://choosealicense.com/ 以帮助选取你想使用的许可证。 | `"MIT"`
`showAsResourcePack` | boolean | `false`       | 当为`true`时，模组的资源会以一个单独的资源包的形式在“资源包”菜单中展示，而不是与“模组资源”包融为一体。 | `true`
`services`           | array   | `[]`          | 表示你的模组所**使用**的一系列服务的数组。这是从Forge的Java平台模块系统实现中为模组创建的模块的一部分。 | `["net.minecraftforge.forgespi.language.IModLanguageProvider"]`
`properties`         | table   | `{}`          | 替换属性表。`StringSubstitutor`使用它将`${file.<key>}`替换为相应的值。该功能目前仅用于替换模组特定属性中的`version`。 | 由`${file.example}`引用的`{ "example" = "1.2.3" }`
`issueTrackerURL`    | string  | *无*     | 指向报告与追踪模组问题的地点的URL。 | `"https://forums.minecraftforge.net/"`

:::note
    `services`属性在功能上等效于在指定[在模块中的`uses`指令][uses]，该指令允许加载给定类型的服务。
:::

### 模组特定属性

模组特定属性通过`[[mods]]`头与指定的模组绑定。其本质是一个[表格数组（Array of Tables）][array]；直到下一个头之前的所有键/值对都会被关联到那个模组。

```toml
# examplemod1的属性
[[mods]]
modId = "examplemod1"

# examplemod2的属性
[[mods]]
modId = "examplemod2"
```

属性            | 类型    | 缺省值                   | 描述        | 样例
:---            | :---:   | :---:                   | :---:       | :---
`modId`         | string  | **必需**                | 代表这个模组的唯一标识符。该标识符必须匹配`^[a-z][a-z0-9_]{1,63}$`（一个长度在[2,64]闭区间内的字符串；以小写字母开头；由小写字母、数字或下划线组成）。 | `"examplemod"`
`namespace`     | string  | `modId`的值             | 该模组的一个重载命名空间。该命名空间必须匹配`^[a-z][a-z0-9_.-]{1,63}$`（一个长度在[2,64]闭区间内的字符串；以小写字母开头；由小写字母、数字、下划线、点或短横线组成）。目前无作用。 | `"example"`
`version`       | string  | `"1"`                   | 该模组的版本，最好符合[Maven版本号命名格式][mvnver]。当设置为`${file.jarVersion}`时，它将被替换为JAR清单文件中`Implementation-Version`属性的值（在开发环境下默认显示为`0.0NONE`）。 | `"1.20-1.0.0.0"`
`displayName`   | string  | `modId`的值             | 该模组的更具可读性的名字。用于将模组展示到屏幕上时（如模组列表、模组不匹配）。 | `"Example Mod"`
`description`   | string  | `"MISSING DESCRIPTION"` | 在模组列表中展示的该模组的描述。建议使用一个[多行文字字符串][multiline]。 | `"This is an example."`
`logoFile`      | string  | *无*                    | 在模组列表中展示的该模组的logo图像文件的名称和扩展名。该logo必须位于JAR文件的根目录或直接位于源码集的根目录。 | `"example_logo.png"`
`logoBlur`      | boolean | `true`                  | 决定使用`GL_LINEAR*`（true）或`GL_NEAREST*`（false）渲染`logoFile`。 | `false`
`updateJSONURL` | string  | *无*                    | 被[更新检查器][update]用来检查你所使用的模组是否为最新版本的指向一个JSON文件的URL。 | `"https://files.minecraftforge.net/net/minecraftforge/forge/promotions_slim.json"`
`features`      | table   | `{}`                    | 参见 '[features]'。 | `{ java_version = "17" }`
`modproperties` | table   | `{}`                    | 与本模组相关联的一个键/值对表。目前尚未被Forge使用，但主要被模组使用。 | `{ example = "value" }` 
`modUrl`        | string  | *无*                    | 指向本模组下载界面的URL。目前无作用。 | `"https://files.minecraftforge.net/"`
`credits`       | string  | *无*                    | 在模组列表中展示的致谢声明。 | `"The person over here and there."`
`authors`       | string  | *无*                    | 在模组列表中展示的本模组的作者。 | `"Example Person"`
`displayURL`    | string  | *无*                    | 在模组列表中展示的本模组的展示页面（项目主页）。 | `"https://minecraftforge.net/"`
`displayTest`   | string  | `"MATCH_VERSION"`       | 参见 '[sides]'。 | `"NONE"`

#### 功能

功能系统允许模组在加载系统时要求某些设置、软件或硬件可用。当某个功能不满足时，模组加载将失败，并将要求通知给用户。目前，Forge提供以下功能：

功能           | 描述        | 样例
:---:          | :---:       | :---
`java_version` | 可支持的Java版本范围，以[Maven版本范围][mvr]表示。该范围须能够支持Minecraft所使用的Java版本。 | `"[17,)"`

### 依赖配置

模组可以指定它们的依赖项，这些依赖项在加载模组之前由Forge检查。这些配置是使用[表格数组（Array of Tables）][array]`[[dependencies.<modid>]]`创建的，其中`modid`是所依赖的模组的标识符。

属性           | 类型    | 缺省值         | 描述        | 样例
:---           | :---:   | :---:         | :---:       | :---
`modId`        | string  | **必需**      | 被添加为依赖的模组的标识符。 | `"example_library"`
`mandatory`    | boolean | **必需**      | 当依赖未满足时游戏是否崩溃。 | `true`
`versionRange` | string  | `""`          | 可接受的语言加载器版本范围，以[Maven版本范围][mvr]表示。空字符串表示匹配所有版本。 | `"[1, 2)"`
`ordering`     | string  | `"NONE"`      | 定义本模组是否必须在所依赖的模组之前（`"BEFORE"`）或之后（`"AFTER"`）加载。`"NONE"`表示不规定顺序。 | `"AFTER"`
`side`         | string  | `"BOTH"`      | 所依赖模组必须位于的[端位][dist]：`"CLIENT"`、`"SERVER"`或`"BOTH"`。 | `"CLIENT"`
`referralUrl`  | string  | *无*          | 指向依赖下载界面的URL。目前无作用。 | `"https://library.example.com/"`

:::danger
    两个模组的`ordering`可能会因循环依赖而造成崩溃：例如模组A必须在模组B之前（`"BEFORE"`）加载，而模组B也必须在模组A之前（`"BEFORE"`）加载。
:::

模组入口点
----------

现在我们已经填写了`mods.toml`，我们需要提供一个对模组进行编程的入口点。入口点本质上是执行模组的起点。入口点本身由`mods.toml`中使用的语言加载器决定。

### `javafml`和`@Mod`

`javafml`是Forge为Java编程语言提供的语言加载器。入口点是通过使用带有`@Mod`注释的公共类来定义的。`@Mod`的值必须包含`mods.toml`中指定的一个Mod id。从那里，所有初始化逻辑（例如[注册事件][events]、添加[`DeferredRegister`][registration]）都可以在类的构造函数中写明。模组总线可以从`FMLJavaModLoadingContext`获得。

```java
@Mod("examplemod") // 必须匹配mods.toml
public class Example {

  public Example() {
    // 此处初始化逻辑
    var modBus = FMLJavaModLoadingContext.get().getModEventBus();

    // ...
  }
}
```

### `lowcodefml`

`lowcodefml`是一种语言加载器，用于将数据包和资源包作为模组形式分发，而无需代码形式的入口点。它被指定为`lowcodefml`而不是`nocodefml`，用于将来可能需要的最少量代码的小添加。

[toml]: https://toml.io/
[mvr]: https://maven.apache.org/enforcer/enforcer-rules/versionRanges.html
[spdx]: https://spdx.org/licenses/
[modsp]: #mod-specific-properties
[uses]: https://docs.oracle.com/javase/specs/jls/se17/html/jls-7.html#jls-7.7.3
[serviceload]: https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/ServiceLoader.html#load(java.lang.Class)
[array]: https://toml.io/en/v1.0.0#array-of-tables
[mvnver]: ./versioning.md
[multiline]: https://toml.io/en/v1.0.0#string
[update]: ../misc/updatechecker.md
[features]: #features
[sides]: ../concepts/sides.md#writing-one-sided-mods
[dist]: ../concepts/sides.md#different-kinds-of-sides
[events]: ../concepts/events.md
[registration]: ../concepts/registries.md#deferredregister
