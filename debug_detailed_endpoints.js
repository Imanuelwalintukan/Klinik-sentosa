// Script debug lebih lengkap untuk mencari semua kemungkinan endpoint dengan error 500
const axios = require('axios');

const testDetailedEndpoints = async () => {
  const endpoints = [
    // Endpoint GET
    { method: 'GET', url: '/api/pasien' },
    { method: 'GET', url: '/api/pasien/8' },
    { method: 'GET', url: '/api/dokter' },
    { method: 'GET', url: '/api/dokter/4' },
    { method: 'GET', url: '/api/perawat' },
    { method: 'GET', url: '/api/pemeriksaan' },
    { method: 'GET', url: '/api/pemeriksaan-awal' },
    { method: 'GET', url: '/api/obat' },
    { method: 'GET', url: '/api/resep' },
    { method: 'GET', url: '/api/reports/summary' },
    
    // Endpoint EMR
    { method: 'GET', url: '/api/emr/rekam-medis/pasien/8' },
    { method: 'GET', url: '/api/emr/alergi/pasien/8' },
    { method: 'GET', url: '/api/emr/pemeriksaan-penunjang/pasien/8' },
    { method: 'GET', url: '/api/emr/imunisasi/pasien/8' },
    
    // Endpoint Auth
    { method: 'POST', url: '/api/auth/login', data: { username: 'admin', password: 'invalid' }}, // Ini seharusnya gagal tapi bukan 500
    { method: 'POST', url: '/api/auth/login/pasien', data: { nomor_telepon: '081234567891' }},
    { method: 'POST', url: '/api/auth/pasien/login', data: { nomor_telepon: '081234567891' }},
    
    // Endpoint POST/PUT/DELETE (dengan data minimal)
    { method: 'POST', url: '/api/pasien', data: { nama: 'Test', nomor_telepon: '081234567890', alamat: 'Test', tanggal_lahir: '2000-01-01', jenis_kelamin: 'Laki-laki' }},
    { method: 'POST', url: '/api/pemeriksaan-awal', data: { id_pasien: 1, id_perawat: 1, berat_badan: 70, tinggi_badan: 170, tensi_sistolik: 120, tensi_diastolik: 80, suhu_tubuh: 36.5, denyut_nadi: 72, saturasi_oksigen: 98 }}
  ];

  console.log('Mulai pengujian endpoint secara menyeluruh...\n');
  
  let errorsFound = 0;
  
  for (const ep of endpoints) {
    try {
      let response;
      const fullUrl = `http://localhost:3000${ep.url}`;
      
      if (ep.method === 'GET') {
        response = await axios.get(fullUrl);
      } else if (ep.method === 'POST') {
        response = await axios.post(fullUrl, ep.data || {}, {
          headers: { 'Content-Type': 'application/json' }
        });
      } else if (ep.method === 'PUT') {
        // Untuk PUT, kita hanya coba endpoint yang valid
        if (ep.url.includes('/api/pasien/')) {
          response = await axios.put(fullUrl, ep.data || {}, {
            headers: { 'Content-Type': 'application/json' }
          });
        } else {
          continue; // Lewati karena kita tidak tahu ID yang valid
        }
      } else if (ep.method === 'DELETE') {
        // Untuk DELETE, kita hanya coba endpoint yang valid
        if (ep.url.includes('/api/pasien/')) {
          response = await axios.delete(fullUrl);
        } else {
          continue; // Lewati karena kita tidak tahu ID yang valid
        }
      }
      
      const statusClass = response.status.toString()[0]; // Ambil digit pertama status
      const statusEmoji = statusClass === '2' ? '✅' : statusClass === '4' ? '⚠️' : statusClass === '5' ? '❌' : '❕';
      
      console.log(`${statusEmoji} ${ep.method} ${ep.url} - Status: ${response.status}`);
    } catch (error) {
      if (error.response) {
        const statusClass = error.response.status.toString()[0];
        const statusEmoji = statusClass === '5' ? '❌ [500 ERROR]' : statusClass === '4' ? '⚠️' : '❕';
        
        console.log(`${statusEmoji} ${ep.method} ${ep.url} - Status: ${error.response.status}`);
        if (error.response.status === 500) {
          errorsFound++;
          console.log(`   Detail: ${error.response.data?.message || error.response.data || 'Unknown error'}`);
        }
      } else if (error.request) {
        console.log(`❌ ${ep.method} ${ep.url} - Network Error (No Response)`);
        errorsFound++;
      } else {
        console.log(`❌ ${ep.method} ${ep.url} - Request Setup Error: ${error.message}`);
        errorsFound++;
      }
    }
  }
  
  console.log(`\nPengujian selesai. Ditemukan ${errorsFound} error.`);
  if (errorsFound === 0) {
    console.log("🎉 Semua endpoint berfungsi dengan baik - tidak ada error 500 ditemukan!");
  }
};

testDetailedEndpoints();