router.post('/vote', async (req, res) => {
    try {
        const { winnerId, loserId } = req.body;
        
        // Get both photos
        const winner = await Photo.findById(winnerId);
        const loser = await Photo.findById(loserId);
        
        if (!winner || !loser) {
            return res.status(404).json({ error: 'Photos not found' });
        }

        // Update ratings
        const currentTime = new Date();
        winner.lastMatch = currentTime;
        loser.lastMatch = currentTime;
        
        // ... rest of your ELO calculation code ...

        // Save both photos with updated ratings and timestamps
        await Promise.all([winner.save(), loser.save()]);

        // ... rest of your response handling ...

    } catch (error) {
        console.error('Error processing vote:', error);
        res.status(500).json({ error: 'Error processing vote' });
    }
}); 