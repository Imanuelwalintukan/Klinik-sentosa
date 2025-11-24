import React from 'react';
import { Link } from 'react-router-dom';
import './PharmacistPage.css';

const PharmacistPage = () => {
  return (
    <div className="pharmacist-page">
      <div className="dashboard-header">
        <h1>Selamat Datang, Apoteker!</h1>
        <p>Halaman dashboard untuk manajemen obat dan dispensing resep</p>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-cards">
          <div className="card">
            <h3>Manajemen Obat</h3>
            <p>Kelola stok obat, tambah, edit, dan hapus obat</p>
            <Link to="/medications" className="btn btn-primary">
              Kelola Obat
            </Link>
          </div>

          <div className="card">
            <h3>Resep Menunggu</h3>
            <p>Resep yang menunggu untuk diproses oleh apoteker</p>
            <Link to="/prescriptions/pending" className="btn btn-warning">
              Lihat Resep
            </Link>
          </div>

          <div className="card">
            <h3>Riwayat Dispensing</h3>
            <p>Lihat riwayat pemberian obat kepada pasien</p>
            <Link to="/prescriptions/history" className="btn btn-secondary">
              Lihat Riwayat
            </Link>
          </div>

          <div className="card">
            <h3>Laporan Stok</h3>
            <p>Lihat laporan stok obat yang tersedia</p>
            <Link to="/reports/medication-stock" className="btn btn-info">
              Lihat Laporan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacistPage;