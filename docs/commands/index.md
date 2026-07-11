# Commands

Commands are text-based actions triggered from chat by prefixing a message with a slash (`/`), from the server console, from command blocks, or from [functions]. A command performs some effect in the game, such as modifying the world, querying state, or exposing debug utilities. A mod can define its own commands to run dynamic actions when invoked.

Command definitions are hierarchical. Minecraft builds commands on Mojang's [Brigadier] library, which models each command as a tree of nodes rooted at a dispatcher. A **literal** node matches a fixed keyword, such as `mymod` or `reload` in `/mymod reload`; an **argument** node matches a typed, named input, such as a number or an entity selector. Nodes are joined through `#then` and made executable through `#executes`, and a node may hold execution logic, child nodes, or both. This nesting produces the tree of subcommands.

An argument is used in two places. It is **declared** while building the tree, by supplying a name and an `ArgumentType`, and its parsed value is **accessed** inside the execution logic from the `CommandContext`, using that same name. The name is the contract between the two. The sections below cover each half in turn.

## Registering Commands

A command tree is passed to `CommandDispatcher#register` during the [`RegisterCommandsEvent`][event] like so:

```java
@SubscribeEvent // on the game event bus
public static void registerCommands(RegisterCommandsEvent event) {
    event.getDispatcher().register(
        Commands.literal("mymod")
            .then(Commands.literal("reload")
                .executes(context -> {
                    // Perform the command logic here
                    return Command.SINGLE_SUCCESS;
                })
                .then(Commands.literal("force")
                    .executes(context -> {
                        // Perform the command logic here
                        return Command.SINGLE_SUCCESS;
                    })
                )
            )
    );
}
```

`Commands#literal` starts a literal builder, `#then` attaches a child node, and `#executes` supplies a `Command` callback whose returned `int` is the result count reported back to the caller. The example above registers `/mymod reload` and `/mymod reload force`.

:::note
For more advanced command trees that require registry access, `RegisterCommandsEvent#getBuildContext` provides a `CommandBuildContext` that can be passed to argument types that require it.
:::

## Arguments

An argument node is added with `Commands#argument`, supplying the argument name and an `ArgumentType`. The parsed value is read back inside `#executes` through the static getter that pairs with the chosen type, keyed by the same name.

```java
Commands.literal("give")
    .then(Commands.argument("count", IntegerArgumentType.integer(1))
        .executes(context -> {
            // Access the value declared above as "count"
            int count = IntegerArgumentType.getInteger(context, "count");
            // Use count
            return count;
        }))
```

Every `ArgumentType` provides a builder used when declaring the argument and most often a static getter used when accessing the parsed value. The getter throws if the supplied name does not match a declared argument on the current path, which is why the declaration name and the access name must agree.

If an `ArgumentType` does not provide a static getter, the parsed value can be accessed through `CommandContext#getArgument` with the argument name and the expected class.

:::note
An argument is not made optional through a flag. Instead, `#executes` is attached at more than one depth of the tree: once on the parent node for the case where the argument is absent, and again on the argument node for the case where it is provided.
:::

## Argument Types

The following tables list common argument types. Each row pairs the builder used to declare the argument with the static getter used to access the parsed value.

### Brigadier

Brigadier provides the primitive types, found in `com.mojang.brigadier.arguments`. These types are synchronized to the client automatically.

| Argument Type         | Declares (builder)                     | Accesses (getter) | Description                                              |
| --------------------- | -------------------------------------- | ----------------- | -------------------------------------------------------- |
| `BoolArgumentType`    | `#bool`                                | `#getBool`        | A boolean.                                               |
| `IntegerArgumentType` | `#integer` (optional min and max)      | `#getInteger`     | A 32-bit integer.                                        |
| `LongArgumentType`    | `#longArg` (optional min and max)      | `#getLong`        | A 64-bit integer.                                        |
| `FloatArgumentType`   | `#floatArg` (optional min and max)     | `#getFloat`       | A single-precision decimal.                              |
| `DoubleArgumentType`  | `#doubleArg` (optional min and max)    | `#getDouble`      | A double-precision decimal.                              |
| `StringArgumentType`  | `#word`, `#string`, or `#greedyString` | `#getString`      | A single word, a quotable string, or the remaining text. |

### Built-in Minecraft

Minecraft adds game-specific argument types, found in `net.minecraft.commands.arguments`. This is not an exhaustive list.

| Argument Type         | Declares (builder)                            | Accesses (getter)                                                                                        | Description                                                                |
| --------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `EntityArgument`      | `#entity`, `#entities`, `#player`, `#players` | `#getEntity`, `#getEntities`, `#getOptionalEntities`, `#getPlayer`, `#getPlayers`, `#getOptionalPlayers` | A single entity, player, or multiple entities, and players via a selector. |
| `BlockPosArgument`    | `#blockPos`                                   | `#getLoadedBlockPos`, `#getBlockPos`                                                                     | A block position.                                                          |
| `Vec3Argument`        | `#vec3`                                       | `#getVec3`                                                                                               | A position in the world.                                                   |
| `ItemArgument`        | `#item`                                       | `#getItem`                                                                                               | An item stack, including data components.                                  |
| `BlockStateArgument`  | `#block`                                      | `#getBlock`                                                                                              | A block state, including block entity data.                                |
| `ResourceArgument`    | `#resource`                                   | `#getResource`                                                                                           | A namespaced identifier for a given registry.                              |
| `ResourceKeyArgument` | `#key`                                        | `#getRegistryKey`                                                                                        | A resource key for a given registry.                                       |

### NeoForge

NeoForge adds additional argument types in `net.neoforged.neoforge.server.command`. These are synchronized to the client automatically.

| Argument Type   | Declares (builder) | Accesses (getter)                                                   | Description    |
| --------------- | ------------------ | ------------------------------------------------------------------- | -------------- |
| `EnumArgument`  | `#enumArgument`    | `CommandContext#getArgument` with the keyed name and the enum class | An enum value. |
| `ModIdArgument` | `#modIdArgument`   | `CommandContext#getArgument` with the keyed name and `String.class` | A mod ID.      |

[Brigadier]: https://github.com/Mojang/brigadier
[event]: ../concepts/events.md
[functions]: https://minecraft.wiki/w/Function_(Java_Edition)
