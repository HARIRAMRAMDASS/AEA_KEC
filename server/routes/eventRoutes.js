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
        const { name, type, date, teamSize, feeType, feeAmount, closingDate, whatsappLink, maxSelectableEvents, selectionMode, eventGroup } = req.body;

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
            whatsappLink,
            maxSelectableEvents,
            selectionMode,
            eventGroup
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

// @desc Register for an event(s)
router.post('/register', upload.single('paymentScreenshot'), asyncHandler(async (req, res) => {
    let { teamName, members, college, collegeName, transactionId, eventIds, collegeId } = req.body;

    // Parse members and eventIds if they come as strings (common with FormData)
    if (typeof members === 'string') members = JSON.parse(members);
    if (typeof eventIds === 'string') eventIds = JSON.parse(eventIds);

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
        res.status(400);
        throw new Error('Payment screenshot is mandatory');
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
            url: req.file.path,
            publicId: req.file.filename
        }
    });

    // Send Emails
    const emails = members.filter(m => m.email).map(m => m.email);
    const eventNames = events.map(e => e.name).join(', ');

    const emailData = {
        to: emails,
        subject: `Successful Registration - ${eventNames}`,
        html: `
            <div style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
                <div style="background: #00A19B; color: white; padding: 20px; text-align: center;">
                    <h1>Registration Confirmed!</h1>
                </div>
                <div style="padding: 30px;">
                    <p>Hi Team,</p>
                    <p>You have successfully registered for the following events:</p>
                    <div style="background: #f9f9f9; padding: 20px; border-left: 5px solid #00A19B; margin: 20px 0;">
                        <ul style="list-style: none; padding: 0; margin: 0;">
                            ${events.map(e => `
                                <li style="margin-bottom: 10px;">
                                    <strong>${e.name}</strong><br/>
                                    <small>Date: ${new Date(e.date).toLocaleDateString()} - ${new Date(e.date).toLocaleTimeString()}</small><br/>
                                    <a href="${e.whatsappLink}" style="color: #00A19B; text-decoration: none; font-size: 0.9rem;">Join WhatsApp Group</a>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    <p><strong>Transaction ID:</strong> ${transactionId}</p>
                    <p>Please bring your college ID card for on-spot verification.</p>
                    <br/>
                    <p>Gear up for the grid!</p>
                    <p>Regards,<br/><strong>AEA Team</strong></p>
                </div>
            </div>
        `
    };

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
