# Jar-in-Jar

Jar-in-Jar is a way to load dependencies for mods from within the jars of the mods. To accomplish this, Jar-in-Jar generates a metadata json within `META-INF/jarjar/metadata.json` on build containing the artifacts to load from within the jar.

Jar-in-Jar is a completely optional system. This will include all dependencies from the `jarJar` configuration into the `jarJar` task. You can configure the task similarly to other jar tasks:

```gradle
// In build.gradle

// Configure the 'jarJar' task
// 'all' is the default classifier
tasks.named('jarJar') {
    // ...
}
```

## Adding Dependencies

You can add dependencies to be included inside your jar using the `jarJar` configuration. As Jar-in-Jar is a negotiation system, all versions should supply a supported range.

```gradle
// In build.gradle
dependencies {
    // Compiles against and includes the highest supported version of examplelib
    //   between 2.0 (inclusive) and 3.0 (exclusive)
    jarJar(implementation(group: 'com.example', name: 'examplelib', version: '[2.0,3.0)'))
}
```

If you need to specify an exact version to include rather than the highest supported version in the range, you can configure `version#prefer` within the dependency closure. In these instances, the artifact version will be used during compile time while the pinned version will be bundled inside the mod jar.

```gradle
// In build.gradle
dependencies {
    // Compiles against the highest supported version of examplelib
    //   between 2.0 (inclusive) and 3.0 (exclusive)
    jarJar(implementation(group: 'com.example', name: 'examplelib', version: '[2.0,3.0)')') {
        version {
            // Includes examplelib 2.8.0
            prefer '2.8.0'
        }
    }
}
```

You can additionally pin a version range while compiling against a specific version instead:

```gradle
// In build.gradle
dependencies {
    // Compiles against examplelib 2.8.0
    jarJar(implementation(group: 'com.example', name: 'examplelib', version: '2.8.0')) {
      version {
        // Includes the highest supported version of examplelib
        //   between 2.0 (inclusive) and 3.0 (exclusive)
        strictly '[2.0,3.0)'
      }
    }
}
```

