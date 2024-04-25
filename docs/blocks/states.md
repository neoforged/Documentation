Blockstates
===========

经常会遇到想要拥有不同状态的方块的情况。例如，小麦作物有八个生长阶段，为每个阶段制作一个单独的方块感觉并不合适。或者你有一个台阶或类台阶方块 - 一个底部状态、一个顶部状态，以及一个状态同时具有两者。

这就是Blockstates发挥作用的地方。Blockstates是一种表示方块可以具有的不同状态的简便方法，如生长阶段或台阶放置类型。

Blockstate 属性
---------------------

Blockstates使用一套属性系统。一个方块可以具有多种类型的多个属性。例如，一个末地传送门框架有两个属性：它是否有一个眼睛（`eye`，2个选项）和放置的方向（`facing`，4个选项）。所以总的来说，末地传送门框架有8（2 * 4）个不同的Blockstates：

```
minecraft:end_portal_frame[facing=north,eye=false]
minecraft:end_portal_frame[facing=east,eye=false]
minecraft:end_portal_frame[facing=south,eye=false]
minecraft:end_portal_frame[facing=west,eye=false]
minecraft:end_portal_frame[facing=north,eye=true]
minecraft:end_portal_frame[facing=east,eye=true]
minecraft:end_portal_frame[facing=south,eye=true]
minecraft:end_portal_frame[facing=west,eye=true]
```

表示法 `blockid[property1=value1,property2=value,...]` 是表示文本形式Blockstate的标准方式，并且在游戏的某些地方使用，例如在命令中。

如果您的方块没有定义任何Blockstate属性，它仍然有一个Blockstate - 那就是没有任何属性的那个，因为没有属性需要指定。这可以表示为 `minecraft:oak_planks[]` 或者简单的 `minecraft:oak_planks`。

与方块一样，每个 `BlockState` 在内存中仅存在一个。这意味着可以并且应该使用 `==` 来比较 `BlockState`。`BlockState` 也是一个终极类，意味着它不能被扩展。**任何功能都在相应的[Block][block]类中！**

何时使用Blockstates
-----------------------

### Blockstates vs. 独立方块

一个好的经验法则是：**如果它有一个不同的名称，它应该是一个独立的方块**。一个例子是制作椅子方块：椅子的方向应该是一个属性，而不同类型的木头应该分成不同的方块。所以你会有一个椅子方块适用于每种木头类型，每个椅子方块有四个Blockstates（每个方向一个）。

### Blockstates vs. [方块实体][blockentity]

这里的经验法则是：**如果你有一个有限的状态量，使用blockstate，如果你有一个无限或几乎无限的状态量，使用方块实体。** 方块实体可以存储任意量的数据，但比blockstates慢。

Blockstates和方块实体可以联合使用。例如，箱子使用Blockstate属性来表示诸如方向、是否被水淹没或成为双箱子等事物，同时通过方块实体存储库存、是否当前打开或与漏斗的互动等。

没有一个明确的答案来回答“对于Blockstate来说，多少状态太多了？”的问题，但我们建议，如果您需要超过8-9比特的数据（即超过几百种状态），您应该使用方块实体代替。

实现Blockstates
------------------------

要实现Blockstate属性，在您的方块类中创建或引用一个 `public static final Property<?>` 常量。虽然您可以自由制作自己的 `Property<?>` 实现，但游戏代码提供了几种便利实现，应该涵盖大多数用例：

* `IntegerProperty`
    * 实现 `Property<Integer>`。定义一个持有整数值的属性。注意不支持负值。
    * 通过调用 `IntegerProperty#create(String propertyName, int minimum, int maximum)` 创建。
* `BooleanProperty`
    * 实现 `Property<Boolean>`。定义一个持有 `true` 或 `false` 值的属性。
    * 通过调用 `BooleanProperty#create(String propertyName)` 创建。
* `EnumProperty<E extends Enum<E>>`
    * 实现 `Property<E>`。定义一个可以取枚举类值的属性。
    * 通过调用 `EnumProperty#create(String propertyName, Class<E> enumClass)` 创建。
    * 还可以使用枚举值的子集（例如，16个`DyeColor`s中的4个），见 `EnumProperty#create` 的重载方法。
* `DirectionProperty`
    * `DirectionProperty`
    * 扩展自 `EnumProperty<Direction>`。定义了一个可以承载 `Direction`（方向）的属性。
    * 通过调用 `DirectionProperty#create(String propertyName)` 来创建。
    * 提供了几个便利的谓词方法。例如，要获取代表基本方向的属性，调用 `DirectionProperty.create("<name>", Direction.Plane.HORIZONTAL)`；要获取X轴方向，调用 `DirectionProperty.create("<name>", Direction.Axis.X)`。

类 `BlockStateProperties` 包含了共享的原版属性，这些属性应尽可能使用或引用，而不是创建自己的属性。

一旦你有了你的属性常量，在你的方块类中重写 `Block#createBlockStateDefinition(StateDefinition$Builder)`。在该方法中，调用 `StateDefinition.Builder#add(YOUR_PROPERTY);`。`StateDefinition.Builder#add` 有一个变长参数，所以如果你有多个属性，你可以一次性添加它们所有。

每个方块还有一个默认状态。如果没有指定其他内容，缺省状态使用每个属性的默认值。你可以通过从构造函数中调用 `Block#registerDefaultState(BlockState)` 方法来更改默认状态。

如果你希望改变放置方块时使用的 `BlockState`，请重写 `Block#getStateForPlacement(BlockPlaceContext)`。这可以用来设置方块的方向，比如基于玩家放置时的站立位置或方向。

为进一步说明，这是 `EndPortalFrameBlock` 类相关部分的样子：

```java
public class EndPortalFrameBlock extends Block {
    // 注意：直接使用 BlockStateProperties 中的值而不是在这里再次引用它们是可能的。
    // 然而，为了简单和可读性考虑，推荐像这样添加常量。
    public static final DirectionProperty FACING = BlockStateProperties.FACING;
    public static final BooleanProperty EYE = BlockStateProperties.EYE;

    public EndPortalFrameBlock(BlockBehaviour.Properties pProperties) {
        super(pProperties);
        // stateDefinition.any() 返回一个内部集合中的随机 BlockState，
        // 我们不在意，因为我们 anyway 要自己设置所有值
        registerDefaultState(stateDefinition.any()
                .setValue(FACING, Direction.NORTH)
                .setValue(EYE, false)
        );
    }

    @Override
    protected void createBlockStateDefinition(StateDefinition.Builder<Block, BlockState> pBuilder) {
        // 这里是属性实际被添加到状态的地方
        pBuilder.add(FACING, EYE);
    }

    @Override
    @Nullable
    public BlockState getStateForPlacement(BlockPlaceContext pContext) {
        // 根据 BlockPlaceContext 确定放置此方块时将使用的状态的
        // 代码
    }
}
```

使用 Blockstates
----------------

要从 `Block` 转换到 `BlockState`，调用 `Block#defaultBlockState()`。可以通过 `Block#registerDefaultState` 更改默认 blockstate，如上所述。

你可以通过调用 `BlockState#getValue(Property<?>)` 来获取一个属性的值，传递你想获取值的属性。复用我们末地传送门框架的例子，这看起来像这样：

```java
// EndPortalFrameBlock.FACING 是一个 DirectionProperty，因此可以用来从 BlockState 中获取一个 Direction
Direction direction = endPortalFrameBlockState.getValue(EndPortalFrameBlock.FACING);
```

如果你想获得一个具有不同值集的 `BlockState`，只需在现有的 block state 上调用 `BlockState#setValue(Property<T>, T)` 并传入属性及其值。对于我们的杠杆来说，像这样：

```java
endPortalFrameBlockState = endPortalFrameBlockState.setValue(EndPortalFrameBlock.FACING, Direction.SOUTH);
```

:::note
`BlockState` 是不可变的。这意味着当你调用 `#setValue(Property<T>, T)` 时，你实际上不是在修改 blockstate。相反，内部进行了查找，你得到了你请求的 blockstate 对象，那是唯一存在的、具有这些确切属性值的对象。这也意味着，仅仅调用 `state#setValue` 而没有将其保存到一个变量中（例如回到 `state` 中）是无效的。
:::

要从场景中获取一个 `BlockState`，使用 `Level#getBlockState(BlockPos)`。

### `Level#setBlock`

要在场景中设置一个 `BlockState`，使用 `Level#setBlock(BlockPos, BlockState, int)`。

`int` 参数需要额外的解释，因为它的含义不立即明显。它表示更新标志。

为了正确设置更新标志，`Block` 中有一些以 `UPDATE_` 开头的 `int` 常量。这些常量可以被按位或在一起（例如 `Block.UPDATE_NEIGHBORS | Block.UPDATE_CLIENTS`）如果你希望组合它们。

- `Block.UPDATE_NEIGHBORS` 向相邻方块发送更新。更具体地说，它调用了 `Block#neighborChanged`，它调用了许多方法，其中大部分以某种方式与红石相关。
- `Block.UPDATE_CLIENTS` 将方块更新同步到客户端。
- `Block.UPDATE_INVISIBLE` 显式不在客户端更新。这也覆盖了 `Block.UPDATE_CLIENTS`，导致更新不被同步。方块始终在服务器上更新。
- `Block.UPDATE_IMMEDIATE` 强制在客户端的主线程上重新渲染。
- `Block.UPDATE_KNOWN_SHAPE` 停止邻居更新递归。
- `Block.UPDATE_SUPPRESS_DROPS` 禁止旧方块在该位置的掉落物。
- `Block.UPDATE_MOVE_BY_PISTON` 仅被活塞代码用于表示方块被活塞移动。这主要是为了延迟光照引擎的更新。
- `Block.UPDATE_ALL` 是 `Block.UPDATE_NEIGHBORS | Block.UPDATE_CLIENTS` 的别名。
- `Block.UPDATE_ALL_IMMEDIATE` 是 `Block.UPDATE_NEIGHBORS | Block.UPDATE_CLIENTS | Block.UPDATE_IMMEDIATE` 的别名。
- `Block.NONE` 是 `Block.UPDATE_INVISIBLE` 的别名。

还有一个便利方法 `Level#setBlockAndUpdate(BlockPos pos, BlockState state)`，它在内部调用 `setBlock(pos, state, Block.UPDATE_ALL)`。
