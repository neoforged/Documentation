## 统一方块的规则

在开始之前，你需要明白在游戏中每个方块都只有一个。一个世界由成千上万个在不同位置引用该方块的实例组成。换句话说，同一个方块多次被显示。

因此，一个方块只应该在[注册]期间实例化一次。一旦注册了方块，你可以根据需要使用已注册的引用。

与大多数其他注册表不同，方块可以使用`DeferredRegister`的特殊版本，称为`DeferredRegister.Blocks`。 `DeferredRegister.Blocks`基本上就像`DeferredRegister<Block>`，但有一些细微的差别：

- 它们是通过`DeferredRegister.createBlocks（"yourmodid"）`创建的，而不是通常的`DeferredRegister.create（...）`方法。
- `＃register`返回一个`DeferredBlock<T extends Block>`，它扩展了`DeferredHolder<Block，T>`。 `T`是我们正在注册的方块类的类型。
- 有一些帮助注册方块的方法。 更多详情请参见[下方]。

现在，让我们注册我们的方块：

```java
//BLOCKS is a DeferredRegister.Blocks
public static final DeferredBlock<Block> MY_BLOCK = BLOCKS.register("my_block", () -> new Block(...));
```

注册了方块后，所有对新的`my_block`的引用应使用此常量。例如，如果你想检查给定位置的方块是否是`my_block`，那么相应的代码看起来像这样：

```java
level.getBlockState(position) //返回在给定位置放置的方块状态
        //highlight-next-line
        .is(MyBlockRegistrationClass.MY_BLOCK.get());
```

这种方法也有一个方便的效果，即`block1 == block2`有效，并且可以代替Java的`equals`方法使用（当然，使用`equals`仍然有效，但是因为它还是通过引用进行比较，所以没有意义）。

:::danger
不要在注册外部调用`new Block()`！一旦你那样做了，会出现问题：

- 方块必须在注册表解锁时创建。NeoForge为您解锁注册表，并稍后再冻结它们，所以注册是您创建方块的时机窗口。
- 如果你在注册表再次冻结时尝试创建和/或注册方块，游戏将崩溃并报告一个“null”方块，这可能会非常混乱。
- 如果你仍然设法拥有一个悬空的方块实例，游戏在同步和保存时将不能识别它，并将其替换为空气。
:::

## 创建方块

如上所述，我们首先创建我们的`DeferredRegister.Blocks`：

```java
public static final DeferredRegister.Blocks BLOCKS = DeferredRegister.createBlocks("yourmodid");
```

### 基础方块

对于不需要特殊功能的简单方块（如圆石，木板等），可以直接使用`Block`类。要做到这一点，在注册期间，用`BlockBehaviour.Properties`参数实例化`Block`。可以使用`BlockBehaviour.Properties＃of`创建此`BlockBehaviour.Properties`参数，并可以通过调用其方法进行定制。这其中最重要的方法是：

- `destroyTime`-决定破坏方块所需的时间。
   - 石头的破坏时间为1.5，泥土为0.5，黑曜石为50，基岩为-1（不可破坏）。
- `explosionResistance`-决定方块的抗爆性。
   - 石头的抗爆性为6.0，泥土为0.5，黑曜石为1,200，基岩为3,600,000。
- `sound`-设置方块在被击中，打破或放置时的声音。
   - 默认值是`SoundType.STONE`。更多详细信息请参见[声音页面][sounds]。
- `lightLevel`-设置方块的光线发射。接收一个带有`BlockState`参数的函数，返回0到15之间的值。
   例如，萤石使用`state -> 15`，火炬使用`state -> 14`。
- `摩擦` - 设置方块的摩擦（滑滑的程度）。
  - 默认值是0.6。冰使用0.98。

例如，一个简单的实现可能看起来像这样：

```java
// BLOCKS is a DeferredRegister.Blocks
public static final DeferredBlock<Block> MY_BETTER_BLOCK = BLOCKS.register(
        "my_better_block", 
        () -> new Block(BlockBehaviour.Properties.of()
                //highlight-start
                .destroyTime(2.0f)
                .explosionResistance(10.0f)
                .sound(SoundType.GRAVEL)
                .lightLevel(state -> 7)
                //highlight-end
        ));
```

有关更多文档，请参阅`BlockBehaviour.Properties`的源代码。有关更多示例，或查看Minecraft使用的值，请查看`Blocks`类。

:::note
重要的是要理解，世界中的一个方块并不同于库存中的东西。库存中看起来像方块的其实是`BlockItem`，它是一种特殊类型的[物品]，在使用时会放置一个方块。这也就意味着，创造标签页或最大堆叠大小等内容都由相应的`BlockItem`处理。

`BlockItem`必须与方块单独注册。这是因为方块不一定需要一个物品，例如，如果它不能被收集 (例如火）。
### 更多功能

直接使用`Block`只能创造非常基本的方块。如果你想添加功能，像是玩家交互或不同的碰撞箱，就需要一个扩展了`Block`的自定义类。`Block`类有许多可以被重写以实现不同功能的方法；更多信息请参见`Block`、`BlockBehaviour`和`IBlockExtension`类。另外，请查看下方的[使用方块][usingblocks]部分，了解一些方块最常见的用例。

如果你想制作一个有不同变体的方块（想想一个有底部、顶部和双层变体的台阶），你应该使用[blockstates]。最后，如果你想要一个可以存储额外数据的方块（比如一个可以存储其库存的箱子），那么应该使用[block entity][blockentities]。这里的经验法则是，如果你有有限而且相当小的状态量（=最多几百个状态），使用blockstates；如果你有无限或近乎无限的状态量，使用方块实体。

### `DeferredRegister.Blocks` 辅助器

我们已经讨论了如何创建`DeferredRegister.Blocks`[上面]，以及它返回`DeferredBlock`的内容。现在，让我们看看这个专门的`DeferredRegister`还有哪些辅助工具。我们先从`#registerBlock`开始：

```java
public static final DeferredRegister.Blocks BLOCKS = DeferredRegister.createBlocks("yourmodid");

public static final DeferredBlock<Block> EXAMPLE_BLOCK = BLOCKS.registerBlock(
        "example_block",
        Block::new, // 将使用的属性传递到哪个工厂。
        BlockBehaviour.Properties.of() // 要使用的属性。
);
```

在内部，这将简单地通过应用属性参数到所提供的方块工厂（通常是构造函数）来调用`BLOCKS.register("example_block", () -> new Block(BlockBehaviour.Properties.of()))`。

如果你想使用`Block::new`，可以完全不使用工厂：

```java
public static final DeferredBlock<Block> EXAMPLE_BLOCK = BLOCKS.registerSimpleBlock(
        "example_block",
        BlockBehaviour.Properties.of() // 要使用的属性。
);
```

这和之前的例子做的完全一样，只是稍微简洁了一些。当然，如果你想使用`Block`的子类而不是`Block`本身，你将不得不使用前面的方法。

### 资源

当你注册你的方块并将其放置在世界中时，你会发现它缺少如纹理等内容。这是因为[纹理]等内容是由Minecraft的资源系统处理的。要将纹理应用到方块上，你必须提供一个[模型]和一个与纹理和形状关联的[方块状态文件][bsfile]。阅读链接文章以获取更多信息。

## 使用方块

方块很少直接用来做事。实际上，可能在整个Minecraft中最常见的两个操作 - 获取位置上的方块，和设置位置上的方块 - 使用的是方块状态，而不是方块。一般的设计方法是让方块定义行为，但实际上通过方块状态来运行行为。因此，`BlockState`经常作为参数传递给`Block`的方法。有关如何使用方块状态的更多信息，以及如何从方块获取方块状态，请参见[使用方块状态][usingblockstates]。

在几种情况下，`Block`的多个方法在不同的时间被使用。以下小节列出了最常见的与方块相关的流程。除非另有说明，否则所有方法都在逻辑两侧调用，并应在两侧返回相同的结果。

### 放置方块

方块放置逻辑是从`BlockItem#useOn`（或其某些子类的实现，例如用于睡莲的`PlaceOnWaterBlockItem`）调用的。有关游戏如何到达这一点的更多信息，请参见[交互流程][interactionpipeline]。实际上，这意味着一旦`BlockItem`被右键点击（例如圆石物品），这个行为就被调用。

- 检查几个先决条件，例如你不是在旁观者模式下，所有要求的方块功能标志都已启用，或目标位置不在世界边界之外。如果至少有一个检查失败，流程结束。
- 对当前位于被尝试放置方块的位置的方块调用`Block#canBeReplaced`。如果它返回`false`，流程结束。在这里返回`true`的显著案例是高草或雪层。
- 调用`Block#getStateForPlacement`。这是根据上下文（包括位置，旋转和放置方块的侧面等信息）返回不同方块状态的地方。这对于例如可以以不同方向放置的方块很有用。
- 用前一步获得的方块状态调用`Block#canSurvive`。如果返回`false`，流程结束。
- 通过`Level#setBlock`调用将方块状态设置到游戏世界中。
  - 在那个`Level#setBlock`调用中，调用`Block#onPlace`。
- 调用`Block#setPlacedBy`。

### 破坏方块

破坏方块稍微复杂一些，因为它需要时间。这个过程可以大致分为三个阶段：“启动”，“挖掘”和“实际破坏”。

- 当左键被点击时，进入“启动”阶段。
- 现在，需要持续按住左键，进入“挖掘”阶段。**这个阶段的方法每个刻都会被调用。**
- 如果“继续”阶段没有被中断（通过释放左键）并且方块被打破，那么进入“实际破坏”阶段。

或者对于那些更喜欢伪代码的人：

```java
leftClick();
initiatingStage();
while (leftClickIsBeingHeld()) {
    miningStage();
    if (blockIsBroken()) {
        actuallyBreakingStage();
        break;
    }
}
```

以下小节进一步将这些阶段分解为实际的方法调用。

#### “启动”阶段

- 仅客户端：当左键和主手被触发时，会触发`InputEvent.InteractionKeyMappingTriggered`事件。如果事件被取消，流程结束。
- 检查几个先决条件，例如你不是在旁观者模式下，主手中的`ItemStack`的所有必需功能标志都已启用，或被询问的方块不在世界边界之外。如果至少有一个检查失败，流程结束。
- 触发`PlayerInteractEvent.LeftClickBlock`事件。如果事件被取消，流程结束。
    - 注意当事件在客户端被取消时，不会向服务器发送数据包，因此服务器上不会运行任何逻辑。
    - 然而，在服务器上取消此事件仍然会导致客户端代码运行，这可能会导致不同步！
- 调用`Block#attack`。

#### “挖掘”阶段

- 触发`PlayerInteractEvent.LeftClickBlock`事件。如果事件被取消，流程移动到“结束”阶段。
    - 注意当事件在客户端被取消时，不会向服务器发送数据包，因此服务器上不会运行任何逻辑。
    - 然而，在服务器上取消此事件仍然会导致客户端代码运行，这可能会导致不同步！
- 调用`Block#getDestroyProgress`并将其加到内部的破坏进度计数器上。
    - `Block#getDestroyProgress`返回一个介于0和1之间的浮点值，表示破坏进度计数器每个刻应该增加多少。
- 相应地更新进度覆盖（破裂纹理）。
- 如果破坏进度大于1.0（即完成，即方块应该被破坏），则退出“挖掘”阶段并进入“实际破坏”阶段。

#### “实际破坏”阶段

- 调用`Item#onBlockStartBreak`。如果它返回`true`（决定方块不应被破坏），流程移动到“结束”阶段。
- 仅服务器：调用`IBlockExtension#canHarvestBlock`。这决定了方块是否可以被收获，即是否可以带着掉落物被破坏。
- 调用`Block#onDestroyedByPlayer`。如果它返回`false`，流程移动到“结束”阶段。在`Block#onDestroyedByPlayer`调用中：
    - 调用`Block#playerWillDestroy`。
    - 通过用`Blocks.AIR.defaultBlockState()`作为方块状态参数的`Level#setBlock`调用，从游戏世界中移除方块状态。
        - 在那个`Level#setBlock`调用中，调用`Block#onRemove`。
- 调用`Block#destroy`。
- 仅服务器：如果之前对`IBlockExtension#canHarvestBlock`的调用返回了`true`，则调用`Block#playerDestroy`。
- 仅服务器：调用`IBlockExtension#getExpDrop`。
- 仅服务器：如果之前`IBlockExtension#getExpDrop`调用的结果大于0，就调用`Block#popExperience`。

### 游戏刻

游戏刻是一种机制，它在每1/20秒或50毫秒（“一个游戏刻”）更新（游戏刻）游戏的某些部分。方块提供了不同的游戏刻方法，这些方法以不同的方式被调用。

#### 服务器游戏刻和游戏刻调度

`Block#tick`在两种情况下被调用：通过默认的[随机刻][randomtick]（见下文），或通过调度的游戏刻。可以通过`Level#scheduleTick(BlockPos, Block, int)`创建调度的游戏刻，其中`int`表示延迟。这在vanilla的多个地方被使用，例如，大型滴叶的倾斜机制就严重依赖于这个系统。其他显著的使用者包括各种红石组件。

#### 客户端游戏刻

`Block#animateTick`仅在客户端，每帧被调用。这是发生客户端仅行为的地方，例如火炬粒子的生成。

#### 天气游戏刻

天气游戏刻由`Block#handlePrecipitation`处理，并独立于常规游戏刻运行。它仅在服务器上被调用，仅当以某种形式下雨时，有1/16的机会被调用。这被用于例如收集雨水或雪水的炼药锅。

#### 随机刻

随机刻系统独立于常规游戏刻运行。随机刻必须通过调用`BlockBehaviour.Properties`的`BlockBehaviour.Properties#randomTicks()`方法来启用。这使得方块可以是随机刻机制的一部分。

每个刻为一个区块中设定数量的方块执行随机刻。这个设定数量是通过`randomTickSpeed`游戏规则定义的。其默认值为3，每个刻，从区块中随机选择3个方块。如果这些方块启用了随机刻，则分别调用它们的`Block#randomTick`方法。

`Block#randomTick`默认调用`Block#tick`，这是通常应该被覆盖的。仅当你特别希望随机刻和常规（调度）游戏刻有不同行为时，才应覆盖`Block#randomTick`。

随机刻被Minecraft中的许多机制使用，例如植物生长、冰雪融化或铜氧化。

[above]: #one-block-to-rule-them-all
[below]: #deferredregisterblocks-helpers
[blockentities]: ../blockentities/index.md
[blockstates]: states.md
[bsfile]: ../resources/client/models/index.md#blockstate-files
[events]: ../concepts/events.md
[interactionpipeline]: ../items/interactionpipeline.md
[item]: ../items/index.md
[model]: ../resources/client/models/index.md
[randomtick]: #random-ticking
[registration]: ../concepts/registries.md#methods-for-registering
[resources]: ../resources/index.md#assets
[sounds]: ../resources/client/sounds.md
[textures]: ../resources/client/textures.md
[usingblocks]: #using-blocks
[usingblockstates]: states.md#using-blockstates
