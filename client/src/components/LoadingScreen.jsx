import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            backgroundColor: '#050505',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
        }}>
            <div style={{
                width: '320px',
                height: '4px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                position: 'relative',
                borderRadius: '10px'
            }}>
                {/* Progress Bar (Green) */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                        height: '100%',
                        backgroundColor: 'var(--mercedes-green)',
                        boxShadow: '0 0 20px var(--mercedes-green)',
                        borderRadius: '10px'
                    }}
                />

                {/* F1 Car Image */}
                <motion.img
                    src="/f1-car.png"
                    initial={{ left: '-60px' }}
                    animate={{ left: '100%' }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                        position: 'absolute',
                        top: '-45px', // Adjusted to sit on the line
                        width: '100px',
                        height: 'auto',
                        zIndex: 10
                    }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                    marginTop: '50px',
                    color: 'white',
                    fontFamily: 'Syncopate',
                    fontSize: '0.8rem',
                    letterSpacing: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px'
                }}
            >
                <span>WARMING UP TIRES</span>
                <div style={{ display: 'flex', gap: '5px' }}>
                    <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} style={{ width: '4px', height: '4px', background: 'var(--mercedes-green)' }} />
                    <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} style={{ width: '4px', height: '4px', background: 'var(--mercedes-green)' }} />
                    <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} style={{ width: '4px', height: '4px', background: 'var(--mercedes-green)' }} />
                </div>
            </motion.div>
        </div>
    );
};

export default LoadingScreen;
