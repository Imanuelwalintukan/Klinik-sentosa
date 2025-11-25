// patientAxios.js - Axios instance khusus untuk operasi pasien
import axios from 'axios';

// Membuat instance axios untuk operasi pasien
const patientAxios = axios.create({
  baseURL: 'http://localhost:3000', // Hanya hostname dan port, tanpa '/api' agar tidak terjadi duplikasi
  timeout: 10000, // 10 detik timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor untuk login pasien (tidak perlu token)
patientAxios.interceptors.request.use(
  (config) => {
    console.log('Mengirim request ke:', config.url);
    console.log('Data yang dikirim:', config.data);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
patientAxios.interceptors.response.use(
  (response) => {
    console.log('Response dari server:', response);
    return response;
  },
  (error) => {
    console.error('Error response:', error.response);
    return Promise.reject(error);
  }
);

export default patientAxios;