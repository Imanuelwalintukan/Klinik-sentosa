import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const PrescriptionForm = () => {
  const { id } = useParams(); // id will be empty if adding new prescription
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    id_pemeriksaan: '',
    id_obat: '',
    jumlah: 1,
    aturan_pakai: ''
  });
  
  const [examinations, setExaminations] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch examination and medication data when component loads
  useEffect(() => {
    fetchExaminations();
    fetchMedications();
    
    // If id exists, fetch prescription data to edit
    if (id) {
      fetchPrescription();
    }
  }, [id]);

  const fetchExaminations = async () => {
    try {
      const response = await axios.get('/api/pemeriksaan');
      setExaminations(response.data.data);
    } catch (err) {
      setError('Gagal mengambil data pemeriksaan');
    }
  };

  const fetchMedications = async () => {
    try {
      const response = await axios.get('/api/obat');
      setMedications(response.data.data);
    } catch (err) {
      setError('Gagal mengambil data obat');
    }
  };

  const fetchPrescription = async () => {
    try {
      const response = await axios.get(`/api/resep/${id}`);
      setFormData(response.data.data);
    } catch (err) {
      setError('Gagal mengambil data resep');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // For amount input, ensure the value is a number
    const processedValue = name === 'jumlah' ? Number(value) : value;
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
        // Update prescription
        await axios.put(`/api/resep/${id}`, formData);
        alert('Resep berhasil diperbarui');
      } else {
        // Add new prescription
        await axios.post('/api/resep', formData);
        alert('Resep berhasil ditambahkan');
      }
      navigate('/prescriptions'); // Return to prescription list
    } catch (err) {
      setError('Gagal menyimpan data resep: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prescription-form">
      <h2>{id ? 'Edit Resep' : 'Tambah Resep Baru'}</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="id_pemeriksaan">Pemeriksaan:</label>
            <select
              id="id_pemeriksaan"
              name="id_pemeriksaan"
              value={formData.id_pemeriksaan}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="">Pilih Pemeriksaan</option>
              {examinations.map(examination => (
                <option key={examination.id} value={examination.id}>
                  {examination.nama_pasien} - {examination.tanggal_pemeriksaan ? new Date(examination.tanggal_pemeriksaan).toLocaleDateString() : '-'}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="id_obat">Obat:</label>
            <select
              id="id_obat"
              name="id_obat"
              value={formData.id_obat}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="">Pilih Obat</option>
              {medications.map(medication => (
                <option key={medication.id} value={medication.id}>
                  {medication.nama_obat} - Stok: {medication.stok}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="jumlah">Jumlah:</label>
            <input
              type="number"
              id="jumlah"
              name="jumlah"
              value={formData.jumlah}
              onChange={handleChange}
              className="form-control"
              min="1"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="aturan_pakai">Aturan Pakai:</label>
            <input
              type="text"
              id="aturan_pakai"
              name="aturan_pakai"
              value={formData.aturan_pakai}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Menyimpan...' : (id ? 'Update Resep' : 'Tambah Resep')}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/prescriptions')}>
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};

export default PrescriptionForm;