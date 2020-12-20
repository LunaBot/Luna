#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Logger } = require('logger');
const log = new Logger();

try {
    const entryFile = path.resolve(__dirname, 'dist', 'index.js');

    // Files not built
    if (!fs.existsSync(entryFile)) {
        throw new Error(`Entry file "${entryFile}" is missing.`);
    }

    // Run bot
    require(entryFile);
} catch (error) {
    log.trace(error);
    process.exitCode = 1;
    process.exit();
}
