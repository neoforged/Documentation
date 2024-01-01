进阶配置
========

ForgeGradle包含一些特定或细微差别的配置技术，具体取决于你的构建项目的复杂性。

重新混淆源集
-----------

默认情况下，`reobf*`abd`rename*`任务只包含主源集classpath上的文件。要在不同的classpath上重新生成文件，需要将它们添加到任务中的`libraries`属性中。

```gradle
// 添加另一个源集的classpath到'reobf'任务。
tasks.withType('reobfJar') {
    libraries.from sourceSets.api.classpath
}
```
