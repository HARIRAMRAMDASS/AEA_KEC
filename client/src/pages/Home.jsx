import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import ImageSlider from '../components/ImageSlider';
import VideoSlider from '../components/VideoSlider';
import LoadingScreen from '../components/LoadingScreen';
import axios from 'axios';

const Home = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [events, setEvents] = useState([]);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 2000);
        fetchEvents();
        return () => clearTimeout(timer);
    }, []);

    const fetchEvents = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/events`);
            setEvents(data);
        } catch (err) {
            console.error('Failed to fetch events');
        }
    };

    if (isLoading) return <LoadingScreen />;

    return (
        <main>
            <Hero />

            <section style={{ padding: '100px 5%', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '50px' }}>The Department</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', alignItems: 'center' }}>
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                    >
                        <p style={{ fontSize: '1.2rem', color: '#ccc', textAlign: 'left' }}>
                            The Automobile Engineering Association (AEA) at Kongu Engineering College is a premier hub for automotive enthusiasts.
                            We bridge the gap between academic theory and industry reality through workshops, symposia, and high-octane events.
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                    >
                        <div className="glass-card" style={{ padding: '40px' }}>
                            <h3 style={{ color: 'var(--mercedes-green)', marginBottom: '20px' }}>Engineered for Excellence</h3>
                            <p style={{ opacity: 0.8 }}>From Formula Student challenges to cutting-edge EV research, AEA is where the future of mobility is shaped.</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            <div id="bearers">
                <ImageSlider />
                <VideoSlider />
            </div>

            <section id="events" style={{ padding: '100px 5%', textAlign: 'center', background: 'linear-gradient(to bottom, #0A0A0A, #000)' }}>
                <h2 style={{ marginBottom: '50px' }}>Active Events</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                    {events.map(ev => (
                        <motion.div
                            key={ev._id}
                            whileHover={{ y: -10 }}
                            className="glass-card"
                            style={{ textAlign: 'left', border: '1px solid rgba(0, 161, 155, 0.2)' }}
                        >
                            <span style={{ background: 'var(--mercedes-green)', color: '#000', padding: '5px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>{ev.type}</span>
                            <h3 style={{ marginTop: '15px' }}>{ev.name}</h3>
                            <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>Date: {new Date(ev.date).toLocaleDateString()}</p>
                            <p style={{ margin: '20px 0', fontSize: '1.1rem' }}>Entry: {'\u20B9'}{ev.feeAmount}</p>
                            <a href="/register" className="btn-primary" style={{ width: '100%' }}>Register Now</a>
                        </motion.div>
                    ))}
                    {events.length === 0 && <p style={{ opacity: 0.5 }}>Currently no grid slots available. Stay tuned.</p>}
                </div>
            </section>
        </main>
    );
};

export default Home;
