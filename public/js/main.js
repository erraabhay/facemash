class FaceMash {
    constructor() {
        this.initializeNavigation();
        this.initializeEventListeners();
    }

    initializeNavigation() {
        document.querySelectorAll('.nav-links a').forEach(link => {
            // Remove transition handling, use default browser navigation
            link.addEventListener('click', (e) => {
                if (!e.ctrlKey && !e.shiftKey && !e.metaKey) {
                    // Let the browser handle navigation naturally
                    return true;
                }
            });
        });
    }

    initializeEventListeners() {
        // Photo voting
        document.querySelectorAll('.photo-card').forEach(card => {
            card.addEventListener('click', (e) => this.handleVote(e));
        });

        // Form submission
        const submitForm = document.querySelector('.submit-form');
        if (submitForm) {
            submitForm.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    async handleVote(e) {
        const card = e.currentTarget;
        const winnerId = card.dataset.id;
        const loserId = card.parentElement.querySelector(`.photo-card:not([data-id="${winnerId}"])`).dataset.id;

        try {
            const response = await this.submitVote(winnerId, loserId);
            if (response.success) {
                this.updatePhotos(response.newPhotos);
            }
        } catch (err) {
            console.error('Error voting:', err);
            this.showNotification('Error recording vote', 'error');
        }
    }

    async submitVote(winnerId, loserId) {
        const response = await fetch('/vote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ winnerId, loserId })
        });
        return await response.json();
    }

    updatePhotos(newPhotos) {
        const container = document.querySelector('.comparison-container');
        if (!container) return;

        container.innerHTML = newPhotos.map(photo => `
            <div class="photo-card" data-id="${photo._id}">
                <img src="${photo.path}" alt="${photo.name}">
                <div class="photo-name">${photo.name}</div>
            </div>
        `).join('');

        // Reinitialize event listeners
        this.initializeEventListeners();
    }

    async handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        try {
            const response = await fetch('/submit', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (result.success) {
                // Show success message
                this.showNotification('Photo uploaded successfully');
                
                // Optionally redirect to voting page instead of rankings
                window.location.href = '/';
            } else {
                alert(result.error || 'Error uploading photo');
            }
        } catch (err) {
            console.error('Error submitting:', err);
            alert('Error uploading photo');
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new FaceMash();
}); 