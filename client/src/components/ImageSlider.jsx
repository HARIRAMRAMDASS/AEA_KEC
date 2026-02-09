import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';

const ImageSlider = () => {
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Use relative path '/api' in production (served by same backend) or fully qualified for local dev
    const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api');

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/bearers`);
                setImages(data);
            } catch (err) {
                console.error('Failed to fetch images', err);
            }
        };
        fetchImages();
    }, []);

    useEffect(() => {
        if (images.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [images]);

    const nextSlide = () => setCurrentIndex((currentIndex + 1) % images.length);
    const prevSlide = () => setCurrentIndex((currentIndex - 1 + images.length) % images.length);

    if (images.length === 0) return null;

    return (
        <section id="bearers" style={{ padding: '100px 5%', background: 'transparent', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '50px' }}>Office Bearers</h2>
            <div style={{ position: 'relative', maxWidth: '1000px', margin: '0 auto', height: '500px', overflow: 'hidden', borderRadius: '20px' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={images[currentIndex]._id}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.5 }}
                        style={{ width: '100%', height: '100%', position: 'relative' }}
                    >
                        <img
                            src={images[currentIndex].imageUrl}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                        <div style={{
                            position: 'absolute',
                            bottom: '0',
                            left: '0',
                            right: '0',
                            background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                            padding: '40px 20px 20px',
                            color: 'white'
                        }}>
                            <h3 style={{ margin: 0, color: 'var(--mercedes-green)' }}>{images[currentIndex].name}</h3>
                            <p style={{ margin: '5px 0 0', opacity: 0.8 }}>{images[currentIndex].year}</p>
                        </div>
                    </motion.div>
                </AnimatePresence>

                <button onClick={prevSlide} style={btnStyle('left')}><FiChevronLeft /></button>
                <button onClick={nextSlide} style={btnStyle('right')}><FiChevronRight /></button>
            </div>
        </section>
    );
};

const btnStyle = (side) => ({
    position: 'absolute',
    top: '50%',
    [side]: '20px',
    transform: 'translateY(-50%)',
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    color: 'white',
    padding: '15px',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '1.5rem',
    display: 'flex',
    backdropFilter: 'blur(5px)',
    transition: '0.3s'
});

export default ImageSlider;
