战利品表
=======

战利品表是逻辑文件，它规定了当发生各种操作或场景时应该发生什么。尽管原版系统纯粹处理物品生成，但该系统可以扩展为执行任意数量的预定义操作。

由数据驱动的表
-------------

原版中的大多数战利品表都是通过JSON进行数据驱动的。这意味着模组不需要创建新的战利品表，只需要[数据包][datapack]。关于如何在模组的`resources`文件夹中创建和放置这些战利品表的完整列表可以在[Minecraft Wiki][wiki]上找到。

使用战利品表
-----------

战利品表由其指向`data/<namespace>/loot_tables/<path>.json`的`ResourceLocation`引用。与引用相关联的`LootTable`可以使用`LootDataResolver#getLootTable`获得，其中`LootDataResolver`可以通过`MinecraftServer#getLootData`获得。

战利品表总是使用给定的参数生成的。`LootParams`包含表的生成存档、特定的随机化器和种子（如果需要）、更好生成的运气、定义场景上下文的`LootContextParam`以及激活时应出现的任何动态信息。可以使用`LootParams$Builder`生成器的构造函数创建`LootParams`，并通过传递`LootContextParamSet`通过`LootParams$Builder#create`构建`LootParams`。

战利品表也可能有一些上下文。`LootContext`接受已构建的`LootParams`，并可以设置一些随机种子实例。上下文是通过生成器`LootContext$Builder`创建的，并使用`LootContext$Builder#create`通过传递表示要使用的随机实例的可为null的`ResourceLocation`来构建。

`LootTable`可用于使用以下可用方法之一生成`ItemStack`，其可能接受一个`LootParams`或一个`LootContext`：

方法                | 描述
:---:               | :---
`getRandomItemsRaw` | 消耗由战利品表生成的物品。
`getRandomItems`    | 返回由战利品表生成的物品。
`fill`              | 用已生成的战利品表填充容器。

:::caution
    战利品表是为生成物品而构建的，因此这些方法需要对`ItemStack`进行一些处理。
:::

附加特性
-------

Forge为战利品表提供了一些额外的行为，以更好地控制系统。

### `LootTableLoadEvent`

`LootTableLoadEvent`是在Forge事件总线上触发的[事件][event]，每当加载战利品表时就会触发。如果事件被取消，则会加载一个空的战利品表。

!!! 重要
    **不要**通过此事件修改战利品表的掉落。这些修改应该使用[全局战利品修改器][glm]来完成。

### 战利品池名称

Loot pools can be named using the `name` key. Any non-named loot pool will be the hash code of the pool prefixed by `custom#`.
可以使用`name`键对战利品池进行命名。任何未命名的战利品池都将是以`custom#`为前缀的池的哈希代码。

```js
// 对于某个战利品池
{
  "name": "example_pool", // 战利品池将被命名为'example_pool'
  "rolls": {
    // ...
  },
  "entries": {
    // ...
  }
}
```

### 抢夺修改器

战利品表现在除了受到抢夺附魔的影响外，还受到Forge事件总线上的`LootingLevelEvent`的影响。

### 附加的上下文参数

Forge扩展了某些参数集，以解决可能适用的缺失上下文。`LootContextParamSets#CHEST`现在允许使用`LootContextParams#KILLER_ENTITY`，因为箱子矿车是可以被破坏（或“杀死”）的实体。`LootContextParamSets#FISHING`还允许`LootContextParams#KILLER_ENTITY`，因为鱼钩也是一个实体，当玩家取回它时会收回（或“杀死”）。

### 熔炼时的多个物品

当使用`SmeltItemFunction`时，熔炼配方现在将返回结果中的实际物品数，而不是单个熔炼物品（例如，如果熔炼配方返回3个物品，并且有3次掉落，则结果将是9个熔炼物品，而不是3个）。

### 战利品表Id条件

Forge添加了一个额外的`LootItemCondition`，允许为特定的表生成某些物品。这通常用于[全局战利品修改器][glm]。

```js
// 在某个战利品池或池条目中
{
  "conditions": [
    {
      "condition": "forge:loot_table_id",
      // 当该战利品表对于泥土时将适用
      "loot_table_id": "minecraft:blocks/dirt"
    }
  ]
}
```

### “工具能否执行操作”条件

Forge添加了一个额外的`LootItemCondition`，用于检查给定的`LootContextParams#TOOL`是否可以执行指定的`ToolAction`。

```js
// 在某个战利品池或池条目中
{
  "conditions": [
    {
      "condition": "forge:can_tool_perform_action",
      // 当该工具可以像斧一样剥下原木时将适用
      "action": "axe_strip"
    }
  ]
}
```

[datapack]: https://minecraft.wiki/w/Data_pack
[wiki]: https://minecraft.wiki/w/Loot_table
[event]: ../../concepts/events.md#creating-an-event-handler
[glm]: ./glm.md
