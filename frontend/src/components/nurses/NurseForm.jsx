import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider'; // Import useAuth
import './Nurse.css';

const NurseForm = () => {
  const { id } = useParams(); // id will be empty if adding new nurse
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nama: '',
    nomor_telepon: '',
    alamat: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth(); // Dapatkan status autentikasi

  // If id exists, fetch nurse data to edit
  useEffect(() => {
    if (id && isAuthenticated) { // Hanya fetch jika ada ID dan sudah terautentikasi
      fetchNurse();
    } else if (id && !isAuthenticated) {
        setLoading(false); // Jika edit mode tapi tidak terautentikasi, hentikan loading
    }
  }, [id, isAuthenticated]);

  const fetchNurse = async () => {
    try {
      const response = await axios.get(`/perawat/${id}`);
      setFormData(response.data.data);
    } catch (err) {
      setError('Gagal mengambil data perawat');
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
        // Update nurse
        await axios.put(`/perawat/${id}`, formData);
        alert('Data perawat berhasil diperbarui');
      } else {
        // Add new nurse
        await axios.post('/perawat', formData);
        alert('Perawat baru berhasil ditambahkan');
      }
      navigate('/nurses'); // Return to nurse list
    } catch (err) {
      setError('Gagal menyimpan data perawat: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nurse-form">
      <h2>{id ? 'Edit Perawat' : 'Tambah Perawat Baru'}</h2>

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
            rows="3"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Menyimpan...' : (id ? 'Update Perawat' : 'Tambah Perawat')}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/nurses')}>
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};

export default NurseForm;