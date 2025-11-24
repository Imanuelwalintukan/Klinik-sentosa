// Routes untuk modul perawat
const express = require('express');
const router = express.Router();
const perawatController = require('../controllers/PerawatController');
const { protect, authorize } = require('../middleware/authMiddleware');

// --- Routes untuk manajemen perawat ---

// Lihat semua perawat - Admin, Dokter, Perawat
router.get('/', protect, authorize('admin', 'dokter', 'perawat'), perawatController.getAllPerawat);
// Lihat detail perawat - Admin, Dokter, Perawat
router.get('/:id', protect, authorize('admin', 'dokter', 'perawat'), perawatController.getPerawatById);
// Buat perawat baru - Hanya Admin
router.post('/', protect, authorize('admin'), perawatController.createPerawat);
// Update perawat - Hanya Admin
router.put('/:id', protect, authorize('admin'), perawatController.updatePerawat);
// Hapus perawat - Hanya Admin
router.delete('/:id', protect, authorize('admin'), perawatController.deletePerawat);


// --- Routes untuk pemeriksaan awal oleh perawat ---

// Lihat semua pemeriksaan awal - Perawat, Dokter, Admin
router.get('/pemeriksaan-awal', protect, authorize('perawat', 'dokter', 'admin'), perawatController.getAllPemeriksaanAwal);
// Lihat detail pemeriksaan awal - Perawat, Dokter, Admin
router.get('/pemeriksaan-awal/:id', protect, authorize('perawat', 'dokter', 'admin'), perawatController.getPemeriksaanAwalById);
// Lihat pemeriksaan awal per pasien - Perawat & Dokter
router.get('/pemeriksaan-awal/pasien/:pasienId', protect, authorize('perawat', 'dokter'), perawatController.getPemeriksaanAwalByPasienId);
// Lihat pemeriksaan awal terbaru per pasien - Perawat & Dokter
router.get('/pemeriksaan-awal/pasien/:pasienId/latest', protect, authorize('perawat', 'dokter'), perawatController.getLatestPemeriksaanAwalByPasienId);
// Buat pemeriksaan awal baru - Hanya Perawat
router.post('/pemeriksaan-awal', protect, authorize('perawat'), perawatController.createPemeriksaanAwal);
// Update pemeriksaan awal - Hanya Perawat
router.put('/pemeriksaan-awal/:id', protect, authorize('perawat'), perawatController.updatePemeriksaanAwal);
// Hapus pemeriksaan awal - Hanya Admin
router.delete('/pemeriksaan-awal/:id', protect, authorize('admin'), perawatController.deletePemeriksaanAwal);

module.exports = router;