/**
 * Utility of common fields and methods used by all scripts.
 */
const path = require('node:path');

const PRIMER_PATH = path.join(process.cwd(), 'primer');
const TOOLCHAIN_PLUGIN_PATH = path.join(process.cwd(), 'toolchain', 'docs', 'plugins');

module.exports = {
    /**
     * The path to the primer section.
     */
    primerPath: PRIMER_PATH,
    /**
     * The path to the plugins subsection within the toolchain features section.
     */
    toolchainPluginPath: TOOLCHAIN_PLUGIN_PATH
};
