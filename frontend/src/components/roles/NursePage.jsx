import React from 'react';
import { Link } from 'react-router-dom';
import './NursePage.css';

const NursePage = () => {
  return (
    <div className="nurse-page">
      <div className="dashboard-header">
        <h1>Selamat Datang, Perawat!</h1>
        <p>Halaman dashboard untuk manajemen pemeriksaan awal pasien</p>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-cards">
          <div className="card">
            <h3>Pemeriksaan Awal</h3>
            <p>Lakukan pemeriksaan awal pada pasien sebelum diperiksa dokter</p>
            <Link to="/nurses/vital-signs-check" className="btn btn-primary">
              Mulai Pemeriksaan
            </Link>
          </div>

          <div className="card">
            <h3>Riwayat Pemeriksaan</h3>
            <p>Lihat riwayat pemeriksaan awal yang telah dilakukan</p>
            <Link to="/nurses/vital-signs-checks" className="btn btn-secondary">
              Lihat Riwayat
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NursePage;