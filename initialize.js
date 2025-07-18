/**
 * Setup docs sections from other repositories.
 */
const fs = require('node:fs');
const chp = require('node:child_process');
const os = require('node:os');
const path = require('node:path');

const PRIMERS_GIT = 'https://github.com/neoforged/.github'

// Setup primers
if (!fs.existsSync(path.join(__dirname, 'primer'))) {
    const primerTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'primers-'), { recursive: true} );

    // Pull primer repository
    chp.execSync(`git clone ${PRIMERS_GIT} ${primerTmp}`);

    // Move primer folder
    var primerDocs = fs.mkdirSync(path.join(__dirname, 'primer', 'docs'), { recursive: true});
    primerDocs = path.join(primerDocs, 'docs');

    // Move to docs path
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
