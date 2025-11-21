// RoleBasedLogin.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

const RoleBasedLogin = () => {
  const { role } = useParams();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const roleConfig = {
    admin: {
      name: 'Administrator',
      defaultUsername: 'admin',
      defaultPassword: 'admin123'
    },
    dokter: {
      name: 'Dokter',
      defaultUsername: 'dokter',
      defaultPassword: 'dokter123'
    },
    apoteker: {
      name: 'Apoteker',
      defaultUsername: 'apoteker',
      defaultPassword: 'apoteker123'
    },
    pasien: {
      name: 'Pasien',
      defaultUsername: 'pasien',
      defaultPassword: 'pasien123'
    }
  };

  const currentRole = roleConfig[role] || roleConfig.admin;

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
      if (
        credentials.username === currentRole.defaultUsername && 
        credentials.password === currentRole.defaultPassword
      ) {
        let userData;
        
        switch(role) {
          case 'admin':
            userData = { id: 1, username: 'admin', name: 'Administrator', role: 'admin' };
            break;
          case 'dokter':
            userData = { id: 2, username: 'dokter', name: 'Dr. Andi', role: 'dokter' };
            break;
          case 'apoteker':
            userData = { id: 3, username: 'apoteker', name: 'Susi Apoteker', role: 'apoteker' };
            break;
          case 'pasien':
            userData = { id: 4, username: 'pasien', name: 'Budi Santoso', role: 'pasien' };
            break;
          default:
            userData = { id: 1, username: 'admin', name: 'Administrator', role: 'admin' };
        }
        
        login(userData);
        
        // Arahkan ke halaman berdasarkan role
        switch(role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'dokter':
            navigate('/doctor');
            break;
          case 'apoteker':
            navigate('/pharmacist');
            break;
          case 'pasien':
            navigate('/patient');
            break;
          default:
            navigate('/');
        }
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
    <div className="role-based-login-container">
      <div className="role-based-login-form">
        <h2>Login sebagai {currentRole.name}</h2>
        
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
              placeholder={currentRole.defaultUsername}
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
              placeholder={currentRole.defaultPassword}
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Masuk...' : `Login sebagai ${currentRole.name}`}
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