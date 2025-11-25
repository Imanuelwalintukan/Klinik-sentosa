import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Table, type Column } from '../components/ui/Table';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';
import { getPayments } from '../services/api';
import type { Payment } from '../types';

export const PaymentReports: React.FC = () => {
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await getPayments();
      setAllPayments(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch payments.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = useMemo(() => {
    return allPayments.filter(payment => {
      const paymentDate = new Date(payment.createdAt);
      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;

      if (startDate && paymentDate < startDate) return false;
      if (endDate && paymentDate > endDate) return false;
      if (filters.status && payment.status !== filters.status) return false;

      return true;
    });
  }, [allPayments, filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleExport = () => {
    toast.success('Export initiated! (Placeholder)');
  };

  const columns: Column<Payment>[] = [
    { header: 'Payment ID', accessor: 'id' },
    { header: 'Appointment ID', accessor: 'appointmentId' },
    { header: 'Patient Name', accessor: (row: Payment) => row.appointment?.patient?.name || 'N/A' },
    { header: 'Doctor Name', accessor: (row: Payment) => row.appointment?.doctor?.user?.name || 'N/A' },
    { header: 'Amount', accessor: (row: Payment) => `Rp ${row.amount.toLocaleString()}` },
    { header: 'Method', accessor: 'method' },
    { header: 'Status', accessor: (row: Payment) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === 'PAID' ? 'bg-green-100 text-green-800' : row.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
          {row.status}
        </span>
      ) },
    { header: 'Date', accessor: (row: Payment) => new Date(row.createdAt).toLocaleString() },
  ];

  if (loading) {
    return <div className="p-6 text-center">Loading payments...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Payment Reports</h1>
      
      <Card className="mb-6 p-4">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Start Date"
            name="startDate"
            type="date"
            value={filters.startDate}
            onChange={handleFilterChange}
          />
          <Input
            label="End Date"
            name="endDate"
            type="date"
            value={filters.endDate}
            onChange={handleFilterChange}
          />
          <Input
            label="Status"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            placeholder="PENDING, PAID, CANCELLED"
          />
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <Button onClick={handleExport} variant="secondary">Export Report</Button>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Payment List</h2>
        <Table columns={columns} data={filteredPayments} keyExtractor={(p) => p.id} />
      </Card>
    </div>
  );
};

export default PaymentReports;
