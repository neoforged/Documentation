Jar-in-Jar
==========

Jar-in-Jar是从模组的jar中加载模组依赖项的一种方式。为了实现这一点，Jar-in-Jar在构建时在`META-INF/jarjar/metadata.json`中生成一个元数据json，其中包含要从jar中加载的artifact。

Jar-in-Jar是一个完全可选的系统，可以在`minecraft`块之前使用`jarJar#enable`来启用。这将把`jarJar`配置中的所有依赖项都包含到`jarJar`任务中。你能够以类似于其他jar任务的方式来配置该任务：

```gradle
// 在build.gradle中

// 为你的模组启用Jar-in-Jar系统
jarJar.enable()


// 配置'jarJar'任务
// 'all'是默认的分类器（classifier）
tasks.named('jarJar') {
    // ...
}
```

添加依赖
--------

你可以使用`jarJar`配置添加要包含在jar中的依赖项。由于Jar-in-Jar是一个协商（negotiation）系统，所有版本都应该提供一个支持的范围。

```gradle
// 在build.gradle中
dependencies {
    // 根据examplelib在从2.0（包括）到3.0（不包括）之间的最高支持版本编译并包含该版本
    jarJar(group: 'com.example', name: 'examplelib', version: '[2.0,3.0)')
}
```

如果需要指定要包含的确切版本，而不是该范围中支持的最高版本，则可以在依赖关系闭包中使用`jarJar#pin`。在这些情况下，artifact版本将在编译时使用，而固定（pinned）版本将捆绑在模组jar中。

```gradle
// 在build.gradle中
dependencies {
    // 根据examplelib在从2.0（包括）到3.0（不包括）之间的最高支持版本编译并包含该版本
    jarJar(group: 'com.example', name: 'examplelib', version: '[2.0,3.0)') {
      // 包含examplelib 2.8.0
      jarJar.pin(it, '2.8.0')
    }
}
```

你可以在针对特定版本进行编译时附加固定一个版本范围：

```gradle
// 在build.gradle中
dependencies {
    // 编译examplelib 2.8.0
    jarJar(group: 'com.example', name: 'examplelib', version: '2.8.0') {
      // 包含从2.0（包括）到3.0（不包括）之间的最高支持版本的examplelib
      jarJar.pin(it, '[2.0,3.0)')
    }
}
```

### 使用运行时依赖

如果你想在jar中包含模组的运行时依赖项，你可以在构建脚本中调用`jarJar#fromRuntimeConfiguration`。如果你决定使用此选项，强烈建议你包含依赖项筛选器；否则，包括Minecraft和Forge在内的每一个依赖项都将捆绑在jar中。为了支持更灵活的语句，`dependency`配置已添加到`jarJar`扩展和任务中。使用此选项，可以指定要包含在配置中或从配置中排除的模式：

```gradle
// 在build.gradle中

// 为jar添加运行时依赖项
jarJar.fromRuntimeConfiguration()

// ...

jarJar {
    // 在此处包含或排除运行时依赖项
    dependencies {
        // 排除以'com.google.gson.'开头的任何依赖项
        exclude(dependency('com.google.gson.*'))
    }
}
```

!!! 提示
    使用`#fromRuntimeConfiguration`时，通常建议至少设置一个`include`筛选器。

将一个Jar-in-Jar发布到Maven
--------------------------

出于存档原因，ForgeGradle支持将Jar-in-Jar artifact发布给选定的Maven，类似于[Shadow插件][shadow]处理它的方式。在实践中，这不是有用的，也不推荐使用。

```gradle
// I在build.gradle中（具有'maven-publish'插件）

publications {
    mavenJava(MavenPublication) {
        // 添加标准java组件和Jar-in-Jar artifact
        from components.java
        jarJar.component(it)

        // ...
    }
}
```


[shadow]: https://imperceptiblethoughts.com/shadow/getting-started/
