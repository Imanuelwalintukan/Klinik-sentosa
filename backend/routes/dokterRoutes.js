// Routes untuk modul dokter
const express = require('express');
const router = express.Router();
const dokterController = require('../controllers/dokterController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Mendapatkan semua dokter - Admin, Perawat, Dokter, dan Pasien (untuk memilih dokter)
router.get('/', protect, authorize('admin', 'perawat', 'dokter', 'pasien'), dokterController.getAllDokter);

// Mendapatkan dokter berdasarkan ID - Sama seperti di atas
router.get('/:id', protect, authorize('admin', 'perawat', 'dokter', 'pasien'), dokterController.getDokterById);

// Membuat dokter baru - Hanya Admin
router.post('/', protect, authorize('admin'), dokterController.createDokter);

// Memperbarui data dokter - Hanya Admin
router.put('/:id', protect, authorize('admin'), dokterController.updateDokter);

// Menghapus dokter - Hanya Admin
router.delete('/:id', protect, authorize('admin'), dokterController.deleteDokter);

module.exports = router;