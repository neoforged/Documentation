纹理色调
========

原版中的许多方块和物品会根据它们的位置或特性（如草）改变其纹理颜色。模型支持在面上指定“色调索引”，这是可以由`BlockColor`和`ItemColor`处理的整数。有关如何在原版模型中定义色调索引的信息，请参阅[wiki][]。

### `BlockColor`/`ItemColor`

这两个都是单方法接口。`BlockColor`接受一个`BlockState`、一个（可为空的）`BlockAndTintGetter`和一个（可为空的）`BlockPos`。`ItemColor`接受一个`ItemStack`。它们都采用一个`int`参数`tintIndex`，它是正在着色的面的色调索引。 它们都返回一个`int`，一个颜色乘数。这个`int`被视为4个无符号字节，即alpha、red、green和blue，按照从最高有效字节到最低有效字节的顺序。对于着色面上的每个像素，每个颜色通道的值是`(int)((float) base * multiplier / 255.0)`，其中`base`是通道的原始值，`multiplier`是颜色乘数的关联字节。 请注意，方块不使用Alpha通道。例如，未着色的草纹理看起来是白色和灰色的。草的`BlockColor`和`ItemColor`返回颜色乘数，red和blue分量较低，但alpha和green分量较高（至少在温暖的生物群系中），因此当执行乘法时，绿色会被带出，红色/蓝色会减少。

如果物品继承自`builtin/generated`模型，则每个层（“layer0”、“layer1”等）都有与其层索引相对应的色调索引。

### 创建颜色处理器

`BlockColor`需要注册到游戏的`BlockColors`实例中。`BlockColors`可以通过`RegisterColorHandlersEvent$Block`获取，`BlockColor`可以通过`#register`注册。请注意，这不会导致给定方块的`BlockItem`被着色。`BlockItem`是物品，需要使用`ItemColor`进行着色。

```java
@SubscribeEvent
public void registerBlockColors(RegisterColorHandlersEvent.Block event){
  event.register(myBlockColor, coloredBlock1, coloredBlock2, ...);
}
```

`ItemColor`需要注册到游戏的`ItemColors`实例中。`ItemColors`可以通过`RegisterColorHandlersEvent$Item`获取，`ItemColor`可以通过`#register`注册。此方法也被重载为接受`Block`，它只是将物品`Block#asItem`的颜色处理器注册为物品（即方块的`BlockItem`）。

```java
@SubscribeEvent
public void registerItemColors(RegisterColorHandlersEvent.Item event){
  event.register(myItemColor, coloredItem1, coloredItem2, ...);
}
```

[wiki]: https://minecraft.wiki/w/Tutorials/Models#Block_models
