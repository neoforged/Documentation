部分可见度
=========

在模型JSON的顶层添加`visibility`条目可以控制模型不同部分的可见性，以决定是否应将它们烘焙到最终的[`BakedModel`][bakedmodel]中。“零件”的定义取决于加载此模型的模型加载器，自定义模型加载器可以完全忽略此条目。在Forge提供的模型加载器中，只有[复合模型加载器][composite]和[OBJ模型加载器][obj]使用了此功能。可见性条目被指定为`"part name": boolean`条目。

具有两个部分的复合模型的示例，其中第二个部分不会烘焙到最终模型中，并且两个子模型覆盖此可见性，分别只显示第一个部分和两个部分：
```js
// mycompositemodel.json
{
  "loader": "forge:composite",
  "children": {
    "part_one": {
      "parent": "mymod:mypartmodel_one"
    },
    "part_two": {
      "parent": "mymod:mypartmodel_two"
    }
  },
  "visibility": {
    "part_two": false
  }
}

// mycompositechild_one.json
{
  "parent": "mymod:mycompositemodel",
  "visibility": {
    "part_one": false,
    "part_two": true
  }
}

// mycompositechild_two.json
{
  "parent": "mymod:mycompositemodel",
  "visibility": {
    "part_two": true
  }
}
```

给定部分的可见性是通过检查模型是否指定了该部分的可见性来确定的，如果不存在，则递归地检查模型的父级，直到找到条目或没有其他父级要检查，在这种情况下，它默认为true。

这允许进行以下设置，其中多个模型使用单个复合模型的不同部分：

1. 复合模型指定多个组件
2. 多个模型将此复合模型指定为其父模型
3. 这些子模型分别指定部分的不同可见性

[bakedmodel]: ../modelloaders/bakedmodel.md
[composite]: ../modelloaders/index.md/#composite-models
[obj]: ../modelloaders/index.md/#wavefront-obj-models