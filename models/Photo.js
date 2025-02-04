const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
    name: String,
    path: String,
    rating: {
        type: Number,
        default: 1400
    },
    matches: {
        type: Number,
        default: 0
    },
    ranking: {
        type: Number,
        default: 0
    },
    winRate: {
        type: Number,
        default: 0
    },
    lastMatch: {
        type: Date,
        default: null
    }
});

// Static method for resetting all ratings
photoSchema.statics.resetAllRatings = async function() {
    try {
        const result = await this.updateMany(
            {},  // match all documents
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
        
        return result;
    } catch (error) {
        console.error('Error in resetAllRatings:', error);
        throw error;
    }
};

module.exports = mongoose.model('Photo', photoSchema); 