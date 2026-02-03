import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
    return (
        <div className="h-screen flex flex-col justify-center items-center text-center px-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary opacity-80 z-10"></div>
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-accent rounded-full blur-[150px]"></div>
                <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] bg-highlight rounded-full blur-[120px]"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="z-20 max-w-4xl"
            >
                <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Automobile Engineering Association
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 mb-10">
                    Fueling Innovation. Driving the Future.
                </p>
                <div className="flex gap-4 justify-center">
                    <a href="#events" className="border border-accent text-accent px-8 py-3 rounded-full hover:bg-accent hover:text-white transition-all duration-300">
                        Explore Events
                    </a>
                    <a href="#register" className="bg-accent text-white px-8 py-3 rounded-full hover:bg-opacity-90 shadow-lg hover:shadow-accent/50 transition-all duration-300">
                        Register
                    </a>
                </div>
            </motion.div>
        </div>
    );
};

export default Hero;
