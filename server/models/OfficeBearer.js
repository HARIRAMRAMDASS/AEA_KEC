const mongoose = require('mongoose');

const officeBearerSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    publicId: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('OfficeBearer', officeBearerSchema);
