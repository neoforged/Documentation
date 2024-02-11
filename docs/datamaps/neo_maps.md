# Built-in Data Maps
NeoForge provides a few data maps that mostly replace hardcoded in-code vanilla maps.  
These data maps can be found in `NeoForgeDataMaps`, and are always *optional* to ensure compatibility with vanilla clients.

## `neoforge:compostables`
NeoForge provides a data map that allows configuring composter values, as a replacement for `ComposterBlock#COMPOSTABLES` (which is now ignored).  
This data map is located at `neoforge/data_maps/item/compostables.json` and its objects have the following structure:
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

## `neoforge:furnace_fuels`
NeoForge provides a data map that allows configuring item burn times.  
This data map is located at `neoforge/data_maps/item/furnace_fuels.json` and its objects have the following structure:
```js
{
    // A positive integer representing the item's burn time, in ticks
    "burn_time": 1000
}
```

:::note
Other in-code methods like `IItemExtension#getBurnTime` will take priority over the data map, so it is recommended that you use the data map for simple, static burn times even in your mod so that users can configure them.
:::

:::warning
Vanilla adds a burn time to logs and planks in the `minecraft:logs` and `minecraft:planks` tag. However, that tag also contains Nether wood, so a removal for elements in `#minecraft:non_flammable_wood` is added.  
However, the removal does not affect any values added by other packs or mods, so if you want to change the values for the wood tags you will need to add a removal for the non flammable tag yourself.
:::

## `neoforge:parrot_imitations`
NeoForge provides a data map that allows configuring the sounds produced by parrot when they want to imitate a mob, as a replacement for `Parrot#MOB_SOUND_MAP` (which is now ignored).  
This data map is located at `neoforge/data_maps/entity_type/parrot_imitations.json` and its objects have the following structure:
```js
{
    // The ID of the sound that parrots will produce when imitating the mob
    "sound": "minecraft:entity.parrot.imitate.creeper"
}
```

## `neoforge:vibration_frequencies`
NeoForge provides a data map that allows configuring the shulker vibration frequencies emmited by game events, as a replacement for `VibrationSystem#VIBRATION_FREQUENCY_FOR_EVENT` (which is now ignored).  
This data map is located at `neoforge/data_maps/game_event/vibration_frequencies.json` and its objects have the following structure:
```js
{
    // An integer between 1 and 15 (inclusive) that indicates the vibration frequency of the event
    "frequency": 2
}
```