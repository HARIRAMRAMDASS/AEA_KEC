const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    name: { type: String },
    rollNumber: { type: String },
    phone: { type: String },
    email: { type: String },
    department: { type: String }
});

const participantSchema = new mongoose.Schema({
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true }],
    teamName: { type: String },
    members: [memberSchema],
    college: {
        type: String,
        enum: ['Engineering', 'Polytechnic', 'Arts & Science', 'Medical', 'Dental', 'Pharmacy', 'Agriculture', 'Veterinary', 'Teacher Education', 'Others'],
        required: true
    },
    collegeName: { type: String, required: true },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
    transactionId: { type: String, required: true, unique: true },
    paymentScreenshot: {
        url: { type: String, required: true },
        publicId: { type: String, required: true }
    },
    isVerified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Participant', participantSchema);
