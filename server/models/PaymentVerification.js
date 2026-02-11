const mongoose = require('mongoose');

const paymentVerificationSchema = new mongoose.Schema({
    participantName: { type: String, required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    screenshotUrl: { type: String, required: true },
    screenshotPath: { type: String, required: true }, // Supabase storage path
    transactionId: { type: String },
    amount: { type: Number },
    upiId: { type: String },
    status: {
        type: String,
        enum: ['PENDING', 'VERIFIED', 'REJECTED'],
        default: 'PENDING'
    },
    registrationData: { type: Object, required: true } // Stores the full registration data to be moved to Participant on approval
}, { timestamps: true });

module.exports = mongoose.model('PaymentVerification', paymentVerificationSchema);
