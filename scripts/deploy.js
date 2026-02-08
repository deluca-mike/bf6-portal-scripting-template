import { Clients } from '@bf6mods/portal';
import { TextEncoder } from 'node:util';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

const fileContentsToBase64 = (filePath, isJson = false) => {
    const contents = fs.readFileSync(filePath, 'utf8');
    return new TextEncoder().encode(isJson ? JSON.stringify(JSON.parse(contents)) : contents);
};

const createTsAttachment = (filePath, version = '1.0.0') => {
    return {
        id: crypto.randomUUID().toString(), // Random UUID for the attachment
        version,
        filename: `${path.parse(filePath).name}.ts`, // File name with .ts extension
        isProcessable: true,
        processingStatus: 2, // TODO: maybe 0 or 1?
        attachmentData: { original: fileContentsToBase64(filePath) },
        attachmentType: 2, // TypeScript attachment type
        errors: [],
    };
};

const createStringsAttachment = (filePath, version = '1.0.0') => {
    return {
        id: crypto.randomUUID().toString(), // Random UUID for the attachment
        version,
        filename: `${path.parse(filePath).name}.json`, // File name with .ts extension
        isProcessable: true,
        processingStatus: 2, // TODO: maybe 0 or 1?
        attachmentData: { original: fileContentsToBase64(filePath, true) },
        attachmentType: 4, // Strings attachment type
        errors: [],
    };
};

const updateAttachments = (attachments, codeFilePath, stringsFilePath, version) => {
    return attachments.map((attachment) => {
        if (attachment.attachmentType === 2) return createTsAttachment(codeFilePath, version);
        if (attachment.attachmentType === 4) return createStringsAttachment(stringsFilePath, version);
        return attachment;
    });
};

const parseArgs = () => {
    const argv = process.argv.slice(2);
    let scriptPath = 'dist/bundle.ts';
    let stringsPath = 'dist/bundle.strings.json';
    let versionBump = 'patch';

    for (let i = 0; i < argv.length; ++i) {
        if (argv[i] === '--script' && argv[i + 1]) {
            scriptPath = argv[++i];
        } else if (argv[i] === '--strings' && argv[i + 1]) {
            stringsPath = argv[++i];
        } else if (argv[i] === '--versionBump' && argv[i + 1]) {
            const value = argv[++i];

            if (value !== 'patch' && value !== 'minor' && value !== 'major') continue;

            versionBump = value;
        }
    }

    return { scriptPath, stringsPath, versionBump };
};

const bumpVersion = (version, versionBump) => {
    const parts = version.split('.').map((s) => parseInt(s, 10) || 0);
    const [major = 0, minor = 0, patch = 0] = parts;
    if (versionBump === 'patch') return `${major}.${minor}.${patch + 1}`;
    if (versionBump === 'minor') return `${major}.${minor + 1}.0`;
    if (versionBump === 'major') return `${major + 1}.0.0`;
    return version;
};

const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const experienceName = packageJson.experienceName ?? 'My Experience';
const currentVersion = packageJson.version ?? '0.0.0';

const { scriptPath, stringsPath, versionBump } = parseArgs();
const newVersion = bumpVersion(currentVersion, versionBump);

console.log('');
console.log('  Deploy');
console.log('  ─────────────────────────────────────────');
console.log('  Script:     ', scriptPath);
console.log('  Strings:    ', stringsPath);
console.log('  Version:    ', currentVersion, '→', newVersion, `(${versionBump})`);
console.log('  Experience: ', `${experienceName} v${newVersion}`);
console.log('  ─────────────────────────────────────────');
console.log('');

const sessionId = process.env.SESSION_ID;
const modId = process.env.MOD_ID;

process.stdout.write('  Authenticating…');
const clients = await new Clients().authenticate({
    sessionId,
});
process.stdout.write('\r\x1b[K  Authenticated.');

process.stdout.write('  Fetching experience…');
const { playElement, playElementDesign } = await clients.play.getPlayElement({
    id: modId,
    includeDenied: true,
});
process.stdout.write(`\r\x1b[K  Fetched: ${playElement?.name ?? modId}\n`);

const newAttachments = updateAttachments(playElementDesign?.attachments, scriptPath, stringsPath, newVersion);

const updatedPlayElement = {
    id: modId,
    name: `${experienceName} v${newVersion}`,
    description: playElement?.description,
    designMetadata: playElementDesign?.designMetadata,
    mapRotation: playElementDesign?.mapRotation,
    mutators: playElementDesign?.mutators,
    assetCategories: playElementDesign?.assetCategories,
    originalModRules: playElementDesign?.modRules?.compatibleRules?.original,
    playElementSettings: playElement?.playElementSettings,
    publishState: 1,
    modLevelDataId: playElementDesign?.modLevelDataId,
    thumbnailUrl: playElement?.thumbnailUrl,
    attachments: newAttachments,
};

process.stdout.write(`  Updating experience to version ${newVersion} (this may take up to 10 seconds)…`);

const updateStart = Date.now();

try {
    const result = await clients.play.updatePlayElement(updatedPlayElement);

    for (const attachment of result.playElementDesign?.attachments ?? []) {
        const errorCount = attachment.errors?.length ?? 0;

        if (errorCount > 0) throw new Error(`${attachment.filename} has ${errorCount} errors.`);
    }

    const elapsed = ((Date.now() - updateStart) / 1000).toFixed(1);
    process.stdout.write(`\r\x1b[K  ✓ Update complete to version ${newVersion} in ${elapsed} seconds.\n`);

    process.stdout.write('  Writing package.json…');
    packageJson.experienceName = experienceName;
    packageJson.version = newVersion;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 4) + '\n');
    process.stdout.write(`\r\x1b[K  ✓ package.json updated.\n`);
    console.log('  Done.');
} catch (err) {
    const elapsed = ((Date.now() - updateStart) / 1000).toFixed(1);
    process.stdout.write(`\r\x1b[K  ✗ Update failed after ${elapsed} seconds.\n`);
    console.error('');
    console.error('  Error:', err?.message ?? String(err));

    if (err?.stack) {
        console.error('');
        console.error(err.stack);
    }

    console.error('');
    process.exit(1);
}
