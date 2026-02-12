import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { FiInstagram, FiLinkedin, FiGithub, FiMail, FiPhone, FiInfo } from 'react-icons/fi';

const AeaMembers = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hoveredId, setHoveredId] = useState(null);

    const API_URL = '/api';

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/members`);
                setMembers(data);
            } catch (err) {
                console.error("Failed to load AEA Family", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMembers();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div style={{ paddingTop: '120px', minHeight: '100vh', background: '#050505', color: 'white' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <div className="shimmer" style={{ width: '300px', height: '50px', margin: '0 auto 20px', borderRadius: '8px' }} />
                        <div className="shimmer" style={{ width: '200px', height: '20px', margin: '0 auto', borderRadius: '4px' }} />
                    </div>
                    <div className="members-responsive-grid">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} style={{ borderRadius: '20px', background: '#111', height: '450px', overflow: 'hidden' }}>
                                <div className="shimmer" style={{ width: '100%', height: '350px' }} />
                                <div style={{ padding: '25px' }}>
                                    <div className="shimmer" style={{ width: '80%', height: '20px', margin: '0 auto 10px', borderRadius: '4px' }} />
                                    <div className="shimmer" style={{ width: '60%', height: '15px', margin: '0 auto', borderRadius: '4px' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ paddingTop: '120px', paddingBottom: '100px', minHeight: '100vh', background: '#050505', color: 'white' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ textAlign: 'center', marginBottom: '80px' }}
                >
                    <h1 className="text-box" style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '4px', margin: 0 }}>
                        AEA <span style={{ color: 'var(--mercedes-green)' }}>FAMILY</span>
                    </h1>
                    <div style={{ width: '100px', height: '4px', background: 'var(--mercedes-green)', margin: '20px auto' }} />
                    <p style={{ opacity: 0.6, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '1rem' }}>The driving force behind the association</p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="members-responsive-grid"
                >
                    {members.map((member) => (
                        <motion.div
                            key={member._id}
                            variants={itemVariants}
                            onMouseEnter={() => setHoveredId(member._id)}
                            onMouseLeave={() => setHoveredId(null)}
                            style={{
                                position: 'relative',
                                borderRadius: '20px',
                                overflow: 'hidden',
                                background: '#111',
                                border: '1px solid rgba(255,255,255,0.05)',
                                transition: '0.3s'
                            }}
                        >
                            <div style={{ height: '350px', overflow: 'hidden', position: 'relative', background: '#1a1a1a' }}>
                                {member.image?.url ? (
                                    <img
                                        src={member.image.url}
                                        alt={member.name}
                                        loading="lazy"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            transition: '0.5s',
                                            transform: hoveredId === member._id ? 'scale(1.1)' : 'scale(1)',
                                            filter: hoveredId === member._id ? 'brightness(0.3)' : 'brightness(0.8)'
                                        }}
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/400x500?text=AEA+Member';
                                        }}
                                    />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                                        <FiInfo size={40} />
                                    </div>
                                )}

                                <AnimatePresence>
                                    {hoveredId === member._id && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            style={{
                                                position: 'absolute',
                                                top: 0, left: 0, width: '100%', height: '100%',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                gap: '20px', padding: '20px', textAlign: 'center',
                                                background: 'rgba(0,0,0,0.6)',
                                                backdropFilter: 'blur(4px)'
                                            }}
                                        >
                                            <p style={{ color: 'var(--mercedes-green)', fontWeight: 900, fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Connect</p>
                                            <div style={{ display: 'flex', gap: '15px' }}>
                                                {member.instagram && <SocialIcon icon={<FiInstagram />} href={`https://instagram.com/${member.instagram}`} />}
                                                {member.linkedin && <SocialIcon icon={<FiLinkedin />} href={`https://linkedin.com/in/${member.linkedin}`} />}
                                                {member.github && <SocialIcon icon={<FiGithub />} href={`https://github.com/${member.github}`} />}
                                                {member.email && <SocialIcon icon={<FiMail />} href={`mailto:${member.email}`} />}
                                                {member.mobile && <SocialIcon icon={<FiPhone />} href={`tel:${member.mobile}`} />}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div style={{ padding: '25px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <h3 className="text-box" style={{ margin: '0 0 5px', fontSize: '1.2rem', fontWeight: 700 }}>{member.name || 'Member Name'}</h3>
                                <p className="text-box" style={{ margin: 0, color: 'var(--mercedes-green)', fontSize: '0.9rem', fontWeight: 600, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>{member.position || 'Position'}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {members.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '100px 20px', opacity: 0.4 }}>
                        <FiInfo size={40} style={{ marginBottom: '20px' }} />
                        <p style={{ letterSpacing: '1px', textTransform: 'uppercase' }}>No members added yet. Check back soon.</p>
                    </div>
                )}
            </div>

            <style>{`
                .members-responsive-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 30px;
                }
                @media (max-width: 1100px) {
                    .members-responsive-grid { grid-template-columns: repeat(3, 1fr); }
                }
                @media (max-width: 768px) {
                    .members-responsive-grid { grid-template-columns: repeat(2, 1fr); gap: 15px; }
                }
                @media (max-width: 480px) {
                    .members-responsive-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};


const SocialIcon = ({ icon, href }) => (
    <motion.a
        whileHover={{ scale: 1.2, color: 'var(--mercedes-green)', backgroundColor: 'white' }}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.2rem',
            transition: '0.3s',
            textDecoration: 'none'
        }}
    >
        {icon}
    </motion.a>
);

export default AeaMembers;
