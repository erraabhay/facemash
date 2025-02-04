socket.on('resetComplete', (reset) => {
    if (reset) {
        // Refresh the page or update the UI
        window.location.reload();
    }
}); 