const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/authMiddleware');
const { upload, cloudinary } = require('../utils/cloudinary');

// @desc Add video
router.post('/', protect, upload.single('video'), asyncHandler(async (req, res) => {
    try {
        if (!req.file) {
            res.status(400);
            throw new Error('Video is required');
        }

        const video = await Video.create({
            videoUrl: req.file.path,
            publicId: req.file.filename
        });

        res.status(201).json(video);
    } catch (error) {
        console.error('Video Upload Error:', error);
        res.status(500).json({ message: error.message || 'Server Upload Error' });
    }
}));

// @desc Get all videos
router.get('/', asyncHandler(async (req, res) => {
    const videos = await Video.find({}).sort({ createdAt: 1 });
    res.json(videos);
}));

// @desc Delete video
router.delete('/:id', protect, asyncHandler(async (req, res) => {
    const video = await Video.findById(req.params.id);
    if (!video) {
        res.status(404);
        throw new Error('Video not found');
    }

    try {
        if (video.publicId) {
            await cloudinary.uploader.destroy(video.publicId, { resource_type: 'video' });
        }
    } catch (err) {
        console.error('Cloudinary video delete error:', err);
    }
    await video.deleteOne();
    res.json({ message: 'Video removed' });
}));

module.exports = router;
