import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiCopy, FiCheck, FiAlertTriangle, FiArrowLeft, FiImage, FiCreditCard, FiCheckCircle } from 'react-icons/fi';
import { isMobileDevice } from '../utils/paymentUtils';
import ErrorBoundary from '../components/ErrorBoundary';

const Registration = () => {
    const API_URL = '/api';

    const location = useLocation();
    const eventIdFromUrl = new URLSearchParams(location.search).get('eventId');

    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState(eventIdFromUrl || '');
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [formData, setFormData] = useState({
        teamName: '',
        members: [],
        college: 'Engineering',
        collegeName: '',
        transactionId: ''
    });
    const [screenshot, setScreenshot] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedSubEvents, setSelectedSubEvents] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    // Payment Verification States
    const [verificationId, setVerificationId] = useState(null);
    const [verificationStatus, setVerificationStatus] = useState('IDLE');
    const [ocrData, setOcrData] = useState(null);
    const [whatsappLink, setWhatsappLink] = useState(null);
    const [activeCopy, setActiveCopy] = useState(null);


    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/events`);
                const activeEvents = Array.isArray(data) ? data : [];
                setEvents(activeEvents);

                if (eventIdFromUrl) {
                    const exists = activeEvents.find(e => e._id === eventIdFromUrl);
                    if (exists) {
                        setSelectedEventId(eventIdFromUrl);
                    } else {
                        toast.warning("Selected event not found. Please choose from the list.");
                    }
                }
                setFetchError(null);
            } catch (err) {
                console.error("Fetch Events Error:", err);
                setFetchError("Failed to load events. Please check your connection.");
            } finally {
                setPageLoading(false);
            }
        };

        fetchEvents();

        // Ensure page starts at top
        window.scrollTo(0, 0);
    }, [eventIdFromUrl]);


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
                        toast.success("Payment Verified! Check your email.");
                    } else if (data.status === 'REJECTED') {
                        setVerificationStatus('REJECTED');
                        clearInterval(interval);
                        toast.error("Payment rejected. Check details and re-upload.");
                    }
                } catch (err) {
                    console.error("Polling error", err);
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [verificationStatus, verificationId]);


    const currentEvent = events.find(e => e._id === selectedEventId);
    const isDeadlinePassed = currentEvent && new Date() > new Date(currentEvent.closingDate);
    const maxTeamSize = currentEvent?.teamSize || 0;

    useEffect(() => {
        if (maxTeamSize > 0) {
            setFormData(prev => ({
                ...prev,
                members: Array.from({ length: maxTeamSize }, (_, i) => prev.members[i] || { name: '', rollNumber: '', phone: '', email: '', department: '' })
            }));
        }
    }, [maxTeamSize]);

    const handleEventSelect = (eventId) => {
        setSelectedEventId(eventId);
    };

    const handleMemberChange = (index, field, value) => {
        const updatedMembers = [...formData.members];
        updatedMembers[index][field] = value;
        setFormData({ ...formData, members: updatedMembers });
    };

    const handleSubEventToggle = (eventId, subTitle, max) => {
        if (!eventId) return;
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
                    toast.warning(`Maximum ${max} selections allowed.`);
                    return prev;
                }
                return prev.map(s => s.eventId === eventId ? { ...s, subEventTitles: [...currentTitles, subTitle] } : s);
            }
        });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setScreenshot(e.target.files[0]);
        }
    };

    const handleSubmitRegistration = async () => {
        if (!screenshot) return toast.error("Please upload payment screenshot");

        // Basic Client Validations
        if (!selectedEventId) return toast.error("Select an event first");
        if (!formData.collegeName) return toast.error("College name required");
        const m1 = formData.members[0];
        if (!m1?.name || !m1?.email || !m1?.phone) return toast.error("Lead member details mandatory!");

        setLoading(true);
        toast.info("Submitting registration...", { autoClose: 2000 });

        const submitData = new FormData();
        submitData.append('participantName', m1.name);
        submitData.append('eventId', selectedEventId);
        submitData.append('paymentScreenshot', screenshot);

        const regData = {
            ...formData,
            events: [selectedEventId],
            members: formData.members.filter(m => m.name),
            selectedSubEvents
        };
        submitData.append('registrationData', JSON.stringify(regData));

        try {
            const { data } = await axios.post(`${API_URL}/events/verify/upload`, submitData);
            setVerificationId(data._id);
            setVerificationStatus('PENDING');
            setOcrData({ transactionId: data.transactionId, amount: data.amount, upiId: data.upiId });

            if (data.transactionId) {
                toast.success("Transaction ID detected automatically!");
            } else {
                toast.success("Registration submitted! Processing details...");
            }
        } catch (err) {
            console.error("Upload Error:", err);
            toast.error(err.response?.data?.message || "Submission failed. Please try again.");
            setVerificationStatus('IDLE');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text, type) => {
        navigator.clipboard.writeText(text || '');
        setActiveCopy(type);
        toast.info(`${type} copied!`);
        setTimeout(() => setActiveCopy(null), 2000);
    };

    if (fetchError) {
        return (
            <div style={{ paddingTop: '150px', textAlign: 'center', color: 'white', minHeight: '100vh', background: '#050505' }}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '50px' }}>
                    <FiAlertTriangle size={50} color="#ff4d4d" />
                    <h2 style={{ margin: '20px 0' }}>LINK EXPIRED OR INVALID</h2>
                    <p style={{ opacity: 0.6, marginBottom: '30px' }}>{fetchError}</p>
                    <button onClick={() => window.location.href = '/'} className="btn-primary">BACK TO HOME</button>
                </motion.div>
            </div>
        );
    }

    if (pageLoading) {
        return (
            <div style={{ paddingTop: '200px', textAlign: 'center', color: 'white', minHeight: '100vh', background: '#050505' }}>
                <div className="spinner-small" style={{ margin: '0 auto 20px', width: '40px', height: '40px' }} />
                <p style={{ letterSpacing: '2px', opacity: 0.5 }}>LOADING EVENT GRID...</p>
            </div>
        );
    }

    if (verificationStatus === 'VERIFIED') {
        return (
            <div style={{ paddingTop: '150px', minHeight: '100vh', background: '#050505', textAlign: 'center' }}>
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '50px' }}>
                    <FiCheckCircle size={80} color="var(--mercedes-green)" />
                    <h1 style={{ margin: '30px 0' }}>RACE CONFIRMED!</h1>
                    <p style={{ opacity: 0.7, marginBottom: '40px' }}>Your registration is verified. Welcome to the grid!</p>
                    {whatsappLink && (
                        <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '15px 30px' }}>JOIN WHATSAPP GROUP</a>
                    )}
                </motion.div>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div style={{ paddingTop: '120px', paddingBottom: '100px', minHeight: '100vh', background: '#050505', color: 'white' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '40px' }}>
                        <h1 style={{ textAlign: 'center', marginBottom: '40px', fontWeight: 900, letterSpacing: '2px' }}>EVENT REGISTRATION</h1>

                        {!isConfirmed ? (
                            <div className="animate-fade">
                                <h3 style={{ marginBottom: '25px', color: 'var(--mercedes-green)', fontSize: '1rem', textAlign: 'center' }}>STEP 1: SELECT YOUR EVENT</h3>
                                <div style={{ display: 'grid', gap: '15px', marginBottom: '40px' }}>
                                    {events.map(ev => {
                                        const closed = new Date() > new Date(ev.closingDate);
                                        return (
                                            <div
                                                key={ev._id}
                                                onClick={() => !closed && handleEventSelect(ev._id)}
                                                style={{
                                                    padding: '20px',
                                                    borderRadius: '15px',
                                                    border: `2px solid ${selectedEventId === ev._id ? 'var(--mercedes-green)' : 'rgba(255,255,255,0.05)'}`,
                                                    background: selectedEventId === ev._id ? 'rgba(0, 161, 155, 0.1)' : 'rgba(255,255,255,0.02)',
                                                    cursor: closed ? 'not-allowed' : 'pointer',
                                                    transition: 'all 0.3s ease',
                                                    position: 'relative',
                                                    opacity: closed ? 0.5 : 1
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <h3 style={{ margin: 0, color: selectedEventId === ev._id ? 'var(--mercedes-green)' : 'white' }}>{ev.name}</h3>
                                                        <p style={{ opacity: 0.6, fontSize: '0.8rem', marginTop: '5px' }}>{ev.type} | {ev.feeType}</p>
                                                    </div>
                                                    <div style={{
                                                        width: '24px',
                                                        height: '24px',
                                                        borderRadius: '50%',
                                                        border: `2px solid ${selectedEventId === ev._id ? 'var(--mercedes-green)' : 'rgba(255,255,255,0.2)'}`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        {selectedEventId === ev._id && <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--mercedes-green)' }} />}
                                                    </div>
                                                </div>
                                                {closed && <span style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.7rem', color: '#ff4d4d', fontWeight: 'bold' }}>DEADLINE PASSED</span>}
                                            </div>
                                        );
                                    })}
                                    {events.length === 0 && <p style={{ textAlign: 'center', opacity: 0.5 }}>No active events found.</p>}
                                </div>

                                <button
                                    disabled={!selectedEventId}
                                    onClick={() => {
                                        setIsConfirmed(true);
                                        window.scrollTo(0, 0);
                                    }}
                                    className="btn-primary"
                                    style={{ width: '100%', padding: '18px', fontWeight: 'bold', fontSize: '1rem', opacity: !selectedEventId ? 0.5 : 1 }}
                                >
                                    CONTINUE TO FORM <FiArrowLeft style={{ transform: 'rotate(180deg)', marginLeft: '10px' }} />
                                </button>
                            </div>
                        ) : (
                            <div className="animate-fade">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', padding: '15px', background: 'rgba(0,161,155,0.05)', borderRadius: '12px', border: '1px solid rgba(0,161,155,0.2)' }}>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.5 }}>SELECTED EVENT</p>
                                        <h4 style={{ margin: 0, color: 'var(--mercedes-green)' }}>{currentEvent?.name}</h4>
                                    </div>
                                    <button onClick={() => {
                                        setIsConfirmed(false);
                                        setScreenshot(null);
                                        window.scrollTo(0, 0);
                                    }} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>Change</button>
                                </div>

                                {/* College Search */}
                                <div style={{ marginBottom: '30px' }}>
                                    <label style={labelStyle}>College Name *</label>
                                    <input
                                        style={inputStyle}
                                        placeholder="Enter your college name..."
                                        value={formData.collegeName}
                                        onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                                        required
                                    />
                                    <p style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '5px' }}>Please type full college name</p>
                                </div>

                                {/* Participants */}
                                <div style={{ marginBottom: '40px' }}>
                                    <h3 style={{ marginBottom: '20px', color: 'var(--mercedes-green)', fontSize: '1rem' }}>PARTICIPANT DETAILS</h3>
                                    {formData.members.map((m, i) => (
                                        <div key={i} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <p style={{ margin: '0 0 15px', fontSize: '0.75rem', opacity: 0.5 }}>{i === 0 ? 'LEAD MEMBER (REQUIRED)' : `MEMBER ${i + 1}`}</p>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                                                <input style={inputStyle} placeholder="Name" value={m.name} onChange={e => handleMemberChange(i, 'name', e.target.value)} />
                                                <input style={inputStyle} placeholder="Phone" value={m.phone} onChange={e => handleMemberChange(i, 'phone', e.target.value)} />
                                                <input style={inputStyle} placeholder="Email" value={m.email} onChange={e => handleMemberChange(i, 'email', e.target.value)} />
                                                <input style={inputStyle} placeholder="Roll Number" value={m.rollNumber} onChange={e => handleMemberChange(i, 'rollNumber', e.target.value)} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Sub-events */}
                                {currentEvent?.subEvents?.length > 0 && (
                                    <div style={{ marginBottom: '40px', background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                            <h3 style={{ margin: 0, color: 'var(--mercedes-green)', fontSize: '1rem' }}>SUB-EVENTS</h3>
                                            {currentEvent.maxSelectableEvents > 0 && (
                                                <span style={{ fontSize: '0.7rem', padding: '4px 10px', background: 'rgba(0,161,155,0.1)', color: 'var(--mercedes-green)', borderRadius: '20px' }}>
                                                    Pick up to {currentEvent.maxSelectableEvents}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ display: 'grid', gap: '12px' }}>
                                            {currentEvent.subEvents.map((sub, idx) => {
                                                const isSelected = selectedSubEvents.find(s => s.eventId === currentEvent._id)?.subEventTitles?.includes(sub.title);
                                                return (
                                                    <div
                                                        key={idx}
                                                        onClick={() => handleSubEventToggle(currentEvent._id, sub.title, currentEvent.maxSelectableEvents)}
                                                        style={{
                                                            padding: '15px',
                                                            borderRadius: '10px',
                                                            background: isSelected ? 'rgba(0,161,155,0.1)' : 'rgba(255,255,255,0.02)',
                                                            border: `1px solid ${isSelected ? 'var(--mercedes-green)' : 'rgba(255,255,255,0.1)'}`,
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '15px'
                                                        }}
                                                    >
                                                        <div style={{
                                                            width: '20px',
                                                            height: '20px',
                                                            borderRadius: '4px',
                                                            border: `2px solid ${isSelected ? 'var(--mercedes-green)' : 'rgba(255,255,255,0.2)'}`,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}>
                                                            {isSelected && <FiCheck color="var(--mercedes-green)" />}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{sub.title}</div>
                                                            {sub.description && <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{sub.description}</div>}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Payment Gate */}
                                <div style={{ background: 'white', color: 'black', padding: '30px', borderRadius: '20px', textAlign: 'center' }}>
                                    <h2 style={{ fontWeight: 900 }}>SECURE PAYMENT</h2>

                                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{ background: 'white', padding: '15px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', display: 'inline-block', border: '1px solid #eee' }}>
                                            {currentEvent?.qrCode?.url ? (
                                                <img
                                                    src={currentEvent.qrCode.url}
                                                    alt="Payment QR"
                                                    style={{ width: '100%', maxWidth: '250px', height: 'auto', display: 'block', borderRadius: '10px' }}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://via.placeholder.com/250?text=QR+Not+Available';
                                                        toast.error("Event QR failed to load. Contact admin.");
                                                    }}
                                                />
                                            ) : (
                                                <div style={{ width: '250px', height: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                                                    <FiImage size={40} style={{ marginBottom: '10px', opacity: 0.3 }} />
                                                    <p style={{ fontSize: '0.8rem' }}>QR Not Available. Contact Admin.</p>
                                                </div>
                                            )}
                                        </div>
                                        <p style={{ marginTop: '15px', fontSize: '1rem', color: '#333', fontWeight: 900 }}>Scan QR to pay ₹{currentEvent?.feeAmount}</p>
                                        <p style={{ fontSize: '0.7rem', color: '#666' }}>({currentEvent?.feeType})</p>
                                    </div>

                                    <div style={{ marginTop: '40px', textAlign: 'left', borderTop: '1px solid #eee', paddingTop: '30px' }}>
                                        <label style={{ ...labelStyle, color: '#333' }}>UPLOAD PAYMENT SCREENSHOT *</label>
                                        <p style={{ fontSize: '0.7rem', color: '#999', marginBottom: '10px' }}>Make sure Transaction ID is clearly visible for auto-verification.</p>
                                        <input
                                            disabled={loading || verificationStatus === 'PENDING'}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            style={{ ...inputStyle, background: '#f8f8f8', color: 'black', border: '1px solid #ddd', cursor: (loading || verificationStatus === 'PENDING') ? 'not-allowed' : 'pointer' }}
                                        />
                                    </div>

                                    <button
                                        disabled={loading || verificationStatus === 'PENDING' || !screenshot}
                                        onClick={handleSubmitRegistration}
                                        className="btn-primary"
                                        style={{
                                            marginTop: '30px',
                                            width: '100%',
                                            padding: '15px',
                                            fontSize: '1rem',
                                            fontWeight: 'bold',
                                            opacity: (loading || verificationStatus === 'PENDING' || !screenshot) ? 0.5 : 1
                                        }}
                                    >
                                        {loading ? 'PROCESSING...' : 'COMPLETE REGISTRATION'}
                                    </button>

                                    {loading && (
                                        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--mercedes-green)', fontWeight: 'bold' }}>
                                            <div className="spinner-small" />
                                            <span>Verifying payment...</span>
                                        </div>
                                    )}

                                    {verificationStatus === 'PENDING' && (
                                        <div style={{ marginTop: '20px', padding: '20px', background: 'rgba(0,161,155,0.05)', color: 'var(--mercedes-green)', borderRadius: '15px', border: '1px solid var(--mercedes-green)', textAlign: 'left' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                                <FiCheckCircle />
                                                <p style={{ fontWeight: 'bold', margin: 0 }}>SUBMITTED TO CONTROL TOWER</p>
                                            </div>
                                            {ocrData?.transactionId && (
                                                <p style={{ fontSize: '0.85rem', background: 'rgba(0,0,0,0.05)', padding: '8px 12px', borderRadius: '8px', margin: '10px 0' }}>
                                                    Detected ID: <b style={{ letterSpacing: '1px' }}>{ocrData.transactionId}</b>
                                                </p>
                                            )}
                                            <p style={{ fontSize: '0.8rem', opacity: 0.8, lineHeight: '1.4' }}>
                                                {ocrData?.transactionId
                                                    ? "Transaction ID detected automatically. Please wait for admin verification."
                                                    : "Screenshot uploaded. Our AI is processing the details. Please wait for admin approval."}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
            <style>{`
                .spinner-small { width: 30px; height: 30px; border: 3px solid rgba(0,161,155,0.1); border-top-color: var(--mercedes-green); border-radius: 50%; animation: spin 0.8s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </ErrorBoundary>
    );
};

const labelStyle = { display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: 700, opacity: 0.6, letterSpacing: '1px' };
const inputStyle = { width: '100%', padding: '15px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' };
const dropdownStyle = { position: 'absolute', top: '100%', left: 0, right: 0, background: '#111', border: '1px solid var(--mercedes-green)', borderRadius: '10px', zIndex: 100, maxHeight: '250px', overflowY: 'auto' };
const copyBtnStyle = { background: 'black', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' };

export default Registration;
