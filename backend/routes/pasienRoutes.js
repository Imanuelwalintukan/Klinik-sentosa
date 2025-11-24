// Routes untuk modul pasien
const express = require('express');
const router = express.Router();
const pasienController = require('../controllers/pasienController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Mendapatkan semua pasien - Staf klinis dan admin
router.get('/', protect, authorize('dokter', 'perawat', 'admin'), pasienController.getAllPasien);

// Mendapatkan pasien berdasarkan ID - Staf klinis dan admin
router.get('/:id', protect, authorize('dokter', 'perawat', 'admin'), pasienController.getPasienById);

// Membuat pasien baru - Dokter, Perawat, atau Admin
router.post('/', protect, authorize('dokter', 'perawat', 'admin'), pasienController.createPasien);

// Mendaftarkan pasien baru (untuk pendaftaran online) - Rute ini publik
router.post('/register', pasienController.registerPasien);

// Memperbarui data pasien - Perawat, Dokter, atau Admin
router.put('/:id', protect, authorize('perawat', 'dokter', 'admin'), pasienController.updatePasien);

// Menghapus pasien - Hanya Admin
router.delete('/:id', protect, authorize('admin'), pasienController.deletePasien);

module.exports = router;