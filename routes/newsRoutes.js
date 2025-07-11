const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const announcementController = require('../controllers/announcementController');

// API endpoints
router.get('/api/news', newsController.getAllNews);
router.get('/api/announcements', announcementController.getAllAnnouncements);

// Render pages
router.get('/news', newsController.renderNewsPage);
router.get('/announcements', announcementController.renderAnnouncementsPage);

module.exports = router;
