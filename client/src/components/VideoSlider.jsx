import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const VideoSlider = ({ muted = true }) => {
    const [videos, setVideos] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Use relative path '/api' in production (served by same backend) or fully qualified for local dev
    const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api');

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
        if (videos.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % videos.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [videos]);

    if (videos.length === 0) return null;

    return (
        <section style={{ padding: '80px 5%', background: '#FFFFFF', textAlign: 'center', color: '#000' }}>
            <h2 style={{ marginBottom: '40px', color: '#000', fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase' }}>Event Highlights</h2>
            <div style={{ position: 'relative', maxWidth: '1000px', margin: '0 auto', borderRadius: '25px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                <AnimatePresence mode="wait">
                    <motion.video
                        key={videos[currentIndex]._id}
                        src={videos[currentIndex].videoUrl}
                        autoPlay
                        loop
                        muted={muted}
                        controls
                        playsInline
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.8 }}
                        style={{ width: '100%', display: 'block' }}
                    />
                </AnimatePresence>
            </div>
        </section>
    );
};

export default VideoSlider;
