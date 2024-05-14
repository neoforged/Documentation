import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# NeoGradle Configurations

NeoGradle has numerous configurations that can change how the development environment is configured.

## Enabling Access Transformers

[Access Transformers][at] can widen the visibility or modify the `final` flag of Minecraft classes, methods, and fields.

<Tabs defaultValue="latest">
<TabItem value="latest" label="Latest">
To enable Access Transformers in the production environment, you can set `accessTransformers` to the configuration file in question:

```gradle
minecraft {
    // ...

    // Add an Access Transformer file relative to the project's directory
    accessTransformers {
        file('src/main/resources/META-INF/accesstransformer.cfg')

        // Multiple files can be specified and are applied in order
        file('src/main/resources/accesstransformer_extras.cfg')
    }
}
```

In production, NeoForge will search for Access Transformer files as specified in `mods.toml`, or at `META-INF/accesstransformer.cfg` if none are specified:

```toml
[[accessTransformers]]
file="META-INF/accesstransformer.cfg"

[[accessTransformers]]
file="accesstransformer_extras.cfg"
```

</TabItem>


<TabItem value="7.0.40" label="7.0.40 and older">
To enable Access Transformers in the production environment, you can set `accessTransformer` to the configuration file in question:

```gradle
minecraft {
    // ...

    // Add an access transformer file relative to the project's directory
    accessTransformer = file('src/main/resources/META-INF/accesstransformer.cfg')
}
```

:::caution
While the Access Transformer in the development environment can be read from anywhere the user specifies, in production, the file will only be read from `META-INF/accesstransformer.cfg`.
:::

</TabItem>
</Tabs>

[at]: https://docs.neoforged.net/docs/advanced/accesstransformers
