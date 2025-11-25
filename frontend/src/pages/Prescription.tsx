// Completed by Antigravity AI — Frontend Completion

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import api from '../services/api';
import toast from 'react-hot-toast';
import type { MedicalRecord, Drug } from '../types/index';

export const Prescription: React.FC = () => {
    const { medicalRecordId } = useParams();
    const navigate = useNavigate();
    const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(null);
    const [drugs, setDrugs] = useState<Drug[]>([]);
    const [loading, setLoading] = useState(true);

    const { register, control, handleSubmit } = useForm({
        defaultValues: {
            items: [{ drugId: '', qty: 1, dosageInstructions: '' }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items',
    });

    useEffect(() => {
        loadData();
    }, [medicalRecordId]);

    const loadData = async () => {
        try {
            const [mrResponse, drugsResponse] = await Promise.all([
                api.get(`/medical-records/${medicalRecordId}`),
                api.get('/drugs'),
            ]);
            setMedicalRecord(mrResponse.data.data);
            setDrugs(drugsResponse.data.data || []);
        } catch (error) {
            toast.error('Failed to load data');
            navigate('/appointments');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: any) => {
        try {
            const items = data.items.map((item: any) => ({
                drugId: Number(item.drugId),
                qty: Number(item.qty),
                dosageInstructions: item.dosageInstructions,
            }));

            await api.post('/prescriptions', {
                medicalRecordId: Number(medicalRecordId),
                items,
            });

            toast.success('Prescription created successfully');
            navigate('/appointments');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to create prescription');
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Create Prescription</h1>

            <Card title="Patient Information">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Patient</p>
                        <p className="font-medium">{medicalRecord?.patient?.name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Diagnosis</p>
                        <p className="font-medium">{medicalRecord?.diagnosis}</p>
                    </div>
                </div>
            </Card>

            <Card title="Prescription Items">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-4 items-start p-4 bg-gray-50 rounded-md">
                            <div className="flex-1 space-y-4">
                                <Select
                                    label="Drug"
                                    {...register(`items.${index}.drugId`)}
                                    options={[
                                        { value: '', label: 'Select drug' },
                                        ...drugs.map((d) => ({
                                            value: d.id,
                                            label: `${d.name} (Stock: ${d.stockQty})`
                                        })),
                                    ]}
                                    required
                                />
                                <Input
                                    label="Quantity"
                                    type="number"
                                    {...register(`items.${index}.qty`)}
                                    min={1}
                                    required
                                />
                                <Input
                                    label="Dosage Instructions"
                                    {...register(`items.${index}.dosageInstructions`)}
                                    placeholder="e.g., 3x daily after meals"
                                    required
                                />
                            </div>
                            {fields.length > 1 && (
                                <Button
                                    type="button"
                                    variant="danger"
                                    size="sm"
                                    onClick={() => remove(index)}
                                    className="mt-6"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => append({ drugId: '', qty: 1, dosageInstructions: '' })}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Drug
                    </Button>

                    <div className="flex gap-2 justify-end pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/appointments')}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            Submit Prescription
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

