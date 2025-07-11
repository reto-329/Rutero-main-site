// Scripts for contact.ejs

document.getElementById('contactForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const submitButton = this.querySelector('.submit-button');
    const buttonContent = submitButton.querySelector('.button-content');
    const buttonLoading = submitButton.querySelector('.button-loading');
    
    // Show loading state
    submitButton.classList.add('loading');
    buttonContent.style.display = 'none';
    buttonLoading.style.display = 'flex';
    
    // Get form data
    const formData = {
        name: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
    };
    
    try {
        const response = await fetch('/send_email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Success - show success message
            document.querySelector('.modern-contact-form').style.display = 'none';
            document.getElementById('form-success').style.display = 'block';
        } else {
            // Error - show error message
            alert('Error sending message: ' + result.message);
            // Reset button state
            submitButton.classList.remove('loading');
            buttonContent.style.display = 'flex';
            buttonLoading.style.display = 'none';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error sending message. Please try again.');
        // Reset button state
        submitButton.classList.remove('loading');
        buttonContent.style.display = 'flex';
        buttonLoading.style.display = 'none';
    }
});

function resetContactForm() {
    document.getElementById('contactForm').reset();
    document.querySelector('.modern-contact-form').style.display = 'block';
    document.getElementById('form-success').style.display = 'none';
    const submitButton = document.querySelector('.submit-button');
    const buttonContent = submitButton.querySelector('.button-content');
    const buttonLoading = submitButton.querySelector('.button-loading');
    submitButton.classList.remove('loading');
    buttonContent.style.display = 'flex';
    buttonLoading.style.display = 'none';
}

document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const faqItem = question.parentElement;
        const isActive = faqItem.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });
        if (!isActive) {
            faqItem.classList.add('active');
        }
    });
});

function animateOnScroll() {
    const elements = document.querySelectorAll('[data-aos]');
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('aos-animate');
        }
    });
}
window.addEventListener('scroll', animateOnScroll);
document.addEventListener('DOMContentLoaded', animateOnScroll);

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ block: 'start' });
        }
    });
});
