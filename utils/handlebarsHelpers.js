module.exports = {
    calculateWinRate: function(matches, rating) {
        if (!matches) return '0';
        const baseline = 1400;
        const winRate = ((rating - baseline) / (matches * 32) + 0.5) * 100;
        return Math.round(Math.max(0, Math.min(100, winRate)));
    },

    formatDate: function(date) {
        if (!date) return 'Never';
        return new Date(date).toLocaleDateString();
    },

    eq: function(v1, v2) {
        return v1 === v2;
    },

    ne: function(v1, v2) {
        return v1 !== v2;
    }
}; 