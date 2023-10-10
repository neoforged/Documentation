面数据
======

在原版的“元素”模型中，可以在元素级别或面级别指定有关元素面的附加数据。未指定自己的面数据的面将返回到元素的面数据，或者如果在元素级别未指定面数据，则返回到默认值。

要将此扩展用于生成的物品模型，必须通过`forge:item_layers`模型加载程序加载该模型，因为原版物品模型生成器没有扩展为读取此附加数据。

面数据的全部值都是可选的。

元素模型
--------

在原版的“元素”模型中，面数据应用于指定它的面，或者指定它的元素中没有自己的面数据的所有面。

:::caution
    如果在面上指定了`forge_data`，它将不会继承元素级`forge_data`声明中的任何参数。
:::

可以通过本例中展示的两种方式指定附加数据：
```js
{
  "elements": [
    {
      "forge_data": {
        "color": "0xFFFF0000",
        "block_light": 15,
        "sky_light": 15,
        "ambient_occlusion": false
      },
      "faces": {
        "north": {
          "forge_data": {
            "color": "0xFFFF0000",
            "block_light": 15,
            "sky_light": 15,
            "ambient_occlusion": false
          },
          // ...
        },
        // ...
      },
      // ...
    }
  ]
}
```

生成的物品模型
-------------

在使用`forge:item_layers`加载程序生成的物品模型中，为每个纹理层指定面数据，并应用于所有几何体（前/后向四边形和边四边形）。

`forge_data`字段必须位于模型JSON的顶层，每个键值对将人脸数据对象与层索引相关联。

在以下示例中，层1将着色为红色并以全亮度发光：
```js
{
  "textures": {
    "layer0": "minecraft:item/stick",
    "layer1": "minecraft:item/glowstone_dust"
  },
  "forge_data": {
    "1": {
      "color": "0xFFFF0000",
      "block_light": 15,
      "sky_light": 15,
      "ambient_occlusion": false
    }
  }
}
```

参数
----

### 颜色

使用`color`条目指定颜色值将该颜色作为色调应用于四边形。默认值为`0xFFFFFFFF`（白色，完全不透明）。颜色必须是压缩为32位整数的`ARGB`格式，并且可以指定为十六进制字符串（`"0xAARRGGBB"`）或十进制整数文字（JSON不支持十六进制整数文字）。

:::danger
    四种颜色分量与纹理的像素相乘。省略alpha分量相当于将其设为0，这将使几何体完全透明。
:::

如果颜色值为常量，则可以用[`BlockColor`和`ItemColor`][tinting]替换着色。

### 方块亮度和天空亮度

分别使用`block_light`和`sky_light`条目指定方块和/或天空的亮度值将覆盖四边形的相应亮度值。两个值都默认为0。这些值必须在0-15（包括0-15）的范围内，并且在渲染面时被视为相应光照类型的最小值，这意味着相应光照类型在世界中的较高值将覆盖指定值。

指定的亮度值纯粹是客户端的，既不影响服务器的亮度级别，也不影响周围方块的亮度。

### 环境光遮挡

指定`ambient_occlusion`标志将为四边形配置[环境光遮挡（AO）][AO]。默认为`true`。该标志的行为相当于原版格式的顶级`ambientocclusion`标志。

![环境光遮挡的效果][ao_img]  
*环境光遮挡在左侧启用，在右侧禁用，通过“平滑光照”图形设置演示*

:::caution
    如果顶级AO标志设置为false，则在元素或面上将该标志指定为true将无法覆盖顶级标志。
    ```js
    {
      "ambientocclusion": false,
      "elements": [
        {
          "forge_data": {
            "ambient_occlusion": true // 无效
          }
        }
      ]
    }
    ```
:::

[tinting]: ../../resources/client/models/tinting.md
[AO]: https://en.wikipedia.org/wiki/Ambient_occlusion
[ao_img]: ./ambientocclusion_annotated.png