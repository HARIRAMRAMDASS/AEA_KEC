import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const VideoSlider = ({ muted = true, autoAdvance = true }) => {
    const [videos, setVideos] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const API_URL = '/api';

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/videos`);
                setVideos(data);
            } catch (err) {
                console.error('Failed to fetch videos', err);
            }
        };
        fetchVideos();
    }, []);

    useEffect(() => {
        if (videos.length === 0 || !autoAdvance) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % videos.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [videos, autoAdvance]);

    const handleVideoEnd = () => {
        setCurrentIndex((prev) => (prev + 1) % videos.length);
    };

    if (videos.length === 0) return null;

    return (
        <section style={{ background: 'transparent', textAlign: 'center', color: 'white' }}>
            <div className="video-slider-container" style={{ maxWidth: '1000px', margin: '0 auto', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                <AnimatePresence mode="wait">
                    <motion.video
                        key={videos[currentIndex]._id}
                        src={videos[currentIndex].videoUrl}
                        autoPlay
                        onEnded={handleVideoEnd}
                        muted={muted}
                        controls
                        playsInline
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        style={{ width: '100%', maxHeight: '70vh', display: 'block', background: '#000' }}
                    />
                </AnimatePresence>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                    {videos.map((_, idx) => (
                        <div
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            style={{
                                width: '40px',
                                height: '4px',
                                background: idx === currentIndex ? 'var(--mercedes-green)' : 'rgba(255,255,255,0.1)',
                                cursor: 'pointer',
                                transition: '0.3s'
                            }}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default VideoSlider;
