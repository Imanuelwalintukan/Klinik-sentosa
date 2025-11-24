// RoleSelection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const RoleSelection = () => {
  const navigate = useNavigate();

  const roles = [
    { id: 'admin', name: 'Administrator', description: 'Mengelola seluruh sistem klinik' },
    { id: 'dokter', name: 'Dokter', description: 'Melakukan pemeriksaan dan membuat resep' },
    { id: 'perawat', name: 'Perawat', description: 'Melakukan pemeriksaan awal sebelum diperiksa dokter' },
    { id: 'apoteker', name: 'Apoteker', description: 'Mengelola obat dan resep' },
    { id: 'pasien', name: 'Pasien', description: 'Melihat riwayat pemeriksaan' }
  ];

  const handleRoleSelect = (role) => {
    navigate(`/login/${role}`);
  };

  return (
    <div className="role-selection-container">
      <div className="role-selection">
        <h2>Pilih Peran Login</h2>
        <p>Silakan pilih peran yang sesuai dengan tanggung jawab Anda:</p>
        
        <div className="role-grid">
          {roles.map(role => (
            <div 
              key={role.id} 
              className="role-card"
              onClick={() => handleRoleSelect(role.id)}
            >
              <h3>{role.name}</h3>
              <p>{role.description}</p>
              <button className="btn btn-primary">Pilih</button>
            </div>
          ))}
        </div>
        
        <div className="role-actions">
          <a href="/login">Kembali ke Login</a>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;