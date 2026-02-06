const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Participant = require('../models/Participant');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/authMiddleware');
const { upload, cloudinary } = require('../utils/cloudinary');
const { sendMail } = require('../utils/mailService');
const xlsx = require('xlsx');

// @desc Create a new event
router.post('/', protect, upload.single('qrCode'), asyncHandler(async (req, res) => {
    try {
        const { name, type, date, teamSize, feeType, feeAmount, closingDate, whatsappLink } = req.body;

        if (!req.file) {
            res.status(400);
            throw new Error('QR Code image is required');
        }

        const event = await Event.create({
            name,
            type,
            date,
            teamSize,
            feeType,
            feeAmount,
            closingDate,
            qrCode: {
                url: req.file.path,
                publicId: req.file.filename
            },
            whatsappLink
        });

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

    // Delete image from cloudinary
    await cloudinary.uploader.destroy(event.qrCode.publicId);
    await event.deleteOne();

    res.json({ message: 'Event removed' });
}));

// @desc Register for an event
router.post('/:id/register', asyncHandler(async (req, res) => {
    const { teamName, members, college, collegeName, transactionId } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Check if registration is closed
    if (new Date() > new Date(event.closingDate)) {
        res.status(400);
        throw new Error('Registration for this event is closed');
    }

    const participant = await Participant.create({
        event: event._id,
        teamName,
        members,
        college,
        collegeName,
        transactionId
    });

    // Send Emails via centralized Mail Service
    const emails = members.map(m => m.email);

    // Trigger email AFTER database success
    const emailData = {
        to: emails,
        subject: `Welcome to ${event.name}`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h1 style="color: #00A19B;">Registration Successful!</h1>
                <p>Hi Team,</p>
                <p>You have successfully registered for <strong>${event.name}</strong>.</p>
                <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Event Details:</strong></p>
                    <ul style="list-style: none; padding: 0;">
                        <li>📅 <strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</li>
                        <li>💳 <strong>Transaction ID:</strong> ${transactionId}</li>
                    </ul>
                </div>
                <p><strong>Important Instruction:</strong> Come with your college ID card for verification.</p>
                <p>Join the WhatsApp group for updates: <a href="${event.whatsappLink}" style="color: #00A19B;">Join Group</a></p>
                <br/>
                <p>Best Regards,<br/><strong>Automobile Engineering Association (AEA)</strong></p>
            </div>
        `
    };

    // Execute email sending in background (don't block response)
    sendMail(emailData).catch(err => console.error('Background Email Error:', err));

    res.status(201).json(participant);
}));

// @desc Export registrations to Excel
router.get('/:id/export', protect, asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    const registrations = await Participant.find({ event: event._id });

    let data = [];
    registrations.forEach((reg, index) => {
        reg.members.forEach((member, mIndex) => {
            data.push({
                'S.No': index + 1,
                'Team Name': reg.teamName || 'N/A',
                'College': reg.college,
                'College Name': reg.collegeName,
                'Transaction ID': reg.transactionId,
                'Member Name': member.name,
                'Roll Number': member.rollNumber,
                'Phone': member.phone,
                'Email': member.email,
                'Department': member.department
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

module.exports = router;
