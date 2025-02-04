const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Photo = require('../models/Photo');
const imageData = require('./imageData.json');
require('dotenv').config();

mongoose.set('strictQuery', false);

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing photos
        await Photo.deleteMany({});
        console.log('Cleared existing photos');

        const uploadDir = path.join(__dirname, '../public/uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Track existing names to avoid duplicates
        const existingNames = new Set();

        // Process all images from imageData.json
        for (const image of imageData.images) {
            try {
                let sourcePath = path.resolve(image.phto_url);
                const destPath = path.join(uploadDir, image.filename);

                // Try multiple possible locations for the image
                const possiblePaths = [
                    sourcePath,
                    `E:/images/${image.filename}`,
                    `E:\\images\\${image.filename}`,
                    path.join(__dirname, '../images', image.filename)
                ];

                let imageFound = false;
                for (const tryPath of possiblePaths) {
                    if (fs.existsSync(tryPath)) {
                        fs.copyFileSync(tryPath, destPath);
                        console.log(`Copied ${image.filename} from ${tryPath} to uploads directory`);
                        imageFound = true;
                        break;
                    }
                }

                if (!imageFound) {
                    console.warn(`Image not found in any location: ${image.filename}`);
                    continue;
                }

                // Add to database
                const photo = await Photo.create({
                    name: image.name,
                    path: `/uploads/${image.filename}`,
                    rating: 1400,
                    ranking: 0,
                    matches: 0
                });

                existingNames.add(image.name.toLowerCase());
                console.log(`Added ${image.name} to database with ID: ${photo._id}`);
            } catch (err) {
                console.error(`Error processing image ${image.name}:`, err);
            }
        }

        // Scan E: drive for additional images
        try {
            const eDrivePath = 'E:\\images';
            if (fs.existsSync(eDrivePath)) {
                const files = fs.readdirSync(eDrivePath);
                for (const file of files) {
                    if (file.match(/\.(jpg|jpeg|png|gif)$/i)) {
                        try {
                            const sourcePath = path.join(eDrivePath, file);
                            const destPath = path.join(uploadDir, file);

                            // Skip if file already exists in uploads
                            if (fs.existsSync(destPath)) {
                                console.log(`File ${file} already exists in uploads, skipping...`);
                                continue;
                            }

                            // Copy file to uploads directory
                            fs.copyFileSync(sourcePath, destPath);
                            console.log(`Copied new file ${file} from E: drive`);

                            // Generate name from filename
                            let baseName = path.basename(file, path.extname(file));
                            let photoName = baseName.replace(/[_-]/g, ' ').replace(/\d+$/, '').trim();
                            let counter = 1;

                            // Ensure unique name
                            while (existingNames.has(photoName.toLowerCase())) {
                                photoName = `${baseName} ${counter}`;
                                counter++;
                            }

                            existingNames.add(photoName.toLowerCase());

                            // Add to database
                            const photo = await Photo.create({
                                name: photoName,
                                path: `/uploads/${file}`,
                                rating: 1400,
                                ranking: 0,
                                matches: 0
                            });
                            console.log(`Added new file ${file} to database with ID: ${photo._id}`);
                        } catch (err) {
                            console.error(`Error processing E: drive file ${file}:`, err);
                        }
                    }
                }
            }
        } catch (eDriveError) {
            console.error('Error accessing E: drive:', eDriveError);
        }

        // Final verification
        const finalPhotos = await Photo.find().sort({ path: 1 });
        console.log('\nFinal Verification:');
        console.log(`Total photos in database: ${finalPhotos.length}`);
        console.log('Files in uploads directory:', fs.readdirSync(uploadDir));
        console.log('All photos in database:', finalPhotos.map(p => ({ name: p.name, path: p.path })));

        console.log('\nSeeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase(); 