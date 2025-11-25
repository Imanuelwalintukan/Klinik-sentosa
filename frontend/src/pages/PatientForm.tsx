// Completed by Antigravity AI — Frontend Completion

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Card } from '../components/ui/Card';
import api from '../services/api';
import toast from 'react-hot-toast';

const patientSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    nik: z.string().length(16, 'NIK must be 16 characters'),
    phone: z.string().min(10, 'Phone number is required'),
    address: z.string().min(1, 'Address is required'),
    birthDate: z.string().min(1, 'Birth date is required'),
});

type PatientFormData = z.infer<typeof patientSchema>;

export const PatientForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const isEdit = Boolean(id);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PatientFormData>({
        resolver: zodResolver(patientSchema),
    });

    useEffect(() => {
        if (isEdit) {
            loadPatient();
        }
    }, [id]);

    const loadPatient = async () => {
        try {
            const response = await api.get(`/patients/${id}`);
            const patient = response.data.data;
            reset({
                ...patient,
                birthDate: patient.birthDate.split('T')[0],
            });
        } catch (error) {
            toast.error('Failed to load patient');
            navigate('/patients');
        }
    };

    const onSubmit = async (data: PatientFormData) => {
        setLoading(true);
        try {
            if (isEdit) {
                await api.put(`/patients/${id}`, data);
                toast.success('Patient updated successfully');
            } else {
                await api.post('/patients', data);
                toast.success('Patient created successfully');
            }
            navigate('/patients');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to save patient');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    {isEdit ? 'Edit Patient' : 'Add New Patient'}
                </h1>
            </div>

            <Card>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Full Name"
                        {...register('name')}
                        error={errors.name?.message}
                        placeholder="Enter patient name"
                    />

                    <Input
                        label="NIK (16 digits)"
                        {...register('nik')}
                        error={errors.nik?.message}
                        placeholder="Enter NIK"
                        maxLength={16}
                    />

                    <Input
                        label="Phone Number"
                        {...register('phone')}
                        error={errors.phone?.message}
                        placeholder="Enter phone number"
                    />

                    <Textarea
                        label="Address"
                        {...register('address')}
                        error={errors.address?.message}
                        placeholder="Enter address"
                    />

                    <Input
                        label="Birth Date"
                        type="date"
                        {...register('birthDate')}
                        error={errors.birthDate?.message}
                    />

                    <div className="flex gap-2 justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/patients')}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};
