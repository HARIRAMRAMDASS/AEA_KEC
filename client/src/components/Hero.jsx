import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
    return (
        <section style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            padding: '0 5%'
        }}>
            {/* Background elements */}
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                background: 'linear-gradient(45deg, rgba(0,0,0,1) 0%, rgba(10,10,10,0.8) 100%)',
                zIndex: -1
            }} />

            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1 }}
                style={{ maxWidth: '900px', textAlign: 'center', zIndex: 1, width: '100%' }}
            >
                <motion.h4
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{
                        color: 'var(--mercedes-green)',
                        letterSpacing: '5px',
                        marginBottom: '20px',
                        fontSize: 'clamp(0.8rem, 2.5vw, 1.2rem)',
                        fontWeight: 700
                    }}
                >
                    KONGU ENGINEERING COLLEGE
                </motion.h4>
                <h1 style={{
                    fontSize: 'clamp(2.5rem, 10vw, 6rem)',
                    lineHeight: 1,
                    marginBottom: '10px',
                    fontWeight: 900,
                    textTransform: 'uppercase'
                }}>
                    AUTOMOBILE <br />
                    <span style={{ color: 'transparent', WebkitTextStroke: '2px white' }}>ENGINEERING</span> <br />
                    ASSOCIATION
                </h1>
                <h3 style={{
                    color: 'var(--mercedes-green)',
                    fontSize: 'clamp(0.9rem, 3.5vw, 1.5rem)',
                    marginBottom: '30px',
                    fontWeight: 600,
                    letterSpacing: '2px'
                }}>
                    DEPARTMENT OF AUTOMOBILE ENGINEERING
                </h3>
                <p style={{
                    fontSize: 'clamp(0.9rem, 4vw, 1.2rem)',
                    color: '#ccc',
                    marginBottom: '40px',
                    maxWidth: '700px',
                    margin: '0 auto 40px',
                    opacity: 0.8
                }}>
                    Pushing the boundaries of automotive excellence. Join us in the pursuit of speed, innovation, and engineering mastery.
                </p>
                <div className="hero-btns" style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
                        className="btn-primary"
                        style={{ minWidth: '180px' }}
                    >
                        View Events
                    </button>
                    <a href="/register" className="btn-secondary" style={{ minWidth: '180px' }}>Register Now</a>
                </div>
            </motion.div>

            {/* Mercedes Green accent lines */}
            <div className="accent-line-1" style={{
                position: 'absolute', bottom: '10%', right: '-5%', width: '40%', height: '2px',
                background: 'var(--mercedes-green)', transform: 'rotate(-45deg)', opacity: 0.3
            }} />
            <div className="accent-line-2" style={{
                position: 'absolute', top: '15%', left: '-5%', width: '30%', height: '2px',
                background: 'var(--mercedes-green)', transform: 'rotate(-45deg)', opacity: 0.3
            }} />

            <style>{`
                @media (max-width: 768px) {
                    .hero-btns {
                        flex-direction: column;
                        align-items: center;
                    }
                    .hero-btns .btn-primary, .hero-btns .btn-secondary {
                        width: 100%;
                        max-width: 250px;
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
