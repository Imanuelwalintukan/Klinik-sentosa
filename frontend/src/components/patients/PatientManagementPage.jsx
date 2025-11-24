import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientList from './PatientList';
import PatientForm from './PatientForm';
import './Patient.css'; // Mengimpor style termasuk modal

const PatientManagementPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  const handleOpenModalForCreate = () => {
    setEditingPatientId(null);
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (id) => {
    setEditingPatientId(id);
    setIsModalOpen(true);
  };
  
  const handleExamine = (patientId) => {
    navigate(`/examinations/new?patientId=${patientId}`);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPatientId(null);
  };

  const handleSuccess = () => {
    handleCloseModal();
    setRefreshKey(oldKey => oldKey + 1);
  };

  return (
    <div className="patient-management">
      <div className="header">
        <h2>Manajemen Pasien</h2>
      </div>
      
      <PatientList 
        key={refreshKey} 
        onEdit={handleOpenModalForEdit}
        onAdd={handleOpenModalForCreate}
        onExamine={handleExamine}
      />

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingPatientId ? 'Edit Data Pasien' : 'Tambah Pasien Baru'}</h3>
              <button onClick={handleCloseModal} className="modal-close-btn">&times;</button>
            </div>
            <PatientForm 
              patientId={editingPatientId}
              onSuccess={handleSuccess} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManagementPage;
