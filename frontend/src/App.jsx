import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Logout } from './components/auth/Logout';
import Login from './components/auth/Login';
import RoleSelection from './components/auth/RoleSelection';
import RoleBasedLogin from './components/auth/RoleBasedLogin';
import Layout from './components/Layout';
import Dashboard from './components/dashboard/Dashboard';
import PatientList from './components/patients/PatientList';
import DoctorList from './components/doctors/DoctorList';
import ExaminationList from './components/examinations/ExaminationList';
import ExaminationDetail from './components/examinations/ExaminationDetail';
import ExaminationForm from './components/examinations/ExaminationForm';
import MedicationList from './components/medications/MedicationList';
import PrescriptionList from './components/prescriptions/PrescriptionList';
import PrescriptionForm from './components/prescriptions/PrescriptionForm';
import PrescriptionDetail from './components/prescriptions/PrescriptionDetail';
import Reports from './components/reports/Reports';
import AdminPage from './components/roles/AdminPage';
import PharmacistPage from './components/roles/PharmacistPage';
import DoctorPage from './components/roles/DoctorPage';
import PatientPage from './components/roles/PatientPage';
import './App.css';
import './styles/clinic-theme.css';

// Komponen untuk mengarahkan pengguna ke halaman berdasarkan peran
function HomeRedirect() {
  const { currentUser } = useAuth();

  if (currentUser?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  } else if (currentUser?.role === 'apoteker') {
    return <Navigate to="/pharmacist" replace />;
  } else if (currentUser?.role === 'dokter') {
    return <Navigate to="/doctor" replace />;
  } else if (currentUser?.role === 'pasien') {
    return <Navigate to="/patient" replace />;
  }

  return <Navigate to="/" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Rute untuk halaman login */}
            <Route path="/login" element={<Login />} />
            <Route path="/login/roles" element={<RoleSelection />} />
            <Route path="/login/:role" element={<RoleBasedLogin />} />

            {/* Rute untuk dashboard utama - bisa diakses oleh semua role */}
            <Route
              path="/"
              element={
                <ProtectedRoute allowedRoles={['admin', 'apoteker', 'dokter', 'pasien']}>
                  <Layout>
                    <HomeRedirect />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Rute yang dilindungi untuk admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <AdminPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Rute untuk laporan - hanya untuk admin */}
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <Reports />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Rute yang dilindungi untuk apoteker */}
            <Route
              path="/pharmacist"
              element={
                <ProtectedRoute allowedRoles={['apoteker']}>
                  <Layout>
                    <PharmacistPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Rute yang dilindungi untuk dokter */}
            <Route
              path="/doctor"
              element={
                <ProtectedRoute allowedRoles={['dokter']}>
                  <Layout>
                    <DoctorPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Rute yang dilindungi untuk pasien */}
            <Route
              path="/patient"
              element={
                <ProtectedRoute allowedRoles={['pasien']}>
                  <Layout>
                    <PatientPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Rute untuk fitur-fitur spesifik yang dilindungi berdasarkan peran */}
            <Route
              path="/patients"
              element={
                <ProtectedRoute allowedRoles={['admin', 'dokter']}>
                  <Layout>
                    <PatientList />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/doctors"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <DoctorList />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/examinations"
              element={
                <ProtectedRoute allowedRoles={['admin', 'dokter']}>
                  <Layout>
                    <ExaminationList />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/examinations/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'dokter']}>
                  <Layout>
                    <ExaminationDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/examinations/new"
              element={
                <ProtectedRoute allowedRoles={['admin', 'dokter']}>
                  <Layout>
                    <ExaminationForm />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/examinations/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['admin', 'dokter']}>
                  <Layout>
                    <ExaminationForm />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/medications"
              element={
                <ProtectedRoute allowedRoles={['admin', 'apoteker']}>
                  <Layout>
                    <MedicationList />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/prescriptions"
              element={
                <ProtectedRoute allowedRoles={['admin', 'dokter', 'apoteker']}>
                  <Layout>
                    <PrescriptionList />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/prescriptions/new"
              element={
                <ProtectedRoute allowedRoles={['admin', 'dokter']}>
                  <Layout>
                    <PrescriptionForm />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/prescriptions/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['admin', 'dokter']}>
                  <Layout>
                    <PrescriptionForm />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/prescriptions/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'dokter', 'apoteker']}>
                  <Layout>
                    <PrescriptionDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Redirect ke dashboard jika path tidak ditemukan */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;