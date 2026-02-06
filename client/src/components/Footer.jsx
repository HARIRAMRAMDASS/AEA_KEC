import React from 'react';

const Footer = () => {
    return (
        <footer style={{
            background: 'rgba(10, 10, 10, 0.8)',
            backdropFilter: 'blur(10px)',
            padding: '20px 5%',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            zIndex: 10
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src="/AEA_logo.svg" alt="AEA Logo" style={{ width: '30px', height: '30px' }} />
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

            <div style={{
                fontSize: '0.7rem',
                color: 'rgba(255, 255, 255, 0.5)',
                textAlign: 'right',
                letterSpacing: '1px',
                textTransform: 'uppercase'
            }}>
                <p>© {new Date().getFullYear()} ALL RIGHTS RESERVED</p>
                <p style={{ marginTop: '4px' }}>
                    CREATED BY <span style={{ color: 'var(--mercedes-green)', fontWeight: '800' }}>HARIRAM R & DILIP B</span>
                </p>
            </div>
        </footer>
    );
};

export default Footer;
