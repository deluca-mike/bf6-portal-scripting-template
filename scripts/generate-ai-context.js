import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURATION ---

const CONFIG = {
    // Path to your installed utility package
    packagePath: path.resolve(__dirname, '../node_modules/bf6-portal-utils'),

    // Output file location
    outputFile: path.resolve(__dirname, '../.ai/bf6-portal-utils-knowledge.md'),

    // Folders to skip
    ignoredFolders: ['bin', 'tests', 'dist', 'node_modules'],
};

// --- LOGIC ---

async function generate() {
    console.log('🏷️  AI Context Generator (Tag-Based) Starting...');

    if (!fs.existsSync(CONFIG.packagePath)) {
        console.error(`❌ Error: Package not found at ${CONFIG.packagePath}`);
        process.exit(1);
    }

    const readmes = findReadmes(CONFIG.packagePath);
    console.log(`📂 Found ${readmes.length} README files.`);

    let combinedOutput = [
        ``,
        ``,
        `# Battlefield 6 Portal Utilities - Library Context`,
        `This document contains implementation details explicitly tagged for AI consumption.`,
        `Always prefer patterns found here over raw 'mod' namespace calls.`,
        ``,
    ].join('\n');

    let moduleCount = 0;

    for (const file of readmes) {
        const content = fs.readFileSync(file.path, 'utf-8');
        const moduleName = getModuleName(file.path);

        // Extract content between <ai> tags
        const aiBlocks = extractAiTags(content);

        if (aiBlocks.length > 0) {
            combinedOutput += `\n---\n\n## Module: ${moduleName}\n\n`;
            combinedOutput += aiBlocks.join('\n\n');
            combinedOutput += '\n'; // Trailing newline
            moduleCount++;
        }
    }

    // Ensure output directory exists and write file
    const outputDir = path.dirname(CONFIG.outputFile);

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(CONFIG.outputFile, combinedOutput);

    console.log(`✅ Processed ${moduleCount} modules containing <ai> tags.`);
    console.log(`📄 Wrote context to: ${CONFIG.outputFile}`);
}

/**
 * Extracts content between <ai> and </ai> tags.
 * Handles multi-line content and multiple tags per file.
 */
function extractAiTags(content) {
    const blocks = [];
    // Regex Explanation:
    // <ai[^>]*>  -> Matches <ai> or <ai type="example"> (allows attributes if you want them later)
    // ([\s\S]*?) -> Capture Group 1: Matches any character (including newlines) non-greedily
    // <\/ai>     -> Matches closing tag
    // gi         -> Global (find all), Case Insensitive
    const regex = /<ai[^>]*>([\s\S]*?)<\/ai>/gi;

    let match;

    while ((match = regex.exec(content)) !== null) {
        // match[1] is the content *inside* the tags
        let extracted = match[1].trim();

        // Optional: Clean up indentation if the tag was indented
        // This removes leading whitespace common to all lines in the block
        extracted = dedent(extracted);

        if (extracted) {
            blocks.push(extracted);
        }
    }

    return blocks;
}

/**
 * Helper to remove common leading whitespace from multi-line strings
 * so the output markdown isn't accidentally treated as code blocks.
 */
function dedent(str) {
    const lines = str.split('\n');

    if (lines.length === 0) return str;

    // Find minimum indentation (ignoring empty lines)
    const indent = lines
        .filter((line) => line.trim().length > 0)
        .reduce((min, line) => {
            const currentIndent = line.match(/^\s*/)[0].length;
            return currentIndent < min ? currentIndent : min;
        }, Infinity);

    if (indent === Infinity) return str; // No indentation found

    return lines.map((line) => (line.length >= indent ? line.slice(indent) : line)).join('\n');
}

function findReadmes(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);

        if (fs.statSync(filePath).isDirectory()) {
            if (!CONFIG.ignoredFolders.includes(file)) {
                findReadmes(filePath, fileList);
            }
        } else if (file.toLowerCase() === 'readme.md') {
            fileList.push({ path: filePath });
        }
    }

    return fileList;
}

function getModuleName(filePath) {
    const parent = path.basename(path.dirname(filePath));
    return parent === 'src' || parent === 'lib' ? 'Core' : parent;
}

generate().catch(console.error);
