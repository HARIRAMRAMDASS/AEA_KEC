import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { isMobileDevice, triggerUPIPayment } from '../utils/paymentUtils';

const Registration = () => {
    const API_URL = '/api';

    const location = useLocation();
    const eventIdFromUrl = new URLSearchParams(location.search).get('eventId');

    const [events, setEvents] = useState([]); // This will store only the main event if eventId exists
    const [selectedEventIds, setSelectedEventIds] = useState(eventIdFromUrl ? [eventIdFromUrl] : []);
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
    const [selectedSubEvents, setSelectedSubEvents] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);

    // Payment Verification States
    const [verificationId, setVerificationId] = useState(null);
    const [verificationStatus, setVerificationStatus] = useState('IDLE'); // IDLE, PENDING, VERIFIED, REJECTED
    const [ocrData, setOcrData] = useState(null);
    const [whatsappLink, setWhatsappLink] = useState(null);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [showDesktopWarning, setShowDesktopWarning] = useState(false);

    // Search Logic States
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestedColleges, setSuggestedColleges] = useState([]);
    const [showColleges, setShowColleges] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [cursor, setCursor] = useState(-1);
    const searchRef = useRef(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                if (eventIdFromUrl) {
                    const { data } = await axios.get(`${API_URL}/events/${eventIdFromUrl}`);
                    console.log("DEBUG: Event from URL:", data);
                    if (data && data._id) {
                        setEvents([data]);
                    } else {
                        toast.error("Event not found");
                        setEvents([]);
                    }
                } else {
                    const { data } = await axios.get(`${API_URL}/events`);
                    console.log("DEBUG: All Events fetched:", data);
                    setEvents(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                toast.error("Failed to load event data");
            } finally {
                setPageLoading(false);
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

    // Polling for verification status
    useEffect(() => {
        let interval;
        if (verificationStatus === 'PENDING' && verificationId) {
            interval = setInterval(async () => {
                try {
                    const { data } = await axios.get(`${API_URL}/events/verify/status/${verificationId}`);
                    if (data.status === 'VERIFIED') {
                        setVerificationStatus('VERIFIED');
                        setWhatsappLink(data.whatsappLink);
                        clearInterval(interval);
                        toast.success("Payment Verified! Registration Complete.");
                    } else if (data.status === 'REJECTED') {
                        setVerificationStatus('REJECTED');
                        clearInterval(interval);
                        toast.error("Payment rejected. Please check details and re-upload.");
                    }
                } catch (err) {
                    console.error("Polling error", err);
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [verificationStatus, verificationId]);

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

    const selectedEventsData = events.filter(ev => ev && ev._id && selectedEventIds.includes(ev._id));
    const maxTeamSize = selectedEventsData.length > 0 ? Math.max(...selectedEventsData.map(e => e.teamSize)) : 0;
    const maxAllowed = events.length > 0 && !eventIdFromUrl ? events[0].maxSelectableEvents : 1;

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
            setSelectedEventIds([]);
        } else {
            // SINGLE SELECTION ONLY
            setSelectedEventIds([eventId]);
        }
    };

    const handleMemberChange = (index, field, value) => {
        const updatedMembers = [...formData.members];
        updatedMembers[index][field] = value;
        setFormData({ ...formData, members: updatedMembers });
    };

    const handleSubEventToggle = (eventId, subTitle, max) => {
        setSelectedSubEvents(prev => {
            const existing = prev.find(s => s.eventId === eventId);
            if (!existing) {
                return [...prev, { eventId, subEventTitles: [subTitle] }];
            }

            const currentTitles = existing.subEventTitles;
            if (currentTitles.includes(subTitle)) {
                return prev.map(s => s.eventId === eventId ? { ...s, subEventTitles: currentTitles.filter(t => t !== subTitle) } : s);
            } else {
                if (max > 0 && currentTitles.length >= max) {
                    toast.warning(`You can only select up to ${max} sub-events for this event.`);
                    return prev;
                }
                return prev.map(s => s.eventId === eventId ? { ...s, subEventTitles: [...currentTitles, subTitle] } : s);
            }
        });
    };

    const handleUploadScreenshot = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setScreenshot(file);

        // Basic Client Validations
        if (selectedEventIds.length === 0) return toast.error("Please select an event first");
        if (!formData.collegeName) return toast.error("College name is required");
        const m1 = formData.members[0];
        if (!m1?.name || !m1?.email || !m1?.phone) return toast.error("Lead member details mandatory!");

        setLoading(true);
        const submitData = new FormData();
        submitData.append('participantName', m1.name);
        submitData.append('eventId', selectedEventIds[0]);
        submitData.append('paymentScreenshot', file);

        const regData = {
            ...formData,
            events: selectedEventIds,
            members: formData.members.filter(m => m.name),
            selectedSubEvents
        };
        submitData.append('registrationData', JSON.stringify(regData));

        try {
            const { data } = await axios.post(`${API_URL}/events/verify/upload`, submitData);
            setVerificationId(data._id);
            setVerificationStatus('PENDING');
            setOcrData({
                transactionId: data.transactionId,
                amount: data.amount,
                upiId: data.upiId
            });
            if (data.transactionId) {
                toast.success("Transaction detected! Waiting for admin approval.");
            } else {
                toast.info("Screenshot uploaded. Awaiting manual verification.");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Upload failed");
            setScreenshot(null);
            setVerificationStatus('IDLE'); // Reset status on upload failure
        } finally {
            setLoading(false);
        }
    };

    const handleUPIPayment = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!currentEvent) return;

        // Validation before redirect
        if (!currentEvent.upiId || !currentEvent.upiId.includes('@')) {
            return toast.error("Invalid UPI ID configured for this event. Please contact admin.");
        }

        setPaymentLoading(true);

        const success = triggerUPIPayment({
            upiId: currentEvent.upiId,
            name: currentEvent.name,
            amount: currentEvent.feeAmount,
            onDesktop: () => {
                setShowDesktopWarning(true);
                toast.info("Please use a mobile device for direct UPI payment.");
            }
        });

        // Small delay to show loader even on quick redirects
        setTimeout(() => setPaymentLoading(false), 2000);
    };

    if (verificationStatus === 'VERIFIED') {
        return (
            <div style={{ paddingTop: '150px', minHeight: '100vh', background: 'var(--primary-black)', textAlign: 'center', padding: '20px' }}>
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '50px' }}>
                    <div style={{ fontSize: '5rem', color: 'var(--mercedes-green)', marginBottom: '30px' }}>🏁</div>
                    <h1 style={{ color: 'white', fontWeight: 900, marginBottom: '20px' }}>REGISTRATION CONFIRMED</h1>
                    <p style={{ opacity: 0.7, marginBottom: '40px', lineHeight: '1.6' }}>Your payment has been verified. A confirmation email with your Ticket ID has been sent to your crew lead.</p>

                    {whatsappLink && (
                        <div style={{ marginBottom: '40px', padding: '25px', background: 'rgba(0, 161, 155, 0.1)', borderRadius: '20px', border: '1px solid var(--mercedes-green)' }}>
                            <p style={{ fontWeight: 'bold', color: 'var(--mercedes-green)', marginBottom: '15px' }}>✅ VERIFICATION COMPLETED</p>
                            <p style={{ fontSize: '0.9rem', marginBottom: '20px', opacity: 0.8 }}>Join the official event WhatsApp group for latest updates and coordination.</p>
                            <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '15px 30px', background: 'var(--mercedes-green)', color: 'black', textDecoration: 'none', fontWeight: 'bold' }}
                            >
                                JOIN WHATSAPP GROUP
                            </a>
                        </div>
                    )}

                    <button onClick={() => window.location.href = '/'} className="btn-primary" style={{ padding: '15px 40px', background: 'transparent', border: '1px solid white', color: 'white' }}>EXIT TO PADDOCK</button>
                </motion.div>
            </div>
        );
    }

    const currentEvent = events.find(e => e._id === selectedEventIds[0]);
    const isDeadlinePassed = currentEvent && new Date() > new Date(currentEvent.closingDate);

    if (pageLoading) {
        return (
            <div style={{ paddingTop: '200px', textAlign: 'center', color: 'white', minHeight: '100vh', background: 'var(--primary-black)' }}>
                <div className="spinner-small" style={{ margin: '0 auto 20px', width: '40px', height: '40px' }} />
                <p style={{ letterSpacing: '2px', opacity: 0.6 }}>PREPARING THE GRID...</p>
            </div>
        );
    }

    return (
        <div style={{ paddingTop: '120px', paddingBottom: '100px', minHeight: '100vh', background: 'var(--primary-black)' }}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ maxWidth: '900px', margin: '0 auto' }} >
                <h1 style={{ textAlign: 'center', marginBottom: '40px', color: 'var(--mercedes-green)', fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase' }}>Join the Grid</h1>

                <form onSubmit={(e) => e.preventDefault()}>
                    {/* EVENT SELECTION - RADIO STYLE */}
                    <div style={{ marginBottom: '40px' }}>
                        <label className="label-text">CHOOSE YOUR RACE <span style={{ color: 'var(--mercedes-green)' }}>(Select One)</span></label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '15px' }}>
                            {events.filter(ev => ev && ev._id).map(ev => {
                                const passed = new Date() > new Date(ev.closingDate);
                                const selected = selectedEventIds.includes(ev._id);
                                return (
                                    <div key={ev._id} onClick={() => !passed && handleEventToggle(ev._id)} style={{
                                        padding: '20px', borderRadius: '15px', border: `2px solid ${selected ? 'var(--mercedes-green)' : 'rgba(255,255,255,0.05)'}`,
                                        background: selected ? 'rgba(0, 161, 155, 0.1)' : 'rgba(255,255,255,0.02)', cursor: passed ? 'not-allowed' : 'pointer',
                                        transition: '0.3s', opacity: passed ? 0.5 : 1, position: 'relative'
                                    }}>
                                        <div style={{ position: 'absolute', top: '15px', right: '15px', width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--mercedes-green)', background: selected ? 'var(--mercedes-green)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {selected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'black' }} />}
                                        </div>
                                        <h4 className="text-box" style={{ margin: 0, color: selected ? 'var(--mercedes-green)' : 'white' }}>{ev.name}</h4>
                                        <p className="text-box" style={{ margin: '8px 0', fontSize: '0.9rem', opacity: 0.8, color: 'white', lineHeight: '1.4' }}>{ev.description}</p>
                                        <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>{'\u20B9'}{ev.feeAmount}</p>
                                        {passed && <p style={{ color: '#ff4d4d', fontSize: '0.7rem', marginTop: '10px', fontWeight: 'bold' }}>CLOSED</p>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {selectedEventIds.length > 0 && currentEvent && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            {/* COLLEGE SEARCH */}
                            <div style={{ gridColumn: '1 / -1', position: 'relative', marginBottom: '30px' }} ref={searchRef}>
                                <label style={labelStyle}>College Name *</label>
                                <input
                                    required
                                    type="text"
                                    style={inputStyle}
                                    placeholder="Type to search..."
                                    value={searchTerm}
                                    onFocus={() => setShowColleges(true)}
                                    onKeyDown={handleKeyDown}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setFormData({ ...formData, collegeName: e.target.value, collegeId: '' });
                                        setShowColleges(true);
                                    }}
                                />
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
                                                        <div className="text-box" style={{ fontWeight: 'bold', color: 'white' }}>{college.name}</div>
                                                        <div className="text-box" style={{ fontSize: '0.75rem', opacity: 0.6 }}>{college.district} | {college.type}</div>
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

                            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '40px 0' }} />

                            <h3 style={{ marginBottom: '30px', color: 'var(--mercedes-green)', letterSpacing: '2px' }}>{maxTeamSize > 1 ? 'CREW DETAILS' : 'PARTICIPANT DETAILS'}</h3>
                            {currentEvent && formData.members.length > 0 && formData.members.slice(0, currentEvent.teamSize).map((member, index) => (
                                <div key={index} style={{ marginBottom: '30px', padding: '25px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h4 style={{ marginBottom: '20px', fontSize: '0.9rem', opacity: 0.8, textTransform: 'uppercase' }}>
                                        {maxTeamSize > 1 ? `Member ${index + 1}` : 'Participant Details'} {index === 0 && maxTeamSize > 1 ? <span style={{ color: 'var(--mercedes-green)' }}>— Lead Driver</span> : ''}
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

                            {/* SUB-EVENTS CHECKBOXES - MOVED BELOW CREW DETAILS */}
                            <AnimatePresence>
                                {currentEvent.subEvents && currentEvent.subEvents.length > 0 && (
                                    <motion.div
                                        key={`sub-${currentEvent._id}`}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        style={{ marginBottom: '40px', padding: '25px', background: 'rgba(0, 161, 155, 0.05)', borderRadius: '20px', border: '1px solid var(--mercedes-green)' }}
                                    >
                                        <label className="label-text" style={{ fontSize: '1rem', color: 'white', borderLeft: '4px solid var(--mercedes-green)', paddingLeft: '15px', marginBottom: '20px' }}>
                                            SELECT SUB-EVENTS FOR {currentEvent.name.toUpperCase()}
                                            {currentEvent.maxSelectableEvents > 0 && <span style={{ color: 'var(--mercedes-green)', marginLeft: '10px' }}> (Maximum {currentEvent.maxSelectableEvents} Selections)</span>}
                                        </label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
                                            {currentEvent.subEvents.map((sub, idx) => {
                                                const currentSelections = selectedSubEvents.find(s => s.eventId === currentEvent._id)?.subEventTitles || [];
                                                const isChecked = currentSelections.includes(sub.title);
                                                const isMaxReached = currentEvent.maxSelectableEvents > 0 && currentSelections.length >= currentEvent.maxSelectableEvents && !isChecked;

                                                return (
                                                    <div
                                                        key={idx}
                                                        onClick={() => !isMaxReached && handleSubEventToggle(currentEvent._id, sub.title, currentEvent.maxSelectableEvents)}
                                                        style={{
                                                            padding: '20px',
                                                            borderRadius: '12px',
                                                            background: isChecked ? 'rgba(0, 161, 155, 0.15)' : 'rgba(255,255,255,0.02)',
                                                            border: `1px solid ${isChecked ? 'var(--mercedes-green)' : 'rgba(255,255,255,0.1)'}`,
                                                            transition: '0.2s',
                                                            cursor: isMaxReached ? 'not-allowed' : 'pointer',
                                                            opacity: isMaxReached ? 0.3 : 1,
                                                            display: 'flex',
                                                            alignItems: 'flex-start',
                                                            gap: '15px'
                                                        }}
                                                    >
                                                        <div style={{
                                                            marginTop: '3px',
                                                            minWidth: '22px',
                                                            height: '22px',
                                                            border: '2px solid var(--mercedes-green)',
                                                            borderRadius: currentEvent.maxSelectableEvents === 1 ? '50%' : '4px', // Circle if max 1 (radio feel)
                                                            background: isChecked ? 'var(--mercedes-green)' : 'transparent',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}>
                                                            {isChecked && <span style={{ color: 'black', fontSize: '12px', fontWeight: 'bold' }}>✓</span>}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <p className="text-box" style={{ margin: 0, fontSize: '1.1rem', color: isChecked ? 'var(--mercedes-green)' : 'white', fontWeight: isChecked ? '700' : '500' }}>{sub.title}</p>
                                                            {sub.description && <p className="text-box" style={{ margin: '5px 0 0', fontSize: '0.85rem', opacity: 0.6, color: '#ccc' }}>{sub.description}</p>}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* PAYMENT SECTION */}
                            <div style={{ background: '#FFFFFF', padding: '40px', borderRadius: '25px', color: '#000', textAlign: 'center', marginTop: '50px' }}>
                                <h2 style={{ marginBottom: '10px', fontWeight: 900 }}>FINISH LINE: PAYMENT</h2>
                                <p style={{ opacity: 0.6, marginBottom: '30px' }}>Pay via any UPI app (GPay/PhonePe/Paytm)</p>

                                <div style={{ background: '#f0f0f0', padding: '30px', borderRadius: '20px', marginBottom: '30px' }}>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 10px' }}>Pay ₹{currentEvent.feeAmount}</p>
                                    <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>to UPI ID: <span style={{ fontWeight: 'bold', color: 'var(--mercedes-green)' }}>{currentEvent.upiId}</span></p>

                                    <button
                                        type="button"
                                        onClick={(e) => handleUPIPayment(e)}
                                        className="btn-primary"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '10px',
                                            marginTop: '20px',
                                            width: '100%',
                                            padding: '18px 30px',
                                            background: '#000',
                                            color: 'white',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                        disabled={paymentLoading}
                                    >
                                        {paymentLoading ? (
                                            <>
                                                <div className="spinner-small" style={{ borderTopColor: 'white' }} />
                                                <span>REDIRECTING TO UPI...</span>
                                            </>
                                        ) : (
                                            <>
                                                <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo.png" alt="UPI" style={{ height: '20px', filter: 'brightness(0) invert(1)' }} />
                                                <span>PAY ₹{currentEvent.feeAmount} NOW</span>
                                            </>
                                        )}
                                    </button>

                                    {showDesktopWarning && !isMobileDevice() && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            style={{
                                                marginTop: '20px',
                                                padding: '15px',
                                                background: 'rgba(255, 165, 0, 0.1)',
                                                border: '1px solid orange',
                                                borderRadius: '12px',
                                                color: '#856404',
                                                fontSize: '0.9rem',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            ⚠️ Please open this page on a mobile device to complete payment directly via UPI apps.
                                        </motion.div>
                                    )}
                                </div>

                                <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'left' }}>
                                    <label style={{ ...labelStyle, color: '#333' }}>UPLOAD PAYMENT SCREENSHOT *</label>
                                    <input
                                        disabled={verificationStatus === 'PENDING'}
                                        type="file"
                                        accept="image/*"
                                        style={paymentInputStyle}
                                        onChange={handleUploadScreenshot}
                                    />

                                    {loading && <div style={{ textAlign: 'center', marginTop: '20px' }}><div className="spinner-small" style={{ margin: '0 auto' }} /> scanning screenshot...</div>}

                                    {verificationStatus === 'PENDING' && (
                                        <div style={{ marginTop: '20px', padding: '20px', background: 'rgba(0, 161, 155, 0.1)', borderRadius: '15px', border: '1px solid var(--mercedes-green)' }}>
                                            <p style={{ fontWeight: 'bold', color: 'var(--mercedes-green)', margin: '0 0 10px' }}>⌛ VERIFICATION IN PROGRESS</p>
                                            {ocrData?.transactionId && <p style={{ fontSize: '0.85rem', margin: '5px 0' }}>Captured TX ID: <b>{ocrData.transactionId}</b></p>}
                                            <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Please stay on this page. Admin is verifying your payment. This usually takes 1-3 minutes.</p>
                                        </div>
                                    )}

                                    {verificationStatus === 'REJECTED' && (
                                        <div style={{ marginTop: '20px', padding: '20px', background: 'rgba(255, 77, 77, 0.1)', borderRadius: '15px', border: '1px solid #ff4d4d' }}>
                                            <p style={{ fontWeight: 'bold', color: '#ff4d4d', margin: 0 }}>❌ PAYMENT REJECTED</p>
                                            <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Details didn't match. Please re-upload a clear screenshot.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                disabled={true} // ALWAYS DISABLED - Admin approval completes the registration
                                className="btn-primary"
                                style={{ width: '100%', marginTop: '30px', padding: '25px', opacity: 0.3, cursor: 'not-allowed' }}
                            >
                                {verificationStatus === 'PENDING' ? 'VERIFYING...' : 'COMPLETE REGISTRATION'}
                            </button>
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
