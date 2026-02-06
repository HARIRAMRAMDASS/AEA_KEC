const express = require('express');
const router = express.Router();
const OfficeBearer = require('../models/OfficeBearer');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/authMiddleware');
const { upload, cloudinary } = require('../utils/cloudinary');

// @desc Add office bearer image
router.post('/', protect, upload.single('image'), asyncHandler(async (req, res) => {
    try {
        if (!req.file) {
            res.status(400);
            throw new Error('Image is required');
        }

        const bearer = await OfficeBearer.create({
            imageUrl: req.file.path,
            publicId: req.file.filename
        });

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

    await cloudinary.uploader.destroy(bearer.publicId);
    await bearer.deleteOne();

    res.json({ message: 'Image removed' });
}));

module.exports = router;
