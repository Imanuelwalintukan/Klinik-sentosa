import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CreditCard, Calendar, Download, DollarSign, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCustomerPayments } from '../services/api';
import type { Payment } from '../types';

export const CustomerPayments: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const response = await getCustomerPayments();
            setPayments(response.data.data || []);
        } catch (error) {
            toast.error('Failed to load payments');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReceipt = (paymentId: number) => {
        toast.success(`Receipt #${paymentId} download started`);
        // In a real app, this would trigger a PDF download
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-main mx-auto mb-4"></div>
                    <p className="text-text-white">Loading payments...</p>
                </div>
            </div>
        );
    }

    const totalPaid = payments
        .filter(p => p.status === 'PAID')
        .reduce((sum, p) => sum + Number(p.amount), 0);
    const pendingPayments = payments.filter(p => p.status === 'PENDING');

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-text-white">My Payments</h1>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                    <p className="text-text-muted text-sm">Total Payments</p>
                    <p className="text-2xl font-bold text-text-white">{payments.length}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-text-muted text-sm">Total Paid</p>
                    <p className="text-2xl font-bold text-status-success">
                        Rp {totalPaid.toLocaleString('id-ID')}
                    </p>
                </Card>
                <Card className="p-4">
                    <p className="text-text-muted text-sm">Pending</p>
                    <p className="text-2xl font-bold text-status-warning">{pendingPayments.length}</p>
                </Card>
            </div>

            {/* Payments List */}
            {payments.length === 0 ? (
                <Card className="p-12 text-center">
                    <CreditCard className="h-24 w-24 text-text-muted mx-auto mb-4 opacity-50" />
                    <h2 className="text-2xl font-bold text-text-white mb-2">No Payments Yet</h2>
                    <p className="text-text-muted">Your payment history will appear here.</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {payments.map((payment) => (
                        <Card key={payment.id} className="p-6 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center">
                                    <div className={`rounded-full p-3 mr-4 ${payment.status === 'PAID'
                                        ? 'bg-status-success/20'
                                        : 'bg-status-warning/20'
                                        }`}>
                                        <CreditCard className={`h-6 w-6 ${payment.status === 'PAID'
                                            ? 'text-status-success'
                                            : 'text-status-warning'
                                            }`} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-text-white">
                                            Payment #{payment.id}
                                        </h3>
                                        <p className="text-text-muted text-sm">
                                            {new Date(payment.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${payment.status === 'PAID'
                                        ? 'bg-status-success/20 text-status-success'
                                        : 'bg-status-warning/20 text-status-warning'
                                        }`}>
                                        {payment.status}
                                    </span>
                                </div>
                            </div>

                            {/* Payment Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="flex items-start">
                                    <Calendar className="h-5 w-5 text-primary-main mr-2 mt-0.5" />
                                    <div>
                                        <p className="text-text-muted text-sm">Appointment Date</p>
                                        <p className="text-text-white font-medium">
                                            {new Date(payment.appointment.scheduledAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <FileText className="h-5 w-5 text-primary-main mr-2 mt-0.5" />
                                    <div>
                                        <p className="text-text-muted text-sm">Payment Method</p>
                                        <p className="text-text-white font-medium">{payment.method}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Amount Breakdown */}
                            <div className="border-t border-white/10 pt-4">
                                <h4 className="text-sm font-semibold text-text-white mb-3 flex items-center">
                                    <DollarSign className="h-4 w-4 mr-2 text-primary-main" />
                                    Amount Breakdown
                                </h4>
                                <div className="space-y-2 bg-bg-dark/30 rounded-lg p-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-muted">Consultation Fee:</span>
                                        <span className="text-text-white font-medium">
                                            Rp {Number(payment.appointmentFee || 0).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-muted">Prescription/Medication:</span>
                                        <span className="text-text-white font-medium">
                                            Rp {Number(payment.prescriptionFee || 0).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <div className="border-t border-white/10 pt-2 mt-2">
                                        <div className="flex justify-between">
                                            <span className="text-text-white font-semibold">Total Amount:</span>
                                            <span className="text-primary-light font-bold text-lg">
                                                Rp {Number(payment.amount).toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            {payment.status === 'PAID' && (
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <Button
                                        onClick={() => handleDownloadReceipt(payment.id)}
                                        variant="outline"
                                        size="sm"
                                        className="w-full md:w-auto"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download Receipt
                                    </Button>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
