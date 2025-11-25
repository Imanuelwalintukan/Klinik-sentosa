import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Table, type Column } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';
import { getAllUsers, createUser, updateUser, changePassword } from '../services/api';
import type { User } from '../types/index';

export const UserManagement: React.FC = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentAction, setCurrentAction] = useState<'create' | 'edit' | 'password' | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STAFF' as 'ADMIN' | 'DOCTOR' | 'PHARMACIST' | 'STAFF',
    isActive: true,
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      setAllUsers(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return allUsers.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = selectedRoleFilter ? user.role === selectedRoleFilter : true;
      const matchesStatus = selectedStatusFilter ? (user.isActive ? 'active' : 'inactive') === selectedStatusFilter : true;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [allUsers, searchQuery, selectedRoleFilter, selectedStatusFilter]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = () => {
    setCurrentAction('create');
    setIsModalOpen(true);
    setFormData({ name: '', email: '', password: '', role: 'STAFF', isActive: true });
  };

  const handleEditUser = (user: User) => {
    setCurrentAction('edit');
    setIsModalOpen(true);
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      isActive: user.isActive,
    });
  };

  const handleChangePassword = (user: User) => {
    setCurrentAction('password');
    setIsModalOpen(true);
    setSelectedUser(user);
    setFormData((prev) => ({ ...prev, password: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentAction === 'create') {
        await createUser(formData);
        toast.success('User created successfully!');
      } else if (currentAction === 'edit' && selectedUser) {
        await updateUser(selectedUser.id, { name: formData.name, email: formData.email, role: formData.role, isActive: formData.isActive });
        toast.success('User updated successfully!');
      } else if (currentAction === 'password' && selectedUser) {
        await changePassword(selectedUser.id, { password: formData.password });
        toast.success('Password changed successfully!');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(`Failed to ${currentAction} user. ${error.response?.data?.message || ''}`);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await updateUser(user.id, { isActive: !user.isActive });
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully!`);
      fetchUsers();
    } catch (error: any) {
      toast.error(`Failed to toggle user status. ${error.response?.data?.message || ''}`);
    }
  };

  const columns: Column<User>[] = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Role', accessor: 'role' },
    {
      header: 'Status', accessor: (row: User) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.isActive ? 'bg-status-success/20 text-status-success' : 'bg-status-error/20 text-status-error'}`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    { header: 'Last Login', accessor: (row: User) => (row.lastLoginAt ? new Date(row.lastLoginAt).toLocaleString() : 'N/A') },
    {
      header: 'Actions', accessor: (row: User) => (
        <div className="flex space-x-2">
          <Button onClick={() => handleEditUser(row)} variant="secondary" size="sm">Edit</Button>
          <Button onClick={() => handleChangePassword(row)} variant="outline" size="sm">Reset Pass</Button>
          <Button onClick={() => handleToggleActive(row)} variant={row.isActive ? 'warning' : 'success'} size="sm">
            {row.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      )
    },
  ];

  if (loading) {
    return <div className="p-6 text-center text-text-white">Loading users...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-text-white">User Management</h1>

      <Card className="mb-6 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-text-default">User List</h2>
          <Button onClick={handleCreateUser}>Add New User</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input
            label="Search by Name/Email"
            name="search"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search users..."
          />
          <Input
            label="Filter by Role"
            name="roleFilter"
            value={selectedRoleFilter}
            onChange={(e) => { setSelectedRoleFilter(e.target.value); setCurrentPage(1); }}
            placeholder="ADMIN, DOCTOR, etc."
          />
          <Input
            label="Filter by Status"
            name="statusFilter"
            value={selectedStatusFilter}
            onChange={(e) => { setSelectedStatusFilter(e.target.value); setCurrentPage(1); }}
            placeholder="active or inactive"
          />
        </div>
      </Card>

      <Table columns={columns} data={paginatedUsers} keyExtractor={(u) => u.id} />

      <div className="flex justify-between items-center mt-4 text-text-white">
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentAction === 'create' ? 'Create New User' : currentAction === 'edit' ? 'Edit User' : 'Change Password'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {(currentAction === 'create' || currentAction === 'edit') && (
            <>
              <Input
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
              />
              {currentAction === 'edit' && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="form-checkbox h-5 w-5 text-primary-main transition duration-150 ease-in-out"
                  />
                  <label htmlFor="isActive" className="text-text-default">Active</label>
                </div>
              )}
            </>
          )}
          {(currentAction === 'create' || currentAction === 'password') && (
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          )}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;

