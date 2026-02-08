// Originally written by dfanz0r at https://github.com/dfanz0r/PortalSpatialMinifier/tree/main
// Translated to JavaScript by Michael De Luca

import fs from 'fs';
import path from 'path';

// Name/ID mapping dictionary
const nameMap = new Map();
let counter = 1;

// Names that should never be replaced (important structural/asset names).
const excludedNames = new Set(['Static']);

// Check if a name/ID should be excluded from replacement.
function isExcluded(nameOrId) {
    // Exclude if undefined or empty.
    if (!nameOrId || nameOrId === '') return true;

    // Exclude anything in the Static/ tree (IDs starting with "Static/").
    if (nameOrId.startsWith('Static/')) return true;

    // Exclude exact matches from the exclusion list.
    if (excludedNames.has(nameOrId)) return true;

    return false;
}

// Properties that contain single ID references to other objects.
const SINGLE_REFERENCE_PROPERTIES = new Set([
    'HQArea',
    'CombatVolume',
    'CaptureArea',
    'Area',
    'SurroundingCombatArea',
    'ExclusionAreaTeam1',
    'ExclusionAreaTeam2',
    'ExclusionAreaTeam1_OBB',
    'ExclusionAreaTeam2_OBB',
    'DestructionArea',
    'MapDetailRenderArea',
    'SectorArea',
    'RetreatArea',
    'RetreatFromArea',
    'AdvanceFromArea',
    'AdvanceToArea',
]);

// Properties that contain arrays of ID references to other objects.
const ARRAY_ID_REFERENCE_PROPERTIES = new Set([
    'InfantrySpawns',
    'ForwardSpawns',
    'InfantrySpawnPoints_Team1',
    'InfantrySpawnPoints_Team2',
    'SpawnPoints',
    'CapturePoints',
    'MCOMs',
    'AlternateSpawns',
]);

// Settings for different optimization features.
let enableNameIdReplacement = true;
let enablePrecisionReduction = true;
let showNameMappings = false;
let useFormattedOutput = false;
let precisionDigits = 6;

function parseArguments(args, options) {
    for (let i = 0; i < args.length; ++i) {
        const arg = args[i].toLowerCase();

        switch (arg) {
            case '-h':
            case '--help':
                showHelp();
                process.exit(0);
                break;

            case '--no-rename':
                enableNameIdReplacement = false;
                console.log('Name and ID replacement disabled');
                break;

            case '--no-precision':
                enablePrecisionReduction = false;
                console.log('Precision reduction disabled');
                break;

            case '--show-mappings':
                showNameMappings = true;
                break;

            case '--formatted':
            case '--pretty':
                useFormattedOutput = true;
                console.log('Formatted output enabled (with whitespace and indentation)');
                break;

            case '--precision':
                if (i + 1 < args.length) {
                    const digits = parseInt(args[i + 1], 10);
                    if (!isNaN(digits) && digits > 0 && digits <= 15) {
                        precisionDigits = digits;
                        i++; // Skip the next argument as we've consumed it
                        console.log(`Precision set to ${precisionDigits} digits`);
                    } else {
                        console.log('Invalid precision value. Using default (6).');
                    }
                }
                break;

            case '-i':
            case '--input':
                if (i + 1 < args.length) {
                    options.inputFile = args[i + 1];
                    i++; // Skip the next argument as we've consumed it
                } else {
                    console.log('Missing input file argument.');
                    process.exit(1);
                }
                break;

            case '--out':
                if (i + 1 < args.length) {
                    options.outputFile = args[i + 1];
                    i++; // Skip the next argument as we've consumed it
                } else {
                    console.log('Missing output file argument.');
                    process.exit(1);
                }
                break;

            default:
                // If it doesn't start with -, treat as positional argument (input file)
                if (!args[i].startsWith('-')) {
                    if (options.inputFile) {
                        console.log(`Error: Multiple input files specified. Only one input file is allowed.`);
                        process.exit(1);
                    }
                    options.inputFile = args[i];
                } else {
                    console.log(`Unknown argument: ${args[i]}`);
                    showHelp();
                    process.exit(1);
                }
                break;
        }
    }
}

function generateOutputFilename(inputFile) {
    const fileNameWithoutExtension = path.basename(inputFile, path.extname(inputFile));
    const outputFileName = `${fileNameWithoutExtension}.minified${path.extname(inputFile)}`;
    return path.join(path.dirname(inputFile), outputFileName);
}

function showHelp() {
    console.log('BF6 Spatial JSON Minifier - Optimizes Battlefield 6 spatial editor exported JSON files');
    console.log('Reduces file size by replacing names with short identifiers and reducing numeric precision');
    console.log();
    console.log('Usage: node json-minifier.js [options] <input_file>');
    console.log();
    console.log('Options:');
    console.log('  -h, --help            Show this help message');
    console.log('  -i, --input FILE      Input JSON file (required)');
    console.log('  --out FILE            Output JSON file (default: auto-generated from input filename)');
    console.log('  --no-rename           Disable name and ID replacement with short identifiers');
    console.log('  --no-precision        Disable numeric precision reduction');
    console.log('  --precision DIGITS    Set precision digits (1-15, default: 6)');
    console.log('  --show-mappings       Show name/ID mappings in output');
    console.log('  --formatted, --pretty Output with whitespace and indentation (default: minified)');
    console.log();
    console.log('Examples:');
    console.log('  node json-minifier.js input.json');
    console.log('  node json-minifier.js --out custom-output.json input.json');
    console.log('  node json-minifier.js --no-rename --precision 3 input.json');
    console.log('  node json-minifier.js --formatted --show-mappings input.json');
    console.log('  node json-minifier.js --show-mappings --precision 7 -i input.json --out output.json');
}

// Pass 1: Collect all names and IDs to build the complete mapping
function collectNamesAndIds(node) {
    if (node === null || node === undefined) return;

    if (Array.isArray(node)) {
        for (let i = 0; i < node.length; ++i) {
            collectNamesAndIds(node[i]);
        }

        return;
    }

    if (typeof node !== 'object') return;

    for (const [key, value] of Object.entries(node)) {
        if (typeof value === 'string' && enableNameIdReplacement) {
            if (key === 'name') {
                // Collect names from "name" property values
                getOrCreateShortName(value);
            } else if (key === 'id') {
                // Collect IDs from "id" property values
                getOrCreateShortId(value);
            }
        }

        // Recursively collect from nested structures
        collectNamesAndIds(value);
    }
}

// Pass 2: Replace all references using the complete mapping
function replaceReferencesRecursively(node) {
    if (node === null || node === undefined) return;

    if (Array.isArray(node)) {
        for (let i = 0; i < node.length; ++i) {
            replaceReferencesRecursively(node[i]);
        }

        return;
    }

    if (typeof node !== 'object') return;

    for (const [key, value] of Object.entries(node)) {
        // Replace names in "name" property values
        if (key === 'name' && typeof value === 'string' && enableNameIdReplacement) {
            // Check if this object has a Static/ ID - if so, don't rename its name
            let isStaticObject = false;

            if (node.id && typeof node.id === 'string') {
                isStaticObject = node.id.startsWith('Static/');
            }

            if (!isStaticObject && nameMap.has(value)) {
                node[key] = nameMap.get(value);
            }

            continue;
        }

        // Replace IDs in "id" property values
        if (key === 'id' && typeof value === 'string' && enableNameIdReplacement) {
            if (nameMap.has(value)) {
                node[key] = nameMap.get(value);
            }

            continue;
        }

        // Handle single ID reference properties
        if (SINGLE_REFERENCE_PROPERTIES.has(key) && typeof value === 'string') {
            if (nameMap.has(value)) {
                node[key] = nameMap.get(value);
            }

            continue;
        }

        // Handle array ID reference properties
        if (ARRAY_ID_REFERENCE_PROPERTIES.has(key) && Array.isArray(value)) {
            for (let i = 0; i < value.length; ++i) {
                if (typeof value[i] === 'string' && nameMap.has(value[i])) {
                    value[i] = nameMap.get(value[i]);
                }
            }

            continue;
        }
        // Handle regular arrays (that might contain objects)

        if (Array.isArray(value) && !ARRAY_ID_REFERENCE_PROPERTIES.has(key)) {
            for (let i = 0; i < value.length; ++i) {
                replaceReferencesRecursively(value[i]);
            }

            continue;
        }

        // Recursively process nested objects
        replaceReferencesRecursively(value);
    }
}

function getOrCreateShortName(originalName) {
    if (isExcluded(originalName)) return originalName; // Don't replace names that are in the exclusion list

    if (nameMap.has(originalName)) return nameMap.get(originalName);

    const shortName = generateShortName(counter++);

    nameMap.set(originalName, shortName);

    return shortName;
}

function generateShortName(number) {
    // Generate short names like: a, b, c, ..., z, aa, ab, ac, etc.
    let result = '';
    let num = number;

    while (num > 0) {
        num--; // Make it 0-based
        result = String.fromCharCode('a'.charCodeAt(0) + (num % 26)) + result;
        num = Math.floor(num / 26);
    }

    return result;
}

function getOrCreateShortId(originalId) {
    if (!originalId || originalId === '') return originalId;

    // Don't replace IDs that are in the exclusion list
    if (isExcluded(originalId)) return originalId;

    // Check if we already have a mapping for this ID
    if (nameMap.has(originalId)) return nameMap.get(originalId);

    // For hierarchical IDs (like "TEAM_1_HQ/SpawnPoint_1_1"), try to build from existing mappings
    if (originalId.includes('/')) {
        const parts = originalId.split('/');
        const newParts = new Array(parts.length);

        for (let i = 0; i < parts.length; ++i) {
            // Check if this part is excluded
            if (isExcluded(parts[i])) {
                newParts[i] = parts[i]; // Keep the original
                continue;
            }

            // If this part already has a mapping, use it
            if (nameMap.has(parts[i])) {
                newParts[i] = nameMap.get(parts[i]);
                continue;
            }

            // Create a new short name for this part
            newParts[i] = getOrCreateShortName(parts[i]);
        }

        const newId = newParts.join('/');

        nameMap.set(originalId, newId);

        return newId;
    }

    // For simple IDs, check if it matches a name we already have a mapping for
    if (nameMap.has(originalId)) return nameMap.get(originalId);

    // Otherwise, create a new short identifier for this ID
    const shortId = getOrCreateShortName(originalId);

    return shortId;
}

function reduceNumericPrecision(json, maxDigits) {
    return json.replace(/-?\d+\.\d+/g, (match) => {
        const value = Number(match);

        if (!Number.isFinite(value)) return match;

        // Match: Math.Round(value, maxDigits)
        const rounded = Number(value.toFixed(maxDigits));

        // Match: ToString("G{maxDigits}", InvariantCulture)
        const result = rounded.toString();

        if (!result.includes('.')) return result;

        // Trim trailing zeros
        return result.replace(/\.?0+$/, '');
    });
}

function main() {
    const args = process.argv.slice(2);

    const options = {
        inputFile: null,
        outputFile: null,
    };

    // Parse command line arguments
    parseArguments(args, options);

    // Require an input file
    if (!options.inputFile) {
        console.log('Error: Input file is required.');
        console.log();
        showHelp();
        process.exit(1);
    }

    // Auto-generate output filename if not specified
    if (options.outputFile === null) {
        options.outputFile = generateOutputFilename(options.inputFile);
    }

    try {
        console.log(`Loading JSON from: ${options.inputFile}`);

        // Read the JSON file
        const jsonContent = fs.readFileSync(options.inputFile, 'utf8');

        // Parse as JSON for dynamic manipulation
        const rootNode = JSON.parse(jsonContent);

        if (rootNode === null || rootNode === undefined) throw new Error('Failed to parse JSON content');

        // Replace names and IDs recursively (if enabled)
        if (enableNameIdReplacement) {
            console.log('Replacing names and IDs with short identifiers...');

            // Two-pass approach:
            // Pass 1: Collect all names and IDs to build the complete mapping
            collectNamesAndIds(rootNode);

            // Pass 2: Replace all references using the complete mapping
            replaceReferencesRecursively(rootNode);
        }

        // Serialize with configurable formatting
        let minifiedJson;
        if (useFormattedOutput) {
            // Serialize with formatted output (4-space indentation)
            minifiedJson = JSON.stringify(rootNode, null, 4);
        } else {
            minifiedJson = JSON.stringify(rootNode);
        }

        // Reduce numeric precision in the final JSON string (if enabled)
        let finalJson = minifiedJson;
        if (enablePrecisionReduction) {
            console.log(`Reducing numeric precision to ${precisionDigits} digits...`);
            finalJson = reduceNumericPrecision(minifiedJson, precisionDigits);
        }

        // Write the minified JSON
        fs.mkdirSync(path.dirname(options.outputFile), { recursive: true });
        fs.writeFileSync(options.outputFile, finalJson, 'utf8');

        console.log(`Minified JSON saved to: ${options.outputFile}`);

        if (enableNameIdReplacement) {
            console.log(`Replaced ${nameMap.size} unique names and IDs`);
        }

        const originalSize = fs.statSync(options.inputFile).size;
        const minifiedSize = fs.statSync(options.outputFile).size;

        console.log(`Original size: ${originalSize.toLocaleString()} bytes`);
        console.log(`Minified size: ${minifiedSize.toLocaleString()} bytes`);

        const reductionPercent = ((originalSize - minifiedSize) / originalSize) * 100;
        console.log(`Size reduction: ${reductionPercent.toFixed(1)}%`);

        // Optionally print the name/ID mappings
        if (showNameMappings && enableNameIdReplacement && nameMap.size > 0) {
            console.log(`\nName/ID mappings:`);
            for (const [key, value] of nameMap.entries()) {
                console.log(`  ${key} -> ${value}`);
            }
        }
    } catch (error) {
        console.log(`Error: ${error.message}`);
        process.exit(1);
    }
}

main();
