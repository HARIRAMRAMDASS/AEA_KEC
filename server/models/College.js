const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, index: true },
    district: { type: String, required: true, index: true },
    state: { type: String, default: 'Tamil Nadu', index: true },
    type: {
        type: String,
        required: true,
        index: true
    },
    affiliation: { type: String }
}, { timestamps: true });

// Full text search index
collegeSchema.index({ name: 'text' });

module.exports = mongoose.model('College', collegeSchema);
