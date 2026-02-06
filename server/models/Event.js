const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['Tech', 'Non-Tech'], required: true },
    date: { type: Date, required: true },
    teamSize: { type: Number, required: true },
    feeType: { type: String, enum: ['Per Head', 'Per Team'], required: true },
    feeAmount: { type: Number, required: true },
    closingDate: { type: Date, required: true },
    qrCode: {
        url: { type: String, required: true },
        publicId: { type: String, required: true }
    },
    whatsappLink: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
