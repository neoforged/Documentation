# NeoForged Documentation

This repository is used to store documentation on NeoForge, the Minecraft modding API. It also contains documentation on NeoGradle, a Gradle plugin for developing NeoForge and mods using NeoForge.

The documentation is built using [Docusaurus 3](https://docusaurus.io)

## Contributing

You can read the [contribution guidelines on the docs](https://docs.neoforged.net/contributing/).

If you wish to contribute to the documentation, fork and clone this repository.

The documentation uses Node.js 18. This can either be install manually or using a version manager that supports `.node-version` or `.nvmrc`. One or both of the following commands can be used to install and use the correct Node.js version:

```bash
# Replace [version_manager] with your node version manager (e.g., nvm, nvs, etc.)
[version_manager] install
[version_manager] use
```

You can run the following commands if you wish to preview the documentation website locally through the live development server. Most changes are reflected live without having to restart the server.

```bash
npm install
npm run start
```

### Building

If you wish to build a static version of the documentation which can be deployed, you can run the following command:

```bash
npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.
