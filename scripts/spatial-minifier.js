// Originally written by dfanz0r at https://github.com/dfanz0r/PortalSpatialMinifier/tree/main
// Translated to JavaScript by Michael De Luca
// Version 1.2
// CLI wrapper around spatial-minifier-core.js

import fs from 'fs';
import path from 'path';
import { minifySpatialJson } from './spatial-minifier-core.js';

let showNameMappings = false;

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
                options.enableNameIdReplacement = false;
                console.log('Name and ID replacement disabled');
                break;

            case '--no-precision':
                options.enablePrecisionReduction = false;
                console.log('Precision reduction disabled');
                break;

            case '--show-mappings':
                showNameMappings = true;
                break;

            case '--formatted':
            case '--pretty':
                options.useFormattedOutput = true;
                console.log('Formatted output enabled (with whitespace and indentation)');
                break;

            case '--precision':
                if (i + 1 < args.length) {
                    const digits = parseInt(args[i + 1], 10);
                    if (!isNaN(digits) && digits > 0 && digits <= 15) {
                        options.precisionDigits = digits;
                        i++;
                        console.log(`Precision set to ${options.precisionDigits} digits`);
                    } else {
                        console.log('Invalid precision value. Using default (6).');
                    }
                }
                break;

            case '-i':
            case '--input':
                if (i + 1 < args.length) {
                    options.inputFile = args[i + 1];
                    i++;
                } else {
                    console.log('Missing input file argument.');
                    process.exit(1);
                }
                break;

            case '--out':
                if (i + 1 < args.length) {
                    options.outputFile = args[i + 1];
                    i++;
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

function main() {
    const args = process.argv.slice(2);

    const options = {
        inputFile: null,
        outputFile: null,
        enableNameIdReplacement: true,
        enablePrecisionReduction: true,
        precisionDigits: 6,
        useFormattedOutput: false,
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

        const minifierOptions = {
            enableNameIdReplacement: options.enableNameIdReplacement,
            enablePrecisionReduction: options.enablePrecisionReduction,
            precisionDigits: options.precisionDigits,
            useFormattedOutput: options.useFormattedOutput,
            returnMappings: options.enableNameIdReplacement,
        };

        const result = minifySpatialJson(jsonContent, minifierOptions);
        const minifiedJson = typeof result === 'string' ? result : result.minified;
        const nameMap = typeof result === 'object' ? result.nameMap : null;

        // Write the minified JSON
        fs.mkdirSync(path.dirname(options.outputFile), { recursive: true });
        fs.writeFileSync(options.outputFile, minifiedJson, 'utf8');

        console.log(`Minified JSON saved to: ${options.outputFile}`);

        if (options.enableNameIdReplacement && nameMap) {
            console.log(`Replaced ${nameMap.size} unique names and IDs`);
        }

        const originalSize = fs.statSync(options.inputFile).size;
        const minifiedSize = fs.statSync(options.outputFile).size;

        console.log(`Original size: ${originalSize.toLocaleString()} bytes`);
        console.log(`Minified size: ${minifiedSize.toLocaleString()} bytes`);

        const reductionPercent = ((originalSize - minifiedSize) / originalSize) * 100;
        console.log(`Size reduction: ${reductionPercent.toFixed(1)}%`);

        // Optionally print the name/ID mappings
        if (showNameMappings && nameMap && nameMap.size > 0) {
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
