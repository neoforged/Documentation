运行配置
========

运行配置定义了游戏实例的运行方式。这包括参数、工作目录、任务名称等。运行配置在`minecraft.runs`块中定义。虽然默认情况下没有配置任何运行，但[Forge][userdev]确实提供了`client`、`server`、`data`或`gameTestServer`的配置。

```gradle
minecraft {
    // ...
    runs {
        // 在此处配置运行
    }
}
```

可以使用闭包添加类似于任何`NamedDomainObjectContainer`的运行配置。

```gradle
// 在minecraft块内部
runs {
    // 创建或配置名为'client'的运行配置
    client {
        // 配置运行
    }
}
```

以下配置属性可用：

```gradle 
// 在runs块内部
client {
    // Gradle运行任务的名称，
    // 默认为'runX'，其中X是容器名称
    taskName 'runThing'

    // 设置程序启动的入口点
    // Forge将userdev main设置为'cpw.mods.bootstraplauncher.BootstrapLauncher'
    main 'com.example.Main'

    // 设置该配置的工作目录
    // 默认为'./run'
    workingDirectory 'run'

    // 为IntelliJ IDEA设置要为其运行配置的模块的名称
    // 默认为'<project_name>.main'
    ideaModule 'example.main'

    // 设置这是否应该运行一个Minecraft客户端
    // 若未指定，将进行以下检查
    // - 是否存在包含'client'的环境变量'thing'
    // - 配置名称是否存在'client'
    // - main是否设置为'mcp.client.Start'
    // - main是否设置为'net.minecraft.client.main.Main'
    client true

    // 设置该配置应继承自的父级
    parent runs.example

    // 设置该配置的子级
    children runs.child

    // 合并此配置并指定是否覆盖现有属性
    merge runs.server, true

    // 如果不为false，则会将父级的参数与此配置合并
    inheritArgs false

    // 如果不为false，则会将父级的JVM参数与此配置合并
    inheritJvmArgs false

    // 将一个源集（sourceset）添加到classpath
    // 若未指定，则添加sourceSet.main
    source sourceSets.api

    // 为该运行设置一个环境变量
    // 值将作为一个文件（file）或一个字符串（string）被解释
    environment 'envKey', 'value'

    // 设置一个系统属性
    // 值将作为一个文件（file）或一个字符串（string）被解释
    property 'propKey', 'value'

    // 设置将传递给应用的参数
    // 可用'args'指定多个
    arg 'hello'

    // 设置一个JVM参数
    // 可用'jvmArgs'指定多个
    jvmArg '-Xmx2G'

    // 设置一个令牌（token）
    // 目前，下列令牌被使用：
    // - runtime_classpath
    // - minecraft_classpath
    token 'tokenKey', 'value'

    // 设置一个被惰性初始化的令牌
    // 通常应替代'token'使用，例如当令牌解析Gradle配置时
    lazyToken('lazyTokenKey') {
      'value'
    }

    // 如果不为false，Gradle将在过程结束后停止
    forceExit true

    // 如果为true，则编译所有项目，而不是当前任务的项目
    // 这仅由IntelliJ IDEA使用
    buildAllProjects false
}
```

!!! 提示
    你可以在[MinecraftForge构建脚本][buildscript]中看到所有配置的userdev属性的列表。

模组配置
--------

当前环境中的模组可以使用运行配置中的`mods`块添加。Mod块也是`NamedDomainObjectContainer`。

```gradle
// 在runs块中
client {
    // ...

    mods {
        // 配置'example'模组
        example {
            // 将一个源集添加到模组的源
            // 建议这样做，而不是手动添加类和资源
            source sourceSets.main

            // 设置模组的类的位置
            classes sourceSets.api.output

            // 设置模组的资源的位置
            resources files('./my_resources')
        }
    }
}
```

[userdev]: https://github.com/MinecraftForge/MinecraftForge/blob/1.19.x/build.gradle#L374-L430
[buildscript]: https://github.com/MinecraftForge/MinecraftForge/blob/d4836bc769da003528b6cebc7e677a5aa23a8228/build.gradle#L434-L470
