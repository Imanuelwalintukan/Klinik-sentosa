import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ExaminationForm = () => {
  const { id } = useParams(); // id will be empty if adding new examination
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    id_pasien: '',
    id_dokter: '',
    tanggal_pemeriksaan: '',
    keluhan: '',
    diagnosa: '',
    rekomendasi_pengobatan: ''
  });
  
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch patient and doctor data when component loads
  useEffect(() => {
    fetchPatients();
    fetchDoctors();
    
    // If id exists, fetch examination data to edit
    if (id) {
      fetchExamination();
    }
  }, [id]);

  const fetchPatients = async () => {
    try {
      const response = await axios.get('/api/pasien');
      setPatients(response.data.data);
    } catch (err) {
      setError('Gagal mengambil data pasien');
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('/api/dokter');
      setDoctors(response.data.data);
    } catch (err) {
      setError('Gagal mengambil data dokter');
    }
  };

  const fetchExamination = async () => {
    try {
      const response = await axios.get(`/api/pemeriksaan/${id}`);
      setFormData(response.data.data);
    } catch (err) {
      setError('Gagal mengambil data pemeriksaan');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (id) {
        // Update examination
        await axios.put(`/api/pemeriksaan/${id}`, formData);
        alert('Pemeriksaan berhasil diperbarui');
      } else {
        // Add new examination
        await axios.post('/api/pemeriksaan', formData);
        alert('Pemeriksaan berhasil ditambahkan');
      }
      navigate('/examinations'); // Return to examination list
    } catch (err) {
      setError('Gagal menyimpan data pemeriksaan: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="examination-form">
      <h2>{id ? 'Edit Pemeriksaan' : 'Tambah Pemeriksaan Baru'}</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="id_pasien">Pasien:</label>
            <select
              id="id_pasien"
              name="id_pasien"
              value={formData.id_pasien}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="">Pilih Pasien</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>{patient.nama}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="id_dokter">Dokter:</label>
            <select
              id="id_dokter"
              name="id_dokter"
              value={formData.id_dokter}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="">Pilih Dokter</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>{doctor.nama} ({doctor.spesialis})</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="tanggal_pemeriksaan">Tanggal Pemeriksaan:</label>
          <input
            type="datetime-local"
            id="tanggal_pemeriksaan"
            name="tanggal_pemeriksaan"
            value={formData.tanggal_pemeriksaan ? formData.tanggal_pemeriksaan.substring(0, 16) : ''}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="keluhan">Keluhan:</label>
          <textarea
            id="keluhan"
            name="keluhan"
            value={formData.keluhan}
            onChange={handleChange}
            className="form-control"
            rows="3"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="diagnosa">Diagnosa:</label>
          <textarea
            id="diagnosa"
            name="diagnosa"
            value={formData.diagnosa}
            onChange={handleChange}
            className="form-control"
            rows="3"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="rekomendasi_pengobatan">Rekomendasi Pengobatan:</label>
          <textarea
            id="rekomendasi_pengobatan"
            name="rekomendasi_pengobatan"
            value={formData.rekomendasi_pengobatan}
            onChange={handleChange}
            className="form-control"
            rows="3"
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Menyimpan...' : (id ? 'Update Pemeriksaan' : 'Tambah Pemeriksaan')}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/examinations')}>
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExaminationForm;