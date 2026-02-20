const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const Participant = require('../models/Participant');
const { protect } = require('../middleware/authMiddleware');
const asyncHandler = require('express-async-handler');

// @desc Export participants to Excel
// @route GET /api/admin/export-excel
// @access Private/Admin
router.get('/export-excel', protect, asyncHandler(async (req, res) => {
    try {
        const { eventId } = req.query;
        console.log(`Exporting Excel for event: ${eventId || 'ALL'}`);

        // Build query
        const query = { isVerified: true }; // ONLY approved participants
        if (eventId) {
            query.$or = [
                { events: eventId },
                { eventId: eventId }
            ];
        }

        const participants = await Participant.find(query)
            .populate('events', 'name')
            .populate('eventId', 'name')
            .sort({ createdAt: -1 });

        // Handle no records
        if (!participants || participants.length === 0) {
            // If streaming, sending JSON error after headers might be tricky if not careful.
            // But we haven't sent headers yet.
            res.status(404);
            throw new Error('No approved participants found for this selection.');
        }

        // Create Workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Participants');

        // Define Columns
        worksheet.columns = [
            { header: 'S.No', key: 's_no', width: 8 },
            { header: 'Registration Date', key: 'registration_date', width: 22 },
            { header: 'Ticket ID', key: 'ticket_id', width: 15 },
            { header: 'Event Name', key: 'event_name', width: 25 },
            { header: 'Selected Sub-Events', key: 'sub_events', width: 35 },
            { header: 'Team Name', key: 'team_name', width: 20 },
            { header: 'Name', key: 'name', width: 25 },
            { header: 'Roll Number', key: 'roll_no', width: 15 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Phone', key: 'phone', width: 15 },
            { header: 'College Type', key: 'college_type', width: 15 },
            { header: 'College Name', key: 'college_name', width: 35 },
            { header: 'Department', key: 'department', width: 20 },
            { header: 'Transaction ID', key: 'transaction_id', width: 20 },
        ];

        // Style the header row
        worksheet.getRow(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF00A19B' } // Mercedes Greenish / Teal
        };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        let counter = 1;
        participants.forEach(participant => {
            // Safe event name assignment
            const eventName = participant.eventName ||
                participant.eventId?.name ||
                (participant.events && participant.events[0]?.name) ||
                "N/A";

            // Improved sub-events extraction
            let subEventsList = 'N/A';
            if (participant.selectedSubEvents && Array.isArray(participant.selectedSubEvents)) {
                // If a specific eventId is requested, filter sub-events for that event
                // Otherwise concatenate all selected sub-events
                const relevantSubEvents = eventId
                    ? participant.selectedSubEvents.filter(s => s.eventId && s.eventId.toString() === eventId.toString())
                    : participant.selectedSubEvents;

                const titles = relevantSubEvents.flatMap(s => s.subEventTitles || []);
                if (titles.length > 0) {
                    subEventsList = titles.join(', ');
                }
            }

            // Iterate over team members
            participant.members.forEach(member => {
                worksheet.addRow({
                    s_no: counter++,
                    registration_date: participant.createdAt ? new Date(participant.createdAt).toLocaleString('en-IN') : 'N/A',
                    ticket_id: participant.verificationCode || 'N/A',
                    event_name: eventName,
                    sub_events: subEventsList,
                    team_name: participant.teamName || 'Individual',
                    name: member.name || 'N/A',
                    roll_no: member.rollNumber || 'N/A',
                    email: member.email || 'N/A',
                    phone: member.phone || 'N/A',
                    college_type: participant.college || 'N/A',
                    college_name: participant.collegeName || 'N/A',
                    department: member.department || 'N/A',
                    transaction_id: participant.transactionId || 'N/A'
                });
            });
        });

        // Loop over all columns to ensure content fits (optional nice-to-have)
        worksheet.columns.forEach(column => {
            // Simple loop to set minimal width if needed, but defined widths are usually safer
        });

        // Set Headers for Download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        const eventNameForFile = eventId && participants[0] ?
            (participants[0].eventName || participants[0].eventId?.name || (participants[0].events && participants[0].events[0]?.name) || "event") :
            "all_participants";

        const fileName = `registrations_${eventNameForFile.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;

        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        // Stream to response
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Excel Export Error:', error);
        // If response already started, we can't send JSON
        if (res.headersSent) {
            res.end();
        } else {
            res.status(500).json({ message: error.message || 'Excel generation failed' });
        }
    }
}));

module.exports = router;
