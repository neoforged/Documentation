---
sidebar-position: 7
---
# Commands
Commands are very useful in vanilla Minecraft and even more so with mods. They are the quickest way to access and modify data.
Commands allow to:
- Use permission levels.
- Access to anything in your mod.
- Allow use anywhere on the map, generally without specific items or other physical objects.
## Creating a command
To create a command, you need to create a new class and put this code:
```java
public static void register(CommandDispatcher<CommandSourceStack> dispatcher) {
    dispatcher.register (
        Commands.literal("commandname") // The name of your command
        .execute(context -> { // Here is what the command do, where context is a CommandContext<CommandSourceStack>
            // Put action here
            return Command.SINGLE_SUCCES; // send succes to server
        })
    );
}
```
And then, register the command in your event handler (of anywhere as an event) like this:
```java
@SubscribeEvent
public static void onRegisterCommands(RegisterCommandsEvent event) {
    ModCommands.register(event.getDispatcher());
}
```
What Neoforge do in this case, it's that it call event `RegisterCommandEvent` when loading game, and our code say to call `register` with an `dispatcher` argument, the global source of all commands. Now is the command ready to use!
## Arguments
At this point, our command execute always the same action, and it's not very useful...
Here is a list of principals argument types:
- Integer
- String
- Entity, BlockPos, Item...
They are located on path `neoforge/net/minecraft/commands/` and native types (int and string) are locked in brigadier class.
Argument are invoked by `then(Commands.argument("name", argument_type))` you can get it with `Type varname = <argument_type>.get<argument>(context, "name")`
Here is an example:
```java
public static void register(CommandDispatcher<CommandSourceStack> dispatcher) {
    dispatcher.register (
        Commands.literal("commandname")
        .then(Commands.argument("message", StringArgumentType.string())) // or word(), it's the string type
        .execute(context -> {
            String message = StringArgumentType.getString(context, "message"); // Same name as above
            ServerPlayer player = context.getSource(); // Who is executing the command
            player.sendServerMessage(message);
            return Command.SINGLE_SUCCES;
        })
    );
}
```
:::danger
Note that all ArgumentTypes are abstract and you need to use child, as `string()` in this example.
:::
### Suggestion
You can suggest (implement auto-completion) things with method `suggest(SuggestionProvider)` just after a `.then` expression.
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
