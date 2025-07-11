const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        default: 'School Gallery'
    },
    description: {
        type: String,
        default: 'Photo gallery of school events and activities'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Gallery', gallerySchema);