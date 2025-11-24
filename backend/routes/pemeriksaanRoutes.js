// Routes untuk modul pemeriksaan
const express = require('express');
const router = express.Router();
const pemeriksaanController = require('../controllers/pemeriksaanController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Mendapatkan semua pemeriksaan - Dokter bisa lihat semua, Admin untuk laporan
router.get('/', protect, authorize('dokter', 'admin'), pemeriksaanController.getAllPemeriksaan);

// Mendapatkan pemeriksaan berdasarkan ID - Dokter, Perawat, dan Admin bisa lihat detail
router.get('/:id', protect, authorize('dokter', 'admin', 'perawat'), pemeriksaanController.getPemeriksaanById);

// Mendapatkan semua pemeriksaan seorang pasien - Dokter dan Perawat yang menangani
router.get('/pasien/:pasienId', protect, authorize('dokter', 'perawat'), pemeriksaanController.getPemeriksaanByPasienId);

// Membuat pemeriksaan baru - Hanya Dokter
router.post('/', protect, authorize('dokter'), pemeriksaanController.createPemeriksaan);

// Memperbarui data pemeriksaan - Hanya Dokter
router.put('/:id', protect, authorize('dokter'), pemeriksaanController.updatePemeriksaan);

// Menghapus pemeriksaan - Hanya Admin (untuk alasan integritas data)
router.delete('/:id', protect, authorize('admin'), pemeriksaanController.deletePemeriksaan);

module.exports = router;