NeoForged 文档 中文翻译
==============================

:::info
欢迎访问[NeoForged文档中文翻译官方仓库][translation-repo]，对我们的翻译内容提出意见或建议。
:::

# 前言

:::caution
请注意，由于NeoForged处于创始阶段，本文档可能未紧跟最新版本。
:::

这里是Minecraft模组API——[NeoForged]的官方文档。

该文档 _仅_ 针对Forge编纂，**而不是一个Java教程**。

如果你愿意对文档做出贡献，请阅读[向文档做出贡献][contributing]。

# 目录

- [主页](./index.md)
- [向文档做出贡献](./contributing.md)
- 入门
    - [概述](./gettingstarted/index.md)
    - [模组文件](./gettingstarted/modfiles.md)
    - [规划你的模组结构](./gettingstarted/structuring.md)
    - [版本号](./gettingstarted/versioning.md)
- 核心概念
    - [注册表](./concepts/registries.md)
    - [端位（Sides）](./concepts/sides.md)
    - [事件](./concepts/events.md)
    - [模组生命周期](./concepts/lifecycle.md)
    - [资源](./concepts/resources.md)
    - [国际化与本地化](./concepts/internationalization.md)
- 方块
    - [概述](./blocks/index.md)
    - [方块状态](./blocks/states.md)
- 物品
    - [概述](./items/index.md)
    - [BlockEntityWithoutLevelRenderer](./items/bewlr.md)
- 网络
    - [概述](./networking/index.md)
    - [SimpleImpl](./networking/simpleimpl.md)
    - [实体的同步](./networking/entities.md)
- 方块实体
    - [概述](./blockentities/index.md)
    - [BlockEntityRenderer](./blockentities/ber.md)
- 游戏特效
    - [粒子效果](./gameeffects/particles.md)
    - [音效](./gameeffects/sounds.md)
- 数据储存
    - [Capabilities](./datastorage/capabilities.md)
    - [Saved Data](./datastorage/saveddata.md)
    - [编解码器（Codecs）](./datastorage/codecs.md)
- 图形用户界面
    - [菜单（Menus）](./gui/menus.md)
    - [屏幕（Screens）](./gui/screens.md)
- 渲染
    - 模型扩展
        - [概述](./rendering/modelextensions/index.md)
        - [根变换](./rendering/modelextensions/transforms.md)
        - [渲染类型](./rendering/modelextensions/rendertypes.md)
        - [部分可见度](./rendering/modelextensions/visibility.md)
        - [面数据](./rendering/modelextensions/facedata.md)
    - 模型加载器
        - [概述](./rendering/modelloaders/index.md)
        - [烘焙模型](./rendering/modelloaders/bakedmodel.md)
        - [变换](./rendering/modelloaders/transform.md)
        - [物品重载](./rendering/modelloaders/itemoverrides.md)
- 资源
    - 客户端资源（Assets）
        - [概述](./resources/client/index.md)
        - 配方
            - [概述](./resources/server/recipes/index.md)
            - [自定义配方](./resources/server/recipes/custom.md)
            - [原料](./resources/server/recipes/ingredients.md)
            - [非数据包配方](./resources/server/recipes/incode.md)
        - [战利品表](./resources/server/loottables.md)
        - [全局战利品修改器](./resources/server/glm.md)
        - [标签](./resources/server/tags.md)
        - [进度](./resources/server/advancements.md)
        - [条件性加载数据](./resources/server/conditional.md)
- 数据生成
    - [概述](./datagen/index.md)
    - 客户端资源（Assets）
        - [模型提供者](./datagen/client/modelproviders.md)
        - [语言提供者](./datagen/client/localization.md)
        - [音效提供者](./datagen/client/sounds.md)
    - 服务端数据（Data）
        - [配方提供者](./datagen/server/recipes.md)
        - [战利品表提供者](./datagen/server/loottables.md)
        - [标签提供者](./datagen/server/tags.md)
        - [进度提供者](./datagen/server/advancements.md)
        - [全局战利品修改器提供者](./datagen/server/glm.md)
        - [数据包注册表对象提供者](./datagen/server/datapackregistries.md)
- 杂项功能
    - [配置](./misc/config.md)
    - [键盘布局](./misc/keymappings.md)
    - [游戏测试](./misc/gametest.md)
    - [Forge更新检查器](./misc/updatechecker.md)
    - [调试分析器](./misc/debugprofiler.md)
- 进阶主题
    - [访问转换器](./advanced/accesstransformers.md)
- 向Forge做出贡献
    - [概述](./forgedev/index.md)
    - [Pull Request准则](./forgedev/prguidelines.md)
- 旧版本
    - [概述](./legacy/index.md)
    - [移植到当前版本](./legacy/porting.md)

[translation-repo]: https://github.com/srcres258/neo-doc
[NeoForged]: https://neoforged.net
[contributing]: ./contributing.md
