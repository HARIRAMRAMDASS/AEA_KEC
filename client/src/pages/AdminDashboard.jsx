import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiDownload, FiImage, FiVideo, FiCalendar, FiUsers, FiLogOut, FiMenu, FiX, FiArrowLeft, FiCheckCircle, FiSettings, FiCreditCard, FiCopy, FiRefreshCw, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ErrorBoundary from '../components/ErrorBoundary';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('events');
    const [events, setEvents] = useState([]);
    const [bearers, setBearers] = useState([]);
    const [videos, setVideos] = useState([]);
    const [members, setMembers] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const admin = localStorage.getItem('adminInfo');
        if (!admin) {
            navigate('/admin-login');
        } else {
            fetchData();
        }
    }, [navigate]);

    const fetchData = async () => {
        try {
            const [evRes, brRes, viRes, memRes] = await Promise.all([
                axiosInstance.get('/events'),
                axiosInstance.get('/bearers'),
                axiosInstance.get('/videos'),
                axiosInstance.get('/members')
            ]);
            setEvents(evRes.data);
            setBearers(brRes.data);
            setVideos(viRes.data);
            setMembers(memRes.data);
            setError(null);
        } catch (err) {
            console.error('Fetch failed', err);
            setError('Unable to load dashboard data. Please check your connection.');
        }
    };

    const handleLogout = async () => {
        try {
            await axiosInstance.post(`/auth/logout`);
        } finally {
            localStorage.removeItem('adminInfo');
            localStorage.removeItem('adminToken'); // Also clear token
            navigate('/admin-login');
        }
    };

    const deleteItem = async (type, id) => {
        if (!window.confirm('Are you sure you want to delete this?')) return;
        try {
            await axiosInstance.delete(`/${type}/${id}`);
            toast.success('Deleted successfully');
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Deletion failed');
        }
    };

    const exportExcel = (eventId) => {
        window.open(`${API_URL}/events/${eventId}/export`, '_blank');
    };

    const renderContent = () => {
        if (error) return (
            <div className="glass-card" style={{ textAlign: 'center', padding: '100px 20px' }}>
                <FiX size={40} style={{ color: '#ff4d4d', marginBottom: '20px' }} />
                <h3>{error}</h3>
                <button onClick={fetchData} className="btn-primary" style={{ marginTop: '20px' }}>REFRESH PADDOCK</button>
            </div>
        );

        switch (activeTab) {
            case 'events': return <EventsPanel events={events} onRefresh={fetchData} onDelete={(id) => deleteItem('events', id)} onExport={exportExcel} />;
            case 'bearers': return <MediaPanel title="Office Bearers" type="bearers" data={bearers} onRefresh={fetchData} onDelete={(id) => deleteItem('bearers', id)} />;
            case 'videos': return <MediaPanel title="Videos" type="videos" data={videos} onRefresh={fetchData} onDelete={(id) => deleteItem('videos', id)} isVideo />;
            case 'members': return <MembersPanel data={members} onRefresh={fetchData} onDelete={(id) => deleteItem('members', id)} />;
            case 'payments': return (
                <ErrorBoundary key="payments">
                    <PaymentsPanel />
                </ErrorBoundary>
            );
            case 'paymentSettings': return <PaymentSettingsPanel />;
            case 'admins': return <AdminsPanel onRefresh={fetchData} />;
            default: return null;
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#050505', color: 'white', position: 'relative', paddingTop: '80px' }}>
            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div
                    style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 999 }}
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div style={{
                width: '280px',
                background: '#0A0A0A',
                borderRight: '1px solid rgba(255,255,255,0.05)',
                padding: '40px 20px',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                top: '80px',
                height: 'calc(100vh - 80px)',
                zIndex: 1000,
                transition: 'transform 0.3s ease',
                transform: `translateX(${isSidebarOpen ? '0' : window.innerWidth < 768 ? '-100%' : '0'})`
            }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <img src="/KEC_LOGO (3).png" alt="KEC Logo" style={{ width: '60px', height: 'auto' }} />
                        <img src="/aea_logo.png" alt="AEA Logo" style={{ width: '60px', height: 'auto' }} />
                    </div>
                    <h2 style={{ color: 'var(--mercedes-green)', fontSize: '1rem', margin: 0, letterSpacing: '2px' }}>CONTROL TOWER</h2>
                </div>

                <SidebarLink active={activeTab === 'events'} icon={<FiCalendar />} label="Events" onClick={() => { setActiveTab('events'); setIsSidebarOpen(false); }} />
                <SidebarLink active={activeTab === 'bearers'} icon={<FiImage />} label="Office Bearers" onClick={() => { setActiveTab('bearers'); setIsSidebarOpen(false); }} />
                <SidebarLink active={activeTab === 'videos'} icon={<FiVideo />} label="Videos" onClick={() => { setActiveTab('videos'); setIsSidebarOpen(false); }} />
                <SidebarLink active={activeTab === 'members'} icon={<FiUsers />} label="AEA Members" onClick={() => { setActiveTab('members'); setIsSidebarOpen(false); }} />
                <SidebarLink active={activeTab === 'payments'} icon={<FiCheckCircle />} label="Payment Verification" onClick={() => { setActiveTab('payments'); setIsSidebarOpen(false); }} />
                <SidebarLink active={activeTab === 'paymentSettings'} icon={<FiCreditCard />} label="Payment Settings" onClick={() => { setActiveTab('paymentSettings'); setIsSidebarOpen(false); }} />
                <SidebarLink active={activeTab === 'admins'} icon={<FiUsers />} label="Admins" onClick={() => { setActiveTab('admins'); setIsSidebarOpen(false); }} />

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button onClick={handleLogout} style={{ ...sidebarBtnStyle, color: '#ff4d4d', background: 'rgba(255, 77, 77, 0.1)' }}>
                        <FiLogOut /> Logout
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{
                flex: 1,
                marginLeft: window.innerWidth < 768 ? 0 : '280px',
                padding: '40px 5%',
                minWidth: 0
            }}>
                {/* Mobile Header Toolbar */}
                <div style={{
                    position: 'fixed',
                    top: '80px',
                    left: 0,
                    right: 0,
                    height: '60px',
                    background: '#0A0A0A',
                    display: window.innerWidth < 768 ? 'flex' : 'none',
                    alignItems: 'center',
                    padding: '0 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    zIndex: 900,
                    justifyContent: 'space-between'
                }}>
                    <div onClick={() => setIsSidebarOpen(true)} style={{ fontSize: '1.5rem', cursor: 'pointer' }}><FiMenu /></div>
                    <span style={{ fontFamily: 'Syncopate', fontSize: '0.8rem', color: 'var(--mercedes-green)' }}>Admin Panel <span style={{ fontSize: '0.6rem', opacity: 0.7, marginLeft: '5px' }}>v1.2.1</span></span>
                    <div style={{ width: '24px' }}></div>
                </div>

                {renderContent()}
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .admin-grid { grid-template-columns: 1fr !important; }
                }
                select option {
                    background: var(--mercedes-green);
                    color: white;
                }
                input::placeholder {
                    color: rgba(255,255,255,0.7);
                }
            `}</style>
        </div>
    );
};

// Sub-components
const SidebarLink = ({ active, icon, label, onClick }) => (
    <button onClick={onClick} style={{
        ...sidebarBtnStyle,
        background: active ? 'rgba(0, 161, 155, 0.1)' : 'transparent',
        color: active ? 'var(--mercedes-green)' : 'white',
        borderLeft: active ? '4px solid var(--mercedes-green)' : '4px solid transparent'
    }}>
        {icon} {label}
    </button>
);

const EventsPanel = ({ events, onRefresh, onDelete, onExport }) => {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '', type: 'Tech', date: '', teamSize: 1, feeType: 'Per Head', feeAmount: 1, closingDate: '', whatsappLink: '', description: '', maxSelectableEvents: 0, selectionMode: 'Both', subEvents: []
    });
    const [qrFile, setQrFile] = useState(null);
    const [qrPreview, setQrPreview] = useState(null);
    const [editingQrEvent, setEditingQrEvent] = useState(null);
    const [newQrFile, setNewQrFile] = useState(null);
    const [newQrPreview, setNewQrPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleUpdateQr = async (e) => {
        e.preventDefault();
        if (!newQrFile) return toast.error('Please select a new QR code image');

        setLoading(true);
        const form = new FormData();
        form.append('qrCode', newQrFile);

        try {
            await axiosInstance.put(`/events/${editingQrEvent._id}/qr`, form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('QR Code updated successfully');
            setEditingQrEvent(null);
            setNewQrFile(null);
            setNewQrPreview(null);
            onRefresh();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!qrFile) return toast.error('Event QR Code is mandatory');

        setLoading(true);
        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'subEvents' || key === 'details') {
                submitData.append(key, JSON.stringify(formData[key]));
            } else {
                submitData.append(key, formData[key]);
            }
        });
        submitData.append('qrCode', qrFile);

        try {
            await axiosInstance.post(`/events`, submitData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Event Created with QR Payment');
            setShowForm(false);
            setQrFile(null);
            setQrPreview(null);
            setFormData({
                name: '', type: 'Tech', date: '', teamSize: 1, feeType: 'Per Head', feeAmount: 1,
                closingDate: '', whatsappLink: '', description: '', maxSelectableEvents: 0, selectionMode: 'Both',
                details: [], subEvents: []
            });
            onRefresh();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '20px' }}>
                <h1 style={{ fontSize: '1.5rem' }}>Events Management</h1>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button className="btn-primary" onClick={() => setShowForm(!showForm)}><FiPlus /> {showForm ? 'Back to List' : 'Create Event'}</button>
                </div>
            </div>

            {/* Edit QR Modal */}
            {editingQrEvent && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
                        <button onClick={() => { setEditingQrEvent(null); setNewQrFile(null); setNewQrPreview(null); }} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}><FiX /></button>
                        <h3 style={{ marginBottom: '20px', color: 'var(--mercedes-green)' }}>Update Event QR Code</h3>

                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <p style={{ opacity: 0.7, marginBottom: '10px' }}>Current QR Code:</p>
                            {editingQrEvent.qrCode?.url ? (
                                <img src={editingQrEvent.qrCode.url} alt="Current QR" style={{ width: '150px', height: '150px', objectFit: 'contain', background: 'white', padding: '10px', borderRadius: '10px' }} />
                            ) : (
                                <p style={{ color: '#ff4d4d' }}>No QR configured</p>
                            )}
                        </div>

                        <form onSubmit={handleUpdateQr}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={labelStyle}>Upload New QR Code</label>
                                <input
                                    required
                                    type="file"
                                    accept="image/*"
                                    style={inputStyle}
                                    onChange={e => {
                                        setNewQrFile(e.target.files[0]);
                                        setNewQrPreview(URL.createObjectURL(e.target.files[0]));
                                    }}
                                />
                            </div>
                            {newQrPreview && (
                                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                    <p style={{ fontSize: '0.7rem', opacity: 0.5 }}>NEW PREVIEW</p>
                                    <img src={newQrPreview} alt="New Preview" style={{ width: '120px', height: '120px', objectFit: 'contain', background: 'white', padding: '5px', borderRadius: '8px' }} />
                                </div>
                            )}
                            <button disabled={loading} className="btn-primary" style={{ width: '100%', padding: '12px' }}>{loading ? 'Uploading...' : 'Deploy New QR'}</button>
                        </form>
                    </div>
                </div>
            )}

            {showForm ? (
                <div className="glass-card" style={{ border: '2px solid var(--mercedes-green)' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
                        <div>
                            <label style={labelStyle}>Event Name</label>
                            <input required placeholder="Name" style={inputStyle} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>

                        <div>
                            <label style={labelStyle}>Category</label>
                            <select style={inputStyle} value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                <option>Tech</option>
                                <option>Non-Tech</option>
                            </select>
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Event Description *</label>
                            <textarea
                                required
                                placeholder="Detailed event description for registration page..."
                                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Event Date & Time</label>
                            <input required type="datetime-local" style={inputStyle} value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                        </div>

                        <div>
                            <label style={labelStyle}>Registration Deadline</label>
                            <input required type="datetime-local" style={inputStyle} value={formData.closingDate} onChange={e => setFormData({ ...formData, closingDate: e.target.value })} />
                        </div>

                        <div>
                            <label style={labelStyle}>Max Team Size</label>
                            <input required type="number" min="1" style={inputStyle} value={formData.teamSize} onChange={e => setFormData({ ...formData, teamSize: e.target.value })} />
                        </div>
                        <div>
                            <label style={labelStyle}>Selection Mode</label>
                            <select style={inputStyle} value={formData.selectionMode} onChange={e => setFormData({ ...formData, selectionMode: e.target.value })}>
                                <option>Only Zhakra</option>
                                <option>Only Auto Expo</option>
                                <option>Both</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={labelStyle}>Fee Type</label>
                                <select style={inputStyle} value={formData.feeType} onChange={e => setFormData({ ...formData, feeType: e.target.value })}>
                                    <option>Per Head</option>
                                    <option>Per Team</option>
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={labelStyle}>Amount</label>
                                <input required type="number" style={inputStyle} value={formData.feeAmount} onChange={e => setFormData({ ...formData, feeAmount: e.target.value })} />
                            </div>
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>WhatsApp Group Link</label>
                            <input required placeholder="https://chat.whatsapp.com/..." style={inputStyle} value={formData.whatsappLink} onChange={e => setFormData({ ...formData, whatsappLink: e.target.value })} />
                        </div>

                        {/* SUB-EVENTS BUILDER */}
                        <div style={{ gridColumn: '1 / -1', background: 'rgba(0, 161, 155, 0.05)', padding: '20px', borderRadius: '12px', border: '1px solid var(--mercedes-green)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <label style={{ ...labelStyle, marginBottom: 0 }}>Sub-Events Configuration (Optional)</label>
                                <button type="button" onClick={() => setFormData(prev => ({ ...prev, subEvents: [...(prev.subEvents || []), { title: '', description: '' }] }))} style={{ color: 'var(--mercedes-green)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <FiPlus /> Add Sub-Event
                                </button>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={labelStyle}>Max Selectable Sub-Events</label>
                                <input type="number" min="0" style={{ ...inputStyle, width: '100px' }} value={formData.maxSelectableEvents} onChange={e => setFormData({ ...formData, maxSelectableEvents: e.target.value })} />
                                <small style={{ display: 'block', opacity: 0.5, marginTop: '5px' }}>0 means no limit. Forces checkboxes on registration.</small>
                            </div>

                            {(formData.subEvents || []).map((sub, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <input
                                            required
                                            placeholder="Sub-event Title"
                                            style={inputStyle}
                                            value={sub.title}
                                            onChange={e => {
                                                const newSub = [...formData.subEvents];
                                                newSub[idx].title = e.target.value;
                                                setFormData({ ...formData, subEvents: newSub });
                                            }}
                                        />
                                    </div>
                                    <div style={{ flex: 2 }}>
                                        <input
                                            placeholder="Optional Description"
                                            style={inputStyle}
                                            value={sub.description}
                                            onChange={e => {
                                                const newSub = [...formData.subEvents];
                                                newSub[idx].description = e.target.value;
                                                setFormData({ ...formData, subEvents: newSub });
                                            }}
                                        />
                                    </div>
                                    <button type="button" onClick={() => {
                                        const newSub = formData.subEvents.filter((_, i) => i !== idx);
                                        setFormData({ ...formData, subEvents: newSub });
                                    }} style={{ background: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', border: 'none', borderRadius: '8px', padding: '12px 15px', cursor: 'pointer' }}>
                                        <FiTrash2 />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* CUSTOM FIELDS BUILDER */}
                        <div style={{ gridColumn: '1 / -1', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <label style={{ ...labelStyle, marginBottom: 0 }}>Event Specifications (Optional)</label>
                                <button type="button" onClick={() => setFormData(prev => ({ ...prev, details: [...(prev.details || []), { title: '', value: '' }] }))} style={{ color: 'var(--mercedes-green)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <FiPlus /> Add Field
                                </button>
                            </div>

                            {(formData.details || []).map((detail, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                    <input
                                        placeholder="Title (e.g. Venue)"
                                        style={{ ...inputStyle, flex: 1 }}
                                        value={detail.title}
                                        onChange={e => {
                                            const newDetails = [...formData.details];
                                            newDetails[idx].title = e.target.value;
                                            setFormData({ ...formData, details: newDetails });
                                        }}
                                    />
                                    <input
                                        placeholder="Value (e.g. Convention Center)"
                                        style={{ ...inputStyle, flex: 2 }}
                                        value={detail.value}
                                        onChange={e => {
                                            const newDetails = [...formData.details];
                                            newDetails[idx].value = e.target.value;
                                            setFormData({ ...formData, details: newDetails });
                                        }}
                                    />
                                    <button type="button" onClick={() => {
                                        const newDetails = formData.details.filter((_, i) => i !== idx);
                                        setFormData({ ...formData, details: newDetails });
                                    }} style={{ background: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', border: 'none', borderRadius: '8px', padding: '0 15px', cursor: 'pointer' }}>
                                        <FiTrash2 />
                                    </button>
                                </div>
                            ))}
                            {(formData.details || []).length === 0 && <p style={{ fontSize: '0.8rem', opacity: 0.4, textAlign: 'center', margin: 0 }}>No custom fields added.</p>}
                        </div>

                        <div style={{ gridColumn: '1 / -1', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <label style={labelStyle}>Event Payment QR Code *</label>
                            <input
                                required
                                type="file"
                                accept="image/*"
                                style={inputStyle}
                                onChange={e => {
                                    setQrFile(e.target.files[0]);
                                    setQrPreview(URL.createObjectURL(e.target.files[0]));
                                }}
                            />
                            {qrPreview && (
                                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.7rem', opacity: 0.5, marginBottom: '10px' }}>QR PREVIEW</p>
                                    <img src={qrPreview} alt="Preview" style={{ width: '180px', height: '180px', objectFit: 'contain', background: 'white', padding: '15px', borderRadius: '15px' }} />
                                </div>
                            )}
                            <small style={{ display: 'block', opacity: 0.5, marginTop: '10px' }}>Scan-to-pay QR code for this specific event.</small>
                        </div>

                        <button disabled={loading} className="btn-primary" style={{ gridColumn: '1 / -1', padding: '15px' }}>{loading ? 'Processing...' : 'Launch Event'}</button>
                    </form>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {events.map(ev => (
                        <div key={ev._id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', flexWrap: 'wrap', gap: '15px' }}>
                            <div>
                                <h3 className="text-box" style={{ marginBottom: '5px' }}>{ev.name}</h3>
                                <p className="text-box" style={{ fontSize: '0.8rem', opacity: 0.6 }}>{new Date(ev.date).toLocaleString()} | {ev.type} | {ev.feeType}: {'\u20B9'}{ev.feeAmount}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => onExport(ev._id)} style={actionBtnStyle('var(--mercedes-green)')}><FiDownload /> Excel</button>
                                <button onClick={() => { setEditingQrEvent(ev); }} style={actionBtnStyle('#FFA500')}><FiImage /> Edit QR</button>
                                <button onClick={() => onDelete(ev._id)} style={actionBtnStyle('#ff4d4d')}><FiTrash2 /> Delete</button>
                            </div>
                        </div>
                    ))}
                    {events.length === 0 && <p style={{ opacity: 0.4, textAlign: 'center', padding: '40px' }}>No events indexed.</p>}
                </div>
            )}
        </div>
    );
};

const MediaPanel = ({ title, type, data, onRefresh, onDelete, isVideo = false }) => {
    const [file, setFile] = useState(null);
    const [name, setName] = useState('');
    const [year, setYear] = useState('');
    const [loading, setLoading] = useState(false);
    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return toast.error('Select a file first');
        if (type === 'bearers' && (!name || !year)) return toast.error('Name and Year are mandatory');

        setLoading(true);
        const formData = new FormData();
        formData.append(isVideo ? 'video' : 'image', file);
        if (type === 'bearers') {
            formData.append('name', name);
            formData.append('year', year);
        }

        try {
            await axiosInstance.post(`/${type}`, formData);
            toast.success('Successfully uploaded to server');
            setFile(null);
            setName('');
            setYear('');
            onRefresh();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed. Check server logs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>{title}</h1>
            <div className="glass-card" style={{ marginBottom: '40px' }}>
                <form onSubmit={handleUpload} style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={labelStyle}>Select {isVideo ? 'Video' : 'Image'}</label>
                        <input type="file" onChange={e => setFile(e.target.files[0])} accept={isVideo ? 'video/*' : 'image/*'} style={{ width: '100%' }} />
                    </div>
                    {type === 'bearers' && (
                        <>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <label style={labelStyle}>Full Name</label>
                                <input required placeholder="eg: John Doe" style={inputStyle} value={name} onChange={e => setName(e.target.value)} />
                            </div>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <label style={labelStyle}>Year/Position</label>
                                <input required placeholder="eg: 2024-2025" style={inputStyle} value={year} onChange={e => setYear(e.target.value)} />
                            </div>
                        </>
                    )}
                    <button disabled={loading} className="btn-primary" style={{ minWidth: '150px' }}>{loading ? 'Uploading...' : 'Upload'}</button>
                </form>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }} className="admin-grid">
                {data.map(item => (
                    <div key={item._id} style={{ position: 'relative', borderRadius: '15px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', background: '#111' }}>
                        {isVideo ? (
                            <video src={item.videoUrl} controls style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                        ) : (
                            <>
                                <img src={item.imageUrl} alt="bearer" style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
                                {type === 'bearers' && (
                                    <div style={{ padding: '15px' }}>
                                        <p className="text-box" style={{ margin: 0, color: 'var(--mercedes-green)', fontWeight: 'bold' }}>{item.name}</p>
                                        <p className="text-box" style={{ margin: '5px 0 0', fontSize: '0.8rem', opacity: 0.6 }}>{item.year}</p>
                                    </div>
                                )}
                            </>
                        )}
                        <button
                            onClick={() => onDelete(item._id)}
                            style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255, 77, 77, 0.9)', color: 'white', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}
                        >
                            <FiTrash2 />
                        </button>
                    </div>
                ))}
                {data.length === 0 && <p style={{ gridColumn: '1 / -1', textAlign: 'center', opacity: 0.4 }}>No media items available.</p>}
            </div>
        </div>
    );
};

const AdminsPanel = ({ onRefresh }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(false);
    const API_URL = '/api';

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const { data } = await axiosInstance.get(`/auth`);
            setAdmins(data);
        } catch (err) {
            console.error('Failed to fetch admins');
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axiosInstance.post('/auth/register', formData);
            toast.success('Access Granted to new Admin');
            setFormData({ email: '', password: '' });
            fetchAdmins();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add admin');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this admin?')) return;
        try {
            await axiosInstance.delete(`/auth/${id}`);
            toast.success('Admin removed');
            fetchAdmins();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Deletion failed');
        }
    };

    return (
        <div style={{ maxWidth: '800px' }}>
            <h1 style={{ marginBottom: '30px' }}>Admin Management</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
                <div className="glass-card">
                    <h3 style={{ marginBottom: '20px', color: 'var(--mercedes-green)' }}>Add New Admin</h3>
                    <form onSubmit={handleAdd}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>Email Address</label>
                            <input required type="email" placeholder="email@kongu.edu" style={inputStyle} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div style={{ marginBottom: '30px' }}>
                            <label style={labelStyle}>Access Password</label>
                            <input required type="password" placeholder="••••••••" style={inputStyle} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                        </div>
                        <button disabled={loading} className="btn-primary" style={{ width: '100%', padding: '15px' }}>{loading ? 'Processing...' : 'Authorize'}</button>
                    </form>
                </div>

                <div className="glass-card">
                    <h3 style={{ marginBottom: '20px', color: 'var(--mercedes-green)' }}>Active Admins</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {admins.map(admin => (
                            <div key={admin._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ minWidth: 0 }}>
                                    <p style={{ margin: 0, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{admin.email}</p>
                                    <p style={{ margin: '5px 0 0', fontSize: '0.7rem', opacity: 0.5 }}>PWD: •••••••• (Hashed)</p>
                                </div>
                                <button
                                    onClick={() => handleDelete(admin._id)}
                                    disabled={admins.length <= 1}
                                    style={{
                                        background: 'rgba(255, 77, 77, 0.1)',
                                        color: '#ff4d4d',
                                        border: 'none',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        cursor: admins.length <= 1 ? 'not-allowed' : 'pointer',
                                        opacity: admins.length <= 1 ? 0.3 : 1
                                    }}
                                    title={admins.length <= 1 ? "At least one admin is required" : "Delete Admin"}
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        ))}
                    </div>
                    {admins.length === 1 && (
                        <p style={{ fontSize: '0.7rem', color: '#ff4d4d', marginTop: '15px', textAlign: 'center' }}>
                            ⚠️ At least one admin is required.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

const MembersPanel = ({ data, onRefresh, onDelete }) => {
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({
        name: '', position: '', mobile: '', email: '', instagram: '', linkedin: '', github: ''
    });
    const [loading, setLoading] = useState(false);
    const API_URL = '/api';

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return toast.error('Profile image is mandatory');
        if (!formData.name || !formData.position) return toast.error('Name and Position are mandatory');

        setLoading(true);
        const form = new FormData();
        form.append('image', file);
        Object.keys(formData).forEach(key => form.append(key, formData[key]));

        try {
            await axiosInstance.post('/members', form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Member added successfully');
            setFile(null);
            setFormData({ name: '', position: '', mobile: '', email: '', instagram: '', linkedin: '', github: '' });
            onRefresh();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add member');
        } finally {
            setLoading(false);
        }
    };

    if (!data) return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
            <div className="shimmer" style={{ width: '100%', height: '200px', borderRadius: '15px' }} />
            <p style={{ marginTop: '20px', opacity: 0.5 }}>Syncing AEA Member Data...</p>
        </div>
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '1.8rem', margin: 0 }}>AEA Members Registry</h1>
            </div>

            <div className="glass-card" style={{ marginBottom: '40px', border: '1px solid rgba(0, 161, 155, 0.2)' }}>
                <h3 style={{ marginBottom: '20px', color: 'var(--mercedes-green)' }}>Add Professional Member</h3>
                <form onSubmit={handleUpload} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={labelStyle}>Profile Photo *</label>
                        <input type="file" onChange={e => setFile(e.target.files[0])} accept="image/*" style={{ ...inputStyle, padding: '10px' }} />
                    </div>
                    <div>
                        <label style={labelStyle}>Full Name *</label>
                        <input required placeholder="eg: Dr. John Doe" style={inputStyle} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                        <label style={labelStyle}>Position/Responsibility *</label>
                        <input required placeholder="eg: Faculty Coordinator" style={inputStyle} value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} />
                    </div>
                    <div>
                        <label style={labelStyle}>Mobile Number</label>
                        <input placeholder="eg: +91 98765 43210" style={inputStyle} value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} />
                    </div>
                    <div>
                        <label style={labelStyle}>E-mail ID</label>
                        <input type="email" placeholder="eg: member@kec.ac.in" style={inputStyle} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div>
                        <label style={labelStyle}>Instagram URL</label>
                        <input placeholder="https://instagram.com/..." style={inputStyle} value={formData.instagram} onChange={e => setFormData({ ...formData, instagram: e.target.value })} />
                    </div>
                    <div>
                        <label style={labelStyle}>LinkedIn URL</label>
                        <input placeholder="https://linkedin.com/in/..." style={inputStyle} value={formData.linkedin} onChange={e => setFormData({ ...formData, linkedin: e.target.value })} />
                    </div>
                    <div>
                        <label style={labelStyle}>GitHub URL</label>
                        <input placeholder="https://github.com/..." style={inputStyle} value={formData.github} onChange={e => setFormData({ ...formData, github: e.target.value })} />
                    </div>
                    <button disabled={loading} className="btn-primary" style={{ gridColumn: '1 / -1', padding: '15px', fontWeight: 'bold' }}>
                        {loading ? 'DEPLOYING DATA...' : 'AUTHORIZE & ADD MEMBER'}
                    </button>
                </form>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }} className="admin-grid">
                {data.map(mem => (
                    <div key={mem._id} className="glass-card" style={{ display: 'flex', gap: '20px', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--mercedes-green)', flexShrink: 0 }}>
                            <img src={mem.image?.url || 'https://via.placeholder.com/150'} alt={mem.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <h4 className="text-box" style={{ margin: 0, color: 'white' }}>{mem.name}</h4>
                            <p className="text-box" style={{ margin: '4px 0', fontSize: '0.8rem', color: 'var(--mercedes-green)', fontWeight: 'bold' }}>{mem.position}</p>
                            <p className="text-box" style={{ margin: 0, fontSize: '0.75rem', opacity: 0.5 }}>{mem.email || 'No Email'}</p>
                        </div>
                        <button
                            onClick={() => onDelete(mem._id)}
                            style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                        >
                            <FiTrash2 />
                        </button>
                    </div>
                ))}
                {data.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', opacity: 0.4, border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '15px' }}>
                        <FiUsers size={40} style={{ marginBottom: '15px' }} />
                        <p>No AEA Members found in the registry.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const PaymentsPanel = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});
    const [edits, setEdits] = useState({});
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [fetchError, setFetchError] = useState(null);

    const fetchPayments = async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const res = await axiosInstance.get('/events/verify/pending', {
                params: { page, limit }
            });
            const data = res.data;

            // Defensive checks
            if (data && Array.isArray(data.verifications)) {
                setPayments(data.verifications);
                setTotalPages(data.pages || 1);
                setTotalRecords(data.total || 0);
            } else if (data && Array.isArray(data.payments)) {
                // Fallback for user requested structure
                setPayments(data.payments);
                setTotalPages(1);
                setTotalRecords(data.payments.length);
            } else if (Array.isArray(data)) {
                // Fallback for simple array
                setPayments(data);
                setTotalPages(1);
                setTotalRecords(data.length);
            } else {
                setPayments([]);
                setTotalPages(1);
            }
        } catch (err) {
            console.error("Fetch Payments Error:", err);
            setFetchError("Failed to load payments. Please try again.");
            setPayments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [page, limit]);

    const handleAction = async (pay, action) => {
        const id = pay._id;
        setActionLoading(prev => ({ ...prev, [id]: true }));
        try {
            const payload = action === 'approve' ? {
                transactionId: edits[id]?.transactionId ?? pay.transactionId,
                amount: edits[id]?.amount ?? pay.amount
            } : {};

            await axiosInstance.post(`/events/verify/${action}/${id}`, payload);
            toast.success(`Payment ${action === 'approve' ? 'Verified' : 'Rejected'}`);

            // Refetch current page to keep UI consistent
            fetchPayments();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Operation failed');
        } finally {
            setActionLoading(prev => ({ ...prev, [id]: false }));
        }
    };


    const handleEditChange = (id, field, value) => {
        setEdits(prev => ({
            ...prev,
            [id]: { ...(prev[id] || {}), [field]: value }
        }));
    };

    if (fetchError) {
        return (
            <div style={{ textAlign: 'center', padding: '50px', background: 'rgba(255, 77, 77, 0.1)', borderRadius: '15px' }}>
                <FiX size={40} color="#ff4d4d" />
                <p style={{ color: '#ff4d4d', marginTop: '15px' }}>{fetchError}</p>
                <button onClick={fetchPayments} className="btn-primary" style={{ marginTop: '20px' }}>Retry Connection</button>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Payment Verification</h1>
                    <p style={{ opacity: 0.6, marginTop: '5px' }}>{totalRecords} pending requests across {totalPages} pages.</p>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <select
                        value={limit}
                        onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                        style={{ ...inputStyle, width: 'auto', padding: '10px' }}
                    >
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                        <option value={100}>100 per page</option>
                    </select>
                    <button onClick={fetchPayments} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '10px', borderRadius: '8px', cursor: 'pointer' }} title="Refresh">
                        <FiRefreshCw className={loading ? 'spin' : ''} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px' }}>
                    <div className="spinner-small" style={{ margin: '0 auto 20px' }} />
                    <p style={{ opacity: 0.5, letterSpacing: '2px' }}>LOADING PADDOCK DATA...</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {payments.map(pay => (
                        <div key={pay._id || Math.random()} className="glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', alignItems: 'center' }}>
                            <div>
                                <p style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '5px' }}>SCREENSHOT</p>
                                <a href={pay.screenshotUrl} target="_blank" rel="noreferrer">
                                    <img
                                        src={pay.screenshotUrl}
                                        alt="payment"
                                        style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/200?text=Image+Load+Error'; }}
                                    />
                                </a>
                            </div>
                            <div>
                                <h3 className="text-box" style={{ margin: 0 }}>{pay.participantName || 'Unknown'}</h3>
                                <p className="text-box" style={{ color: 'var(--mercedes-green)', fontWeight: 'bold', margin: '5px 0' }}>{pay.eventId?.name || 'Unknown Event'}</p>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', opacity: 0.5, display: 'block', marginBottom: '5px' }}>TRANSACTION ID</label>
                                        <input
                                            style={inputStyle}
                                            value={edits[pay._id]?.transactionId ?? pay.transactionId ?? ''}
                                            onChange={(e) => handleEditChange(pay._id, 'transactionId', e.target.value)}
                                            placeholder="Enter ID if missing..."
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', opacity: 0.5, display: 'block', marginBottom: '5px' }}>AMOUNT ({'\u20B9'})</label>
                                        <input
                                            type="number"
                                            style={inputStyle}
                                            value={edits[pay._id]?.amount ?? pay.amount ?? ''}
                                            onChange={(e) => handleEditChange(pay._id, 'amount', e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ fontSize: '0.7rem', opacity: 0.5, display: 'block', marginBottom: '5px' }}>RECIPIENT UPI (OCR)</label>
                                        <p style={{ margin: 0, fontSize: '0.85rem', fontFamily: 'monospace' }}>{pay.upiId || 'Not detected'}</p>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <button
                                    disabled={actionLoading[pay._id]}
                                    onClick={() => handleAction(pay, 'approve')}
                                    style={{
                                        background: 'var(--mercedes-green)',
                                        color: 'black',
                                        border: 'none',
                                        padding: '15px',
                                        borderRadius: '8px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        opacity: actionLoading[pay._id] ? 0.7 : 1
                                    }}
                                >
                                    {actionLoading[pay._id] ? <div className="spinner-small" style={{ width: '16px', height: '16px', borderTopColor: 'black' }} /> : <FiCheckCircle />}
                                    {actionLoading[pay._id] ? 'Processing...' : 'Approve & Register'}
                                </button>
                                <button
                                    disabled={actionLoading[pay._id]}
                                    onClick={() => handleAction(pay, 'reject')}
                                    style={{
                                        background: 'rgba(255, 77, 77, 0.1)',
                                        color: '#ff4d4d',
                                        border: '1px solid #ff4d4d',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        opacity: actionLoading[pay._id] ? 0.5 : 1
                                    }}
                                >
                                    Reject Payment
                                </button>
                            </div>
                        </div>
                    ))}
                    {payments.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '100px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                            <FiCheckCircle style={{ fontSize: '4rem', opacity: 0.1, marginBottom: '20px' }} />
                            <p style={{ opacity: 0.4, fontSize: '1.2rem' }}>Paddock is clear. All payments processed.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '40px', alignItems: 'center' }}>
                    <button
                        disabled={page === 1 || loading}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', opacity: page === 1 ? 0.3 : 1 }}
                    >
                        <FiChevronLeft /> Previous
                    </button>
                    <span style={{ opacity: 0.7 }}>Page {page} of {totalPages}</span>
                    <button
                        disabled={page === totalPages || loading}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', opacity: page === totalPages ? 0.3 : 1 }}
                    >
                        Next <FiChevronRight />
                    </button>
                </div>
            )}
        </div>
    );
};

// Styles
const sidebarBtnStyle = {
    width: '100%',
    padding: '12px 15px',
    border: 'none',
    color: 'white',
    fontSize: '0.9rem',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    marginBottom: '8px',
    borderRadius: '10px',
    transition: '0.3s'
};

const actionBtnStyle = (color) => ({
    background: 'rgba(255,255,255,0.05)',
    color: color,
    border: `1px solid ${color}`,
    padding: '8px 15px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    transition: '0.2s'
});

const inputStyle = {
    width: '100%',
    padding: '12px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: 'white',
    outline: 'none',
    fontSize: '0.95rem'
};

const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '0.8rem', opacity: 0.6, letterSpacing: '1px', textTransform: 'uppercase' };

const PaymentSettingsPanel = () => {
    const [config, setConfig] = useState({
        paymentMode: 'QR',
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        qrImageUrl: ''
    });
    const [loading, setLoading] = useState(false);
    const [qrFile, setQrFile] = useState(null);
    const API_URL = '/api/payment-config';

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const { data } = await axios.get(API_URL);
            setConfig(data);
        } catch (err) {
            toast.error('Failed to load payment settings');
        }
    };

    const handleModeUpdate = async (mode) => {
        setLoading(true);
        try {
            const { data } = await axios.put(`${API_URL}/mode`, { paymentMode: mode }, { withCredentials: true });
            setConfig(data);
            toast.success(`Payment mode switched to ${mode}`);
        } catch (err) {
            toast.error('Failed to update payment mode');
        } finally {
            setLoading(false);
        }
    };

    const handleBankUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.put(`${API_URL}/bank`, {
                accountHolderName: config.accountHolderName,
                accountNumber: config.accountNumber,
                ifscCode: config.ifscCode,
                bankName: config.bankName
            }, { withCredentials: true });
            setConfig(data);
            toast.success('Bank details updated');
        } catch (err) {
            toast.error('Failed to update bank details');
        } finally {
            setLoading(false);
        }
    };

    const handleQrUpload = async (e) => {
        e.preventDefault();
        if (!qrFile) return toast.error('Please select a QR code image');
        setLoading(true);
        const formData = new FormData();
        formData.append('qrImage', qrFile);
        try {
            const { data } = await axios.put(`${API_URL}/qr`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setConfig(data);
            setQrFile(null);
            toast.success('QR Code updated');
        } catch (err) {
            toast.error('QR Upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px' }} className="animate-fade">
            <h1 style={{ marginBottom: '30px' }}>Payment Configuration</h1>

            <div className="glass-card" style={{ marginBottom: '30px', border: '1px solid rgba(0, 161, 155, 0.2)' }}>
                <label style={labelStyle}>Active Payment Method</label>
                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                    <button
                        onClick={() => handleModeUpdate('QR')}
                        style={{
                            ...sidebarBtnStyle,
                            flex: 1,
                            justifyContent: 'center',
                            background: config.paymentMode === 'QR' ? 'rgba(0, 161, 155, 0.2)' : 'transparent',
                            border: config.paymentMode === 'QR' ? '1px solid var(--mercedes-green)' : '1px solid rgba(255,255,255,0.1)',
                            color: config.paymentMode === 'QR' ? 'var(--mercedes-green)' : 'white'
                        }}
                    >
                        <FiImage /> QR Code
                    </button>
                    <button
                        onClick={() => handleModeUpdate('BANK')}
                        style={{
                            ...sidebarBtnStyle,
                            flex: 1,
                            justifyContent: 'center',
                            background: config.paymentMode === 'BANK' ? 'rgba(0, 161, 155, 0.2)' : 'transparent',
                            border: config.paymentMode === 'BANK' ? '1px solid var(--mercedes-green)' : '1px solid rgba(255,255,255,0.1)',
                            color: config.paymentMode === 'BANK' ? 'var(--mercedes-green)' : 'white'
                        }}
                    >
                        <FiCreditCard /> Bank Transfer
                    </button>
                </div>
            </div>

            {config.paymentMode === 'BANK' ? (
                <div className="glass-card animate-fade">
                    <h3 style={{ marginBottom: '25px', color: 'var(--mercedes-green)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FiCreditCard /> Bank Account Details
                    </h3>
                    <form onSubmit={handleBankUpdate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Account Holder Name</label>
                            <input required style={inputStyle} value={config.accountHolderName} onChange={e => setConfig({ ...config, accountHolderName: e.target.value })} placeholder="eg: AEA Association KEC" />
                        </div>
                        <div>
                            <label style={labelStyle}>Account Number</label>
                            <input required style={inputStyle} value={config.accountNumber} onChange={e => setConfig({ ...config, accountNumber: e.target.value })} placeholder="1234567890" />
                        </div>
                        <div>
                            <label style={labelStyle}>IFSC Code</label>
                            <input required style={inputStyle} value={config.ifscCode} onChange={e => setConfig({ ...config, ifscCode: e.target.value })} placeholder="SBIN0001234" />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Bank Name & Branch (Optional)</label>
                            <input style={inputStyle} value={config.bankName} onChange={e => setConfig({ ...config, bankName: e.target.value })} placeholder="State Bank of India, Perundurai" />
                        </div>
                        <button disabled={loading} className="btn-primary" style={{ gridColumn: '1 / -1', marginTop: '10px', padding: '15px' }}>
                            {loading ? 'DEPLOYING UPDATES...' : 'SAVE BANK CONFIGURATION'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="glass-card animate-fade">
                    <h3 style={{ marginBottom: '25px', color: 'var(--mercedes-green)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FiImage /> QR Code Configuration
                    </h3>
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        {config.qrImageUrl ? (
                            <div style={{ position: 'relative', display: 'inline-block', padding: '15px', background: 'white', borderRadius: '20px' }}>
                                <img src={config.qrImageUrl} alt="Payment QR" style={{ width: '220px', height: '220px', objectFit: 'contain' }} />
                                <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'var(--mercedes-green)', color: 'black', padding: '5px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold' }}>ACTIVE</div>
                            </div>
                        ) : (
                            <div style={{ width: '220px', height: '220px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '20px' }}>
                                <FiImage size={40} style={{ opacity: 0.2 }} />
                            </div>
                        )}
                        <p style={{ marginTop: '15px', fontSize: '0.85rem', opacity: 0.5 }}>Upload your Google Pay / PhonePe / Paytm Merchant QR Code</p>
                    </div>

                    <form onSubmit={handleQrUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <input type="file" accept="image/*" onChange={e => setQrFile(e.target.files[0])} style={{ ...inputStyle, padding: '15px' }} />
                        <button disabled={loading} className="btn-primary" style={{ padding: '15px' }}>
                            {loading ? 'UPLOADING TO CLOUD...' : 'UPDATE MERCHANT QR'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
