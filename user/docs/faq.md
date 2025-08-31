---
sidebar_position: 4
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Troubleshooting & FAQ

This page lists some common problems when installing or running NeoForge modpacks. If your problem isn't covered here, please see the [Getting Support][support] section.

## Installing Java or NeoForge

### I downloaded the installer file, but I have no way of running it!

Please see the [Installing Java][installjava] section. Yes, even if you already have Minecraft: Java Edition installed.

### I installed Java, but I'm still getting the wrong version!

This likely means that your PATH variable is not set, or set incorrectly. To do this, do the following depending on your operating system:

<Tabs defaultValue="windows">
  <TabItem value="windows" label="Windows">
Download and run the [Jarfix program][jarfix].
  </TabItem>
  <TabItem value="macos" label="MacOS">
Open Finder. In Finder, open the Applications/Utilities folder and double-click Terminal.

Run the following command: `echo export "JAVA_HOME=\$(/usr/libexec/java_home)" >> ~/.bash_profile`

Then, close Terminal and try again.
  </TabItem>
  <TabItem value="linux" label="Linux">
Open the terminal for your Linux distribution. Common names would be `GNOME Terminal` or `Konsole`, however it may vary depending on your exact setup.

Find the location where Java is stored. Often, this will be something like `/usr/lib/jvm/java-21-openjdk-amd64`.

Run the following commands:

- `echo export "JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64/" >> ~/.bashrc` (swapping out the path for the actual path if needed)
- `echo export PATH=$PATH:$JAVA_HOME/bin`

Then, close the terminal and try again.
  </TabItem>
</Tabs>

### I am getting an error saying "Could not find or load main class @user_jvm_args.txt", what do I do?

There are two common reasons for this:

- You are running an outdated version of Java. Please see the [Installing Java][installjava] section.
- You have multiple versions of Java installed on your computer, possibly installed one of them just right now, but your computer is still using the old one. This means that your PATH variable is not set correctly. Please follow the steps outlined [here][wrongjava].

## Playing NeoForge

Sometimes, issues show up not during installation, but during gameplay.

### My game is lagging! What can I do?

Identify whether the problem is on the server or the client (or both).

- If your game is running at low FPS (frames per second), please read [My client is lagging! What can I do?][clientlag]
- If your game is running at decent enough FPS, but your world is lagging (machines running too slowly, mobs lagging behind visually, etc.), please read [My server is lagging! What can I do?][serverlag]

### My server is lagging! What can I do?

There is multiple reasons why this could be. A common offender are too many entities (= mobs or dropped items) or block entities (= chests, machines, etc.) being nearby.

If you want an exact breakdown of what is lagging, try using the [Spark][spark] mod. Spark is a profiler that can tell you what code paths are taking how long. To use it:

- Join a world.
- Run the `/spark profiler` command.
- Wait a couple of minutes.
- Run the `/spark profiler --stop` command.
- Open the link and have a look or, if you can't make any sense of it, post it in the [Discord server][support]'s `#user-support` channel and we will try our best to help you.

### My client is lagging! What can I do?

This is commonly because Minecraft is not a very optimized game, and mods can make this worse. If you are running shaders, chances are also that your graphics card is not strong enough to support them.

If you want an exact breakdown of what is lagging, try using the [Spark][spark] mod. Spark is a profiler that can tell you what code paths are taking how long. To use it:

- Join a world.
- Run the `/sparkc profiler` command. (Note the use of `/sparkc`, as opposed to `/spark` to profile the server.)
- Wait a couple of minutes.
- Run the `/sparkc profiler --stop` command.
- Open the link and have a look or, if you can't make any sense of it, post it in the [Discord server][support]'s `#user-support` channel and we will try our best to help you.

### How do I find a faulty mod?

If you need to find a faulty mod without any lead on where to start, your best bet may be to use a binary search. The binary search is a common way to find a faulty things among many, without going through things one by one. Reworded for mods, it goes as follows:

1. Remove half of the existing mods and put them into a different folder.
2. Run the game.
3. Find out if the issue still exists.
    - If yes: Repeat from step 1 with the current mods in place.
    - If no: Swap out the most recently added mods with the ones most recently set aside, and repeat from step 1.
4. Repeat this until you found the problematic mod(s).

### I am having visual issues!

Visual issues are often caused by outdated graphics drivers. Please update your graphics drivers, depending on your graphics card brand: [AMD][amd] | [Intel][intel] | [NVIDIA][nvidia]

If your issue still persists after updating your graphics drivers, see [Getting Support][support].

## Getting Support

If your problem isn't covered here, you should feel free to join the [Discord server][discord] and ask for help in the `#user-support` channel. When doing so, please provide the following info if you can:

- A log (special kind of text file).
    - If you have an issue during installation, the log is found in the same location as the installer itself, with `.jar` (or `.log` if you have file extensions enabled) appended to its name.
    - If you have an issue during gameplay, the logs are found in your instance folder. Go into the `logs` folder and use the file called `debug`, or `debug.log` if you have file extensions enabled.
- A [Spark report][sparkreport], in the event that you made one.

### There is no `debug.log`!

If you are using the [CurseForge app][curseforge] to play, it is possible that the app disabled the `debug.log` file being created. If that is the case, you need to re-enable it. To do so:

- Open the Settings (gear icon at the bottom left).
- Under Game-Specific Settings, navigate to Minecraft.
- Under Advanced, toggle on the "Enable Forge debug.log" option.

Then, re-launch the game to provide a fresh `debug.log`.

If you are not using CurseForge, or if you are using CurseForge and have enabled the logging option but there's still no `debug.log`, it is possible that the game crashes before a `debug.log` can even be created. In this case, a launcher log can help us instead.

To get a launcher log, open your `.minecraft` folder and find the `launcher_log` file (or `launcher_log.txt` if you have file extensions enabled). The `.minecraft` folder can be found at the following location:

<Tabs defaultValue="windows">
  <TabItem value="windows" label="Windows">
`%APPDATA%\.minecraft`
  </TabItem>
  <TabItem value="macos" label="MacOS">
`~/Library/Application Support/minecraft`
  </TabItem>
  <TabItem value="linux" label="Linux">
`~/.minecraft`
  </TabItem>
</Tabs>

[amd]: https://www.amd.com/en/support
[clientlag]: #my-client-is-lagging-what-can-i-do
[curseforge]: launchers.md#curseforge-app
[discord]: https://discord.neoforged.net/
[intel]: https://www.intel.com/content/www/us/en/support/detect.html
[installjava]: index.md#installing-java
[jarfix]: https://johann.loefflmann.net/en/software/jarfix/index.html
[launcher]: launchers.md
[nvidia]: https://www.nvidia.com/download/index.aspx
[serverlag]: #my-server-is-lagging-what-can-i-do
[spark]: https://www.curseforge.com/minecraft/mc-mods/spark
[sparkreport]: #my-game-is-lagging-what-can-i-do
[support]: #getting-support
[wrongjava]: #i-installed-java-but-im-still-getting-the-wrong-version
