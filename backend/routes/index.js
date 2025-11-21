// Routes utama
const express = require('express');
const router = express.Router();

// Import semua route modul
const pasienRoutes = require('./pasienRoutes');
const dokterRoutes = require('./dokterRoutes');
const pemeriksaanRoutes = require('./pemeriksaanRoutes');
const obatRoutes = require('./obatRoutes');
const resepRoutes = require('./resepRoutes');
const reportsRoutes = require('./reportsRoutes');

// Gunakan route untuk masing-masing modul
router.use('/pasien', pasienRoutes);
router.use('/dokter', dokterRoutes);
router.use('/pemeriksaan', pemeriksaanRoutes);
router.use('/obat', obatRoutes);
router.use('/resep', resepRoutes);
router.use('/reports', reportsRoutes);

module.exports = router;