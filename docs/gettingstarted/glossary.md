# Glossary

This article contains explanations for various terms and systems you will likely encounter when using NeoForge.

## A

### Access Transformer

Access Transformers, also known as ATs, are a way to change the access modifiers (`private`, `protected`, `public`) and the `final` state of a class, field or method. For more information, see the [Access Transformers article][accesstransformerdocs].

## B

### Block State

_See [Blockstates][blockstatedocs]._

### Bukkit

Bukkit is a software for Minecraft servers that allows for installing [plugins][plugin]. Plugins run exclusively on the server, allowing vanilla clients to connect (in contrast to [mods][mod], which are generally expected to be present on both sides).

Bukkit itself was discontinued in 2014, but forks of the project have appeared and are used to this day. Some of the most prominent ones include Spigot and Paper.

## C

### Client

The "display" side of the game, responsible for displaying information to the user, and for processing inputs. The opposite of the client is the [server].

_See also: [Sides][sidesdocs]_

### Coremod

A coremod is the term for an ASM transformer file used within a mod. Traditionally, coremods were written as JavaScript files that were then loaded by a special coremod engine during [Forge][forge] or [NeoForge][neoforge] startup. More recently, Java coremods were developed as a more robust alternative. Coremods have a high entry barrier and are generally considered a last resort solution for most problems. Many problems can be solved easier using API methods, or using [mixins][mixin].

Historically, the term "coremod" has also been incorrectly used for [library mods][librarymod].

### CurseForge

A platform for mod distribution, found at [https://www.curseforge.com/minecraft][curseforgelink]. Besides Minecraft mods, a number of other games also have mods on CurseForge. CurseForge is not affiliated with [Forge][forge] or [NeoForge][neoforge] in any way, the similar name is merely a coincidence: CurseForge originally started out as a platform for World of Warcraft addons, long before Minecraft itself even existed.

## D

### Data Pack

Data packs are a mechanism in Minecraft that allows modifying game data exposed specifically for this purpose, using JSON files. For example, these include recipes or advancements.

_See also: [Resources/Data][datapackarticle]_

## F

### Fabric

Fabric is a modding framework, created as an alternative for [Minecraft Forge][forge] and first released in December 2018 for Minecraft 1.14. Fabric employs some fundamentally different API concepts to NeoForge, which makes for a significantly different development experience compared to [NeoForge][neoforge].

### FML

FancyModLoader, commonly abbreviated as FML, is the [mod loader][modloader] used by and bundled with NeoForge. It is maintained by a separate team and has its own repository on GitHub. It was forked from [Forge][forge]'s Forge Mod Loader, also abbreviated as FML.

### Forge

Minecraft Forge, commonly known simply as Forge, is a modding framework for Minecraft, first released in March 2012 for Minecraft 1.1. Forge allows users to install mods into Minecraft, and allows modders to easily interface with the Minecraft source code. Due to a series of disagreements within the Forge team, it was decided to fork Forge, creating the [NeoForge][neoforge] modding framework and the [NeoForged][neoforged] project in July 2023.

## G

### Game Library

A game library is a programming library that references Minecraft or [NeoForge][neoforge] code, but is not a mod. It is usually shipped with an existing mod's JAR using the [Jar-in-Jar][jarinjar] system.

## I

### Item Stack

_See [Item Stacks][itemstackdocs]._

## J

### Jar-in-Jar

Jar-in-Jar, often shortened to JarJar, is a feature of [NeoGradle][neogradle] and [ModDevGradle][moddevgradle] that allows including library JARs inside a mod JAR, and handles version conflicts for cases where multiple mods ship the same library.

## L

### Level

A level is a part of the world that roughly maps to what the end user knows as a dimension. By default, a world contains three levels: the overworld, the nether and the end. Levels can contain blocks, entities, and block entities, alongside some other data.

### Library Mod

A library mod is a programming library that is loaded by the [mod loader][modloader] as if it were a mod. Library mods are often used to minimize code duplication across multiple mods, or to provide common functionality to many mods. [Game libraries][gamelibrary] were developed as an alternative to library mods.

### License

A license is a legal document that determines what other people can and cannot do with your work. [NeoForge][neoforge] requires all mods to define a license.

Generally, if an IP (intellectual property) does not specify a license, it is assumed that the license is ARR (All Rights Reserved). This means that nobody except you, or people with your explicit permission, are legally allowed to use your work.

In the modding space, it is common to use an open-source license, such as the MIT License, the General Public License, the Lesser General Public License, or a Creative Commons License. There are several websites to assist in choosing a license, for example [https://choosealicense.com]. NeoForge itself is licensed under the Lesser General Public License v2.1.

## M

### MDK

A mod development kit, or MDK for short, is an example mod project for [modders][modder] to start with. NeoForge's MDKs can be found under the [NeoForge MDKs GitHub organization][neoforgemdksgithub].

### Mixin

Mixins are a way to directly modify Minecraft code using special classes annotated with the `@Mixin` annotation. The Mixin library was originally created by the Sponge project (a [Bukkit][bukkit] fork), this version is informally known as SpongeMixin. NeoForge has since switched to using a fork of SpongeMixin maintained by the [Fabric][fabric] developers, commonly referred to as FabricMixin, which offers some additional features and bugfixes.

### MixinExtras

An add-on library for [Mixin][mixin] that contains extra functionality for mixin classes.

### Mod

A mod, short for modification, is a kind of add-on to an existing program, usually a game. Mods are not a concept exclusive to Minecraft, but exist for many other games as well. Some examples for commonly modded games include Terraria, Factorio and Skyrim.

Mods may modify any part of the game, ranging from singular bugfixes to adding huge amounts of content, sometimes even more than the base game offers. In the Minecraft context, the term "mod" should be distinguished from other mechanisms to modify the game, such as resource packs, data packs, or plugins.

### Mod Loader

A mod loader is a program whose purpose is to load [mods][mod] into the game. All modern modding frameworks for Minecraft include a mod loader and a [modding API][moddingapi].

### Modded

The term "modded" refers to a game with [mods][mod] installed. Since mods exist for other games, the term may also be applied to those (e.g., "modded Terraria", "modded Skyrim"). The opposite of modded is [vanilla].

### Modder

Short for "mod developer", i.e. the person creating [mods][mod].

### ModDevGradle

An alternative gradle plugin for mod development, designed to be easier-to-use (although slightly less powerful) than [NeoGradle][neogradle].

### Modding

The process of creating [mods][mod].

### Modding API

An [API](https://en.wikipedia.org/wiki/API) created to help [modders][modder] in [modding]. Generally includes ways to make integrating with vanilla systems easier. All modern modding frameworks for Minecraft include a modding API and a [mod loader][modloader].

### Modpack

A collection of [mods][mod], usually preconfigured and ready for users to play. Some modpacks may also include bundled [resource packs][resourcepack] and/or [data packs][datapack].

### Modrinth

A platform for mod distribution, found at [https://modrinth.com][modrinthlink]. Unlike [CurseForge][curseforge], Modrinth is solely focused on Minecraft, offering mods, [data packs][datapack], [resource packs][resourcepack] and other Minecraft-related content.

## N

### NeoForge

The software this documentation is about. NeoForge is a modding framework for Minecraft, first released in July 2023 for Minecraft 1.20.1. NeoForge allows users to install mods into Minecraft, and allows modders to easily interface with the Minecraft source code. It was forked from the Minecraft Forge project in July 2023.

### NeoForged

The NeoForged project is the organizational structure around [NeoForge][neoforge]. The name was chosen because the `neoforge` username was already taken on GitHub. Simply put, NeoForge (without `d`) is the modding framework, and NeoForged (with `d`) is the surrounding organization.

### NeoGradle

The Gradle plugin used for NeoForge development.

## P

### Parchment

Parchment is a system that provides human-readable names for parameters in the Minecraft source code. It is maintained by a separate team, but natively shipped with [NeoGradle][neogradle].

### Plugin

Similar to [mods][mod], plugins are a way to modify Minecraft. Unlike mods, plugins are by design server-only modifications, meaning that vanilla clients will be able to connect to a server that has plugins installed. Plugins are generally run on [Bukkit][bukkit] or one of its derivatives.

## Q

### Quilt

Quilt is a modding framework, forked from [Fabric][fabric] in April 2021 over internal issues within the Fabric team. It is generally compatible with Fabric mods, but not the other way around (so Fabric mods should mostly work on Quilt, but Quilt mods may not work on Fabric).

## R

### Resource Packs

Resource packs are a mechanism in Minecraft that allows changing textures (hence the old name "texture packs"), sounds, models, translations and other display information.

_See also: [Resources/Assets][resourcepackarticle]_

## S

### Server

The game-handling side of the game, responsible for handling updates of the world. The opposite of the server is the [client].

_See also: [Sides][sidesdocs]_

## V

### Vanilla

The term "vanilla" refers to a game that has not been [modded], i.e. a game with no [mods][mod] or [mod loader][modloader] installed. It can be applied to any game that has a modding community - vanilla Minecraft, vanilla Factorio, etc. The opposite of vanilla is [modded].

[accesstransformerdocs]: ../advanced/accesstransformers.md
[blockstatedocs]: ../blocks/states.md
[bukkit]: #bukkit
[client]: #client
[curseforge]: #curseforge
[curseforgelink]: https://www.curseforge.com/minecraft
[datapack]: #data-pack
[datapackarticle]: ../resources/index.md#data
[fabric]: #fabric
[fml]: #fml
[forge]: #forge
[gamelibrary]: #game-library
[itemstackdocs]: ../items/index.md#itemstacks
[jarinjar]: #jar-in-jar
[librarymod]: #library-mod
[mixin]: #mixin
[mod]: #mod
[modded]: #modded
[modder]: #modder
[moddevgradle]: #moddevgradle
[modding]: #modding
[moddingapi]: #modding-api
[modloader]: #mod-loader
[modrinthlink]: https://modrinth.com
[neoforge]: #neoforge
[neoforgemdksgithub]: https://github.com/neoforgemdks
[neoforged]: #neoforged
[neogradle]: #neogradle
[plugin]: #plugin
[resourcepack]: #resource-packs
[resourcepackarticle]: ../resources/index.md#assets
[server]: #server
[sidesdocs]: ../concepts/sides.md
[vanilla]: #vanilla
