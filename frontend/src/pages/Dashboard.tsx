// Completed by Antigravity AI — Frontend Completion

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Users, Calendar, Pill, DollarSign, AlertTriangle, Stethoscope } from 'lucide-react';
import api from '../services/api';
import type { DashboardStats, Appointment, Drug } from '../types/index';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../lib/motion';

export const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({
        todayAppointments: 0,
        pendingPrescriptions: 0,
        lowStockDrugs: 0,
        pendingPayments: 0,
        totalPatients: 0,
        totalAppointments: 0,
        totalPrescriptions: 0,
        activeDoctors: 0,
        totalRevenue: 0,
    });
    const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
    const [lowStockDrugs, setLowStockDrugs] = useState<Drug[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            if (user?.role === 'ADMIN') {
                const [dashboardRes, appointmentsRes, drugsRes] = await Promise.all([
                    api.get('/admin/dashboard'),
                    api.get('/appointments'),
                    api.get('/drugs'),
                ]);

                const dashboard = dashboardRes.data.data as DashboardStats;
                const appointments = appointmentsRes.data.data || [];
                const drugs = drugsRes.data.data || [];

                setStats(dashboard);
                setRecentAppointments(appointments.slice(0, 5));

                const lowStock = drugs.filter((d: Drug) =>
                    d.minStock && d.stockQty < d.minStock
                );
                setLowStockDrugs(lowStock.slice(0, 5));
            } else {
                const [appointmentsRes, drugsRes, prescriptionsRes, paymentsRes] = await Promise.all([
                    api.get('/appointments'),
                    api.get('/drugs'),
                    api.get('/prescriptions').catch(() => ({ data: { data: [] } })),
                    api.get('/payments').catch(() => ({ data: { data: [] } })),
                ]);

                const appointments = appointmentsRes.data.data || [];
                const drugs = drugsRes.data.data || [];
                const prescriptions = prescriptionsRes.data.data || [];
                const payments = paymentsRes.data.data || [];

                const today = new Date().toISOString().split('T')[0];
                const todayAppts = appointments.filter((a: Appointment) =>
                    a.scheduledAt.startsWith(today)
                );

                const lowStock = drugs.filter((d: Drug) =>
                    d.minStock && d.stockQty < d.minStock
                );

                // Count pending prescriptions (PENDING or PREPARED status)
                const pendingPrescriptions = prescriptions.filter((p: any) =>
                    p.status === 'PENDING' || p.status === 'PREPARED'
                );

                // Count pending payments
                const pendingPayments = payments.filter((p: any) =>
                    p.status === 'PENDING'
                );

                setStats((prev) => ({
                    ...prev,
                    todayAppointments: todayAppts.length,
                    lowStockDrugs: lowStock.length,
                    pendingPrescriptions: pendingPrescriptions.length,
                    pendingPayments: pendingPayments.length,
                }));

                setRecentAppointments(appointments.slice(0, 5));
                setLowStockDrugs(lowStock.slice(0, 5));
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = user?.role === 'ADMIN'
        ? [
            {
                title: 'Total Patients',
                value: stats.totalPatients ?? 0,
                icon: Users,
                color: 'text-primary-main',
                bgColor: 'bg-primary-main/20',
            },
            {
                title: 'Today\'s Appointments',
                value: stats.todayAppointments,
                icon: Calendar,
                color: 'text-accent-teal',
                bgColor: 'bg-accent-teal/20',
            },
            {
                title: 'Total Revenue',
                value: `Rp ${Number(stats.totalRevenue || 0).toLocaleString()}`,
                icon: DollarSign,
                color: 'text-accent-cyan',
                bgColor: 'bg-accent-cyan/20',
            },
            {
                title: 'Active Doctors',
                value: stats.activeDoctors ?? 0,
                icon: Stethoscope,
                color: 'text-primary-light',
                bgColor: 'bg-primary-light/20',
            },
            {
                title: 'Low Stock Drugs',
                value: stats.lowStockDrugs,
                icon: AlertTriangle,
                color: 'text-status-warning',
                bgColor: 'bg-status-warning/20',
            },
        ]
        : [
            {
                title: 'Today\'s Appointments',
                value: stats.todayAppointments,
                icon: Calendar,
                color: 'text-primary-main',
                bgColor: 'bg-primary-main/20',
            },
            {
                title: 'Pending Prescriptions',
                value: stats.pendingPrescriptions,
                icon: Pill,
                color: 'text-accent-teal',
                bgColor: 'bg-accent-teal/20',
            },
            {
                title: 'Low Stock Drugs',
                value: stats.lowStockDrugs,
                icon: AlertTriangle,
                color: 'text-status-warning',
                bgColor: 'bg-status-warning/20',
            },
            {
                title: 'Pending Payments',
                value: stats.pendingPayments,
                icon: DollarSign,
                color: 'text-accent-cyan',
                bgColor: 'bg-accent-cyan/20',
            },
        ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-main"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-text-white">Dashboard</h1>
                <p className="text-text-white">Welcome back, {user?.name}</p>
            </div>

            {/* Stats Grid */}
            <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                {statCards.map((stat) => (
                    <motion.div key={stat.title} variants={staggerItem}>
                        <Card>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-text-white">{stat.title}</p>
                                    <p className="text-2xl font-bold text-text-white mt-1">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Recent Activity */}
            <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
                <motion.div variants={staggerItem}>
                    <Card title="Recent Appointments">
                        {recentAppointments.length === 0 ? (
                            <p className="text-text-muted text-center py-4">No recent appointments</p>
                        ) : (
                            <div className="space-y-3">
                                {recentAppointments.map((appointment) => (
                                    <motion.div
                                        key={appointment.id}
                                        className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-lg rounded-md"
                                        variants={staggerItem}
                                        whileHover={{ scale: 1.02, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)' }}
                                    >
                                        <div>
                                            <p className="font-medium text-text-white">
                                                {appointment.patient?.name || 'Unknown Patient'}
                                            </p>
                                            <p className="text-sm text-text-white">
                                                {new Date(appointment.scheduledAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full ${appointment.status === 'COMPLETED'
                                                ? 'bg-status-success/20 text-status-success'
                                                : appointment.status === 'CONFIRMED'
                                                    ? 'bg-accent-info/20 text-accent-info'
                                                    : 'bg-status-warning/20 text-status-warning'
                                                }`}
                                        >
                                            {appointment.status}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </Card>
                </motion.div>

                <motion.div variants={staggerItem}>
                    <Card title="Low Stock Alerts">
                        {lowStockDrugs.length === 0 ? (
                            <p className="text-text-muted text-center py-4">All drugs are well stocked</p>
                        ) : (
                            <div className="space-y-3">
                                {lowStockDrugs.map((drug) => (
                                    <motion.div
                                        key={drug.id}
                                        className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-lg rounded-md"
                                        variants={staggerItem}
                                        whileHover={{ scale: 1.02, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)' }}
                                    >
                                        <div>
                                            <p className="font-medium text-text-white">{drug.name}</p>
                                            <p className="text-sm text-text-white">SKU: {drug.sku}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-status-error">
                                                {drug.stockQty} left
                                            </p>
                                            <p className="text-xs text-text-white">
                                                Min: {drug.minStock}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    );
};
