// Routes untuk modul obat
const express = require('express');
const router = express.Router();
const obatController = require('../controllers/obatController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Mendapatkan semua obat - Apoteker, Admin, dan Dokter (untuk melihat/meresepkan)
router.get('/', protect, authorize('apoteker', 'admin', 'dokter'), obatController.getAllObat);

// Mendapatkan obat berdasarkan ID - Sama seperti di atas
router.get('/:id', protect, authorize('apoteker', 'admin', 'dokter'), obatController.getObatById);

// Membuat obat baru - Apoteker dan Admin
router.post('/', protect, authorize('apoteker', 'admin'), obatController.createObat);

// Memperbarui data obat - Apoteker dan Admin
router.put('/:id', protect, authorize('apoteker', 'admin'), obatController.updateObat);

// Menghapus obat - Hanya Admin
router.delete('/:id', protect, authorize('admin'), obatController.deleteObat);

module.exports = router;