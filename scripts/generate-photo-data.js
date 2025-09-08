#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Function to get all image files from a directory
function getImageFiles(dirPath) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.heic'];
    const files = fs.readdirSync(dirPath);

    return files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return imageExtensions.includes(ext);
    });
}

// Function to generate photo data
function generatePhotoData() {
    const imagesDir = path.join(__dirname, '../public/albums');
    const collections = [];
    const photos = [];
    let photoId = 1;

    try {
        const collectionDirs = fs.readdirSync(imagesDir);

        collectionDirs.forEach(collectionDir => {
            const collectionPath = path.join(imagesDir, collectionDir);
            const stats = fs.statSync(collectionPath);

            if (stats.isDirectory()) {
                const imageFiles = getImageFiles(collectionPath);

                if (imageFiles.length > 0) {
                    const collectionId = collectionDir.toLowerCase().replace(/[^a-z0-9]/g, '-');

                    collections.push({
                        id: collectionId,
                        name: collectionDir,
                        path: `/albums/${collectionDir}/`,
                        photoCount: imageFiles.length
                    });

                    // Generate photo entries
                    imageFiles.forEach(imageFile => {
                    const photoName = path.parse(imageFile).name
                        .replace(/[-_]/g, ' ')
                        .replace(/\b\w/g, l => l.toUpperCase());
                    
                    photos.push({
                        id: photoId.toString(),
                        name: photoName,
                        path: `/albums/${collectionDir}/${imageFile}`,
                        collection: collectionId
                    });

                    photoId++;
                });
            }
        }
    });

    // Generate the TypeScript data
    const photoData = {
        collections,
        photos
    };

    // Create the data file
    const dataContent = `// Auto-generated photo data from images folder
                        export const photoCollections = ${JSON.stringify(collections, null, 2)};
                        export const photoData = ${JSON.stringify(photos, null, 2)};`;

    fs.writeFileSync( path.join(__dirname, '../src/data/photos.ts'), dataContent);

    } catch (error) {
        console.error('❌ Error generating photo data:', error.message);
    }
}

generatePhotoData();