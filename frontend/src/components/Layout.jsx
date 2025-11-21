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

    const items = [
      { path: '/', label: 'Dashboard', icon: 'icon-dashboard', roles: ['admin', 'apoteker', 'dokter', 'pasien'] },
      { path: '/patients', label: 'Pasien', icon: 'icon-patients', roles: ['admin', 'dokter'] },
      { path: '/doctors', label: 'Dokter', icon: 'icon-doctors', roles: ['admin'] },
      { path: '/examinations', label: 'Pemeriksaan', icon: 'icon-examinations', roles: ['admin', 'dokter'] },
      { path: '/medications', label: 'Obat', icon: 'icon-medications', roles: ['admin', 'apoteker'] },
      { path: '/prescriptions', label: 'Resep', icon: 'icon-prescriptions', roles: ['admin', 'dokter', 'apoteker'] },
      { path: '/reports', label: 'Laporan', icon: 'icon-reports', roles: ['admin'] },
    ];

    // Filter berdasarkan peran pengguna
    return items.filter(item => item.roles.includes(currentUser.role));
  };

  const menuItems = getMenuItems();

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Klinik Sentosa</h2>
          <button className="close-btn" onClick={toggleSidebar}>
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