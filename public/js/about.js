// Simple AOS-like animation on scroll
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