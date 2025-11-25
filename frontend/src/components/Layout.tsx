import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Toaster } from 'react-hot-toast';
import AnimatedBackground from './ui/AnimatedBackground';
import '../background.css';
import { AnimatePresence, motion } from 'framer-motion';
import { pageTransition } from '../lib/motion';

export const Layout: React.FC = () => {
    const location = useLocation();
    return (
        <div className="flex h-screen text-text-white">
            <AnimatedBackground />
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8 relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={pageTransition}
                        className="w-full h-full"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>
            <Toaster position="top-right" />
        </div>
    );
};
