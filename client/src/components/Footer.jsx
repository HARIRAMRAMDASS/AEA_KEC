import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer style={{
            background: 'rgba(10, 10, 10, 0.8)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            position: 'relative',
            zIndex: 10
        }} className="footer-container">
            <div className="footer-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src="/KEC_LOGO (3).png" alt="KEC Logo" style={{ width: '30px', height: '30px' }} />
                    <img src="/aea_logo.png" alt="AEA Logo" style={{ width: '30px', height: '30px' }} />
                    <span style={{
                        fontFamily: 'Syncopate',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        color: 'white',
                        letterSpacing: '1px'
                    }}>
                        AEA_KEC
                    </span>
                </div>

                <div className="footer-credits">
                    <p>© {new Date().getFullYear()} ALL RIGHTS RESERVED</p>
                    <p style={{ marginTop: '4px' }}>
                        CREATED BY{' '}
                        <Link
                            to="/admin-login"
                            style={{
                                color: 'var(--mercedes-green)',
                                fontWeight: '800',
                                textDecoration: 'none',
                                cursor: 'pointer'
                            }}
                            onMouseOver={(e) => e.target.style.opacity = '0.8'}
                            onMouseOut={(e) => e.target.style.opacity = '1'}
                        >
                            HARIRAM R & DILIP B
                        </Link>
                    </p>
                </div>
            </div>
            <style>{`
                .footer-container { padding: 20px 5%; }
                .footer-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                }
                .footer-credits {
                    font-size: 0.7rem;
                    color: rgba(255, 255, 255, 0.5);
                    text-align: right;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }
                @media (max-width: 768px) {
                    .footer-content {
                        flex-direction: column;
                        gap: 20px;
                    }
                    .footer-credits {
                        text-align: center;
                    }
                }
            `}</style>
        </footer>
    );
};

export default Footer;
