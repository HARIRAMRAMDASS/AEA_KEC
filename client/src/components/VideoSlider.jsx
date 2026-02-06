import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const VideoSlider = () => {
    const [videos, setVideos] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
        }, 5000); // Videos stay a bit longer
        return () => clearInterval(interval);
    }, [videos]);

    if (videos.length === 0) return null;

    return (
        <section style={{ padding: '100px 5%', background: '#FFFFFF', textAlign: 'center', color: '#000' }}>
            <h2 style={{ marginBottom: '50px', color: '#000' }}>Event Highlights</h2>
            <div style={{ position: 'relative', maxWidth: '1000px', margin: '0 auto', borderRadius: '20px', overflow: 'hidden' }}>
                <AnimatePresence mode="wait">
                    <motion.video
                        key={videos[currentIndex]._id}
                        src={videos[currentIndex].videoUrl}
                        autoPlay
                        muted
                        loop
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        style={{ width: '100%', height: 'auto', borderRadius: '20px' }}
                    />
                </AnimatePresence>
            </div>
        </section>
    );
};

export default VideoSlider;
