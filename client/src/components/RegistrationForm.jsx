import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const RegistrationForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        college: '',
        department: '',
        year: '',
        events: []
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const availableEvents = ['Autoexpo', 'Zhakra', 'Autonix'];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEventChange = (event) => {
        if (formData.events.includes(event)) {
            setFormData({ ...formData, events: formData.events.filter(e => e !== event) });
        } else {
            setFormData({ ...formData, events: [...formData.events, event] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            // Using /api/register which is proxied or direct
            const response = await axios.post('/api/register', formData);
            setStatus({ type: 'success', message: 'Registration Successful! See you there.' });
            setFormData({
                name: '', email: '', phone: '', college: '', department: '', year: '', events: []
            });
        } catch (error) {
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm">Full Name</label>
                            <input
                                type="text" name="name" value={formData.name} onChange={handleChange} required
                                className="w-full bg-primary border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-accent transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm">Email Address</label>
                            <input
                                type="email" name="email" value={formData.email} onChange={handleChange} required
                                className="w-full bg-primary border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-accent transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm">Phone Number</label>
                            <input
                                type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                                className="w-full bg-primary border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-accent transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm">Year of Study</label>
                            <select
                                name="year" value={formData.year} onChange={handleChange} required
                                className="w-full bg-primary border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-accent transition-colors"
                            >
                                <option value="">Select Year</option>
                                <option value="1">1st Year</option>
                                <option value="2">2nd Year</option>
                                <option value="3">3rd Year</option>
                                <option value="4">4th Year</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm">College Name</label>
                            <input
                                type="text" name="college" value={formData.college} onChange={handleChange} required
                                className="w-full bg-primary border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-accent transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm">Department</label>
                            <input
                                type="text" name="department" value={formData.department} onChange={handleChange} required
                                className="w-full bg-primary border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-accent transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-400 mb-3 text-sm">Select Events</label>
                        <div className="flex flex-wrap gap-4">
                            {availableEvents.map(event => (
                                <button
                                    key={event}
                                    type="button"
                                    onClick={() => handleEventChange(event)}
                                    className={`px-4 py-2 rounded-full border transition-all ${formData.events.includes(event) ? 'bg-accent border-accent text-white' : 'border-gray-600 text-gray-400 hover:border-gray-400'}`}
                                >
                                    {event}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
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
