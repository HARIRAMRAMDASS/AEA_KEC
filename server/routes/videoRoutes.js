const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/authMiddleware');
const { upload, cloudinary, uploadToCloudinary } = require('../utils/cloudinary');

// @desc Add video
router.post('/', protect, upload.single('video'), asyncHandler(async (req, res) => {
    try {
        console.log("=== VIDEO UPLOAD REQUEST ===");
        console.log("REQ FILE:", req.file ? { originalname: req.file.originalname, mimetype: req.file.mimetype, size: req.file.size, hasBuffer: !!req.file.buffer } : 'NO FILE RECEIVED');

        if (!req.file) {
            return res.status(400).json({ message: 'Video is required' });
        }

        console.log("UPLOADING VIDEO TO CLOUDINARY...");
        // Upload buffer to Cloudinary as video
        const uploaded = await uploadToCloudinary(req.file.buffer, 'aea_kec/videos', 'video');
        console.log("VIDEO UPLOAD SUCCESS:", { url: uploaded.secure_url, publicId: uploaded.public_id });

        const video = await Video.create({
            videoUrl: uploaded.secure_url,
            publicId: uploaded.public_id
        });

        console.log("VIDEO CREATED:", video._id);
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
