# Run Configurations

Run configurations define how an instance of the game is going to run. This includes arguments, working directories, task names, etc. Run configurations are defined within the `runs` block. No runs are configured by default; however, NeoGradle provides the configurations `client`, `server`, `data` and `gameTestServer` out of the box.

```gradle
runs {
    // Configure runs here
}
```

Run configurations can be added similar to any `NamedDomainObjectContainer` using closures.

```gradle
runs {
    // Creates or configures the run configuration named 'client'
    client {
        // Configure run
    }
}
```

The following configurations properties are available:

```gradle 
// Inside the runs block
client {
    // Sets the entrypoint of the program to launch
    // NeoForge sets userdev main to be 'cpw.mods.bootstraplauncher.BootstrapLauncher'
    main 'com.example.Main'

    // Sets the working directory of the config
    // Defaults to './run'
    workingDirectory 'run'

    // Sets whether this is a run of a specific type
    // Generally, only one of these should be true for a given configuration
    client true
    server false
    dataGenerator false
    gameTest false

    // Sets an environment variable for the run
    // Value will be interpreted as a file or a string
    env 'envKey', 'value'

    // Sets a system property
    // Value will be interpreted as a file or a string
    props 'propKey', 'value'

    // Sets an argument to be passed into the application
    args 'hello'

    // Sets a JVM argument
    jvmArgs '-Xmx2G'

    // Sets the source this run should pull from
    modSource project.sourceSets.main
}
```

### Configuring Multiple Runs

Configuring multiple runs at once can be done with `configureEach`:

```gradle
runs.configureEach {
    // All runs should use the main source set to load the mod
    modSource project.sourceSets.main
}
```
