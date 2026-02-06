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
                style={{ maxWidth: '800px', textAlign: 'center' }}
            >
                <motion.h4
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{ color: 'var(--mercedes-green)', letterSpacing: '5px', marginBottom: '20px' }}
                >
                    KONGU ENGINEERING COLLEGE
                </motion.h4>
                <h1 style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', lineHeight: 1, marginBottom: '10px', fontWeight: 900 }}>
                    AUTOMOBILE <br />
                    <span style={{ color: 'transparent', WebkitTextStroke: '2px white' }}>ENGINEERING</span> <br />
                    ASSOCIATION
                </h1>
                <h3 style={{ color: 'var(--mercedes-green)', fontSize: '1.2rem', marginBottom: '30px', fontWeight: 600 }}>DEPARTMENT OF AUTOMOBILE ENGINEERING</h3>
                <p style={{ fontSize: '1.2rem', color: '#ccc', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
                    Pushing the boundaries of automotive excellence. Join us in the pursuit of speed, innovation, and engineering mastery.
                </p>
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                    <button
                        onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
                        className="btn-primary"
                        style={{ background: 'var(--mercedes-green)', border: 'none', padding: '15px 30px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        View Events
                    </button>
                    <a href="/register" className="btn-secondary">Register Now</a>
                </div>
            </motion.div>

            {/* Mercedes Green accent lines */}
            <div style={{
                position: 'absolute', bottom: '10%', right: '-5%', width: '40%', height: '2px',
                background: 'var(--mercedes-green)', transform: 'rotate(-45deg)', opacity: 0.3
            }} />
            <div style={{
                position: 'absolute', top: '15%', left: '-5%', width: '30%', height: '2px',
                background: 'var(--mercedes-green)', transform: 'rotate(-45deg)', opacity: 0.3
            }} />
        </section>
    );
};

export default Hero;
