// Routes utama
const express = require('express');
const router = express.Router();

// Import semua route modul
const pasienRoutes = require('./pasienRoutes');
const dokterRoutes = require('./dokterRoutes');
const perawatRoutes = require('./perawatRoutes');
const pemeriksaanRoutes = require('./pemeriksaanRoutes');
const pemeriksaanAwalRoutes = require('./pemeriksaanAwalRoutes');
const diagnosisRoutes = require('./diagnosisRoutes');
const emrRoutes = require('./emrRoutes');
const obatRoutes = require('./obatRoutes');
const resepRoutes = require('./resepRoutes');
const reportsRoutes = require('./reportsRoutes');
const authRoutes = require('./authRoutes');
const paymentRoutes = require('./paymentRoutes');

// Gunakan route untuk masing-masing modul
router.use('/pasien', pasienRoutes);
router.use('/dokter', dokterRoutes);
router.use('/perawat', perawatRoutes);
router.use('/pemeriksaan', pemeriksaanRoutes);
router.use('/pemeriksaan-awal', pemeriksaanAwalRoutes);
router.use('/diagnosis', diagnosisRoutes);
router.use('/emr', emrRoutes);
router.use('/obat', obatRoutes);
router.use('/resep', resepRoutes);
router.use('/reports', reportsRoutes);
router.use('/auth', authRoutes);
router.use('/payments', paymentRoutes);

module.exports = router;