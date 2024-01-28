# Built-in Data Maps
NeoForge provides a few data maps that mostly replace hardcoded in-code vanilla maps.  
These dats maps can be found in `NeoForgeDataMaps`, and are always *optional* to ensure compatibility with vanilla clients.

## `neoforge:compostables`
NeoForge provides a data map that allows configuring composter values, as a replacement for `ComposterBlock#COMPOSTABLES` (which is now ignored).  
This data map is located at `neoforged/data_maps/item/compostables.json` and its objects have the following structure:
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