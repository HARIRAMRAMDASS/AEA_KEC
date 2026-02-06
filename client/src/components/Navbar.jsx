import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenuAlt3, HiX } from 'react-icons/hi';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Register', path: '/register' },
        { name: 'Events', path: '/#events' },
        { name: 'Office Bearers', path: '/#bearers' },
        { name: 'Admin', path: '/admin-login' },
    ];

    const handleNavClick = (e, path) => {
        if (path.startsWith('/#')) {
            e.preventDefault();
            const id = path.split('#')[1];
            if (window.location.pathname === '/') {
                const element = document.getElementById(id);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
                setIsOpen(false);
            } else {
                navigate('/');
                setTimeout(() => {
                    const element = document.getElementById(id);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 100);
            }
        } else if (path === '/' && window.location.pathname === '/') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setIsOpen(false);
        }
    };

    return (
        <nav style={{
            position: 'fixed',
            top: 0,
            width: '100%',
            zIndex: 1000,
            padding: isScrolled ? '15px 5%' : '25px 5%',
            background: isScrolled ? 'rgba(10, 10, 10, 0.8)' : 'transparent',
            backdropFilter: isScrolled ? 'blur(10px)' : 'none',
            borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '15px' }} onClick={(e) => handleNavClick(e, '/')}>
                <img src="/AEA_logo.svg" alt="AEA Logo" style={{ width: '50px', height: '50px' }} />
                <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'white', letterSpacing: '2px' }}>AEA_KEC</h2>
            </Link>

            {/* Desktop Links */}
            <div className="desktop-links" style={{ display: 'flex', gap: '30px' }}>
                {navLinks.map(link => (
                    <Link
                        key={link.name}
                        to={link.path}
                        onClick={(e) => handleNavClick(e, link.path)}
                        style={{
                            color: 'white', textDecoration: 'none', fontWeight: 600,
                            fontSize: '0.9rem', textTransform: 'uppercase', transition: '0.3s'
                        }}
                        onMouseOver={(e) => e.target.style.color = 'var(--mercedes-green)'}
                        onMouseOut={(e) => e.target.style.color = 'white'}
                    >
                        {link.name}
                    </Link>
                ))}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="mobile-toggle" style={{ display: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer' }} onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <HiX /> : <HiMenuAlt3 />}
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .desktop-links { display: none !important; }
                    .mobile-toggle { display: block !important; }
                }
            `}</style>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                        style={{
                            position: 'fixed', top: 0, right: 0, width: '70%', height: '100vh',
                            background: '#0A0A0A', zIndex: 1001, padding: '100px 10%'
                        }}
                    >
                        <HiX
                            style={{ position: 'absolute', top: '30px', right: '30px', fontSize: '2rem', cursor: 'pointer' }}
                            onClick={() => setIsOpen(false)}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                            {navLinks.map(link => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={(e) => handleNavClick(e, link.path)}
                                    style={{ color: 'white', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase' }}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
