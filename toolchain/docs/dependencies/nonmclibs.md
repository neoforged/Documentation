---
sidebar_position: 1
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Non-Minecraft Dependencies

Non-Minecraft dependencies are artifacts that are neither a mod nor a dependency Minecraft or NeoForge itself relies on. By default, NeoForge does not load non-Minecraft dependencies when loading a mod. For development environments, they must be added as a runtime dependencies, while production environments should make use of the [jar-in-jar system][jij].

For example, you can add the `com.example:example` library to all runs like so:

<Tabs defaultValue="mdg">
<TabItem value="mdg" label="ModDevGradle">

```gradle
dependencies {
    // This is still required to add the library at compile time
    implementation 'com.example:example:1.0'
    // This adds the library to all the runs
    additionalRuntimeClasspath 'com.example:example:1.0'
}
```

</TabItem>
<TabItem value="ng" label="NeoGradle">

```gradle
dependencies {
    implementation 'com.example:example:1.0'
}

runs {
    configureEach {
        dependencies {
            // highlight-next-line
            runtime 'com.example:example:1.0'
        }
    }
}
```

Or, you can use a configuration:

```gradle
configurations {
    libraries
    // This will make sure that all dependencies that you add to the libraries configuration will also be added to the implementation configuration
    // This way, you only need one dependency declaration for both runtime and compile dependencies
    implementation.extendsFrom libraries
}

dependencies {
    libraries 'com.example:example:1.0'
}

runs {
    configureEach {
        dependencies {
            // highlight-next-line
            runtime project.configurations.libraries
        }
    }
}
```

</TabItem>
</Tabs>

:::tip
If you instead only want to add a runtime dependency to one specific run:

<Tabs defaultValue="mdg">
<TabItem value="mdg" label="ModDevGradle">

```gradle
dependencies {
    implementation 'com.example:example:1.0'
    // Only add dependency for the client run
    // highlight-next-line
    clientAdditionalRuntimeClasspath 'com.example:example:1.0'
}
```

</TabItem>
<TabItem value="ng" label="NeoGradle">

```gradle
runs {
    // Only configure dependencies for the client run
    // highlight-next-line
    named('client').configure {
        dependencies {

        }
    }
}
```

</TabItem>
</Tabs>

:::

[jij]: jarinjar.md
