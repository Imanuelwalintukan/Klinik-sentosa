// AdminPage.jsx
import React from 'react';
import { useAuth } from '../auth/AuthProvider';
import './AdminPage.css'; // Import CSS khusus untuk halaman admin

const AdminPage = () => {
  const { currentUser } = useAuth();

  return (
    <div className="admin-page">
      <h2>Selamat Datang, {currentUser?.name}!</h2>
      <p>Anda masuk sebagai Administrator. Anda memiliki akses penuh ke sistem manajemen klinik.</p>

      <div className="admin-dashboard">
        <h3>Menu Administrator</h3>
        <div className="admin-menu-grid">
          <div className="menu-item">
            <h4>Manajemen Pasien</h4>
            <p>Kelola data pasien</p>
            <div className="menu-actions">
              <a href="/patients" className="btn btn-primary">Lihat Daftar</a>
            </div>
          </div>

          <div className="menu-item">
            <h4>Manajemen Dokter</h4>
            <p>Kelola data dokter</p>
            <div className="menu-actions">
              <a href="/doctors" className="btn btn-primary">Lihat Daftar</a>
            </div>
          </div>

          <div className="menu-item">
            <h4>Manajemen Perawat</h4>
            <p>Kelola data perawat</p>
            <div className="menu-actions">
              <a href="/nurses" className="btn btn-primary">Lihat Daftar</a>
            </div>
          </div>

          <div className="menu-item">
            <h4>Manajemen Obat</h4>
            <p>Kelola data obat</p>
            <div className="menu-actions">
              <a href="/medications" className="btn btn-primary">Lihat Daftar</a>
            </div>
          </div>

          <div className="menu-item">
            <h4>Manajemen Pembayaran</h4>
            <p>Kelola metode pembayaran</p>
            <div className="menu-actions">
              <a href="/payment-methods" className="btn btn-primary">Kelola</a>
            </div>
          </div>

          <div className="menu-item">
            <h4>Laporan</h4>
            <p>Lihat laporan klinik</p>
            <div className="menu-actions">
              <a href="/reports" className="btn btn-primary">Lihat Laporan</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;