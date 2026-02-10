import React, { useState, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const RegistrationForm = () => {
    const [formData, setFormData] = useState({
        teamName: '',
        members: [{ name: '', email: '', phone: '', rollNumber: '', department: '', year: '' }],
        college: '',
        collegeName: '',
        transactionId: '',
        eventIds: []
    });
    const [paymentScreenshot, setPaymentScreenshot] = useState(null);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const availableEvents = ['Autoexpo', 'Zhakra', 'Autonix'];

    const handleMemberChange = (index, field, value) => {
        const newMembers = [...formData.members];
        newMembers[index][field] = value;
        setFormData({ ...formData, members: newMembers });
    };

    const handleAddMember = () => {
        setFormData({
            ...formData,
            members: [...formData.members, { name: '', email: '', phone: '', rollNumber: '', department: '', year: '' }]
        });
    };

    const handleRemoveMember = (index) => {
        if (formData.members.length > 1) {
            setFormData({
                ...formData,
                members: formData.members.filter((_, i) => i !== index)
            });
        }
    };

    const handleEventChange = (event) => {
        if (formData.eventIds.includes(event)) {
            setFormData({ ...formData, eventIds: formData.eventIds.filter(e => e !== event) });
        } else {
            setFormData({ ...formData, eventIds: [...formData.eventIds, event] });
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log("File selected:", file.name, file.size);
            setPaymentScreenshot(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            // Validate payment screenshot
            if (!paymentScreenshot) {
                setStatus({ type: 'error', message: 'Payment screenshot is required' });
                setIsSubmitting(false);
                return;
            }

            // Validate at least one event is selected
            if (formData.eventIds.length === 0) {
                setStatus({ type: 'error', message: 'Please select at least one event' });
                setIsSubmitting(false);
                return;
            }

            // Create FormData with file and form fields
            const submitData = new FormData();
            submitData.append('teamName', formData.teamName);
            submitData.append('members', JSON.stringify(formData.members));
            submitData.append('college', formData.college);
            submitData.append('collegeName', formData.collegeName);
            submitData.append('transactionId', formData.transactionId);
            submitData.append('eventIds', JSON.stringify(formData.eventIds));
            submitData.append('paymentScreenshot', paymentScreenshot);

            console.log("Submitting registration with file:", paymentScreenshot.name);

            // Post to backend registration endpoint
            const response = await axios.post('/api/events/register', submitData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log("Registration response:", response.data);
            setStatus({ type: 'success', message: 'Registration Successful! See you there.' });
            setFormData({
                teamName: '',
                members: [{ name: '', email: '', phone: '', rollNumber: '', department: '', year: '' }],
                college: '',
                collegeName: '',
                transactionId: '',
                eventIds: []
            });
            setPaymentScreenshot(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error) {
            console.error("Registration error:", error);
            setStatus({ type: 'error', message: error.response?.data?.message || 'Something went wrong. Try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div id="register" className="py-20 px-4 bg-primary relative">
            <div className="max-w-3xl mx-auto bg-secondary p-8 md:p-12 rounded-3xl shadow-2xl border border-gray-800">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="text-center mb-10"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Register Now</h2>
                    <p className="text-gray-400">Join the revolution. Secure your spot today.</p>
                </motion.div>

                {status.message && (
                    <div className={`p-4 mb-6 rounded-lg text-center ${status.type === 'success' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm">Team Name (optional)</label>
                        <input
                            type="text"
                            value={formData.teamName}
                            onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                            className="w-full bg-primary border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-accent transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 mb-3 text-sm font-bold">Team Members</label>
                        {formData.members.map((member, index) => (
                            <div key={index} className="mb-4 p-4 border border-gray-700 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Full Name *"
                                        value={member.name}
                                        onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                                        required
                                        className="bg-primary border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email *"
                                        value={member.email}
                                        onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                                        required
                                        className="bg-primary border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Phone *"
                                        value={member.phone}
                                        onChange={(e) => handleMemberChange(index, 'phone', e.target.value)}
                                        required
                                        className="bg-primary border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Roll Number"
                                        value={member.rollNumber}
                                        onChange={(e) => handleMemberChange(index, 'rollNumber', e.target.value)}
                                        className="bg-primary border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Department"
                                        value={member.department}
                                        onChange={(e) => handleMemberChange(index, 'department', e.target.value)}
                                        className="bg-primary border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
                                    />
                                    <select
                                        value={member.year}
                                        onChange={(e) => handleMemberChange(index, 'year', e.target.value)}
                                        className="bg-primary border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-accent transition-colors"
                                    >
                                        <option value="">Select Year</option>
                                        <option value="1">1st Year</option>
                                        <option value="2">2nd Year</option>
                                        <option value="3">3rd Year</option>
                                        <option value="4">4th Year</option>
                                    </select>
                                </div>
                                {formData.members.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveMember(index)}
                                        className="mt-3 text-red-400 hover:text-red-300 text-sm"
                                    >
                                        Remove Member
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={handleAddMember}
                            className="mt-2 text-accent hover:text-orange-400 text-sm font-semibold"
                        >
                            + Add Another Member
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm">College Name</label>
                            <input
                                type="text"
                                value={formData.collegeName}
                                onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                                required
                                className="w-full bg-primary border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-accent transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm">College Type (if applicable)</label>
                            <input
                                type="text"
                                value={formData.college}
                                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                                className="w-full bg-primary border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-accent transition-colors"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm">Transaction ID</label>
                            <input
                                type="text"
                                value={formData.transactionId}
                                onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                                placeholder="e.g., UPI/Bank transfer ID"
                                className="w-full bg-primary border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm">Payment Screenshot *</label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                required
                                className="w-full bg-primary border border-gray-700 rounded-lg p-3 text-gray-400 focus:outline-none focus:border-accent transition-colors file:bg-accent file:text-white file:px-3 file:py-2 file:border-none file:rounded file:cursor-pointer"
                            />
                            {paymentScreenshot && (
                                <p className="text-green-400 text-sm mt-2">✓ {paymentScreenshot.name}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-400 mb-3 text-sm font-bold">Select Events *</label>
                        <div className="flex flex-wrap gap-3">
                            {availableEvents.map(event => (
                                <button
                                    key={event}
                                    type="button"
                                    onClick={() => handleEventChange(event)}
                                    className={`px-4 py-2 rounded-full border font-semibold transition-all ${formData.eventIds.includes(event) ? 'bg-accent border-accent text-white' : 'border-gray-600 text-gray-400 hover:border-gray-400'}`}
                                >
                                    {event}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !paymentScreenshot || formData.eventIds.length === 0}
                        className="w-full bg-gradient-to-r from-accent to-red-600 text-white font-bold py-4 rounded-lg hover:shadow-lg hover:shadow-accent/40 transition-all transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Registering...' : 'Complete Registration'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegistrationForm;
