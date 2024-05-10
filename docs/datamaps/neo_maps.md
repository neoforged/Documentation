# 内置数据映射

NeoForge 提供了一些数据映射，这些映射主要取代硬编码的代码内普通映射。
这些数据映射可以在 `NeoForgeDataMaps` 中找到，并且始终是*可选的*以确保与普通客户端的兼容性。

## `neoforge:compostables`

NeoForge 提供了一个允许配置 Composter 值的数据映射，作为`ComposterBlock#COMPOSTABLES`（现在已被忽略）的替代品。
该数据映射位于`neoforge/data_maps/item/compostables.json`，其对象具有以下结构：

```js
{
    // A 0 to 1 (inclusive) float representing the chance that the item will update the level of the composter
    "chance": 1
}
```

Example:

```js
{
    "values": {
        // Give acacia logs a 50% chance that they will fill a composter
        "minecraft:acacia_log": {
            "chance": 0.5
        }
    }
}
```

## `neoforge:furnace_fuels`

NeoForge 提供了一个数据映射，允许配置物品的燃烧时间。
该数据图位于`neoforge/data_maps/item/furnace_fuels.json`，其对象具有以下结构：

```js
{
    // A positive integer representing the item's burn time, in ticks
    "burn_time": 1000
}
```

Example:

```js
{
    "values": {
        // Give anvils a 2 seconds burn time
        "minecraft:anvil": {
            "burn_time": 40
        }
    }
}
```

:::note
其他像 `IItemExtension#getBurnTime` 这样的内部代码方法将优先于数据映射，所以建议您在您的mod中使用数据映射来设置简单、静态的燃烧时间，这样用户可以按照他们的需求进行配置。
:::

:::warning

原版游戏为 `minecraft:logs` 和 `minecraft:planks` 标签中的原木和木板添加了燃烧时间。但是，这些标签也包含了下界木材，因此添加了对 `#minecraft:non_flammable_wood` 中元素的移除。 然而，这种移除不会影响其他数据包或模组添加的任何值，所以如果您想改变木材标签的值，您需要自己添加对不可燃木材标签的移除。 

:::

## `neoforge:monster_room_mobs`

NeoForge provides a data map that allows configuring the mobs which may appear in the mob spawner in a monster room, as a replacement for `MonsterRoomFeature#MOBS` (which is now ignored). This data map is located at `neoforge/data_maps/entity_type/monster_room_mobs.json` and its objects have the following structure:

```json5
{
    // The weight of this mob, relative to other mobs in the datamap
    "weight": 100
}
```

Example:

```json5
{
    "values": {
        // Make squids appear in monster room spawners with a weight of 100
        "minecraft:squid": {
            "weight": 100
        }
    }
}
```

## `neoforge:parrot_imitations`

NeoForge 提供了一个数据映射，允许配置鹦鹉在模仿怪物时产生的声音，这可以替代 `Parrot#MOB_SOUND_MAP`（现在已被忽视）。这个数据映射位于 `neoforge/data_maps/entity_type/parrot_imitations.json`，其对象具有以下结构：

```js
{
    // The ID of the sound that parrots will produce when imitating the mob
    "sound": "minecraft:entity.parrot.imitate.creeper"
}
```

Example:

```js
{
    "values": {
        // Make parrots produce the ambient cave sound when imitating allays
        "minecraft:allay": {
            "sound": "minecraft:ambient.cave"
        }
    }
}
```

## `neoforge:raid_hero_gifts`

NeoForge 提供了一个数据映射，允许配置如果你阻止了突袭，具有某个 `VillagerProfession` 的村民可能会赠送给你的礼物，这将替代 `GiveGiftToHero#GIFTS`（现在已经被忽略了）。这个数据映射位于 `neoforge/data_maps/villager_profession/raid_hero_gifts.json`，其对象具有以下结构：

```js
{
    "values": {
         "minecraft:armorer": {
            // Make armorers give the raid hero the armorer gift loot table
            "loot_table": "minecraft:gameplay/hero_of_the_village/armorer_gift"
        },
    }
}
```

## `neoforge:vibration_frequencies`

NeoForge 提供了一个数据映射，允许配置游戏事件发出的潜影贝探头频率，这将替代 `VibrationSystem#VIBRATION_FREQUENCY_FOR_EVENT`（现在已经被忽视了）。这个数据映射位于 `neoforge/data_maps/game_event/vibration_frequencies.json`，其对象具有以下结构：

```js
{
    // An integer between 1 and 15 (inclusive) that indicates the vibration frequency of the event
    "frequency": 2
}
```

Example:

```js
{
    "values": {
        // Make the splash in water game event vibrate on the second frequency
        "minecraft:splash": {
            "frequency": 2
        }
    }
}
```

