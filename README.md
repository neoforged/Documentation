# NeoForge 文档

此存储库用于存储有关NeoForge的文档，NeoForge是Minecraft模组开发的API。它还包含有关NeoGradle的文档，NeoGradle是一个用于开发NeoForge和使用NeoForge的模组的Gradle插件。

该文档使用[Docusaurus 2](https://docusaurus.io)构建 

## 贡献

您可以在[文档贡献指南](https://docs.neoforged.net/contributing/)中阅读贡献指南 

如果您希望为文档做出贡献，请 fork 并 clone 此存储库。

如果您想通过实时开发服务器在本地预览文档网站，可以运行以下命令。大多数更改都会实时反馈，无需重新启动服务器。

```bash
npm install
npm run start
```

### 构建

如果您希望构建可部署的静态版本的文档，您可以运行以下命令：

```
npm run build
```

此命令会生成静态内容到`build`目录，并可以使用任何静态内容托管服务来提供服务。
