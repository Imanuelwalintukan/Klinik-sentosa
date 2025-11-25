import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './auth/AuthProvider';
import { Logout } from './auth/Logout';
import './Layout.css';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { currentUser } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  // Menentukan item menu mana yang tersedia berdasarkan peran pengguna
  const getMenuItems = () => {
    if (!currentUser) return [];
    const { role } = currentUser;

    let menu = [
      { path: '/', label: 'Dashboard', icon: 'icon-dashboard' },
    ];

    // Menu untuk Pasien
    if (role === 'pasien') {
      menu.push(
        { path: `/emr/pasien/${currentUser.id}`, label: 'Rekam Medis Saya', icon: 'icon-emr' },
        { path: `/prescriptions/${currentUser.id}`, label: 'Riwayat Resep', icon: 'icon-prescriptions' }
      );
    }

    // Menu untuk Perawat
    if (role === 'perawat') {
      menu.push(
        { path: '/patient-registration', label: 'Pendaftaran Pasien', icon: 'icon-patients' },
        { path: '/nurses/vital-signs-check', label: 'Pemeriksaan Awal', icon: 'icon-nurses' },
        { path: '/nurses/vital-signs-checks', label: 'Riwayat P. Awal', icon: 'icon-history' }
      );
    }

    // Menu untuk Dokter
    if (role === 'dokter') {
      menu.push(
        { path: '/patients', label: 'Daftar Pasien', icon: 'icon-patients' },
        { path: '/examinations', label: 'Pemeriksaan', icon: 'icon-examinations' },
        { path: '/prescriptions', label: 'Resep', icon: 'icon-prescriptions' }
      );
    }

    // Menu untuk Apoteker
    if (role === 'apoteker') {
      menu.push(
        { path: '/prescriptions/pending', label: 'Antrian Resep', icon: 'icon-prescriptions' },
        { path: '/medications', label: 'Manajemen Obat', icon: 'icon-medications' },
        { path: '/reports/medicine-usage', label: 'Laporan Obat', icon: 'icon-reports' }
      );
    }

    // Menu untuk Admin
    if (role === 'admin') {
      menu.push(
        { path: '/patients', label: 'Manajemen Pasien', icon: 'icon-patients' },
        { path: '/doctors', label: 'Manajemen Dokter', icon: 'icon-doctors' },
        { path: '/nurses', label: 'Manajemen Perawat', icon: 'icon-nurses' },
        { path: '/medications', label: 'Manajemen Obat', icon: 'icon-medications' },
        { path: '/reports', label: 'Laporan', icon: 'icon-reports' }
      );
    }

    return menu;
  };

  const menuItems = getMenuItems();

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Klinik Sentosa</h2>
          <button className="close-btn" onClick={() => setSidebarOpen(false)}>
            &times;
          </button>
        </div>
        <div className="user-info">
          <p><strong>{currentUser?.name}</strong></p>
          <p className="user-role">{currentUser?.role}</p>
        </div>
        <nav className="nav-menu">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link to={item.path} className={isActive(item.path)}>
                  <i className={item.icon}></i> {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Navigation */}
        <header className="top-nav">
          <button className="menu-toggle" onClick={toggleSidebar}>
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div className="header-right">
            <h1>Selamat Datang di Klinik Sentosa</h1>
            <div className="user-actions">
              {!currentUser && (
                <Link to="/register" className="btn btn-primary register-link">
                  Daftar Pasien Baru
                </Link>
              )}
              <span className="user-greeting">Halo, {currentUser?.name}</span>
              <Logout />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;