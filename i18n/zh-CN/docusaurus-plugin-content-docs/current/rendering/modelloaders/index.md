自定义模型加载器
===============

“模型”只是一种形状。它可以是一个简单的立方体，可以是几个立方体，也可以是截角二十面体，或者介于两者之间的任何东西。你将看到的大多数模型都是普通的JSON格式。其他格式的模型在运行时由`IGeometryLoader`加载到`IUnbakedGeometry`中。Forge为WaveFront OBJ文件、bucket、复合模型、不同渲染层中的模型提供了默认实现，并重新实现了原版的`builtin/generated`物品模型。大多数事情都不关心加载了什么模型或模型的格式，因为它们最终都由代码中的`BakedModel`表示。

:::danger
    通过模型JSON中的顶级`loader`条目指定自定义模型加载程序将导致`elements`条目被忽略，除非它被自定义加载程序使用。所有其他普通条目仍将被加载并在未烘焙的`BlockModel`表示中可用，并且可能在自定义加载程序之外被使用。
:::

WaveFront OBJ模型
-----------------

Forge为`.obj`文件格式添加了一个加载程序。要使用这些模型，JSON必须引用`forge:obj`加载程序。此加载程序接受位于已注册命名空间中且路径以`.obj`结尾的任何模型位置。`.mtl`文件应放置在与要自动使用的`.obj`具有相同名称的相同位置。`.mtl`文件可能需要手动编辑才能更改指向JSON中定义的纹理的路径。此外，纹理的V轴可以根据创建模型的外部程序翻转（即，V=0可能是底部边缘，而不是顶部边缘）。这可以在建模程序本身中纠正，也可以在模型JSON中这样做：

```js
{
  // 在与'model'声明相同的级别上添加以下行
  "loader": "forge:obj",
  "flip_v": true,
  "model": "examplemod:models/block/model.obj",
  "textures": {
    // 可在.mtl中用#texture0引用
    "texture0": "minecraft:block/dirt",
    "particle": "minecraft:block/dirt"
  }
}
```
