import React, { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import api from '../services/api';
import toast from 'react-hot-toast';
import type { Drug } from '../types/index';

export const Inventory: React.FC = () => {
    const [drugs, setDrugs] = useState<Drug[]>([]);
    const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);

    const { register, handleSubmit, reset } = useForm();

    useEffect(() => {
        loadDrugs();
    }, []);

    const loadDrugs = async () => {
        try {
            const response = await api.get('/drugs');
            setDrugs(response.data.data || []);
        } catch (error) {
            toast.error('Failed to load drugs');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (drug: Drug) => {
        setSelectedDrug(drug);
        reset(drug);
        setShowModal(true);
    };

    const handleAdd = () => {
        setSelectedDrug(null);
        reset({});
        setShowModal(true);
    };

    const handleDelete = async (drug: Drug) => {
        if (!confirm(`Are you sure you want to soft delete ${drug.name}?`)) return;

        try {
            await api.put(`/drugs/${drug.id}`, { deletedAt: new Date() });
            toast.success('Drug soft deleted successfully');
            loadDrugs();
        } catch (error) {
            toast.error('Failed to soft delete drug');
        }
    };

    const onSubmit = async (data: any) => {
        try {
            if (selectedDrug) {
                await api.put(`/drugs/${selectedDrug.id}`, data);
                toast.success('Drug updated successfully');
            } else {
                await api.post('/drugs', data);
                toast.success('Drug added successfully');
            }
            setShowModal(false);
            loadDrugs();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to save drug');
        }
    };

    const columns = [
        { header: 'Name', accessor: 'name' as keyof Drug },
        { header: 'SKU', accessor: 'sku' as keyof Drug },
        { header: 'Price', accessor: (d: Drug) => `Rp ${d.unitPrice.toLocaleString()}` },
        {
            header: 'Stock',
            accessor: (d: Drug) => (
                <span
                    className={
                        d.minStock && d.stockQty < d.minStock
                            ? 'text-red-600 font-semibold'
                            : 'text-gray-900'
                    }
                >
                    {d.stockQty}
                </span>
            ),
        },
        { header: 'Min Stock', accessor: (d: Drug) => d.minStock || '-' },
        { header: 'Expiry', accessor: (d: Drug) => d.expiryDate ? new Date(d.expiryDate).toLocaleDateString() : '-' },
        {
            header: 'Status',
            accessor: (d: Drug) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        d.deletedAt ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}
                >
                    {d.deletedAt ? 'Soft Deleted' : 'Active'}
                </span>
            ),
        },
        {
            header: 'Actions',
            accessor: (drug: Drug) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(drug)} disabled={!!drug.deletedAt}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(drug)} disabled={!!drug.deletedAt}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    const lowStockDrugs = useMemo(() => {
        return drugs.filter(d => !d.deletedAt && d.minStock != null && d.stockQty < (d.minStock as number));
    }, [drugs]);

    const expiringDrugs = useMemo(() => {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return drugs.filter(d => !d.deletedAt && d.expiryDate && new Date(d.expiryDate) < thirtyDaysFromNow);
    }, [drugs]);

    if (loading) {
        return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Drug Inventory</h1>
                <Button onClick={handleAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Drug
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 bg-yellow-50 border-yellow-200">
                    <h2 className="text-lg font-semibold text-yellow-800 mb-2">Low Stock Warnings ({lowStockDrugs.length})</h2>
                    {lowStockDrugs.length > 0 ? (
                        <ul className="list-disc pl-5 text-sm text-yellow-700">
                            {lowStockDrugs.map(d => (
                                <li key={d.id}>{d.name} (SKU: {d.sku}) - {d.stockQty} left (Min: {d.minStock})</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-yellow-700">No drugs are currently low in stock.</p>
                    )}
                </Card>

                <Card className="p-4 bg-orange-50 border-orange-200">
                    <h2 className="text-lg font-semibold text-orange-800 mb-2">Expiring Soon ({expiringDrugs.length})</h2>
                    {expiringDrugs.length > 0 ? (
                        <ul className="list-disc pl-5 text-sm text-orange-700">
                            {expiringDrugs.map(d => (
                                <li key={d.id}>{d.name} (SKU: {d.sku}) - Exp. {d.expiryDate ? new Date(d.expiryDate).toLocaleDateString() : 'N/A'}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-orange-700">No drugs expiring within 30 days.</p>
                    )}
                </Card>
            </div>


            <Card>
                <Table
                    data={drugs}
                    columns={columns}
                    keyExtractor={(d) => d.id}
                />
            </Card>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={selectedDrug ? 'Edit Drug' : 'Add New Drug'}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Drug Name"
                        {...register('name')}
                        placeholder="Enter drug name"
                        required
                    />
                    <Input
                        label="SKU"
                        {...register('sku')}
                        placeholder="Enter SKU"
                        required
                    />
                    <Input
                        label="Unit Price"
                        type="number"
                        {...register('unitPrice', { valueAsNumber: true })}
                        placeholder="Enter price"
                        required
                    />
                    <Input
                        label="Stock Quantity"
                        type="number"
                        {...register('stockQty', { valueAsNumber: true })}
                        placeholder="Enter stock quantity"
                        required
                    />
                    <Input
                        label="Minimum Stock"
                        type="number"
                        {...register('minStock', { valueAsNumber: true })}
                        placeholder="Enter minimum stock level"
                    />
                    <Input
                        label="Expiry Date"
                        type="date"
                        {...register('expiryDate')}
                    />
                    <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {selectedDrug ? 'Update' : 'Add'} Drug
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
