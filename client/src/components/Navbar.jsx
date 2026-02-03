import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar = () => {
    return (
        <nav className="flex justify-between items-center p-6 bg-secondary sticky top-0 z-50 shadow-lg">
            <Link to="/">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-2xl font-bold text-accent tracking-wider cursor-pointer"
                >
                    AEA_KEC
                </motion.div>
            </Link>
            <div className="flex gap-6">
                <Link to="/" className="hover:text-accent transition-colors">Home</Link>
                <a href="#events" className="hover:text-accent transition-colors">Events</a>
                <a href="#register" className="bg-accent text-white px-4 py-2 rounded-full hover:bg-opacity-90 transition-all transform hover:scale-105">Register Now</a>
            </div>
        </nav>
    );
};

export default Navbar;
