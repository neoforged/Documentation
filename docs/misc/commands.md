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
 - `LiteralArgumentBuilder`: `CommandDispatcher#register` only accepts it. Returned after literal arguments (one-possiblity) and executions. It's often the root of commands, and sometimes an simple un-suggestable argument, because it has only one possibility.
 - RequiredArgumentBuilder: it has more parameters and associated get functions than `LiteralArgumentBuilder`. Returned after required arguments declarations.

In fact, the entire commands are built with it.
Last but not least, command trees are chains of builders created with some functions:
 - `#then(ArgumentBuilder<S, ?>)`: create a new argument.
 - `#executes(Command)`: execute the command. `Command` can be written like a `Function<CommandContext<CommandSourceStack>, Integer>` where you need to return an integer: `Command.SINGLE_SUCCESS` (or just `1`) for one success, the amount of success or `0` on failure.
 - `#forward(CommandNode<S>, RedirectModifier<S>, boolean)`: go to a new path (the node) with specified redirect modifier, and as a fork if `boolean` is true.

`LiteralArgumentBuilder` have also `String #getLiteral`. It returns the literal as a string argument (always the same because literals have only **one** possibility).

`RequiredArgumentBuilder` have many other functions:
 - `#suggest(SuggestionProvider)`: [suggest](#suggestionprovider) somethings.
 - `#getSuggestionProvider`: returns the `SuggestionProvider` used.
 - `#getType`: returns his argument type.
 - `#getName`: returns his name.

#### `CommandNode`
As its name says, a command node is an node (intersection of path) of that command.

### Argument types
Argument types is the second part of creating commands. They come in two packages:
 - `com.mojang.brigadier.arguments` for the argument types based on [Primitive Types](https://docs.oracle.com/javase/tutorial/java/nutsandbolts/datatypes.html#PageTitle) (including `String`, without `char`). Their names are always `<type>ArgumentType`.
 - `net.minecraft.commands.arguments` for all other argument types. Their names are always `<type>Argument`.
 - `net.neoforged.neoforge.server.command`: argument like `EnumArgument` provided by Neoforge for more extensibility. Their names are the same as for `net.minecraft`.

All these argument types are implementing an interface: `ArgumentType<T>` where `T` is the type on which they are based.

When you create an argument for your commands, you will always need to choose an `ArgumentType`.

### Command Contexts
Command contexts are used every time you run a command. It's based on a generic type, the additional information, often `CommandSourceStack`.
It contains all the additional information plus what was written as arguments.

### Exceptions
The package `com.mojang.brigadier.exceptions` provide one [exception](https://docs.oracle.com/javase/tutorial/essential/exceptions/index.html): `CommandSyntaxException`, will be thrown if the syntax is incorrect or if the command fails. It will give an error message in chat if it was a player executing the command, or as output in a [command block](https://minecraft.wiki/w/command_block) if it's a command block.

It also provides many internal handler classes and the `CommandExceptionType`s.

#### `CommandExceptionType`
This is an empty interface is used to mark a class as a eponymous exception. `CommandSyntaxException` take an argument `CommandExceptionType`.

The classes implementing `CommandExceptionType` aims to create exception based on a certain amount of parameters:*
 - `DynamicCommandExceptionType`: one
 - `Dynamic2CommandExceptionType`, `Dynamic3CommandExceptionType`, `Dynamic4CommandExceptionType`: 2, 3 or 4
 - `DynamicNCommandExceptionType`: an undetermined amount
 - `SimpleCommandExceptionType`: zero

These classes are most used in `BuiltInExceptions` in lines like:
```java
private static final Dynamic2CommandExceptionType FLOAT_TOO_BIG = new Dynamic2CommandExceptionType((found, max) -> new LiteralMessage("Float must not be
    more than " + max + ", found " + found));
```
and then
```java
public Dynamic2CommandExceptionType floatTooHigh() {
    return FLOAT_TOO_BIG;
}
```

:::tip
These functions are accessible everywhere, and it's recommended to use it when throwing `CommandSyntaxException`.
```java
throw new CommandSyntaxException(BuiltInException.floatTooHigh(), new LiteralMessage("Please provide a smaller float!"));
```
:::

### `SuggestionProvider`
It's the base interface of execution contexts, [client-side or server-side](../concepts/sides.md).

:::warning
We talk here about **execution** context. It's meaning that the command hasn't be written when it's instanciated, so you can't get arguments from it, use instead [`CommandContext`](#command-contexts).
:::

#### `ClientSuggestionProvider`
It implement `SharedSuggestionProvider` but have many more function, about client context.

### Command Source Stack
The `CommandSourceStack' holds all the information about the command execution context **before** the command is written and executed.

The most important ones are
 - `boolean #hasPermission(int)`: returns whether the command executor has the given [permission level](https://minecraft.wiki/w/Permission_level).
 - `void #sendSuccess(Supplier<Component>, boolean)`: send a success message to the executor. The supplier provides the message and the boolean if it's visible to everyone.
 - `void #sendFailure(Component)`: send a red failure message to the executor.

#### `ClientCommandSourceStack`
It's a Neoforge class that implements `SharedSuggestionProvider`. It has no other functions, so it works like the base context.

### The `Commands` class
It's the "util" class of Minecraft's commands. You can use some of its function for yours, like `Commands.argument`.
It also work as the register of all Minecraft's and Neoforge's commands, but you can't use it without [Mixin](https://spongepowered.org) (not recommended).

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
                if(context.getEntity() instanceof Player player) {
                    player.sendServerMessage(Component.literal("You're now on the level: " + 
                        StringArgumentType.getString(context, "level"))); // And we send a message to the executor
                }
                return Command.SINGLE_SUCCESS;
            })
    );
}
```
:::warning
**Do not use special characters or spaces** in `Commands.argument` as the name of the argument or in `Commands.literal` as the name of the command. It won't make the game crash, but it will make the command unusable and always give errors.
:::
:::tip
You can create optional argument like this:
```java
dispatcher.register( // Assuming we already have a variable holding this dispatcher
    Commands.literal("mycommandwithoptionalargs")
    .then(Commands.argument("level", StringArgumentType.word())
    .then(Commands.argument("amount", IntegerArgumentType.integer()))
    .executes(/*execution with two arguments*/)) // The executes block is inside the then block
    .executes(/*execution with one argument*/) // The executes block is after the then block
);
```
:::
## Creating argument types
Sometime creating a `StringArgumentType` or `ResourceOrTagKeyArgument` isn't pratice or useful.
In this case you can create your own.

To create an argument type, you'll need to create a new class that implements `ArgumentType<T>` and its functions.
```java
public class CarArgumentType implements ArgumentType<Car> { // We create argument type based on the class Car
    public Car parse(StringReader reader) { // To parse the written string to a car instance
        return CARS.get(ResourceLocation.read(reader)); // If we have a HashMap<ResourceLocation, Car>
    }
    public <S> CompletableFuture<Suggestion> listSuggestion(CommandContext<S> ctx, SuggestionBuilder builder) { // To suggest all the different cars
        return SharedSuggestionProvider.suggest(CARS.keySet().map(key::toString), builder)
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
If you just wanna have custom suggestions like for an action (add, set, sub...) you can directly use `#suggests` after a `then` (that use a `RequiredArgumentType`) with as argument an equivalent of `CarAgumentType::listSuggestion`
Another options is to create an enum with all the possibilities and use `EnumArgument.enumArgument(Cars.class)`.
:::

### `ArgumentTypeInfo`
This class allow to serialize argument and provide build context.

You can create it by a nested class implementing `ArgumentTypeInfo<ArgumentType, Template`. `Template<ArgumentType>` is a nested class of `ArgumentTypeInfo` used to give a way for Minecraft itself to use our type info. Here's an example:
```java
// In our class CarArgumentType
public static class Info implements ArgumentTypeInfo<CarArgumentType, Template> {

    public void serializeToNetwork(Template template, FriendlyByteBuf buffer) { // To serialize our argument into binary
        buffer.writeByte(0); /* In this case, we don't have an ArgumentType argument, but if the constructor of 
        CarArgumentType did have an argument, such as "boolean heavy", we would write something like
        buffer.writeByte(template.heavy ? 1 : 0); */
    }
    public Template deserializeFromNetwork(FriendlyByteBuf buffer) { // To deserialize from the byte we wrote above
        return new Template(); /* Taking an argument heavy like above, we have 
        return new Template(buffer.readByte() == 1); */
    }
    public void serializeToJson(Template template, JsonObject json) { // To serialize into a JSON object
        /* There's nothings to write here if new Template haven't any argument.
        Otherwise, you'll write somethings like: json.addProperty("heavy", template.heavy); */
    }
    public Template unpack(CarArgumentType arg) { // To transform the argument type instance into a Template<ArgumentType>
        return new Template(); /* Or with an argument: new Template(arg.heavy); */
    }

    public static final class Template implements ArgumentTypeInfo.Template<CarArgmentType> {
        public CarArgumentType instanciate() { // Says to Minecraft how to instanciate our argument
            return new CarArgumentType();
        }
        public ArgumentTypeInfo<CarArgumentType, ?> type() { // To transform the Template into an ArgumentTypeInfo
            return Info.this;
        }
    }
}
```