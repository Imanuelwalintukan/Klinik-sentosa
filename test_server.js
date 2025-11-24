const express = require('express');
const app = express();

// Middleware untuk logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Route sederhana untuk testing
app.get('/api/diagnosis/umum', (req, res) => {
  // Cek apakah kita bisa mengakses endpoint ini langsung
  console.log('Menerima request ke /api/diagnosis/umum');
  res.status(500).json({
    success: false,
    message: 'Test server error - endpoint diagnosis umum diakses langsung tanpa otentikasi'
  });
});

app.listen(3001, () => {
  console.log('Test server berjalan di port 3001');
});