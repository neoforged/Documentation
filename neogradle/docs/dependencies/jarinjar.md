Jar-in-Jar
==========

Jar-in-Jar 是一种从 Mod 的 jar 内部加载依赖项的方法。为了实现这一点，Jar-in-Jar 在构建时会在 `META-INF/jarjar/metadata.json` 中生成一个包含将从 jar 内部加载的工件的元数据 json 文件。

Jar-in-Jar 是一个完全可选的系统，可以使用 `jarJar#enable` 在 `minecraft` 块之前启用。这将包括所有来自 `jarJar` 配置的依赖项进入 `jarJar` 任务。您可以类似于其他 jar 任务来配置该任务：

```gradle
// 在 build.gradle 中

// 为您的 mod 启用 Jar-in-Jar 系统
jarJar.enable()


// 配置 'jarJar' 任务
// 'all' 是默认的分类器
tasks.named('jarJar') {
    // ...
}
```

添加依赖项
-------

您可以使用 `jarJar` 配置将依赖项添加到您的 jar 内部。由于 Jar-in-Jar 是一个协商系统，所有版本都应提供一个支持的范围。

```gradle
// 在 build.gradle 中
dependencies {
    // 编译时使用 examplelib 的最高支持版本
    //   区间在 2.0（含）和 3.0（不含）之间
    jarJar(group: 'com.example', name: 'examplelib', version: '[2.0,3.0)')
}
```

如果您需要指定一个确切的版本来包含，而不是范围内的最高支持版本，您可以在依赖项闭包内使用 `jarJar#pin`。在这些情况下，编译时将使用工件版本，而固定版本将被打包在 mod jar 内部。

```gradle
// 在 build.gradle 中
dependencies {
    // 编译时使用 examplelib 的最高支持版本
    //   区间在 2.0（含）和 3.0（不含）之间
    jarJar(group: 'com.example', name: 'examplelib', version: '[2.0,3.0)') {
      // 包含 examplelib 2.8.0
      jarJar.pin(it, '2.8.0')
    }
}
```

您还可以在编译时针对特定版本，同时固定一个版本范围：

```gradle
// 在 build.gradle 中
dependencies {
    // 针对 examplelib 2.8.0 编译
    jarJar(group: 'com.example', name: 'examplelib', version: '2.8.0') {
      // 包含 examplelib 的最高支持版本
      //   在 2.0（含）到 3.0（不含）之间
      jarJar.pin(it, '[2.0,3.0)')
    }
}
```

### 使用运行时依赖项

如果您想将您的模组的运行时依赖项包含在您的 jar 中，可以在您的构建脚本中调用 `jarJar#fromRuntimeConfiguration`。如果您决定使用此选项，强烈建议包含依赖项过滤器；否则，每一个依赖项 —— 包括 Minecraft 和 Forge —— 也将被打包到 jar 中。为了支持更灵活的声明，`dependency` 配置已被添加到 `jarJar` 扩展和任务中。使用它，您可以指定要从配置中包含或排除的模式：

```gradle
// 在 build.gradle 中

// 添加运行时依赖项到 jar
jarJar.fromRuntimeConfiguration()

// ...

jarJar {
    // 在此处从运行时配置中包括或排除依赖项
    dependencies {
        // 排除任何以 'com.google.gson.' 开头的依赖项
        exclude(dependency('com.google.gson.*'))
    }
}
```

:::tip
通常建议在使用 `#fromRuntimeConfiguration` 时设置至少一个 `include` 过滤器。
:::

发布 Jar-in-Jar 到 Maven
------------------------

出于存档的原因，ForgeGradle 支持将 Jar-in-Jar 工件发布到选择的 Maven，类似于 [Shadow 插件][shadow] 的处理方式。实际上，这并不常用也不推荐。

```gradle
// 在 build.gradle 中（已安装 'maven-publish' 插件）

publications {
    mavenJava(MavenPublication) {
        // 添加标准的 java 组件和 Jar-in-Jar 工件
        from components.java
        jarJar.component(it)

        // ...
    }
}
```


[shadow]: https://imperceptiblethoughts.com/shadow/getting-started/
