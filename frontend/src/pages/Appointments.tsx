// Completed by Antigravity AI — Frontend Completion

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Table } from '../components/ui/Table';
import { Card } from '../components/ui/Card';

import api from '../services/api';
import toast from 'react-hot-toast';
import type { Appointment } from '../types/index';

export const Appointments: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);
    const [doctorId, setDoctorId] = useState<number | undefined>(undefined);

    useEffect(() => {
        const fetchDoctorProfile = async () => {
            if (user?.role === 'DOCTOR') {
                try {
                    const response = await api.get('/doctors/profile');
                    // Assuming /doctors/profile returns the doctor object directly in data.data or similar
                    // Let's check the endpoint. If it's getDoctorByUserId, it returns the doctor object.
                    // If it uses standard response format: { success: true, data: { ... } }
                    setDoctorId(response.data.data.id);
                } catch (error) {
                    console.error('Failed to fetch doctor profile');
                }
            }
        };
        fetchDoctorProfile();
    }, [user]);

    useEffect(() => {
        loadAppointments();
    }, [selectedDate, doctorId]);

    const loadAppointments = async () => {
        try {
            let url = `/appointments?date=${selectedDate}`;
            if (doctorId) {
                url += `&doctorId=${doctorId}`;
            }
            const response = await api.get(url);
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
                            : a.status === 'PATIENT_ARRIVED'
                                ? 'bg-purple-100 text-purple-800'
                                : a.status === 'CANCELLED'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                        }`}
                >
                    {a.status.replace('_', ' ')}
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
                        <Button size="sm" onClick={() => handleStatusUpdate(a.id, 'PATIENT_ARRIVED')}>
                            Arrived
                        </Button>
                    )}
                    {(a.status === 'CONFIRMED' || a.status === 'PATIENT_ARRIVED') && (
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
                {user?.role !== 'DOCTOR' && (
                    <Button onClick={() => navigate('/appointments/new')}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Appointment
                    </Button>
                )}
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

