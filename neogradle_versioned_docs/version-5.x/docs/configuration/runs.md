运行配置
==================

运行配置定义了一个游戏实例如何运行。这包括参数、工作目录、任务名等。运行配置在`minecraft.runs`块中定义。虽然默认情况下没有配置运行，但[Forge][userdev]确实提供了`client`、`server`、`data`、或`gameTestServer`的配置。

```gradle
minecraft {
    // ...
    runs {
        // 在此处配置运行
    }
}
```

运行配置可以使用闭包类似于任何`NamedDomainObjectContainer`进行添加。

```gradle
// 在minecraft代码块内部
runs {
    // 创建或配置名为'client'的运行配置
    client {
        // 配置运行
    }
}
```

以下是可用的配置属性：

```gradle 
// 在runs块内部
client {
    // Gradle运行任务的名称，
    // 默认为`runX`，其中X是容器名称
    taskName 'runThing'

    // 设置要启动程序的入口点
    // Forge将userdev main设置为'cpw.mods.bootstraplauncher.BootstrapLauncher'
    main 'com.example.Main'

    // 设置配置的工作目录
    // 默认为'./run'
    workingDirectory 'run'

    // 设置IntelliJ IDEA配置其运行的模块的名称
    // 默认为'<project_name>.main'
    ideaModule 'example.main'

    // 设置是否应运行Minecraft客户端
    // 如果未指定，检查以下内容
    // - 是否存在一个环境属性'thing'，包含'client'
    // - 配置名称中是否包含'client'
    // - main是否设置为'mcp.client.Start'
    // - main是否设置为'net.minecraft.client.main.Main'
    client true

    // 设置此配置的父级以便继承
    parent runs.example

    // 设置此配置的子配置
    children runs.child

    // 合并此配置并指定是否覆盖现有属性
    merge runs.server, true

    // 如果不为false，将父配置的参数合并到此配置中
    inheritArgs false

    // 如果不为false，将父配置的JVM参数合并到此配置中
    inheritJvmArgs false

    // 将源集添加到类路径中
    // 如果未指定，添加sourceSet.main
    source sourceSets.api

    // 设置运行的环境属性
    // 值将被解释为文件或字符串
    environment 'envKey', 'value'

    // 设置系统属性
    // 值将被解释为文件或字符串
    property 'propKey', 'value'

    // 设置传入应用程序的参数
    // 可以使用'args'指定多个
    arg 'hello'

    // 设置JVM参数
    // 可以使用'jvmArgs'指定多个
    jvmArg '-Xmx2G'

    // 设置标记
    // 目前，正在使用以下的标记：
    // - runtime_classpath
    // - minecraft_classpath
    token 'tokenKey', 'value'

    //设置延迟初始化的标记
    // 应该通常用于替代'token'，例如当标记解析Gradle配置时
    lazyToken('lazyTokenKey') {
      'value'
    }

    // 如果不为false，Gradle将在进程结束后停止
    forceExit true

    // 如果为true，编译所有项目而不是当前任务
    // 此选项仅由IntelliJ IDEA使用
    buildAllProjects false
}
```

:::提示
你可以在[MinecraftForge构建脚本][buildscript]内看到所有配置的userdev属性的列表。
:::

模组配置
------------------

可以使用Run配置中的`mods`块添加当前环境中的模组。模组块也是`NamedDomainObjectContainer`。

```gradle
// 在runs块内部
client {
    // ...

    mods {
        // 配置'example'模块
        example {
            // 将源集添加到模组的源中
            // 这比手动添加类和资源更为推荐
            source sourceSets.main

            // 设置模组类的位置
            classes sourceSets.api.output

            // 设置模组资源的位置
            resources files('./my_resources')
        }
    }
}
```

[userdev]: https://github.com/MinecraftForge/MinecraftForge/blob/1.19.x/build.gradle#L374-L430
[buildscript]: https://github.com/MinecraftForge/MinecraftForge/blob/d4836bc769da003528b6cebc7e677a5aa23a8228/build.gradle#L434-L470
