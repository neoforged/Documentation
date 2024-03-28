BlockEntityWithoutLevelRenderer
===============================
`BlockEntityWithoutLevelRenderer`是一种处理物品的动态渲染的方法。这个系统比旧的`ItemStack`系统简单得多，旧的`ItemStack`系统需要`BlockEntity`，并且不允许访问`ItemStack`。

使用BlockEntityWithoutLevelRenderer
-----------------------------------

BlockEntityWithoutLevelRenderer允许你使用`public void renderByItem(ItemStack itemStack, ItemDisplayContext ctx, PoseStack poseStack, MultiBufferSource bufferSource, int combinedLight, int combinedOverlay)`来渲染物品。

为了使用BEWLR，`Item`必须首先满足其模型的`BakedModel#isCustomRenderer`返回true。如果没有，它将使用默认的`ItemRenderer#getBlockEntityRenderer`。一旦返回true，将访问该Item的BEWLR进行渲染。

:::caution
    如果`Block#getRenderShape`设置为`RenderShape#ENTITYBLOCK_ANIMATED`，`Block`也会使用BEWLR进行渲染。
:::

若要设置物品的BEWLR，必须在`Item#initializeClient`中使用`IClientItemExtensions`的一个匿名实例。在该匿名实例中，应重写`IClientItemExtensions#getCustomRenderer`以返回你的BEWLR的实例：

```java
// 在你的物品类中
@Override
public void initializeClient(Consumer<IClientItemExtensions> consumer) {
  consumer.accept(new IClientItemExtensions() {

    @Override
    public BlockEntityWithoutLevelRenderer getCustomRenderer() {
      return myBEWLRInstance;
    }
  });
}
```

:::note
    每个模组都应该只有一个自定义BEWLR的实例。
:::

这就行了，使用BEWLR不需要额外的设置。
