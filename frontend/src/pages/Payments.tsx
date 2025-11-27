// Completed by Antigravity AI — Frontend Completion

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../components/ui/Button';
import { Table, type Column } from '../components/ui/Table';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { getPayments, updatePaymentStatus } from '../services/api';
import toast from 'react-hot-toast';
import type { Payment } from '../types/index';

export const Payments: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);

    const { handleSubmit, reset } = useForm();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const paymentsRes = await getPayments();
            setPayments(paymentsRes.data.data || []);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleProcessPayment = (payment: Payment) => {
        setSelectedPayment(payment);
        setShowModal(true);
    };

    const onSubmit = async () => {
        if (!selectedPayment) return;

        try {
            await updatePaymentStatus(selectedPayment.appointmentId, { status: 'PAID' });
            toast.success('Payment processed successfully');
            setShowModal(false);
            reset();
            loadData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to process payment');
        }
    };

    const pendingPayments = payments.filter(p => p.status === 'PENDING');
    const paymentHistory = payments.filter(p => p.status !== 'PENDING');

    const pendingColumns: Column<Payment>[] = [
        { header: 'Patient', accessor: (p: Payment) => p.appointment?.patient?.name || '-' },
        { header: 'Appointment Fee', accessor: (p: Payment) => `Rp ${Number(p.appointmentFee || 0).toLocaleString()}` },
        { header: 'Prescription Fee', accessor: (p: Payment) => `Rp ${Number(p.prescriptionFee || 0).toLocaleString()}` },
        { header: 'Total Amount', accessor: (p: Payment) => `Rp ${Number(p.amount).toLocaleString()}` },
        { header: 'Date', accessor: (p: Payment) => new Date(p.createdAt).toLocaleDateString() },
        {
            header: 'Actions',
            accessor: (p: Payment) => (
                <Button size="sm" onClick={() => handleProcessPayment(p)}>
                    Process Payment
                </Button>
            ),
        },
    ];

    const historyColumns: Column<Payment>[] = [
        { header: 'Patient', accessor: (p: Payment) => p.appointment?.patient?.name || '-' },
        { header: 'Amount', accessor: (p: Payment) => `Rp ${Number(p.amount).toLocaleString()}` },
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

    if (loading) {
        return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>

            <Card title="Pending Payments">
                <Table
                    data={pendingPayments}
                    columns={pendingColumns}
                    keyExtractor={(p) => p.id}
                />
            </Card>

            <Card title="Payment History">
                <Table
                    data={paymentHistory}
                    columns={historyColumns}
                    keyExtractor={(p) => p.id}
                />
            </Card>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Process Payment"
            >
                {selectedPayment && (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-600">Patient</p>
                            <p className="font-medium">{selectedPayment.appointment?.patient?.name}</p>
                        </div>
                        <div className="border-t pt-2">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Appointment Fee:</span>
                                    <span className="font-medium">Rp {Number(selectedPayment.appointmentFee || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Prescription Fee:</span>
                                    <span className="font-medium">Rp {Number(selectedPayment.prescriptionFee || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-bold border-t pt-2">
                                    <span>Total Amount:</span>
                                    <span>Rp {Number(selectedPayment.amount).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
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
