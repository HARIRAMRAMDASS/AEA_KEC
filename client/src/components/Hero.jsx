import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
    return (
        <section style={{
            minHeight: '100vh',
            width: '100%',
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
                style={{ maxWidth: '1000px', textAlign: 'center', zIndex: 1, width: '100%', padding: '0 15px' }}
            >
                <motion.h4
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{
                        color: 'var(--mercedes-green)',
                        letterSpacing: 'clamp(2px, 1vw, 5px)',
                        marginBottom: '20px',
                        fontSize: 'clamp(0.65rem, 3vw, 1rem)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        textShadow: '0 0 10px rgba(0, 161, 155, 0.3)'
                    }}
                >
                    KONGU ENGINEERING COLLEGE
                </motion.h4>

                <h1 className="hero-title">
                    <span className="title-part">AUTOMOBILE</span>
                    <span className="title-part stroke-text">ENGINEERING</span>
                    <span className="title-part">ASSOCIATION</span>
                </h1>

                <h3 style={{
                    color: 'var(--mercedes-green)',
                    fontSize: 'clamp(0.75rem, 4vw, 1.25rem)',
                    marginBottom: '30px',
                    fontWeight: 600,
                    letterSpacing: '1px',
                    lineHeight: 1.4,
                    textTransform: 'uppercase'
                }}>
                    DEPARTMENT OF AUTOMOBILE ENGINEERING
                </h3>

                <p style={{
                    fontSize: 'clamp(0.85rem, 4vw, 1.1rem)',
                    color: '#BBB',
                    marginBottom: '40px',
                    maxWidth: '800px',
                    margin: '0 auto 40px',
                    opacity: 0.9,
                    lineHeight: 1.6
                }}>
                    Pushing the boundaries of automotive excellence. Join us in the pursuit of speed, innovation, and engineering mastery.
                </p>

                <div className="hero-btns">
                    <button
                        onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
                        className="btn-primary-custom"
                    >
                        View Events
                    </button>
                    <a href="/register" className="btn-secondary-custom">Register Now</a>
                </div>
            </motion.div>

            {/* Mercedes Green accent lines - Wrapped to ensure clipping */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
                <div className="accent-line-1" />
                <div className="accent-line-2" />
            </div>

            <style>{`
                .hero-title {
                    display: flex;
                    flex-direction: column;
                    line-height: 1;
                    margin-bottom: 20px;
                    font-weight: 900;
                    text-transform: uppercase;
                }
                .title-part {
                    font-size: clamp(2rem, 12vw, 5.5rem);
                    display: block;
                }
                .stroke-text {
                    color: transparent;
                    -webkit-text-stroke: 1px white;
                }
                .hero-btns {
                    display: flex;
                    gap: 20px;
                    justify-content: center;
                    flex-wrap: wrap;
                }
                .btn-primary-custom {
                    background: var(--mercedes-green);
                    border: none;
                    padding: 18px 35px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 800;
                    min-width: 200px;
                    text-transform: uppercase;
                    color: black;
                    transition: 0.3s;
                }
                .btn-secondary-custom {
                    border: 2px solid white;
                    padding: 16px 35px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 700;
                    min-width: 200px;
                    text-transform: uppercase;
                    color: white;
                    text-decoration: none;
                    display: inline-block;
                    transition: 0.3s;
                }
                .btn-primary-custom:hover, .btn-secondary-custom:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 10px 20px rgba(0, 161, 155, 0.2);
                }
                .accent-line-1 {
                    position: absolute; bottom: 10%; right: -5%; width: 40%; height: 2px;
                    background: var(--mercedes-green); transform: rotate(-45deg); opacity: 0.2;
                }
                .accent-line-2 {
                    position: absolute; top: 15%; left: -5%; width: 30%; height: 2px;
                    background: var(--mercedes-green); transform: rotate(-45deg); opacity: 0.2;
                }

                @media (max-width: 768px) {
                    .hero-title {
                        gap: 5px;
                    }
                    .title-part {
                        font-size: clamp(1.2rem, 9vw, 3rem);
                        line-height: 1.1;
                        word-break: normal;
                        overflow-wrap: normal;
                        white-space: normal;
                    }
                    .hero-btns {
                        flex-direction: column;
                        align-items: center;
                        gap: 15px;
                    }
                    .btn-primary-custom, .btn-secondary-custom {
                        width: 100%;
                        max-width: 300px;
                        padding: 15px 25px;
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
