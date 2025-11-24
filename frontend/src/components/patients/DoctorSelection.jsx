import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { useAuth } from '../auth/AuthProvider';
import './DoctorSelection.css'; // Import file CSS untuk styling

const DoctorSelection = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  // Ambil semua dokter saat komponen dimuat
  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [doctors, selectedSpecialization, searchTerm]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/dokter');
      setDoctors(response.data.data || []);
    } catch (err) {
      setError('Gagal mengambil data dokter');
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    if (!Array.isArray(doctors)) {
      setFilteredDoctors([]);
      return;
    }

    let result = [...doctors];

    // Filter berdasarkan spesialisasi
    if (selectedSpecialization) {
      result = result.filter(doctor =>
        doctor.spesialis &&
        doctor.spesialis.toLowerCase().includes(selectedSpecialization.toLowerCase())
      );
    }

    // Filter berdasarkan nama dokter
    if (searchTerm) {
      result = result.filter(doctor =>
        doctor.nama &&
        doctor.nama.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDoctors(result);
  };

  // Dapatkan spesialisasi unik untuk dropdown
  const specializations = [...new Set(doctors.map(doctor => doctor.spesialis))];

  if (loading) return <div className="loading">Memuat daftar dokter...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="doctor-selection">
      <h3>Pilih Dokter</h3>

      <div className="filters" style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'end' }}>
        <div className="search-box">
          <label htmlFor="searchTerm">Cari Dokter:</label>
          <input
            type="text"
            id="searchTerm"
            placeholder="Cari dokter berdasarkan nama..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
          />
        </div>

        <div className="filter-select">
          <label htmlFor="specializationFilter">Spesialisasi:</label>
          <select
            id="specializationFilter"
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
            className="form-control"
          >
            <option value="">Semua Spesialisasi</option>
            {specializations.map((spec, index) => (
              <option key={index} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="doctor-grid">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doctor) => (
            <div key={doctor.id} className="doctor-card">
              <div className="doctor-info">
                <h4>{doctor.nama}</h4>
                <p className="specialization">{doctor.spesialis}</p>
                <p className="contact">Telp: {doctor.nomor_telepon}</p>
                <p className="address">Alamat: {doctor.alamat}</p>
              </div>
              <div className="doctor-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    // Redirect ke halaman permintaan pemeriksaan dengan dokter tertentu
                    window.location.href = `#/examinations/new?doctorId=${doctor.id}`;
                  }}
                >
                  Pilih Dokter Ini
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-data">Tidak ditemukan dokter sesuai kriteria pencarian.</p>
        )}
      </div>
    </div>
  );
};

export default DoctorSelection;