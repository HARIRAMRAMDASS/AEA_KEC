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
            query.events = eventId;
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
            { header: 'Name', key: 'name', width: 25 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Phone', key: 'phone', width: 15 },
            { header: 'College Name', key: 'college', width: 30 },
            { header: 'Department', key: 'department', width: 20 },
            { header: 'Event Name', key: 'event_name', width: 30 },
            { header: 'Transaction ID', key: 'transaction_id', width: 20 },
            { header: 'Ticket ID', key: 'ticket_id', width: 15 },
            { header: 'Registration Date', key: 'registration_date', width: 20 },
        ];

        // Style the header row
        worksheet.getRow(1).font = { bold: true, size: 12 };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }
        };

        let counter = 1;
        participants.forEach(participant => {
            // Safe event name assignment as requested
            const eventName = participant.eventName ||
                participant.eventId?.name ||
                (participant.events && participant.events[0]?.name) ||
                "N/A";

            // Iterate over team members
            participant.members.forEach(member => {
                worksheet.addRow({
                    s_no: counter++,
                    name: member.name || 'N/A',
                    email: member.email || 'N/A',
                    phone: member.phone || 'N/A',
                    college: participant.collegeName || 'N/A',
                    department: member.department || 'N/A',
                    event_name: eventName,
                    transaction_id: participant.transactionId || 'N/A',
                    ticket_id: participant.verificationCode || 'N/A',
                    registration_date: participant.createdAt ? new Date(participant.createdAt).toLocaleString('en-IN') : 'N/A'
                });
            });
        });

        // Loop over all columns to ensure content fits (optional nice-to-have)
        worksheet.columns.forEach(column => {
            // Simple loop to set minimal width if needed, but defined widths are usually safer
        });

        // Set Headers for Download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        const fileName = eventId && participants[0].events[0] ?
            `participants_${participants[0].events[0].name.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx` :
            'participants.xlsx';

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
