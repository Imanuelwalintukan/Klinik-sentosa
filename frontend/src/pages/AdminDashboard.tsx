import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

interface DrugDetail {
  id: number;
  name: string;
  stockQty?: number;
  minStock?: number;
  expiryDate?: string;
}

interface AdminSummary {
  totalPatients: number;
  totalAppointments: number;
  todayAppointments: number;
  activeDoctors: number;
  lowStockDrugsCount: number;
  expiringDrugsCount: number;
  totalPaymentsToday: number;
  totalPaymentsMonth: number;
  pendingAppointmentsCount: number;
  unpaidPaymentsCount: number;
  lowStockDrugDetails: DrugDetail[];
  expiringDrugDetails: DrugDetail[];
}

export const AdminDashboard: React.FC = () => {
  const [summaryData, setSummaryData] = useState<AdminSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const response = await api.get('/admin/dashboard');
        setSummaryData(response.data.data);
      } catch (error) {
        toast.error('Failed to fetch dashboard summary.');
        console.error('Error fetching dashboard summary:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading dashboard...</div>;
  }

  if (!summaryData) {
    return <div className="p-6 text-center text-red-600">Failed to load dashboard data.</div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Patients Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Patients</h2>
          <p className="text-3xl font-bold text-indigo-600">{summaryData.totalPatients}</p>
        </div>

        {/* Appointments Today Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Appointments Today</h2>
          <p className="text-3xl font-bold text-green-600">{summaryData.todayAppointments}</p>
        </div>

        {/* Total Payments Today/Month Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Payments (Today/Month)</h2>
          <p className="text-3xl font-bold text-blue-600">
            {formatCurrency(summaryData.totalPaymentsToday)} / {formatCurrency(summaryData.totalPaymentsMonth)}
          </p>
        </div>

        {/* Active Doctors Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Active Doctors</h2>
          <p className="text-3xl font-bold text-purple-600">{summaryData.activeDoctors}</p>
        </div>

        {/* Low-Stock Drugs Warning Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Low-Stock Drugs</h2>
          <p className="text-3xl font-bold text-orange-600">{summaryData.lowStockDrugsCount} items</p>
        </div>

        {/* Expiring Drugs Warning Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Expiring Drugs</h2>
          <p className="text-3xl font-bold text-red-600">{summaryData.expiringDrugsCount} items</p>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Notifications</h2>
        <ul className="space-y-2">
          {summaryData.pendingAppointmentsCount > 0 && (
            <li className="flex items-center text-gray-800">
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">Warning</span>
              {summaryData.pendingAppointmentsCount} appointments pending confirmation.
            </li>
          )}
          {summaryData.unpaidPaymentsCount > 0 && (
            <li className="flex items-center text-gray-800">
              <span className="bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">Urgent</span>
              {summaryData.unpaidPaymentsCount} payments are still pending.
            </li>
          )}
          {summaryData.lowStockDrugDetails.length > 0 && (
            <>
              {summaryData.lowStockDrugDetails.map(drug => (
                <li key={`low-${drug.id}`} className="flex items-center text-gray-800">
                  <span className="bg-orange-100 text-orange-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">Low Stock</span>
                  Drug "{drug.name}" stock low: {drug.stockQty} units (Min: {drug.minStock}).
                </li>
              ))}
            </>
          )}
          {summaryData.expiringDrugDetails.length > 0 && (
            <>
              {summaryData.expiringDrugDetails.map(drug => (
                <li key={`exp-${drug.id}`} className="flex items-center text-gray-800">
                  <span className="bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">Expiring</span>
                  Drug "{drug.name}" expiring soon: {drug.expiryDate ? new Date(drug.expiryDate).toLocaleDateString() : 'N/A'}.
                </li>
              ))}
            </>
          )}
          {(summaryData.pendingAppointmentsCount === 0 && summaryData.unpaidPaymentsCount === 0 && summaryData.lowStockDrugDetails.length === 0 && summaryData.expiringDrugDetails.length === 0) && (
            <li className="text-gray-600">No new notifications.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
