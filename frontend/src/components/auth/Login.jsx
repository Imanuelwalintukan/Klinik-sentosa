import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import axios from '../../axiosConfig'; // Import axios yang sudah dikonfigurasi

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
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
      // Panggil API login yang sesungguhnya
      const response = await axios.post('/auth/login', credentials);

      if (response.data.success) {
        login(response.data.data); // Data sudah termasuk token

        // Redirect berdasarkan role yang diterima dari backend
        switch (response.data.data.role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'dokter':
            navigate('/doctor');
            break;
          case 'apoteker':
            navigate('/pharmacist');
            break;
          case 'perawat':
            navigate('/nurse');
            break;
          default:
            setError('Role tidak dikenali. Silakan hubungi administrator.');
            break;
        }
      } else {
        setError(response.data.message || 'Login gagal.');
      }
    } catch (err) {
      console.error("Login API Error:", err);
      setError(err.response?.data?.message || 'Terjadi kesalahan saat login. Periksa username dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Login Staff</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Masuk...' : 'Login'}
          </button>
        </form>

        <div className="login-actions">
          <a href="/login/roles">Login sebagai role lain</a>
          <a href="/patient-login">Login sebagai Pasien</a>
          <a href="/patient-register">Daftar sebagai Pasien</a>
        </div>
      </div>
    </div>
  );
};

export default Login;