import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const VideoSlider = ({ muted = true }) => {
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
        if (videos.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % videos.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [videos]);

    if (videos.length === 0) return null;

    return (
        <section className="section-padding" style={{ background: '#FFFFFF', textAlign: 'center', color: '#000' }}>
            <h2 className="section-title" style={{ color: '#000' }}>Event Highlights</h2>
            <div className="video-slider-container">
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
