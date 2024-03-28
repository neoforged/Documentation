物品重载（`ItemOverrides`）
==========================

`ItemOverrides`为[`BakedModel`][baked]提供了一种处理`ItemStack`状态并返回新`BakedModel`的方法；此后，返回的模型将替换旧模型。`ItemOverrides`表示任意函数`(BakedModel, ItemStack, ClientLevel, LivingEntity, int)` → `BakedModel`，使其适用于动态模型。在原版中，它用于实现物品属性重写。

### `ItemOverrides()`

给定`ItemOverride`的列表，该构造函数将复制并烘焙该列表。可以使用`#getOverrides`访问烘焙后的覆盖。

### `resolve`

这需要一个`BakedModel`、`ItemStack`、`ClientLevel`、`LivingEntity`和`int`来生成另一个用于渲染的`BakedModel`。这是模型可以处理其物品状态的地方。

这不应该改变存档。

### `getOverrides`

返回一个不可变列表，该列表包含此`ItemOverrides`使用的所有[`BakedOverride`][override]。如果不适用，则返回空列表。

## `BakedOverride`

这个类表示一个原版的物品覆盖，它为一个物品和一个模型的属性保存了几个`ItemOverrides$PropertyMatcher`，以备满足这些匹配器时使用。它们是原版物品JSON模型的`overrides`数组中的对象：

```js
{
  // 在一个原版JSON物品模型内
  "overrides": [
    {
      // 这是一个ItemOverride
      "predicate": {
        // 这是Map<ResourceLocation, Float>，包含属性的名称以及它们的最小值
        "example1:prop": 0.5
      },
      // 这是该覆盖的'location'或目标模型，如果上面的predicate匹配，则使用它
      "model": "example1:item/model"
    },
    {
      // 这是另一个ItemOverride
      "predicate": {
        "example2:prop": 1
      },
      "model": "example2:item/model"
    }
  ]
}
```

[baked]: ./bakedmodel.md
[override]: #bakedoverride
