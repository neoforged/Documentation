Jar-in-Jar
==========

Jar-in-Jar 是一种从模组的 jar 文件内加载依赖的方式。为了实现这一点，在构建时 Jar-in-Jar 在 `META-INF/jarjar/metadata.json` 中生成一个元数据 json 文件，其中包含要从 jar 内加载的工件。

Jar-in-Jar 是一个完全可选的系统，可以使用 `jarJar#enable` 在 `minecraft` 代码块之前启用。这将包括所有来自 `jarJar` 配置的依赖到 `jarJar` 任务中。你可以像其它 jar 任务一样配置这个任务：

```gradle
// 在 build.gradle 中

// 为你的模组启用 Jar-in-Jar 系统
jarJar.enable()

// 配置 'jarJar' 任务
// 'all' 是默认的分类器
tasks.named('jarJar') {
    // ...
}
```

添加依赖
-------------------

你可以使用 `jarJar` 配置在你的 jar 文件中包含要添加的依赖。由于 Jar-in-Jar 是一个协商系统，所有的版本都应提供一个支持的版本范围。

```gradle
// 在 build.gradle 中
dependencies {
    // 编译并包含 examplelib 的最高支持版本
    //   从 2.0（包含）到 3.0（不包含）
    jarJar(group: 'com.example', name: 'examplelib', version: '[2.0,3.0)')
}
```

如果你需要在编译时指定要包含的确切版本，而不是范围内的最高支持版本，你可以在依赖闭包内使用 `jarJar#pin`。在这些情况下，将在编译时使用工件版本，而固定的版本将被打包在模组 jar 内。

```gradle
// 在 build.gradle 中
dependencies {
    // 编译时使用 examplelib 的最高支持版本
    //   从 2.0（包含）到 3.0（不包含）
    jarJar(group: 'com.example', name: 'examplelib', version: '[2.0,3.0)') {
      // 包含 examplelib 2.8.0
      jarJar.pin(it, '2.8.0')
    }
}
```

你也可以在编译对特定版本编译的同时，固定一个版本范围：

```gradle
// 在 build.gradle 中
dependencies {
    // 针对 examplelib 2.8.0 编译
    jarJar(group: 'com.example', name: 'examplelib', version: '2.8.0') {
      // 包含 examplelib 的最高支持版本
      //   从 2.0（包含）到 3.0（不包含）
      jarJar.pin(it, '[2.0,3.0)')
    }
}
```

### 使用运行时依赖

如果你希望在你的 jar 中包含你的模组的运行时依赖，你可以在构建脚本中调用 `jarJar#fromRuntimeConfiguration`。如果你决定使用这个选项，强烈建议包含依赖过滤器；否则，包括 Minecraft 和 Forge 在内的每一个依赖项都会被打包到jar文件中。为了支持更灵活的声明，`dependency` 配置已添加到 `jarJar` 扩展和任务中。使用它，你可以指定模式来包括或排除来自配置的内容：

```gradle
// 在 build.gradle 中

// 向 jar 添加运行时依赖
jarJar.fromRuntimeConfiguration()

// ...

jarJar {
    // 在这里包含或排除运行时配置中的依赖
    dependencies {
        // 排除任何以 'com.google.gson.' 开头的
