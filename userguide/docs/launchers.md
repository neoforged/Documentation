---
sidebar_position: 3
---

# Launchers and Mod Managers

There are two supported ways that you can launch Minecraft with Neoforge.

The first is to use the official, vanilla launcher from Mojang, which the NeoForge installer creates a profile for.

The second option is to use a third-party launcher, some of which are listed below in the [Third-Party Launchers] section.

## Locating the Game Directory

Minecraft stores its files, like your game's saves, as well as crash reports and log files in a so-called game directory.

The location of the game directory will differ depending on which launcher you use to run the game.

The vanilla launcher will create a `.minecraft` directory in your OS user's home directory.  This is the game directory for the vanilla launcher.

<!-- List ot link out to where to find user home directory? -->

:::note
If you are using another launcher, refer to their documentation on where the game directory is located.
:::

## Locating Log Files and Crash Reports

Minecraft stores log files and crash reports in the game directory.

You might be asked to provide log files or crash reports when seeking help.

If you do not know where to find them, open your game directory in a file manager application where there should be two directories:

- `logs` This directory contains log files for the game, with the files `latest.log` and `debug.log` being most pertinent.
- `crash-reports` This directory contains plain-text crash reports, each with timestamped filenames e.g. `crash-2024-08-11_15.54.06-client.txt`.

<!-- Not sure if the above list is the best way to format the info in it... -->

## Third-Party Launchers

There are a number of third-party launchers (also known as mod managers) to choose from, including:

- [CurseForge App]
- [Modrinth App]
- [ATLauncher]
- [Prism Launcher]

These launchers differ from the vanilla launcher in a number of helpful ways.

First of all, the launcher should fully handle installing and updating NeoForge for you.

Second, you will be able to create multiple game profiles (also known as instances), allowing you to easily seperate different versions of the game.

Finally, all of the linked launchers have the ability to manage mods, making installing and updating mods much easier.

[Third-Party Launchers]: ./launchers.md#third-party-launchers
[CurseForge App]: https://www.curseforge.com/download/app
[Modrinth App]: https://modrinth.com/app
[ATLauncher]: https://atlauncher.com/
[Prism Launcher]: https://prismlauncher.org/