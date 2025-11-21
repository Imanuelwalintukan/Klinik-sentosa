import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const MedicationForm = () => {
  const { id } = useParams(); // id will be empty if adding new medication
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nama_obat: '',
    deskripsi: '',
    stok: 0,
    harga: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // If id exists, fetch medication data to edit
  useEffect(() => {
    if (id) {
      fetchMedication();
    }
  }, [id]);

  const fetchMedication = async () => {
    try {
      const response = await axios.get(`/api/obat/${id}`);
      setFormData(response.data.data);
    } catch (err) {
      setError('Gagal mengambil data obat');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // For number inputs, ensure the value is a number
    const processedValue = name === 'stok' || name === 'harga' ? Number(value) : value;
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (id) {
        // Update medication
        await axios.put(`/api/obat/${id}`, formData);
        alert('Obat berhasil diperbarui');
      } else {
        // Add new medication
        await axios.post('/api/obat', formData);
        alert('Obat berhasil ditambahkan');
      }
      navigate('/medications'); // Return to medication list
    } catch (err) {
      setError('Gagal menyimpan data obat: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="medication-form">
      <h2>{id ? 'Edit Obat' : 'Tambah Obat Baru'}</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nama_obat">Nama Obat:</label>
          <input
            type="text"
            id="nama_obat"
            name="nama_obat"
            value={formData.nama_obat}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="deskripsi">Deskripsi:</label>
          <textarea
            id="deskripsi"
            name="deskripsi"
            value={formData.deskripsi}
            onChange={handleChange}
            className="form-control"
            rows="3"
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="stok">Stok:</label>
            <input
              type="number"
              id="stok"
              name="stok"
              value={formData.stok}
              onChange={handleChange}
              className="form-control"
              min="0"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="harga">Harga:</label>
            <input
              type="number"
              id="harga"
              name="harga"
              value={formData.harga}
              onChange={handleChange}
              className="form-control"
              min="0"
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Menyimpan...' : (id ? 'Update Obat' : 'Tambah Obat')}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/medications')}>
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};

export default MedicationForm;