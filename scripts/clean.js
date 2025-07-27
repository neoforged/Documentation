/**
 * Cleanup dynamic documentation sections.
 */
const fs = require('node:fs');
const common = require('./common');

const PRIMER_PATH = common.primerPath;
const TOOLCHAIN_PLUGIN_PATH = common.toolchainPluginPath;

// Cleanup primers
if (fs.existsSync(PRIMER_PATH)) {
    fs.rmSync(PRIMER_PATH, { recursive: true, force: true });
}

// Cleanup toolchain plugins
if (fs.existsSync(TOOLCHAIN_PLUGIN_PATH)) {
    fs.rmSync(TOOLCHAIN_PLUGIN_PATH, { recursive: true, force: true });
}
