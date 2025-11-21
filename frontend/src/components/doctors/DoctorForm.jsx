import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const DoctorForm = () => {
  const { id } = useParams(); // id akan kosong jika menambahkan dokter baru
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nama: '',
    spesialis: '',
    nomor_telepon: '',
    alamat: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Jika id ada, ambil data dokter yang akan diedit
  useEffect(() => {
    if (id) {
      fetchDoctor();
    }
  }, [id]);

  const fetchDoctor = async () => {
    try {
      const response = await axios.get(`/api/dokter/${id}`);
      setFormData(response.data.data);
    } catch (err) {
      setError('Gagal mengambil data dokter');
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
        // Update dokter
        await axios.put(`/api/dokter/${id}`, formData);
        alert('Dokter berhasil diperbarui');
      } else {
        // Tambah dokter baru
        await axios.post('/api/dokter', formData);
        alert('Dokter berhasil ditambahkan');
      }
      navigate('/doctors'); // Kembali ke daftar dokter
    } catch (err) {
      setError('Gagal menyimpan data dokter: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="doctor-form">
      <h2>{id ? 'Edit Dokter' : 'Tambah Dokter Baru'}</h2>
      
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
          <label htmlFor="spesialis">Spesialis:</label>
          <input
            type="text"
            id="spesialis"
            name="spesialis"
            value={formData.spesialis}
            onChange={handleChange}
            className="form-control"
            required
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
        
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Menyimpan...' : (id ? 'Update Dokter' : 'Tambah Dokter')}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/doctors')}>
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorForm;