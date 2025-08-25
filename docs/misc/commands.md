# Commands
A command is a textual instruction for Minecraft to do somethings.
See also [Commands](https://minecraft.wiki/w/commands) in the Minecraft Wiki.

Commands are very useful because it provides a way for players to test
your mod faster and cheat when he doesn't want to spend a long time to do
not instresting things.

Mojang provides a complete command system in the `com.mojang.brigadier` package, which includes
 - Command parsing and handling
 - Primitive [argument types](#argument-types)
 - [Command Contexts](#command-contexts)
 - Suggestions
 - [Exception handling](#exceptions)
 - Some other small things.

 In fact, Brigadier is the command API of Minecraft.

## Commands architecture
Here are the main classes and concepts that command creation has.

### Command Dispatcher
The `CommandDispatcher<S>` (`S` is often `CommandSourceStack` in this case) work like a [`DeferredRegister`](../concepts/registries.md), but it's internally created.
Its function `register` require a `LiteralArgumentBuilder` argument.

### Argument Builder
The `ArgumentBuilder` class is abstract, so it can't be used on its own.
It has two children:
 - `LiteralArgumentBuilder`: `CommandDispatcher#register` only accepts it. Returned after literal arguments (one-possiblity) and executions
 - RequiredArgumentBuilder: it has more parameters and associated get functions than `LiteralArgumentBuilder`. Returned after required arguments declarations.

In fact, the entire commands are built with it.
Last but not least, command trees are chains of builders created with some functions:
 - `#then(ArgumentBuilder<S, ?>)`: create a new argument.
 - `#executes(Command)`: execute the command. `Command` can be written like a `Function<CommandContext<CommandSourceStack>, Integer>` where you need to return an integer: `Command.SINGLE_SUCCESS` (or just `1`) for success and `0` otherwise.

### Argument types
Argument types is the second part of creating commands. They come in two packages:
 - `com.mojang.brigadier.arguments` for the argument types based on [Primitive Types](https://docs.oracle.com/javase/tutorial/java/nutsandbolts/datatypes.html#PageTitle) (including `String`, without `char`). Their names are always `<type>ArgumentType`.
 - `net.minecraft.commands.arguments` for all other argument types. Their names are always `<type>Argument`.
 - `net.neoforged.neoforge.server.command`: for mod-oriented argument like `EnumArgument`. Their names are the same as for `net.minecraft`.

All these argument types are implementing an interface: `ArgumentType<T>` where `T` is the type on which they are based.

When you create an argument for your commands, you will always need to choose an `ArgumentType`.

### Command Contexts
Command contexts are used every time you run a command. It's based on a generic type, the additional information, often `CommandSourceStack`.
It contains all the additional information plus what was written as arguments.

### Exceptions
The package `com.mojang.brigadier.exceptions` provide one [exception](https://docs.oracle.com/javase/tutorial/essential/exceptions/index.html): `CommandSyntaxException`, throwed if the command isn't correctly written; and many internal handling classes.



### Command Source Stack
The `CommandSourceStack' holds all the information about the command execution context **before** the command is written and executed.

The most important ones are
 - `boolean #hasPermission(int)`: returns whether the command executor has the given [permission level](https://minecraft.wiki/w/Permission_level).
 - `Entity #getEntity()`: returns who is executing the command.
 - `void #sendSuccess(Supplier<Component>, boolean)`: send a success message to the executor. The supplier provides the message and the boolean if it's visible to everyone.
 - `void #sendFailure(Component)`: send a red failure message to the executor.

### The `Commands` class
It provides many tools like `Commands.argument`.

## Creating a command
To create a command, you'll need to register it with `RegisterCommandsEvent` [event](../concepts/events.md). Here's an example:
```java
// Assuming we already regsiter the event
@SubscribeEvent // Default event bus
public static void registerCommands(RegisterCommandsEvent event) {
    event.getDispatcher().register( // event.getDispatcher returns the CommandDispatcher
        Commands.literal("mycommand") // Always start with this, the name of your command
            .requires(source -> source.hasPermission(2)) // Check permissions level
            .then(Commands.argument("level", StringArgumentType.word())) // Here we create an on-word argument named "level"
            .executes(context -> {
                context.getPlayer().sendServerMessage(Component.literal("You're now on the level: " + 
                StringArgumentType.getString(context, "level")))); // And we send a message to the executor
                return Command.SINGLE_SUCCESS;
            }
    )
}
```
:::warning
**Do not use special characters or spaces as arguments** in `Commands.literal` and `Commands.argument`. It won't make the game crash, but it will make the command unusable and always give errors.
:::
:::tip
You can create optional argument like this:
```java
dispatcher.register( // Assuming we already have a variable holding this dispatcher
    Commands.literal("mycommandwithoptionalargs")
    .then(Commands.argument("level", StringArgumentType.word())
    .executes(ctx -> {/*execution with one argument*/}) // Here #executes is in the "then" block
    )
    .then(Commands.argument("message", StringArgumentType.string())
    .executes(ctx -> {/*execution with two arguments*/})
)
```
:::
## Creating argument types
If you wanna add custom argument type like for quests, spell or anythings new that your mod add read below.

To create an argument type, you'll need to create a new class that implements `ArgumentType<T>` and its functions.
```java
public class CarArgumentType implements ArgumentType<Car> { // We create argument type based on the class Car
    public Car parse(StringReader reader) { // To parse the written string to a car instance
        return CARS.get(reader.read()); // If we have a HashMap<String, Car>
    }
    public <S> CompletableFuture<Suggestion> listSuggestion(CommandContext<S>, SuggestionBuilder builder) { // To suggest all the different cars
        return SharedSuggestionProvider.suggest(CARS.keySet(), builder)
    }
    public Collection<String> getExamples() { // To provide examples shown in the chat on wrong command writing.
        return List.of("Volvo", "Citroën");
    }
}
```

You will also need to add some functions to allow instantiation and get argument:
 - A `public static CarArgumentType car()` that returns a `new CarArgumentType()` (it's a best pratice to avoid direct instanciations).
 - A function to get our arguments:
 ```java
 public static Car getCar(CommandContext<CommandSourceStack> ctx, String name) {
    return ctx.getArgument(name, Car.class);
 }
 ```

:::tip
If you just wanna have custom suggestions like for an action (add, set, sub...) you can directly use `#suggest` after a `then` with as argument an equivalent of `CarAgumentType::listSuggestion`
Another options is to create an enum with all the possibilities and use `EnumArgument.enumArgument(Cars.class)`.
:::