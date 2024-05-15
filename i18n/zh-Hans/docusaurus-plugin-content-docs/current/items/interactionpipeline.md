The Interaction Pipeline
========================

本页面旨在使玩家右键单击的相当复杂和令人困惑的过程更容易理解，并澄清应在何处以及为什么使用哪种结果。

右键单击时发生了什么？
--------------------------------

当你在世界中的任何地方右键单击时，会发生一系列的事情，这取决于你当前正在查看的内容以及你手中的 `ItemStack`。会调用返回两种结果类型之一的一些方法。如果显式地返回了成功或失败，大多数情况下这些方法将取消管线。为了易读起见，这里将“显式成功或显式失败”称为“明确结果”。

- 用右鼠标按钮和主手触发 `InputEvent.InteractionKeyMappingTriggered`。如果事件被取消，管线结束。
- 检查了几种情况，例如你不处于旁观模式，或者你主手中的 `ItemStack` 的所有必需特性标志都已启用。如果这些检查中至少有一个失败，管线结束。
- 根据你的视线朝向的内容不同，会发生不同的事情：
    - 如果你的视线朝向一个在你可触及范围内且不在世界边界之外的实体：
        - 触发 `PlayerInteractEvent.EntityInteractSpecific`。如果事件被取消，管线结束。
        - 将在你所看的实体上调用 `Entity#interactAt`。如果它返回了明确结果，管线结束。
            - 如果你想为你自己的实体添加行为，请重写此方法。如果你想为一个原版实体添加行为，请使用事件。
        - 如果实体打开了一个界面（例如村民交易 GUI 或箱子矿车 GUI），管线结束。
        - 触发 `PlayerInteractEvent.EntityInteract`。如果事件被取消，管线结束。
        - 将在你所看的实体上调用 `Entity#interact`。如果它返回了明确结果，管线结束。
            - 如果你想为你自己的实体添加行为，请重写此方法。如果你想为一个原版实体添加行为，请使用事件。
            - 对于 `Mob`，`Entity#interact` 的重写处理了像使用生成蛋时拴绳和产生孩子这样的事情，然后将特定于 mob 的处理推迟到 `Mob#mobInteract`。`Entity#interact` 的结果规则也适用于这里。
        - 如果你所看的实体是一个 `LivingEntity`，将在你主手中的 `ItemStack` 上调用 `Item#interactLivingEntity`。如果它返回了明确结果，管线结束。
    - 如果你的视线朝向一个在你可触及范围内且不在世界边界之外的方块：
        - 触发 `PlayerInteractEvent.RightClickBlock`。如果事件被取消，管线结束。你也可以在这个事件中具体地否定只有方块或物品的使用。
        - 调用 `IItemExtension#onItemUseFirst`。如果它返回了明确结果，管线结束。
        - 如果玩家没有潜行并且事件没有否定方块的使用，将调用 `Block#use`。如果它返回了明确结果，管线结束。
        - 如果事件没有否定物品的使用，将调用 `Item#useOn`。如果它返回了明确结果，管线结束。
- 调用 `Item#use`。如果它返回了明确结果，管线结束。
- 上述过程再次运行，这次是用副手而不是主手。

结果类型
------------

有两种不同的结果类型：`InteractionResult` 和 `InteractionResultHolder<T>`。`InteractionResult` 大多数情况下使用，只有 `Item#use` 使用 `InteractionResultHolder<ItemStack>`。

`InteractionResult` 是一个枚举，包含五个值：`SUCCESS`、`CONSUME`、`CONSUME_PARTIAL`、`PASS` 和 `FAIL`。此外，方法 `InteractionResult#sidedSuccess` 可用，它在服务器端返回 `SUCCESS`，在客户端返回 `CONSUME`。

`InteractionResultHolder<T>` 是 `InteractionResult` 的包装器，它为 `T` 添加了额外的上下文。`T` 可以是任何东西，但在 99.99% 的情况下，它是一个 `ItemStack`。`InteractionResultHolder<T>` 为枚举值提供了包装方法（`#success`、`#consume`、`#pass` 和 `#fail`），以及 `#sidedSuccess` 方法，它在服务器上调用 `#success`，在客户端上调用 `#consume`。

一般来说，不同的值意味着以下内容：

- `InteractionResult#sidedSuccess`（或需要时 `InteractionResultHolder#sidedSuccess`）应该在操作应该被认为成功，并且你想要挥动手臂时使用。管线将结束。
- `InteractionResult.SUCCESS`（或需要时 `InteractionResultHolder#success`）应该在操作应该被认为成功，并且你想要挥动手臂时使用，但只在一侧使用。只有在出于某种原因希望在另一逻辑侧返回不同值时才使用此选项。管线将结束。
- `InteractionResult.CONSUME`（或需要时 `InteractionResultHolder#consume`）应该在操作应该被认为成功，但你不想要挥动手臂时使用。管线将结束。
- `InteractionResult.CONSUME_PARTIAL` 在大多数情况下与 `InteractionResult.CONSUME` 相同，唯一的区别在于它在 [`Item#useOn`][itemuseon] 中的使用方式。
- `InteractionResult.FAIL`（或需要时 `InteractionResult

Holder#fail`）应该在物品功能被认为失败并且不应再进行进一步交互时使用。管线将结束。这可以用在任何地方，但在 `Item#useOn` 和 `Item#use` 之外使用时需要小心。在许多情况下，使用 `InteractionResult.PASS` 更有意义。
- `InteractionResult.PASS`（或需要时 `InteractionResultHolder#pass`）应该在操作既不应被认为成功也不应被认为失败时使用。管线将继续。这是默认行为（除非另有规定）。

一些方法具有特殊的行为或要求，这些将在下面的章节中解释。

`IItemExtension#onItemUseFirst`
---------------------------

`InteractionResult#sidedSuccess` 和 `InteractionResult.CONSUME` 在这里没有效果。在这里只应该使用 `InteractionResult.SUCCESS`、`InteractionResult.FAIL` 或 `InteractionResult.PASS`。

`Item#useOn`
------------

如果你希望操作被视为成功，但你不希望手臂摆动或奖励一个 `ITEM_USED` 统计点，请使用 `InteractionResult.CONSUME_PARTIAL`。

`Item#use`
----------

这是唯一一个返回类型为 `InteractionResultHolder<ItemStack>` 的实例。`InteractionResultHolder<ItemStack>` 中的结果 `ItemStack` 将替换发起使用的 `ItemStack`，如果它已更改。

当物品可食用并且玩家可以吃掉物品时（因为他们饥饿了，或者因为物品总是可食用时），`Item#use` 的默认实现返回 `InteractionResultHolder#consume`；当物品可食用但玩家无法吃掉物品时，返回 `InteractionResultHolder#fail`；如果物品不可食用，则返回 `InteractionResultHolder#pass`。

在考虑主手时返回 `InteractionResultHolder#fail` 将阻止运行副手行为。如果你希望运行副手行为（通常是这样），请改为返回 `InteractionResultHolder#pass`。
