import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Users, Calendar, Stethoscope, Pill, CreditCard, ClipboardList,
    LogOut, ChevronLeft, ClipboardCheck
} from 'lucide-react';
import { Button } from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarLink {
    to: string;
    label: string;
    icon: React.ElementType;
    roles: string[];
}

const sidebarVariants = {
    expanded: { width: '16rem' },
    collapsed: { width: '5rem' }
};

const navLinkContainerVariants = {
    expanded: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } },
    collapsed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
};

const navLinkVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -20 }
};

export const Sidebar: React.FC = () => {
    const { user, logout } = useAuth();
    const [isExpanded, setIsExpanded] = useState(true);
    const location = useLocation();

    const links: SidebarLink[] = [
        { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'DOCTOR', 'PHARMACIST', 'STAFF', 'CUSTOMER'] },
        { to: '/patients', label: 'Patients', icon: Users, roles: ['ADMIN', 'STAFF', 'DOCTOR'] },
        { to: '/appointments', label: 'Appointments', icon: Calendar, roles: ['ADMIN', 'STAFF', 'DOCTOR'] },
        { to: '/pharmacy', label: 'Pharmacy', icon: Pill, roles: ['ADMIN', 'PHARMACIST'] },
        { to: '/payments', label: 'Payments', icon: CreditCard, roles: ['ADMIN', 'STAFF'] },
        { to: '/inventory', label: 'Inventory', icon: ClipboardCheck, roles: ['ADMIN', 'PHARMACIST'] },
        { to: '/customer/queue', label: 'My Queue', icon: ClipboardList, roles: ['CUSTOMER'] },
        { to: '/customer/appointments', label: 'My Appointments', icon: Calendar, roles: ['CUSTOMER'] },
        { to: '/customer/prescriptions', label: 'My Prescriptions', icon: Pill, roles: ['CUSTOMER'] },
        { to: '/customer/payments', label: 'My Payments', icon: CreditCard, roles: ['CUSTOMER'] },
        { to: '/customer/profile', label: 'My Profile', icon: Users, roles: ['CUSTOMER'] },
        { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard, roles: ['ADMIN'] },
        { to: '/admin/users', label: 'User Management', icon: Users, roles: ['ADMIN'] },
        { to: '/admin/doctors', label: 'Doctor Management', icon: Stethoscope, roles: ['ADMIN'] },
        { to: '/admin/payment-reports', label: 'Payment Reports', icon: CreditCard, roles: ['ADMIN'] },
        { to: '/admin/system-logs', label: 'System Logs', icon: ClipboardList, roles: ['ADMIN'] },
    ];

    const filteredLinks = links.filter(link => user && link.roles.includes(user.role));

    return (
        <motion.div
            variants={sidebarVariants}
            animate={isExpanded ? 'expanded' : 'collapsed'}
            transition={{ duration: 0.4, ease: [0.42, 0, 0.58, 1] }}
            className="flex flex-col bg-bg-card backdrop-blur-xl text-text-default h-screen shadow-2xl shadow-black/25 relative border-r border-white/10 z-50"
        >
            <div className="p-4 border-b border-white/10 flex items-center justify-between h-16">
                <AnimatePresence>
                    {isExpanded && (
                        <motion.h1
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
                            exit={{ opacity: 0, x: -10 }}
                            className="text-xl font-bold text-primary-light whitespace-nowrap tracking-tight"
                        >
                            Klinik Sentosa
                        </motion.h1>
                    )}
                </AnimatePresence>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="rounded-full hover:bg-white/10 text-text-muted hover:text-text-white"
                >
                    <motion.div animate={{ rotate: isExpanded ? 0 : 180 }} transition={{ duration: 0.3 }}>
                        <ChevronLeft className="h-5 w-5" />
                    </motion.div>
                </Button>
            </div>

            <motion.nav
                variants={navLinkContainerVariants}
                initial="collapsed"
                animate="expanded"
                className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar"
            >
                {filteredLinks.map((link) => {
                    const isActive = location.pathname === link.to;
                    return (
                        <motion.div key={link.to} variants={navLinkVariants}>
                            <NavLink to={link.to}>
                                <motion.div
                                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                                    className={`flex items-center group relative rounded-lg transition-colors
                                        ${isExpanded ? 'px-4 py-2.5' : 'justify-center w-10 h-10 mx-auto'}`
                                    }
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-sidebar-link"
                                            className="absolute inset-0 bg-primary-main/20 border border-primary-main/30 rounded-lg shadow-[0_0_15px_rgba(13,148,136,0.2)]"
                                            initial={false}
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <span className={`relative z-10 ${isExpanded ? 'mr-3' : 'mr-0'} ${isActive ? 'text-primary-light' : 'text-text-muted group-hover:text-text-white'}`}>
                                        <link.icon className="h-5 w-5" />
                                    </span>
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.span
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: 'auto', transition: { delay: 0.2 } }}
                                                exit={{ opacity: 0, width: 0 }}
                                                className={`relative z-10 whitespace-nowrap font-medium ${isActive ? 'text-text-white' : 'text-text-default group-hover:text-text-white'}`}
                                            >
                                                {link.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </NavLink>
                        </motion.div>
                    );
                })}
            </motion.nav>

            <div className="p-4 border-t border-white/10">
                <Button
                    variant="ghost"
                    onClick={logout}
                    className={`flex items-center w-full rounded-lg transition-colors
                        ${isExpanded ? 'px-4 py-2' : 'justify-center w-10 h-10 mx-auto'}
                        text-status-error hover:bg-status-error/10 hover:text-red-400`}
                >
                    <LogOut className={`${isExpanded ? 'mr-3' : 'mr-0'} h-5 w-5`} />
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto', transition: { delay: 0.2 } }}
                                exit={{ opacity: 0, width: 0 }}
                                className="whitespace-nowrap font-medium"
                            >
                                Logout
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Button>
            </div>
        </motion.div>
    );
};
