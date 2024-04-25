高级配置
=======================

ForgeGradle 包含了一些特定的或细微的配置技术，这些技术取决于构建项目的复杂性。

重混淆源集
-------------------------

默认情况下，`reobf*` 和 `rename*` 任务只包含主源集类路径上的文件。要重混淆不同类路径上的文件，需要将它们添加到任务中的 `libraries` 属性。

```gradle
// 将另一个源集的类路径添加到 'reobf' 任务。
tasks.withType('reobfJar') {
    libraries.from sourceSets.api.classpath
}
```
