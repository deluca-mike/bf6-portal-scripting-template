/**
 * Update script: bump npm deps to latest non-major, run npm install, and optionally
 * sync the local scripts/ directory from the template repo's latest tag that matches
 * the current template major version (from package.json "templateVersion").
 *
 * Usage: node scripts/update.js
 * Run via: npm run update
 */

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const PACKAGE_JSON = path.join(ROOT, 'package.json');
const SCRIPTS_DIR = path.join(ROOT, 'scripts');
const TEMPLATE_REPO = 'deluca-mike/bf6-portal-scripting-template';
const GITHUB_API = 'https://api.github.com';
const GITHUB_RAW = 'https://raw.githubusercontent.com';

function parseSemver(s) {
    const normalized = String(s).replace(/^v/, '').trim();
    const m = normalized.match(/^(\d+)\.(\d+)\.(\d+)/);
    return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

function semverCompare(a, b) {
    if (!a || !b) return 0;
    if (a[0] !== b[0]) return a[0] - b[0];
    if (a[1] !== b[1]) return a[1] - b[1];
    return a[2] - b[2];
}

function get(url, headers = {}) {
    return new Promise((resolve, reject) => {
        const req = https.get(
            url,
            {
                headers: {
                    'User-Agent': 'bf6-portal-scripting-template-update',
                    ...headers,
                },
            },
            (res) => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    get(res.headers.location, headers).then(resolve).catch(reject);
                    return;
                }
                const chunks = [];
                res.on('data', (chunk) => chunks.push(chunk));
                res.on('end', () => {
                    const body = Buffer.concat(chunks).toString('utf8');
                    if (res.statusCode < 200 || res.statusCode >= 300) {
                        reject(new Error(`HTTP ${res.statusCode}: ${url}`));
                    } else {
                        resolve(body);
                    }
                });
            }
        );
        req.on('error', reject);
    });
}

async function fetchJson(url, options = {}) {
    const body = await get(url, {
        Accept: 'application/vnd.github.v3+json',
        ...options.headers,
    });
    return JSON.parse(body);
}

async function fetchText(url) {
    return get(url);
}

/**
 * Returns the latest tag from the template repo that matches the given major version
 * (e.g. major 1 → latest v1.x.x). This way a new major release does not block updates
 * to valid minor/patch releases in the current major.
 */
async function getLatestTemplateTagForMajor(major) {
    const tags = await fetchJson(`${GITHUB_API}/repos/${TEMPLATE_REPO}/tags?per_page=100`);

    const parsed = tags
        .map((t) => ({ name: t.name, semver: parseSemver(t.name) }))
        .filter((t) => t.semver && t.semver[0] === major);

    if (parsed.length === 0) return null;

    parsed.sort((a, b) => -semverCompare(a.semver, b.semver));

    return parsed[0].name;
}

async function getScriptsContentsAtTag(tag) {
    const contents = await fetchJson(
        `${GITHUB_API}/repos/${TEMPLATE_REPO}/contents/scripts?ref=${encodeURIComponent(tag)}`
    );

    return Array.isArray(contents) ? contents : [];
}

async function main() {
    console.log('BF6 Portal template update\n');

    let pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
    if (pkg.templateVersion == null || pkg.templateVersion === '') {
        pkg.templateVersion = '1.4.0';
        fs.writeFileSync(PACKAGE_JSON, JSON.stringify(pkg, null, 4) + '\n', 'utf8');
        console.log('Set templateVersion to 1.4.0 in package.json (was missing).\n');
    }

    const templateVersion = pkg.templateVersion;
    const currentTemplate = parseSemver(templateVersion);

    if (!currentTemplate) {
        console.warn(
            'Could not parse templateVersion from package.json; skipping script sync. Run "npm run init" to set it.'
        );
    }

    console.log('1. Updating npm dependencies (latest minor/patch, no major bumps)...');

    try {
        execSync('npx npm-check-updates -u --target minor', {
            cwd: ROOT,
            stdio: 'inherit',
        });
    } catch {
        console.error('npm-check-updates failed. Run "npm install -g npm-check-updates" or ensure npx can run it.');
        process.exitCode = 1;
        return;
    }

    console.log('\n2. Running npm install...');
    // Use --legacy-peer-deps so peer dependency conflicts (e.g. typescript-eslint) don't fail the update
    execSync('npm install --legacy-peer-deps', { cwd: ROOT, stdio: 'inherit' });

    if (!currentTemplate) {
        console.log('\nDone (script sync skipped: no valid templateVersion).');
        return;
    }

    const currentMajor = currentTemplate[0];

    console.log('\n3. Checking template repo for script updates (same major: v' + currentMajor + '.x.x)...');

    let latestTag;
    try {
        latestTag = await getLatestTemplateTagForMajor(currentMajor);
    } catch (err) {
        console.warn('Could not fetch template tags:', err.message);
        console.log('Done (script sync skipped).');
        return;
    }

    if (!latestTag) {
        console.log(`No tags found for major v${currentMajor}.x.x in template repo. Done.`);
        return;
    }

    console.log(`Fetching scripts/ from template at ${latestTag}...`);

    let entries;
    try {
        entries = await getScriptsContentsAtTag(latestTag);
    } catch (err) {
        console.warn('Could not fetch scripts contents:', err.message);
        console.log('Done.');
        return;
    }

    const files = entries.filter((e) => e.type === 'file');

    for (const file of files) {
        const name = file.name;
        const destPath = path.join(SCRIPTS_DIR, name);
        const rawUrl = `${GITHUB_RAW}/${TEMPLATE_REPO}/${latestTag}/scripts/${encodeURIComponent(name)}`;

        try {
            const content = await fetchText(rawUrl);
            fs.writeFileSync(destPath, content, 'utf8');
            console.log(`  Updated scripts/${name}`);
        } catch (err) {
            console.warn(`  Skipped scripts/${name}: ${err.message}`);
        }
    }

    const tagVersion = latestTag.replace(/^v/, '');
    const pkgUpdated = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
    pkgUpdated.templateVersion = tagVersion;

    fs.writeFileSync(PACKAGE_JSON, JSON.stringify(pkgUpdated, null, 4) + '\n', 'utf8');

    console.log(`\nUpdated templateVersion in package.json to ${tagVersion}.`);
    console.log('Done.');
}

main();
