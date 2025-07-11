// Modal functionality
function openAnnouncementModal(title, description, date) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMeta').innerHTML = `
        <span><i class="far fa-calendar-alt"></i> ${date}</span>
    `;
    document.getElementById('modalContent').textContent = description;
    document.getElementById('announcementModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeAnnouncementModal() {
    document.getElementById('announcementModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function shareAnnouncement() {
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
        const announcementCards = document.querySelectorAll('.announcement-card');
        announcementCards.forEach(card => {
            const title = card.querySelector('.announcement-title').textContent.toLowerCase();
            const description = card.querySelector('.announcement-excerpt').textContent.toLowerCase();
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
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
        const announcementsGrid = document.getElementById('announcementsGrid');
        const cards = Array.from(document.querySelectorAll('.announcement-card'));
        
        cards.sort((a, b) => {
            if (sortValue === 'newest') {
                const dateA = new Date(a.querySelector('.announcement-full-date').textContent.replace(/.*(\d{4}).*/, '$1'));
                const dateB = new Date(b.querySelector('.announcement-full-date').textContent.replace(/.*(\d{4}).*/, '$1'));
                return dateB - dateA;
            } else if (sortValue === 'oldest') {
                const dateA = new Date(a.querySelector('.announcement-full-date').textContent.replace(/.*(\d{4}).*/, '$1'));
                const dateB = new Date(b.querySelector('.announcement-full-date').textContent.replace(/.*(\d{4}).*/, '$1'));
                return dateA - dateB;
            }
        });
        
        // Clear and re-append sorted cards
        cards.forEach(card => announcementsGrid.appendChild(card));
    });
}