import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Pill, Calendar, User, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCustomerPrescriptions } from '../services/api';
import type { Prescription } from '../types';

export const CustomerPrescriptions: React.FC = () => {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const fetchPrescriptions = async () => {
        setLoading(true);
        try {
            const response = await getCustomerPrescriptions();
            setPrescriptions(response.data.data || []);
        } catch (error) {
            toast.error('Failed to load prescriptions');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-main mx-auto mb-4"></div>
                    <p className="text-text-white">Loading prescriptions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-text-white">My Prescriptions</h1>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                    <p className="text-text-muted text-sm">Total Prescriptions</p>
                    <p className="text-2xl font-bold text-text-white">{prescriptions.length}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-text-muted text-sm">Total Medications</p>
                    <p className="text-2xl font-bold text-primary-light">
                        {prescriptions.reduce((sum, p) => sum + (p.items?.length || 0), 0)}
                    </p>
                </Card>
                <Card className="p-4">
                    <p className="text-text-muted text-sm">Recent (Last 30 days)</p>
                    <p className="text-2xl font-bold text-secondary-main">
                        {prescriptions.filter(p => {
                            const thirtyDaysAgo = new Date();
                            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                            return new Date(p.createdAt) >= thirtyDaysAgo;
                        }).length}
                    </p>
                </Card>
            </div>

            {/* Prescriptions List */}
            {prescriptions.length === 0 ? (
                <Card className="p-12 text-center">
                    <Pill className="h-24 w-24 text-text-muted mx-auto mb-4 opacity-50" />
                    <h2 className="text-2xl font-bold text-text-white mb-2">No Prescriptions Yet</h2>
                    <p className="text-text-muted">Your prescription history will appear here.</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {prescriptions.map((prescription) => (
                        <Card key={prescription.id} className="p-6 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center">
                                    <div className="bg-secondary-main/20 rounded-full p-3 mr-4">
                                        <Pill className="h-6 w-6 text-secondary-light" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-text-white">
                                            Prescription #{prescription.id}
                                        </h3>
                                        <p className="text-text-muted text-sm">
                                            {new Date(prescription.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${prescription.status === 'DISPENSED' ? 'bg-status-success/20 text-status-success' :
                                    prescription.status === 'PREPARED' ? 'bg-status-info/20 text-status-info' :
                                        'bg-status-warning/20 text-status-warning'
                                    }`}>
                                    {prescription.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="flex items-start">
                                    <User className="h-5 w-5 text-primary-main mr-2 mt-0.5" />
                                    <div>
                                        <p className="text-text-muted text-sm">Prescribed by</p>
                                        <p className="text-text-white font-medium">{prescription.doctor?.user.name || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <Calendar className="h-5 w-5 text-primary-main mr-2 mt-0.5" />
                                    <div>
                                        <p className="text-text-muted text-sm">Appointment Date</p>
                                        <p className="text-text-white font-medium">
                                            {prescription.medicalRecord?.appointment
                                                ? new Date(prescription.medicalRecord.appointment.scheduledAt).toLocaleDateString()
                                                : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Medications */}
                            <div className="border-t border-white/10 pt-4">
                                <h4 className="text-sm font-semibold text-text-white mb-3 flex items-center">
                                    <FileText className="h-4 w-4 mr-2 text-primary-main" />
                                    Medications
                                </h4>
                                <div className="space-y-3">
                                    {prescription.items?.map((item, index) => (
                                        <div key={index} className="bg-bg-dark/30 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="text-text-white font-medium">{item.drug.name}</p>
                                                    <p className="text-text-muted text-sm">SKU: {item.drug.sku}</p>
                                                </div>
                                                <span className="bg-primary-main/20 text-primary-light px-3 py-1 rounded-full text-sm font-semibold">
                                                    Qty: {item.qty}
                                                </span>
                                            </div>
                                            {item.dosageInstructions && (
                                                <div className="mt-2 pt-2 border-t border-white/10">
                                                    <p className="text-text-muted text-sm font-semibold mb-1">Dosage Instructions:</p>
                                                    <p className="text-text-default text-sm">{item.dosageInstructions}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
