import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post(`${API_URL}/auth/login`, { email, password }, { withCredentials: true });
            localStorage.setItem('adminInfo', JSON.stringify(data));
            toast.success('Access Granted. Welcome back.');
            navigate('/admin/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Unauthorized access');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A0A' }}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-card"
                style={{ width: '100%', maxWidth: '400px' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <img src="/AEA_logo.svg" alt="AEA Logo" style={{ width: '80px', height: 'auto', marginBottom: '15px' }} />
                    <h2 style={{ textTransform: 'uppercase', letterSpacing: '2px' }}>Admin Portal</h2>
                </div>

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '20px' }}>
                        <input
                            required
                            type="email"
                            placeholder="Email Address"
                            style={inputStyle}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div style={{ marginBottom: '30px', position: 'relative' }}>
                        <input
                            required
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            style={inputStyle}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <div
                            style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', opacity: 0.6 }}
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                        </div>
                    </div>
                    <button disabled={loading} className="btn-primary" style={{ width: '100%' }}>
                        {loading ? 'Authenticating...' : 'Engine Start'}
                    </button>
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
    outline: 'none'
};

export default AdminLogin;
