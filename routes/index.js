const express = require('express');
const router = express.Router();
const Photo = require('../models/Photo');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadDir = './public/uploads';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        // Generate filename with photo number sequence
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'photo' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).single('photo');

// Check file type
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

// Elo rating calculation
function calculateElo(winnerRating, loserRating) {
    const K = 32; // K-factor determines how much ratings can change
    const expectedScoreWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
    const expectedScoreLoser = 1 - expectedScoreWinner;
    
    // Calculate new ratings
    const newWinnerRating = Math.round(winnerRating + K * (1 - expectedScoreWinner));
    const newLoserRating = Math.round(loserRating + K * (0 - expectedScoreLoser));
    
    // Ensure ratings don't go below 100
    return [
        Math.max(100, newWinnerRating),
        Math.max(100, newLoserRating)
    ];
}

// Home page - photo comparison
router.get('/', async (req, res) => {
    try {
        const photos = await Photo.aggregate([
            { $sample: { size: 2 } }
        ]).exec();
        
        if (!photos || photos.length < 2) {
            console.log('Not enough photos:', photos);
            return res.render('index', { 
                error: 'Not enough photos for comparison. Please add more photos.'
            });
        }
        
        res.render('index', { photos, isHome: true });
    } catch (err) {
        console.error('Home page error:', err);
        res.render('index', { 
            error: 'Error loading photos: ' + err.message
        });
    }
});

// Handle votes
router.post('/vote', async (req, res) => {
    try {
        const { winnerId, loserId } = req.body;
        
        // Get both photos
        const winner = await Photo.findById(winnerId);
        const loser = await Photo.findById(loserId);
        
        if (!winner || !loser) {
            return res.status(404).json({ success: false, error: 'Photos not found' });
        }

        // Calculate new ratings
        const [newWinnerRating, newLoserRating] = calculateElo(winner.rating, loser.rating);
        
        // Update winner
        await Photo.findByIdAndUpdate(winnerId, {
            $set: { rating: newWinnerRating },
            $inc: { matches: 1 }
        });

        // Update loser
        await Photo.findByIdAndUpdate(loserId, {
            $set: { rating: newLoserRating },
            $inc: { matches: 1 }
        });

        // Get new random photos for next comparison
        const newPhotos = await Photo.aggregate([
            { $sample: { size: 2 } }
        ]);

        // Log the ratings update with timestamp
        const logger = require('../utils/logger');
        await logger.saveRatings({
            timestamp: new Date(),
            totalPhotos: 2,
            photos: [{
                id: winnerId,
                oldRating: winner.rating,
                newRating: newWinnerRating
            }, {
                id: loserId,
                oldRating: loser.rating,
                newRating: newLoserRating
            }]
        });

        // After updating ratings, get new rankings
        const updatedRankings = await Photo.find()
            .sort({ rating: -1 })
            .lean()
            .exec();

        // Update ranking positions
        for (let i = 0; i < updatedRankings.length; i++) {
            await Photo.findByIdAndUpdate(updatedRankings[i]._id, {
                ranking: i + 1
            });
            updatedRankings[i].ranking = i + 1;
        }

        // Emit the updated rankings through Socket.IO
        req.app.get('io').emit('rankingsUpdate', updatedRankings);

        res.json({ 
            success: true, 
            newPhotos,
            ratings: {
                winner: newWinnerRating,
                loser: newLoserRating
            }
        });
    } catch (err) {
        console.error('Vote error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Rankings page
router.get('/rankings', async (req, res) => {
    try {
        // Get sorted photos by rating
        const rankings = await Photo.find()
            .sort({ rating: -1 })
            .lean()
            .exec();
            
        if (!rankings || rankings.length === 0) {
            return res.render('rankings', { 
                error: 'No photos available for ranking yet.',
                isRankings: true
            });
        }

        // Update ranking positions in database
        for (let i = 0; i < rankings.length; i++) {
            await Photo.findByIdAndUpdate(rankings[i]._id, {
                ranking: i + 1
            });
            rankings[i].ranking = i + 1;
        }

        res.render('rankings', { 
            rankings,
            isRankings: true
        });
    } catch (err) {
        console.error('Rankings error:', err);
        res.render('rankings', { 
            error: 'Error loading rankings: ' + err.message,
            isRankings: true
        });
    }
});

// Submit page
router.get('/submit', (req, res) => {
    res.render('submit', {
        isSubmit: true,
        message: req.query.message,
        error: req.query.error
    });
});

// Add this function at the top of the file
async function getNextPhotoNumber() {
    // Get all photos and extract numbers from their names
    const photos = await Photo.find({}, 'name');
    const numbers = photos
        .map(photo => {
            const match = photo.name.match(/photo\s*(\d+)/i);
            return match ? parseInt(match[1]) : 0;
        })
        .filter(num => !isNaN(num));

    // Return the next number in sequence
    return numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
}

// Update imageData.json function
async function updateImageDataJson(newPhoto) {
    try {
        const imageDataPath = path.join(__dirname, '../seeds/imageData.json');
        
        // Read existing data
        const imageData = require('../seeds/imageData.json');
        
        // Add new photo to images array
        imageData.images.push({
            name: newPhoto.name,
            filename: path.basename(newPhoto.path),
            phto_url: `E:\\images\\${path.basename(newPhoto.path)}`,
            elo_score: 1400
        });

        // Write updated data back to file
        await fs.promises.writeFile(
            imageDataPath,
            JSON.stringify(imageData, null, 4),
            'utf8'
        );

        console.log('Successfully updated imageData.json');
    } catch (error) {
        console.error('Error updating imageData.json:', error);
        throw error; // Propagate error to be handled by the route handler
    }
}

// Modified photo submission route
router.post('/submit', (req, res) => {
    upload(req, res, async function(err) {
        if (err) {
            return res.status(400).json({
                success: false,
                error: err.message || 'Error uploading file'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Please upload a photo'
            });
        }

        try {
            // Get the submitted name or use a default
            const photoName = req.body.name || 'Unnamed Photo';
            
            // Create new photo with submitted name
            const newPhoto = new Photo({
                name: photoName,
                path: `/uploads/${req.file.filename}`,
                rating: 1400,
                matches: 0,
                ranking: 0
            });

            // Save to database
            await newPhoto.save();

            // Copy to E: drive
            const sourcePath = path.join(__dirname, '../public/uploads', req.file.filename);
            const eDrivePath = `E:\\images\\${req.file.filename}`;
            try {
                await fsPromises.copyFile(sourcePath, eDrivePath);
                console.log('Copied file to E: drive');
            } catch (copyError) {
                console.error('Error copying to E: drive:', copyError);
            }

            // Update imageData.json with await
            await updateImageDataJson(newPhoto);

            res.json({
                success: true,
                message: 'Photo uploaded successfully',
                photo: newPhoto
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({
                success: false,
                error: 'Server error during upload'
            });
        }
    });
});

// About page
router.get('/about', (req, res) => {
    res.render('about', {
        isAbout: true
    });
});

// Add this route for debugging
router.get('/debug/images', async (req, res) => {
    try {
        const photos = await Photo.find();
        const uploadDir = path.join(__dirname, '../public/uploads');
        
        const results = photos.map(photo => {
            const filePath = path.join(__dirname, '../public', photo.path);
            return {
                name: photo.name,
                dbPath: photo.path,
                fileExists: fs.existsSync(filePath),
                fullPath: filePath
            };
        });
        
        res.json({
            uploadDirExists: fs.existsSync(uploadDir),
            uploadDirContents: fs.readdirSync(uploadDir),
            photos: results
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 