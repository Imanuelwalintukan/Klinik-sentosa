import React, { useState } from 'react';
import axios from 'axios'; // Gunakan axios standar, tetapi tanpa baseURL agar tidak terjadi duplikasi
import './RegistrationForm.css';

const PatientRegistrationForm = () => {
  const [formData, setFormData] = useState({
    nama: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    alamat: '',
    nomor_telepon: '',
    pekerjaan: '',
    agama: '',
    status_perkawinan: '',
    nomor_bpjs: '',
    riwayat_alergi: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

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
      const response = await axios.post('http://localhost:3000/api/pasien/register', formData);
      setSuccess(true);
      setFormData({
        nama: '',
        tanggal_lahir: '',
        jenis_kelamin: '',
        alamat: '',
        nomor_telepon: '',
        pekerjaan: '',
        agama: '',
        status_perkawinan: '',
        nomor_bpjs: '',
        riwayat_alergi: ''
      });
    } catch (err) {
      setError('Gagal mendaftarkan pasien: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="registration-success">
        <div className="success-card">
          <h2>Pendaftaran Berhasil!</h2>
          <p>Terima kasih, <strong>{formData.nama || 'Pasien'}</strong>. Data Anda telah terdaftar di Klinik Sentosa.</p>
          <div className="success-details">
            <p><strong>Nomor Antrian Anda:</strong> #{Math.floor(1000 + Math.random() * 9000)}</p>
            <p><strong>Tanggal Pendaftaran:</strong> {new Date().toLocaleDateString('id-ID')}</p>
          </div>
          <div className="next-steps">
            <h3>Langkah Selanjutnya:</h3>
            <ul>
              <li>Silakan datang ke klinik sesuai jadwal yang ditentukan</li>
              <li>Bawalah dokumen identitas (KTP/SIM) sebagai bukti identitas</li>
              <li>Jika memiliki kartu BPJS, bawalah juga sebagai bukti</li>
              <li>Simpan nomor antrian Anda sebagai referensi</li>
            </ul>
          </div>
          <div className="contact-info">
            <p><strong>Informasi Kontak Klinik:</strong></p>
            <p>Klinik Sentosa<br />Alamat: Jl. Kesehatan No. 10<br />Telepon: (021) 12345678</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setSuccess(false)}
          >
            Daftar Pasien Baru
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="registration-form-container">
      <div className="registration-form-card">
        <h2>Pendaftaran Pasien Baru</h2>
        <p className="form-description">Silakan isi data diri Anda dengan lengkap dan benar</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nama">Nama Lengkap *</label>
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
              <label htmlFor="tanggal_lahir">Tanggal Lahir *</label>
              <input
                type="date"
                id="tanggal_lahir"
                name="tanggal_lahir"
                value={formData.tanggal_lahir}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="jenis_kelamin">Jenis Kelamin *</label>
              <select
                id="jenis_kelamin"
                name="jenis_kelamin"
                value={formData.jenis_kelamin}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="nomor_telepon">No. HP/WhatsApp *</label>
              <input
                type="tel"
                id="nomor_telepon"
                name="nomor_telepon"
                value={formData.nomor_telepon}
                onChange={handleChange}
                className="form-control"
                placeholder="Contoh: 081234567890"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="alamat">Alamat Lengkap *</label>
            <textarea
              id="alamat"
              name="alamat"
              value={formData.alamat}
              onChange={handleChange}
              className="form-control"
              rows="3"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pekerjaan">Pekerjaan</label>
              <input
                type="text"
                id="pekerjaan"
                name="pekerjaan"
                value={formData.pekerjaan}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="agama">Agama</label>
              <select
                id="agama"
                name="agama"
                value={formData.agama}
                onChange={handleChange}
                className="form-control"
              >
                <option value="">Pilih Agama</option>
                <option value="Islam">Islam</option>
                <option value="Kristen">Kristen</option>
                <option value="Katolik">Katolik</option>
                <option value="Hindu">Hindu</option>
                <option value="Buddha">Buddha</option>
                <option value="Konghucu">Konghucu</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status_perkawinan">Status Perkawinan</label>
              <select
                id="status_perkawinan"
                name="status_perkawinan"
                value={formData.status_perkawinan}
                onChange={handleChange}
                className="form-control"
              >
                <option value="">Pilih Status</option>
                <option value="Belum Kawin">Belum Kawin</option>
                <option value="Kawin">Kawin</option>
                <option value="Cerai Hidup">Cerai Hidup</option>
                <option value="Cerai Mati">Cerai Mati</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="nomor_bpjs">Nomor BPJS</label>
              <input
                type="text"
                id="nomor_bpjs"
                name="nomor_bpjs"
                value={formData.nomor_bpjs}
                onChange={handleChange}
                className="form-control"
                placeholder="Isi jika memiliki BPJS"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="riwayat_alergi">Riwayat Alergi (Jika Ada)</label>
            <textarea
              id="riwayat_alergi"
              name="riwayat_alergi"
              value={formData.riwayat_alergi}
              onChange={handleChange}
              className="form-control"
              rows="2"
              placeholder="Contoh: Alergi terhadap antibiotik jenis tertentu, makanan, dll."
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
            </button>
            <button type="reset" className="btn btn-secondary" onClick={() => setFormData({
              nama: '',
              tanggal_lahir: '',
              jenis_kelamin: '',
              alamat: '',
              nomor_telepon: '',
              pekerjaan: '',
              agama: '',
              status_perkawinan: '',
              nomor_bpjs: '',
              riwayat_alergi: ''
            })}>
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientRegistrationForm;