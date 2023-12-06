# Mod Files

The mod files are responsible for determining what mods are packaged into your JAR, what information to display within the 'Mods' menu, and how your mod should be loaded in the game.

## mods.toml

The `mods.toml` file defines the metadata of your mod(s). It also contains additional information on how your mod(s) should be loaded into the game, as well as display information that is displayed within the 'Mods' menu.

The file uses the [TOML][toml] format. It must be stored under the `META-INF` folder in the resource directory of the source set you are using (`src/main/resources/META-INF/mods.toml` for the `main` source set). [The `mods.toml` provided by the MDK][mdkmodstoml] contains comments explaining every entry, they will be explained here in more detail.

The `mods.toml` can be separated into three parts: the non-mod-specific properties, which are linked to the mod file; the mod properties, with a section for each mod; and the dependency configurations, with a section for each mod's or mods' dependencies. Some of the properties associated with the `mods.toml` file are mandatory; mandatory properties require a value to be specified, otherwise an exception will be thrown.

The default MDK replaces various properties in this file at build time. For example, the `license` field is replaced by the `mod_license` property from `gradle.properties`. Values that are replaced like this should be edited in the `gradle.properties` instead.

### Non-Mod-Specific Properties

Non-mod-specific properties are properties associated with the JAR itself, indicating how to load the mod(s) and any additional global metadata.

| Property             |  Type   |    Default    |                                                                                                                                                                    Description                                                                                                                                                                     | Example                                                                        |
|:---------------------|:-------:|:-------------:|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|:-------------------------------------------------------------------------------|
| `modLoader`          | string  | **mandatory** | The language loader used by the mod(s). Can be used to support alternative language structures, such as Kotlin objects for the main file, or different methods of determining the entrypoint, such as an interface or method. NeoForge provides the Java loader [`"javafml"`][javafml] and the lowcode/nocode loader [`"lowcodefml"`][lowcodefml]. | `modLoader="javafml"`                                                          |
| `loaderVersion`      | string  | **mandatory** |                                                                                           The acceptable version range of the language loader, expressed as a [Maven Version Range][mvr]. For `javafml` and `lowcodefml`, this is currently version `1`.                                                                                           | `loaderVersion="[1,)"`                                                         |
| `license`            | string  | **mandatory** |                                               The license the mod(s) in this JAR are provided under. It is suggested that this is set to the [SPDX identifier][spdx] you are using and/or a link to the license. You can visit https://choosealicense.com/ to help pick the license you want to use.                                               | `license="MIT"`                                                                |
| `showAsResourcePack` | boolean |    `false`    |                                                                                     When `true`, the mod(s)'s resources will be displayed as a separate resource pack on the 'Resource Packs' menu, rather than being combined with the 'Mod resources' pack.                                                                                      | `showAsResourcePack=true`                                                      |
| `services`           |  array  |     `[]`      |                                                                                         An array of services your mod uses. This is consumed as part of the created module for the mod from NeoForge's implementation of the Java Platform Module System.                                                                                          | `services=["net.minecraftforge.forgespi.language.IModLanguageProvider"]`       |
| `properties`         |  table  |     `{}`      |                                                                                                          A table of substitution properties. This is used by `StringSubstitutor` to replace `${file.<key>}` with its corresponding value.                                                                                                          | `properties={"example"="1.2.3"}` (can then be referenced by `${file.example}`) |
| `issueTrackerURL`    | string  |   *nothing*   |                                                                                                                                      A URL representing the place to report and track issues with the mod(s).                                                                                                                                      | `"https://github.com/neoforged/NeoForge/issues"`                               |

:::note
The `services` property is functionally equivalent to specifying the [`uses` directive in a module][uses], which allows [loading a service of a given type][serviceload].

Alternatively, it can be defined in a service file inside the `src/main/resources/META-INF/services` folder, where the file name is the fully-qualified name of the service, and the file content is the name of the service to load (see also [this example from the AtlasViewer mod][atlasviewer]).
:::

### Mod-Specific Properties

Mod-specific properties are tied to the specified mod using the `[[mods]]` header. This is an [array of tables][array]; all key/value properties will be attached to that mod until the next header.

```toml
# Properties for examplemod1
[[mods]]
modId = "examplemod1"

# Properties for examplemod2
[[mods]]
modId = "examplemod2"
```

| Property        |  Type   |           Default           |                                                                                                                                  Description                                                                                                                                   | Example                                                         |
|:----------------|:-------:|:---------------------------:|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|:----------------------------------------------------------------|
| `modId`         | string  |        **mandatory**        |                                   The unique identifier representing this mod. The id must match `^[a-z][a-z0-9_]{1,63}$` (a string 2-64 characters; starts with a lowercase letter; made up of lowercase letters, numbers, or underscores).                                   | `modId="examplemod"`                                            |
| `namespace`     | string  |      value of `modId`       |                   An override namespace for the mod. The namespace much match `^[a-z][a-z0-9_.-]{1,63}$` (a string 2-64 characters; starts with a lowercase letter; made up of lowercase letters, numbers, underscores, dots, or dashes). Currently unused.                    | `namespace="example"`                                           |
| `version`       | string  |            `"1"`            | The version of the mod, preferably in a [variation of Maven versioning][versioning]. When set to `${file.jarVersion}`, it will be replaced with the value of the `Implementation-Version` property in the JAR's manifest (displays as `0.0NONE` in a development environment). | `version="1.20.2-1.0.0"`                                        |
| `displayName`   | string  |      value of `modId`       |                                                                                    The display name of the mod. Used when representing the mod on a screen (e.g., mod list, mod mismatch).                                                                                     | `displayName="Example Mod"`                                     |
| `description`   | string  | `'''MISSING DESCRIPTION'''` |                                                                           The description of the mod shown in the mod list screen. It is recommended to use a [multiline literal string][multiline].                                                                           | `description='''This is an example.'''`                         |
| `logoFile`      | string  |          *nothing*          |                                  The name and extension of an image file used on the mods list screen. The logo must be in the root of the JAR or directly in the root of the source set (e.g. `src/main/resources` for the main source set).                                  | `logoFile="example_logo.png"`                                   |
| `logoBlur`      | boolean |           `true`            |                                          Whether to use `GL_LINEAR*` (true) or `GL_NEAREST*` (false) to render the `logoFile`. In simpler terms, this means whether the logo should be blurred or not when trying to scale the logo.                                           | `logoBlur=false`                                                |
| `updateJSONURL` | string  |          *nothing*          |                                                                                A URL to a JSON used by the [update checker][update] to make sure the mod you are playing is the latest version.                                                                                | `updateJSONURL="https://example.github.io/update_checker.json"` |
| `features`      |  table  |            `{}`             |                                                                                                                                See [features].                                                                                                                                 | `features={java_version="[17,)"}`                               |
| `modproperties` |  table  |            `{}`             |                                                                                       A table of key/values associated with this mod. Unused by NeoForge, but is mainly for use by mods.                                                                                       | `modproperties={example="value"}`                               |
| `modUrl`        | string  |          *nothing*          |                                                                                                            A URL to the download page of the mod. Currently unused.                                                                                                            | `modUrl="https://neoforged.net/"`                               |
| `credits`       | string  |          *nothing*          |                                                                                                       Credits and acknowledges for the mod shown on the mod list screen.                                                                                                       | `credits="The person over here and there."`                     |
| `authors`       | string  |          *nothing*          |                                                                                                              The authors of the mod shown on the mod list screen.                                                                                                              | `authors="Example Person"`                                      |
| `displayURL`    | string  |          *nothing*          |                                                                                                       A URL to the display page of the mod shown on the mod list screen.                                                                                                       | `displayURL="https://minecraftforge.net/"`                      |
| `displayTest`   | string  |      `"MATCH_VERSION"`      |                                                                                                                                  See [sides].                                                                                                                                  | `displayTest="NONE"`                                            |

#### Features

The features system allows mods to demand that certain settings, software, or hardware are available when loading the system. When a feature is not satisfied, mod loading will fail, informing the user about the requirement. Currently, NeoForge provides the following features:

|     Feature     |                                                                                                Description                                                                                                | Example                             |
|:---------------:|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|:------------------------------------|
| `java_version`  |                           The acceptable version range of the Java version, expressed as a [Maven Version Range][mvr]. This should be the supported version used by Minecraft.                            | `features={java_version="[17,)"}`   |
| `openGLVersion` | The acceptable version range of the OpenGL version, expressed as a [Maven Version Range][mvr]. Minecraft requires OpenGL 3.2 or newer. If you want to require a newer OpenGL version, you can do so here. | `features={openGLVersion="[4.6,)"}` |

### Dependency Configurations

Mods can specify their dependencies, which are checked by NeoForge before loading the mods. These configurations are created using the [array of tables][array] `[[dependencies.<modid>]]`, where `modid` is the identifier of the mod that consumes the dependency.

| Property       |  Type   |    Default    |                                                               Description                                                               | Example                                      |
|:---------------|:-------:|:-------------:|:---------------------------------------------------------------------------------------------------------------------------------------:|:---------------------------------------------|
| `modId`        | string  | **mandatory** |                                            The identifier of the mod added as a dependency.                                             | `modId="jei"`                                |
| `mandatory`    | boolean | **mandatory** |                                     Whether the game should crash when this dependency is not met.                                      | `mandatory=true`                             |
| `versionRange` | string  |     `""`      |  The acceptable version range of the language loader, expressed as a [Maven Version Range][mvr]. An empty string matches any version.   | `versionRange="[1, 2)"`                      |
| `ordering`     | string  |   `"NONE"`    | Defines if the mod must load before (`"BEFORE"`) or after (`"AFTER"`) this dependency. If the ordering does not matter, return `"NONE"` | `ordering="AFTER"`                           |
| `side`         | string  |   `"BOTH"`    |                    The [physical side][dist] the dependency must be present on: `"CLIENT"`, `"SERVER"`, or `"BOTH"`.                    | `side="CLIENT"`                              |
| `referralUrl`  | string  |   *nothing*   |                                     A URL to the download page of the dependency. Currently unused.                                     | `referralUrl="https://library.example.com/"` |

:::danger
The `ordering` of two mods may cause a crash due to a cyclic dependency, for example if mod A must load `"BEFORE"` mod B and at the same time, mod B must load `"BEFORE"` mod A.
:::

## Mod Entrypoints

Now that the `mods.toml` is filled out, we need to provide an entrypoint for the mod. Entrypoints are essentially the starting point for executing the mod. The entrypoint itself is determined by the language loader used in the `mods.toml`.

### `javafml` and `@Mod`

`javafml` is a language loader provided by NeoForge for the Java programming language. The entrypoint is defined using a public class with the `@Mod` annotation. The value of `@Mod` must contain one of the mod ids specified within the `mods.toml`. From there, all initialization logic (e.g. [registering events][events] or [adding `DeferredRegister`s][registration]) can be specified within the constructor of the class.

```java
@Mod("examplemod") // Must match a mod id in the mods.toml
public class Example {
  public Example(IEventBus modBus) { // The parameter is the mod-specific event bus, needed e.g. for registration and events
    // Initialize logic here
  }
}
```

:::note
There must be a 1-to-1 matching of mods in the `mods.toml` file and `@Mod` entrypoints. This means that for every mod defined, there must be exactly one `@Mod` annotation with that mod's id.
:::

### `lowcodefml`

`lowcodefml` is a language loader used as a way to distribute datapacks and resource packs as mods without the need of an in-code entrypoint. It is specified as `lowcodefml` rather than `nocodefml` for minor additions in the future that might require minimal coding.

[array]: https://toml.io/en/v1.0.0#array-of-tables
[atlasviewer]: https://github.com/XFactHD/AtlasViewer/blob/1.20.2/neoforge/src/main/resources/META-INF/services/xfacthd.atlasviewer.platform.services.IPlatformHelper
[dist]: ../concepts/sides.md#different-kinds-of-sides
[events]: ../concepts/events.md
[features]: #features
[javafml]: #javafml-and-mod
[lowcodefml]: #lowcodefml
[mdkmodstoml]: https://github.com/neoforged/MDK/blob/main/src/main/resources/META-INF/mods.toml
[multiline]: https://toml.io/en/v1.0.0#string
[mvr]: https://maven.apache.org/enforcer/enforcer-rules/versionRanges.html
[registration]: ../concepts/registries.md#deferredregister
[serviceload]: https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/ServiceLoader.html#load(java.lang.Class)
[sides]: ../concepts/sides.md#writing-one-sided-mods
[spdx]: https://spdx.org/licenses/
[toml]: https://toml.io/
[update]: ../misc/updatechecker.md
[uses]: https://docs.oracle.com/javase/specs/jls/se17/html/jls-7.html#jls-7.7.3
[versioning]: ./versioning.md
