// Completed by Antigravity AI — Frontend Completion

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Table } from '../components/ui/Table';
import { Card } from '../components/ui/Card';

import api from '../services/api';
import toast from 'react-hot-toast';
import type { Appointment } from '../types';

export const Appointments: React.FC = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAppointments();
    }, [selectedDate]);

    const loadAppointments = async () => {
        try {
            const response = await api.get(`/appointments?date=${selectedDate}`);
            setAppointments(response.data.data || []);
        } catch (error) {
            toast.error('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            await api.put(`/appointments/${id}`, { status });
            toast.success('Appointment updated');
            loadAppointments();
        } catch (error) {
            toast.error('Failed to update appointment');
        }
    };

    const columns = [
        { header: 'Patient', accessor: (a: Appointment) => a.patient?.name || '-' },
        { header: 'Doctor', accessor: (a: Appointment) => a.doctor?.user?.name || '-' },
        { header: 'Time', accessor: (a: Appointment) => new Date(a.scheduledAt).toLocaleTimeString() },
        { header: 'Complaint', accessor: 'complaint' as keyof Appointment },
        {
            header: 'Status',
            accessor: (a: Appointment) => (
                <span
                    className={`px-2 py-1 text-xs rounded-full ${a.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : a.status === 'CONFIRMED'
                            ? 'bg-blue-100 text-blue-800'
                            : a.status === 'CANCELLED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                        }`}
                >
                    {a.status}
                </span>
            ),
        },
        {
            header: 'Actions',
            accessor: (a: Appointment) => (
                <div className="flex gap-2">
                    {a.status === 'PENDING' && (
                        <Button size="sm" onClick={() => handleStatusUpdate(a.id, 'CONFIRMED')}>
                            Confirm
                        </Button>
                    )}
                    {a.status === 'CONFIRMED' && (
                        <Button size="sm" onClick={() => navigate(`/examination/${a.id}`)}>
                            Examine
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    if (loading) {
        return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
                <Button onClick={() => navigate('/appointments/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Appointment
                </Button>
            </div>

            <Card>
                <div className="mb-4 flex items-center gap-4">
                    <CalendarIcon className="h-5 w-5 text-gray-500" />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="rounded-md border border-gray-300 px-3 py-2"
                    />
                </div>

                <Table
                    data={appointments}
                    columns={columns}
                    keyExtractor={(a) => a.id}
                />
            </Card>
        </div>
    );
};
