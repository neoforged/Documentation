# Configuration

## Overview

In its base form, a configuration is a persistent collection of named values that can be changed by the user. Neoforge provides a configuration system that takes care of the "persistent" and "can be changed by the user" parts, as well as more Minecraft-specific tasks like syncing configs from the server to the client.

Configuration values in this system have a name (called "key" in the code) and are part of a section, i.e. a named collection of values. They also have a data type, which may be `String`, `Integer`, `Long`, `Double`, `Enum` or `List` (of all of these but Enum). In addition, you can define a translation key that is used by the UI to show the name of the value, a comment that is added to the file the configuration is saved in, a tooltip for the UI (this one defaults to the comment), and further restrictions on the value.

Sections can be nested to any depth, allowing you to build a tree to your liking. However, you don't just have one root; you have 4. Those represent the four different types of config: startup, client, server and common. Each is stored in its own file. The startup config is loaded early in the startup process, the client config only is loaded on the physical client, the common config is loaded on both client and server independently, and the server config is loaded on the server when a world is loaded and is synced over the network to the client.

For this to work, NeoForge's configuration system naturally needs to know about your configuration values. To accomplish this, you first acquire a `Builder`, then tell that Builder about all your configuration values. For each one, the Builder will give you a provider you can later use to get the current value. When you're done, the Builder will give you a `ModConfigSpec` object that you need to register with the configuration system.

You also need to register to use NeoForge's configuration UI so users can edit your config in the game. This is optional, and you can create your own configuration UI if you want.

In the background, NeoForge uses [TOML][toml] files read with [NightConfig][nightconfig].

## Quick Examples

There are multiple ways of creating a configuration. The most straightforward way is to put them into static fields and statically fill them:

```java
public class Config {
	private static final ModConfigSpec.Builder BUILDER = new ModConfigSpec.Builder();

	public static final ModConfigSpec.ConfigValue<Boolean> LOG_DIRT_BLOCK = BUILDER
		.comment("Whether to log the dirt block on common setup")
		.define("logDirtBlock", true);

	public final ModConfigSpec SPEC = BUILDER.build();
```

The Builder doesn't depend on any load order, so you don't have to take any precautions here.

The next step is to register your configuration. This should be done in your mod's constructor like so:

```java
@Mod(ExampleMod.MODID)
public class ExampleMod {
	public ExampleMod(ModContainer modContainer) {
		modContainer.registerConfig(ModConfig.Type.COMMON, Config.SPEC);
	}
```

If you want to use NeoForge's configuration UI, you need to register for it like this:

```java
@Mod(ExampleMod.MODID, dist = Dist.CLIENT)
public class ExampleModClientMod {
	public ExampleMod(ModContainer modContainer) {
		container.registerExtensionPoint(IConfigScreenFactory.class, (mc, parent) -> new ConfigurationScreen(container, parent));
	}
```

To later query your configuration values, simply call `get()` on your static values:

```java
if (Config.LOG_DIRT_BLOCK.get()) {
	LOGGER.info("dirt!");
}
```

Note that the value you get is live. It can change at any time, for example, when a config file is changed and reloaded or when the user uses the configuration UI. If you need to rely on some config values to stay stable and/or in sync, you need to make a copy of the values. This can also be used to transform values that cannot be stored directly, e.g. converting `String`s first to `ResourceLocation`s and then to `Item`s. To update your copy, listen to the `ModConfigEvent`s on the mod event bus.

## Creating a Configuration

A configuration can be created using a subtype of `IConfigSpec`. NeoForge implements the type via `ModConfigSpec` and enables its construction through `ModConfigSpec.Builder`. The builder can separate the config values into sections via `Builder#push` to create a section and `Builder#pop` to leave a section. Afterwards, the configuration can be built using one of two methods:

 Method     | Description
 :---       | :---
`build`     | Creates the `ModConfigSpec`.
`configure` | Creates a pair of the class holding the config values and the `ModConfigSpec`.

:::note
`ModConfigSpec.Builder#configure` is typically used with a `static` block and a class that takes in `ModConfigSpec.Builder` as part of its constructor to attach and hold the values:

```java
//Define a field to keep the config and spec for later
public static final ExampleConfig CONFIG;
public static final ModConfigSpec CONFIG_SPEC;

private ExampleConfig(ModConfigSpec.Builder builder) {
    // Define properties used by the configuration
    // ...
}

//CONFIG and CONFIG_SPEC are both built from the same builder, so we use a static block to seperate the properties
static {
    Pair<ExampleConfig, ModConfigSpec> pair =
            new ModConfigSpec.Builder().configure(ExampleConfig::new);
        
    //Store the resulting values
    CONFIG = pair.getLeft();
    CONFIG_SPEC = pair.getRight();
}
```
:::

Each config value can be supplied with additional context to provide additional behavior. Contexts must be defined before the config value is fully built:

| Method         | Description                                                                                                 |
|:---------------|:------------------------------------------------------------------------------------------------------------|
| `comment`      | Provides a description of what the config value does. Can provide multiple strings for a multiline comment. |
| `translation`  | Provides a translation key for the name of the config value.                                                |
| `worldRestart` | The world must be restarted before the config value can be changed.                                         |
| `gameRestart`  | The game must be restarted before the config value can be changed.                                          |

### ConfigValue

Config values can be built with the provided contexts (if defined) using any of the `#define` methods.

All config value methods take in at least two components:

- A path representing the name of the variable: a `.` separated string representing the sections the config value is in
- The default value when no valid configuration is present

The `ConfigValue` specific methods take in two additional components:

- A validator to make sure the deserialized object is valid
- A class representing the data type of the config value

For lists, there are two additional components you can supply:

- A supplier for new elements. This is used by the UI to allow the user adding new elements.
- A size range to limit the size of the list, e.g. to require them to have at least one entry.

```java
//Store the config properties as public finals
public final ModConfigSpec.ConfigValue<String> welcomeMessage;

private ExampleConfig(ModConfigSpec.Builder builder) {
    //Define each property
    //One property could be a message to log to the console when the game is initialised
    welcomeMessage = builder.define("welcome_message", "Hello from the config!");
}
```

The values themselves can be obtained using `ConfigValue#get`. The values are additionally cached to prevent multiple readings from files.

#### Additional Config Value Types

- **Range Values**
    - Description: Value must be between the defined bounds
    - Class Type: `Comparable<T>`
    - Method Name: `#defineInRange`
    - Additional Components:
        - The minimum and maximum the config value may be
        - A class representing the data type of the config value

:::note
`DoubleValue`s, `IntValue`s, and `LongValue`s are range values which specify the class as `Double`, `Integer`, and `Long` respectively.
:::

- **Whitelisted Values**
    - Description: Value must be in supplied collection
    - Class Type: `T`
    - Method Name: `#defineInList`
    - Additional Components:
        - A collection of the allowed values the configuration can be

- **List Values**
    - Description: Value is a list of entries
    - Class Type: `List<T>`
    - Method Name: `#defineList`, `#defineListAllowEmpty` if list can be empty
    - Additional Components:
        - A supplier that returns a default value to use when a new entry is added in configuration screens.
        - A validator to make sure a deserialized element from the list is valid
        - (optional) A vaidator to make sure the list does not get too little or too many entries

- **Enum Values**
    - Description: An enum value in the supplied collection
    - Class Type: `Enum<T>`
    - Method Name: `#defineEnum`
    - Additional Components:
        - A getter to convert a string or integer into an enum
        - A collection of the allowed values the configuration can be

- **Boolean Values**
    - Description: A `boolean` value
    - Class Type: `Boolean`
    - Method Name: `#define`

## Registering a Configuration

Once a `ModConfigSpec` has been built, it must be registered to allow NeoForge to load, track, and sync the configuration settings as required. Configurations should be registered in the mod constructor via `ModConatiner#registerConfig`. A configuration can be registered with a [given type][configtype] representing the side the config belongs to, the `ModConfigSpec`, and optionally a specific file name for the configuration.

```java
// In the main mod file with a ModConfigSpec CONFIG_SPEC
public ExampleMod(ModContainer container) {
    ...
    //Register the config
    container.registerConfig(ModConfig.Type.COMMON, ExampleConfig.CONFIG_SPEC);
    ...
}
```

### Configuration Types

Configuration types determine where the configuration file is located, what time it is loaded, and whether the file is synced across the network. All configurations are, by default, either loaded from `.minecraft/config` on the physical client or `<server_folder>/config` on the physical server. Some nuances between each configuration type can be found in the following subsections.

:::tip
NeoForge documents the [config types][type] within their codebase.
:::

- `STARTUP`
    - Loaded on both the physical client and physical server from the config folder
    - Read immediately on registration
    - **NOT** synced across the network
    - Suffixed with `-startup` by default

:::warning
Configurations registered under the `STARTUP` type can cause desyncs between the client and server, such as if the configuration is used to disable the registration of content. Therefore, it is highly recommended that any configurations within `STARTUP` are not used to enable or disable features that may change the content of the mod.
:::

- `CLIENT`
    - Loaded **ONLY** on the physical client from the config folder
        - There is no server location for this configuration type
    - Read immedately before `FMLCommonSetupEvent` is fired
    - **NOT** synced across the network
    - Suffixed with `-client` by default
- `COMMON`
    - Loaded on both the physical client and physical server from the config folder
    - Read immedately before `FMLCommonSetupEvent` is fired
    - **NOT** synced across the network
    - Suffixed with `-common` by default
- `SERVER`
    - Loaded on both the physical client and physical server from the config folder
        - Can be overridden for each world by adding a config to:
            - Client: `.minecraft/saves/<world_name>/serverconfig`
            - Server: `<server_folder>/world/serverconfig`
    - Read immedately before `ServerAboutToStartEvent` is fired
    - Synced across the network to the client
    - Suffixed with `-server` by default

## Configuration Events

Operations that occur whenever a config is loaded, reloaded, or unloaded can be done using the `ModConfigEvent.Loading`, `ModConfigEvent.Reloading`, and `ModConfigEvent.Unloading` events. The events must be [registered][events] to the mod event bus.

:::caution
These events are called for all configurations for the mod; the `ModConfig` object provided should be used to denote which configuration is being loaded or reloaded.
:::

## Configuration Screen

A configuration screen allows users to edit the config values for a mod while in-game without needing to open any files. The screen will automatically parse your registered config files and populate the screen. 

A mod can use the built-in configuration screen that NeoForge provides. Mods can extend `ConfigurationScreen` to change the behavior of the default screen or make their own configuration screen. Mods can also create their own screen from scratch and provide that custom screen to NeoForge through the below extension point.

A configuration screen can be registered for a mod by registering a `IConfigScreenFactory` extension point during mod construction on the [client]:

```java
// In the main client mod file
public ExampleModClient(ModContainer container) {
    ...
    // This will use NeoForge's ConfigurationScreen to display this mod's configs
    container.registerExtensionPoint(IConfigScreenFactory.class, ConfigurationScreen::new);
    ...
}
```

The configuration screen can be accessed in game by going to the 'Mods' page, selecting the mod from the sidebar, and clicking the 'Config' button. Startup, Common, and Client config options will always be editable at any point. Server configs are only editable in the screen when playing on a world locally. If connected to a server or to another person's LAN world, Server config option will be disabled in the screen. The first page of the config screen for the mod will show every registered config file for players to pick which one to edit.

:::warning
Translation keys should be added and have the text defined within the lang JSON for all config entries if you are making a screen.

You can specify a translation key for a config by using the `ModConfigSpec$Builder#translation` method, so we can extend the previous code to:
```java
ConfigValue<T> value = builder.comment("This value is called 'config_value_name', and is set to defaultValue if no existing config is present")
    .translation("modid.config.config_value_name")
    .define("config_value_name", defaultValue);
```

To make translating easier, open the configuration screen and visit all of the configs and their subsections. Then back out to the mod list screen. All untranslated config entries that were encountered will be printed to the console at this point. This makes it easier to know what to translate and what the translation keys are.
:::

[toml]: https://toml.io/
[nightconfig]: https://github.com/TheElectronWill/night-config
[configtype]: #configuration-types
[type]: https://github.com/neoforged/FancyModLoader/blob/aafe4660ae6eff2702ec786dba8e83c69c0d9e91/loader/src/main/java/net/neoforged/fml/config/ModConfig.java#L88-L121
[events]: ../concepts/events.md#registering-an-event-handler
[client]: ../concepts/sides.md#mod
