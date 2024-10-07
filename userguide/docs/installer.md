---
sidebar_position: 2
---

# Installing NeoForge

## Running The Installer

The NeoForge installer is OS-agnostic and is universal in that it can be used to install on both the client and server.

With Java installed, you should be able to just double-click the installer's `.jar` file and proceed from there.

If double-clicking does not bring up the installer's GUI, or doing so presents you with an OS error, see the section [Troubleshooting the NeoForge Installer] of the [FAQ].

## Installing NeoForge on a Server

You might want to install NeoForge on a "headless" server which does not have a GUI and therefore no means of double-clicking to run the installer.

Usually this will mean that you need to use remote-access software such as [OpenSSH] to open a terminal and install via the command line.

With a terminal opened on the server you wish to install on, the installer is reaady to be launched.

For example, to install NeoForge version `21.1.51`, run the following command:

```
java -jar neoforge-21.1.51-installer.jar --installServer
```

:::note
By default, this command will install to the current working directory.

If this is not what you want, specify the path you want to install the server to after the `--installServer` option, e.g. by replacing `--installServer` with `--installServer /path/to/install/to`.
:::

<!-- Add section on using the nifty ServerStarterJar? -->

[Troubleshooting the NeoForge Installer]: ./faq#troubleshooting-the-installer
[FAQ]: ./faq
[OpenSSH]: https://www.openssh.com/