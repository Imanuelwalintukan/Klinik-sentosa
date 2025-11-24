import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import axios from '../../axiosConfig';
import './Auth.css';

const RoleBasedLogin = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Mapping role names for display
  const roleDisplayName = {
    admin: 'Administrator',
    dokter: 'Dokter',
    apoteker: 'Apoteker',
    perawat: 'Perawat',
  };
  const currentRoleName = roleDisplayName[role] || 'Staff';

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
        const userData = response.data.data;

        // Pastikan role yang login sesuai dengan yang dipilih
        if (userData.role !== role) {
          setError(`Login berhasil, tetapi Anda bukan seorang ${currentRoleName}. Silakan login di role yang sesuai.`);
          setLoading(false);
          return;
        }

        // Panggil fungsi login dari AuthProvider
        login(userData);
        
        // Arahkan ke halaman berdasarkan role
        navigate('/'); // HomeRedirect akan mengarahkan ke dashboard yang benar
      } else {
        // Handle a non-2xx success=false response
        setError(response.data.message || 'Username atau password salah.');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Terjadi kesalahan saat login. Silakan coba lagi.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="role-based-login-container">
      <div className="role-based-login-form">
        <h2>Login sebagai {currentRoleName}</h2>
        
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
              placeholder={`Masukkan username ${currentRoleName}`}
              required
              autoComplete="username"
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
              placeholder="Masukkan password"
              required
              autoComplete="current-password"
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Masuk...' : `Login`}
          </button>
        </form>
        
        <div className="role-login-actions">
          <a href="/login/roles">Pilih role lain</a>
        </div>
      </div>
    </div>
  );
};

export default RoleBasedLogin;