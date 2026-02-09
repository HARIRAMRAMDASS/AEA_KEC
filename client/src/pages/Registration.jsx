import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';

const Registration = () => {
    const [events, setEvents] = useState([]);
    const [selectedEventIds, setSelectedEventIds] = useState([]);
    const [formData, setFormData] = useState({
        teamName: '',
        members: [],
        college: 'Engineering',
        collegeName: '',
        collegeId: '',
        transactionId: ''
    });
    const [screenshot, setScreenshot] = useState(null);
    const [loading, setLoading] = useState(false);

    // Search Logic States
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestedColleges, setSuggestedColleges] = useState([]);
    const [showColleges, setShowColleges] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [cursor, setCursor] = useState(-1);
    const searchRef = useRef(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { data: eventData } = await axios.get(`${API_URL}/events`);
                const globalMode = eventData.find(e => e.selectionMode)?.selectionMode || 'Both';
                const filtered = eventData.filter(ev => {
                    if (globalMode === 'Both') return true;
                    if (globalMode === 'Only Zhakra') return ev.eventGroup === 'Zhakra';
                    if (globalMode === 'Only Auto Expo') return ev.eventGroup === 'Auto Expo';
                    return true;
                });
                setEvents(filtered);
            } catch (err) {
                toast.error("Failed to load events");
            }
        };
        fetchEvents();

        // Click outside to close search
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowColleges(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounced Search Implementation
    useEffect(() => {
        const fetchColleges = async () => {
            if (searchTerm.length < 2) {
                setSuggestedColleges([]);
                return;
            }
            // If the searchTerm matches exactly a selected college, don't search
            if (formData.collegeName === searchTerm && formData.collegeId) return;

            setIsSearching(true);
            try {
                const { data } = await axios.get(`${API_URL}/colleges/search`, {
                    params: { q: searchTerm }
                });
                setSuggestedColleges(data);
                setCursor(-1);
            } catch (err) {
                console.error("Search failed", err);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(fetchColleges, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleKeyDown = (e) => {
        if (e.key === "ArrowDown" && cursor < suggestedColleges.length) {
            setCursor(prev => prev + 1);
        } else if (e.key === "ArrowUp" && cursor > 0) {
            setCursor(prev => prev - 1);
        } else if (e.key === "Enter" && cursor >= 0) {
            e.preventDefault();
            if (cursor === suggestedColleges.length) {
                handleSelectOther();
            } else {
                handleCollegeSelect(suggestedColleges[cursor]);
            }
        }
    };

    const handleCollegeSelect = (college) => {
        setFormData({ ...formData, collegeName: college.name, collegeId: college._id, college: college.type });
        setSearchTerm(college.name);
        setShowColleges(false);
    };

    const handleSelectOther = () => {
        setFormData({ ...formData, collegeName: searchTerm, collegeId: null });
        setShowColleges(false);
    };

    const selectedEventsData = events.filter(ev => selectedEventIds.includes(ev._id));
    const maxTeamSize = selectedEventsData.length > 0 ? Math.max(...selectedEventsData.map(e => e.teamSize)) : 0;
    const maxAllowed = events.length > 0 ? events[0].maxSelectableEvents : 5;

    useEffect(() => {
        if (maxTeamSize > 0) {
            setFormData(prev => ({
                ...prev,
                members: Array.from({ length: maxTeamSize }, (_, i) => prev.members[i] || { name: '', rollNumber: '', phone: '', email: '', department: '' })
            }));
        }
    }, [maxTeamSize]);

    const handleEventToggle = (eventId) => {
        const isSelected = selectedEventIds.includes(eventId);
        if (isSelected) {
            setSelectedEventIds(selectedEventIds.filter(id => id !== eventId));
        } else {
            if (selectedEventIds.length < maxAllowed) {
                setSelectedEventIds([...selectedEventIds, eventId]);
            } else {
                toast.warning(`Max ${maxAllowed} events allowed.`);
            }
        }
    };

    const handleMemberChange = (index, field, value) => {
        const updatedMembers = [...formData.members];
        updatedMembers[index][field] = value;
        setFormData({ ...formData, members: updatedMembers });
    };

    const isDeadlinePassed = selectedEventsData.some(ev => new Date() > new Date(ev.closingDate));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedEventIds.length === 0) return toast.error("Please select an event");
        if (!screenshot) return toast.error("Payment proof required");
        if (!formData.collegeName) return toast.error("College name is required");

        const m1 = formData.members[0];
        if (!m1.name || !m1.email || !m1.phone) return toast.error("Lead member details mandatory!");

        setLoading(true);
        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'members' || key === 'collegeId') return; // Skip these for manual append
            submitData.append(key, formData[key] || '');
        });

        // Only append collegeId if it exists as a valid string
        if (formData.collegeId) {
            submitData.append('collegeId', formData.collegeId);
        }

        submitData.append('eventIds', JSON.stringify(selectedEventIds));
        submitData.append('members', JSON.stringify(formData.members.filter(m => m.name)));
        submitData.append('paymentScreenshot', screenshot);

        try {
            await axios.post(`${API_URL}/events/register`, submitData);
            toast.success("Registration Successful! Check Email.");
            setSelectedEventIds([]);
            setFormData({ teamName: '', members: [], college: 'Engineering', collegeName: '', transactionId: '', collegeId: '' });
            setScreenshot(null);
            setSearchTerm('');
        } catch (err) {
            console.error("Registration Error Details:", err.response?.data);
            toast.error(err.response?.data?.message || "Registration failed. Please check your network or try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ paddingTop: '120px', paddingBottom: '100px', minHeight: '100vh', background: 'var(--primary-black)' }}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ maxWidth: '900px', margin: '0 auto' }} >
                <h1 style={{ textAlign: 'center', marginBottom: '40px', color: 'var(--mercedes-green)', fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase' }}>Join the Grid</h1>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '40px' }}>
                        <label className="label-text">CHOOSE YOUR RACE <span style={{ color: 'var(--mercedes-green)' }}>(Max {maxAllowed})</span></label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '15px' }}>
                            {events.map(ev => {
                                const passed = new Date() > new Date(ev.closingDate);
                                const selected = selectedEventIds.includes(ev._id);
                                return (
                                    <div key={ev._id} onClick={() => !passed && handleEventToggle(ev._id)} style={{
                                        padding: '20px', borderRadius: '15px', border: `2px solid ${selected ? 'var(--mercedes-green)' : 'rgba(255,255,255,0.05)'}`,
                                        background: selected ? 'rgba(0, 161, 155, 0.1)' : 'rgba(255,255,255,0.02)', cursor: passed ? 'not-allowed' : 'pointer',
                                        transition: '0.3s', opacity: passed ? 0.5 : 1, position: 'relative'
                                    }}>
                                        <div style={{ position: 'absolute', top: '15px', right: '15px', width: '12px', height: '12px', borderRadius: '50%', border: '2px solid var(--mercedes-green)', background: selected ? 'var(--mercedes-green)' : 'transparent' }} />
                                        <h4 style={{ margin: 0, color: selected ? 'var(--mercedes-green)' : 'white' }}>{ev.name}</h4>
                                        <p style={{ margin: '8px 0', fontSize: '0.8rem', opacity: 0.6 }}>{ev.eventGroup} | {ev.type}</p>
                                        <p style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>{'\u20B9'}{ev.feeAmount}</p>
                                        {passed && <p style={{ color: '#ff4d4d', fontSize: '0.7rem', marginTop: '10px', fontWeight: 'bold' }}>CLOSED</p>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {selectedEventIds.length > 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', marginBottom: '30px' }}>
                                <div>
                                    <label style={labelStyle}>Team Name (Optional)</label>
                                    <input type="text" style={inputStyle} value={formData.teamName} onChange={(e) => setFormData({ ...formData, teamName: e.target.value })} />
                                </div>

                                <div style={{ gridColumn: '1 / -1', position: 'relative' }} ref={searchRef}>
                                    <label style={labelStyle}>College Name (Search Tamil Nadu Database) *</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            required
                                            type="text"
                                            style={{ ...inputStyle, paddingRight: '45px' }}
                                            placeholder="Type to search (e.g. Kongu, PSG, IIT...)"
                                            value={searchTerm}
                                            onFocus={() => setShowColleges(true)}
                                            onKeyDown={handleKeyDown}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                setFormData({ ...formData, collegeName: e.target.value, collegeId: '' });
                                                setShowColleges(true);
                                            }}
                                        />
                                        {isSearching && (
                                            <div style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)' }}>
                                                <div className="spinner-small" />
                                            </div>
                                        )}
                                    </div>

                                    {showColleges && searchTerm.length >= 2 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            style={{
                                                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                                                background: '#121212', border: '1px solid var(--mercedes-green)', borderRadius: '0 0 12px 12px',
                                                maxHeight: '300px', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', marginTop: '5px'
                                            }}
                                        >
                                            {suggestedColleges.length > 0 ? (
                                                <>
                                                    {suggestedColleges.map((college, index) => (
                                                        <div
                                                            key={college._id}
                                                            onClick={() => handleCollegeSelect(college)}
                                                            className={cursor === index ? 'suggestion-active' : ''}
                                                            style={{
                                                                padding: '15px 20px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                                background: cursor === index ? 'rgba(0, 161, 155, 0.2)' : 'transparent', transition: '0.2s'
                                                            }}
                                                            onMouseEnter={() => setCursor(index)}
                                                        >
                                                            <div style={{ fontWeight: 'bold', color: 'white' }}>{college.name}</div>
                                                            <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{college.district} | {college.type}</div>
                                                        </div>
                                                    ))}
                                                    <div
                                                        onClick={handleSelectOther}
                                                        className={cursor === suggestedColleges.length ? 'suggestion-active' : ''}
                                                        style={{
                                                            padding: '15px 20px', cursor: 'pointer', background: cursor === suggestedColleges.length ? 'rgba(0, 161, 155, 0.4)' : 'rgba(255,255,255,0.03)',
                                                            textAlign: 'center', borderTop: '1px solid var(--mercedes-green)'
                                                        }}
                                                        onMouseEnter={() => setCursor(suggestedColleges.length)}
                                                    >
                                                        <span style={{ fontSize: '0.85rem', color: 'var(--mercedes-green)', fontWeight: 'bold' }}>
                                                            Other: Use "{searchTerm}"
                                                        </span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div style={{ padding: '30px 20px', textAlign: 'center' }}>
                                                    {!isSearching && (
                                                        <>
                                                            <p style={{ opacity: 0.5, marginBottom: '15px' }}>No match found in our grid.</p>
                                                            <button
                                                                type="button"
                                                                className="btn-primary"
                                                                style={{ padding: '10px 20px', fontSize: '0.8rem' }}
                                                                onClick={handleSelectOther}
                                                            >
                                                                Use Custom Option
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '40px 0' }} />

                            <h3 style={{ marginBottom: '30px', color: 'var(--mercedes-green)', letterSpacing: '2px' }}>CREW DETAILS</h3>
                            {formData.members.map((member, index) => (
                                <div key={index} style={{ marginBottom: '30px', padding: '25px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h4 style={{ marginBottom: '20px', fontSize: '0.9rem', opacity: 0.8, textTransform: 'uppercase' }}>
                                        Member {index + 1} {index === 0 ? <span style={{ color: 'var(--mercedes-green)' }}>— Lead Driver</span> : ''}
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                                        <input required={index === 0} placeholder="Full Name" style={inputStyle} value={member.name} onChange={(e) => handleMemberChange(index, 'name', e.target.value)} />
                                        <input required={index === 0} placeholder="Roll Number" style={inputStyle} value={member.rollNumber} onChange={(e) => handleMemberChange(index, 'rollNumber', e.target.value)} />
                                        <input required={index === 0} placeholder="Phone Number" style={inputStyle} value={member.phone} onChange={(e) => handleMemberChange(index, 'phone', e.target.value)} />
                                        <input required={index === 0} type="email" placeholder="Email Address" style={inputStyle} value={member.email} onChange={(e) => handleMemberChange(index, 'email', e.target.value)} />
                                        <input required={index === 0} placeholder="Department" style={{ ...inputStyle, gridColumn: '1 / -1' }} value={member.department} onChange={(e) => handleMemberChange(index, 'department', e.target.value)} />
                                    </div>
                                </div>
                            ))}

                            <div style={{ background: '#FFFFFF', padding: '40px', borderRadius: '25px', color: '#000', textAlign: 'center', marginTop: '50px' }}>
                                <h2 style={{ marginBottom: '30px', fontWeight: 900 }}>FINAL CHECKPOINT: PAYMENT</h2>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap', marginBottom: '40px' }}>
                                    {selectedEventsData.map(ev => (
                                        <div key={ev._id} style={{ textAlign: 'center', background: '#F8F8F8', padding: '20px', borderRadius: '15px' }}>
                                            <p style={{ fontSize: '0.8rem', fontWeight: 900, marginBottom: '15px', textTransform: 'uppercase' }}>{ev.name}</p>
                                            <img src={ev.qrCode.url} alt="QR" style={{ width: '180px', height: '180px', borderRadius: '10px' }} />
                                            <p style={{ marginTop: '10px', fontSize: '1.1rem', fontWeight: 900 }}>{'\u20B9'}{ev.feeAmount}</p>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'left' }}>
                                    <label style={{ display: 'block', color: '#333', marginBottom: '10px', fontWeight: 900, fontSize: '0.8rem', textTransform: 'uppercase' }}>Transaction ID (12 Digits) *</label>
                                    <input required type="text" style={paymentInputStyle} placeholder="Enter your UTR / Transaction No." value={formData.transactionId} onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })} />

                                    <label style={{ display: 'block', color: '#333', marginTop: '25px', marginBottom: '10px', fontWeight: 900, fontSize: '0.8rem', textTransform: 'uppercase' }}>Upload Screenshot *</label>
                                    <input required type="file" accept="image/*" onChange={(e) => setScreenshot(e.target.files[0])} style={paymentInputStyle} />
                                </div>
                            </div>

                            <button
                                disabled={loading || isDeadlinePassed}
                                className="btn-primary"
                                style={{ width: '100%', marginTop: '50px', padding: '25px', fontSize: '1.4rem', fontWeight: 900, opacity: isDeadlinePassed ? 0.5 : 1 }}
                            >
                                {loading ? 'SYNCING WITH SATELLITE...' : isDeadlinePassed ? 'RACE CLOSED' : 'CONFIRM ENTRY'}
                            </button>
                            {isDeadlinePassed && <p style={{ color: '#ff4d4d', textAlign: 'center', marginTop: '15px', fontWeight: 'bold' }}>One or more races have already started (Deadline passed).</p>}
                        </motion.div>
                    )}
                </form>
            </motion.div>

            <style>{`
                .label-text { display: block; font-size: 0.8rem; font-weight: 900; letter-spacing: 2px; color: #999; margin-bottom: 10px; }
                .spinner-small { width: 20px; height: 20px; border: 2px solid rgba(0, 161, 155, 0.3); border-top-color: var(--mercedes-green); border-radius: 50%; animation: spin 0.8s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .suggestion-active { background: rgba(0, 161, 155, 0.2) !important; }
            `}</style>
        </div>
    );
};

const inputStyle = {
    width: '100%',
    padding: '18px 20px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '1rem',
    outline: 'none',
    transition: '0.3s'
};

const paymentInputStyle = {
    ...inputStyle,
    background: '#FFFFFF',
    color: '#000',
    border: '2px solid #EEEEEE'
};

const labelStyle = { display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: 900, color: '#AAA', textTransform: 'uppercase', letterSpacing: '1px' };

export default Registration;
