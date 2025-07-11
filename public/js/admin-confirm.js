// ADMIN CONFIRMATION SYSTEM

class ConfirmDialog {
    constructor() {
        this.overlay = null;
        this.dialog = null;
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;
        
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'confirm-overlay';
        
        // Create dialog
        this.dialog = document.createElement('div');
        this.dialog.className = 'confirm-dialog';
        
        this.overlay.appendChild(this.dialog);
        document.body.appendChild(this.overlay);
        
        // Add click outside to close
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hide();
            }
        });
        
        this.isInitialized = true;
    }

    show(title, message, onConfirm, onCancel) {
        // Ensure dialog is initialized
        this.init();
        
        // Format message to handle line breaks
        const formattedMessage = message.replace(/\n/g, '<br>');
        
        this.dialog.innerHTML = `
            <div class="confirm-header">
                <h3>${title}</h3>
            </div>
            <div class="confirm-body">
                <div class="confirm-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                </div>
                <p>${formattedMessage}</p>
            </div>
            <div class="confirm-actions">
                <button class="confirm-btn confirm-cancel">Cancel</button>
                <button class="confirm-btn confirm-yes">Yes, Delete</button>
            </div>
        `;

        const cancelBtn = this.dialog.querySelector('.confirm-cancel');
        const yesBtn = this.dialog.querySelector('.confirm-yes');

        cancelBtn.onclick = (e) => {
            e.preventDefault();
            this.hide();
            if (onCancel) onCancel();
        };

        yesBtn.onclick = (e) => {
            e.preventDefault();
            console.log('Confirm button clicked');
            this.hide();
            if (onConfirm) {
                console.log('Executing onConfirm callback');
                onConfirm();
            }
        };

        this.overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    hide() {
        if (this.overlay) {
            this.overlay.classList.remove('show');
        }
        document.body.style.overflow = '';
    }
}

// Initialize when DOM is ready
function initConfirmDialog() {
    if (!window.ConfirmDialog) {
        window.ConfirmDialog = new ConfirmDialog();
    }
    
    // Enhanced confirm function
    window.confirmDelete = function(title, message, onConfirm) {
        if (!window.ConfirmDialog) {
            window.ConfirmDialog = new ConfirmDialog();
        }
        window.ConfirmDialog.show(title, message, onConfirm);
    };
}

// Initialize immediately if DOM is ready, otherwise wait
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initConfirmDialog);
} else {
    initConfirmDialog();
}