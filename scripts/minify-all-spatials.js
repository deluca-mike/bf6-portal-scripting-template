/**
 * Cross-platform script to run spatial-minifier.js on every JSON file in ./spatials.
 * Outputs to ./dist/spatials/ with the same filenames.
 */
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const spatialsDir = path.join(__dirname, 'spatials');
const distSpatialsDir = path.join(__dirname, 'dist', 'spatials');

fs.mkdirSync(distSpatialsDir, { recursive: true });

const files = fs.readdirSync(spatialsDir).filter((f) => f.endsWith('.json'));

if (files.length === 0) {
    console.log('No JSON files found in spatials/');
    process.exit(0);
}

let hadError = false;

for (const file of files) {
    const inputPath = path.join(spatialsDir, file);
    const outPath = path.join(distSpatialsDir, file);

    const result = spawnSync(process.execPath, ['spatial-minifier.js', '--out', outPath, '--input', inputPath], {
        cwd: __dirname,
        stdio: 'inherit',
    });

    if (result.status !== 0) {
        hadError = true;
    }
}

process.exit(hadError ? 1 : 0);
