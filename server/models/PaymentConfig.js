const mongoose = require('mongoose');

const paymentConfigSchema = new mongoose.Schema({
    paymentMode: {
        type: String,
        enum: ['BANK', 'QR'],
        default: 'QR'
    },
    // Bank Details
    accountHolderName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    bankName: { type: String, default: '' },
    // QR Details
    qrImageUrl: { type: String, default: '' },
    qrPublicId: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('PaymentConfig', paymentConfigSchema);
