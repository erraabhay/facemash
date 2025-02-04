let totalVotes = 0;

function initializeSocket(io) {
    io.on('connection', (socket) => {
        // Send initial total votes
        socket.emit('updateTotalVotes', totalVotes);

        // Handle new vote
        socket.on('newVote', () => {
            totalVotes++;
            io.emit('updateTotalVotes', totalVotes);
        });
    });
}

module.exports = initializeSocket; 