const express = require('express');
const router = express.Router();
const College = require('../models/College');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/authMiddleware');

// @desc Search colleges by name (Partial & Case-insensitive)
router.get('/search', asyncHandler(async (req, res) => {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);

    const colleges = await College.find({
        name: { $regex: q, $options: 'i' }
    })
        .limit(20)
        .sort({ name: 1 });

    res.json(colleges);
}));

// @desc Get colleges with filters
router.get('/', asyncHandler(async (req, res) => {
    const { search, type, district, limit = 50 } = req.query;
    let query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (type && type !== 'All') query.type = type;
    if (district && district !== 'All') query.district = district;

    const colleges = await College.find(query)
        .limit(Number(limit))
        .sort({ name: 1 });
    res.json(colleges);
}));

// @desc Get all unique districts
router.get('/districts', asyncHandler(async (req, res) => {
    const districts = await College.distinct('district');
    res.json(districts.sort());
}));

// @desc Add a new college (Admin only)
router.post('/', protect, asyncHandler(async (req, res) => {
    const { name, district, type, affiliation } = req.body;
    const collegeExists = await College.findOne({ name });
    if (collegeExists) {
        res.status(400);
        throw new Error('College already exists');
    }
    const college = await College.create({ name, district, type, affiliation });
    res.status(201).json(college);
}));

module.exports = router;
