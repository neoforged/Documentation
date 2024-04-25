运行配置
==================

运行配置定义了如何运行游戏实例。这包括参数、工作目录、任务名称等。运行配置在 `minecraft.runs` 块内定义。虽然默认情况下没有配置任何运行配置，但 [Forge][userdev] 提供了 `client`、`server`、`data` 或 `gameTestServer` 等配置。

```gradle
minecraft {
    // ...
    runs {
        // 在此配置运行
    }
}
```

可以使用闭包类似于任何 `NamedDomainObjectContainer` 来添加运行配置。

```gradle
// 在 minecraft 块内
runs {
    // 创建或配置名为 'client' 的运行配置
    client {
        // 配置运行
    }
}
```

以下配置属性是可用的：

```gradle 
// 在 runs 块内
client {
    // Gradle 运行任务的名称，
    // 默认为 'runX'，其中 X 是容器名称
    taskName 'runThing'

    // 设置要启动的程序的入口点
    // Forge 设置 userdev 主要为 'cpw.mods.bootstraplauncher.BootstrapLauncher'
    main 'com.example.Main'

    // 设置配置的工作目录
    // 默认为 './run'
    workingDirectory 'run'

    // 设置 IntelliJ IDEA 的模块名称，用于配置其运行
    // 默认为 '<project_name>.main'
    ideaModule 'example.main'

    // 设置将运行配置添加到的文件夹名称
    // 默认为项目的名称
    folderName 'example'

    // 设置是否运行 Minecraft 客户端
    // 如果未指定，检查以下内容：
    // - 是否存在包含 'client' 的环境属性 'thing'
    // - 配置名称是否包含 'client'
    // - main 是否设置为 'mcp.client.Start'
    // - main 是否设置为 'net.minecraft.client.main.Main'
    client true

    // 设置此配置的父配置以继承
    parent runs.example

    // 设置此配置的子配置
    children runs.child

    // 合并此配置并指定是否覆盖现有属性
    merge runs.server, true

    // 如果不为 false，将合并父配置的参数到此配置
    inheritArgs false

    // 如果不为 false，将合并父配置的 JVM 参数到此配置
    inheritJvmArgs false

    // 添加一个源集到类路径
    // 如果未指定，默认添加 sourceSet.main
    source sourceSets.api

    // 为运行设置一个环境属性
    // 值将被解释为文件或字符串
    environment 'envKey', 'value'

    // 设置一个系统属性
    // 值将被解释为文件或字符串
    property 'propKey', 'value'

    // 设置传递给应用程序的参数
    // 可以使用 'args' 指定多个
    arg 'hello'

    // 设置一个 JVM 参数
    // 可以使用 'jvmArgs' 指定多个
    jvmArg '-Xmx2G'

    // 设置一个令牌
    // 目前，正在使用以下令牌：
    // - runtime_classpath
    // - minecraft_classpath
    token 'tokenKey', 'value'

    // 设置一个延迟初始化的令牌
    // 通常应该使用 'token' 替代，例如当令牌解析 Gradle 配置时
    lazyToken('lazyTokenKey') {
      'value'
    }

    // 如果为 true，则编译所有项目而不仅仅是
    ```gradle
// 如果为 true，则编译所有项目，而不是仅当前任务
// 这仅被 IntelliJ IDEA 使用
buildAllProjects false
}
```

:::tip
你可以在 [MinecraftForge 构建脚本][buildscript] 中查看所有配置的 userdev 属性的列表。
:::

Mod 配置
--------

在当前环境中可以使用 Run 配置内的 `mods` 块添加mod。Mod 块也是 `NamedDomainObjectContainer`。

```gradle
// 在 runs 块内
client {
    // ...

    mods {
        other_mod {
            // ...
        }

        // 配置 'example' mod
        example {
            // 向 mod 的源添加源集
            source sourceSets.main

            // 合并此配置并指定是否覆盖现有属性
            merge mods.other_mod, true
        }
    }
}
```

[userdev]: https://github.com/MinecraftForge/MinecraftForge/blob/42115d37d6a46856e3dc914b54a1ce6d33b9872a/build.gradle#L374-L430
[buildscript]: https://github.com/MinecraftForge/MinecraftForge/blob/d4836bc769da003528b6cebc7e677a5aa23a8228/build.gradle#L434-L470
