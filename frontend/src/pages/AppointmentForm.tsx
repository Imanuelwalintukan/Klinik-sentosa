// Completed by Antigravity AI — Frontend Completion

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Card } from '../components/ui/Card';
import api from '../services/api';
import toast from 'react-hot-toast';
import type { Patient, Doctor } from '../types/index';

const appointmentSchema = z.object({
    patientId: z.coerce.number().min(1, 'Patient is required'),
    doctorId: z.coerce.number().min(1, 'Doctor is required'),
    scheduledAt: z.string().min(1, 'Date and time is required'),
    complaint: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

export const AppointmentForm: React.FC = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<AppointmentFormData>({
        resolver: zodResolver(appointmentSchema) as any,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [patientsRes, doctorsRes] = await Promise.all([
                api.get('/patients'),
                api.get('/doctors', { params: { limit: 1000 } }), // Fetch all doctors without pagination limit
            ]);
            setPatients(patientsRes.data.data || []);
            // Fix: Handle both array and paginated object response
            const doctorsData = doctorsRes.data.data;
            const doctorsList = Array.isArray(doctorsData) ? doctorsData : (doctorsData?.doctors || []);
            setDoctors(doctorsList);
        } catch (error) {
            toast.error('Failed to load data');
        }
    };

    const onSubmit = async (data: AppointmentFormData) => {
        setLoading(true);
        try {
            await api.post('/appointments', data);
            toast.success('Appointment created successfully');
            navigate('/appointments');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to create appointment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">New Appointment</h1>

            <Card>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Select
                        label="Patient"
                        {...register('patientId')}
                        error={errors.patientId?.message}
                        options={[
                            { value: '', label: 'Select patient' },
                            ...patients.map((p) => ({ value: p.id, label: `${p.name} (${p.nik})` })),
                        ]}
                    />

                    <Select
                        label="Doctor"
                        {...register('doctorId')}
                        error={errors.doctorId?.message}
                        options={[
                            { value: '', label: 'Select doctor' },
                            ...doctors.map((d) => ({ value: d.id, label: d.user?.name || `Doctor #${d.id}` })),
                        ]}
                    />

                    <Input
                        label="Date & Time"
                        type="datetime-local"
                        {...register('scheduledAt')}
                        error={errors.scheduledAt?.message}
                    />

                    <Textarea
                        label="Complaint (Optional)"
                        {...register('complaint')}
                        error={errors.complaint?.message}
                        placeholder="Enter patient complaint"
                    />

                    <div className="flex gap-2 justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/appointments')}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Appointment'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};
