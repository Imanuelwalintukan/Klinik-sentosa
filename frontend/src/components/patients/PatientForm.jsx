import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const PatientForm = () => {
  const { id } = useParams(); // id akan kosong jika menambahkan pasien baru
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nama: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    alamat: '',
    nomor_telepon: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Jika id ada, ambil data pasien yang akan diedit
  useEffect(() => {
    if (id) {
      fetchPatient();
    }
  }, [id]);

  const fetchPatient = async () => {
    try {
      const response = await axios.get(`/api/pasien/${id}`);
      setFormData(response.data.data);
    } catch (err) {
      setError('Gagal mengambil data pasien');
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
        // Update pasien
        await axios.put(`/api/pasien/${id}`, formData);
        alert('Pasien berhasil diperbarui');
      } else {
        // Tambah pasien baru
        await axios.post('/api/pasien', formData);
        alert('Pasien berhasil ditambahkan');
      }
      navigate('/patients'); // Kembali ke daftar pasien
    } catch (err) {
      setError('Gagal menyimpan data pasien: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="patient-form">
      <h2>{id ? 'Edit Pasien' : 'Tambah Pasien Baru'}</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nama">Nama:</label>
          <input
            type="text"
            id="nama"
            name="nama"
            value={formData.nama}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="tanggal_lahir">Tanggal Lahir:</label>
          <input
            type="date"
            id="tanggal_lahir"
            name="tanggal_lahir"
            value={formData.tanggal_lahir}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="jenis_kelamin">Jenis Kelamin:</label>
          <select
            id="jenis_kelamin"
            name="jenis_kelamin"
            value={formData.jenis_kelamin}
            onChange={handleChange}
            className="form-control"
          >
            <option value="">Pilih jenis kelamin</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="alamat">Alamat:</label>
          <textarea
            id="alamat"
            name="alamat"
            value={formData.alamat}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="nomor_telepon">Nomor Telepon:</label>
          <input
            type="text"
            id="nomor_telepon"
            name="nomor_telepon"
            value={formData.nomor_telepon}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Menyimpan...' : (id ? 'Update Pasien' : 'Tambah Pasien')}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/patients')}>
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;