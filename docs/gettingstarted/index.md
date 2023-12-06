# Getting Started with NeoForge

This section includes information about how to set up a NeoForge workspace, and how to run and test your mod.

## Prerequisites

- Familiarity with the Java programming language, specifically its object-oriented, polymorphic, generic, and functional features.
- An installation of the Java 17 Development Kit (JDK) and 64-bit Java Virtual Machine (JVM). NeoForge recommends and officially supports the [Microsoft builds of OpenJDK][jdk], but any other JDK should work as well.

:::caution
Make sure you are using a 64-bit JVM. One way of checking is to run `java -version` in a terminal. Issues may arise when using a 32-bit JVM, due to 32-bit JVMs running out of support for a lot of things.
:::

- Familiarity with an Integrated Development Environment (IDE) of your choice.
   - NeoForge officially supports [IntelliJ IDEA][intellij] and [Eclipse][eclipse], both of which have integrated Gradle support. However, any IDE can be used, ranging from Netbeans or Visual Studio Code to Vim or Emacs.
- Familiarity with [Git][git] and [GitHub][github]. This is technically not required, but it will make your life a lot easier.

## Setting Up the Workspace

- Open the [Mod Developer Kit (MDK)][mdk] GitHub repository, click "Use this template" and clone the newly-created repository to your local machine.
   - If you do not want to use GitHub, or if you want to get the template for an older commit or a non-default branch (which would be the case e.g. for older versions), you can also download the ZIP of the repository (under Code -> Download ZIP) and extract it.
- Open your IDE and import the Gradle project. Eclipse and IntelliJ IDEA will do this automatically for you. If you have an IDE that does not do this, you can also do it via the `gradlew` terminal command.
   - When doing this for the first time, Gradle will download all dependencies of NeoForge, including Minecraft itself, and decompile them. This can take a fair amount of time (up to an hour, depending on your hardware and network strength).
   - Whenever you make a change to the Gradle files, the Gradle changes will need to be reloaded, either through the "Reload Gradle" button in your IDE, or again through the `gradlew` terminal command.

## Customizing Your Mod Information

Edit the `gradle.properties` file to customize how your mod is built (e.g. mod id, mod version, etc.).

All properties are explained as comments inside the `gradle.properties`, the most important ones will be listed here as well:

- `minecraft_version` and `neo_version` specify the Minecraft and NeoForge version used by your project, respectively. Change these appropriately if you want to update Minecraft or NeoForge.
- `minecraft_version_range` and `neo_version_range` specify the accompanying version ranges your mod uses. This is done using [Maven Versioning Ranges][mvr].
   - Generally, these should be the Minecraft and NeoForge version your project is on, with the next Minecraft version as the upper bound.
   - For example, on Minecraft 1.20.2 and NeoForge 20.2.59-beta, the bounds should be `[1.20.2,1.20.3)` (read: anything between Minecraft `1.20.2` (inclusive) and Minecraft `1.20.3` (exclusive)) and `[20.2.59,20.3)` (read: anything between NeoForge `20.2.59` (inclusive) and NeoForge `20.3.*` (exclusive)).
   - See [the page on Versioning][versioning] for more elaborate information on how Minecraft's and NeoForge's versioning systems work.
- `mod_id` is the mod id of your mod. This shows up in a lot of places, for example as the namespace for all your registered things, or as the namespace for your resource and data packs.
- `mod_name` is the display name of your mod. By default, this can only be seen in the mod list, however, mods such as [JEI][jei] prominently display mod names in item tooltips as well.
- `mod_version` is the version of your mod. See [the page on Versioning][versioning] for more information.

### The Group ID

The `mod_group_id` property is only necessary if you plan to publish your mod to a maven. However, it is considered good practice to always properly set this.

The group id should be set to your [top-level package][packaging], which should either match a domain you own or your email address:

|   Type    |       Value       |  Top-Level Package  |
|:---------:|:-----------------:|:-------------------:|
|  Domain   |    example.com    |    `com.example`    |
| Subdomain | example.github.io | `io.github.example` |
|   Email   | example@gmail.com | `com.gmail.example` |

```text
// In your gradle.properties file
mod_group_id=com.example
```

The packages within your java source (`src/main/java`) should also now conform to this structure, with an inner package representing the mod id:

```text
com
- example (top-level package specified in group property)
  - mymod (the mod id)
    - MyMod.java (renamed ExampleMod.java)
```

### Additional Configuration

There are several other configuration options available. A few of these are explained via comments in the `build.gradle` files. For full documentation, see the [NeoGradle documentation][neogradle].

:::warning
Only edit the `build.gradle` and `settings.gradle` files if you know what you are doing. All basic properties can be set via `gradle.properties`.
:::

## Building and Testing Your Mod

To build your mod, run `gradlew build`. This will output a file in `build/libs` with the name `<archivesBaseName>-<version>.jar`, by default. This file can be placed in the `mods` folder of a NeoForge-enabled Minecraft setup, or uploaded to a mod distribution platform.

To run your mod in a test environment, you can either use the generated run configurations or use the associated tasks (e.g. `gradlew runClient`). This will launch Minecraft from the corresponding runs directory (e.g. `runs/client` or `runs/server`), along with any source sets specified. The default MDK includes the `main` source set, so any code written in `src/main/java` will be applied.

### Server Testing

If you are running a dedicated server, whether through the run configuration or `gradlew runServer`, the server will shut down immediately. You will need to accept the Minecraft EULA by editing the `eula.txt` file in the run directory.

Once accepted, the server will load and become available under `localhost` (or `127.0.0.1` by default). However, you will still not able to join, because the server will be put into online mode by default, which requires authentication (which the Dev player does not have). To fix this, stop your server again and set the `online-mode` property in the `server.properties` file to `false`. Now, start your server, and you should be able to connect.

:::tip
You should always test your mod in a dedicated server environment. This includes [client-only mods][client], as these should not do anything when loaded on the server.
:::

[client]: ../concepts/sides.md#writing-one-sided-mods
[config]: https://docs.neoforged.net/neogradle/docs/configuration/runs
[eclipse]: https://www.eclipse.org/downloads/
[git]: https://www.git-scm.com/
[github]: https://github.com/
[intellij]: https://www.jetbrains.com/idea/
[jdk]: https://learn.microsoft.com/en-us/java/openjdk/download#openjdk-17
[jei]: https://www.curseforge.com/minecraft/mc-mods/jei
[mdk]: https://github.com/neoforged/MDK
[mvr]: https://maven.apache.org/enforcer/enforcer-rules/versionRanges.html
[neogradle]: https://docs.neoforged.net/neogradle/docs/
[packaging]: ./structuring.md#packaging
[versioning]: ./versioning.md
