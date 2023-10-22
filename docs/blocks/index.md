Blocks
======

Blocks are essential to the Minecraft world. They make up all the terrain, structures, and machines. Chances are if you are interested in making a mod, then you will want to add some blocks. This page will guide you through the creation of blocks, and some of the things you can do with them.

One Block to Rule Them All
--------------------------

Before we get started, it is important to understand that there is only ever one of each block in the game. A world consists of thousands of references to that one block in different locations. In other words, the same block is just displayed a lot of times.

Due to this, a block should only ever be instantiated once, and that is during registration. Once the block is registered, you can then use the registered reference as needed. Consider this example (see the [Registration][registration] page if you do not know what you are looking at):

```java
//BLOCKS is a DeferredRegister<Block>
public static final RegistryObject<Block> MY_BLOCK = BLOCKS.register("my_block", () -> new Block(...));
```

After registering the block, all references to the new `my_block` should use this constant. For example, if you want to check if the block at a given position is `my_block`, the code for that would look something like this:

```java
//level.getBlockState(position) returns the blockstate placed in the given level (world) at the given position
level.getBlockState(position).is(MyBlockRegistrationClass.MY_BLOCK.get());
```

This approach also has the convenient side effect that `block1 == block2` works and should be used instead of Java's `equals` method.

:::danger
Do not call `new Block()` outside registration! As soon as you do that, things can and will break!
:::

Creating Blocks
---------------

### Basic Blocks

For simple blocks which need no special functionality (think cobblestone, wooden planks, etc.), the `Block` class can be used directly. To do so, during registration, instantiate `Block` with a `BlockBehaviour.Properties` parameter. This `BlockBehaviour.Properties` parameter can be created using `BlockBehaviour.Properties#of`, and it can be customized by calling its methods. The most important methods for this are:

- `destroyTime` - Determines the time the block needs to be destroyed.
    - Stone has a destroy time of 1.5, dirt has 0.5, obsidian has 50, and bedrock has -1 (unbreakable).
- `explosionResistance` - Determines the explosion resistance of the block.
    - Stone has an explosion resistance of 6.0, dirt has 0.5, obsidian has 1200, and bedrock has 3600000.
- `sound` - Sets the sound the block makes when it is punched, broken, or placed.
    - The default value is `SoundType.STONE`. See the [Sounds page][sounds] for more details.
- `lightLevel` - Sets the light emission of the block. Accepts a function with a `BlockState` parameter that returns a value between 0 and 15.
    - For example, glowstone uses `state -> 15`, and torches use `state -> 14`.
- `friction` - Sets the friction (slipperiness) of the block.
    - Default value is 0.6. Ice uses 0.98.

So for example, a simple implementation would look something like this:

```java
public static final RegistryObject<Block> MY_BETTER_BLOCK = BLOCKS.register("my_better_block", () -> new Block(BlockBehaviour.Properties.of()
        .destroyTime(2.0f)
        .explosionResistance(10.0f)
        .sound(SoundType.GRAVEL)
        .lightLevel(state -> 7)));
```

For further documentation, see the source code of `BlockBehaviour.Properties`. For more examples, or to look at the values used by Minecraft, have a look at the `Blocks` class.

:::note
It is important to understand that a block in the world is not the same thing as in an inventory. What looks like a block in an inventory is actually a `BlockItem`, a special type of [item] that places a block when used. This also means that things like the creative tab or the max stack size are handled by the corresponding `BlockItem`.

A `BlockItem` must be registered separately from the block. This is because a block does not necessarily need an item, for example if it is not meant to be collected (as is the case with fire, for example).
:::

### More Functionality

Directly using `Block` only allows for very basic blocks. If you want to add functionality, like player interaction or a different hitbox, a custom class that extends `Block` is required. The `Block` class has many methods that can be overridden to do different things; these are documented in the [`Block` reference][blockreference]. See also the Using blocks section below for some of the most common use cases for blocks.

If you want to make a block that has different variants (think a slab that has a bottom, top, and double variant), you should use [blockstates]. And finally, if you want a block that stores additional data (think a chest that stores its inventory), a [block entity][blockentities] should be used. The rule of thumb here is that if you have a finite amount of states, use blockstates, and if you have an infinite or near-infinite amount of states, use a block entity.

### Resources

If you register your block and place it in the world, you will find it to be missing things like a texture. This is because textures, among others, are handled by Minecraft's resource system.

To apply a simple texture to a block, you must add a blockstate JSON, a model JSON, and a texture PNG. See the section on [resources] for more information.

Using Blocks
------------

Blocks are very rarely directly used to do things. In fact, probably two of the most common operations in all of Minecraft - getting the block at a position, and setting a block at a position - use blockstates, not blocks. The general design approach is to have the block define behavior, but have the behavior actually run through blockstates. Due to this, `BlockState`s are often passed to methods of `Block` as a parameter. For more information on how blockstates are used, and on how to get one from a block, see [Using Blockstates][usingblockstates].

In several situations, multiple methods of `Block` are used at different times. The following subsections list the most common block-related pipelines. Unless specified otherwise, all methods are called on both logical sides.

### Placing a Block

Block placement logic is called from `BlockItem#useOn` (or some subclass's implementation thereof, such as in `PlaceOnWaterBlockItem`, which is used for lily pads). For more information on how the game gets there, see the [Interaction Pipeline][interactionpipeline]. In practice, this means that as soon as a `BlockItem` is right-clicked (for example a cobblestone item), this behavior is called.

- Several prerequisites are checked, for example that you are not in spectator mode, that all required feature flags for the block are enabled or that the block in question is not outside the world border. If at least one of these checks fails, the pipeline ends.
- `Block#canBeReplaced` is called for the block currently at the position where the block is tried to place. If it returns `false`, the pipeline ends.
- `Block#getStateForPlacement` is called.
- `Block#canSurvive` is called with the blockstate obtained in the previous step. If it returns `false`, the pipeline ends.
- The blockstate is set into the level via a `Level#setBlock` call.
  - In that `Level#setBlock` call, `Block#onPlace` is called.
- `Block#setPlacedBy` is called.

### Breaking a Block

Breaking a block is a bit more complex, as it requires time. The process can be roughly divided into four stages: "initiating", "mining", "actually breaking" and "finishing".

- When the left mouse button is clicked, the "initiating" stage is entered. 
- Now, the left mouse button needs to be held down, entering the "mining" stage. **This stage's methods are called every tick.**
- If the "continuing" stage is not interrupted (by releasing the left mouse button) and the block is broken, the "actually breaking" stage is entered.
- Under all circumstances, no matter if the block was actually broken or not, the "finishing" stage is entered.

Or for those who prefer pseudocode:

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
finishingStage();
```

The following subsections further break down these stages into actual method calls.

#### The "Initiating" Stage

- `InputEvent.InteractionKeyMappingTriggered` is fired with the left mouse button and the main hand. If the event is canceled, the pipeline ends.
- Several prerequisites are checked, for example that you are not in spectator mode, that all required feature flags for the `ItemStack` in your main hand are enabled or that the block in question is not outside the world border. If at least one of these checks fails, the pipeline ends.
- `PlayerInteractEvent.LeftClickBlock` is fired. If the event is canceled, the pipeline ends.
- `Block#attack` is called.

#### The "Mining" Stage

- `PlayerInteractEvent.LeftClickBlock` is fired. If the event is canceled, the pipeline moves to the "finishing" stage.
- `Block#getDestroyProgress` is called and added to the internal destroy progress counter.
    - `Block#getDestroyProgress` returns a float value between 0 and 1, representing how much the destroy progress counter should be increased every tick.
- The progress overlay (cracking texture) is updated accordingly.
- If the destroy progress is greater than 1.0 (i.e. completed, i.e. the block should be broken), the "mining" stage is exited and the "actually breaking" stage is entered.

#### The "Actually Breaking" Stage

- `Item#onBlockStartBreak` is called. If it returns `true`, the pipeline moves to the "finishing" stage.
- Server-only: `IForgeBlock#canHarvestBlock` is called.
- `Block#onDestroyedByPlayer` is called. If it returns `false`, the pipeline moves to the "finishing" stage. In that `Block#onDestroyedByPlayer` call:
    - `Block#playerWillDestroy` is called.
    - The blockstate is removed from the level via a `Level#setBlock` call with `Blocks.AIR.defaultBlockState()` as the blockstate parameter.
        - In that `Level#setBlock` call, `Block#onRemove` is called.
- `Block#destroy` is called.
- Server-only: If the previous call to `IForgeBlock#canHarvestBlock` returned `true`, `Block#playerDestroy` is called.
- Server-onlý: `IForgeBlock#getExpDrop` is called.
- Server-only: `Block#popExperience` is called with the result of the previous `IForgeBlock#getExpDrop` call, if that call returned a value greater than 0.

#### The "Finishing" Stage

- The internal destroy progress counter is reset.

### Ticking and Random Ticking

Like many other things, blocks are ticked (updated) every tick, which is 1 / 20 of a second, or 50 milliseconds.

There are two methods for ticking: `Block#tick` and `Block#animateTick`. The difference is that `Block#tick` is called only on the server, whereas `Block#animateTick` is called only on the client. For example, redstone updates are processed in `Block#tick`, while the fire particles of torches are spawned in `Block#animateTick`. Override either of them to add your server/client ticking behavior.

Alongside ticking, there is a separate "weather tick", if you will. The method `Block#handlePrecipitation` is called only on the server, only when it is raining in some form, with a 1 in 16 chance. This is used for example by cauldrons that fill during rain or snowfall.

And finally, there is the random tick system. Random ticks must be enabled through the `BlockBehaviour.Properties` of the block by calling the `BlockBehaviour.Properties#randomTicks()` method. This enables the block to be part of the random ticking mechanic.

Random ticks occur every tick for a set amount of blocks in a chunk. That set amount is defined through the `randomTickSpeed` gamerule. With its default value of 3, every tick, 3 random blocks from the chunk are chosen. If these blocks have random ticking enabled, then their respective `Block#randomTick` methods are called.

Random ticking is used by a wide range of mechanics in Minecraft, such as plant growth, ice and snow melting, or copper oxidizing.

[blockentities]: ../blockentities/index.md
[blockreference]: reference.md#block
[blockstates]: states.md
[events]: ../concepts/events.md
[interactionpipeline]: ../items/interactionpipeline.md
[item]: ../items/index.md
[registration]: ../concepts/registries.md#methods-for-registering
[resources]: ../resources/client/index.md
[sounds]: ../gameeffects/sounds.md
[usingblockstates]: states.md#using-blockstates
