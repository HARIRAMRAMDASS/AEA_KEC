import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiDownload, FiImage, FiVideo, FiCalendar, FiUsers, FiLogOut, FiMenu, FiX, FiArrowLeft } from 'react-icons/fi';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('events');
    const [events, setEvents] = useState([]);
    const [bearers, setBearers] = useState([]);
    const [videos, setVideos] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    // Use relative path '/api' in production (served by same backend) or fully qualified for local dev
    const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api');

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
            const [evRes, brRes, viRes] = await Promise.all([
                axios.get(`${API_URL}/events`),
                axios.get(`${API_URL}/bearers`),
                axios.get(`${API_URL}/videos`)
            ]);
            setEvents(evRes.data);
            setBearers(brRes.data);
            setVideos(viRes.data);
        } catch (err) {
            console.error('Fetch failed', err);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
        } finally {
            localStorage.removeItem('adminInfo');
            navigate('/admin-login');
        }
    };

    const deleteItem = async (type, id) => {
        if (!window.confirm('Are you sure you want to delete this?')) return;
        try {
            await axios.delete(`${API_URL}/${type}/${id}`, { withCredentials: true });
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
        switch (activeTab) {
            case 'events': return <EventsPanel events={events} onRefresh={fetchData} onDelete={(id) => deleteItem('events', id)} onExport={exportExcel} />;
            case 'bearers': return <MediaPanel title="Office Bearers" type="bearers" data={bearers} onRefresh={fetchData} onDelete={(id) => deleteItem('bearers', id)} />;
            case 'videos': return <MediaPanel title="Videos" type="videos" data={videos} onRefresh={fetchData} onDelete={(id) => deleteItem('videos', id)} isVideo />;
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
                    <img src="/AEA_logo.svg" alt="AEA Logo" style={{ width: '60px', height: 'auto', marginBottom: '15px' }} />
                    <h2 style={{ color: 'var(--mercedes-green)', fontSize: '1rem', margin: 0, letterSpacing: '2px' }}>CONTROL TOWER</h2>
                </div>

                <SidebarLink active={activeTab === 'events'} icon={<FiCalendar />} label="Events" onClick={() => { setActiveTab('events'); setIsSidebarOpen(false); }} />
                <SidebarLink active={activeTab === 'bearers'} icon={<FiImage />} label="Office Bearers" onClick={() => { setActiveTab('bearers'); setIsSidebarOpen(false); }} />
                <SidebarLink active={activeTab === 'videos'} icon={<FiVideo />} label="Videos" onClick={() => { setActiveTab('videos'); setIsSidebarOpen(false); }} />
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
                    <span style={{ fontFamily: 'Syncopate', fontSize: '0.8rem', color: 'var(--mercedes-green)' }}>Admin Panel</span>
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
        name: '', type: 'Tech', date: '', teamSize: 1, feeType: 'Per Head', feeAmount: 1, closingDate: '', whatsappLink: '', maxSelectableEvents: 1, selectionMode: 'Both', eventGroup: 'Zhakra'
    });
    const [qrFile, setQrFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!qrFile) return toast.error('QR Code is required');
        setLoading(true);
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        data.append('qrCode', qrFile);

        try {
            await axios.post(`${API_URL}/events`, data, { withCredentials: true });
            toast.success('Event Created');
            setShowForm(false);
            setFormData({ name: '', type: 'Tech', date: '', teamSize: 1, feeType: 'Per Head', feeAmount: 1, closingDate: '', whatsappLink: '', maxSelectableEvents: 1, selectionMode: 'Both', eventGroup: 'Zhakra' });
            setQrFile(null);
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
                    <label style={{ fontSize: '0.8rem', opacity: 0.6 }}>Symposium Mode:</label>
                    <select
                        style={{ ...inputStyle, width: 'auto', padding: '10px' }}
                        value={events[0]?.selectionMode || 'Both'}
                        onChange={async (e) => {
                            try {
                                await axios.put(`${API_URL}/events/global-mode`, { selectionMode: e.target.value }, { withCredentials: true });
                                toast.success(`Mode set to ${e.target.value}`);
                                onRefresh();
                            } catch (err) {
                                toast.error("Failed to update mode");
                            }
                        }}
                    >
                        <option>Only Zhakra</option>
                        <option>Only Auto Expo</option>
                        <option>Both</option>
                    </select>
                    <button className="btn-primary" onClick={() => setShowForm(!showForm)}><FiPlus /> {showForm ? 'Back to List' : 'Create Event'}</button>
                </div>
            </div>

            {showForm ? (
                <div className="glass-card" style={{ border: '2px solid var(--mercedes-green)' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
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
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={labelStyle}>Selection Mode</label>
                                <select style={inputStyle} value={formData.selectionMode} onChange={e => setFormData({ ...formData, selectionMode: e.target.value })}>
                                    <option>Only Zhakra</option>
                                    <option>Only Auto Expo</option>
                                    <option>Both</option>
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={labelStyle}>Event Group</label>
                                <select style={inputStyle} value={formData.eventGroup} onChange={e => setFormData({ ...formData, eventGroup: e.target.value })}>
                                    <option>Zhakra</option>
                                    <option>Auto Expo</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Max Selectable Events</label>
                            <input required type="number" min="1" style={inputStyle} value={formData.maxSelectableEvents || 1} onChange={e => setFormData({ ...formData, maxSelectableEvents: e.target.value })} />
                            <small style={{ fontSize: '0.7rem', opacity: 0.5 }}>Allows participants to select multiple events in one registration.</small>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>WhatsApp Group Link</label>
                            <input required placeholder="https://chat.whatsapp.com/..." style={inputStyle} value={formData.whatsappLink} onChange={e => setFormData({ ...formData, whatsappLink: e.target.value })} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Payment QR Code</label>
                            <div style={{ border: '1px dashed rgba(255,255,255,0.2)', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                                <input required type="file" onChange={e => setQrFile(e.target.files[0])} accept="image/*" />
                                {qrFile && <p style={{ fontSize: '0.8rem', marginTop: '10px', color: 'var(--mercedes-green)' }}>Selected: {qrFile.name}</p>}
                            </div>
                        </div>
                        <button disabled={loading} className="btn-primary" style={{ gridColumn: '1 / -1', padding: '15px' }}>{loading ? 'Processing...' : 'Launch Event'}</button>
                    </form>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {events.map(ev => (
                        <div key={ev._id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', flexWrap: 'wrap', gap: '15px' }}>
                            <div>
                                <h3 style={{ marginBottom: '5px' }}>{ev.name}</h3>
                                <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>{new Date(ev.date).toLocaleString()} | {ev.type} | {ev.feeType}: {'\u20B9'}{ev.feeAmount}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => onExport(ev._id)} style={actionBtnStyle('var(--mercedes-green)')}><FiDownload /> Excel</button>
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
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
            await axios.post(`${API_URL}/${type}`, formData, { withCredentials: true });
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
                                        <p style={{ margin: 0, color: 'var(--mercedes-green)', fontWeight: 'bold' }}>{item.name}</p>
                                        <p style={{ margin: '5px 0 0', fontSize: '0.8rem', opacity: 0.6 }}>{item.year}</p>
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
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/auth`, { withCredentials: true });
            setAdmins(data);
        } catch (err) {
            console.error('Failed to fetch admins');
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${API_URL}/auth/register`, formData, { withCredentials: true });
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
            await axios.delete(`${API_URL}/auth/${id}`, { withCredentials: true });
            toast.success('Admin removed');
            fetchAdmins();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Deletion failed');
        }
    };

    return (
        <div style={{ maxWidth: '800px' }}>
            <h1 style={{ marginBottom: '30px' }}>Admin Management</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
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
    background: 'var(--mercedes-green)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: 'white',
    outline: 'none',
    fontSize: '0.95rem'
};

const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '0.8rem', opacity: 0.6, letterSpacing: '1px', textTransform: 'uppercase' };

export default AdminDashboard;
