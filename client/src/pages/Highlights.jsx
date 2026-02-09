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
        <main style={{ paddingTop: '80px', minHeight: '100vh', background: '#FFFFFF' }}>
            <div style={{ textAlign: 'center', padding: '100px 5%' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 style={{ color: '#000', fontSize: '3.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-2px' }}>
                        The <span style={{ color: 'var(--mercedes-green)' }}>AEA</span> Chronicles
                    </h1>
                    <p style={{ color: '#666', fontSize: '1.2rem', maxWidth: '700px', margin: '20px auto' }}>
                        Experience the engine roar and the thrill of innovation. Sound enabled for your immersive experience.
                    </p>
                </motion.div>

                <VideoSlider muted={false} />

                <div style={{ marginTop: '50px' }}>
                    <a href="/" style={{ color: '#000', textDecoration: 'none', fontWeight: 'bold', borderBottom: '2px solid var(--mercedes-green)' }}>
                        Back to Paddock
                    </a>
                </div>
            </div>
        </main>
    );
};

export default Highlights;
