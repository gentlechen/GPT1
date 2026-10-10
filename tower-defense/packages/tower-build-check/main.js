'use strict';
const fs = require('fs');
const path = require('path');
const VERSION = 'TF-WX-FIX03-20261010';

function checkBuild(options, callback) {
    if (options.platform !== 'wechatgame') { callback(); return; }
    try {
        const output = path.resolve(options.dest);
        const script = path.join(output, 'assets', 'main', 'index.js');
        if (!fs.existsSync(script) || fs.readFileSync(script, 'utf8').indexOf(VERSION) < 0) {
            throw new Error('[TowerBuild] Current loader code missing from output: ' + script +
                '. Close Creator, remove this project temp and library caches, reopen and rebuild. Expected ' + VERSION);
        }
        fs.writeFileSync(path.join(output, 'tower-build-version.json'), JSON.stringify({
            version: VERSION,
            creator: '2.4.15',
            builtAt: new Date().toISOString(),
            output: output
        }, null, 2));
        Editor.log('[TowerBuild] Verified ' + VERSION + ' at ' + output);
        callback();
    } catch (err) {
        Editor.error(err.message);
        callback(err);
    }
}

module.exports = {
    load() { Editor.Builder.on('build-finished', checkBuild); },
    unload() { Editor.Builder.removeListener('build-finished', checkBuild); }
};
