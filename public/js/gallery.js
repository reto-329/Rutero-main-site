// Scripts for gallery.ejs

var slideIndex = 0;
var modalImages = [];
var modal = document.getElementById('myModal');
var modalImg = document.getElementById('modalImage');
var counter = document.getElementById('imageCounter');

document.addEventListener('DOMContentLoaded', function() {
    modalImages = Array.from(document.querySelectorAll('.gallery-item img'));
    if (counter && modalImages.length > 0) {
        updateCounter();
    }
});

function openModal(imagePath, index) {
    modal.style.display = 'flex';
    modalImg.src = imagePath;
    slideIndex = index;
    updateCounter();
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function plusSlides(n) {
    slideIndex += n;
    if (slideIndex >= modalImages.length) {
        slideIndex = 0;
    } else if (slideIndex < 0) {
        slideIndex = modalImages.length - 1;
    }
    
    var fullSizeSrc = modalImages[slideIndex].parentElement.getAttribute('onclick');
    var match = fullSizeSrc.match(/openModal\('([^']+)'/);
    if (match) {
        modalImg.src = match[1];
    }
    
    updateCounter();
}

function updateCounter() {
    if (counter && modalImages.length > 0) {
        counter.textContent = `${slideIndex + 1} / ${modalImages.length}`;
    }
}

document.addEventListener('keydown', function(e) {
    if (modal.style.display === 'flex') {
        if (e.key === 'ArrowLeft') plusSlides(-1);
        if (e.key === 'ArrowRight') plusSlides(1);
        if (e.key === 'Escape') closeModal();
    }
});