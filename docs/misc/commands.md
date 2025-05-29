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
To create a command, you need to create a new class and put this code :
```java
public static void register(CommandDispatcher<CommandSourceStack> dispatcher) {
  dispatcher.register (
    Commands.literal("commandname") // The name of your command
      .execute(context -> { // Here is what the command do, where context is a CommandContext<CommandSourceStack>
        // Put action here
      })
  );
}
```
