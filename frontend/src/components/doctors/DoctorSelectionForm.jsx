import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { useAuth } from '../auth/AuthProvider'; // Import useAuth

const DoctorSelectionForm = ({ onSelectDoctor, selectedSpecialization, onSpecializationChange }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const { isAuthenticated } = useAuth(); // Dapatkan status autentikasi

  useEffect(() => {
    if (isAuthenticated) { // Hanya fetch jika sudah terautentikasi
      fetchDoctors();
    } else {
      setLoading(false); // Jika tidak terautentikasi, hentikan loading
    }
  }, [selectedSpecialization, isAuthenticated]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      let url = '/dokter';

      // Jika ada filter spesialisasi, tambahkan parameter
      if (selectedSpecialization) {
        url += `?spesialis=${encodeURIComponent(selectedSpecialization)}`;
      }

      const response = await axios.get(url);
      setDoctors(response.data.data || []);
    } catch (err) {
      setError('Gagal mengambil data dokter');
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = (doctorId) => {
    setSelectedDoctor(doctorId);
    onSelectDoctor(doctorId);
  };

  const uniqueSpecializations = [...new Set(doctors.map(doctor => doctor.spesialis).filter(Boolean))];

  if (loading) return <div className="loading">Memuat data dokter...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="doctor-selection-form">
      <div className="form-group">
        <label htmlFor="specialization">Spesialisasi:</label>
        <select
          id="specialization"
          value={selectedSpecialization || ''}
          onChange={(e) => onSpecializationChange(e.target.value)}
          className="form-control"
        >
          <option value="">Pilih Spesialisasi</option>
          {uniqueSpecializations.map((spec, index) => (
            <option key={index} value={spec}>{spec}</option>
          ))}
        </select>
      </div>

      <div className="doctors-grid">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className={`doctor-card ${selectedDoctor === doctor.id ? 'selected' : ''}`}
            onClick={() => handleDoctorSelect(doctor.id)}
          >
            <h4>{doctor.nama}</h4>
            <p className="specialization">{doctor.spesialis}</p>
            <p className="phone">{doctor.nomor_telepon}</p>
            <p className="address">{doctor.alamat}</p>
          </div>
        ))}
      </div>

      {doctors.length === 0 && (
        <p className="no-doctors">Tidak ada dokter dengan spesialisasi ini.</p>
      )}
    </div>
  );
};

export default DoctorSelectionForm;