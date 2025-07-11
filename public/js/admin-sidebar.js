// Admin Sidebar Management
function toggleSidebar() {
    const sidebar = document.getElementById('adminSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    
    const isOpen = sidebar.classList.contains('open');
    
    if (isOpen) {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
        menuBtn.classList.remove('hidden');
        document.body.classList.remove('sidebar-open');
    } else {
        sidebar.classList.add('open');
        overlay.classList.add('show');
        menuBtn.classList.add('hidden');
        if (window.innerWidth <= 768) {
            document.body.classList.add('sidebar-open');
        }
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('adminSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
    menuBtn.classList.remove('hidden');
    document.body.classList.remove('sidebar-open');
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function(e) {
    const sidebar = document.getElementById('adminSidebar');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (window.innerWidth <= 768 && 
        sidebar.classList.contains('open') && 
        !sidebar.contains(e.target) && 
        !menuBtn.contains(e.target)) {
        toggleSidebar();
    }
});