const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    position: { type: String, required: true },
    mobile: { type: String },
    email: { type: String },
    instagram: { type: String },
    linkedin: { type: String },
    github: { type: String },
    image: {
        url: { type: String, required: true },
        publicId: { type: String, required: true }
    }
}, { timestamps: true });

module.exports = mongoose.model('Member', memberSchema);
