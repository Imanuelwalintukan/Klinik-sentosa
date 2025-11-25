import React, { useState } from 'react';
import axios from 'axios'; // Import axios standar
import './PatientRegistration.css';

const SimplePatientRegistration = () => {
  const [formData, setFormData] = useState({
    nama: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    alamat: '',
    nomor_telepon: '',
    nomor_bpjs: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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
    setError('');
    
    try {
      // Validasi formulir
      if (!formData.nama || !formData.tanggal_lahir || !formData.jenis_kelamin || 
          !formData.alamat || !formData.nomor_telepon) {
        throw new Error('Harap lengkapi semua field wajib (Nama, Tanggal Lahir, Jenis Kelamin, Alamat, dan Nomor Telepon)');
      }

      // Panggil API pendaftaran pasien dengan URL lengkap untuk menghindari konflik baseURL
      const response = await axios.post('http://localhost:3000/api/pasien/register', formData);
      
      if (response.data.success) {
        setSuccess(true);
        console.log('Pendaftaran berhasil:', response.data);
      } else {
        throw new Error(response.data.message || 'Pendaftaran gagal');
      }
    } catch (err) {
      console.error('Error pendaftaran:', err);
      setError(err.response?.data?.message || err.message || 'Terjadi kesalahan saat mendaftar');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      nama: '',
      tanggal_lahir: '',
      jenis_kelamin: '',
      alamat: '',
      nomor_telepon: '',
      nomor_bpjs: ''
    });
    setSuccess(false);
    setError('');
  };

  if (success) {
    return (
      <div className="registration-success">
        <div className="success-card">
          <h2>Pendaftaran Berhasil!</h2>
          <p>Terima kasih, <strong>{formData.nama}</strong>. Akun Anda telah terdaftar di Klinik Sentosa.</p>
          <p>Anda sekarang bisa login menggunakan nomor telepon Anda.</p>
          <div className="success-actions">
            <a href="/patient-login" className="btn btn-success">Login Sekarang</a>
            <button onClick={handleReset} className="btn btn-secondary">Daftar Pasien Lain</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-registration">
      <div className="registration-card">
        <h2>Daftar Pasien Baru</h2>
        <p>Silakan isi data diri Anda dengan lengkap</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-group">
            <label>Nama Lengkap *</label>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              placeholder="Nama lengkap Anda"
              required
            />
          </div>

          <div className="form-group">
            <label>Tanggal Lahir *</label>
            <input
              type="date"
              name="tanggal_lahir"
              value={formData.tanggal_lahir}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Jenis Kelamin *</label>
            <select
              name="jenis_kelamin"
              value={formData.jenis_kelamin}
              onChange={handleChange}
              required
            >
              <option value="">Pilih jenis kelamin</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          <div className="form-group">
            <label>Alamat Lengkap *</label>
            <textarea
              name="alamat"
              value={formData.alamat}
              onChange={handleChange}
              placeholder="Alamat tempat tinggal Anda"
              required
            />
          </div>

          <div className="form-group">
            <label>Nomor Telepon *</label>
            <input
              type="tel"
              name="nomor_telepon"
              value={formData.nomor_telepon}
              onChange={handleChange}
              placeholder="Contoh: 081234567890"
              required
            />
          </div>

          <div className="form-group">
            <label>Nomor BPJS (Opsional)</label>
            <input
              type="text"
              name="nomor_bpjs"
              value={formData.nomor_bpjs}
              onChange={handleChange}
              placeholder="Nomor BPJS jika ada"
            />
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
            </button>
            <button type="button" onClick={handleReset} className="btn btn-secondary">
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimplePatientRegistration;