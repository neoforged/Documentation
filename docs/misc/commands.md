---
sidebar-position: 7
---
# Commands
Commands are useful in vanilla Minecraft, but even more so with mods. They are the quickest way to perform operations for players.
## Creating a command
To create a command, you need to create a [register][registries.md] method, that receives a `CommandDispatcher<CommandSourceStack>` argument, the source of command registration.
This dispatcher has a method called `register` that allows new commands to be added and receives a `LiteralArgumentBuilder<S>` argument.
To build this argument builder, there is a method, `Commands.literal`, which returns this argument type.
```java
public static void register(CommandDispatcher<CommandSourceStack> dispatcher,
    CommandBuildContext context, CommandSelection selection) {
    dispatcher.register (
        Commands.literal("commandname") // The name of your command
        .execute(context -> { // Here is what the command do, where context is a CommandContext<CommandSourceStack>
            // Put action here
            return Command.SINGLE_SUCCESS; // send success to server
        })
    );
}
```
Here we use `#executes` to launch the command.

Then, register the command in an event (with the game event bus) like this:
```java
@SubscribeEvent // You can also use #addEventListener
public static void onRegisterCommands(RegisterCommandsEvent event) {
    ModCommands.register(event.getDispatcher());
}
```
Now is the command ready to be used!
## Arguments
At this point, our command always performs the same action, which is not very useful.

The interface `ArgumentType` construct argument and give way to receives it.
All argument types are located on path `neoforge/net/minecraft/commands/` and native types (as int or string) are locked in brigadier class.
All that classes extends `ArgumentType<T>` or implements `ArgumentType<itself>`.

Argument are invoked by `#then(Commands.argument("name", argument_type))` you can usually get it through `Type varname = <argument_type>.get<argument>(context, "name")`
Here is an example:
```java
public static void register(CommandDispatcher<CommandSourceStack> dispatcher) {
    dispatcher.register (
        Commands.literal("commandname")
        .then(Commands.argument("message", StringArgumentType.string())) // or word(), it's the string type
        .execute(context -> {
            String message = StringArgumentType.getString(context, "message"); // Same name as above
            ServerPlayer player = context.getSource(); // Who is executing the command
            player.sendSystemMessage(Component.literal(message));
            return Command.SINGLE_SUCCES;
        })
    );
}
```
:::danger
Note that certains ArgumentTypes as `StringArgumentType` can't be directly used and you need to use childs, as `#string()` in this example.
:::
### Suggestion
You can suggest (implement auto-completion) things with method `#suggest(SuggestionProvider)` just after a `#then` expression.
A `SuggestionPovider` take this form:
```java
// A list of suggestion
private static final List<String> ACTIONS = List.of("add", "sub", "set");

private static final SuggestionProvider<CommandSourceStack> ACTION_SUGGESTIONS = (context, builder) ->
    SharedSuggestionProvider.suggest(ACTIONS, builder); // We use ACTIONS list
```
:::note
Users aren't obliged to use suggestions. If you want to error when gived argument doesn't match with suggestion, you can do in the execute statement:
```java
if(!ACTIONS.contains(arg)) { // Arg is already declared
    context.getSource().sendFailure(Component.literal("Invalid action (add/sub/set)")); // As return send_succes method, but it send failure (red message)
    return 0; // Ensure to stop the function
}
```
:::
## Other features
As many Neoforge elements, command has his own set of function that make our life better...
### Execution conditions
You can use the `#requires` method after `Commands.literal` function to require some things with based on an function that take one argument: `source` (player that execute the command).
```java
// In the register function
dispatcher.register(
    Commands.literal("opcommand")
        .requires(source -> source.hasPermission(2)) // persmission level: 0 = none, 4 = admin
);
```
### Side requirement
In your `register` method, you get a parameter `dispatcher` from the `RegisterCommandsEvent`. In addition to enabling registration, it gave some informations about tick game context. One of these information is `#getCommandSelection`, which returns whether it is multiplayer or singleplayer.
```java
public static void register(CommandDispatcher<CommandSourceStack> dispatcher) {
        if(dispatcher.getCommandSelection() == Commands.CommandSelection.DEDICATED) { // INTEGRATED for singleplayer
            dispatcher.register(
                Commands.literal("multiplayercommand")
                        // then code action
            );
        }
    }
```
### `Commands.literal`
The `Commands.Literal` class is used in the build process to store the command name. However, it has other uses, as detailed below.
`Commands.literal` or other one-state argument create temporally a new argument (in this case, a string) with one possibility, making special path. Then use `#executes` to lauch the command only if this argument is exactly somethings. If not, it continue workflow.
```java
dispatcher.register(
    Commands.literal("modifyorget")
        .then(Commands.literal("get"
            .executes(ctx -> {}) // do somethings
        )
        .then(Commands.argument("action"), StringArgumentType.word())
            .then(Commands.argument("value"), IntegerArgumentType.integer())
                .executes(ctx -> {}) // do also somethings
        // then maybe other code actions
    );
```
Here, if the first argument is `get`, we directy execute the command, otherwise we take another argument `value`.
:::danger
If you use `Commands.literal` as a single-possibility argument, you will always need to put the related instructions in the then block. Otherwise, you will get an error or strange behaviour.
:::
