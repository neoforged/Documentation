---
sidebar_position: 1
---

# Installing a NeoForge Client

_This article assumes that you [have the correct version of Java installed][java]._

## Installing

To install NeoForge:

- Close your Minecraft Launcher.
- Download the installer `.jar` from [the NeoForged website][neoforged].
- Make sure that `Install client` is selected and click `Proceed`.
- Open the Minecraft Launcher. A NeoForged run option should have appeared.

Now, while you can use that run option, it is recommended to instead use custom launch profiles when dealing with modded instances, as to keep the mods isolated from the vanilla game. To that end, the Minecraft Launcher offers you the ability to create custom profiles in the Installations tab:

- Go to the Installations tab.
- Click "New Installation".
- Name your new installation.
- Select the desired NeoForge version.
- Select the game directory. This should be a separate folder outside the standard [`.minecraft`][dotminecraft] directory.
- Press "Install" and boot up the profile.

## Adding Mods

After starting the game once, a `mods` folder will have appeared in the specified game directory. This is where you want to put your mod files.

Mod files should only be downloaded from trustworthy sources. We generally recommend you get your mods on [CurseForge][curseforge] or [Modrinth][modrinth].

## Updating

To update your NeoForge version, simply download and run the installer for the new NeoForge version, as described above. Then, go to the Installations tab in the launcher and change the version in your NeoForge profile to the new version.

:::danger
Always backup your world before updating NeoForge or mods!
:::

## Installing Modpacks

The Minecraft Launcher does not offer functionality to automatically install collections of mods, so-called modpacks. This generally falls into the territory of [third-party launchers][launchers].

[curseforge]: https://www.curseforge.com/minecraft/search?class=mc-mods
[dotminecraft]: https://minecraft.wiki/w/.minecraft
[java]: index.md#java
[launchers]: launchers.md
[modrinth]: https://modrinth.com/mods
[neoforged]: https://neoforged.net
