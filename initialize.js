/**
 * Setup dynamic documentation sections.
 */
const fs = require('node:fs');
const chp = require('node:child_process');
const os = require('node:os');
const path = require('node:path');

/**
 * Pulls a repositories and copies over the necessary files and directories to the
 * desired location
 * 
 * @param {string} git The git repository to pull from.
 * @param {string} to The base directory to write the repository data to.
 * @param {Object.<string, string>} directoryMap A map of directories to copy `key -> value`
 * relative to the `git` and `to` location.
 * @param {Object.<string, string>} fileMap A map of files to copy `key -> value` relative
 * to the `git` and `to` location.
 */
function pullRepository(git, to, directoryMap = {}, fileMap = {}) {
    // Get temporary directory
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-'), { recursive: true} );

    // Pull repository to temp
    chp.execSync(`git clone ${git} ${tmpDir}`);

    // Copy directories
    for (const [key, value] of Object.entries(directoryMap)) {
        const keyLoc = path.join(tmpDir, key);
        const valueLoc = path.join(to, value);
        fs.mkdirSync(valueLoc, { recursive: true });
        fs.cpSync(keyLoc, valueLoc, { recursive: true });
    }

    // Copy files
    for (const [key, value] of Object.entries(fileMap)) {
        const keyLoc = path.join(tmpDir, key);
        const valueLoc = path.join(to, value);
        fs.mkdirSync(valueLoc.substring(0, valueLoc.lastIndexOf('/')), { recursive: true });
        fs.copyFileSync(keyLoc, valueLoc);
    }

    // Delete temp location
    fs.rmSync(tmpDir, { recursive: true, force: true });
}

/**
 * Appends a header to an individual file.
 * 
 * @param {string|(fileData:string)=>string} header The header to append, or a function to construct the
 * header from the file text.
 * @param {string} from The location of the file.
 * @param {string} to When present, writes the file to this location. Otherwise, uses `from`.
 */
function appendHeader(header, from, to = undefined) {
    // Read file
    const data = fs.readFileSync(from, { encoding: 'utf-8' });
    
    // Use from location if to isn't defined
    if (to === undefined) {
        to = from;
    } else {
        // Delete if to is present
        fs.rmSync(from);
    }

    const fd = fs.openSync(to, 'w+');
    const headerBuf = Buffer.from(typeof header === 'string' ? header : header(data));
    const dataBuf = Buffer.from(data);
    fs.writeSync(fd, headerBuf, 0, headerBuf.length, 0);
    fs.writeSync(fd, dataBuf, 0, dataBuf.length, headerBuf.length);
    fs.closeSync(fd);
}

const PRIMER_PATH = path.join(__dirname, 'primer');
const TOOLCHAIN_PLUGIN_PATH = path.join(__dirname, 'toolchain', 'docs', 'plugins');

const PRIMERS_GIT = 'https://github.com/neoforged/.github'
const MDG_GIT = 'https://github.com/neoforged/ModDevGradle'
const NG_GIT = 'https://github.com/neoforged/NeoGradle'

// Setup primers
if (!fs.existsSync(PRIMER_PATH)) {
    pullRepository(PRIMERS_GIT, PRIMER_PATH, directoryMap = {
        'primers': 'docs'
    });

    const primerDocs = path.join(PRIMER_PATH, 'docs');

    // Rename README to index and append starting sidebar position
    appendHeader('---\nsidebar_position: 1\n---\n', path.join(primerDocs, 'README.md'), to = path.join(primerDocs, 'index.md'));

    // Order primers starting from most recent
    const primers = fs.readdirSync(primerDocs).filter((possible) => {
        return !isNaN(possible.charAt(0));
    }).sort((a, b) => {
        const aVer = a.split('.');
        if (aVer.length == 2) {
            aVer.push('0');
        }
        const bVer = b.split('.');
        if (bVer.length == 2) {
            bVer.push('0');
        }

        for (var i = 0; i < 3; i++) {
            if (aVer[i] == bVer[i]) {
                continue;
            }

            return -(parseInt(aVer[i]) - parseInt(bVer[i]));
        }
    });
    
    // Loop through primers and apply headers
    var currentPosition = 2;
    for (const primer of primers) {
        appendHeader(function(fileData) {
            const title = fileData.substring(0, fileData.indexOf('\n'))
            .match(/[0-9]+\.[0-9]+(?:\.[0-9]+(?:\/[0-9]+)?)? \-\> [0-9]+\.[0-9]+(?:\.[0-9]+)?/)[0];
            return `---\ntitle: ${title}\nsidebar_position: ${currentPosition}\n---\n`;
        }, path.join(primerDocs, primer, 'index.md'));
        

        if (fs.existsSync(path.join(primerDocs, primer, 'forge.md'))) {
            appendHeader('---\ntitle: Forge Changes\n---\n', path.join(primerDocs, primer, 'forge.md'));
        }

        currentPosition++;
    }
}

// Setup toolchain
if (!fs.existsSync(TOOLCHAIN_PLUGIN_PATH)) {
    const pluginDocs = TOOLCHAIN_PLUGIN_PATH;
    fs.mkdirSync(TOOLCHAIN_PLUGIN_PATH, { recursive: true});

    // Category JSON
    fs.writeFileSync(path.join(pluginDocs, '_category_.json'), '{"label": "Plugins", "position": 1}', { encoding: 'utf-8' });

    // ModDevGradle
    const mdgTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mdg-'), { recursive: true} );

    // Pull repository
    chp.execSync(`git clone ${MDG_GIT} ${mdgTmp}`);

    // Move README
    const mdgDocs = fs.mkdirSync(path.join(pluginDocs, 'mdg'), { recursive: true});
    const mdgData = fs.readFileSync(path.join(mdgTmp, 'README.md'), { encoding: 'utf-8' });

    // Apply patches
    const mdgLinkRemapper = {
        'BREAKING_CHANGES.md': 'https://github.com/neoforged/ModDevGradle/blob/main/BREAKING_CHANGES.md',
        './testproject/build.gradle': 'https://github.com/neoforged/ModDevGradle/blob/main/testproject/build.gradle',
        'docs/idePostSync1.png': 'assets/idePostSync1.png',
        'docs/idePostSync2.png': 'assets/idePostSync2.png',
        'docs/idePostSync3.png': 'assets/idePostSync3.png',
        'src/main/java/net/neoforged/moddevgradle/dsl/RunModel.java': 'https://github.com/neoforged/ModDevGradle/blob/main/src/main/java/net/neoforged/moddevgradle/dsl/RunModel.java'
    };

    const mdgPage = [];
    
    var backslashPatch = 0;
    var partOfAdmonition = false;
    for (var line of mdgData.split('\n')) {
        // Rename title to ModDevGradle
        if (line.match(/Gradle Plugin/)) {
            line = '# ModDevGradle';
        }

        // Backslash <> in Version Range Table
        if (backslashPatch == 0) {
            // Find start
            if (line.match(/Range *\| *Meaning/)) {
                backslashPatch++;
            }
        } else if (backslashPatch == 1) {
            // Check if end
            if (line.match(/Local *Files/)) {
                backslashPatch++;
            } else {
                line = line.replaceAll('<', '\\<').replaceAll('>', '\\>')
            }
        }

        // Change admonition to docs format
        if (!partOfAdmonition && line.match(/\[!IMPORTANT\]/)) {
            partOfAdmonition = true;
            line = ':::info'
        } else if (partOfAdmonition) {
            if (line.match(/^> /)) {
                line = line.substring(2, line.length);
            } else {
                partOfAdmonition = false;
                mdgPage.push(':::')
            }
        }

        // Replace missing links
        const linkMatcher = line.matchAll(/\[[^\]]*\]\(([^\)]+)\)/g);
        for (const match of linkMatcher) {
            const link = match[1];
            if (link in mdgLinkRemapper) {
                line = line.replace(link, mdgLinkRemapper[link]);
            }
        }

        mdgPage.push(line);
    }

    fs.writeFileSync(path.join(mdgDocs, 'index.md'), mdgPage.join('\n'));

    // Copy assets
    fs.cpSync(path.join(mdgTmp, 'assets'), path.join(mdgDocs, 'assets'), { recursive: true });
    fs.cpSync(path.join(mdgTmp, 'docs'), path.join(mdgDocs, 'assets'), { recursive: true });

    // Cleanup
    fs.rmSync(mdgTmp, { recursive: true, force: true });

    // NeoGradle
    const ngTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ng-'), { recursive: true} );

    // Pull repository
    chp.execSync(`git clone ${NG_GIT} ${ngTmp}`);

    // Move README
    const ngDocs = fs.mkdirSync(path.join(pluginDocs, 'ng'), { recursive: true});

    const ngData = fs.readFileSync(path.join(ngTmp, 'README.md'), { encoding: 'utf-8' });

    // Apply patches
    // TODO: Use current branch to determine blob location (git rev-parse --abbrev-ref HEAD)
    const ngLinkRemapper = {
        'dsl/common/src/main/groovy/net/neoforged/gradle/dsl/common/runs/run/Run.groovy': 'https://github.com/neoforged/NeoGradle/blob/NG_7.0/dsl/common/src/main/groovy/net/neoforged/gradle/dsl/common/runs/run/Run.groovy'
    };

    const ngPage = [];
    
    var partOfAdmonition = false;
    var ignoreNextLine = false;
    for (var line of ngData.split('\n')) {
        if (ignoreNextLine) {
            ignoreNextLine = false;
            continue;
        }

        // Remove documentation mention
        if (line.match(/^For a quick start/)) {
            line = line.substring(0, line.indexOf(', or see')) + '.';
            ignoreNextLine = true;
        }

        // Change admonition to docs format
        if (!partOfAdmonition && line.match(/\[!(?:WARNING)|(?:CAUTION)\]/)) {
            partOfAdmonition = true;
            line = ':::warning'
        } else if (!partOfAdmonition && line.match(/\[!NOTE\]/)) {
            partOfAdmonition = true;
            line = ':::note'
        }else if (partOfAdmonition) {
            if (line.match(/^> /)) {
                line = line.substring(2, line.length);
            } else {
                partOfAdmonition = false;
                ngPage.push(':::')
            }
        }

        // Replace missing links
        const linkMatcher = line.matchAll(/\[[^\]]*\]\(([^\)]+)\)/g);
        for (const match of linkMatcher) {
            const link = match[1];
            if (link in ngLinkRemapper) {
                line = line.replace(link, ngLinkRemapper[link]);
            }
        }

        ngPage.push(line);
    }

    fs.writeFileSync(path.join(ngDocs, 'index.md'), ngPage.join('\n'));

    // Cleanup
    fs.rmSync(ngTmp, { recursive: true, force: true });
}