const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const apiRoutes = require('./routes');

// Gunakan routes API
app.use('/api', apiRoutes);

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