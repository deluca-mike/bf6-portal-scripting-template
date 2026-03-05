// Originally written by dfanz0r at https://github.com/dfanz0r/PortalSpatialMinifier/tree/main
// Translated to JavaScript by Michael De Luca
// Version 1.2
// Pure minification logic for BF6 spatial JSON. No Node-only APIs.
// Used by spatial-minifier.js (CLI) and by the docs minifier page (browser).

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

// Generate short names like: a, b, c, ..., z, aa, ab, ac, etc.
function generateShortName(number) {
    let result = '';
    let num = number;

    while (num > 0) {
        num--; // Make it 0-based
        result = String.fromCharCode('a'.charCodeAt(0) + (num % 26)) + result;
        num = Math.floor(num / 26);
    }

    return result;
}

function getOrCreateShortName(originalName, nameMap, counterRef) {
    if (isExcluded(originalName)) return originalName; // Don't replace names that are in the exclusion list

    if (nameMap.has(originalName)) return nameMap.get(originalName);

    const shortName = generateShortName(counterRef.current++);

    nameMap.set(originalName, shortName);

    return shortName;
}

function getOrCreateShortId(originalId, nameMap, counterRef) {
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
            newParts[i] = getOrCreateShortName(parts[i], nameMap, counterRef);
        }

        const newId = newParts.join('/');

        nameMap.set(originalId, newId);

        return newId;
    }

    // For simple IDs, check if it matches a name we already have a mapping for
    if (nameMap.has(originalId)) return nameMap.get(originalId);

    // Otherwise, create a new short identifier for this ID
    const shortId = getOrCreateShortName(originalId, nameMap, counterRef);

    return shortId;
}

// Pass 1: Collect all names and IDs to build the complete mapping
function collectNamesAndIds(node, nameMap, counterRef, enableNameIdReplacement) {
    if (node === null || node === undefined) return;

    if (Array.isArray(node)) {
        for (let i = 0; i < node.length; ++i) {
            collectNamesAndIds(node[i], nameMap, counterRef, enableNameIdReplacement);
        }

        return;
    }

    if (typeof node !== 'object') return;

    for (const [key, value] of Object.entries(node)) {
        if (typeof value === 'string' && enableNameIdReplacement) {
            if (key === 'name') {
                // Collect names from "name" property values
                getOrCreateShortName(value, nameMap, counterRef);
            } else if (key === 'id') {
                // Collect IDs from "id" property values
                getOrCreateShortId(value, nameMap, counterRef);
            }
        }

        // Recursively collect from nested structures
        collectNamesAndIds(value, nameMap, counterRef, enableNameIdReplacement);
    }
}

// Pass 2: Replace all references using the complete mapping
function replaceReferencesRecursively(node, nameMap, enableNameIdReplacement) {
    if (node === null || node === undefined) return;

    if (Array.isArray(node)) {
        for (let i = 0; i < node.length; ++i) {
            replaceReferencesRecursively(node[i], nameMap, enableNameIdReplacement);
        }

        return;
    }

    if (typeof node !== 'object') return;

    for (const [key, value] of Object.entries(node)) {
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

        // Replace single ID references
        if (SINGLE_REFERENCE_PROPERTIES.has(key) && typeof value === 'string') {
            if (nameMap.has(value)) {
                node[key] = nameMap.get(value);
            }

            continue;
        }

        // Replace array ID references
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
                replaceReferencesRecursively(value[i], nameMap, enableNameIdReplacement);
            }

            continue;
        }

        // Recursively process nested objects
        replaceReferencesRecursively(value, nameMap, enableNameIdReplacement);
    }
}

/** Recursively round every number in the tree to maxDigits decimal places. Applies to all numbers regardless of original string form (integers, decimals, scientific). */
function reduceNumericPrecisionInTree(node, maxDigits) {
    if (node === null || node === undefined) return;

    if (Array.isArray(node)) {
        for (let i = 0; i < node.length; ++i) {
            if (typeof node[i] === 'number' && Number.isFinite(node[i])) {
                node[i] = Number(node[i].toFixed(maxDigits));
            } else {
                reduceNumericPrecisionInTree(node[i], maxDigits);
            }
        }
        return;
    }

    if (typeof node === 'object') {
        for (const [key, value] of Object.entries(node)) {
            if (typeof value === 'number' && Number.isFinite(value)) {
                node[key] = Number(value.toFixed(maxDigits));
            } else {
                reduceNumericPrecisionInTree(value, maxDigits);
            }
        }
    }
}

/**
 * Minify a BF6 spatial JSON string.
 * @param {string} jsonString - Raw JSON string (spatial map export).
 * @param {object} [options] - Optional settings.
 * @param {boolean} [options.enableNameIdReplacement=true] - Replace names/IDs with short identifiers.
 * @param {boolean} [options.enablePrecisionReduction=true] - Reduce numeric precision.
 * @param {number} [options.precisionDigits=6] - Decimal digits to keep (1–15).
 * @param {boolean} [options.useFormattedOutput=false] - Pretty-print output.
 * @param {boolean} [options.returnMappings=false] - If true, return { minified, nameMap } instead of just the string.
 * @returns {string | { minified: string, nameMap: Map<string, string> }} Minified JSON string, or object when returnMappings is true.
 */
export function minifySpatialJson(jsonString, options = {}) {
    const enableNameIdReplacement = options.enableNameIdReplacement !== false;
    const enablePrecisionReduction = options.enablePrecisionReduction !== false;
    const precisionDigits = Math.max(1, Math.min(15, options.precisionDigits ?? 6));
    const useFormattedOutput = options.useFormattedOutput === true;
    const returnMappings = options.returnMappings === true;

    const nameMap = new Map();
    const counterRef = { current: 1 };

    const rootNode = JSON.parse(jsonString);

    if (rootNode === null || rootNode === undefined) throw new Error('Failed to parse JSON content');

    if (enableNameIdReplacement) {
        collectNamesAndIds(rootNode, nameMap, counterRef, enableNameIdReplacement);
        replaceReferencesRecursively(rootNode, nameMap, enableNameIdReplacement);
    }

    if (enablePrecisionReduction) {
        reduceNumericPrecisionInTree(rootNode, precisionDigits);
    }

    const minifiedJson = useFormattedOutput ? JSON.stringify(rootNode, null, 4) : JSON.stringify(rootNode);

    return returnMappings ? { minified: minifiedJson, nameMap } : minifiedJson;
}
