// Routes untuk modul pemeriksaan
const express = require('express');
const router = express.Router();
const pemeriksaanController = require('../controllers/pemeriksaanController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Mendapatkan semua pemeriksaan - Dokter bisa lihat semua, Admin untuk laporan, Apoteker untuk dispensing obat
router.get('/', protect, authorize('dokter', 'admin', 'apoteker'), pemeriksaanController.getAllPemeriksaan);

// Mendapatkan pemeriksaan berdasarkan ID - Dokter, Perawat, Admin, Apoteker, dan Pasien bisa lihat detail
router.get('/:id', protect, authorize('dokter', 'admin', 'perawat', 'apoteker', 'pasien'), pemeriksaanController.getPemeriksaanById);

// Mendapatkan semua pemeriksaan seorang pasien - Dokter dan Perawat yang menangani
router.get('/pasien/:pasienId', protect, authorize('dokter', 'perawat'), pemeriksaanController.getPemeriksaanByPasienId);

// Mendapatkan pemeriksaan berdasarkan ID user yang login - Untuk pasien
router.get('/user', protect, authorize('pasien'), pemeriksaanController.getPemeriksaanByUserId);

// Mendapatkan pemeriksaan berdasarkan ID dokter yang login - Untuk dokter
router.get('/dokter', protect, authorize('dokter'), pemeriksaanController.getPemeriksaanByDokterId);

// Membuat pemeriksaan baru - Hanya Dokter
router.post('/', protect, authorize('dokter'), pemeriksaanController.createPemeriksaan);

// Memperbarui data pemeriksaan - Hanya Dokter
router.put('/:id', protect, authorize('dokter'), pemeriksaanController.updatePemeriksaan);

// Menghapus pemeriksaan - Hanya Admin (untuk alasan integritas data)
router.delete('/:id', protect, authorize('admin'), pemeriksaanController.deletePemeriksaan);

module.exports = router;