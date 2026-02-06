const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    videoUrl: { type: String, required: true },
    publicId: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);
