// Completed by Antigravity AI — Frontend Completion

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { Card } from '../components/ui/Card';
import api from '../services/api';
import toast from 'react-hot-toast';
import type { Patient } from '../types';

export const Patients: React.FC = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPatients();
    }, []);

    const loadPatients = async () => {
        try {
            const response = await api.get('/patients');
            setPatients(response.data.data || []);
        } catch (error) {
            toast.error('Failed to load patients');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this patient?')) return;

        try {
            await api.delete(`/patients/${id}`);
            toast.success('Patient deleted successfully');
            loadPatients();
        } catch (error) {
            toast.error('Failed to delete patient');
        }
    };

    const filteredPatients = patients.filter(
        (patient) =>
            patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            patient.nik.includes(searchQuery)
    );

    const columns = [
        { header: 'Name', accessor: 'name' as keyof Patient },
        { header: 'NIK', accessor: 'nik' as keyof Patient },
        { header: 'Phone', accessor: 'phone' as keyof Patient },
        { header: 'Birth Date', accessor: (p: Patient) => new Date(p.birthDate).toLocaleDateString() },
        {
            header: 'Actions',
            accessor: (patient: Patient) => (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/patients/${patient.id}/edit`)}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(patient.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    if (loading) {
        return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
                <Button onClick={() => navigate('/patients/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Patient
                </Button>
            </div>

            <Card>
                <div className="mb-4">
                    <Input
                        placeholder="Search by name or NIK..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <Table
                    data={filteredPatients}
                    columns={columns}
                    keyExtractor={(patient) => patient.id}
                />
            </Card>
        </div>
    );
};
