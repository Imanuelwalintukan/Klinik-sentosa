import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Calendar, User, Clock, FileText, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCustomerAppointments } from '../services/api';
import type { Appointment } from '../types';

export const CustomerAppointments: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    useEffect(() => {
        fetchAppointments();
    }, []);

    useEffect(() => {
        if (statusFilter === 'ALL') {
            setFilteredAppointments(appointments);
        } else {
            setFilteredAppointments(appointments.filter((a) => a.status === statusFilter));
        }
    }, [statusFilter, appointments]);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const response = await getCustomerAppointments();
            setAppointments(response.data.data || []);
        } catch (error) {
            toast.error('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            PENDING: 'bg-status-warning/20 text-status-warning',
            CONFIRMED: 'bg-status-info/20 text-status-info',
            PATIENT_ARRIVED: 'bg-primary-main/20 text-primary-light',
            COMPLETED: 'bg-status-success/20 text-status-success',
            CANCELLED: 'bg-status-error/20 text-status-error',
        };
        return styles[status] || 'bg-gray-500/20 text-gray-400';
    };

    const getStatusLabel = (status: string) => status.replace('_', ' ');

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-main mx-auto mb-4" />
                    <p className="text-text-white">Loading appointments...</p>
                </div>
            </div>
        );
    }

    const upcomingCount = appointments.filter((a) => ['PENDING', 'CONFIRMED', 'PATIENT_ARRIVED'].includes(a.status)).length;
    const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;
    const cancelledCount = appointments.filter((a) => a.status === 'CANCELLED').length;

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-text-white">My Appointments</h1>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <p className="text-text-muted text-sm">Total</p>
                    <p className="text-2xl font-bold text-text-white">{appointments.length}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-text-muted text-sm">Upcoming</p>
                    <p className="text-2xl font-bold text-status-info">{upcomingCount}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-text-muted text-sm">Completed</p>
                    <p className="text-2xl font-bold text-status-success">{completedCount}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-text-muted text-sm">Cancelled</p>
                    <p className="text-2xl font-bold text-status-error">{cancelledCount}</p>
                </Card>
            </div>

            {/* Filter */}
            <Card className="p-4">
                <div className="flex items-center space-x-4">
                    <Filter className="h-5 w-5 text-text-muted" />
                    <div className="flex space-x-2 flex-wrap">
                        {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((status) => (
                            <Button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                variant={statusFilter === status ? 'primary' : 'outline'}
                                size="sm"
                            >
                                {status}
                            </Button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Appointments List */}
            {filteredAppointments.length === 0 ? (
                <Card className="p-12 text-center">
                    <Calendar className="h-24 w-24 text-text-muted mx-auto mb-4 opacity-50" />
                    <h2 className="text-2xl font-bold text-text-white mb-2">No Appointments Found</h2>
                    <p className="text-text-muted">
                        {statusFilter === 'ALL' ? "You don't have any appointments yet." : `No ${statusFilter.toLowerCase()} appointments.`}
                    </p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredAppointments.map((appointment) => (
                        <Card key={appointment.id} className="p-6 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center">
                                    <div className="bg-primary-main/20 rounded-full p-3 mr-4">
                                        <Calendar className="h-6 w-6 text-primary-light" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-text-white">
                                            {new Date(appointment.scheduledAt).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </h3>
                                        <p className="text-text-muted">
                                            {new Date(appointment.scheduledAt).toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(appointment.status)}`}>
                                    {getStatusLabel(appointment.status)}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-start">
                                    <User className="h-5 w-5 text-primary-main mr-2 mt-0.5" />
                                    <div>
                                        <p className="text-text-muted text-sm">Doctor</p>
                                        <p className="text-text-white font-medium">
                                            {appointment.doctor?.user?.name || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {appointment.queueNumber && (
                                    <div className="flex items-start">
                                        <Clock className="h-5 w-5 text-primary-main mr-2 mt-0.5" />
                                        <div>
                                            <p className="text-text-muted text-sm">Queue Number</p>
                                            <p className="text-text-white font-medium">#{appointment.queueNumber}</p>
                                        </div>
                                    </div>
                                )}

                                {appointment.complaint && (
                                    <div className="flex items-start md:col-span-2">
                                        <FileText className="h-5 w-5 text-primary-main mr-2 mt-0.5" />
                                        <div>
                                            <p className="text-text-muted text-sm">Complaint</p>
                                            <p className="text-text-white">{appointment.complaint}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
