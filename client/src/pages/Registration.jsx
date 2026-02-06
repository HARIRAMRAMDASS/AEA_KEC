import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';

const Registration = () => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [formData, setFormData] = useState({
        teamName: '',
        members: [],
        college: 'Engineering',
        collegeName: '',
        transactionId: ''
    });
    const [loading, setLoading] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        const fetchEvents = async () => {
            const { data } = await axios.get(`${API_URL}/events`);
            setEvents(data);
        };
        fetchEvents();
    }, []);

    const handleEventChange = (e) => {
        const eventId = e.target.value;
        const event = events.find(ev => ev._id === eventId);
        setSelectedEvent(event);

        // Initialize members array based on team size
        const initialMembers = Array.from({ length: event.teamSize }, () => ({
            name: '', rollNumber: '', phone: '', email: '', department: ''
        }));
        setFormData({ ...formData, members: initialMembers });
    };

    const handleMemberChange = (index, field, value) => {
        const updatedMembers = [...formData.members];
        updatedMembers[index][field] = value;
        setFormData({ ...formData, members: updatedMembers });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check for duplicate departments
        const depts = formData.members.map(m => m.department.toLowerCase());
        const hasDuplicateDept = depts.some((dept, index) => depts.indexOf(dept) !== index && dept !== '');

        if (hasDuplicateDept) {
            toast.error("Duplicate departments are not allowed in the same team!");
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_URL}/events/${selectedEvent._id}/register`, formData);
            toast.success("Registration Successful! Check your email.");
            // Reset form
            setFormData({ teamName: '', members: [], college: 'Engineering', collegeName: '', transactionId: '' });
            setSelectedEvent(null);
        } catch (err) {
            toast.error(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ paddingTop: '120px', paddingBottom: '100px', minHeight: '100vh', background: 'var(--primary-black)' }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ maxWidth: '900px', margin: '0 auto' }}
            >
                <h1 style={{ textAlign: 'center', marginBottom: '40px', color: 'var(--mercedes-green)' }}>Join the Grid</h1>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', color: '#ccc' }}>Select Event</label>
                        <select
                            required
                            onChange={handleEventChange}
                            style={inputStyle}
                        >
                            <option value="">-- Select Event --</option>
                            {events.map(ev => (
                                <option key={ev._id} value={ev._id}>
                                    {ev.name} ({ev.type}) - {'\u20B9'}{ev.feeAmount} {ev.feeType}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedEvent && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                                <div>
                                    <label style={labelStyle}>Team Name (Optional)</label>
                                    <input type="text" style={inputStyle} value={formData.teamName} onChange={(e) => setFormData({ ...formData, teamName: e.target.value })} />
                                </div>
                                <div>
                                    <label style={labelStyle}>College Type</label>
                                    <select style={inputStyle} value={formData.college} onChange={(e) => setFormData({ ...formData, college: e.target.value })}>
                                        <option>Engineering</option>
                                        <option>Polytechnic</option>
                                        <option>Arts & Science</option>
                                        <option>Medical</option>
                                        <option>Others</option>
                                    </select>
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={labelStyle}>College Name</label>
                                    <input required type="text" style={inputStyle} value={formData.collegeName} onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })} placeholder="e.g. Kongu Engineering College" />
                                </div>
                            </div>

                            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '40px 0' }} />

                            <h3 style={{ marginBottom: '30px', color: 'var(--mercedes-green)' }}>Crew Details</h3>
                            {formData.members.map((member, index) => (
                                <div key={index} style={{ marginBottom: '40px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                                    <h4 style={{ marginBottom: '20px', fontSize: '1rem', opacity: 0.7 }}>Member {index + 1}</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <input required placeholder="Full Name" style={inputStyle} value={member.name} onChange={(e) => handleMemberChange(index, 'name', e.target.value)} />
                                        <input required placeholder="Roll Number" style={inputStyle} value={member.rollNumber} onChange={(e) => handleMemberChange(index, 'rollNumber', e.target.value)} />
                                        <input required placeholder="Phone Number" style={inputStyle} value={member.phone} onChange={(e) => handleMemberChange(index, 'phone', e.target.value)} />
                                        <input required type="email" placeholder="Email" style={inputStyle} value={member.email} onChange={(e) => handleMemberChange(index, 'email', e.target.value)} />
                                        <input required placeholder="Department" style={{ ...inputStyle, gridColumn: 'span 2' }} value={member.department} onChange={(e) => handleMemberChange(index, 'department', e.target.value)} />
                                    </div>
                                </div>
                            ))}

                            <div style={{ background: 'white', padding: '40px', borderRadius: '20px', color: 'black', textAlign: 'center' }}>
                                <h3 style={{ marginBottom: '20px' }}>Final Step: Payment</h3>
                                <p style={{ marginBottom: '20px' }}>Scan the QR code below to pay <strong>{'\u20B9'}{selectedEvent.feeAmount}</strong></p>
                                <img src={selectedEvent.qrCode.url} alt="Payment QR" style={{ width: '250px', height: '250px', marginBottom: '20px', borderRadius: '10px' }} />
                                <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                                    <label style={{ display: 'block', color: '#555', marginBottom: '10px', fontWeight: 'bold' }}>Transaction ID</label>
                                    <input
                                        required
                                        type="text"
                                        style={{ ...inputStyle, background: '#f5f5f5', color: '#000', border: '2px solid #ddd' }}
                                        placeholder="Enter the 12-digit ID"
                                        value={formData.transactionId}
                                        onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                className="btn-primary"
                                style={{ width: '100%', marginTop: '40px', padding: '20px', fontSize: '1.2rem' }}
                            >
                                {loading ? 'Processing...' : 'Complete Registration'}
                            </button>
                        </motion.div>
                    )}
                </form>
            </motion.div>
        </div>
    );
};

const inputStyle = {
    width: '100%',
    padding: '15px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: 'white',
    fontSize: '1rem',
    outline: 'none',
    transition: '0.3s'
};

const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '0.9rem',
    opacity: 0.7
};

export default Registration;
