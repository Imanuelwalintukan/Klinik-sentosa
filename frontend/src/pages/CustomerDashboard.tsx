import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Calendar, Clock, FileText, CreditCard, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCustomerQueue, getCustomerAppointments, getCustomerPrescriptions, getCustomerPayments } from '../services/api';
import { CustomerQueue as CustomerQueueType, Appointment, Prescription, Payment } from '../types';

export const CustomerDashboard: React.FC = () => {
    const [queueData, setQueueData] = useState<CustomerQueueType | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [queueRes, appointmentsRes, prescriptionsRes, paymentsRes] = await Promise.all([
                getCustomerQueue().catch(() => ({ data: { data: null } })),
                getCustomerAppointments(),
                getCustomerPrescriptions(),
                getCustomerPayments(),
            ]);

            setQueueData(queueRes.data.data);
            setAppointments(appointmentsRes.data.data || []);
            setPrescriptions(prescriptionsRes.data.data || []);
            setPayments(paymentsRes.data.data || []);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-main mx-auto mb-4"></div>
                    <p className="text-text-white">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    const upcomingAppointments = appointments.filter(a =>
        ['PENDING', 'CONFIRMED', 'PATIENT_ARRIVED'].includes(a.status)
    );
    const pendingPayments = payments.filter(p => p.status === 'PENDING');

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-text-white">My Dashboard</h1>

            {/* Queue Status Card */}
            {queueData && (
                <Card className="p-6 bg-gradient-to-r from-primary-main/20 to-primary-light/20 border border-primary-main/30">
                    <div className="flex items-center mb-4">
                        <Activity className="h-8 w-8 text-primary-light mr-3" />
                        <h2 className="text-2xl font-bold text-text-white">Current Queue Status</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <p className="text-text-muted mb-2">Your Queue Number</p>
                            <p className="text-5xl font-bold text-primary-light">{queueData.queueNumber}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-text-muted mb-2">Position in Queue</p>
                            <p className="text-5xl font-bold text-text-white">{queueData.position}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-text-muted mb-2">Estimated Wait</p>
                            <p className="text-5xl font-bold text-secondary-main">{queueData.estimatedWaitTime} min</p>
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-white/10">
                        <p className="text-text-default"><span className="font-semibold">Doctor:</span> {queueData.appointment.doctor?.user.name}</p>
                        <p className="text-text-muted"><span className="font-semibold">Scheduled:</span> {new Date(queueData.appointment.scheduledAt).toLocaleString()}</p>
                    </div>
                </Card>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-text-muted mb-1">Total Appointments</p>
                            <p className="text-3xl font-bold text-text-white">{appointments.length}</p>
                        </div>
                        <Calendar className="h-12 w-12 text-primary-main opacity-80" />
                    </div>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-text-muted mb-1">Upcoming</p>
                            <p className="text-3xl font-bold text-text-white">{upcomingAppointments.length}</p>
                        </div>
                        <Clock className="h-12 w-12 text-secondary-main opacity-80" />
                    </div>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-text-muted mb-1">Prescriptions</p>
                            <p className="text-3xl font-bold text-text-white">{prescriptions.length}</p>
                        </div>
                        <FileText className="h-12 w-12 text-status-info opacity-80" />
                    </div>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-text-muted mb-1">Pending Payments</p>
                            <p className="text-3xl font-bold text-text-white">{pendingPayments.length}</p>
                        </div>
                        <CreditCard className="h-12 w-12 text-status-warning opacity-80" />
                    </div>
                </Card>
            </div>

            {/* Recent Appointments */}
            <Card className="p-6">
                <h2 className="text-xl font-bold text-text-white mb-4 flex items-center">
                    <Calendar className="h-6 w-6 mr-2 text-primary-main" />
                    Recent Appointments
                </h2>
                {appointments.length === 0 ? (
                    <p className="text-text-muted text-center py-8">No appointments yet</p>
                ) : (
                    <div className="space-y-3">
                        {appointments.slice(0, 5).map((apt) => (
                            <div key={apt.id} className="flex justify-between items-center p-4 bg-bg-dark/30 rounded-lg hover:bg-bg-dark/50 transition-colors">
                                <div>
                                    <p className="text-text-white font-medium">{apt.doctor?.user.name || 'Doctor'}</p>
                                    <p className="text-text-muted text-sm">{new Date(apt.scheduledAt).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${apt.status === 'COMPLETED' ? 'bg-status-success/20 text-status-success' :
                                        apt.status === 'CANCELLED' ? 'bg-status-error/20 text-status-error' :
                                            'bg-status-info/20 text-status-info'
                                    }`}>
                                    {apt.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};
