const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rollNumber: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    department: { type: String, required: true }
});

const participantSchema = new mongoose.Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    teamName: { type: String },
    members: [memberSchema],
    college: {
        type: String,
        enum: ['Engineering', 'Polytechnic', 'Arts & Science', 'Medical', 'Others'],
        required: true
    },
    collegeName: { type: String, required: true },
    transactionId: { type: String, required: true, unique: true },
    isVerified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Participant', participantSchema);
