import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Table, type Column } from '../components/ui/Table';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import toast from 'react-hot-toast';
import { getAllActivityLogs } from '../services/api';
import type { ActivityLog } from '../types';

export const SystemLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({
    userId: '',
    entity: '',
    action: '',
  });

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, pagination.limit]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await getAllActivityLogs({ ...filters, page: pagination.page, limit: pagination.limit });
      setLogs(response.data.data.activityLogs);
      setPagination((prev) => ({ ...prev, total: response.data.data.total }));
    } catch (error) {
      toast.error('Failed to fetch activity logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchLogs();
  };

  const safeJsonStringify = (data: unknown) => {
    try {
      if (typeof data !== 'object' || data === null) {
        return String(data);
      }
      return JSON.stringify(data);
    } catch (e) {
      return 'Non-stringifiable data';
    }
  };

  const columns: Column<ActivityLog>[] = [
    { header: 'ID', accessor: 'id' },
    { header: 'Timestamp', accessor: (row: ActivityLog) => new Date(row.timestamp).toLocaleString() },
    { header: 'User', accessor: (row: ActivityLog) => row.user ? `${row.user.name} (${row.user.email})` : 'System' },
    { header: 'Action', accessor: 'action' },
    { header: 'Entity', accessor: 'entity' },
    { header: 'Entity ID', accessor: 'entityId' },
    { header: 'Old Value', accessor: (row: ActivityLog) => row.oldValue ? safeJsonStringify(row.oldValue) : 'N/A' },
    { header: 'New Value', accessor: (row: ActivityLog) => row.newValue ? safeJsonStringify(row.newValue) : 'N/A' },
  ];

  if (loading) {
    return <div className="p-6 text-center">Loading activity logs...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">System Activity Logs</h1>
      
      <Card className="mb-6 p-4">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="User ID"
            name="userId"
            type="number"
            value={filters.userId}
            onChange={handleFilterChange}
          />
          <Select
            label="Entity"
            name="entity"
            value={filters.entity}
            onChange={handleFilterChange}
            options={[
              { value: '', label: 'All' },
              { value: 'USER', label: 'User' },
              { value: 'PATIENT', label: 'Patient' },
              { value: 'DRUG', label: 'Drug' },
              { value: 'APPOINTMENT', label: 'Appointment' },
              { value: 'MEDICAL_RECORD', label: 'Medical Record' },
              { value: 'PRESCRIPTION', label: 'Prescription' },
              { value: 'PAYMENT', label: 'Payment' },
            ]}
          />
          <Select
            label="Action"
            name="action"
            value={filters.action}
            onChange={handleFilterChange}
            options={[
              { value: '', label: 'All' },
              { value: 'LOGIN', label: 'Login' },
              { value: 'CREATE', label: 'Create' },
              { value: 'UPDATE', label: 'Update' },
              { value: 'DELETE', label: 'Delete' },
              { value: 'CANCEL', label: 'Cancel' },
              { value: 'REASSIGN_DOCTOR', label: 'Reassign Doctor' },
              { value: 'DRUG_STOCK_DECREMENT', label: 'Drug Stock Decrement' },
              { value: 'UPDATE_STATUS', label: 'Update Status' },
            ]}
          />
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <Button onClick={handleApplyFilters}>Apply Filters</Button>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Activity Logs</h2>
        <Table columns={columns} data={logs} keyExtractor={(l) => l.id}/>
        <div className="flex justify-between items-center mt-4">
          <Button
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
          >
            Previous
          </Button>
          <span>Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}</span>
          <Button
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page * pagination.limit >= pagination.total}
          >
            Next
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SystemLogs;
