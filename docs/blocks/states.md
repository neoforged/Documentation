Blockstates
===========

Introduction
------------

Often, you will find yourself in a situation where you want different states of a block. For example, a wheat crop has eight growth stages, and making a separate block for each stage feels wrong. Or you have a slab or slab-like block - one bottom state, one top state, and one state that has both.

This is where blockstates come into play. Blockstates are an easy way to represent the different states a block can have, like a growth stage or a slab placement type.

Blockstates use a system of properties. A block can have multiple properties of multiple types. For example, a lever has two properties: whether it is currently activated (`powered`, 2 options) and which direction it is placed in (`facing`, 6 options). So in total, the lever has 12 different blockstates:

```
minecraft:lever[facing=north,powered=false]
minecraft:lever[facing=east,powered=false]
minecraft:lever[facing=south,powered=false]
minecraft:lever[facing=west,powered=false]
minecraft:lever[facing=up,powered=false]
minecraft:lever[facing=down,powered=false]
minecraft:lever[facing=north,powered=true]
minecraft:lever[facing=east,powered=true]
minecraft:lever[facing=south,powered=true]
minecraft:lever[facing=west,powered=true]
minecraft:lever[facing=up,powered=true]
minecraft:lever[facing=down,powered=true]
```

The notation `blockid[property1=value1,property2=value,...]` is the standardized way of representing a blockstate in text form, and is used in some locations in vanilla, for example in commands.

If your block does not have any blockstate properties defined, it still has exactly one blockstate - that is the one without any properties, since there are no properties to specify. This can be denoted as `minecraft:oak_planks[]` or simply `minecraft:oak_planks`.

As with blocks, every `BlockState` exists exactly once in memory. This has the convenient side effect that `==` can and should be used to compare `BlockState`s. `BlockState` is also a final class, meaning it cannot be extended. **Any functionality goes in the corresponding [Block][block] class!**

When to Use Blockstates
-----------------------

### Blockstates vs. Separate Blocks

A good rule of thumb is: **if it has a different name, it should be a separate block**.  An example is making chair blocks: the direction of the chair should be a property, while the different types of wood should be separated into different blocks. So you'd have one chair block for each wood type, and each chair block has four blockstates (one for each direction).

### Blockstates vs. [Block Entities][blockentity]

Here, the rule of thumb is: **if you have a finite amount of states, use a blockstate, if you have an infinite or near-infinite amount of states, use a block entity.** Block entities can store arbitrary amounts of data, but are slower than blockstates.

Blockstates and block entities can be used in conjunction with one another. For example, the chest uses blockstate properties for things like the direction, whether it is opened or not, or becoming a double chest is handled by blockstate properties, while storing the inventory or interacting with hoppers is handled by a block entity.

Implementing Blockstates
------------------------

To implement a blockstate property, in your block class, create or reference a `public static final Property<?>` constant. While you are free to make your own `Property<?>` implementations, the vanilla code provides several convenience implementations that should cover most use cases:

* `IntegerProperty`
    * Implements `Property<Integer>`. Defines a property that holds an integer value. Note that negative values are not supported.
    * Created by calling `IntegerProperty#create(String propertyName, int minimum, int maximum)`.
* `BooleanProperty`
    * Implements `Property<Boolean>`. Defines a property that holds a `true` or `false` value.
    * Created by calling `BooleanProperty#create(String propertyName)`.
* `EnumProperty<E extends Enum<E>>`
    * Implements `Property<E>`. Defines a property that can take on the values of an Enum class.
    * Created by calling `EnumProperty#create(String propertyName, Class<E> enumClass)`.
    * It is also possible to use only a subset of the Enum values (e.g. 4 out of 16 `DyeColor`s), see the overloads of `EnumProperty#create`.
* `DirectionProperty`
    * Extends `EnumProperty<Direction>`. Defines a property that can take on a `Direction`.
    * Created by calling `DirectionProperty#create(String propertyName)`.
    * Several convenience predicates are provided. For example, to get a property that represents the cardinal directions, call `DirectionProperty.create("<name>", Direction.Plane.HORIZONTAL)`; to get the X directions, `DirectionProperty.create("<name>", Direction.Axis.X)`.

The class `BlockStateProperties` contains shared vanilla properties which should be used or referenced whenever possible, in place of creating your own properties.

Once you have your property constant, override `Block#createBlockStateDefinition(StateDefinition$Builder)` in your block class. In that method, call `StateDefinition.Builder#add(YOUR_PROPERTY);`. `StateDefinition.Builder#add` has a vararg parameter, so if you have multiple properties, you can add them all in one go.

Every block will also have a default state. If nothing else is specified, the default state uses the default value of every property. You can change the default state by calling the `Block#registerDefaultState(BlockState)` method from your constructor.

If you wish to change which `BlockState` is used when placing your block, override `Block#getStateForPlacement(BlockPlaceContext)`. This can be used to, for example, set the direction of your block depending on where the player is standing or looking when they place it.

To further illustrate this, this is what the relevant bits of the `LeverBlock` class look like:

```java
public class LeverBlock extends Block {
    public static final DirectionProperty FACING = BlockStateProperties.FACING;
    public static final BooleanProperty POWERED = BlockStateProperties.POWERED;

    public LeverBlock(BlockBehaviour.Properties pProperties) {
        super(pProperties);
        registerDefaultState(stateDefinition.any() // stateDefinition.any() returns a random BlockState from an internal set, we don't care because we're setting all values ourselves anyway
                .setValue(FACING, Direction.NORTH)
                .setValue(POWERED, false)
        );
    }

    @Override
    protected void createBlockStateDefinition(StateDefinition.Builder<Block, BlockState> pBuilder) {
        pBuilder.add(FACING, POWERED);
    }

    @Override
    @Nullable
    public BlockState getStateForPlacement(BlockPlaceContext pContext) {
        // code that determines which state will be used when placing down this block, depending on the BlockPlaceContext
    }
}
```

Using Blockstates
-----------------

To go from `Block` to `BlockState`, call `Block#defaultBlockState()`.

You can get the value of a property by calling `BlockState#getValue(Property<?>)`, passing it the property you want to get the value of. Reusing our lever example, this would look something like `Direction direction = leverBlockState.getValue(LeverBlock.FACING);`

If you want to get a `BlockState` with a different set of values, simply call `BlockState#setValue(Property<T>, T)` on an existing block state with the property and its value. With our lever, this goes something like `leverBlockState = leverBlockState.setValue(LeverBlock.FACING, Direction.SOUTH);`

:::note
`BlockState`s are immutable. This means that when you call `#setValue(Property<T>, T)`, you are not actually modifying the blockstate. Instead, a lookup is performed internally, and you are given the blockstate object you requested, which is the one and only object that exists with these exact property values. This also means that just calling `state#setValue` without saving it into a variable (for example back into `state`) does nothing.
:::

To get a `BlockState` from the level, use `Level#getBlockState(BlockPos)`.

### `Level#setBlock`

To set a `BlockState` in the level, use `Level#setBlock(BlockPos, BlockState, int)`.

The `int` parameter deserves some extra explanation, as its meaning is not immediately obvious. It denotes what is known as update flags.

To help setting the update flags correctly, there are a number of `int` constants in `Block`, prefixed with `UPDATE_`. Examples include `Block.UPDATE_NEIGHBORS` or `Block.UPDATE_CLIENTS`. These constants can be added together (for example `Block.UPDATE_NEIGHBORS + Block.UPDATE_CLIENTS`) if you wish to combine them. If you're unsure which one to use, use `Block.UPDATE_ALL`.

[block]: index.md
[blockentity]: ../blockentities/index.md
