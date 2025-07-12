const Banner = require('../models/bannerModel');

// Render the banner management page
exports.getBannerPage = async (req, res) => {
    if (!req.session.isAdmin) {
        return res.redirect('/admin/login');
    }
    try {
        const banner = await Banner.findOne();
        res.render('admin/banner', { 
            banner, 
            username: req.session.adminUsername, 
            activePage: 'banner' 
        });
    } catch (error) {
        console.error('Error fetching banner:', error);
        res.status(500).send('Error fetching banner page.');
    }
};

// Update the banner text
exports.updateBanner = async (req, res) => {
    try {
        let banner = await Banner.findOne();
        if (banner) {
            banner.text = req.body.bannerText;
        } else {
            banner = new Banner({ text: req.body.bannerText });
        }
        await banner.save();
        res.redirect('/admin/banner');
    } catch (error) {
        console.error('Error updating banner:', error);
        res.status(500).send('Error updating banner.');
    }
};
