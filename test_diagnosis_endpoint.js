// File sederhana untuk menguji endpoint diagnosis
const express = require('express');
const app = express();

// Middleware untuk parsing JSON dan logging
app.use(express.json());

// Gunakan konfigurasi database yang sama
const db = require('./backend/config/database');

// Endpoint untuk testing
app.get('/test-diagnosis', async (req, res) => {
  try {
    // Coba query langsung ke database tanpa otentikasi
    const result = await db.query(
      'SELECT * FROM diagnosa_spesialis WHERE spesialisasi_berlaku = $1 OR spesialisasi_berlaku = $2 ORDER BY nama_diagnosa',
      ['Umum', 'umum']
    );
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error di test endpoint:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Test server berjalan di http://localhost:${PORT}/test-diagnosis`);
});