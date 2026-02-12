import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import ImageSlider from '../components/ImageSlider';
import VideoSlider from '../components/VideoSlider';
import LoadingScreen from '../components/LoadingScreen';
import axios from 'axios';

const Home = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [events, setEvents] = useState([]);

    const API_URL = '/api';

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

            <section className="section-padding" style={{ textAlign: 'center' }}>
                <h2 className="section-title">The Department</h2>
                <div className="department-grid">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                    >
                        <p className="department-text-left" style={{ fontSize: '1.2rem', color: '#ccc' }}>
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

            <section id="events" className="section-padding" style={{ textAlign: 'center', background: 'linear-gradient(to bottom, #0A0A0A, #000)' }}>
                <h2 className="section-title">Active Events</h2>
                <div className="events-grid">
                    {events.map(ev => (
                        <motion.div
                            key={ev._id}
                            whileHover={{ y: -10 }}
                            className="glass-card"
                            style={{ textAlign: 'left', border: '1px solid rgba(0, 161, 155, 0.2)' }}
                        >
                            <span style={{ background: 'var(--mercedes-green)', color: '#000', padding: '5px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>{ev.type}</span>
                            <h3 className="text-box" style={{ marginTop: '15px' }}>{ev.name}</h3>
                            <p className="text-box" style={{ margin: '10px 0', fontSize: '0.85rem', opacity: 0.9, color: '#eee', lineHeight: '1.4' }}>{ev.description}</p>
                            <p style={{ opacity: 0.6, fontSize: '0.8rem' }}>Date: {new Date(ev.date).toLocaleDateString()}</p>
                            <p style={{ margin: '10px 0', fontSize: '1.1rem' }}>Entry: {'\u20B9'}{ev.feeAmount}</p>
                            <p style={{ marginBottom: '20px', fontSize: '0.8rem', color: new Date() > new Date(ev.closingDate) ? '#ff4d4d' : 'var(--mercedes-green)', fontWeight: 'bold' }}>
                                {new Date() > new Date(ev.closingDate) ? 'REGISTRATION CLOSED' : `Closes: ${new Date(ev.closingDate).toLocaleDateString()} - ${new Date(ev.closingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                            </p>
                            <Link
                                to={`/register?eventId=${ev._id}`}
                                className="btn-primary"
                                style={{
                                    display: 'block',
                                    textAlign: 'center',
                                    textDecoration: 'none',
                                    width: '100%',
                                    opacity: new Date() > new Date(ev.closingDate) ? 0.5 : 1,
                                    pointerEvents: new Date() > new Date(ev.closingDate) ? 'none' : 'auto'
                                }}
                            >
                                {new Date() > new Date(ev.closingDate) ? 'Closed' : 'Register Now'}
                            </Link>
                        </motion.div>
                    ))}
                    {events.length === 0 && <p style={{ opacity: 0.5 }}>Currently no grid slots available. Stay tuned.</p>}
                </div>
            </section>
        </main>
    );
};

export default Home;
