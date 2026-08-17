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

`Commands#literal` starts a literal builder, `#then` attaches a child node, and `#executes` supplies a `Command` callback whose returned `int` is the result count reported back to the caller, often indicating how many players were affected. The example above registers `/mymod reload` and `/mymod reload force`.

:::note
For more advanced command trees that require registry access, `RegisterCommandsEvent#getBuildContext` provides a `CommandBuildContext` that can be passed to argument types that require it.
:::

### Permissions

A permission node is added with `#requires`, supplying a predicate that returns `true` for a given `CommandSourceStack` if the command can be executed by the caller. The predicate is evaluated on the server, so it can check the caller's permission level or other state.

```java
Commands.literal("op-me")
        .requires(source -> source.hasPermission(4))
        .executes(context -> {
            // Perform the command logic here
            return 1;
        })
```

:::note
`CommandSourceStack#hasPermission` checks the caller's permission level, which is set by the server and defaults to 0 for players and 4 for OP's which is configurable in `server.properties`. A level of 4 is required to run vanilla commands such as `/op` or `/stop`.
:::

## Arguments

An argument node is added with `Commands#argument`, supplying the argument name and an `ArgumentType`. The parsed value is read back inside `#executes` through the static getter that pairs with the chosen type, keyed by the same name.

```java
Commands.literal("give")
    .then(Commands.argument("count", IntegerArgumentType.integer(1))
        .executes(context -> {
            // Access the value declared above as "count"
            int count = IntegerArgumentType.getInteger(context, "count");

            // Use count...

            return count;
        }))
```

Every `ArgumentType` provides a builder used when declaring the argument and most often a static getter used when accessing the parsed value. The getter throws if the supplied name does not match a declared argument on the current path, which is why the declaration name and the access name must agree.

:::note
If an `ArgumentType` does not provide a static getter, the parsed value can be accessed through `CommandContext#getArgument` with the argument name and the expected class.
:::

An argument is not made optional through a flag. Instead, `#executes` is attached at more than one depth of the tree: once on the parent node for the case where the argument is absent, and again on the argument node for the case where it is provided.

## Argument Types

The following tables list common argument types. Each row pairs the builder used to declare the argument with the static getter used to access the parsed value.

### Brigadier

Brigadier provides the primitive types, found in `com.mojang.brigadier.arguments`.

| Argument Type         | Declares (builder)                     | Accesses (getter) | Description                          |
| --------------------- | -------------------------------------- | ----------------- | ------------------------------------ |
| `BoolArgumentType`    | `#bool`                                | `#getBool`        | A boolean.                           |
| `IntegerArgumentType` | `#integer` (optional min and max)      | `#getInteger`     | A 32-bit integer.                    |
| `LongArgumentType`    | `#longArg` (optional min and max)      | `#getLong`        | A 64-bit integer.                    |
| `FloatArgumentType`   | `#floatArg` (optional min and max)     | `#getFloat`       | A single-precision decimal.          |
| `DoubleArgumentType`  | `#doubleArg` (optional min and max)    | `#getDouble`      | A double-precision decimal.          |
| `StringArgumentType`  | `#word`, `#string`, or `#greedyString` | `#getString`      | A piece of text, see the note below. |

:::note
The three `StringArgumentType` builders differ in how much text they consume. `#word` reads a single unquoted word, ending at the first space. `#string` reads a single word as well, unless the input is wrapped in double quotes (`"hello world"`), in which case the whole quoted text is read. `#greedyString` reads everything after the argument, spaces included, and therefore cannot be followed by further nodes.
:::

### Built-in Minecraft

Minecraft adds game-specific argument types, found in `net.minecraft.commands.arguments`. This is not an exhaustive list.

| Argument Type         | Declares (builder)                            | Accesses (getter)                                                                                        | Description                                                                                      |
| --------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `EntityArgument`      | `#entity`, `#entities`, `#player`, `#players` | `#getEntity`, `#getEntities`, `#getOptionalEntities`, `#getPlayer`, `#getPlayers`, `#getOptionalPlayers` | One or multiple entities or players, selected by name, UUID, or a selector such as `@p` or `@e`. |
| `BlockPosArgument`    | `#blockPos`                                   | `#getLoadedBlockPos`, `#getBlockPos`                                                                     | A block position.                                                                                |
| `Vec3Argument`        | `#vec3`                                       | `#getVec3`                                                                                               | A position in the world.                                                                         |
| `ItemArgument`        | `#item`                                       | `#getItem`                                                                                               | An item stack, including data components.                                                        |
| `BlockStateArgument`  | `#block`                                      | `#getBlock`                                                                                              | A block state, including block entity data.                                                      |
| `ResourceArgument`    | `#resource`                                   | `#getResource`                                                                                           | An [`Identifier`][identifier] pointing to an entry of a given registry.                          |
| `ResourceKeyArgument` | `#key`                                        | `#getRegistryKey`                                                                                        | A [`ResourceKey`][resourcekey] for a given registry.                                             |

### NeoForge

NeoForge adds additional argument types in `net.neoforged.neoforge.server.command`.

| Argument Type   | Declares (builder) | Accesses (getter)                                                   | Description    |
| --------------- | ------------------ | ------------------------------------------------------------------- | -------------- |
| `EnumArgument`  | `#enumArgument`    | `CommandContext#getArgument` with the keyed name and the enum class | An enum value. |
| `ModIdArgument` | `#modIdArgument`   | `CommandContext#getArgument` with the keyed name and `String.class` | A mod ID.      |

## Custom Argument Types

A value that none of the existing types can parse is handled by implementing a custom argument type via `ArgumentType<T>`, which reads the raw command text from a `StringReader` and returns a value of type `T`.

```java
// Spell is a custom type for the sake of this example.
public class SpellArgument implements ArgumentType<Spell> {
    private static final DynamicCommandExceptionType ERROR_UNKNOWN_SPELL = new DynamicCommandExceptionType(
            name -> Component.translatableEscape("commands.examplemod.spell.unknown", name)
    );

    // Follows the naming scheme of the vanilla argument types, used when declaring the argument
    public static SpellArgument spell() {
        return new SpellArgument();
    }

    // Consumes as much of the input as the argument needs
    @Override
    public Spell parse(StringReader reader) throws CommandSyntaxException {
        String name = reader.readUnquotedString();
        // Validate the supplied spell exists, throwing ERROR_UNKNOWN_SPELL#createWithContext if not
    }

    // Optional, defaults to no suggestions: the completions offered while typing the argument
    @Override
    public <S> CompletableFuture<Suggestions> listSuggestions(CommandContext<S> context, SuggestionsBuilder builder) {
        // Suggest the names of the available spells or none
        return Suggestions.empty();
    }

    // Optional, defaults to an empty list: example inputs used by Brigadier to detect
    // ambiguities between sibling nodes
    @Override
    public Collection<String> getExamples() {
        return List.of("fireball", "heal");
    }
}
```

As no static getter exists for a new type, one is usually added next to the builder, so that the value can be accessed like that of a built-in type:

```java
public static Spell getSpell(CommandContext<CommandSourceStack> context, String name) {
    return context.getArgument(name, Spell.class);
}
```

:::tip
If an existing argument type already parses the desired value and only the suggestions should differ, `#suggests` on the argument node replaces them without a custom type. Suggestions added this way are requested from the server as the player types.
:::

### Synchronization

The server sends its command tree to every client, allowing commands to be parsed and completed locally while being typed. Each argument node is described by an `ArgumentTypeInfo`, looked up from the `COMMAND_ARGUMENT_TYPE` registry by the class of the `ArgumentType`. The types listed in the argument types tables above already have one. A custom type without one cannot be sent to the client.

`ArgumentTypeInfos#registerByClass` associates the `ArgumentType` class with its info and returns the info, so it can be [registered][registration] in the same statement:

```java
public static final DeferredRegister<ArgumentTypeInfo<?, ?>> COMMAND_ARGUMENT_TYPES =
        DeferredRegister.create(Registries.COMMAND_ARGUMENT_TYPE, ExampleMod.MOD_ID);

public static final DeferredHolder<ArgumentTypeInfo<?, ?>, SingletonArgumentInfo<SpellArgument>> SPELL = COMMAND_ARGUMENT_TYPES.register(
        // The registry name of the argument type.
        "spell",
        () -> ArgumentTypeInfos.registerByClass(
                // The class of the argument type.
                SpellArgument.class,
                // The info describing it. 'contextFree' is used for argument types
                // constructed without parameters, 'contextAware' for those requiring
                // a CommandBuildContext.
                SingletonArgumentInfo.contextFree(SpellArgument::spell)
        )
);
```

An argument type that holds parameters of its own, such as the bounds of `IntegerArgumentType`, needs those parameters on the client as well and therefore cannot use `SingletonArgumentInfo`. Instead, `ArgumentTypeInfo` is implemented directly, along with an `ArgumentTypeInfo.Template` holding the parameters: `#serializeToNetwork` and `#deserializeFromNetwork` transfer the template, `#serializeToJson` writes it into the JSON representation of the command tree, `#unpack` creates a template from an argument type, and `Template#instantiate` creates an argument type from a template. `EnumArgument.Info` is a small example of such an implementation.

[Brigadier]: https://github.com/Mojang/brigadier
[event]: ../concepts/events.md
[functions]: https://minecraft.wiki/w/Function_(Java_Edition)
[identifier]: ../misc/identifier.md
[registration]: ../concepts/registries.md#methods-for-registering
[resourcekey]: ../misc/identifier.md#resourcekeys
