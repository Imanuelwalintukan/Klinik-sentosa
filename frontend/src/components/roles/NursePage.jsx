import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import './NursePage.css';

const NursePage = () => {
  const { currentUser } = useAuth();

  return (
    <div className="nurse-page">
      <h2>Selamat Datang, {currentUser?.name}!</h2>
      <p>Anda masuk sebagai Perawat. Anda dapat membantu dalam pemeriksaan awal pasien.</p>

      <div className="nurse-dashboard">
        <h3>Menu Perawat</h3>
        <div className="nurse-menu-grid">
          <div className="menu-item">
            <h4>Pendaftaran Pasien</h4>
            <p>Daftarkan pasien baru ke dalam sistem</p>
            <div className="menu-actions">
              <Link to="/patient-registration" className="btn btn-primary">Daftar Pasien</Link>
            </div>
          </div>

          <div className="menu-item">
            <h4>Pemeriksaan Awal</h4>
            <p>Lakukan pemeriksaan awal pada pasien</p>
            <div className="menu-actions">
              <Link to="/nurses/vital-signs-check" className="btn btn-primary">Lakukan Pemeriksaan</Link>
            </div>
          </div>

          <div className="menu-item">
            <h4>Riwayat Pemeriksaan Awal</h4>
            <p>Lihat riwayat pemeriksaan awal yang telah dilakukan</p>
            <div className="menu-actions">
              <Link to="/nurses/vital-signs-checks" className="btn btn-primary">Lihat Riwayat</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NursePage;