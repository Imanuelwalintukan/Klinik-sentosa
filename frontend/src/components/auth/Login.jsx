// Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

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
      // Simulasi login - dalam implementasi nyata, ini akan memanggil API
      // Untuk demo, kita akan menggunakan login sederhana
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        login({
          id: 1,
          username: 'admin',
          name: 'Administrator',
          role: 'admin'
        });
        navigate('/admin');
      } else if (credentials.username === 'dokter' && credentials.password === 'dokter123') {
        login({
          id: 2,
          username: 'dokter',
          name: 'Dr. Andi',
          role: 'dokter'
        });
        navigate('/doctor');
      } else if (credentials.username === 'apoteker' && credentials.password === 'apoteker123') {
        login({
          id: 3,
          username: 'apoteker',
          name: 'Susi Apoteker',
          role: 'apoteker'
        });
        navigate('/pharmacist');
      } else if (credentials.username === 'pasien' && credentials.password === 'pasien123') {
        login({
          id: 4,
          username: 'pasien',
          name: 'Budi Santoso',
          role: 'pasien'
        });
        navigate('/patient');
      } else {
        setError('Username atau password salah');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Login</h2>
        
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
        </div>
      </div>
    </div>
  );
};

export default Login;