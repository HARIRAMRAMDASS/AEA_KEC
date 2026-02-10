const express = require('express');
const router = express.Router();
const OfficeBearer = require('../models/OfficeBearer');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/authMiddleware');
const { upload, cloudinary, uploadToCloudinary } = require('../utils/cloudinary');

// @desc Add office bearer image
router.post('/', protect, upload.single('image'), asyncHandler(async (req, res) => {
    try {
        console.log("=== BEARER UPLOAD REQUEST ===");
        console.log("REQ FILE:", req.file ? { originalname: req.file.originalname, size: req.file.size, hasBuffer: !!req.file.buffer } : 'NO FILE RECEIVED');

        if (!req.file) {
            return res.status(400).json({ message: 'Image is required' });
        }

        const { name, year } = req.body;

        console.log("UPLOADING BEARER IMAGE TO CLOUDINARY...");
        // Upload buffer to Cloudinary
        const uploaded = await uploadToCloudinary(req.file.buffer, 'aea_kec/bearers');
        console.log("BEARER IMAGE UPLOAD SUCCESS:", { url: uploaded.secure_url, publicId: uploaded.public_id });

        const bearer = await OfficeBearer.create({
            imageUrl: uploaded.secure_url,
            publicId: uploaded.public_id,
            name,
            year
        });

        console.log("BEARER CREATED:", bearer._id);
        res.status(201).json(bearer);
    } catch (error) {
        console.error('Bearer Upload Error:', error);
        res.status(500).json({ message: error.message || 'Server Upload Error' });
    }
}));

// @desc Get all bearers
router.get('/', asyncHandler(async (req, res) => {
    const bearers = await OfficeBearer.find({}).sort({ createdAt: -1 });
    res.json(bearers);
}));

// @desc Delete bearer image
router.delete('/:id', protect, asyncHandler(async (req, res) => {
    const bearer = await OfficeBearer.findById(req.params.id);
    if (!bearer) {
        res.status(404);
        throw new Error('Office bearer not found');
    }

    try {
        if (bearer.publicId) {
            await cloudinary.uploader.destroy(bearer.publicId);
        }
    } catch (err) {
        console.error('Cloudinary delete error:', err);
    }

    await bearer.deleteOne();
    res.json({ message: 'Office bearer removed' });
}));

module.exports = router;
