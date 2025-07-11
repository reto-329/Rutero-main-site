// ADMIN MESSAGE SYSTEM

class MessageSystem {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Create message container
        this.container = document.createElement('div');
        this.container.className = 'message-container';
        document.body.appendChild(this.container);
    }

    show(text, type = 'info', duration = 5000) {
        const message = document.createElement('div');
        message.className = `message ${type}`;
        
        const icons = {
            success: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20,6 9,17 4,12"></polyline>
            </svg>`,
            error: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>`,
            warning: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>`,
            info: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="m9,12 2,2 4,-4"></path>
            </svg>`
        };

        message.innerHTML = `
            <div class="message-icon">${icons[type] || icons.info}</div>
            <div class="message-text">${text}</div>
            <button class="message-close" onclick="this.parentElement.remove()">&times;</button>
        `;

        this.container.appendChild(message);

        // Show animation
        setTimeout(() => message.classList.add('show'), 100);

        // Auto remove
        setTimeout(() => {
            if (message.parentElement) {
                message.classList.remove('show');
                setTimeout(() => message.remove(), 400);
            }
        }, duration);

        return message;
    }

    success(text, duration) {
        return this.show(text, 'success', duration);
    }

    error(text, duration) {
        return this.show(text, 'error', duration);
    }

    warning(text, duration) {
        return this.show(text, 'warning', duration);
    }

    info(text, duration) {
        return this.show(text, 'info', duration);
    }
}

// Initialize global message system
window.Messages = new MessageSystem();

// URL parameter message handler
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    
    if (success) {
        Messages.success(decodeURIComponent(success));
        // Clean URL
        const url = new URL(window.location);
        url.searchParams.delete('success');
        window.history.replaceState({}, '', url);
    }
    
    if (error) {
        Messages.error(decodeURIComponent(error));
        // Clean URL
        const url = new URL(window.location);
        url.searchParams.delete('error');
        window.history.replaceState({}, '', url);
    }
});