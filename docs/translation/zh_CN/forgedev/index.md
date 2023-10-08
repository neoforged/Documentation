入门
====

如果你已经决定为Forge做出贡献，你将不得不采取一些特殊的步骤来开始开发。一个简单的模组开发环境不足以直接使用Forge的代码库。相反，你可以使用以下指南来帮助你进行设置，并开始改进Forge！

fork或克隆（clone）仓库
----------------------

像你会发现的大多数主要开源项目一样，Forge托管在[GitHub][github]上。如果你以前为另一个项目做过贡献，你就会知道这个过程，可以直接跳到下一节。

对于那些通过Git进行协作的初学者来说，以下是两个简单的步骤。

!!! 注意
    本指南假设你已经设置了GitHub帐户。如果没有，请访问GitHub的[注册页面][register]创建帐户。此外，本指南不是关于git使用的教程。如果你正在努力上手git，请先查询其他资料。

### Forking

首先，你必须通过单击右上角的“fork”按钮来“fork”[MinecraftForge仓库][forgerepo]。如果你在一个组织中，请选择要托管该fork的帐户。

fork仓库是必要的，因为不是每个GitHub用户都可以自由访问每个仓库。相反，你可以创建原始仓库的副本，以便稍后通过所谓的Pull Request贡献你的更改，稍后你将了解更多信息。

### Cloning

在fork仓库之后，是时候获得本地访问权限来实际进行一些更改了。为此，你需要将存储库克隆到本地计算机上。

使用你最喜欢的git客户端，只需将你的fork克隆到你选择的目录中。作为一般示例，这里有一个命令行片段，它应该适用于所有正确配置的系统，并将仓库克隆到当前目录下名为“MinecraftForge”的目录中（请注意，你必须将`<User>`替换为你的用户名）：

```git clone https://github.com/<User>/MinecraftForge```

# 检出到正确的分支

fork和克隆存储库是Forge开发的唯一强制性步骤。但是，为了简化为你创建Pull Request的过程，最好使用分支。

建议为你计划提交的每个PR创建并检出一个分支。这样，你就可以在工作于旧补丁的同时，随时了解Forge对新PR的最新更改。

完成此步骤后，你就可以开始设置开发环境了。

设置开发环境
-----------

根据你喜欢的IDE，你必须遵循一组不同的推荐步骤才能成功设置开发环境。

### Eclipse

由于Eclipse工作区的工作方式，ForgeGradle可以完成大部分相关工作，让你开始使用Forge工作区。

1. 打开终端/命令提示符，然后导航到克隆的fork的目录。
2. 输入`./gradlew setup`并按回车。等到ForgeGradle完成。
3. 输入`./gradlew genEclipseRuns`并按回车。再次等到ForgeGradle完成。
4. 打开你的Eclipse工作区并转到`File -> Import -> General -> Existing Gradle Project`.
5. 在打开的对话框中，在“项目根目录”（"Project root directory"）选项中浏览到仓库目录。
6. 点击“完成”按钮完成导入。

这就是让你启动并运行Eclipse所需的全部内容。运行测试模组不需要额外的步骤。只需像在任何其他项目中一样点击“运行”（"Run"），然后选择适当的运行配置。

### IntelliJ IDEA

JetBrains的旗舰IDE提供了对[Gradle][gradle]的强大集成支持：Forge的首选构建系统。然而，由于Minecraft模组开发的一些特点，需要额外的步骤才能使一切正常工作。

#### IDEA 2021及以后版本
1. IntelliJ IDEA 2021，启动！
    - 如果你已经打开了另一个项目，请使用 文件 -> 关闭项目 选项关闭该项目。
2. 在“欢迎使用IntelliJ IDEA”窗口的项目选项卡中，单击右上角的“打开”按钮，然后选择你之前克隆的MinecraftForge文件夹。
3. 如有提示，点击“信任项目”。
4. IDEA导入项目并索引其文件后，运行Gradle设置任务。你可以通过以下方式执行此操作：
    - 打开屏幕右侧的Gradle侧边栏，然后打开forge项目树，选择任务（Tasks），然后选择其他（other），然后双击 forge -> 任务 -> 其他 -> “设置”（`setup`） 中的`setup`任务（也可能显示为`MinecraftForge[Setup]`）。
5. 生成运行配置
    - 打开屏幕右侧的Gradle侧边栏，然后打开forge项目树，选择任务，然后选择其他，双击 forge -> 任务 -> forgegradle runs -> `genIntellijRuns` 中的`genIntellijRuns`任务（也可能显示为`MinecraftForge[genIntellijRuns]`）。
- 如果在进行任何更改之前在构建过程中遇到许可错误，运行`updateLicenses`任务可能会有所帮助。这个任务也可以在 Forge -> Tasks -> other 中找到。

#### IDEA 2019-2020
IDEA 2021和这些版本的设置之间有一些细微的差异。

1. 导入Forge的`build.gradle`作为IDEA项目。为此，只需从`Welcome to IntelliJ IDEA`启动屏幕中单击`Import Project`，然后选择`build.gradle`文件。
1. IDEA导入项目并索引文件后，运行Gradle设置任务。两者之一：
    1. 打开屏幕右侧的Gradle侧边栏，然后打开`forge`项目树，选择`Tasks`，然后选择`other`，双击`setup`任务（也可能显示为`MinecraftForge[Setup]`）。或者：
    1. 按CTRL键两次，然后在弹出的`Run`命令窗口中键入`gradle setup`。

然后，你可以使用`forge_client`Gradle任务（`Tasks -> fg_runs -> forge_client`）运行Forge：右键单击任务并根据需要选择`Run`或`Debug`。

你现在应该能够使用你对Forge和原版代码库所做的更改来使用你的模组。

做出更改并提交Pull Request
-------------------------

一旦你设置了你的开发环境，是时候对Forge的代码库进行一些更改了。然而，在编辑项目代码时，你必须避免一些陷阱。

最重要的是，如果你想编辑Minecraft的源代码，你必须只在“Forge”子项目中这样做。“Clean”项目中的任何更改都会干扰ForgeGradle和生成补丁。这可能会带来灾难性的后果，并可能使你的环境完全无用。如果你希望拥有完美的体验，请确保你只在“Forge”项目中编辑代码！

### 生成补丁

在你对代码库进行了更改并对其进行了彻底测试之后，你可以继续生成补丁。只有当你在Minecraft代码库中工作时（即在“Forge”项目中），这才是必要的，但这一步骤对于你的更改在其他地方工作至关重要。Forge的工作原理是只将更改后的内容注入原版Minecraft，因此需要以适当的格式提供这些更改。值得庆幸的是，ForgeGradle能够生成变更集供你提交。

要启动补丁生成，只需从IDE或命令行运行`genPatches`Gradle任务。完成后，你可以提交所有更改（确保没有添加任何不必要的文件）并提交Pull Request！

### Pull Requests

将你的贡献添加到Forge之前的最后一步是Pull Request（简称PR）。这是一个将fork的更改合并到活动代码库中的正式请求。创建PR很容易。只需转到[这个GitHub页面][submitpr]并按照建议的步骤进行操作。现在，对于分支的良好设置是有回报的，因为你可以准确地选择要提交的更改。

!!! 注意
    Pull Request受规则约束；并不是每一个请求都会被盲目接受。关注[本文档][contribute]以获取更多信息并确保你的PR达到最佳质量！如果你想最大限度地提高你的PR被接受的机会，请遵循这些[PR准则][guidelines]！

[github]: https://www.github.com
[register]: https://www.github.com/join
[forgerepo]: https://www.github.com/MinecraftForge/MinecraftForge
[gradle]: https://www.gradle.org
[submitpr]: https://github.com/MinecraftForge/MinecraftForge/compare
[contribute]: https://github.com/MinecraftForge/MinecraftForge/blob/1.13.x/CONTRIBUTING.md
[guidelines]: ./prguidelines.md
