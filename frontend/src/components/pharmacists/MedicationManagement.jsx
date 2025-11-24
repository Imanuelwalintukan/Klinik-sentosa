import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { useAuth } from '../auth/AuthProvider'; // Import useAuth

const MedicationManagement = () => {
  const [medications, setMedications] = useState([]);
  const [formData, setFormData] = useState({
    nama_obat: '',
    deskripsi: '',
    stok: 0,
    harga: 0
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth(); // Dapatkan status autentikasi

  useEffect(() => {
    if (isAuthenticated) { // Hanya fetch jika sudah terautentikasi
      fetchMedications();
    } else {
      setLoading(false); // Jika tidak terautentikasi, hentikan loading
    }
  }, [isAuthenticated]);

  const fetchMedications = async () => {
    try {
      const response = await axios.get('/obat');
      setMedications(response.data.data);
    } catch (err) {
      setError('Gagal mengambil data obat');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stok' || name === 'harga' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update medication
        await axios.put(`/obat/${editingId}`, formData);
        alert('Obat berhasil diperbarui');
      } else {
        // Create new medication
        await axios.post('/obat', formData);
        alert('Obat baru berhasil ditambahkan');
      }
      
      // Reset form
      setFormData({ nama_obat: '', deskripsi: '', stok: 0, harga: 0 });
      setEditingId(null);
      fetchMedications();
    } catch (err) {
      setError('Gagal menyimpan data obat: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (medication) => {
    setFormData({
      nama_obat: medication.nama_obat,
      deskripsi: medication.deskripsi,
      stok: medication.stok,
      harga: medication.harga
    });
    setEditingId(medication.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus obat ini?')) {
      try {
        await axios.delete(`/obat/${id}`);
        fetchMedications();
        alert('Obat berhasil dihapus');
      } catch (err) {
        setError('Gagal menghapus obat: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleCancelEdit = () => {
    setFormData({ nama_obat: '', deskripsi: '', stok: 0, harga: 0 });
    setEditingId(null);
  };

  if (loading) return <div className="loading">Memuat data obat...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="medication-management">
      <h2>Manajemen Obat</h2>
      
      <div className="form-container">
        <h3>{editingId ? 'Edit Obat' : 'Tambah Obat Baru'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
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
              <label htmlFor="harga">Harga:</label>
              <input
                type="number"
                id="harga"
                name="harga"
                value={formData.harga}
                onChange={handleChange}
                className="form-control"
                min="0"
                required
              />
            </div>
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
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="deskripsi">Deskripsi:</label>
              <input
                type="text"
                id="deskripsi"
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update Obat' : 'Tambah Obat'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="table-container">
        <h3>Daftar Obat</h3>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama Obat</th>
              <th>Deskripsi</th>
              <th>Stok</th>
              <th>Harga</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {medications.map((medication) => (
              <tr key={medication.id}>
                <td>{medication.id}</td>
                <td>{medication.nama_obat}</td>
                <td>{medication.deskripsi || '-'}</td>
                <td>
                  <span className={`stock-indicator ${medication.stok < 10 ? 'low-stock' : ''}`}>
                    {medication.stok}
                  </span>
                </td>
                <td>Rp {Number(medication.harga).toLocaleString('id-ID')}</td>
                <td>
                  <button 
                    className="btn btn-sm btn-warning"
                    onClick={() => handleEdit(medication)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(medication.id)}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MedicationManagement;