// DoctorPage.jsx
import React from 'react';
import { useAuth } from '../auth/AuthProvider';

const DoctorPage = () => {
  const { currentUser } = useAuth();

  return (
    <div className="doctor-page">
      <h2>Selamat Datang, {currentUser?.name}!</h2>
      <p>Anda masuk sebagai Dokter. Anda dapat melakukan pemeriksaan dan membuat resep untuk pasien.</p>
      
      <div className="doctor-dashboard">
        <h3>Menu Dokter</h3>
        <div className="doctor-menu-grid">
          <div className="menu-item">
            <h4>Manajemen Pasien</h4>
            <p>Lihat dan kelola data pasien</p>
            <div className="menu-actions">
              <a href="/patients" className="btn btn-primary">Lihat Daftar</a>
            </div>
          </div>
          
          <div className="menu-item">
            <h4>Manajemen Pemeriksaan</h4>
            <p>Lakukan pemeriksaan dan tambah data pemeriksaan</p>
            <div className="menu-actions">
              <a href="/examinations" className="btn btn-primary">Lihat Daftar</a>
              <a href="/examinations/new" className="btn btn-secondary">Tambah Pemeriksaan</a>
            </div>
          </div>

          <div className="menu-item">
            <h4>Laporan Klinik</h4>
            <p>Lihat dan cetak laporan statistik klinik</p>
            <div className="menu-actions">
              <a href="/reports" className="btn btn-primary">Lihat Laporan</a>

            </div>
          </div>
          
          <div className="menu-item">
            <h4>Manajemen Resep</h4>
            <p>Buat dan kelola resep untuk pasien</p>
            <div className="menu-actions">
              <a href="/prescriptions" className="btn btn-primary">Lihat Daftar</a>
              <a href="/prescriptions/new" className="btn btn-secondary">Buat Resep</a>
            </div>
          </div>
          
          <div className="menu-item">
            <h4>Riwayat Pemeriksaan Saya</h4>
            <p>Lihat pemeriksaan yang telah Anda lakukan</p>
            <div className="menu-actions">
              <button className="btn btn-primary">Lihat Riwayat</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorPage;