const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');

// POST /api/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, college, department, year, events } = req.body;

        // Basic validation
        if (!name || !email || !phone || !college || !department || !year) {
            return res.status(400).json({ message: 'Please fill in all required fields' });
        }

        const newRegistration = new Registration({
            name,
            email,
            phone,
            college,
            department,
            year,
            events
        });

        const savedRegistration = await newRegistration.save();
        res.status(201).json({ message: 'Registration successful', data: savedRegistration });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

module.exports = router;
