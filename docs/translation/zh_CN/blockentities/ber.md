BlockEntityRenderer
===================

`BlockEntityRenderer`（简称`BER`）用于以静态烘焙模型（JSON、OBJ、B3D等）无法表示的方式渲染方块。方块实体渲染器要求方块具有`BlockEntity`。

创建一个BER
----------

要创建BER，请创建一个继承自`BlockEntityRenderer`的类。它采用一个泛型参数来指定方块的`BlockEntity`类。该泛型参数用于BER的`render`方法。

对于任意一个给定的`BlockEntityType`，仅存在一个BER。因此，特定于存档中单个实例的值应该存储在传递给渲染器的方块实体中，而不是存储在BER本身中。例如，如果将逐帧递增的整数存储在BER中，则对于该存档中该类型的每个方块实体也会逐帧递增。

### `render`

为了渲染方块实体，每帧都调用此方法。

#### 参数
* `blockEntity`: 这是正在渲染的方块实体的实例。
* `partialTick`: 在帧的摩擦过程中，从上一次完整刻度开始经过的时间量。
* `poseStack`: 一个栈，包含偏移到方块实体当前位置的四维矩阵条目。
* `bufferSource`: 能够访问顶点Consumer的渲染缓冲区。
* `combinedLight`: 方块实体上当前亮度值的整数。
* `combinedOverlay`: 设置为方块实体的当前overlay的整数，通常为`OverlayTexture#NO_OVERLAY`或655,360。

注册一个BER
----------

要注册BER，你必须订阅模组事件总线上的`EntityRenderersEvent$RegisterRenderers`事件，并调用`#registerBlockEntityRenderer`。
