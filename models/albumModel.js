const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
    galleryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gallery',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    images: [{
        filename: String,
        path: String,
        thumbnail: String,
        uploadDate: {
            type: Date,
            default: Date.now
        }
    }],
    cloudinaryFolder: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Album', albumSchema);