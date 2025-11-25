// Completed by Antigravity AI — Frontend Completion

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../components/ui/Button';
import { Table, type Column } from '../components/ui/Table';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { getPayments, createPayment, getPrescriptions } from '../services/api'; // Import specific functions, including getPrescriptions
import toast from 'react-hot-toast';
import type { Payment, Prescription } from '../types/index';

export const Payments: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [pendingPrescriptions, setPendingPrescriptions] = useState<Prescription[]>([]);
    const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);

    const { register, handleSubmit, reset } = useForm();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [paymentsRes, prescriptionsRes] = await Promise.all([
                getPayments(), // Use specific function
                getPrescriptions('DISPENSED'), // Use the new getPrescriptions function
            ]);
            setPayments(paymentsRes.data.data || []);
            setPendingPrescriptions(prescriptionsRes.data.data || []);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleProcessPayment = (prescription: Prescription) => {
        setSelectedPrescription(prescription);
        setShowModal(true);
    };

    const onSubmit = async (data: any) => {
        if (!selectedPrescription) return;

        try {
            const totalAmount = selectedPrescription.items?.reduce(
                (sum, item) => sum + (item.drug?.unitPrice || 0) * item.qty,
                0
            ) || 0;

            await createPayment({ // Use specific function
                prescriptionId: selectedPrescription.id,
                amount: totalAmount,
                method: data.method,
            });

            toast.success('Payment processed successfully');
            setShowModal(false);
            reset();
            loadData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to process payment');
        }
    };

    const paymentColumns: Column<Payment>[] = [
        { header: 'Patient', accessor: (p: Payment) => p.appointment?.patient?.name || '-' },
        { header: 'Amount', accessor: (p: Payment) => `Rp ${p.amount.toLocaleString()}` },
        { header: 'Method', accessor: 'method' },
        { header: 'Date', accessor: (p: Payment) => new Date(p.createdAt).toLocaleDateString() },
        {
            header: 'Status',
            accessor: (p: Payment) => (
                <span
                    className={`px-2 py-1 text-xs rounded-full ${p.status === 'PAID'
                            ? 'bg-green-100 text-green-800'
                            : p.status === 'CANCELLED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                        }`}
                >
                    {p.status}
                </span>
            ),
        },
    ];

    const prescriptionColumns: Column<Prescription>[] = [
        { header: 'Patient', accessor: (p: Prescription) => p.medicalRecord?.patient?.name || '-' },
        { header: 'Doctor', accessor: (p: Prescription) => p.doctor?.user?.name || '-' },
        { header: 'Date', accessor: (p: Prescription) => new Date(p.createdAt).toLocaleDateString() },
        {
            header: 'Actions',
            accessor: (p: Prescription) => (
                <Button size="sm" onClick={() => handleProcessPayment(p)}>
                    Process Payment
                </Button>
            ),
        },
    ];

    if (loading) {
        return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    }

    const calculateTotal = () => {
        return selectedPrescription?.items?.reduce(
            (sum, item) => sum + (item.drug?.unitPrice || 0) * item.qty,
            0
        ) || 0;
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>

            <Card title="Pending Payments">
                <Table
                    data={pendingPrescriptions}
                    columns={prescriptionColumns}
                    keyExtractor={(p) => p.id}
                />
            </Card>

            <Card title="Payment History">
                <Table
                    data={payments}
                    columns={paymentColumns}
                    keyExtractor={(p) => p.id}
                />
            </Card>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Process Payment"
            >
                {selectedPrescription && (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-600">Patient</p>
                            <p className="font-medium">{selectedPrescription.medicalRecord?.patient?.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-2">Items</p>
                            <div className="space-y-2">
                                {selectedPrescription.items?.map((item) => (
                                    <div key={item.id} className="flex justify-between p-2 bg-gray-50 rounded">
                                        <span>{item.drug?.name} x{item.qty}</span>
                                        <span>Rp {((item.drug?.unitPrice || 0) * item.qty).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="border-t pt-2">
                            <div className="flex justify-between font-bold">
                                <span>Total Amount</span>
                                <span>Rp {calculateTotal().toLocaleString()}</span>
                            </div>
                        </div>
                        <Select
                            label="Payment Method"
                            {...register('method')}
                            options={[
                                { value: 'CASH', label: 'Cash' },
                                { value: 'CARD', label: 'Card' },
                                { value: 'QRIS', label: 'QRIS' },
                            ]}
                            required
                        />
                        <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                Confirm Payment
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

