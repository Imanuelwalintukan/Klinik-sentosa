// Completed by Antigravity AI — Frontend Completion

import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Table } from '../components/ui/Table';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import api from '../services/api';
import toast from 'react-hot-toast';
import type { Prescription } from '../types/index';

export const Pharmacy: React.FC = () => {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPrescriptions();
    }, []);

    const loadPrescriptions = async () => {
        try {
            const response = await api.get('/prescriptions?status=PENDING,PREPARED');
            setPrescriptions(response.data.data || []);
        } catch (error) {
            toast.error('Failed to load prescriptions');
        } finally {
            setLoading(false);
        }
    };

    const handlePrepare = (prescription: Prescription) => {
        setSelectedPrescription(prescription);
        setShowModal(true);
    };

    const handleDispense = async () => {
        if (!selectedPrescription) return;

        try {
            // Determine next status based on current status
            const nextStatus = selectedPrescription.status === 'PENDING' ? 'PREPARED' : 'DISPENSED';

            await api.put(`/prescriptions/${selectedPrescription.id}/status`, { status: nextStatus });
            toast.success(`Prescription ${nextStatus.toLowerCase()} successfully`);
            setShowModal(false);
            loadPrescriptions();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to update prescription');
        }
    };

    const columns = [
        { header: 'Patient', accessor: (p: Prescription) => p.medicalRecord?.appointment?.patient?.name || '-' },
        { header: 'Doctor', accessor: (p: Prescription) => p.doctor?.user?.name || '-' },
        { header: 'Date', accessor: (p: Prescription) => new Date(p.createdAt).toLocaleDateString() },
        {
            header: 'Status',
            accessor: (p: Prescription) => (
                <span
                    className={`px-2 py-1 text-xs rounded-full ${p.status === 'DISPENSED'
                        ? 'bg-green-100 text-green-800'
                        : p.status === 'PREPARED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                >
                    {p.status}
                </span>
            ),
        },
        {
            header: 'Actions',
            accessor: (p: Prescription) => (
                <Button size="sm" onClick={() => handlePrepare(p)} disabled={p.status === 'DISPENSED'}>
                    {p.status === 'PENDING' ? 'Prepare' : p.status === 'PREPARED' ? 'Dispense' : 'Completed'}
                </Button>
            ),
        },
    ];

    if (loading) {
        return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Pharmacy Queue</h1>

            <Card>
                <Table
                    data={prescriptions}
                    columns={columns}
                    keyExtractor={(p) => p.id}
                />
            </Card>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Prescription Details"
                size="lg"
            >
                {selectedPrescription && (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-600">Patient</p>
                            <p className="font-medium">{selectedPrescription.medicalRecord?.appointment?.patient?.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Diagnosis</p>
                            <p className="font-medium">{selectedPrescription.medicalRecord?.diagnosis}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-2">Prescription Items</p>
                            <div className="space-y-2">
                                {selectedPrescription.items?.map((item) => (
                                    <div key={item.id} className="p-3 bg-gray-50 rounded-md">
                                        <p className="font-medium">{item.drug?.name}</p>
                                        <p className="text-sm text-gray-600">Quantity: {item.qty}</p>
                                        <p className="text-sm text-gray-600">Dosage: {item.dosageInstructions}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end pt-4">
                            <Button variant="outline" onClick={() => setShowModal(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleDispense}>
                                {selectedPrescription.status === 'PENDING' ? 'Confirm Prepare' : 'Confirm Dispense'}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
