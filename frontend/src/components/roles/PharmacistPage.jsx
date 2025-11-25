// PharmacistPage.jsx
import React from 'react';
import { useAuth } from '../auth/AuthProvider';
import './PharmacistPage.css'; // Import CSS khusus untuk halaman apoteker

const PharmacistPage = () => {
  const { currentUser } = useAuth();

  return (
    <div className="pharmacist-page">
      <h2>Selamat Datang, {currentUser?.name}!</h2>
      <p>Anda masuk sebagai Apoteker. Anda dapat mengelola obat dan resep di apotek.</p>

      <div className="pharmacist-dashboard">
        <h3>Menu Apoteker</h3>
        <div className="pharmacist-menu-grid">
          <div className="menu-item">
            <h4>Manajemen Obat</h4>
            <p>Kelola stok dan data obat</p>
            <div className="menu-actions">
              <a href="/medications" className="btn btn-primary">Lihat Daftar</a>
              <a href="/medications/new" className="btn btn-secondary">Tambah Obat</a>
            </div>
          </div>

          <div className="menu-item">
            <h4>Manajemen Resep</h4>
            <p>Kelola resep dari dokter</p>
            <div className="menu-actions">
              <a href="/prescriptions" className="btn btn-primary">Lihat Daftar</a>
            </div>
          </div>

          <div className="menu-item">
            <h4>Transaksi Obat</h4>
            <p>Proses penebusan resep oleh pasien</p>
            <div className="menu-actions">
              <a href="/dispense" className="btn btn-primary">Proses Transaksi</a>
            </div>
          </div>

          <div className="menu-item">
            <h4>Laporan Stok Obat</h4>
            <p>Lihat laporan stok obat</p>
            <div className="menu-actions">
              <a href="/reports/medication-stock" className="btn btn-primary">Lihat Laporan</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacistPage;