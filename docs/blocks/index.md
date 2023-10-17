Blocks
======

Blocks are, obviously, essential to the Minecraft world. They make up all the terrain, structures, and machines. Chances are if you are interested in making a mod, then you will want to add some blocks. This page will guide you through the creation of blocks, and some of the things you can do with them.

One Block to Rule Them All
--------------------------

Before we get started, it is important to understand that there is only ever one of each block in the game. A world consists of thousands of references to that one block in different locations. In other words, the same block is just displayed a lot of times.

Due to this, a block should only ever be instantiated once, and that is during registration. Once the block is registered, you can then use the registered reference as needed. Consider this example (see the [Registration][registration] page if you do not know what you are looking at):

```java
public static final RegistryObject<Block> MY_BLOCK = BLOCKS.register("my_block", () -> new Block(...));
```

After registering the block, all references to the new `my_block` should use this constant. For example, if you want to check if the block at a given position is a `my_block`, the code for that would look something like this:

```java
level.getBlockState(position).is(MyBlockRegistrationClass.MY_BLOCK.get());
```

:::danger
As soon as you create a `new Block()` outside registration, things can and will break!
:::

Creating Blocks
---------------

### Basic Blocks

For simple blocks which need no special functionality (think cobblestone, wooden planks, etc.), the `Block` class can be used directly. To do so, during registration, instantiate `Block` with a `BlockBehaviour.Properties` parameter. This `BlockBehaviour.Properties` parameter can be created using `BlockBehaviour.Properties#of`, and it can be customized by calling its methods. The most important methods for this are:

- `destroyTime` - Determines the time the block needs to be destroyed.
- `explosionResistance` - Determines the explosion resistance of the block.
- `sound` - Sets the sound the block makes when it is punched, broken, or placed.
- `lightLevel` - Sets the light emission of the block. Accepts a function with a `BlockState` parameter that returns a value between 0 and 15.
- `friction` - Sets the friction (slipperiness) of the block.

So for example, a simple implementation would look something like this:

```java
public static final RegistryObject<Block> MY_BETTER_BLOCK = BLOCKS.register("my_better_block", () -> new Block(BlockBehaviour.Properties.of()
        .destroyTime(2.0f)
        .explosionResistance(10.0f)
        .sound(SoundType.GRAVEL)
        .lightLevel(state -> 7)));
```

For further documentation, see the [`BlockBehaviour.Properties` reference][reference_properties]. For more examples, or to look at the values used by Minecraft, have a look at the `Blocks` class.

:::note
It is important to understand that a block in the world is not the same thing as in an inventory. What looks like a block in an inventory is actually a `BlockItem`, a special type of [item] that places a block when used. This also means that things like the creative tab or the max stack size are handled by the corresponding `BlockItem`.

A `BlockItem` must be registered separately from the block. This is because a block does not necessarily need an item, for example if it is not meant to be collected (as is the case with fire, for example).
:::

### More Functionality

Directly using `Block` only allows for very basic blocks. If you want to add functionality, like player interaction or a non-1x1x1 hitbox, a custom class that extends `Block` is required. The `Block` class has many methods that can be overridden to do different things; these are documented in the [`Block` reference][reference_block].

If you want to make a block that has different variants (think a slab that has a bottom, top, and double variant), you should use [blockstates]. And finally, if you want a block that stores additional data (think a chest that stores its inventory), a [block entity][blockentities] should be used. The rule of thumb here is that if you have a finite amount of states, use blockstates, and if you have an infinite or near-infinite amount of states, use a block entity.

### Resources

If you register your block and place it in the world, you will find it to be missing things like a texture. This is because textures, among others, are handled by Minecraft's resource system.

To apply a simple texture to a block, you must add a blockstate JSON, a model JSON, and a texture PNG. See the section on [resources] for more information.

Using Blocks
------------

Blocks are very rarely directly used to do things. The main purpose of a block class is to define behavior of a block. The game then runs that behavior through `BlockState`s, often passing them into the `Block`'s functionality methods as a parameter.

For more information on how blockstates are used, see [Using Blockstates][usingblockstates].

[blockentities]: ../blockentities/index.md
[blockstates]: states.md
[item]: ../items/index.md
[reference_properties]: reference.md#blockbehaviourproperties
[reference_block]: reference.md#block
[registration]: ../concepts/registries.md#methods-for-registering
[resources]: ../resources/client/index.md
[sounds]: ../gameeffects/sounds.md
[usingblockstates]: states.md#using-blockstates
