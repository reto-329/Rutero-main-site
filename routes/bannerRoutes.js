const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');

// GET route for the banner management page
router.get('/banner', bannerController.getBannerPage);

// POST route to update the banner
router.post('/banner', bannerController.updateBanner);

module.exports = router;
