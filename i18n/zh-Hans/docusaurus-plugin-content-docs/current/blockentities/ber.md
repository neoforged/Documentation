BlockEntityRenderer
==================

`BlockEntityRenderer` 或 `BER` 用于以无法用静态烘焙模型（JSON，OBJ，B3D，其他）表示的方式渲染块。块实体渲染器要求块有一个 `BlockEntity`。

创建 BER
--------------

要创建 BER，创建一个继承自 `BlockEntityRenderer` 的类。它需要一个泛型参数，指定块的 `BlockEntity` 类。泛型参数在 BER 的 `render` 方法中使用。

对于给定的 `BlockEntityType`，只存在一个 BER。因此，应将特定于等级中的单个实例的值存储在传递给渲染器的块实体中，而不是在 BER 本身中。例如，每帧递增的整数，如果存储在 BER 中，将会在该类型的等级中的每一个块实体中每帧递增。

### `render`

每一帧都会调用这个方法来渲染块实体。

#### 参数
* `blockEntity`：这是正在渲染的块实体的实例。
* `partialTick`：自上一完整 tick以来已经过去的以 tick 的分数表示的时间。
* `poseStack`：这是一个堆栈，可以持有四维矩阵条目，这些条目可以偏移到块实体的当前位置。
* `bufferSource`：一个渲染缓冲区，能够访问顶点消费者。
* `combinedLight`：块实体上当前光值的整数。
* `combinedOverlay`：一个设置为块实体当前覆盖层的整数，通常是 `OverlayTexture#NO_OVERLAY` 或 655,360。

注册 BER
-----------------

要注册 BER，你必须订阅模组事件总线上的 `EntityRenderersEvent$RegisterRenderers` 事件，并调用 `#registerBlockEntityRenderer`。
