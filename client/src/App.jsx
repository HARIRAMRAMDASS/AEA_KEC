import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Events from './components/Events';
import RegistrationForm from './components/RegistrationForm';

function App() {
    return (
        <div className="min-h-screen bg-primary text-textLight">
            <Navbar />
            <Hero />
            <Events />
            <RegistrationForm />

            <footer className="bg-secondary py-8 text-center text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} AEA_KEC. All rights reserved.</p>
                <p className="mt-2">Designed for Future Engineers.</p>
            </footer>
        </div>
    );
}

export default App;
