// Routes untuk modul resep
const express = require('express');
const router = express.Router();
const resepController = require('../controllers/resepController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Mendapatkan semua resep - Dokter, Apoteker, dan Admin untuk laporan
router.get('/', protect, authorize('dokter', 'apoteker', 'admin'), resepController.getAllResep);

// Mendapatkan resep yang belum dibayar - Apoteker, Admin, dan Dokter (untuk melihat resep yang belum dibayar)
router.get('/unpaid', protect, authorize('apoteker', 'admin', 'dokter'), resepController.getUnpaidPrescriptions);

// Mendapatkan resep berdasarkan ID - Dokter & Apoteker
router.get('/:id', protect, authorize('dokter', 'apoteker'), resepController.getResepById);

// Mendapatkan resep berdasarkan ID pemeriksaan - Dokter, Apoteker, dan Pasien
router.get('/pemeriksaan/:pemeriksaanId', protect, authorize('dokter', 'apoteker', 'pasien'), resepController.getResepByPemeriksaanId);

// Membuat resep baru - Hanya Dokter
router.post('/', protect, authorize('dokter'), resepController.createResep);

// Membuat beberapa resep sekaligus - Hanya Dokter
router.post('/bulk', protect, authorize('dokter'), resepController.createBulkResep);

// Memperbarui data resep - Hanya Dokter
router.put('/:id', protect, authorize('dokter'), resepController.updateResep);

// Menghapus resep - Hanya Admin
router.delete('/:id', protect, authorize('admin'), resepController.deleteResep);

// Endpoint untuk dispensing resep - Hanya Apoteker
router.post('/dispense/:pemeriksaanId', protect, authorize('apoteker'), resepController.dispenseResep);

module.exports = router;