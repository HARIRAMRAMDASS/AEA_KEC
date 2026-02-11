const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/authMiddleware');
const { upload, cloudinary, uploadToCloudinary } = require('../utils/cloudinary');

// @desc Get all members
router.get('/', asyncHandler(async (req, res) => {
    const members = await Member.find({}).sort({ createdAt: -1 });
    res.json(members);
}));

// @desc Add a new member
router.post('/', protect, upload.single('image'), asyncHandler(async (req, res) => {
    const { name, position, mobile, email, instagram, linkedin, github } = req.body;

    if (!req.file) {
        res.status(400);
        throw new Error('Member image is required');
    }

    const uploaded = await uploadToCloudinary(req.file.buffer, 'aea_kec/members');

    const member = await Member.create({
        name,
        position,
        mobile,
        email,
        instagram,
        linkedin,
        github,
        image: {
            url: uploaded.secure_url,
            publicId: uploaded.public_id
        }
    });

    res.status(201).json(member);
}));

// @desc Delete a member
router.delete('/:id', protect, asyncHandler(async (req, res) => {
    const member = await Member.findById(req.params.id);
    if (!member) {
        res.status(404);
        throw new Error('Member not found');
    }

    if (member.image && member.image.publicId) {
        await cloudinary.uploader.destroy(member.image.publicId);
    }

    await member.deleteOne();
    res.json({ message: 'Member removed' });
}));

module.exports = router;
