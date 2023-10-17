Blocks
======

Blocks are, obviously, essential to the Minecraft world. They make up all the terrain, structures, and machines. Chances are if you are interested in making a mod, then you will want to add some blocks. This page will guide you through the creation of blocks, and some of the things you can do with them.

One Block to Rule Them All
--------------------------

Before we get started, it is important to understand that there is only ever one of each block in the game. Even though you might see thousands of dirt blocks, or stone blocks, or crafting tables in the world, there is only ever one of those actually registered to the game. It is just displayed a lot of times.

Due to this, a block should only ever be instantiated once, and that is during registration. Once the block is registered, you can then use the registered reference as needed. See the [registration] page for more information on how to register game objects, such as blocks.

Creating Blocks
---------------

### Basic Blocks

For simple blocks which need no special functionality (think cobblestone, wooden planks, etc.), the `Block` class can be used directly. To do so, during registration, instantiate `Block` with a `BlockBehaviour$Properties` parameter. This `BlockBehaviour$Properties` parameter can be created using `BlockBehaviour$Properties#of`, and it can be customized by calling its methods. For instance:

- `strength` - This method takes two parameters: the hardness and the resistance.
    - The hardness is an arbitrary value that controls the time it takes to break the block. For reference, stone has a hardness of 1.5, dirt has a hardness of 0.5, obsidian has a hardness of 50, and unbreakable blocks (such as bedrock) have a hardness of -1.
    - The resistance is an arbitrary value that controls the explosion resistance of the block. For reference, stone has a resistance of 6.0, dirt has a resistance of 0.5, obsidian has a resistance of 1200, and unbreakable blocks (such as bedrock) have a hardness of 3600000.
- `sound` - Controls the sound the block makes when it is punched, broken, or placed. Requires a `SoundType` argument, see the [sounds] page for more details.
- `lightLevel` - Controls the light emission of the block. Takes a function with a `BlockState` parameter that returns a value from zero to fifteen.
- `friction` - Controls how slippery the block is. For reference, regular blocks have a friction of 0.6, while ice has a slipperiness of 0.98.

All these methods are **chainable**, which means you can call them in series. If you want to look at examples, see the `Blocks` class.

:::note
It is important to understand that a block in the world is not the same thing as in an inventory. What looks like a block in an inventory is actually a `BlockItem`, a special type of item that places a block when used. This also means that things like the creative tab or the max stack size are handled by the corresponding `BlockItem`.

A `BlockItem` must be registered separately from the block, this has the reason that not every block is intended to have a corresponding item.
:::

### More Functionality

Of course, the above only allows for extremely basic blocks. If you want to add functionality, like player interaction, a custom class that extends `Block` is required. The `Block` class has many methods and unfortunately, not every single one can be documented here. Please refer to other pages in this section, or to the code of `Block`, for more information.

If you want to make a block that has different variants (think a slab that has a bottom, top, and double variant), you should use [blockstates]. And finally, if you want a block that stores additional data (think a chest that stores its inventory), a [block entity] should be used.

### Resources

If you register your block and place it in the world, you will find it to be missing things like a texture. This is because textures, among others, are handled by Minecraft's resource system.

To apply a simple texture to a block, you must add a blockstate JSON, a model JSON, and a texture. See the section on [resources] for more information.

Using Blocks
------------

Most places where you'd expect a block actually take a `BlockState` instead. For example, `Level#setBlock` takes a `BlockState`, not a `Block`, despite the misleading name. If you have a block that does not have any blockstate properties, you just have one blockstate on that block. That one blockstate can be retrieved by calling `Block#defaultBlockState`.

Similarly, most methods in `Block` that can be overridden by you have a `BlockState` as one of their parameters. This allows you to perform different behavior for different blockstates. For example, if a door is right-clicked, what happens depends on whether the door is currently open or closed.

For more information regarding how blocks and blockstates are used, see [Using blockstates].

[block entity]: ../blockentities/index.md
[blockstates]: states.md
[registration]: ../concepts/registries.md#methods-for-registering
[resources]: ../resources/client/index.md
[sounds]: ../gameeffects/sounds.md
[Using blockstates]: states.md#using-blockstates
