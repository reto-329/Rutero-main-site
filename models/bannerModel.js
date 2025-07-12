const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware to update the 'updatedAt' field before each save
bannerSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
