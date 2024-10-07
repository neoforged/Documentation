---
sidebar_position: 4
---

# Frequently Asked Questions

This section aims to answer some common questions as well as covering some pitfalls you might experience when using the NeoForge installer.

## Troubleshooting the NeoForge Installer

For most users the installer should run without error.

If the installer runs but pops up an error dialog box while executing, see the [NeoForge Installer Log File] section below.

### Troubleshooting the NeoForge Installer on Windows

File associations for executing Java applications are sometimes missing or otherwise misconfigured.

For example, running the installer may momentarily flash up a black window, present the `Open with ...` dialog box, or it might open in a file archiving program such as WinRAR or 7-Zip.

To fix this, download and run (double-click) [JarFix], a program designed to fix broken or missing file associations.

Once complete, restart your computer and try running the installer again.

### Troubleshooting the NeoForge Installer on Linux

File associations for executing Java applications are often missing completely on Linux distributions.

In order to run the installer you may need to execute it manually in a terminal.

For instance, with an installer for NeoForge version `21.1.54`, running the following in a terminal should bring up its GUI:

```
$ java -jar neoforge-21.1.54-installer.jar
```

For pointers on finding a terminal application on Linux, see the [Locating a Terminal Application] section in the [Checking for and Installing Java] article.

### NeoForge Installer Log File

When experiencing issues with the NeoForge installer, you might be asked to provide its log file, which should be created in the same directory the installer itself resides in.

For example, the installer for version `21.1.54` should create a file with the name of `neoforge-21.1.54-installer.jar.log`.

## Troubleshooting NeoForge

You might run into problems when trying to launch Minecraft with NeoForge installed.

This can happen for a number of reasons, including out-dated and/or buggy graphics card (GPU) drivers.

First, check to see whether Minecraft without NeoForge works.  If the game launches successfully and does not crash, read on.

If Minecraft by itself crashes, you will not be able to install NeoForge.

### Updating GPU Drivers

Due to an interaction between NeoForge's early-loading screen and out-dated/buggy GPU drivers, Minecraft may crash.

This can sometimes be fixed by updating the drivers for your GPU.

Linked below are tools for the three most common GPU manufacturers, which can be used to download and install driver updates.

- **Intel**: https://www.intel.com/content/www/us/en/support/detect.html
- **AMD**: https://www.amd.com/en/support
- **NVIDIA**: https://www.nvidia.com/download/index.aspx

:::note
It is possible that your computer may have multiple GPUs.

For example, a laptop might have one integrated into the CPU itself as well as a dedicated (discrete) GPU.
:::

If you do not know who manufactured your GPU, how many you have, or even which drivers to update, see the [Further Help] section of the main article for a link to the NeoForged project's Discord server, where you can ask for help.

[JarFix]: https://johann.loefflmann.net/downloads/jarfix.exe
[Locating a Terminal Application]: ./java.mdx#locating-a-terminal-application
[Checking for and Installing Java]: ./java.mdx
[NeoForge Installer Log File]: ./faq.md#neoforge-installer-log-file
[Further Help]: ./index.md#further-help