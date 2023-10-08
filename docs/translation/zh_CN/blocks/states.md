方块状态
=======

旧版本的行为
-----------

在Minecraft 1.7及以前的版本中，需要存储没有BlockEntity的位置或状态数据的方块使用**元数据（metadata）**。元数据是与方块一起存储的额外数字，允许方块不同的旋转、朝向，甚至完全独立的行为。

然而，元数据系统是令人费解且有限度的，因为它只存储为方块ID旁边的一个数字，离开了代码中注释的内容后便没有任何意义。例如，要实现可以面向某个方向并且位于方块空间（例如楼梯）的上半部分或下半部分的方块，下列操作被执行：

```Java
switch (meta) {
  case 0: { ... } // 面向南方且位于方块的下半部分
  case 1: { ... } // 面向南方且位于方块的上半部分
  case 2: { ... } // 面向北方且位于方块的下半部分
  case 3: { ... } // 面向北方且位于方块的上半部分
  // ... etc. ...
}
```

因为这些数字本身没有任何意义，所以除非能够访问源代码和注释，否则没有人能够知道它们代表什么。

状态简介
-------

在Minecraft 1.8及以上版本中，元数据系统和方块ID系统被弃用，最终被**方块状态系统**取代。方块状态系统从方块的其他行为中抽象出方块属性的细节。

方块的每个*属性*都由`Property<?>`的一个实例来描述。方块属性的示例包括乐器（`EnumProperty<NoteBlockInstrument>`）、朝向（`DirectionProperty`）、充能状态（`Property<Boolean>`）等。每个属性都具有由`Property<T>`参数化后的类型`T`的值。

可以构建从`Block`和`Property<?>`的Map到与它们相关联的值的唯一的对。这个唯一的对被称为`BlockState`。

以前无意义的元数据值系统被更容易解释和处理的方块属性系统所取代。以前，朝向东方并充能或按下的石头按钮由“带有元数据`9`的`minecraft:stone_button`”表示。现在，其用“`minecraft:stone_button[facing=east,powered=true]`”来表示。

方块状态系统的正确用法
--------------------

`BlockState`系统是一个灵活而强大的系统，但它也有局限性。`BlockState`是不可变的，其属性的所有组合都是在游戏启动时生成的。这意味着拥有一个具有许多属性和可能值的`BlockState`会减慢游戏的加载速度，并让任何试图理解你的方块逻辑的人感到困惑。

并非所有方块和情况都需要使用`BlockState`；只有方块的最基本属性才应该被放入`BlockState`，而任何其他情况都最好有一个`BlockEntity`或是一个区分开的`Block`。要始终考虑是否确实需要出于你的目的而使用方块状态。

!!! 注意
    一个很好的经验法则是：**如果它有不同的名称，那么它应该是一个单独的方块**。

一个案例是制作椅子方块：椅子的*朝向*应该是一个*属性*，而*不同类型的木材*应该被分成不同的块。朝向东方的“橡木椅子”（`oak_chair[facing=east]`）与朝向西方的“云杉椅子”（`oak_chair[facing=east]`）不同。

实现方块状态
-----------

在你的Block类中，为你的方块所拥有的所有属性创建或引用`static final` `Property<?>`对象。你尽可以创建自己的`Property<?>`实现，但本文没有介绍实现的方法。原版代码提供了几个方便的实现：

* `IntegerProperty`
    * 实现了`Property<Integer>`。定义具有整数值的一个属性。
    * 通过调用`IntegerProperty#create(String propertyName, int minimum, int maximum)`创建。
* `BooleanProperty`
    * 实现了`Property<Boolean>`。定义具有`true`或`false`值的一个属性。
    * 通过调用`BooleanProperty#create(String propertyName)`创建。
* `EnumProperty<E extends Enum<E>>`
    * 实现了`Property<E>`定义具有某一枚举类的值的一个属性。
    * 通过调用`EnumProperty#create(String propertyName, Class<E> enumClass)`创建。
    * 也能够仅使用枚举值的一个子集（例如16个`DyeColor`中的4个）。请参阅`EnumProperty#create`的重载。
* `DirectionProperty`
    * 这是`EnumProperty<Direction>`的一个便利实现。
    * Several convenience predicates are also provided. For example, to get a property that represents the cardinal directions, call `DirectionProperty.create("<name>", Direction.Plane.HORIZONTAL)`; to get the X directions, `DirectionProperty.create("<name>", Direction.Axis.X)`.
    * 也提供了一些便利的Predicate。例如，要获得一个表示基本方向的属性，请调用`DirectionProperty.create("<name>", Direction.Plane.HORIZONTAL)`；要获得仅X方向的，请调用`DirectionProperty.create("<name>", Direction.Axis.X)`。

类`BlockStateProperties`包含共有的原版属性，应该尽可能先使用或引用这些属性，而不是创建自己的属性。

当你拥有所需的`Property<>`对象时，请重写你的Block类中的`Block#createBlockStateDefinition(StateDefinition$Builder)`。在该方法中，使用你希望这个方块具有的每个`Property<?>`作为参数调用`StateDefinition$Builder#add(...);`。

每个方块也将有一个自动为你选择的“默认”状态。你可以通过从构造函数中调用`Block#registerDefaultState(BlockState)`方法来更改此“默认”状态。放置方块后，它将变为此“默认”状态。如`DoorBlock`的一个案例：

```Java
this.registerDefaultState(
  this.stateDefinition.any()
    .setValue(FACING, Direction.NORTH)
    .setValue(OPEN, false)
    .setValue(HINGE, DoorHingeSide.LEFT)
    .setValue(POWERED, false)
    .setValue(HALF, DoubleBlockHalf.LOWER)
);
```

如果你希望更改放置方块时使用的`BlockState`，可以重写`Block#getStateForPlacement(BlockPlaceContext)`。例如，这可以用来根据玩家放置方块时所站的位置来设置方块的方向。

由于`BlockState`是不可变的，并且其属性的所有组合都是在游戏启动时生成的，因此调用`BlockState#setValue(Property<T>, T)`将只需转到`Block`的`StateHolder`并请求具有你所需的一系列值的`BlockState`。

因为所有可能的`BlockState`都是在启动时生成的，所以你可以自由地使用引用相等运算符（`==`）来检查两个`BlockState`是否相等。

使用`BlockState`
----------------

你可以通过调用`BlockState#getValue(Property<?>)`来获取某个属性的值，并将要获取值的属性传递给它。如果你想获得一个具有不同的一系列值的`BlockState`，只需使用该属性及其值调用`BlockState#setValue(Property<T>, T)`。

你可以使用`Level#setBlockAndUpdate(BlockPos, BlockState)`和`Level#getBlockState(BlockPos)`在存档中获取并放置`BlockState`。如果你正在放置一个`Block`，请调用`Block#defaultBlockState()`以获得“默认”状态，并使用对`BlockState#setValue(Property<T>, T)`的后续调用，如上所述，以保存所需状态。
