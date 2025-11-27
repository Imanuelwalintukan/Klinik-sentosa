import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Table, type Column } from '../components/ui/Table';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import toast from 'react-hot-toast';
import api from '../services/api';
import type { Payment, Doctor, Patient } from '../types/index';

export const PaymentReports: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    doctorId: '',
    patientId: '',
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      const [doctorsRes, patientsRes] = await Promise.all([
        api.get('/doctors', { params: { limit: 1000 } }),
        api.get('/patients'),
      ]);
      const doctorsData = doctorsRes.data.data;
      const doctorsList = Array.isArray(doctorsData) ? doctorsData : (doctorsData?.doctors || []);
      setDoctors(doctorsList);
      setPatients(patientsRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load filter options');
    }
  };

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.status) params.status = filters.status;
      if (filters.doctorId) params.doctorId = filters.doctorId;
      if (filters.patientId) params.patientId = filters.patientId;

      const response = await api.get('/payments', { params });
      setPayments(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch payments.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      status: '',
      doctorId: '',
      patientId: '',
    });
  };

  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalAppointmentFees = payments.reduce((sum, p) => sum + Number(p.appointmentFee || 0), 0);
  const totalPrescriptionFees = payments.reduce((sum, p) => sum + Number(p.prescriptionFee || 0), 0);

  const columns: Column<Payment>[] = [
    { header: 'Payment ID', accessor: 'id' },
    { header: 'Patient Name', accessor: (row: Payment) => row.appointment?.patient?.name || 'N/A' },
    { header: 'Doctor Name', accessor: (row: Payment) => row.appointment?.doctor?.user?.name || 'N/A' },
    { header: 'Appointment Fee', accessor: (row: Payment) => `Rp ${Number(row.appointmentFee || 0).toLocaleString()}` },
    { header: 'Prescription Fee', accessor: (row: Payment) => `Rp ${Number(row.prescriptionFee || 0).toLocaleString()}` },
    { header: 'Total Amount', accessor: (row: Payment) => `Rp ${Number(row.amount).toLocaleString()}` },
    { header: 'Method', accessor: 'method' },
    {
      header: 'Status', accessor: (row: Payment) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === 'PAID' ? 'bg-green-100 text-green-800' : row.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
          {row.status}
        </span>
      )
    },
    { header: 'Date', accessor: (row: Payment) => new Date(row.createdAt).toLocaleDateString() },
  ];

  if (loading) {
    return <div className="p-6 text-center">Loading payments...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Payment Reports</h1>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Payments</p>
          <p className="text-2xl font-bold">{payments.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">Rp {totalRevenue.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Appointment Fees</p>
          <p className="text-2xl font-bold">Rp {totalAppointmentFees.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Prescription Fees</p>
          <p className="text-2xl font-bold">Rp {totalPrescriptionFees.toLocaleString()}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
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
          <Select
            label="Status"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'PAID', label: 'Paid' },
              { value: 'CANCELLED', label: 'Cancelled' },
            ]}
          />
          <Select
            label="Doctor"
            name="doctorId"
            value={filters.doctorId}
            onChange={handleFilterChange}
            options={[
              { value: '', label: 'All Doctors' },
              ...doctors.map((d) => ({ value: d.id, label: d.user?.name || `Doctor #${d.id}` })),
            ]}
          />
          <Select
            label="Patient"
            name="patientId"
            value={filters.patientId}
            onChange={handleFilterChange}
            options={[
              { value: '', label: 'All Patients' },
              ...patients.map((p) => ({ value: p.id, label: `${p.name} (${p.nik})` })),
            ]}
          />
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <Button onClick={handleClearFilters} variant="outline">Clear Filters</Button>
        </div>
      </Card>

      {/* Payment List */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Payment List ({payments.length} records)</h2>
        <Table columns={columns} data={payments} keyExtractor={(p) => p.id} />
      </Card>
    </div>
  );
};

export default PaymentReports;

