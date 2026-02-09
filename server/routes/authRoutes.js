const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/authMiddleware');

// @desc Auth admin & get token
// @route POST /api/auth/login
router.post('/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (admin && (await admin.comparePassword(password))) {
        generateToken(res, admin._id);
        res.json({
            _id: admin._id,
            email: admin.email
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
}));

// @desc Logout admin
// @route POST /api/auth/logout
router.post('/logout', (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out' });
});

// @desc Register admin (Protected)
// @route POST /api/auth/register
router.post('/register', protect, asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const adminExists = await Admin.findOne({ email });

    if (adminExists) {
        res.status(400);
        throw new Error('Admin already exists');
    }

    const admin = await Admin.create({ email, password });

    if (admin) {
        res.status(201).json({
            _id: admin._id,
            email: admin.email
        });
    } else {
        res.status(400);
        throw new Error('Invalid admin data');
    }
}));

// @desc Get all admins
// @route GET /api/auth
router.get('/', protect, asyncHandler(async (req, res) => {
    const admins = await Admin.find({}).select('-password');
    res.json(admins);
}));

// @desc Delete an admin
// @route DELETE /api/auth/:id
router.delete('/:id', protect, asyncHandler(async (req, res) => {
    const adminCount = await Admin.countDocuments();
    if (adminCount <= 1) {
        res.status(400);
        throw new Error('At least one admin is required');
    }

    const admin = await Admin.findById(req.params.id);
    if (!admin) {
        res.status(404);
        throw new Error('Admin not found');
    }

    await admin.deleteOne();
    res.json({ message: 'Admin deleted successfully' });
}));

module.exports = router;
