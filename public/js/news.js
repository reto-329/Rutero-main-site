// Modal functionality
function openNewsModal(title, content, date, author, category) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMeta').innerHTML = `
        <span><i class="far fa-calendar-alt"></i> ${date}</span>
        ${author ? `<span><i class="fas fa-user"></i> ${author}</span>` : ''}
        ${category ? `<span class="news-category">${category}</span>` : ''}
    `;
    document.getElementById('modalContent').textContent = content;
    document.getElementById('newsModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeNewsModal() {
    document.getElementById('newsModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function shareArticle() {
    if (navigator.share) {
        navigator.share({
            title: document.getElementById('modalTitle').textContent,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    }
}

// Search functionality
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const newsCards = document.querySelectorAll('.news-card');
        newsCards.forEach(card => {
            const title = card.querySelector('.news-title').textContent.toLowerCase();
            const excerpt = card.querySelector('.news-excerpt').textContent.toLowerCase();
            if (title.includes(searchTerm) || excerpt.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// Category filter functionality
const categoryFilter = document.getElementById('categoryFilter');
if (categoryFilter) {
    categoryFilter.addEventListener('change', function() {
        const selectedCategory = this.value.toLowerCase();
        const newsCards = document.querySelectorAll('.news-card');
        newsCards.forEach(card => {
            const categoryElement = card.querySelector('.news-category');
            const cardCategory = categoryElement ? categoryElement.getAttribute('data-category') : '';
            
            if (!selectedCategory || cardCategory === selectedCategory) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// Sort functionality
const sortBy = document.getElementById('sortBy');
if (sortBy) {
    sortBy.addEventListener('change', function() {
        const sortValue = this.value;
        const newsGrid = document.getElementById('newsGrid');
        const cards = Array.from(document.querySelectorAll('.news-card'));
        
        cards.sort((a, b) => {
            if (sortValue === 'newest') {
                const dateA = new Date(a.querySelector('.news-date').textContent.replace(/.*(\d{4}).*/, '$1'));
                const dateB = new Date(b.querySelector('.news-date').textContent.replace(/.*(\d{4}).*/, '$1'));
                return dateB - dateA;
            } else if (sortValue === 'oldest') {
                const dateA = new Date(a.querySelector('.news-date').textContent.replace(/.*(\d{4}).*/, '$1'));
                const dateB = new Date(b.querySelector('.news-date').textContent.replace(/.*(\d{4}).*/, '$1'));
                return dateA - dateB;
            }
        });
        
        // Clear and re-append sorted cards
        cards.forEach(card => newsGrid.appendChild(card));
    });
}