const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logDir = path.join(__dirname, '../logs');
        this.logFile = path.join(this.logDir, 'ratings.log');
        
        // Create logs directory if it doesn't exist
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    async saveRatings(data) {
        try {
            const timestamp = data.timestamp || new Date();
            const logEntry = `\n=== Session End: ${timestamp.toISOString()} ===\n` +
                           `Total Photos: ${data.totalPhotos}\n` +
                           `${JSON.stringify(data.photos, null, 2)}\n`;
            
            await fs.promises.appendFile(this.logFile, logEntry);
        } catch (error) {
            console.error('Error saving to log:', error);
        }
    }
}

module.exports = new Logger(); 