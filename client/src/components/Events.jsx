import React from 'react';
import { motion } from 'framer-motion';

const eventsList = [
    {
        id: 'autoexpo',
        title: 'Auto Expo',
        description: 'Showcasing the latest advancements in automotive technology. Witness the future of mobility.',
        color: 'from-blue-500 to-purple-600',
        icon: '🚗'
    },
    {
        id: 'zhakra',
        title: 'Zhakra',
        description: 'A high-octane technical symposium. Competitions, workshops, and more.',
        color: 'from-red-500 to-orange-600',
        icon: '⚡'
    },
    {
        id: 'autonix',
        title: 'Autonix',
        description: 'Robotics and automation challenge. Build, code, and conquer.',
        color: 'from-green-500 to-teal-600',
        icon: '🤖'
    }
];

const Events = () => {
    return (
        <div id="events" className="py-20 px-6 bg-secondary">
            <h2 className="text-4xl font-bold text-center mb-16 text-white">Our Main Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {eventsList.map((event, index) => (
                    <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2, duration: 0.5 }}
                        className="bg-primary rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-800 relative overflow-hidden group"
                    >
                        <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${event.color}`}></div>
                        <div className="text-6xl mb-6">{event.icon}</div>
                        <h3 className="text-2xl font-bold mb-4">{event.title}</h3>
                        <p className="text-gray-400 leading-relaxed mb-6">
                            {event.description}
                        </p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Events;
