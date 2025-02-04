const mongoose = require('mongoose');
const Photo = require('../models/Photo');
const logger = require('../utils/logger');
require('dotenv').config();

async function resetRatings() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        
        // Get current state before reset
        const beforeReset = await Photo.find().select('name rating matches ranking').lean();
        
        // Log the state before reset
        await logger.saveRatings({
            timestamp: new Date(),
            totalPhotos: beforeReset.length,
            photos: beforeReset,
            event: 'BEFORE_RESET'
        });

        // Perform the reset
        console.log('Resetting all ratings...');
        await Photo.resetAllRatings();

        // Verify after reset
        const afterReset = await Photo.find().select('name rating matches ranking').lean();
        
        // Log the state after reset
        await logger.saveRatings({
            timestamp: new Date(),
            totalPhotos: afterReset.length,
            photos: afterReset,
            event: 'AFTER_RESET'
        });

        console.log('All ratings have been reset to default values');
        console.log(`Reset ${afterReset.length} photos`);
        
        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('Error resetting ratings:', err);
        await mongoose.connection.close();
        process.exit(1);
    }
}

resetRatings(); 