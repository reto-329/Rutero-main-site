// Add loading effect to all buttons in admin pages
document.addEventListener('DOMContentLoaded', function() {
    // Add loading to all form submit buttons
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="loading-spinner"></span> Loading...';
            }
        });
    });

    // Add loading to all buttons with onclick events (except gallery icon buttons and sidebar hamburger)
    const buttons = document.querySelectorAll('button[onclick]');
    buttons.forEach(button => {
        // Skip gallery icon buttons (small buttons with only SVG content)
        if (button.classList.contains('btn-sm') && button.innerHTML.includes('<svg')) {
            return;
        }
        
        // Skip sidebar hamburger menu button
        if (button.classList.contains('mobile-menu-btn')) {
            return;
        }
        
        const originalOnclick = button.getAttribute('onclick');
        button.addEventListener('click', function() {
            if (!button.disabled) {
                button.disabled = true;
                const originalText = button.innerHTML;
                button.innerHTML = '<span class="loading-spinner"></span> Loading...';
                
                // Re-enable after 3 seconds as fallback
                setTimeout(() => {
                    button.disabled = false;
                    button.innerHTML = originalText;
                }, 3000);
            }
        });
    });
});