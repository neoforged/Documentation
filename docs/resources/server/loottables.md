战利品表 (Loot Tables)
===========

战利品表是控制在不同动作或场景发生时应该发生什么的逻辑文件。虽然原版系统纯粹与物品生成有关，但这个系统可以扩展以执行任意数量的定义动作。

数据驱动的表
------------------

原版中的大多数战利品表都是通过JSON数据驱动的。这意味着创建一个新的战利品表不需要模组，只需要一个[数据包][datapack]。有关如何创建这些战利品表并将它们放入模组的`resources`文件夹的完整列表可以在[Minecraft Wiki][wiki]上找到。

使用战利品表
------------------

战利品表通过其`ResourceLocation`引用，它指向`data/<namespace>/loot_tables/<path>.json`。可以使用`LootDataResolver#getLootTable`获取与引用相关联的`LootTable`，其中`LootDataResolver`可以通过`MinecraftServer#getLootData`获得。

战利品表总是带有给定的参数生成的。`LootParams`包含生成表的等级、用于更好生成的幸运值、定义场景上下文的`LootContextParam`，以及在激活时应进行的任何动态信息。`LootParams`可以使用`LootParams$Builder`构造器的构造函数创建，并通过向`LootParams$Builder#create`传入`LootContextParamSet`构建。

战利品表也可能有一些上下文。`LootContext`接受构建的`LootParams`，并可以设置一些随机种子实例。上下文是通过构建器`LootContext$Builder`创建的，并通过向`LootContext$Builder#create`传入一个可为空的`ResourceLocation`来构建，代表要使用的随机实例。

`LootTable`可以使用可用的方法之一生成`ItemStack`，这些方法可能接受`LootParams`或`LootContext`：

方法                    | 描述
:---:                   | :---
`getRandomItemsRaw`     | 消费战利品表生成的物品。
`getRandomItems`        | 返回战利品表生成的物品。
`fill`                  | 用生成的战利品填充一个容器。

:::note
战利品表是为生成物品而构建的，所以这些方法期望对`ItemStack`进行一些处理。
:::

额外功能
-------------------

Forge为战利品表提供了一些额外的行为，以更好地控制系统。

### `LootTableLoadEvent`

`LootTableLoadEvent`是在Forge事件总线上触发的一个[事件]，每当一个战利品表被加载时就会触发。如果事件被取消，则将加载一个空的战利品表。

:::info
不要通过这个事件修改战利品表的掉落。这些修改应该使用[全局战利品修改器][glm]来完成。
:::

### 战利品池名称

可以使用`name`键命名战利品池。任何未命名的战利品池将以`custom#`为前缀，后面跟着池的哈希码。

```js
// For some loot pool
{
  "name": "example_pool", // Pool will be named 'example_pool'
  "rolls": {
    // ...
  },
  "entries": {
    // ...
  }
}
```

### 掠夺修饰符

现在，战利品表除了掠夺附魔以外，还受到Forge事件总线上的`LootingLevelEvent`的影响。

### 额外的上下文参数

Forge扩展了某些参数集来考虑可能适用的缺失上下文。`LootContextParamSets#CHEST`现在允许使用`LootContextParams#KILLER_ENTITY`，因为宝藏矿车是可以被破坏（或“杀死”）的实体。`LootContextParamSets#FISHING`也允许使用`LootContextParams#KILLER_ENTITY`，因为钓鱼钩也是一个实体，当玩家收回它时，它被收回（或“杀死”）。

### 多项物品熔炼

使用`SmeltItemFunction`时，熔炼的配方现在会返回结果中的实际物品数量，而不是单个熔炼物品（例如，如果熔炼配方返回3个物品，而且有3个掉落，那么结果将是9个熔炼物品，而不是3个）。

### 战利品表ID条件

Forge添加了一个额外的`LootItemCondition`，它允许某些物品为特定表生成。这通常在[全局战利品修改器][glm]中使用。
```js
// In some loot pool or pool entry
{
  "conditions": [
    {
      "condition": "forge:loot_table_id",
      // Will apply when the loot table is for dirt
      "loot_table_id": "minecraft:blocks/dirt"
    }
  ]
}
```

### 工具是否能执行动作条件

Forge添加了一个额外的`LootItemCondition`，用于检查给定的`LootContextParams#TOOL`是否能执行指定的`ToolAction`。这允许战利品表更精确地根据玩家使用的工具来调整掉落物，不仅限于工具的类型，还包括其能够执行的动作，例如挖掘、砍伐等。

```js
// In some loot pool or pool entry
{
  "conditions": [
    {
      "condition": "forge:can_tool_perform_action",
      // Will apply when the tool can strip a log like an axe
      "action": "axe_strip"
    }
  ]
}
```

[datapack]: https://minecraft.wiki/w/Data_pack
[wiki]: https://minecraft.wiki/w/Loot_table
[event]: ../../concepts/events.md#registering-an-event-handler
[glm]: ./glm.md
