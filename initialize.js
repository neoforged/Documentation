/**
 * Setup docs sections from other repositories.
 */
const fs = require('node:fs');
const chp = require('node:child_process');
const os = require('node:os');
const path = require('node:path');

const PRIMERS_GIT = 'https://github.com/neoforged/.github'
const MDG_GIT = 'https://github.com/neoforged/ModDevGradle'
const NG_GIT = 'https://github.com/neoforged/NeoGradle'

// Setup primers
if (!fs.existsSync(path.join(__dirname, 'primer'))) {
    const primerTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'primers-'), { recursive: true} );

    // Pull primer repository
    chp.execSync(`git clone ${PRIMERS_GIT} ${primerTmp}`);

    // Move primer folder
    var primerDocs = fs.mkdirSync(path.join(__dirname, 'primer', 'docs'), { recursive: true});
    primerDocs = path.join(primerDocs, 'docs');
    fs.cpSync(path.join(primerTmp, 'primers'), primerDocs, { recursive: true });

    // Delete temporary location
    fs.rmSync(primerTmp, { recursive: true, force: true });

    // Rename README to index and append starting sidebar position
    const data = fs.readFileSync(path.join(primerDocs, 'README.md'));
    const fd = fs.openSync(path.join(primerDocs, 'index.md'), 'w+');
    const header = Buffer.from('---\nsidebar_position: 1\n---\n');
    fs.writeSync(fd, header, 0, header.length, 0);
    fs.writeSync(fd, data, 0, data.length, header.length);
    fs.closeSync(fd);
    fs.rmSync(path.join(primerDocs, 'README.md'));

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

        // Negative if first value is less than second
        for (var i = 0; i < 3; i++) {
            if (aVer[i] == bVer[i]) {
                continue;
            }

            return -(parseInt(aVer[i]) - parseInt(bVer[i]));
        }
    });
    var currentPosition = 2;
    for (const primer of primers) {
        const primerStr = fs.readFileSync(path.join(primerDocs, primer, 'index.md'), { encoding: 'utf-8' });
        const primerTitle = primerStr.substring(0, primerStr.indexOf('\n'))
            .match(/[0-9]+\.[0-9]+(?:\.[0-9]+(?:\/[0-9]+)?)? \-\> [0-9]+\.[0-9]+(?:\.[0-9]+)?/)[0];
        
        const primerFd = fs.openSync(path.join(primerDocs, primer, 'index.md'), 'w+');
        const primerHeader = Buffer.from(`---\ntitle: ${primerTitle}\nsidebar_position: ${currentPosition}\n---\n`);
        const primerData = Buffer.from(primerStr);
        fs.writeSync(primerFd, primerHeader, 0, primerHeader.length, 0);
        fs.writeSync(primerFd, primerData, 0, primerData.length, primerHeader.length);
        fs.closeSync(primerFd);

        if (fs.existsSync(path.join(primerDocs, primer, 'forge.md'))) {
            const forgeData = fs.readFileSync(path.join(primerDocs, primer, 'forge.md'));
            const forgeFd = fs.openSync(path.join(primerDocs, primer, 'forge.md'), 'w+');
            const forgeHeader = Buffer.from('---\ntitle: Forge Changes\n---\n');
            fs.writeSync(forgeFd, forgeHeader, 0, forgeHeader.length, 0);
            fs.writeSync(forgeFd, forgeData, 0, forgeData.length, forgeHeader.length);
            fs.closeSync(forgeFd);
        }

        currentPosition++;
    }
}

// Setup toolchain
if (!fs.existsSync(path.join(__dirname, 'toolchain', 'docs', 'plugins'))) {
    var pluginDocs = fs.mkdirSync(path.join(__dirname, 'toolchain', 'docs', 'plugins'), { recursive: true});

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