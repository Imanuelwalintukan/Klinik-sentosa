// PatientLogin.jsx - Komponen untuk login pasien menggunakan data nyata
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import patientAxios from './patientAxios'; // Import axios khusus untuk pasien

const PatientLogin = () => {
  const [credentials, setCredentials] = useState({
    nomor_telepon: '',
    nomor_bpjs: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Hanya kirim field yang tidak kosong
      const loginData = {};
      if (credentials.nomor_telepon.trim()) {
        loginData.nomor_telepon = credentials.nomor_telepon.trim();
      }
      if (credentials.nomor_bpjs.trim()) {
        loginData.nomor_bpjs = credentials.nomor_bpjs.trim();
      }

      // Validasi: setidaknya satu field harus diisi
      if (!loginData.nomor_telepon && !loginData.nomor_bpjs) {
        setError('Mohon masukkan nomor telepon atau nomor BPJS.');
        setLoading(false);
        return;
      }

      console.log('Mengirim data login:', loginData);
      // Panggil API untuk login pasien menggunakan patientAxios
      // Karena baseURL sekarang adalah 'http://localhost:3000', kita tambahkan '/api' ke endpoint
      const response = await patientAxios.post('/api/auth/login/pasien', loginData);
      console.log('Response dari server:', response);

      if (response.data.success) {
        // Login berhasil
        login(response.data.data);
        navigate('/patient');
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login. Silakan coba lagi.');
      console.error('Login error:', err);
      console.error('Error response:', err.response);
      if (err.response) {
        console.error('Status:', err.response.status);
        console.error('Data:', err.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="patient-login-container">
      <div className="patient-login-form">
        <h2>Login Pasien</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nomor_telepon">Nomor Telepon:</label>
            <input
              type="text"
              id="nomor_telepon"
              name="nomor_telepon"
              value={credentials.nomor_telepon}
              onChange={handleChange}
              className="form-control"
              placeholder="Masukkan nomor telepon yang digunakan saat mendaftar"
            />
          </div>

          <div className="form-group">
            <label htmlFor="nomor_bpjs">Nomor BPJS (Opsional):</label>
            <input
              type="text"
              id="nomor_bpjs"
              name="nomor_bpjs"
              value={credentials.nomor_bpjs}
              onChange={handleChange}
              className="form-control"
              placeholder="Masukkan nomor BPJS jika ada"
            />
          </div>

          <p className="form-note">
            Gunakan nomor telepon atau nomor BPJS yang Anda gunakan saat mendaftar di klinik.
          </p>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Masuk...' : 'Login sebagai Pasien'}
          </button>
        </form>

        <div className="login-actions">
          <p>Belum terdaftar? <a href="/patient-registration">Daftar di sini</a></p>
        </div>
      </div>
    </div>
  );
};

export default PatientLogin;