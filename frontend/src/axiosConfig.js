// axiosConfig.js - Konfigurasi axios untuk menambahkan base URL dan interceptor token
import axios from 'axios';

// Set base URL untuk semua permintaan API
axios.defaults.baseURL = 'http://localhost:3000/api';

// Interceptor untuk menambahkan token JWT ke setiap request
axios.interceptors.request.use(
  (config) => {
    // Ambil data user dari localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      // Jika ada token, tambahkan ke header Authorization
      if (user && user.token) {
        config.headers['Authorization'] = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => {
    // Lakukan sesuatu jika terjadi error pada request
    return Promise.reject(error);
  }
);

export default axios;