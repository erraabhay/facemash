require('dotenv').config();
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const multer = require('multer');
const connectDB = require('./config/db');
const Photo = require('./models/Photo');
const logger = require('./utils/logger');
const helpers = require('./utils/handlebarsHelpers');
const mongoose = require('mongoose');

// Initialize express
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

let isShuttingDown = false;

// Connect to database
connectDB();

// Handlebars setup
app.engine('handlebars', exphbs.create({ helpers }).engine);
app.set('view engine', 'handlebars');

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Make io available to routes
app.set('io', io);

// Routes
app.use('/', require('./routes/index'));

// Graceful shutdown handler
async function handleShutdown() {
    if (isShuttingDown) return;
    isShuttingDown = true;
    
    console.log('\nReceived shutdown signal. Resetting all ratings...');
    
    try {
        // Reset all ratings immediately
        const result = await mongoose.connection.db.collection('photos').updateMany(
            {},
            {
                $set: {
                    rating: 1400,
                    matches: 0,
                    ranking: 0,
                    winRate: 0,
                    lastMatch: null
                }
            }
        );

        console.log(`Reset ${result.modifiedCount} photos to default values`);

        // Verify the reset
        const verifyCount = await mongoose.connection.db.collection('photos').countDocuments({
            $or: [
                { rating: { $ne: 1400 } },
                { matches: { $ne: 0 } },
                { ranking: { $ne: 0 } },
                { winRate: { $ne: 0 } }
            ]
        });

        if (verifyCount > 0) {
            throw new Error(`Reset verification failed. ${verifyCount} documents not reset properly.`);
        }

        console.log('Reset verified successfully.');
        
        // Close all connections
        await mongoose.connection.close();
        console.log('Database connection closed.');
        
        server.close(() => {
            console.log('HTTP server closed.');
            process.exit(0);
        });
    } catch (err) {
        console.error('Error during shutdown:', err);
        try {
            await mongoose.connection.close();
        } catch (closeErr) {
            console.error('Error closing database:', closeErr);
        }
        process.exit(1);
    }
}

// Handle shutdown signals
process.on('SIGINT', handleShutdown);   // Ctrl+C
process.on('SIGTERM', handleShutdown);  // Kill command
process.on('SIGUSR2', handleShutdown);  // nodemon restart

// Start server
const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 