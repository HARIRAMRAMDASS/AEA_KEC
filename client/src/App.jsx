import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';
import Footer from './components/Footer';

import Home from './pages/Home';
import Registration from './pages/Registration';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Highlights from './pages/Highlights';

const Layout = ({ children }) => {
    return (
        <>
            <Navbar />
            {children}
            <Footer />
        </>
    );
};

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<Registration />} />
                    <Route path="/highlights" element={<Highlights />} />
                    <Route path="/admin-login" element={<AdminLogin />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                </Routes>
            </Layout>
            <ToastContainer
                position="bottom-right"
                theme="dark"
                toastStyle={{ background: '#0A0A0A', border: '1px solid #00A19B', color: 'white' }}
            />
        </Router>
    );
}

export default App;
