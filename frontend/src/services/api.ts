import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// User Management API
export const getAllUsers = () => api.get('/users');
export const getUserById = (id: number) => api.get(`/users/${id}`);
export const createUser = (userData: any) => api.post('/users', userData);
export const updateUser = (id: number, userData: any) => api.put(`/users/${id}`, userData);
export const deleteUser = (id: number) => api.delete(`/users/${id}`);
export const changePassword = (id: number, passwordData: any) => api.post(`/users/${id}/change-password`, passwordData);
export const restoreUser = (id: number) => api.post(`/users/${id}/restore`);

// Doctor Management API
export const getAllDoctors = () => api.get('/doctors');
export const getDoctorById = (id: number) => api.get(`/doctors/${id}`);
export const createDoctor = (doctorData: any) => api.post('/doctors', doctorData);
export const updateDoctor = (id: number, doctorData: any) => api.put(`/doctors/${id}`, doctorData);
export const deleteDoctor = (id: number) => api.delete(`/doctors/${id}`);

// Payment Management API
export const getPayments = () => api.get('/payments');
export const createPayment = (paymentData: any) => api.post('/payments', paymentData);
export const updatePaymentStatus = (appointmentId: number, statusData: { status: string }) => api.put(`/payments/appointment/${appointmentId}/status`, statusData);

// Prescription Management API
export const getPrescriptions = (status?: string) => {
    return api.get('/prescriptions', { params: { status } });
};

// System Log API
export const getAllActivityLogs = (filters: any) => {
    return api.get('/admin/activity-logs', { params: filters });
};

// Customer Portal API
export const registerCustomer = (data: any) => api.post('/customers/register', data);
export const getCustomerProfile = () => api.get('/customers/profile');
export const updateCustomerProfile = (data: any) => api.put('/customers/profile', data);
export const getCustomerQueue = () => api.get('/customers/queue');
export const getCustomerAppointments = (status?: string) =>
    api.get(`/customers/appointments${status ? `?status=${status}` : ''}`);
export const getCustomerPrescriptions = () => api.get('/customers/prescriptions');
export const getCustomerPayments = () => api.get('/customers/payments');

// Stock Monitoring API
export const getLowStockDrugs = () => api.get('/stock-monitoring/low-stock');
export const getExpiringDrugs = (days: number = 30) =>
    api.get(`/stock-monitoring/expiring?days=${days}`);
export const getStockAuditLogs = (drugId?: number, limit?: number) =>
    api.get(`/stock-monitoring/audit-logs?${drugId ? `drugId=${drugId}&` : ''}limit=${limit || 50}`);
export const getStockSummary = () => api.get('/stock-monitoring/summary');

export default api;
