const Announcement = require('../models/announcementModel');

// Get all announcements (JSON API)
exports.getAllAnnouncements = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 4;
        const skip = (page - 1) * limit;

        const total = await Announcement.countDocuments();
        const announcements = await Announcement.find().sort({ date: -1 }).skip(skip).limit(limit);

        res.json({
            data: announcements,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch announcements.' });
    }
};

// Render announcements.ejs with all announcements
exports.renderAnnouncementsPage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 6;
        const skip = (page - 1) * limit;

        const total = await Announcement.countDocuments();
        const allAnnouncements = await Announcement.find().sort({ date: -1 }).skip(skip).limit(limit);

        res.render('announcements', { 
            activePage: "announcements", 
            allAnnouncements,
            pageTitle: "School Announcements",
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total
        });
    } catch (err) {
        console.error('Error loading announcements page:', err);
        res.status(500).render('error', { 
            message: 'Error loading announcements page.',
            activePage: "announcements"
        });
    }
};