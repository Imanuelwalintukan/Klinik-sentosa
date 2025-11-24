import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { useAuth } from '../auth/AuthProvider'; // Import useAuth

// Komponen form ini bisa untuk 'create' dan 'edit'
const PatientForm = ({ patientId, onSuccess }) => {
  const [formData, setFormData] = useState({
    nama: '',
    nomor_telepon: '',
    alamat: '',
    tanggal_lahir: '',
    jenis_kelamin: 'Laki-laki',
    nomor_bpjs: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isEditMode = !!patientId;
  const { isAuthenticated } = useAuth(); // Dapatkan status autentikasi

  useEffect(() => {
    if (isEditMode && isAuthenticated) { // Hanya fetch jika edit mode dan sudah terautentikasi
      setLoading(true);
      axios.get(`/pasien/${patientId}`)
        .then(response => {
          if (response.data.success) {
            // Format tanggal YYYY-MM-DD untuk input type="date"
            const data = { ...response.data.data, tanggal_lahir: response.data.data.tanggal_lahir.split('T')[0] };
            setFormData(data);
          }
        })
        .catch(err => {
          console.error(err);
          setError('Gagal memuat data pasien.');
        })
        .finally(() => setLoading(false));
    } else if (isEditMode && !isAuthenticated) {
        setLoading(false); // Jika edit mode tapi tidak terautentikasi, hentikan loading
    }
  }, [patientId, isEditMode, isAuthenticated]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;
      if (isEditMode) {
        response = await axios.put(`/pasien/${patientId}`, formData);
      } else {
        response = await axios.post('/pasien', formData);
      }

      if (response.data.success) {
        alert(`Data pasien berhasil ${isEditMode ? 'diperbarui' : 'disimpan'}!`);
        if (onSuccess) {
          onSuccess(); // Panggil callback untuk menutup form/modal atau refresh
        }
      } else {
        throw new Error(response.data.message || 'Operasi gagal.');
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || err.message || 'Terjadi kesalahan server.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && isEditMode) {
      return <p>Memuat data...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="patient-form">
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="nama">Nama</label>
        <input type="text" id="nama" name="nama" value={formData.nama} onChange={handleChange} required />
      </div>
      
      <div className="form-group">
        <label htmlFor="nomor_telepon">Nomor Telepon</label>
        <input type="tel" id="nomor_telepon" name="nomor_telepon" value={formData.nomor_telepon} onChange={handleChange} required />
      </div>
      
      <div className="form-group">
        <label htmlFor="alamat">Alamat</label>
        <textarea id="alamat" name="alamat" value={formData.alamat} onChange={handleChange} required />
      </div>
      
      <div className="form-group">
        <label htmlFor="tanggal_lahir">Tanggal Lahir</label>
        <input type="date" id="tanggal_lahir" name="tanggal_lahir" value={formData.tanggal_lahir} onChange={handleChange} required />
      </div>
      
      <div className="form-group">
        <label htmlFor="jenis_kelamin">Jenis Kelamin</label>
        <select id="jenis_kelamin" name="jenis_kelamin" value={formData.jenis_kelamin} onChange={handleChange} required>
          <option value="Laki-laki">Laki-laki</option>
          <option value="Perempuan">Perempuan</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="nomor_bpjs">Nomor BPJS (Opsional)</label>
        <input type="text" id="nomor_bpjs" name="nomor_bpjs" value={formData.nomor_bpjs || ''} onChange={handleChange} />
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Menyimpan...' : (isEditMode ? 'Perbarui Data' : 'Simpan Pasien Baru')}
      </button>
    </form>
  );
};

export default PatientForm;
