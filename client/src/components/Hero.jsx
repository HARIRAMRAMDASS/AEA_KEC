import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
    return (
        <section style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            padding: '120px 5% 60px'
        }}>
            {/* Background elements */}
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                background: 'linear-gradient(135deg, rgba(0,0,0,1) 0%, rgba(15,15,15,0.9) 100%)',
                zIndex: -1
            }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                style={{ maxWidth: '1000px', textAlign: 'center', zIndex: 1, width: '100%' }}
            >
                <motion.h4
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{
                        color: 'var(--mercedes-green)',
                        letterSpacing: '5px',
                        marginBottom: '20px',
                        fontSize: 'clamp(0.7rem, 2.5vw, 1.1rem)',
                        fontWeight: 700,
                        textShadow: '0 0 10px rgba(0, 161, 155, 0.3)'
                    }}
                >
                    KONGU ENGINEERING COLLEGE
                </motion.h4>
                <h1 style={{
                    fontSize: 'clamp(2.2rem, 10vw, 5.5rem)',
                    lineHeight: 1.1,
                    marginBottom: '15px',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word'
                }}>
                    AUTOMOBILE <br />
                    <span style={{ color: 'transparent', WebkitTextStroke: '1px white' }}>ENGINEERING</span> <br />
                    ASSOCIATION
                </h1>
                <h3 style={{
                    color: 'var(--mercedes-green)',
                    fontSize: 'clamp(0.8rem, 3.5vw, 1.3rem)',
                    marginBottom: '35px',
                    fontWeight: 600,
                    letterSpacing: '2px',
                    lineHeight: 1.4
                }}>
                    DEPARTMENT OF AUTOMOBILE ENGINEERING
                </h3>
                <p style={{
                    fontSize: 'clamp(0.9rem, 4.5vw, 1.15rem)',
                    color: '#BBB',
                    marginBottom: '45px',
                    maxWidth: '800px',
                    margin: '0 auto 45px',
                    opacity: 0.9,
                    lineHeight: 1.6
                }}>
                    Pushing the boundaries of automotive excellence. Join us in the pursuit of speed, innovation, and engineering mastery.
                </p>
                <div className="hero-btns" style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
                        className="btn-primary"
                        style={{ minWidth: '190px', padding: '18px 30px' }}
                    >
                        View Events
                    </button>
                    <a href="/register" className="btn-secondary" style={{
                        minWidth: '190px',
                        padding: '16px 30px',
                        border: '2px solid white',
                        textDecoration: 'none',
                        color: 'white',
                        fontWeight: 700,
                        borderRadius: '8px',
                        display: 'inline-block',
                        textTransform: 'uppercase'
                    }}>Register Now</a>
                </div>
            </motion.div>

            {/* Mercedes Green accent lines */}
            <div className="accent-line-1" style={{
                position: 'absolute', bottom: '10%', right: '-5%', width: '40%', height: '2px',
                background: 'var(--mercedes-green)', transform: 'rotate(-45deg)', opacity: 0.2
            }} />
            <div className="accent-line-2" style={{
                position: 'absolute', top: '15%', left: '-5%', width: '30%', height: '2px',
                background: 'var(--mercedes-green)', transform: 'rotate(-45deg)', opacity: 0.2
            }} />

            <style>{`
                @media (max-width: 768px) {
                    .hero-btns {
                        flex-direction: column;
                        align-items: center;
                        gap: 15px;
                    }
                    .hero-btns .btn-primary, .hero-btns .btn-secondary {
                        width: 100%;
                        max-width: 280px !important;
                    }
                    .accent-line-1, .accent-line-2 {
                        opacity: 0.1 !important;
                    }
                }
            `}</style>
        </section>
    );
};

export default Hero;
