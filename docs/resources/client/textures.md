# 纹理

Minecraft中的所有纹理都是PNG文件，位于命名空间的`textures`文件夹内。不支持JPG、GIF和其他图像格式。指向纹理的[资源位置][rl]的路径通常相对于`textures`文件夹，所以例如，资源位置`examplemod:block/example_block`指的是`assets/examplemod/textures/block/example_block.png`路径的纹理文件。

纹理的大小通常应该是2的幂，例如16x16或32x32。与旧版本不同，现代Minecraft本身就支持大于16x16的方块和物品纹理大小。对于那些你自己渲染出来的不是2的幂的纹理（例如GUI背景），可以在下一可用的2的幂大小（通常是256x256）创建一个空文件，然后在该文件的左上角添加你的纹理，让文件的其余部分保持空白。然后，可以在使用该纹理的代码中设置实际的纹理大小。

## 纹理元数据

纹理元数据可以在一个与纹理完全同名的文件中指定，但需要添加一个`.mcmeta`后缀。例如，位于`textures/block/example.png`的动画纹理需要一个伴随的`textures/block/example.png.mcmeta`文件。`.mcmeta`文件有以下格式（所有的都是可选的）：

```json5
{
  // Whether the texture will be blurred if needed. Defaults to false.
  // Currently specified by the codec, but unused otherwise both in the files and in code.
  "blur": true,
  // Whether the texture will be clamped if needed. Defaults to false.
  // Currently specified by the codec, but unused otherwise both in the files and in code.
  "clamp": true,
  "gui": {
    // Specifies how the texture will be scaled if needed. Can be one of these three:
    "scaling": "stretch", // default
    "scaling": {
      "tile": {
        "width": 16,
        "height": 16
      }
    },
    "scaling": {
      // Like "tile", but allows specifying the border offsets.
      "nine_slice": {
        "width": 16,
        "height": 16,
        // May also be a single int that is used as the value for all four sides.
        "border": {
          "left": 0,
          "top": 0,
          "right": 0,
          "bottom": 0
        }
      }
    }
  },
  // See below.
  "animation": {}
}
```

## 动画纹理

Minecraft本身支持方块和物品的动画纹理。动画纹理由一个纹理文件组成，不同的动画阶段位于彼此的下方（例如，一个带有8个阶段的动画16x16纹理将通过一个16x128的PNG文件表示）。

为了确实被动画化而不仅仅是显示为扭曲的纹理，纹理元数据中必须有一个`animation`对象。子对象可以是空的，但可以包含以下可选条目：

```json5
{
  "animation": {
    // A custom order in which the frames are played. If omitted, the frames are played top to bottom.
    "frames": [1, 0],
    // How long one frame stays before switching to the next animation stage, in frames. Defaults to 1.
    "frametime": 5,
    // Whether to interpolate between animation stages. Defaults to false.
    "interpolate": true,
    // Width and height of one animation stage. If omitted, uses the texture width for both of these.
    "width": 12,
    "height": 12
  }
}
```

[rl]: ../../misc/resourcelocation.md
