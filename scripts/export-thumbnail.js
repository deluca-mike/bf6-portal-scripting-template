import sharp from 'sharp';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TARGET_WIDTH = 352;
const TARGET_HEIGHT = 248;
const MAX_SIZE_KB = 78;
const MAX_SIZE_BYTES = MAX_SIZE_KB * 1024;

// Try to find an image file
const imagePaths = [
    './src/thumbnail.png',
    './src/thumbnail.jpeg',
    './src/thumbnail.jpg',
    './src/thumbnail.gif',
    './src/thumbnail.bmp',
];

let imagePath = null;
for (const path of imagePaths) {
    const fullPath = join(__dirname, path);

    if (existsSync(fullPath)) {
        imagePath = fullPath;
        break;
    }
}

if (!imagePath) {
    console.error('No thumbnail image found in ./src/');
    process.exit(1);
}

console.log(`Processing image: ${imagePath}`);

async function processImage() {
    try {
        // Get image metadata
        const metadata = await sharp(imagePath).metadata();
        console.log(`Original dimensions: ${metadata.width}x${metadata.height}`);

        // First, try uniform scaling (fit: 'inside' maintains aspect ratio)
        const uniformScaledBuffer = await sharp(imagePath)
            .resize(TARGET_WIDTH, TARGET_HEIGHT, {
                fit: 'inside',
                withoutEnlargement: false,
            })
            .toBuffer();

        // Get the dimensions after uniform scaling
        const scaledMetadata = await sharp(uniformScaledBuffer).metadata();
        const scaledWidth = scaledMetadata.width;
        const scaledHeight = scaledMetadata.height;

        console.log(`After uniform scaling: ${scaledWidth}x${scaledHeight}`);

        let image;
        // If dimensions don't match exactly, crop to exact size from original
        if (scaledWidth === TARGET_WIDTH && scaledHeight === TARGET_HEIGHT) {
            console.log('Uniform scaling achieved exact dimensions');
            image = sharp(uniformScaledBuffer);
        } else {
            console.log('Dimensions not exact, applying crop from original...');
            // Use fit: 'cover' which scales uniformly to cover target and crops
            image = sharp(imagePath).resize(TARGET_WIDTH, TARGET_HEIGHT, {
                fit: 'cover',
                position: 'center',
            });
        }

        // Determine output format based on input
        const ext = imagePath.split('.').pop().toLowerCase();
        let outputFormat = ext === 'png' ? 'png' : 'jpeg';

        // Compress to meet size requirement
        let quality = 90;
        let buffer;
        let attempts = 0;
        const maxAttempts = 20;

        do {
            if (outputFormat === 'png') {
                buffer = await image
                    .png({
                        quality: quality,
                        compressionLevel: 9,
                        adaptiveFiltering: true,
                    })
                    .toBuffer();
            } else {
                buffer = await image
                    .jpeg({
                        quality: quality,
                        mozjpeg: true,
                    })
                    .toBuffer();
            }

            const sizeKB = buffer.length / 1024;
            console.log(`Attempt ${attempts + 1}: Quality ${quality}, Size: ${sizeKB.toFixed(2)}KB`);

            if (buffer.length <= MAX_SIZE_BYTES) {
                break;
            }

            quality -= 5;
            attempts++;
        } while (buffer.length > MAX_SIZE_BYTES && attempts < maxAttempts && quality > 0);

        // If still too large, try converting to JPEG if it's PNG
        if (buffer.length > MAX_SIZE_BYTES && outputFormat === 'png') {
            console.log('PNG too large, converting to JPEG...');
            quality = 85;
            attempts = 0;

            do {
                buffer = await image
                    .jpeg({
                        quality: quality,
                        mozjpeg: true,
                    })
                    .toBuffer();

                const sizeKB = buffer.length / 1024;
                console.log(`JPEG Attempt ${attempts + 1}: Quality ${quality}, Size: ${sizeKB.toFixed(2)}KB`);

                if (buffer.length <= MAX_SIZE_BYTES) {
                    outputFormat = 'jpeg';
                    break;
                }

                quality -= 5;
                attempts++;
            } while (buffer.length > MAX_SIZE_BYTES && attempts < maxAttempts && quality > 0);
        }

        // Verify final dimensions
        const finalImage = sharp(buffer);
        const finalMetadata = await finalImage.metadata();
        const finalSizeKB = buffer.length / 1024;

        console.log(`\nFinal result:`);
        console.log(`Dimensions: ${finalMetadata.width}x${finalMetadata.height}`);
        console.log(`Size: ${finalSizeKB.toFixed(2)}KB`);
        console.log(`Format: ${outputFormat}`);

        if (buffer.length > MAX_SIZE_BYTES) {
            console.warn(`\nWarning: Final size (${finalSizeKB.toFixed(2)}KB) exceeds maximum (${MAX_SIZE_KB}KB)`);
        }

        // Write output with appropriate extension
        const outputExt = outputFormat === 'png' ? 'png' : 'jpg';
        const outputPath = join(__dirname, `./dist/thumbnail.${outputExt}`);
        await sharp(buffer).toFile(outputPath);
        console.log(`\nOutput saved to: ${outputPath}`);
    } catch (error) {
        console.error('Error processing image:', error);
        process.exit(1);
    }
}

processImage();
