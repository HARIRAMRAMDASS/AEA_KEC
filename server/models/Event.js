const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['Tech', 'Non-Tech'], required: true },
    date: { type: Date, required: true },
    teamSize: { type: Number, required: true },
    feeType: { type: String, enum: ['Per Head', 'Per Team'], required: true },
    feeAmount: { type: Number, required: true },
    upiId: { type: String, required: true },
    closingDate: { type: Date, required: true },
    whatsappLink: { type: String, required: true },
    description: { type: String, required: true },
    maxSelectableEvents: { type: Number, default: 0 },
    selectionMode: {
        type: String,
        enum: ['Only Zhakra', 'Only Auto Expo', 'Both'],
        default: 'Both'
    },
    subEvents: [{
        title: { type: String, required: true },
        description: { type: String }
    }],
    details: [{
        title: { type: String, required: true },
        value: { type: String, required: true }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
