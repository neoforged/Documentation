方块
====

显然，方块是Minecraft世界的关键。它们构成了所有的地形、结构和机器。如果你有兴趣制作一个模组，那么你必然可能会想添加一些方块。本页将指导你创建方块，以及你可以使用它们做的一些事情。

创建一个方块
-----------

### 基础方块

对于不需要特殊功能的简单方块（比如圆石、木板等），不必自定义一个类。你可以通过使用`BlockBehaviour$Properties`对象实例化`Block`类来创建一个方块。该`BlockBehaviour$Properties`对象可以调用`BlockBehaviour$Properties#of`创建，并且可以通过调用其方法进行自定义。例如：

- `strength` - 硬度控制着断块所需的时间。它是一个任意值。作为参考，石头的硬度为1.5，泥土的硬度为0.5。如果该方块不能被破坏，则应使用-1.0的硬度，`Blocks#BEDROCK`的定义是一个例子。抗性控制块的防爆性。作为参考，石头的抗性为6.0，泥土的抗性为0.5。
- `sound` - 控制方块在点击、破坏或放置时发出的音效。其需要一个`SoundType`参数，请参阅[音效][sounds]页面了解更多详细信息。
- `lightLevel` - 控制方块的亮度。其接受一个带有`BlockState`参数的函数，该函数返回从0到15的某一个值。
- `friction` - 控制方块的动摩擦系数。作为参考，冰的动摩擦系数为0.98。

所有这些方法都是*可链接*的，这意味着你可以串联地调用它们。有关此方面的示例，请参见`Blocks`类。

!!! 注意
    `CreativeModeTab`未针对方块定义setter。如果方块有与之关联的物品（例如`BlockItem`），则由[`BuildCreativeModeTabContentsEvent`][creativetabs]处理。此外，也没有针对翻译键的setter，因为它是通过`Block#getDescriptionId`从注册表名称生成的。

### 进阶方块

当然，上面只允许创建非常基本的方块。如果你想添加一些功能，比如玩家交互，那么需要一个自定义的方块类。然而，`Block`类有很多方法，并且不幸的是，并不是每一个方法都能在这里用文档完全表述。请参阅本节中的其余页面，以了解你可以对方块进行的操作。

注册一个方块
-----------

方块必须经过[注册][registering]后才能发挥作用。

!!! 重要
    存档中的方块和物品栏中的“方块”是非常不同的东西。存档中的方块由`BlockState`表示，其行为由一个`Block`类的实例定义。同时，物品栏中的物品是由`Item`控制的`ItemStack`。作为`Block`和`Item`二者之间的桥梁，有一个`BlockItem`类。`BlockItem`是`Item`的一个子类，它有一个字段`block`，其中包含对它所代表的`Block`的引用。`BlockItem`将“方块”的一些行为定义为物品，例如右键单击如何放置方块。存在一个没有其`BlockItem`的`Block`也是可能的。（例如`minecraft:water`是一个方块，但不是一个物品。因此，不可能将其作为一个物品保存在物品栏中。）

    当一个方块被注册时，也*仅仅*意味着一个方块被注册了。该方块不会自动具有`BlockItem`。要为块创建基本的`BlockItem`，应该将`BlockItem`的注册表名称设置为其`Block`的注册表名称。`BlockItem`的自定义子类也可以使用。一旦为方块注册了`BlockItem`，就可以使用`Block#asItem`来获取它。如果该方块没有`BlockItem`，`Block#asItem`将返回`Items#AIR`，因此，如果你不确定你正在使用的方块是否有`BlockItem`，请检查其`Block#asItem`是否返回`Items#AIR`。

#### 选择性地注册方块

在过去，有一些模组允许用户在配置文件中禁用方块/物品。但是，你不应该这样做。允许注册的方块数量没有限制，所以请在你的模组中注册所有方块！如果你想通过配置文件禁用一个方块，你应该禁用其配方。如果要禁用创造模式物品栏中的方块，请在[`BuildCreativeModeTabContentsEvent`][creativetabs]中构建内容时使用`FeatureFlag`。

延伸阅读
-------

有关方块属性的信息，例如用于栅栏、墙等原版方块的属性，请参见[方块状态][blockstates]部分。

[sounds]: ../gameeffects/sounds.md
[creativetabs]: ../items/index.md#creative-tabs
[registering]: ../concepts/registries.md#methods-for-registering
[blockstates]: states.md
