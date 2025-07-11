const News = require('../models/newsModel');

// Get all news articles (JSON API)
exports.getAllNews = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit;

        const total = await News.countDocuments();
        const news = await News.find().sort({ date: -1 }).skip(skip).limit(limit);

        res.json({
            data: news,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch news articles.' });
    }
};

// Render news1.ejs with all news
exports.renderNewsPage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 6;
        const skip = (page - 1) * limit;

        const total = await News.countDocuments();
        const allNews = await News.find().sort({ date: -1 }).skip(skip).limit(limit);
        const categories = await News.distinct('category');

        res.render('news1', { 
            activePage: "news", 
            allNews,
            categories: categories.filter(cat => cat),
            pageTitle: "Latest News & Updates",
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total
        });
    } catch (err) {
        console.error('Error loading news page:', err);
        res.status(500).render('error', { 
            message: 'Error loading news page.',
            activePage: "news"
        });
    }
};