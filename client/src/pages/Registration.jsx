import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiCopy, FiCheck, FiAlertTriangle, FiArrowLeft, FiImage, FiCreditCard, FiCheckCircle } from 'react-icons/fi';
import { isMobileDevice, triggerUPIPayment } from '../utils/paymentUtils';
import ErrorBoundary from '../components/ErrorBoundary';

const Registration = () => {
    const API_URL = '/api';

    const location = useLocation();
    const eventIdFromUrl = new URLSearchParams(location.search).get('eventId');

    const [events, setEvents] = useState([]);
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
    const [fetchError, setFetchError] = useState(null);

    // Payment Verification States
    const [verificationId, setVerificationId] = useState(null);
    const [verificationStatus, setVerificationStatus] = useState('IDLE');
    const [ocrData, setOcrData] = useState(null);
    const [whatsappLink, setWhatsappLink] = useState(null);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [showDesktopWarning, setShowDesktopWarning] = useState(false);
    const [paymentConfig, setPaymentConfig] = useState(null);
    const [activeCopy, setActiveCopy] = useState(null);

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
                    // Validate MongoDB ObjectId format
                    if (!/^[0-9a-fA-F]{24}$/.test(eventIdFromUrl)) {
                        setFetchError("Invalid Event link. Please check the URL carefully.");
                        setPageLoading(false);
                        return;
                    }

                    const { data } = await axios.get(`${API_URL}/events/${eventIdFromUrl}`);
                    if (data && data._id) {
                        setEvents([data]);
                        setSelectedEventIds([data._id]);
                        setFetchError(null);
                    } else {
                        setFetchError("Event not found. It might have been deleted or closed.");
                    }
                } else {
                    const { data } = await axios.get(`${API_URL}/events`);
                    setEvents(Array.isArray(data) ? data : []);
                    setFetchError(null);
                }
            } catch (err) {
                console.error("Fetch Events Error:", err);
                setFetchError(err.response?.data?.message || "Failed to load event details. Please check your internet connection.");
            } finally {
                setPageLoading(false);
            }
        };

        const fetchPaymentConfig = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/payment-config`);
                setPaymentConfig(data);
            } catch (err) {
                console.error("Failed to load payment config", err);
            }
        };

        fetchEvents();
        fetchPaymentConfig();

        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowColleges(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [eventIdFromUrl]);

    useEffect(() => {
        const fetchColleges = async () => {
            if (searchTerm.length < 2) {
                setSuggestedColleges([]);
                return;
            }
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

    const currentEvent = events.find(e => e._id === selectedEventIds[0]);
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

    const handleEventToggle = (eventId) => {
        setSelectedEventIds([eventId]);
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

    const handleUploadScreenshot = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setScreenshot(file);

        if (selectedEventIds.length === 0) return toast.error("Select an event first");
        if (!formData.collegeName) return toast.error("College name required");
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
            setOcrData({ transactionId: data.transactionId, amount: data.amount, upiId: data.upiId });
            toast.success("Screenshot uploaded. Admin will verify shortly.");
        } catch (err) {
            toast.error(err.response?.data?.message || "Upload failed");
            setVerificationStatus('IDLE');
        } finally {
            setLoading(false);
        }
    };

    const handleUPIPayment = (e) => {
        if (e) e.preventDefault();
        if (!currentEvent) return;
        if (!currentEvent.upiId?.includes('@')) return toast.error("Invalid UPI ID. Contact admin.");

        setPaymentLoading(true);
        triggerUPIPayment({
            upiId: currentEvent.upiId,
            name: currentEvent.name,
            amount: currentEvent.feeAmount,
            onDesktop: () => {
                setShowDesktopWarning(true);
                toast.info("Switch to mobile for direct UPI redirect.");
            }
        });
        setTimeout(() => setPaymentLoading(false), 2000);
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
                        <h1 style={{ textAlign: 'center', marginBottom: '40px', fontWeight: 900 }}>EVENT REGISTRATION</h1>

                        {/* Event Selection */}
                        <div style={{ marginBottom: '40px' }}>
                            <label style={labelStyle}>Selected Category</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                                {events.map(ev => (
                                    <div key={ev._id} style={{
                                        padding: '20px',
                                        borderRadius: '15px',
                                        border: `2px solid var(--mercedes-green)`,
                                        background: 'rgba(0, 161, 155, 0.05)'
                                    }}>
                                        <h3 style={{ margin: 0 }}>{ev.name}</h3>
                                        <p style={{ opacity: 0.6, fontSize: '0.9rem', margin: '10px 0' }}>{ev.description}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>₹{ev.feeAmount}</span>
                                            {isDeadlinePassed && <span style={{ color: '#ff4d4d', fontWeight: 'bold' }}>ENTRY CLOSED</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {currentEvent && !isDeadlinePassed && (
                            <div className="animate-fade">
                                {/* College Search */}
                                <div style={{ marginBottom: '30px', position: 'relative' }} ref={searchRef}>
                                    <label style={labelStyle}>College Name *</label>
                                    <input
                                        style={inputStyle}
                                        placeholder="Search your college..."
                                        value={searchTerm}
                                        onFocus={() => setShowColleges(true)}
                                        onKeyDown={handleKeyDown}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setFormData(prev => ({ ...prev, collegeName: e.target.value, collegeId: '' }));
                                            setShowColleges(true);
                                        }}
                                    />
                                    <AnimatePresence>
                                        {showColleges && searchTerm.length >= 2 && (
                                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={dropdownStyle}>
                                                {suggestedColleges.map((c, i) => (
                                                    <div key={c._id} onClick={() => handleCollegeSelect(c)} style={{
                                                        padding: '15px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                        background: cursor === i ? 'rgba(0,161,155,0.2)' : 'transparent'
                                                    }}>
                                                        <b>{c.name}</b>
                                                        <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{c.district} | {c.type}</div>
                                                    </div>
                                                ))}
                                                <div onClick={handleSelectOther} style={{ padding: '15px', cursor: 'pointer', color: 'var(--mercedes-green)', background: 'rgba(255,255,255,0.02)' }}>
                                                    Use "{searchTerm}" as custom option
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
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

                                {/* Payment Gate */}
                                <div style={{ background: 'white', color: 'black', padding: '30px', borderRadius: '20px', textAlign: 'center' }}>
                                    <h2 style={{ fontWeight: 900 }}>SECURE PAYMENT</h2>
                                    {paymentConfig?.paymentMode === 'BANK' ? (
                                        <div style={{ textAlign: 'left', marginTop: '20px' }}>
                                            <div style={{ background: '#f8f8f8', padding: '20px', borderRadius: '12px' }}>
                                                <p style={{ opacity: 0.5, fontSize: '0.7rem' }}>ACCOUNT HOLDER</p>
                                                <p style={{ fontWeight: 'bold' }}>{paymentConfig.accountHolderName}</p>
                                                <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
                                                    <div>
                                                        <p style={{ opacity: 0.5, fontSize: '0.7rem' }}>ACCOUNT NUMBER</p>
                                                        <p style={{ fontWeight: 'bold' }}>{paymentConfig.accountNumber}</p>
                                                    </div>
                                                    <button type="button" onClick={() => handleCopy(paymentConfig.accountNumber, 'Account')} style={copyBtnStyle}><FiCopy /></button>
                                                </div>
                                                <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
                                                    <div>
                                                        <p style={{ opacity: 0.5, fontSize: '0.7rem' }}>IFSC CODE</p>
                                                        <p style={{ fontWeight: 'bold' }}>{paymentConfig.ifscCode}</p>
                                                    </div>
                                                    <button type="button" onClick={() => handleCopy(paymentConfig.ifscCode, 'IFSC')} style={copyBtnStyle}><FiCopy /></button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ marginTop: '20px' }}>
                                            <img src={paymentConfig?.qrImageUrl} alt="QR" style={{ width: '200px', borderRadius: '10px' }} />
                                            <p style={{ marginTop: '10px', fontSize: '0.8rem', opacity: 0.6 }}>Scan QR to pay ₹{currentEvent.feeAmount}</p>
                                        </div>
                                    )}

                                    <div style={{ marginTop: '30px' }}>
                                        <label style={{ ...labelStyle, color: '#666' }}>UPLOAD PAYMENT SCREENSHOT *</label>
                                        <input type="file" accept="image/*" onChange={handleUploadScreenshot} style={{ ...inputStyle, background: '#f5f5f5', color: 'black', border: '1px solid #ddd' }} />
                                    </div>

                                    {verificationStatus === 'PENDING' && (
                                        <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(0,161,155,0.1)', color: 'var(--mercedes-green)', borderRadius: '10px', fontWeight: 'bold' }}>
                                            ⌛ VERIFYING PAYMENT... PLEASE WAIT.
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
