import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import VideoSlider from '../components/VideoSlider';
import LoadingScreen from '../components/LoadingScreen';

const Highlights = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) return <LoadingScreen />;

    return (
        <main style={{ paddingTop: '120px', minHeight: '100vh', background: '#050505', color: 'white' }}>
            <div style={{ textAlign: 'center', padding: '60px 5%' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 style={{ color: 'white', fontSize: 'clamp(2rem, 8vw, 3.5rem)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '4px' }}>
                        THE <span style={{ color: 'var(--mercedes-green)' }}>AEA</span> CHRONICLES
                    </h1>
                    <div style={{ width: '80px', height: '4px', background: 'var(--mercedes-green)', margin: '20px auto' }} />
                    <p style={{ color: '#aaa', fontSize: '1.1rem', maxWidth: '700px', margin: '20px auto', letterSpacing: '1px' }}>
                        Experience the engine roar and the thrill of innovation.
                    </p>
                </motion.div>

                <div className="glass-card" style={{ padding: '20px', marginTop: '40px', border: '1px solid rgba(0, 161, 155, 0.3)' }}>
                    <VideoSlider muted={false} autoAdvance={false} />
                </div>

                <div style={{ marginTop: '80px' }}>
                    <a href="/" className="btn-primary" style={{ padding: '15px 40px', fontSize: '1rem', letterSpacing: '2px' }}>
                        BACK TO HOME
                    </a>
                </div>
            </div>
        </main>
    );
};

export default Highlights;
