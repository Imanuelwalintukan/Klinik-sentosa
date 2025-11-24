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
import PatientManagementPage from './components/patients/PatientManagementPage';
import PatientList from './components/patients/PatientList';
import DoctorList from './components/doctors/DoctorList';
import ExaminationList from './components/examinations/ExaminationList';
import ExaminationDetail from './components/examinations/ExaminationDetail';
import ExaminationForm from './components/examinations/ExaminationForm';
import ExaminationRequestForm from './components/patients/ExaminationRequestForm';
import MedicationList from './components/medications/MedicationList';
import PrescriptionList from './components/prescriptions/PrescriptionList';
import PrescriptionForm from './components/prescriptions/PrescriptionForm';
import PrescriptionDetail from './components/prescriptions/PrescriptionDetail';
import DispensePage from './components/prescriptions/DispensePage';
import Reports from './components/reports/Reports';
import AdminPage from './components/roles/AdminPage';
import DoctorPage from './components/roles/DoctorPage';
import NursePage from './components/roles/NursePage';
import PatientPage from './components/roles/PatientPage';
import PatientRegistrationForm from './components/registrations/PatientRegistrationForm';
import PatientLogin from './components/auth/PatientLogin';
import NurseList from './components/nurses/NurseList';
import NurseForm from './components/nurses/NurseForm';
import VitalSignsCheck from './components/nurses/VitalSignsCheck';
import VitalSignsList from './components/nurses/VitalSignsList';
// Import komponen-komponen apoteker
import NewPharmacistPage from './components/pharmacists/PharmacistPage';
import PendingPrescriptions from './components/pharmacists/PendingPrescriptions';
import MedicineDispensingHistory from './components/pharmacists/MedicineDispensingHistory';
import MedicationManagement from './components/pharmacists/MedicationManagement';
import StockReport from './components/pharmacists/StockReport';
import ExaminationIntegration from './components/pharmacists/ExaminationIntegration';
// Import komponen-komponen EMR
import EMRPasien from './components/emr/EMRPasien';
import EMRDokter from './components/emr/EMRDokter';
import MedicationDoctorMapping from './components/patients/MedicationDoctorMapping';

// Import komponen-komponen laporan
import ReportDashboard from './components/reports/ReportDashboard';
import FinancialReport from './components/reports/FinancialReport';
import MedicineUsageReport from './components/reports/MedicineUsageReport';
import MonthlyReport from './components/reports/MonthlyReport';

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
  } else if (currentUser?.role === 'perawat') {
    return <Navigate to="/nurse" replace />;
  } else if (currentUser?.role === 'pasien') {
    return <Navigate to="/patient" replace />;
  }

  // Fallback jika role tidak ada atau tidak cocok
  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Rute Publik */}
            <Route path="/login" element={<Login />} />
            <Route path="/login/roles" element={<RoleSelection />} />
            <Route path="/login/:role" element={<RoleBasedLogin />} />
            <Route path="/patient-registration" element={<PatientRegistrationForm />} />
            <Route path="/patient-login" element={<PatientLogin />} />
            <Route path="/logout" element={<Logout />} />

            {/* Rute Utama yang Dilindungi */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <HomeRedirect />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Halaman Utama Peran */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Layout><AdminPage /></Layout></ProtectedRoute>} />
            <Route path="/doctor" element={<ProtectedRoute allowedRoles={['dokter']}><Layout><DoctorPage /></Layout></ProtectedRoute>} />
            <Route path="/nurse" element={<ProtectedRoute allowedRoles={['perawat']}><Layout><NursePage /></Layout></ProtectedRoute>} />
            <Route path="/patient" element={<ProtectedRoute allowedRoles={['pasien']}><Layout><PatientPage /></Layout></ProtectedRoute>} />
            <Route path="/patient/examination-request" element={<ProtectedRoute allowedRoles={['pasien']}><Layout><ExaminationRequestForm /></Layout></ProtectedRoute>} />
            <Route path="/medication-doctor" element={<ProtectedRoute allowedRoles={['pasien']}><Layout><MedicationDoctorMapping /></Layout></ProtectedRoute>} />
            <Route path="/pharmacist" element={<ProtectedRoute allowedRoles={['apoteker']}><Layout><NewPharmacistPage /></Layout></ProtectedRoute>} />

            {/* Manajemen Staf (Admin Only) */}
            <Route path="/doctors" element={<ProtectedRoute allowedRoles={['admin']}><Layout><DoctorList /></Layout></ProtectedRoute>} />
            <Route path="/nurses" element={<ProtectedRoute allowedRoles={['admin']}><Layout><NurseList /></Layout></ProtectedRoute>} />
            <Route path="/nurses/new" element={<ProtectedRoute allowedRoles={['admin']}><Layout><NurseForm /></Layout></ProtectedRoute>} />
            <Route path="/nurses/:id/edit" element={<ProtectedRoute allowedRoles={['admin']}><Layout><NurseForm /></Layout></ProtectedRoute>} />

            {/* Manajemen Pasien (Admin, Perawat, Dokter) */}
            <Route path="/patients" element={<ProtectedRoute allowedRoles={['admin', 'perawat', 'dokter']}><Layout><PatientManagementPage /></Layout></ProtectedRoute>} />

            {/* Alur Kerja Perawat */}
            <Route path="/nurses/vital-signs-check" element={<ProtectedRoute allowedRoles={['perawat']}><Layout><VitalSignsCheck /></Layout></ProtectedRoute>} />
            <Route path="/nurses/vital-signs-check/:patientId" element={<ProtectedRoute allowedRoles={['perawat']}><Layout><VitalSignsCheck /></Layout></ProtectedRoute>} />
            <Route path="/nurses/vital-signs-checks" element={<ProtectedRoute allowedRoles={['perawat', 'dokter']}><Layout><VitalSignsList /></Layout></ProtectedRoute>} />
            
            {/* Alur Kerja Dokter (Pemeriksaan) */}
            <Route path="/examinations" element={<ProtectedRoute allowedRoles={['dokter', 'perawat']}><Layout><ExaminationList /></Layout></ProtectedRoute>} />
            <Route path="/examinations/:id" element={<ProtectedRoute allowedRoles={['dokter', 'perawat']}><Layout><ExaminationDetail /></Layout></ProtectedRoute>} />
            <Route path="/examinations/new" element={<ProtectedRoute allowedRoles={['dokter']}><Layout><ExaminationForm /></Layout></ProtectedRoute>} />
            <Route path="/examinations/:id/edit" element={<ProtectedRoute allowedRoles={['dokter']}><Layout><ExaminationForm /></Layout></ProtectedRoute>} />

            {/* EMR (Rekam Medis Elektronik) */}
            <Route path="/emr/pasien/:id" element={<ProtectedRoute allowedRoles={['dokter', 'perawat', 'pasien']}><Layout><EMRPasien /></Layout></ProtectedRoute>} />
            <Route path="/emr/tambah/:id" element={<ProtectedRoute allowedRoles={['dokter']}><Layout><EMRDokter /></Layout></ProtectedRoute>} />

            {/* Alur Kerja Resep (Dokter & Apoteker) */}
            <Route path="/prescriptions" element={<ProtectedRoute allowedRoles={['dokter', 'apoteker']}><Layout><PrescriptionList /></Layout></ProtectedRoute>} />
            <Route path="/prescriptions/new" element={<ProtectedRoute allowedRoles={['dokter']}><Layout><PrescriptionForm /></Layout></ProtectedRoute>} />
            <Route path="/prescriptions/:id/edit" element={<ProtectedRoute allowedRoles={['dokter']}><Layout><PrescriptionForm /></Layout></ProtectedRoute>} />
            <Route path="/prescriptions/:id" element={<ProtectedRoute allowedRoles={['dokter', 'apoteker', 'pasien']}><Layout><PrescriptionDetail /></Layout></ProtectedRoute>} />

            {/* Alur Kerja Apoteker */}
            <Route path="/medications" element={<ProtectedRoute allowedRoles={['apoteker', 'admin']}><Layout><MedicationManagement /></Layout></ProtectedRoute>} />
            <Route path="/prescriptions/pending" element={<ProtectedRoute allowedRoles={['apoteker']}><Layout><PendingPrescriptions /></Layout></ProtectedRoute>} />
            <Route path="/prescriptions/history" element={<ProtectedRoute allowedRoles={['apoteker']}><Layout><MedicineDispensingHistory /></Layout></ProtectedRoute>} />
            <Route path="/dispense/:pemeriksaanId" element={<ProtectedRoute allowedRoles={['apoteker']}><Layout><DispensePage /></Layout></ProtectedRoute>} />
            <Route path="/integration/examinations" element={<ProtectedRoute allowedRoles={['apoteker']}><Layout><ExaminationIntegration /></Layout></ProtectedRoute>} />
            
            {/* Laporan (Umumnya Admin) */}
            <Route path="/reports" element={<ProtectedRoute allowedRoles={['admin']}><Layout><ReportDashboard /></Layout></ProtectedRoute>} />
            <Route path="/reports/financial" element={<ProtectedRoute allowedRoles={['admin']}><Layout><FinancialReport /></Layout></ProtectedRoute>} />
            <Route path="/reports/medicine-usage" element={<ProtectedRoute allowedRoles={['admin', 'apoteker']}><Layout><MedicineUsageReport /></Layout></ProtectedRoute>} />
            <Route path="/reports/monthly-summary" element={<ProtectedRoute allowedRoles={['admin']}><Layout><MonthlyReport /></Layout></ProtectedRoute>} />
            <Route path="/reports/medication-stock" element={<ProtectedRoute allowedRoles={['admin', 'apoteker']}><Layout><StockReport /></Layout></ProtectedRoute>} />

            {/* Rute fallback, arahkan ke halaman utama */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;