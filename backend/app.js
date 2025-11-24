const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Konfigurasi CORS untuk development
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Import routes
const apiRoutes = require('./routes');

// Gunakan routes API
app.use('/api', apiRoutes);

// Tambahkan route EMR ke dalam API
app.use('/api/emr', require('./routes/emrRoutes'));


// Static files untuk build React (akan digunakan saat production)
app.use(express.static(path.join(__dirname, '../frontend/dist')));


// Route untuk semua GET request di production (selain API routes)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
  console.log(`Jalankan 'npm run dev:client' untuk development frontend React`);
});