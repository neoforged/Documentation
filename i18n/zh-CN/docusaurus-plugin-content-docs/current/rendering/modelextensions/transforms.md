根变换
======

在模型JSON的顶层添加`transform`条目向加载器建议，在方块模型的情况下，应在[方块状态][blockstate]文件中的旋转之前对所有几何体应用变换，在物品模型的情况中，应在[显示变换][displaytransform]之前对其应用变换。转换可通过`IUnbakedGeometry#bake()`中的`IGeometryBakingContext#getRootTransform()`获得。

自定义模型加载器可能会完全忽略此字段。

根变换可以用两种格式指定：

1. 一个JSON对象，包含一个奇异的`matrix`条目，该条目包含一个嵌套JSON数组形式的原始转换矩阵，省略了最后一行（3*4矩阵，行主序）。矩阵是按平移、左旋转、缩放、右旋转和变换原点的顺序组成的。结构示例：
    ```js
    "transform": {
        "matrix": [
            [ 0, 0, 0, 0 ],
            [ 0, 0, 0, 0 ],
            [ 0, 0, 0, 0 ]
        ]
    }
    ```
2. 一个JSON对象，包含以下可选项的任意组合：
    * `origin`：用于旋转和缩放的原点
    * `translation`：相对平移
    * `rotation`或`left_rotation`：在缩放之前围绕要应用的平移原点旋转
    * `scale`：相对于平移原点的比例
    * `right_rotation`或`post_rotation`：在缩放之后要应用的围绕平移原点的旋转

元素的指定
---------

如果转换被指定为选项4中提到的条目的组合，则这些条目将按照`translation`、`left_rotation`、`scale`、`right_rotation`的顺序应用。
转换将移动到指定的原点，作为最后一步。

```js
{
    "transform": {
        "origin": "center",
        "translation": [ 0, 0.5, 0 ],
        "rotation": { "y": 45 }
    },
    // ...
}
```

这些元素的定义应为如下：

### 原点

原点可以指定为表示三维矢量的3个浮点数的数组：`[ x, y, z ]`，也可以指定为三个默认值之一：

* `"corner"` (0, 0, 0)
* `"center"` (.5, .5, .5)
* `"opposing-corner"` (1, 1, 1)

如果未指定原点，则其默认为`"opposing-corner"`。

### 平移

平移必须指定为表示三维矢量的3个浮点数的数组：`[ x, y, z ]`，如果不存在，则默认为(0, 0, 0)。

### 左旋转和右旋转

可以通过以下四种方式中的任何一种指定旋转：

* 具有单轴=>旋转度映射的单个JSON对象：`{ "x": 90 }`
* 具有上述格式的任意数量的JSON对象的数组（按指定顺序应用）：`[ { "x": 90 }, { "y": 45 }, { "x": -22.5 } ]`
* 由3个浮点数组成的数组，指定围绕每个轴的旋转（以度为单位）：`[ 90, 180, 45 ]`
* 直接指定四元数的4个浮点数的数组：`[ 0.38268346, 0, 0, 0.9238795 ]`（示例等于绕X轴45度）

如果未指定相应的旋转，则默认为无旋转。

### 比例

比例必须指定为表示三维矢量的3个浮点数的数组：`[ x, y, z ]`，如果不存在，则默认为(1, 1, 1)。

[blockstate]: https://minecraft.wiki/w/Tutorials/Models#Block_states
[displaytransform]: ../modelloaders/transform.md