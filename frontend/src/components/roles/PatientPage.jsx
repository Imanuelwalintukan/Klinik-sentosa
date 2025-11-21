// PatientPage.jsx
import React from 'react';
import { useAuth } from '../auth/AuthProvider';

const PatientPage = () => {
  const { currentUser } = useAuth();

  return (
    <div className="patient-page">
      <h2>Selamat Datang, {currentUser?.name}!</h2>
      <p>Anda masuk sebagai Pasien. Anda dapat melihat riwayat pemeriksaan Anda.</p>
      
      <div className="patient-dashboard">
        <h3>Menu Pasien</h3>
        <div className="patient-menu-grid">
          <div className="menu-item">
            <h4>Riwayat Pemeriksaan</h4>
            <p>Lihat riwayat pemeriksaan medis Anda</p>
            <div className="menu-actions">
              <button className="btn btn-primary">Lihat Riwayat</button>
            </div>
          </div>
          
          <div className="menu-item">
            <h4>Jadwal Pemeriksaan</h4>
            <p>Lihat jadwal pemeriksaan Anda</p>
            <div className="menu-actions">
              <button className="btn btn-primary">Lihat Jadwal</button>
            </div>
          </div>
          
          <div className="menu-item">
            <h4>Resep Saya</h4>
            <p>Lihat resep yang telah diberikan dokter</p>
            <div className="menu-actions">
              <button className="btn btn-primary">Lihat Resep</button>
            </div>
          </div>
          
          <div className="menu-item">
            <h4>Profil Saya</h4>
            <p>Lihat dan kelola profil Anda</p>
            <div className="menu-actions">
              <button className="btn btn-primary">Lihat Profil</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientPage;