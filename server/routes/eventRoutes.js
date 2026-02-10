const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Participant = require('../models/Participant');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/authMiddleware');
const { upload, cloudinary, uploadToCloudinary } = require('../utils/cloudinary');
const { sendMail } = require('../utils/mailService');
const xlsx = require('xlsx');

// @desc Create a new event
router.post('/', protect, upload.single('qrCode'), (err, req, res, next) => {
    if (err) {
        console.error("[MULTER ERROR] File upload failed:", err.message);
        return res.status(400).json({ message: `Upload error: ${err.message}` });
    }
    next();
}, asyncHandler(async (req, res) => {
    try {
        console.log("=== EVENT CREATION REQUEST ===");
        console.log("CONTENT-TYPE RECEIVED:", req.headers['content-type']);
        console.log("REQ BODY:", req.body);
        console.log("REQ FILE:", req.file ? {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            hasBuffer: !!req.file.buffer
        } : 'NO FILE RECEIVED - CHECK HEADERS ABOVE');

        let { name, type, date, teamSize, feeType, feeAmount, closingDate, whatsappLink, maxSelectableEvents, selectionMode, eventGroup, details } = req.body;

        if (typeof details === 'string') {
            try {
                details = JSON.parse(details);
            } catch (e) {
                details = [];
            }
        }

        if (!req.file) {
            return res.status(400).json({ message: 'QR Code image is required' });
        }

        console.log("UPLOADING QR CODE TO CLOUDINARY...");
        // Upload buffer to Cloudinary
        const uploaded = await uploadToCloudinary(req.file.buffer, 'aea_kec/events');
        console.log("QR CODE UPLOAD SUCCESS:", { url: uploaded.secure_url, publicId: uploaded.public_id });

        const event = await Event.create({
            name,
            type,
            date,
            teamSize,
            feeType,
            feeAmount,
            closingDate,
            qrCode: {
                url: uploaded.secure_url,
                publicId: uploaded.public_id
            },
            whatsappLink,
            maxSelectableEvents,
            selectionMode,
            selectionMode,
            eventGroup,
            details: details || []
        });

        console.log("EVENT CREATED:", event._id);
        res.status(201).json(event);
    } catch (error) {
        console.error('Event Creation Error:', error);
        res.status(500).json({ message: error.message || 'Server Upload Error' });
    }
}));

// @desc Get all events
router.get('/', asyncHandler(async (req, res) => {
    const events = await Event.find({}).sort({ date: 1 });
    res.json(events);
}));

// @desc Get event by ID
router.get('/:id', asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }
    res.json(event);
}));

// @desc Delete event
router.delete('/:id', protect, asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Delete image from cloudinary (optional failure)
    try {
        if (event.qrCode && event.qrCode.publicId) {
            await cloudinary.uploader.destroy(event.qrCode.publicId);
        }
    } catch (cloudinaryErr) {
        console.error('Cloudinary deletion failed:', cloudinaryErr);
    }

    await event.deleteOne();
    res.json({ message: 'Event removed' });
}));

// @desc Update Event QR Code
router.put('/:id/qr', protect, upload.single('qrCode'), asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    if (!req.file) {
        res.status(400);
        throw new Error('No image file provided');
    }

    // Delete old QR from Cloudinary
    if (event.qrCode && event.qrCode.publicId) {
        try {
            await cloudinary.uploader.destroy(event.qrCode.publicId);
        } catch (err) {
            console.error('Failed to delete old QR:', err);
        }
    }

    // Upload new QR
    const uploaded = await uploadToCloudinary(req.file.buffer, 'aea_kec/events');

    event.qrCode = {
        url: uploaded.secure_url,
        publicId: uploaded.public_id
    };

    await event.save();
    res.json(event);
}));

// @desc Register for an event(s)
router.post('/register', upload.single('paymentScreenshot'), asyncHandler(async (req, res) => {
    console.log("=== REGISTRATION REQUEST ===");
    console.log("REQ BODY:", req.body);
    console.log("REQ FILE:", req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        hasBuffer: !!req.file.buffer
    } : 'NO FILE RECEIVED - THIS IS THE PROBLEM');

    let { teamName, members, college, collegeName, transactionId, eventIds, collegeId } = req.body;

    // Parse members and eventIds if they come as strings (common with FormData)
    if (typeof members === 'string') members = JSON.parse(members);
    if (typeof eventIds === 'string') eventIds = JSON.parse(eventIds);

    console.log("PARSED MEMBERS:", members);
    console.log("PARSED EVENT IDS:", eventIds);

    if (!eventIds || eventIds.length === 0) {
        res.status(400);
        throw new Error('At least one event must be selected');
    }

    const events = await Event.find({ _id: { $in: eventIds } });

    if (events.length === 0) {
        res.status(404);
        throw new Error('Events not found');
    }

    // Check deadlines for all selected events
    const now = new Date();
    for (const event of events) {
        if (now > new Date(event.closingDate)) {
            res.status(400);
            throw new Error(`Registration for ${event.name} is closed`);
        }
    }

    // Validate members: at least one member with mandatory details
    const validMember = members.find(m => m.name && m.email && m.phone);
    if (!validMember) {
        res.status(400);
        throw new Error('At least one team member with name, email, and phone is required');
    }

    if (!req.file) {
        console.error("CRITICAL ERROR: NO FILE IN REQUEST");
        return res.status(400).json({ message: 'Payment screenshot is mandatory' });
    }

    console.log("UPLOADING TO CLOUDINARY...");
    // Upload buffer to Cloudinary
    const uploaded = await uploadToCloudinary(req.file.buffer, 'aea_kec/payments');
    console.log("CLOUDINARY UPLOAD RESULT:", { secure_url: uploaded.secure_url, public_id: uploaded.public_id });

    // Generate a secure 6-digit verification code
    // Generate a secure, unique 6-digit verification code
    let verificationCode;
    let isUnique = false;
    while (!isUnique) {
        verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const existing = await Participant.findOne({ verificationCode });
        if (!existing) isUnique = true;
    }

    const participant = await Participant.create({
        events: eventIds,
        teamName,
        members,
        college,
        collegeName,
        collegeId: collegeId || null,
        transactionId,
        paymentScreenshot: {
            url: uploaded.secure_url,
            publicId: uploaded.public_id
        },
        verificationCode
    });

    // Send Confirmation Emails (Background Process)
    const emailPayload = {
        emails: members.filter(m => m.email).map(m => m.email),
        eventName: events.map(e => e.name).join(' & '),
        teamName: teamName || 'Individual',
        collegeName: collegeName,
        verificationCode
    };

    sendMail(emailPayload).catch(err => console.error('Background Email Trigger Failed:', err));

    res.status(201).json(participant);
}));

// @desc Export registrations to Excel
router.get('/:id/export', protect, asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    const registrations = await Participant.find({ events: { $in: [event._id] } });

    let data = [];
    let counter = 1;
    registrations.forEach((reg) => {
        reg.members.forEach((member) => {
            data.push({
                'S.No': counter++,
                'Verification ID': reg.verificationCode || 'N/A',
                'Event Name': event.name,
                'Team Name': reg.teamName || 'Individual',
                'College Type': reg.college,
                'College Name': reg.collegeName,
                'Transaction ID': reg.transactionId,
                'Member Name': member.name,
                'Roll Number': member.rollNumber,
                'Phone': member.phone,
                'Email': member.email,
                'Department': member.department,
                'Registered At': new Date(reg.createdAt).toLocaleString('en-IN')
            });
        });
    });

    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Registrations');

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Registrations_${event.name.replace(/\s+/g, '_')}.xlsx`);
    res.send(buffer);
}));

// @desc Update global selection mode for all events
router.put('/global-mode', protect, asyncHandler(async (req, res) => {
    const { selectionMode } = req.body;
    if (!['Only Zhakra', 'Only Auto Expo', 'Both'].includes(selectionMode)) {
        res.status(400);
        throw new Error('Invalid selection mode');
    }

    await Event.updateMany({}, { selectionMode });
    res.json({ message: 'Global selection mode updated' });
}));

module.exports = router;
