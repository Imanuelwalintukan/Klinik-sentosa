// Script debug untuk mencari endpoint yang menyebabkan error 500
const axios = require('axios');

const testEndpoints = async () => {
  const endpoints = [
    '/api/pasien',
    '/api/dokter', 
    '/api/perawat',
    '/api/pemeriksaan',
    '/api/pemeriksaan-awal',
    '/api/obat',
    '/api/resep',
    '/api/emr/rekam-medis/pasien/8',
    '/api/emr/alergi/pasien/8',
    '/api/auth/login/pasien',  // Ini adalah endpoint yang mungkin bermasalah
    '/api/auth/pasien/login'   // Ini adalah alternatif yang mungkin bermasalah
  ];

  console.log('Mulai pengujian endpoint...\n');
  
  for (const endpoint of endpoints) {
    try {
      let response;
      if (endpoint.includes('/auth/') && endpoint.includes('/login')) {
        // Untuk endpoint login, kita perlu mengirim data
        if (endpoint === '/api/auth/login/pasien') {
          response = await axios.post(`http://localhost:3000${endpoint}`, {
            nomor_telepon: '081234567890'
          }, {
            headers: { 'Content-Type': 'application/json' }
          });
        } else if (endpoint === '/api/auth/pasien/login') {
          response = await axios.post(`http://localhost:3000${endpoint}`, {
            nomor_telepon: '081234567890'
          }, {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      } else {
        response = await axios.get(`http://localhost:3000${endpoint}`);
      }
      
      console.log(`✅ ${endpoint} - Status: ${response.status} (${response.data?.success === undefined ? 'Non-API' : 'API'})`);
    } catch (error) {
      if (error.response) {
        // Server merespon dengan status selain 2xx
        console.log(`❌ ${endpoint} - Status: ${error.response.status} (${error.response.statusText})`);
        if (error.response.status === 500) {
          console.log(`   Error message: ${error.response.data?.message || JSON.stringify(error.response.data)}`);
        }
      } else if (error.request) {
        // Request dibuat tapi tidak ada respons
        console.log(`❌ ${endpoint} - No Response (Network Error)`);
      } else {
        // Terjadi error saat membuat request
        console.log(`❌ ${endpoint} - Request Error: ${error.message}`);
      }
    }
  }
  
  console.log('\nPengujian endpoint selesai.');
};

testEndpoints();