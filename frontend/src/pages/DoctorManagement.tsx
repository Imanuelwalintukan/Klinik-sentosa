import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';
import { getAllDoctors, createDoctor, updateDoctor, deleteDoctor } from '../services/api';
import type { Doctor } from '../types';
import type { Column } from '../components/ui/Table';

export const DoctorManagement: React.FC = () => {
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentAction, setCurrentAction] = useState<'create' | 'edit' | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState({
    userId: '',
    specialization: '',
    sip: '',
    schedule: '',
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await getAllDoctors();
      setAllDoctors(response.data.data.doctors);
    } catch (error) {
      toast.error('Failed to fetch doctors.');
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = useMemo(() => {
    return allDoctors.filter(doctor =>
      (doctor.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [allDoctors, searchQuery]);

  const paginatedDoctors = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDoctors.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDoctors, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateDoctor = () => {
    setCurrentAction('create');
    setIsModalOpen(true);
    setFormData({ userId: '', specialization: '', sip: '', schedule: '' });
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setCurrentAction('edit');
    setIsModalOpen(true);
    setSelectedDoctor(doctor);
    setFormData({
      userId: String(doctor.userId),
      specialization: doctor.specialization,
      sip: doctor.sip,
      schedule: doctor.schedule,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentAction === 'create') {
        await createDoctor({ ...formData, userId: parseInt(formData.userId) });
        toast.success('Doctor created successfully!');
      } else if (currentAction === 'edit' && selectedDoctor) {
        await updateDoctor(selectedDoctor.id, { specialization: formData.specialization, sip: formData.sip, schedule: formData.schedule });
        toast.success('Doctor updated successfully!');
      }
      setIsModalOpen(false);
      fetchDoctors();
    } catch (error: any) {
      toast.error(`Failed to ${currentAction} doctor. ${error.response?.data?.message || ''}`);
    }
  };

  const handleDeleteDoctor = async (doctor: Doctor) => {
    if (window.confirm(`Are you sure you want to soft delete Dr. ${doctor.user?.name}?`)) {
      try {
        await deleteDoctor(doctor.id);
        toast.success('Doctor soft deleted successfully!');
        fetchDoctors();
      } catch (error: any) {
        toast.error(`Failed to soft delete doctor. ${error.response?.data?.message || ''}`);
      }
    }
  };

  const columns: Column<Doctor>[] = [
    { header: 'Name', accessor: (row: Doctor) => row.user?.name || 'N/A' },
    { header: 'Email', accessor: (row: Doctor) => row.user?.email || 'N/A' },
    { header: 'Specialization', accessor: 'specialization' },
    { header: 'SIP', accessor: 'sip' },
    { header: 'Schedule', accessor: 'schedule' },
    { header: 'Status', accessor: (row: Doctor) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${!row.deletedAt ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {!row.deletedAt ? 'Active' : 'Soft Deleted'}
        </span>
      ) },
    { header: 'Actions', accessor: (row: Doctor) => (
      <div className="flex space-x-2">
        <Button onClick={() => handleEditDoctor(row)} variant="secondary" size="sm" disabled={!!row.deletedAt}>Edit</Button>
        <Button onClick={() => handleDeleteDoctor(row)} variant="danger" size="sm" disabled={!!row.deletedAt}>Soft Delete</Button>
      </div>
    )},
  ];

  if (loading) {
    return <div className="p-6 text-center">Loading doctors...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Doctor Management</h1>
      
      <Card className="mb-6 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Doctor List</h2>
          <Button onClick={handleCreateDoctor}>Add New Doctor</Button>
        </div>
        <div className="mb-4">
          <Input
            label="Search by Name, Email, or Specialization"
            name="search"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search doctors..."
          />
        </div>
      </Card>

      <Table columns={columns} data={paginatedDoctors} keyExtractor={(d) => d.id} />

      <div className="flex justify-between items-center mt-4">
        <Button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span>Page {currentPage} of {totalPages}</span>
        <Button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage >= totalPages}
        >
          Next
        </Button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentAction === 'create' ? 'Create New Doctor' : 'Edit Doctor'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {currentAction === 'create' && (
            <Input
              label="User ID (Existing User)"
              name="userId"
              value={formData.userId}
              onChange={handleInputChange}
              required
              type="number"
            />
          )}
          <Input
            label="Specialization"
            name="specialization"
            value={formData.specialization}
            onChange={handleInputChange}
            required
          />
          <Input
            label="SIP"
            name="sip"
            value={formData.sip}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Schedule"
            name="schedule"
            value={formData.schedule}
            onChange={handleInputChange}
            required
          />
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DoctorManagement;
