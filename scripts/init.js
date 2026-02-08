import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as p from '@clack/prompts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const INDEX_TS = path.join(SRC, 'index.ts');
const BOILERPLATE_TS = path.join(SRC, 'boilerplate.ts');
const PACKAGE_JSON = path.join(ROOT, 'package.json');
const CURSORRULES = path.join(ROOT, '.cursorrules');
const ENV_EXAMPLE = path.join(ROOT, '.env.example');
const ENV = path.join(ROOT, '.env');

const GUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function toKebabCase(str) {
    return str
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
}

function checkCancel(value) {
    if (!p.isCancel(value)) return value;

    p.cancel('Operation cancelled.');
    process.exit(0);
}

async function main() {
    p.intro('BF6 Portal experience init');

    const experienceName = checkCancel(
        await p.text({
            message: 'Experience name',
            placeholder: 'My Portal Experience',
            validate(value) {
                if (!value || !value.trim()) return 'Experience name is required.';
            },
        })
    );

    const description = checkCancel(
        await p.text({
            message: 'Description',
            placeholder: 'Optional short description',
        })
    );

    const projectNameRaw = checkCancel(
        await p.text({
            message: 'Project name (npm package name)',
            placeholder: 'Leave blank to use experience name in kebab-case',
        })
    );

    const version = checkCancel(
        await p.text({
            message: 'Version',
            placeholder: '1.0.0',
            initialValue: '1.0.0',
        })
    );

    const author = checkCancel(
        await p.text({
            message: 'Author',
            placeholder: 'Optional',
        })
    );

    const repositoryUrl = checkCancel(
        await p.text({
            message: 'Repository URL',
            placeholder: 'e.g. git+https://github.com/user/repo.git',
        })
    );

    const experienceType = checkCancel(
        await p.select({
            message: 'Experience type',
            options: [
                {
                    value: 'plain',
                    label: 'Plain boilerplate experience',
                    hint: 'Minimal entry point, no example code',
                },
                {
                    value: 'example',
                    label: 'Example with telemetry logging and vehicle spawning from menu button',
                    hint: 'Keeps current index.ts with debug tool and vehicle spawn',
                },
            ],
        })
    );

    const ide = checkCancel(
        await p.select({
            message: 'AI agent or IDE',
            options: [
                { value: 'cursor', label: 'Cursor' },
                { value: 'vscode', label: 'VS Code' },
                { value: 'antigravity', label: 'Antigravity' },
                { value: 'cline', label: 'Cline' },
                { value: 'claude', label: 'Claude' },
                { value: 'windsurf', label: 'Windsurf' },
                { value: 'na', label: 'N/A' },
            ],
        })
    );

    const experienceId = checkCancel(
        await p.text({
            message: 'Experience ID (Mod ID)',
            placeholder: 'Optional — GUID from Portal (e.g. xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)',
            validate(value) {
                if (value && value.trim() && !GUID_REGEX.test(value.trim())) {
                    return 'Must be a valid GUID (e.g. xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).';
                }
            },
        })
    );

    const projectName =
        typeof projectNameRaw === 'string' && projectNameRaw.trim()
            ? toKebabCase(projectNameRaw.trim())
            : toKebabCase(experienceName);

    const s = p.spinner();
    s.start('Updating files...');

    try {
        if (!fs.existsSync(ENV) && fs.existsSync(ENV_EXAMPLE)) {
            fs.copyFileSync(ENV_EXAMPLE, ENV);
        }

        if (experienceType === 'plain') {
            if (fs.existsSync(INDEX_TS)) {
                fs.unlinkSync(INDEX_TS);
            }

            if (fs.existsSync(BOILERPLATE_TS)) {
                fs.renameSync(BOILERPLATE_TS, INDEX_TS);
            }
        } else {
            if (fs.existsSync(BOILERPLATE_TS)) {
                fs.unlinkSync(BOILERPLATE_TS);
            }
        }

        if (fs.existsSync(CURSORRULES) && ide !== 'cursor' && ide !== 'na') {
            const destByIde = {
                vscode: path.join(ROOT, '.github', 'copilot-instructions.md'),
                antigravity: path.join(ROOT, '.gemini', 'GEMINI.md'),
                cline: path.join(ROOT, '.clinerules'),
                claude: path.join(ROOT, '.claude', 'CLAUDE.md'),
                windsurf: path.join(ROOT, '.windsurfrules'),
            };

            const dest = destByIde[ide];

            if (dest) {
                const destDir = path.dirname(dest);

                if (destDir !== ROOT) {
                    fs.mkdirSync(destDir, { recursive: true });
                }

                fs.renameSync(CURSORRULES, dest);
            }
        }

        const pkgPath = PACKAGE_JSON;
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

        pkg.name = projectName;
        pkg.experienceName = experienceName.trim();
        pkg.templateVersion = pkg.version;
        pkg.version = (version && version.trim()) || '1.0.0';
        pkg.description = typeof description === 'string' && description.trim() ? description.trim() : '';

        if (typeof author === 'string' && author.trim()) {
            pkg.author = author.trim();
        } else {
            delete pkg.author;
        }

        if (typeof repositoryUrl === 'string' && repositoryUrl.trim()) {
            const url = repositoryUrl.trim();
            pkg.repository = { type: 'git', url: url.startsWith('git+') ? url : `git+${url}` };
            const baseUrl = url.replace(/^git\+/, '').replace(/\.git$/, '');
            pkg.bugs = { url: baseUrl + '/issues' };
            pkg.homepage = baseUrl + '#readme';
        } else {
            delete pkg.repository;
            delete pkg.bugs;
            delete pkg.homepage;
        }

        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 4) + '\n', 'utf8');

        const modIdTrimmed = typeof experienceId === 'string' && experienceId.trim() ? experienceId.trim() : null;

        if (modIdTrimmed && fs.existsSync(ENV)) {
            let envContent = fs.readFileSync(ENV, 'utf8');

            if (/^MOD_ID=/m.test(envContent)) {
                envContent = envContent.replace(/^MOD_ID=.*/m, `MOD_ID="${modIdTrimmed}"`);
            } else {
                envContent =
                    envContent.trimEnd() + (envContent.endsWith('\n') ? '' : '\n') + `MOD_ID="${modIdTrimmed}"\n`;
            }

            fs.writeFileSync(ENV, envContent, 'utf8');
        }
    } catch (err) {
        s.stop('Failed');
        p.log.error(err.message);
        process.exit(1);
    }

    s.stop('Done');
    p.outro("You're all set! Edit package.json further if needed, then run npm run build.");
}

main();
