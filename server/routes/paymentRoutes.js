const express = require('express');
const router = express.Router();
const PaymentConfig = require('../models/PaymentConfig');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/authMiddleware');
const { upload, cloudinary } = require('../utils/cloudinary');

// @desc Get current payment configuration
// @access Public
router.get('/', asyncHandler(async (req, res) => {
    let config = await PaymentConfig.findOne();
    if (!config) {
        // Create default if not exists
        config = await PaymentConfig.create({
            paymentMode: 'QR',
            accountHolderName: '',
            accountNumber: '',
            ifscCode: '',
            bankName: ''
        });
    }
    res.json(config);
}));

// @desc Update payment mode
// @access Private/Admin
router.put('/mode', protect, asyncHandler(async (req, res) => {
    const { paymentMode } = req.body;
    if (!['BANK', 'QR'].includes(paymentMode)) {
        res.status(400);
        throw new Error('Invalid payment mode');
    }

    let config = await PaymentConfig.findOne();
    if (!config) config = new PaymentConfig();

    config.paymentMode = paymentMode;
    await config.save();
    res.json(config);
}));

// @desc Update bank details
// @access Private/Admin
router.put('/bank', protect, asyncHandler(async (req, res) => {
    const { accountHolderName, accountNumber, ifscCode, bankName } = req.body;

    let config = await PaymentConfig.findOne();
    if (!config) config = new PaymentConfig();

    config.accountHolderName = accountHolderName;
    config.accountNumber = accountNumber;
    config.ifscCode = ifscCode;
    config.bankName = bankName;

    await config.save();
    res.json(config);
}));

// @desc Upload/Update QR Code
// @access Private/Admin
router.put('/qr', protect, upload.single('qrImage'), asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('Please upload an image');
    }

    let config = await PaymentConfig.findOne();
    if (!config) config = new PaymentConfig();

    // Delete old image if exists
    if (config.qrPublicId) {
        await cloudinary.uploader.destroy(config.qrPublicId);
    }

    // Since we are using cloudinary storage in multer, req.file.path is the URL and req.file.filename is public_id
    config.qrImageUrl = req.file.path;
    config.qrPublicId = req.file.filename;

    await config.save();
    res.json(config);
}));

module.exports = router;
