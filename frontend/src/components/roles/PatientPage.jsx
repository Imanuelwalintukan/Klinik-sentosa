// PatientPage.jsx
import React from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import DoctorSelection from '../patients/DoctorSelection';
import './PatientPage.css'; // Tambahkan file CSS untuk styling khusus

const PatientPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="patient-page">
      <h2>Selamat Datang, {currentUser?.nama || currentUser?.name}!</h2>
      <p>Anda masuk sebagai Pasien. Anda dapat melihat riwayat pemeriksaan Anda dan memilih dokter sesuai kebutuhan.</p>

      {/* Bagian Pemilihan Dokter */}
      <div className="doctor-selection-section">
        <h3>Cari dan Pilih Dokter</h3>
        <DoctorSelection />
      </div>

      <div className="patient-dashboard">
        <h3>Menu Pasien</h3>
        <div className="patient-menu-grid">
          <div className="menu-item">
            <h4>Pilih Dokter & Buat Permintaan Pemeriksaan</h4>
            <p>Cari dokter dan buat permintaan pemeriksaan sesuai dengan keluhan Anda</p>
            <div className="menu-actions">
              <button
                className="btn btn-primary"
                onClick={() => {
                  // Gulir ke bagian pemilihan dokter
                  document.querySelector('.doctor-selection-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Cari Dokter
              </button>
            </div>
          </div>

          <div className="menu-item">
            <h4>Riwayat Pemeriksaan</h4>
            <p>Lihat riwayat pemeriksaan medis Anda</p>
            <div className="menu-actions">
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/emr/pasien/${currentUser?.id}`)}
              >
                Lihat Riwayat
              </button>
            </div>
          </div>

          <div className="menu-item">
            <h4>Jadwal Pemeriksaan</h4>
            <p>Lihat jadwal pemeriksaan Anda</p>
            <div className="menu-actions">
              <button className="btn btn-primary" onClick={() => navigate('/examinations')}>
                Lihat Jadwal
              </button>
            </div>
          </div>

          <div className="menu-item">
            <h4>Resep Saya</h4>
            <p>Lihat resep yang telah diberikan dokter</p>
            <div className="menu-actions">
              <button className="btn btn-primary" onClick={() => navigate(`/prescriptions/${currentUser?.id}`)}>
                Lihat Resep
              </button>
            </div>
          </div>

          <div className="menu-item">
            <h4>Profil Saya</h4>
            <p>Lihat dan kelola profil Anda</p>
            <div className="menu-actions">
              <button className="btn btn-primary" onClick={() => navigate('/profile')}>
                Lihat Profil
              </button>
            </div>
          </div>

          <div className="menu-item">
            <h4>Permintaan Pemeriksaan Saya</h4>
            <p>Lihat status permintaan pemeriksaan Anda</p>
            <div className="menu-actions">
              <button
                className="btn btn-primary"
                onClick={() => navigate('/examinations')}
              >
                Lihat Status
              </button>
            </div>
          </div>

          <div className="menu-item">
            <h4>Daftar Obat & Dokter</h4>
            <p>Lihat obat-obatan yang tersedia dan dokter spesialis yang relevan</p>
            <div className="menu-actions">
              <button
                className="btn btn-primary"
                onClick={() => navigate('/medication-doctor')}
              >
                Lihat Daftar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientPage;