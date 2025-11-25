import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Clock, User, Calendar, RefreshCw, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCustomerQueue } from '../services/api';
import type { CustomerQueue as CustomerQueueType } from '../types/index';

export const CustomerQueue: React.FC = () => {
    const [queueData, setQueueData] = useState<CustomerQueueType | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchQueue();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchQueue, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchQueue = async () => {
        try {
            const response = await getCustomerQueue();
            setQueueData(response.data.data);
            setLoading(false);
            setRefreshing(false);
        } catch (error) {
            if (!loading) {
                toast.error('Failed to load queue status');
            }
            setQueueData(null);
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchQueue();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-main mx-auto mb-4"></div>
                    <p className="text-text-white">Loading queue status...</p>
                </div>
            </div>
        );
    }

    if (!queueData) {
        return (
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-text-white">My Queue</h1>
                    <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
                <Card className="p-12 text-center">
                    <div className="max-w-md mx-auto">
                        <Calendar className="h-24 w-24 text-text-muted mx-auto mb-4 opacity-50" />
                        <h2 className="text-2xl font-bold text-text-white mb-2">No Active Queue</h2>
                        <p className="text-text-muted">
                            You don't have any appointments scheduled for today.
                            Please visit the clinic to make an appointment.
                        </p>
                    </div>
                </Card>
            </div>
        );
    }

    const getPositionColor = (position: number) => {
        if (position <= 1) return 'text-status-success';
        if (position <= 3) return 'text-status-warning';
        return 'text-status-info';
    };

    const getWaitTimeColor = (minutes: number) => {
        if (minutes <= 15) return 'text-status-success';
        if (minutes <= 30) return 'text-status-warning';
        return 'text-status-error';
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-text-white">My Queue Status</h1>
                <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Main Queue Display */}
            <Card className="p-8 bg-gradient-to-br from-primary-main/10 to-primary-light/10 border-2 border-primary-main/30">
                <div className="text-center mb-8">
                    <p className="text-text-muted text-lg mb-2">Your Queue Number</p>
                    <div className="inline-block bg-primary-main/20 rounded-2xl px-12 py-6 border-2 border-primary-main">
                        <p className="text-7xl font-bold text-primary-light">{queueData.queueNumber}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6 bg-bg-card/50">
                        <div className="flex items-center mb-3">
                            <Clock className={`h-6 w-6 mr-2 ${getPositionColor(queueData.position)}`} />
                            <h3 className="text-lg font-semibold text-text-white">Position in Queue</h3>
                        </div>
                        <p className={`text-5xl font-bold ${getPositionColor(queueData.position)}`}>
                            {queueData.position}
                        </p>
                        <p className="text-text-muted mt-2">
                            {queueData.position === 1 ? "You're next!" :
                                queueData.position === 2 ? "Almost your turn" :
                                    `${queueData.position - 1} patient(s) ahead`}
                        </p>
                    </Card>

                    <Card className="p-6 bg-bg-card/50">
                        <div className="flex items-center mb-3">
                            <Clock className={`h-6 w-6 mr-2 ${getWaitTimeColor(queueData.estimatedWaitTime)}`} />
                            <h3 className="text-lg font-semibold text-text-white">Estimated Wait Time</h3>
                        </div>
                        <p className={`text-5xl font-bold ${getWaitTimeColor(queueData.estimatedWaitTime)}`}>
                            {queueData.estimatedWaitTime}
                        </p>
                        <p className="text-text-muted mt-2">minutes</p>
                    </Card>
                </div>
            </Card>

            {/* Appointment Details */}
            <Card className="p-6">
                <h2 className="text-xl font-bold text-text-white mb-4">Appointment Details</h2>
                <div className="space-y-4">
                    <div className="flex items-start">
                        <User className="h-5 w-5 text-primary-main mr-3 mt-1" />
                        <div>
                            <p className="text-text-muted text-sm">Doctor</p>
                            <p className="text-text-white font-medium">{queueData.appointment.doctor?.user?.name}</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <Calendar className="h-5 w-5 text-primary-main mr-3 mt-1" />
                        <div>
                            <p className="text-text-muted text-sm">Scheduled Time</p>
                            <p className="text-text-white font-medium">
                                {new Date(queueData.appointment.scheduledAt).toLocaleString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>
                    {queueData.appointment.complaint && (
                        <div className="flex items-start">
                            <FileText className="h-5 w-5 text-primary-main mr-3 mt-1" />
                            <div>
                                <p className="text-text-muted text-sm">Complaint</p>
                                <p className="text-text-white font-medium">{queueData.appointment.complaint}</p>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Instructions */}
            <Card className="p-6 bg-status-info/10 border border-status-info/30">
                <h3 className="text-lg font-semibold text-status-info mb-2">Please Note:</h3>
                <ul className="text-text-default space-y-2 list-disc list-inside">
                    <li>Please be ready when your number is called</li>
                    <li>Queue times are estimates and may vary</li>
                    <li>This page refreshes automatically every 30 seconds</li>
                    <li>Please wait in the waiting area</li>
                </ul>
            </Card>
        </div>
    );
};

