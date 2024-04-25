# 模型数据生成

与大多数JSON数据一样，方块和物品模型可以通过[数据生成][datagen]创建。由于物品和方块模型之间有一些共同之处，因此部分数据生成代码也是相同的。

## 模型数据生成类

### `ModelBuilder`

每个模型都以某种形式的`ModelBuilder`开始 - 通常是`BlockModelBuilder`或`ItemModelBuilder`，具体取决于您要生成的内容。它包含模型的所有属性：其父级、纹理、元素、变换、加载器等。每个属性都可以通过一个方法设置：

| 方法                                               | 效果                                                                                                     |
|----------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| `#texture(String key, ResourceLocation texture)`   | 添加具有给定键和给定纹理位置的纹理变量。有一个重载，其中第二个参数是`String`。                          |
| `#renderType(ResourceLocation renderType)`         | 设置渲染类型。有一个参数为`String`的重载。有效值的列表见`RenderType`类。                               |
| `#ao(boolean ao)`                                  | 设置是否使用[环境光遮蔽][ao]。                                                                           |
| `#guiLight(GuiLight light)`                        | 设置GUI光源。可以是`GuiLight.FRONT`或`GuiLight.SIDE`。                                                  |
| `#element()`                                       | 添加一个新的`ElementBuilder`（相当于向模型添加一个新[element][elements]）。返回该`ElementBuilder`以便进一步修改。|
| `#transforms()`                                    | 返回构建器的`TransformVecBuilder`，用于设置模型的`display`。                                            |
| `#customLoader(BiFunction customLoaderFactory)`    | 使用给定的工厂使该模型使用[自定义加载器][custommodelloader]，因此使用自定义加载器构建器。这会改变构建器类型，因此可能会使用不同的方法，这取决于加载器的实现。NeoForge提供了一些开箱即用的自定义加载器，详见链接文章（包括数据生成）。|

:::tip
虽然可以通过数据生成创建复杂和详细的模型，但建议使用如[Blockbench][blockbench]之类的建模软件创建更复杂的模型，然后直接使用导出的模型或作为其他模型的父级。
:::

### `ModelProvider`

方块和物品模型数据生成都利用了`ModelProvider`的子类，分别命名为`BlockModelProvider`和`ItemModelProvider`。虽然物品模型数据生成直接扩展`ItemModelProvider`，但方块模型数据生成使用`BlockStateProvider`基类，它内部有一个可以通过`BlockStateProvider#models()`访问的`BlockModelProvider`。此外，`BlockStateProvider`还有自己的内部`ItemModelProvider`，可通过`BlockStateProvider#itemModels()`访问。`ModelProvider`最重要的部分是`getBuilder(String path)`方法，它返回给定位置的`BlockModelBuilder`（或`ItemModelBuilder`）。

然而，`ModelProvider`还包含各种辅助方法。可能最重要的辅助方法是`withExistingParent(String name, ResourceLocation parent)`，它返回一个新的构建器（通过`getBuilder(name)`）并将给定的`ResourceLocation`设置为模型父级。另外两个非常常见的辅助器是`mcLoc(String name)`，返回带有命名空间`minecraft`和给定路径的`ResourceLocation`，以及`modLoc(String name)`，做同样的事情但使用提供者的mod id（通常是您的mod id）而不是`minecraft`。此外，它还提供了各种辅助方法，这些方法是`#withExistingParent`的快捷方式，用于常见事物如板条、楼梯、栅栏、门等。

### `ModelFile`

最后一个重要的类是`ModelFile`。`ModelFile`是

磁盘上模型JSON的代码表示形式。`ModelFile`是一个抽象类，有两个内部子类`ExistingModelFile`和`UncheckedModelFile`。使用`ExistingFileHelper`验证`ExistingModelFile`的存在，而`UncheckedModelFile`被假定为存在而无需进一步检查。此外，`ModelBuilder`也被视为`ModelFile`。

## 方块模型数据生成

现在，要实际生成方块状态和方块模型文件，请扩展`BlockStateProvider`并重写`registerStatesAndModels()`方法。请注意，方块模型总是放置在`models/block`子文件夹中，但引用相对于`models`（即它们必须总是以`block/`为前缀）。在大多数情况下，选择众多预定义辅助方法之一是有意义的：

```java
public class MyBlockStateProvider extends BlockStateProvider {
    // 参数值由GatherDataEvent提供。
    public MyBlockStateProvider(PackOutput output, ExistingFileHelper existingFileHelper) {
        // 用您自己的mod id替换"examplemod"。
        super(output, "examplemod", existingFileHelper);
    }
    
    @Override
    protected void registerStatesAndModels() {
        // 占位符，其用法应替换为实际值。请参阅上文了解如何使用模型构建器，
        // 以及下文了解模型构建器提供的辅助方法。
        ModelFile exampleModel = models().withExistingParent("minecraft:block/cobblestone");
        Block block = MyBlocksClass.EXAMPLE_BLOCK.get();
        ResourceLocation exampleTexture = modLoc("block/example_texture");
        ResourceLocation bottomTexture = modLoc("block/example_texture_bottom");
        ResourceLocation topTexture = modLoc("block/example_texture_top");
        ResourceLocation sideTexture = modLoc("block/example_texture_front");
        ResourceLocation frontTexture = modLoc("block/example_texture_front");

        // 创建一个简单的方块模型，每个面都使用相同的纹理。
        // 纹理必须位于assets/<namespace>/textures/block/<path>.png，
        // 其中<namespace>和<path>分别是方块的注册名的命名空间和路径。
        // 用于大多数（完整）方块，如木板、圆石或砖块。
        simpleBlock(block);
        // 接受要使用的模型文件的重载。
        simpleBlock(block, exampleModel);
        // 接受一个或多个（变量参数）ConfiguredModel对象的重载。
        // 有关ConfiguredModel的更多信息，请参见下文。
        simpleBlock(block, ConfiguredModel.builder().build());
        // 添加一个带有方块名称的物品模型文件，以给定的模型文件为父级，供方块物品使用。
        simpleBlockItem(block, exampleModel);
        // 调用#simpleBlock()（模型文件重载）和#simpleBlockItem的简写。
        simpleBlockWithItem(block, exampleModel);
        
        // 添加一个木材方块模型。需要两个纹理，位于assets/<namespace>/textures/block/<path>.png和
        // assets/<namespace>/textures/block/<path>_top.png，分别引用侧面和顶部纹理。
        // 请注意，这里的方块输入仅限于RotatedPillarBlock，这是原版木材使用的类。
        logBlock(block);
        // 类似于#logBlock，但纹理命名为<path>_side.png和<path>_end.png而不是
        // <path>.png和<path>_top.png。由石英柱和类似方块使用。
        // 有一个重载允许您指定不同的纹理基本名称，然后根据需要后缀为_side和_end，
        // 一个重载允许您指定两个资源位置
        // 为侧面和端部纹理，以及一个重载允许指定侧面和端部模型文件。
        axisBlock(block);
        // #logBlock和#axisBlock的变体，另外允

许指定渲染类型。
        // 有字符串和资源位置变体用于渲染类型，
        // 与#logBlock和#axisBlock的所有变体结合使用。
        logBlockWithRenderType(block, "minecraft:cutout");
        axisBlockWithRenderType(block, mcLoc("cutout_mipped"));
        
        // 指定一个具有侧面纹理、前面纹理和顶部纹理的水平可旋转方块模型。
        // 底部将使用侧面纹理。如果不需要前面或顶部纹理，
        // 只需传入侧面纹理两次。例如，用于熔炉和类似方块。
        horizontalBlock(block, sideTexture, frontTexture, topTexture);
        // 指定一个将根据需要旋转的模型文件的水平可旋转方块模型。
        // 有一个重载，而不是模型文件接受一个Function<BlockState, ModelFile>，
        // 允许不同的旋转使用不同的模型。例如，用于石切机。
        horizontalBlock(block, exampleModel);
        // 指定一个附着在面上的水平可旋转方块模型，例如按钮或拉杆。
        // 考虑到在地面和天花板上放置方块，并相应旋转它们。
        // 像#horizontalBlock一样，有一个重载接受一个Function<BlockState, ModelFile>。
        horizontalFaceBlock(block, exampleModel);
        // 类似于#horizontalBlock，但用于可向上和向下旋转的方块。
        // 同样，有一个重载接受一个Function<BlockState, ModelFile>。
        directionalBlock(block, exampleModel);
    }
}
```

另外，`BlockStateProvider`中存在以下常见方块模型的辅助方法：

- 楼梯
- 板条
- 按钮
- 压力板
- 标志
- 栅栏
- 栅栏门
- 墙
- 窗格
- 门
- 活板门

在某些情况下，方块状态不需要特殊处理，但模型需要。在这种情况下，可通过`BlockStateProvider#models()`访问的`BlockModelProvider`提供了一些额外的辅助方法，所有这些方法都接受第一个参数为名称，并且大多数与完整立方体有关。它们通常用作例如`simpleBlock`的模型文件参数。辅助方法包括支持`BlockStateProvider`中的方法，以及：

- `withExistingParent`: 前面已经提到，此方法返回一个带有给定父级的新模型构建器。父级必须已经存在或在模型之前创建。
- `getExistingFile`: 在模型提供者的`ExistingFileHelper`中执行查找，如果存在则返回相应的`ModelFile`，否则抛出`IllegalStateException`。
- `singleTexture`: 接受一个父级和一个纹理位置，返回一个带有给定父级的模型，并将纹理变量`texture`设置为给定的纹理位置。
- `sideBottomTop`: 接受一个父级和三个纹理位置，返回一个模型，其侧面、底部和顶部纹理设置为三个纹理位置。
- `cube`: 接受六个纹理资源位置，分别用于六个面，返回一个完整立方体模型，其六个面设置为六个纹理。
- `cubeAll`: 接受一个纹理位置，返回一个完整立方体模型，将给定纹理应用于所有六个面。如果愿意，可以将其视为`singleTexture`和`cube`的混合体。
- `cubeTop`: 接受两个纹理位置，返回一个完整立方体模型，第一个纹理

应用于侧面和底部，第二个纹理应用于顶部。
- `cubeBottomTop`: 接受三个纹理位置，返回一个完整立方体模型，其侧面、底部和顶部纹理设置为三个纹理位置。如果愿意，可以将其视为`cube`和`sideBottomTop`的混合体。
- `cubeColumn`和`cubeColumnHorizontal`: 接受两个纹理位置，返回一个“立立”或“横卧”的柱状立方体模型，其侧面和端部纹理设置为两个纹理位置。由`BlockStateProvider#logBlock`、`BlockStateProvider#axisBlock`及其变体使用。
- `orientable`: 接受三个纹理位置，返回一个带有“前面”纹理的立方体。这三个纹理位置分别是侧面、前面和顶部纹理。
- `orientableVertical`: `orientable`的变体，省略了顶部参数，改为使用侧面参数。
- `orientableWithBottom`: `orientable`的变体，其具有一个在前面和顶部参数之间的底部纹理的第四参数。
- `crop`: 接受一个纹理位置，返回一个带有给定纹理的类似作物的模型，如四种原版作物所使用的。
- `cross`: 接受一个纹理位置，返回一个带有给定纹理的十字模型，如花、树苗和许多其他植被方块所使用的。
- `torch`: 接受一个纹理位置，返回一个带有给定纹理的火把模型。
- `wall_torch`: 接受一个纹理位置，返回一个带有给定纹理的壁挂火把模型（壁挂火把是与立火把不同的方块）。
- `carpet`: 接受一个纹理位置，返回一个带有给定纹理的地毯模型。

最后，别忘了在事件中注册您的方块状态提供者：

```java
@SubscribeEvent
public static void gatherData(GatherDataEvent event) {
    DataGenerator generator = event.getGenerator();
    PackOutput output = generator.getPackOutput();
    ExistingFileHelper existingFileHelper = event.getExistingFileHelper();

    // 其他提供者在这里
    generator.addProvider(
            event.includeClient(),
            new MyBlockStateProvider(output, existingFileHelper)
    );
}
```

### `ConfiguredModel.Builder`

如果默认辅助工具不能满足您的需求，您也可以使用`ConfiguredModel.Builder`直接构建模型对象，然后在`VariantBlockStateBuilder`中使用它们构建`variants`块状态文件，或在`MultiPartBlockStateBuilder`中构建`multipart`块状态文件：

```java
// 创建一个ConfiguredModel.Builder。或者，您可以使用下面演示的方式之一
// (VariantBlockStateBuilder.PartialBlockstate#modelForState或MultiPartBlockStateBuilder#part)在适用的情况下。
ConfiguredModel.Builder<?> builder = ConfiguredModel.builder()
// 使用一个模型文件。如前所述，可以是ExistingModelFile、UncheckedModelFile，
// 或某种类型的ModelBuilder。参见上文了解如何使用ModelBuilder。
        .modelFile(models().withExistingParent("minecraft:block/cobblestone"))
        // 设置绕x轴和y轴的旋转。
        .rotationX(90)
        .rotationY(180)
        // 设置uv锁定。
        .uvlock(true)
        // 设置权重。
        .weight(5);
// 构建配置模型。返回类型是一个数组
// 以考虑同一块状态中可能有多个模型。
ConfiguredModel[] model = builder.build();

// 获取一个变体块状态构建器。
VariantBlockStateBuilder variantBuilder = getVariantBuilder(MyBlocksClass.EXAMPLE_BLOCK.get());
// 创建一个部分状态并设置属性。
VariantBlockStateBuilder.PartialBlockstate partialState = variantBuilder.partialState

();
// 为部分块状态添加一个或多个模型。模型是变量参数。
variantBuilder.addModels(partialState,
        // 至少指定一个ConfiguredModel.Builder，如上所见。通过#modelForState创建。
        partialState.modelForState()
                .modelFile(models().withExistingParent("minecraft:block/cobblestone"))
                .uvlock(true)
);
// 或者，forAllStates(Function<BlockState, ConfiguredModel[]>)为每个可能的状态创建一个模型。
// 传递的函数将为每个可能的状态调用一次。
variantBuilder.forAllStates(state -> {
    // 根据状态的属性返回一个ConfiguredModel。
    // 例如，以下代码将根据方块的水平旋转旋转模型。
    return ConfiguredModel.builder()
            .modelFile(models().withExistingParent("minecraft:block/cobblestone"))
            .rotationY((int) state.getValue(BlockStateProperties.HORIZONTAL_FACING).toYRot())
            .build();
});

// 获取一个多部分块状态构建器。
MultiPartBlockStateBuilder multipartBuilder = getMultipartBuilder(MyBlocksClass.EXAMPLE_BLOCK.get());
// 添加一个新部分。从.part()开始，以.end()结束。
multipartBuilder.addPart(multipartBuilder.part()
        // 步骤一：构建模型。multipartBuilder.part()返回一个ConfiguredModel.Builder，
        // 意味着上面看到的所有方法都可以在这里使用。
        .modelFile("minecraft:block/cobblestone")
        // 调用.addModel()。现在模型已构建，我们可以进入步骤二：添加部分数据。
        .addModel()
        // 为部分添加条件。需要一个属性
        // 和至少一个属性值；属性值是变量参数。
        .condition(BlockStateProperties.FACING, Direction.NORTH, Direction.SOUTH)
        // 将多部分条件设置为或运算而不是默认的与运算。
        .useOr()
        // 创建一个嵌套条件组。
        .nestedGroup()
        // 向嵌套组添加一个条件。
        .condition(BlockStateProperties.FACING, Direction.NORTH)
        // 仅将这个条件组设置为或运算而不是与运算。
        .useOr()
        // 创建另一个嵌套条件组。嵌套组的数量没有限制。
        .nestedGroup()
        // 结束嵌套条件组，返回到拥有的部分构建器或条件组级别。
        // 这里调用两次，因为我们当前有两个嵌套组。
        .endNestedGroup()
        .endNestedGroup()
        // 结束部分构建器并将生成的部分添加到多部分构建器中。
        .end()
);
```

## 物品模型数据生成

生成物品模型相对简单得多，这主要是因为我们直接在`ItemModelProvider`上操作，而不是使用像`BlockStateProvider`这样的中间类，这当然是因为物品模型没有与方块状态文件等价的文件，而是直接使用。

与上面类似，我们创建一个类并让它扩展基础提供者，在这种情况下是`ItemModelProvider`。由于我们直接在`ModelProvider`的子类中，所有的`models()`调用都变成了`this`（或被省略）。

```java
public class MyItemModelProvider extends ItemModelProvider {
    public MyItemModelProvider(PackOutput output, ExistingFileHelper existingFileHelper) {
        super(output, "examplemod", existingFileHelper);
    }
    
    @Override
    protected void registerModels() {
        // 方块物品通常使用其相应的方块模型作为父级。
        withExistingParent(MyItemsClass.EXAMPLE_BLOCK_ITEM.get(), modLoc("block/example_block"));
        // 物品通常使用一个简单的父级和一个纹理。最常见的父级是item/generated和item/handheld。
        // 在这个例子中，物品纹理位于assets/examplemod/textures/item/example_item.png。
        // 如果您想要一个更复杂的模型，您可以使用 getBuilder()，然后从中进行工作，就像使用块模型一样。
         withExistingParent(MyItemsClass.EXAMPLE_ITEM.get(), mcLoc("item/ generated")).texture("layer0", "item/example_item");
        // 上面的行很常见，因此有一个快捷方式。 请注意项目注册表名称和
        // 相对于纹理/项目的纹理路径必须匹配。
        basicItem(MyItemsClass.EXAMPLE_ITEM.get());
    }
}
```

与所有数据提供者一样，不要忘记将您的提供者注册到该事件：

```java
@SubscribeEvent
public static void gatherData(GatherDataEvent event) {
    DataGenerator generator = event.getGenerator();
    PackOutput output = generator.getPackOutput();
    ExistingFileHelper existingFileHelper = event.getExistingFileHelper();

    // other providers here
    generator.addProvider(
            event.includeClient(),
            new MyItemModelProvider(output, existingFileHelper)
    );
}
```

[ao]: https://en.wikipedia.org/wiki/Ambient_occlusion
[blockbench]: https://www.blockbench.net
[custommodelloader]: modelloaders.md#datagen
[datagen]: ../../index.md#data-generation
[elements]: index.md#elements
