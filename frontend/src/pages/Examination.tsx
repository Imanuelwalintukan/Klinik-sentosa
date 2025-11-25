// Completed by Antigravity AI — Frontend Completion

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { Card } from '../components/ui/Card';
import api from '../services/api';
import toast from 'react-hot-toast';
import type { Appointment, MedicalRecord } from '../types/index';

export const Examination: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(null);
    const [loading, setLoading] = useState(true);

    const { register, handleSubmit } = useForm();

    useEffect(() => {
        loadAppointment();
    }, [id]);

    const loadAppointment = async () => {
        try {
            const response = await api.get(`/appointments/${id}`);
            setAppointment(response.data.data);

            // Check if medical record exists
            try {
                const mrResponse = await api.get(`/medical-records/appointment/${id}`);
                setMedicalRecord(mrResponse.data.data);
            } catch (error) {
                // No medical record yet
            }
        } catch (error) {
            toast.error('Failed to load appointment');
            navigate('/appointments');
        } finally {
            setLoading(false);
        }
    };

    const onSubmitMedicalRecord = async (data: any) => {
        try {
            const response = await api.post('/medical-records', {
                appointmentId: Number(id),
                patientId: appointment?.patientId,
                diagnosis: data.diagnosis,
                notes: data.notes,
            });
            setMedicalRecord(response.data.data);
            toast.success('Medical record saved');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to save medical record');
        }
    };

    const handleCreatePrescription = () => {
        navigate(`/prescription/${medicalRecord?.id}`);
    };

    if (loading) {
        return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Medical Examination</h1>

            {/* Patient Info */}
            <Card title="Patient Information">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium">{appointment?.patient?.name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">NIK</p>
                        <p className="font-medium">{appointment?.patient?.nik}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{appointment?.patient?.phone}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Birth Date</p>
                        <p className="font-medium">
                            {appointment?.patient?.birthDate && new Date(appointment.patient.birthDate).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-sm text-gray-600">Complaint</p>
                        <p className="font-medium">{appointment?.complaint || '-'}</p>
                    </div>
                </div>
            </Card>

            {/* Medical Record Form */}
            <Card title="Medical Record">
                {medicalRecord ? (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-600">Diagnosis</p>
                            <p className="font-medium">{medicalRecord.diagnosis}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Notes</p>
                            <p className="font-medium">{medicalRecord.notes || '-'}</p>
                        </div>
                        <Button onClick={handleCreatePrescription}>
                            Create Prescription
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmitMedicalRecord)} className="space-y-4">
                        <Textarea
                            label="Diagnosis"
                            {...register('diagnosis')}
                            placeholder="Enter diagnosis"
                            required
                        />
                        <Textarea
                            label="Notes (Optional)"
                            {...register('notes')}
                            placeholder="Enter additional notes"
                        />
                        <Button type="submit">Save Medical Record</Button>
                    </form>
                )}
            </Card>
        </div>
    );
};

