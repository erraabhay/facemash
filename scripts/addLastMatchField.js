const mongoose = require('mongoose');
const Photo = require('../models/Photo');
require('dotenv').config();

async function addLastMatchField() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        // Get all photos that have matches but no lastMatch date
        const photos = await Photo.find({ matches: { $gt: 0 }, lastMatch: null });
        
        // Update them with the current timestamp
        const updates = photos.map(photo => 
            Photo.findByIdAndUpdate(photo._id, { lastMatch: new Date() })
        );
        
        await Promise.all(updates);
        
        console.log('Successfully added lastMatch field to photos');
        process.exit(0);
    } catch (err) {
        console.error('Error updating photos:', err);
        process.exit(1);
    }
}

addLastMatchField(); 