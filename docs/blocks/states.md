Blockstates
===========

Introduction
------------

A blockstate is a variant of a block. For example, a slab has three variants: top, bottom and double. These three variants ("states") are represented through three different blockstates.

A blockstate property is described by an instance of `Property<?>`. For example, slabs use an `EnumProperty<SlabType>`. Other examples include `instrument` (`EnumProperty<NoteBlockInstrument>`), `facing` (`DirectionProperty`), or `powered` (`BooleanProperty`). Each property has the value of the type `T` parametrized by `Property<T>`.

A unique pair can be constructed from the `Block` and a map of every `Property<?>` of that block to their associated values. This unique pair is called a blockstate, represented by the `BlockState` class. As with blocks themselves, every blockstate exists exactly once in memory.

The `BlockState` system is a flexible and powerful system, but it also has limitations. `BlockState`s are immutable, and all combinations of their properties are generated on startup of the game. This means that having a `BlockState` with many properties and possible values will slow down the loading of the game, take up extra RAM, and may end up making your code confusing.

Immutability has its upsides as well, though. For example, `==` can and should be used when comparing `BlockState`s. Another upside is that, using `BlockState#setValue(Property<?>)`, you can very easily go from one state to another. This does not actually create a new `BlockState`; it returns the previously generated state with that value instead.

`BlockState` is also a final class, meaning it cannot be extended. **Any functionality goes in the corresponding Block class!**

When to Use Blockstates
-----------------------

Only the most basic properties of a block should be put into a `BlockState`, sometimes using a `BlockEntity` or multiple separate `Block`s is the better approach. Always consider if you actually need to use blockstates for your purposes.

A good rule of thumb for that is: **if it has a different name, it should be a separate block**.  An example is making chair blocks: the direction of the chair should be a property, while the different types of wood should be separated into different blocks. So you'd have one chair block for each wood type, and each chair block has four blockstates (one for each rotation).

Implementing Blockstates
------------------------

In your block class, create or reference `static final Property<?>` constants for every property that your block has. You are free to make your own `Property<?>` implementations, but the means to do that are not covered in this article. The vanilla code provides several convenience implementations:

* `IntegerProperty`
    * Implements `Property<Integer>`. Defines a property that holds an integer value.
    * Created by calling `IntegerProperty#create(String propertyName, int minimum, int maximum)`.
* `BooleanProperty`
    * Implements `Property<Boolean>`. Defines a property that holds a `true` or `false` value.
    * Created by calling `BooleanProperty#create(String propertyName)`.
* `EnumProperty<E extends Enum<E>>`
    * Implements `Property<E>`. Defines a property that can take on the values of an Enum class.
    * Created by calling `EnumProperty#create(String propertyName, Class<E> enumClass)`.
    * It is also possible to use only a subset of the Enum values (e.g. 4 out of 16 `DyeColor`s). See the overloads of `EnumProperty#create`.
* `DirectionProperty`
    * This is a convenience implementation of `EnumProperty<Direction>`
    * Several convenience predicates are also provided. For example, to get a property that represents the cardinal directions, call `DirectionProperty.create("<name>", Direction.Plane.HORIZONTAL)`; to get the X directions, `DirectionProperty.create("<name>", Direction.Axis.X)`.

The class `BlockStateProperties` contains shared vanilla properties which should be used or referenced whenever possible, in place of creating your own properties.

When you have your desired property constants, override `Block#createBlockStateDefinition(StateDefinition$Builder)` in your block class. In that method, call `StateDefinition$Builder#add(...);`  with the parameters being all the properties you wish the block to have - typically this would be all the properties you defined before.

Every block will also have a default state. Usually, the default state uses the default value of every property. You can change the default state by calling the `Block#registerDefaultState(BlockState)` method from your constructor. For example, this is what the method call looks like in `DoorBlock`:

```java
this.registerDefaultState(this.stateDefinition.any()
    .setValue(FACING, Direction.NORTH)
    .setValue(OPEN, false)
    .setValue(HINGE, DoorHingeSide.LEFT)
    .setValue(POWERED, false)
    .setValue(HALF, DoubleBlockHalf.LOWER)
);
```

If you wish to change what `BlockState` is used when placing your block, override `Block#getStateForPlacement(BlockPlaceContext)`. This can be used to, for example, set the direction of your block depending on where the player is standing or looking when they place it.

Using Blockstates
-----------------

You can get the value of a property by calling `BlockState#getValue(Property<?>)`, passing it the property you want to get the value of.

If you want to get a `BlockState` with a different set of values, simply call `BlockState#setValue(Property<T>, T)` on an existing block state with the property and its value. If you do not have a block state available, you can call `Block#defaultBlockState` and work from there.

To get a `BlockState` from the level, use `Level#getBlockState(BlockPos)`.

### `Level#setBlock`

To set a `BlockState` in the level, use `Level#setBlock(BlockPos, BlockState, int)`.

The `int` parameter deserves some extra explanation. It denotes some options primarily related to networking.

To help setting this option correctly, there are a number of constants in `Block`, prefixed with `UPDATE_`, for example `Block.UPDATE_NEIGHBORS` or `Block.UPDATE_IMMEDIATELY`. These constants can be ORed bitwise (for example `Block.UPDATE_NEIGHBORS | Block.UPDATE_CLIENTS`) if you wish to combine them. If you're unsure which one to use, use `Block.UPDATE_ALL`.
