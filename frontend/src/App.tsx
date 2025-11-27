// Completed by Antigravity AI — Frontend Completion


import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

// Pages
import { Login } from './pages/Login';
import { Patients } from './pages/Patients';
import { PatientForm } from './pages/PatientForm';
import { Appointments } from './pages/Appointments';
import { AppointmentForm } from './pages/AppointmentForm';
import { Examination } from './pages/Examination';
import { Prescription } from './pages/Prescription';
import { Pharmacy } from './pages/Pharmacy';
import { Payments } from './pages/Payments';
import { Inventory } from './pages/Inventory';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserManagement } from './pages/UserManagement';
import { DoctorManagement } from './pages/DoctorManagement';
import { PaymentReports } from './pages/PaymentReports';
import { SystemLogs } from './pages/SystemLogs';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { CustomerQueue } from './pages/CustomerQueue';
import { CustomerAppointments } from './pages/CustomerAppointments';
import { CustomerPrescriptions } from './pages/CustomerPrescriptions';
import { CustomerPayments } from './pages/CustomerPayments';
import { CustomerProfile } from './pages/CustomerProfile';

function AppRoutes() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Redirect based on role if at root
  const getHomeRoute = () => {
    switch (user.role) {
      case 'ADMIN': return '/admin/dashboard';
      case 'DOCTOR': return '/appointments'; // Doctor home
      case 'PHARMACIST': return '/pharmacy';
      case 'STAFF': return '/appointments';
      case 'CUSTOMER': return '/customer/dashboard';
      default: return '/';
    }
  };

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route element={<Layout />}>
        <Route
          path="/"
          element={<Navigate to={getHomeRoute()} replace />}
        />
        <Route
          path="/patients"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'DOCTOR']}>
              <Patients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients/new"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
              <PatientForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
              <PatientForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'DOCTOR']}>
              <Appointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments/new"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
              <AppointmentForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/examination/:id"
          element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
              <Examination />
            </ProtectedRoute>
          }
        />
        <Route
          path="/prescription/:medicalRecordId"
          element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
              <Prescription />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pharmacy"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST']}>
              <Pharmacy />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
              <Payments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST']}>
              <Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/doctors"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DoctorManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payment-reports"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <PaymentReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/system-logs"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <SystemLogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/queue"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <CustomerQueue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/appointments"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <CustomerAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/prescriptions"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <CustomerPrescriptions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/payments"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <CustomerPayments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/profile"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <CustomerProfile />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
