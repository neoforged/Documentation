The Interaction Pipeline
========================

This page aims to make the fairly complex and confusing process of things being right-clicked by the player more understandable, as well as clarifying what result to use where and why.

What Happens When I Right-Click?
--------------------------------

When you right-click anywhere in the world, a number of things happen, depending on what you are currently looking at and what `ItemStack`s are in your hands. A number of methods returning one of two result types (see below) are called. Most of these methods cancel the pipeline if an explicit success or an explicit failure is returned. For the sake of readability, this "explicit success or explicit failure" will be called a "definitive result" from now on.

- `InputEvent.InteractionKeyMappingTriggered` is fired with the right mouse button and the main hand. If the event is canceled, the pipeline ends.
- Several circumstances are checked, for example that you are not in spectator mode or that all required feature flags for the `ItemStack` in your main hand are enabled. If at least one of these checks fails, the pipeline ends.
- Depending on what you are looking at, different things happen:
    - If you are looking at an entity that is within your reach and not outside the world border:
        - `PlayerInteractEvent.EntityInteractSpecific` is fired. If the event is canceled, the pipeline ends.
        - `Entity#interactAt` will be called **on the entity you are looking at**. If it returns a definitive result, the pipeline ends.
            - If you want to add behavior for your own entity, override this method. If you want to add behavior for a vanilla entity, use the event.
        - If the entity opens an interface (for example a villager trading GUI or a chest minecart GUI), the pipeline ends.
        - `PlayerInteractEvent.EntityInteract` is fired. If the event is canceled, the pipeline ends.
        - `Entity#interact` is called **on the entity you are looking at**. If it returns a definitive result, the pipeline ends.
            - If you want to add behavior for your own entity, override this method. If you want to add behavior for a vanilla entity, use the event.
            - For `Mob`s, the override of `Entity#interact` handles things like leashing and spawning babies when the `ItemStack` in your main hand is a spawn egg, and then defers mob-specific handling to `Mob#mobInteract`. The rules for results for `Entity#interact` apply here as well.
        - If the entity you are looking at is a `LivingEntity`, `Item#interactLivingEntity` is called on the `ItemStack` in your main hand. If it returns a definitive result, the pipeline ends.
    - If you are looking at a block that is within your reach and not outside the world border:
        - `PlayerInteractEvent.RightClickBlock` is fired. If the event is canceled, the pipeline ends. You may also specifically deny only block or item usage in this event.
        - `IForgeItem#onItemUseFirst` is called. If it returns a definitive result, the pipeline ends.
        - If the player is not sneaking and the event does not deny block usage, `Block#use` is called. If it returns a definitive result, the pipeline ends.
        - If the event does not deny item usage, `Item#useOn` is called. If it returns a definitive result, the pipeline ends.
- `Item#use` is called. If it returns a definitive result, the pipeline ends.
- The above process runs a second time, this time with the off hand instead of the main hand.

Result Types
------------

There are two different types of results: `InteractionResult`s and `InteractionResultHolder<T>`s. Depending on the situation, one of the two is used.

`InteractionResult` is an enum consisting of five values: `SUCCESS`, `CONSUME`, `CONSUME_PARTIAL`, `PASS` and `FAIL`. Additionally, the method `InteractionResult#sidedSuccess` is available, which returns `SUCCESS` on the server and `CONSUME` on the client.

`InteractionResultHolder<T>` is a wrapper around `InteractionResult` that adds additional context for `T`. `T` can be anything, but in 99.99 percent of cases, it is an `ItemStack`. `InteractionResultHolder<T>` provides wrapper methods for the enum values (`#success`, `#consume`, `#pass` and `#fail`), as well as `#sidedSuccess`, which calls `#success` on the server and `#consume` on the client.

`Entity#interactAt`
-------------------

The return type is `InteractionResult`.

- `InteractionResult#sidedSuccess` should be used if the operation should be considered successful, and you want the arm to swing.
- `InteractionResult.SUCCESS` should be used if the operation should be considered successful, and you want the arm to swing, but only on one side. Only use this if you want to return a different value on the other logical side for whatever reason.
- `InteractionResult.CONSUME` should be used if the operation should be considered successful, but you do not want the arm to swing.
- `InteractionResult.FAIL` should be used if the item functionality should be considered failed and no further interaction should be performed. **In most cases, this can be replaced with `PASS`!**
- `InteractionResult.PASS` should be used if the operation should be considered neither successful nor failed. The pipeline will continue to evaluate `Entity#interact`. This is the default behavior of this method.

`Entity#interact` and `Mob#mobInteract`
---------------------------------------

The return type is `InteractionResult`.

- `InteractionResult#sidedSuccess` should be used if the operation should be considered successful, and you want the arm to swing.
- `InteractionResult.SUCCESS` should be used if the operation should be considered successful, and you want the arm to swing, but only on one side. Only use this if you want to return a different value on the other logical side for whatever reason.
- `InteractionResult.CONSUME` should be used if the operation should be considered successful, but you do not want the arm to swing.
- `InteractionResult.FAIL` should be used if the item functionality should be considered failed and no further interaction should be performed. **In most cases, this can be replaced with `PASS`!**
- `InteractionResult.PASS` should be used if the operation should be considered neither successful nor failed. The pipeline will continue to evaluate `Item#interactLivingEntity`. This is the default behavior of this method.

`Item#interactLivingEntity`
---------------------------

The return type is `InteractionResult`.

- `InteractionResult#sidedSuccess` should be used if the operation should be considered successful, and you want the arm to swing.
- `InteractionResult.SUCCESS` should be used if the operation should be considered successful, and you want the arm to swing, but only on one side. Only use this if you want to return a different value on the other logical side for whatever reason.
- `InteractionResult.CONSUME` should be used if the operation should be considered successful, but you do not want the arm to swing.
- `InteractionResult.FAIL` should be used if the item functionality should be considered failed and no further interaction should be performed. **In most cases, this can be replaced with `PASS`!**
- `InteractionResult.PASS` should be used if the operation should be considered neither successful nor failed. The pipeline will continue to evaluate `Item#use`. This is the default behavior of this method.

`IForgeItem#onItemUseFirst`
---------------------------

The return type is `InteractionResult`.

- `InteractionResult.SUCCESS` should be used if the item functionality should be considered successful and no further interaction should be performed.
- `InteractionResult.FAIL` should be used if the item functionality should be considered failed and no further interaction should be performed.
- `InteractionResult.PASS` should be used if the item functionality should be considered neither successful nor failed. The pipeline will continue to evaluate `Block#use`. This is the default behavior of this method.

`Block#use`
-----------

The return type is `InteractionResult`.

- `InteractionResult#sidedSuccess` should be used if the operation should be considered successful, and you want the arm to swing.
- `InteractionResult.SUCCESS` should be used if the operation should be considered successful, and you want the arm to swing, but only on one side. Only use this if you want to return a different value on the other logical side for whatever reason.
- `InteractionResult.CONSUME` should be used if the operation should be considered successful, but you do not want the arm to swing.
- `InteractionResult.FAIL` should be used if the item functionality should be considered failed and no further interaction should be performed. **In most cases, this can be replaced with `PASS`!**
- `InteractionResult.PASS` should be used if the operation should be considered neither successful nor failed. The pipeline will continue to evaluate `Item#useOn`. This is the default behavior of this method.

`Item#useOn`
------------

The return type is `InteractionResult`.

- `InteractionResult#sidedSuccess` should be used if the operation should be considered successful, and you want the arm to swing.
- `InteractionResult.SUCCESS` should be used if the operation should be considered successful, and you want the arm to swing, but only on one side. Only use this if you want to return a different value on the other logical side for whatever reason.
- `InteractionResult.CONSUME` should be used if the operation should be considered successful, but you do not want the arm to swing.
- `InteractionResult.CONSUME_PARTIAL` should be used if the operation should be considered successful, but you do not want the arm to swing or an `ITEM_USED` stat point to be awarded.
- `InteractionResult.FAIL` should be used if the operation should be considered failed and no further interaction should be performed.
- `InteractionResult.PASS` should be used if the operation should be considered neither successful nor failed. The pipeline will continue to evaluate `Item#use`. This is the default behavior of this method.

`Item#use`
----------

The return type is `InteractionResultHolder<ItemStack>`. The resulting `ItemStack` in the `InteractionResultHolder<ItemStack>` replaces the `ItemStack` the usage was initiated with, if it has changed. The default implementation of `Item#use` returns `InteractionResultHolder#consume` when the item is edible and the player can eat the item (because they are hungry, or because the item is always edible), `InteractionResultHolder#fail` when the item is edible but the player cannot eat the item, and `InteractionResultHolder#pass` if the item is not edible.

- `InteractionResultHolder#sidedSuccess` should be used if the operation should be considered successful, and you want the arm to swing.
- `InteractionResultHolder#success` should be used if the operation should be considered successful, and you want the arm to swing, but only on one side. Only use this if you want to return a different value on the other logical side for whatever reason.
- `InteractionResultHolder#consume` should be used if the operation should be considered successful, but you do not want the arm to swing.
- `InteractionResultHolder#fail` should be used if the operation should be considered failed and no further interaction should be performed.
- `InteractionResultHolder#pass` should be used if the operation should be considered neither successful nor failed. This will end the pipeline for this hand, but may run the pipeline for the other hand if applicable.
