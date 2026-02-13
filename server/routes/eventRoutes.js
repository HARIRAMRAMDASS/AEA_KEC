const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Participant = require('../models/Participant');
const PaymentVerification = require('../models/PaymentVerification');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/authMiddleware');
const { upload, cloudinary, uploadToCloudinary } = require('../utils/cloudinary');
const { sendMail } = require('../utils/mailService');
const supabase = require('../utils/supabase');
const { performOCR } = require('../utils/ocr');
const xlsx = require('xlsx');
const crypto = require('crypto');

// @desc Create a new event
router.post('/', protect, asyncHandler(async (req, res) => {
    try {
        console.log("=== EVENT CREATION REQUEST ===");
        let { name, type, date, teamSize, feeType, feeAmount, closingDate, whatsappLink, maxSelectableEvents, selectionMode, details, description, subEvents, upiId } = req.body;

        if (typeof details === 'string') {
            try { details = JSON.parse(details); } catch (e) { details = []; }
        }
        if (typeof subEvents === 'string') {
            try { subEvents = JSON.parse(subEvents); } catch (e) { subEvents = []; }
        }

        const event = await Event.create({
            name,
            type,
            date,
            teamSize,
            feeType,
            feeAmount,
            upiId,
            closingDate,
            whatsappLink,
            description,
            maxSelectableEvents: maxSelectableEvents || 1,
            selectionMode: selectionMode || 'Both',
            subEvents: subEvents || [],
            details: details || []
        });

        console.log("EVENT CREATED:", event._id);
        res.status(201).json(event);
    } catch (error) {
        console.error('Event Creation Error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
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

// @desc Update Event UPI ID
router.put('/:id/upi', protect, asyncHandler(async (req, res) => {
    const { upiId } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    event.upiId = upiId;
    await event.save();
    res.json(event);
}));

// --- PAYMENT VERIFICATION ROUTES ---

// @desc Upload screenshot & start verification
router.post('/verify/upload', upload.single('paymentScreenshot'), asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Screenshot is mandatory' });
    }

    const { participantName, eventId, registrationData } = req.body;
    const parsedRegData = typeof registrationData === 'string' ? JSON.parse(registrationData) : registrationData;

    // 0. Check Supabase Client
    if (!supabase) {
        console.error('Supabase client not initialized. Check .env');
        return res.status(500).json({ message: 'Cloud storage service unavailable. Contact admin.' });
    }

    // 1. Upload to Supabase Storage
    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${fileExt}`;
    const filePath = `payments/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('aea_kec')
        .upload(filePath, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: false
        });

    if (uploadError) {
        console.error('--- SUPABASE UPLOAD FAILED ---');
        console.error('Error Details:', JSON.stringify(uploadError, null, 2));
        console.error('Bucket: aea_kec, Path:', filePath);
        return res.status(500).json({ message: `Storage Error: ${uploadError.message || 'Failed to upload'}` });
    }

    const { data: { publicUrl } } = supabase.storage
        .from('aea_kec')
        .getPublicUrl(filePath);

    // 2. Perform OCR
    const ocrData = await performOCR(req.file.buffer);

    // 3. Create Verification Record
    const verification = await PaymentVerification.create({
        participantName,
        eventId,
        screenshotUrl: publicUrl,
        screenshotPath: filePath,
        transactionId: ocrData?.transactionId || '',
        amount: ocrData?.amount || 0,
        upiId: ocrData?.upiId || '',
        registrationData: parsedRegData,
        status: 'PENDING'
    });

    res.status(201).json(verification);
}));

// @desc Get pending verifications
router.get('/verify/pending', protect, asyncHandler(async (req, res) => {
    const verifications = await PaymentVerification.find({ status: 'PENDING' }).populate('eventId', 'name');
    res.json(verifications);
}));

// @desc Approve Payment Verification
router.post('/verify/approve/:id', protect, asyncHandler(async (req, res) => {
    const { transactionId, amount } = req.body;
    const verification = await PaymentVerification.findById(req.params.id);
    if (!verification) {
        res.status(404);
        throw new Error('Verification record not found');
    }

    const { registrationData, eventId } = verification;
    const event = await Event.findById(eventId);

    // 1. Generate Verification Code (Ticket ID)
    let verificationCode;
    let isUnique = false;
    while (!isUnique) {
        verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const existing = await Participant.findOne({ verificationCode });
        if (!existing) isUnique = true;
    }

    // 2. Create Participant
    const participant = await Participant.create({
        ...registrationData,
        events: [eventId],
        verificationCode,
        isVerified: true,
        status: 'verified',
        whatsappLink: event.whatsappLink,
        transactionId: transactionId || verification.transactionId || `MANUAL_${Date.now()}`,
        paymentScreenshot: {
            url: verification.screenshotUrl,
            publicId: verification.screenshotPath
        }
    });

    // 3. Send Email
    const emailPayload = {
        emails: participant.members.filter(m => m.email).map(m => m.email),
        eventName: event.name,
        teamName: participant.teamName || 'Individual',
        collegeName: participant.collegeName,
        verificationCode,
        ticketId: verificationCode
    };
    sendMail(emailPayload).catch(err => console.error('Email Failed:', err));

    // 4. Update Verification Status
    verification.status = 'VERIFIED';
    await verification.save();

    // 5. Delete from Supabase Storage (Optional cleanup)
    if (supabase) {
        const { error: deleteError } = await supabase.storage
            .from('aea_kec')
            .remove([verification.screenshotPath]);

        if (deleteError) console.error('Failed to delete approved screenshot:', deleteError);
    }

    res.json({ message: 'Payment verified and registration completed', participant });
}));

// @desc Reject Payment Verification
router.post('/verify/reject/:id', protect, asyncHandler(async (req, res) => {
    const verification = await PaymentVerification.findById(req.params.id);
    if (!verification) {
        res.status(404);
        throw new Error('Verification record not found');
    }

    verification.status = 'REJECTED';
    await verification.save();

    // Notify participant logic could go here (e.g. email)
    // For now just return success
    res.json({ message: 'Payment rejected' });
}));

// @desc Get verification status
router.get('/verify/status/:id', asyncHandler(async (req, res) => {
    const verification = await PaymentVerification.findById(req.params.id).populate('eventId', 'whatsappLink name');
    if (!verification) {
        res.status(404);
        throw new Error('Verification record not found');
    }

    res.json({
        status: verification.status,
        verificationCode: verification.registrationData?.verificationCode,
        whatsappLink: verification.status === 'VERIFIED' ? verification.eventId?.whatsappLink : null,
        eventName: verification.eventId?.name
    });
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

    let { teamName, members, college, collegeName, transactionId, eventIds, collegeId, selectedSubEvents } = req.body;

    // Parse items if they come as strings
    if (typeof members === 'string') members = JSON.parse(members);
    if (typeof eventIds === 'string') eventIds = JSON.parse(eventIds);
    if (typeof selectedSubEvents === 'string') selectedSubEvents = JSON.parse(selectedSubEvents);

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
        verificationCode,
        selectedSubEvents: selectedSubEvents || []
    });

    // Send Confirmation Emails (Background Process)
    const emailPayload = {
        emails: members.filter(m => m.email).map(m => m.email),
        eventName: events.map(e => e.name).join(' & '),
        teamName: teamName || 'Individual',
        collegeName: collegeName,
        verificationCode,
        ticketId: verificationCode // Alias for better transparency in AppScript
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
        const currentEventSubEvents = reg.selectedSubEvents?.find(se => se.eventId.toString() === event._id.toString());
        const subEventString = currentEventSubEvents?.subEventTitles?.join(', ') || 'N/A';

        reg.members.forEach((member) => {
            data.push({
                'S.No': counter++,
                'Verification ID': reg.verificationCode || 'N/A',
                'Event Name': event.name,
                'Selected Sub-Events': subEventString,
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


module.exports = router;
