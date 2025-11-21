// Routes untuk modul pemeriksaan
const express = require('express');
const router = express.Router();
const pemeriksaanController = require('../controllers/pemeriksaanController');

// Mendapatkan semua pemeriksaan
router.get('/', pemeriksaanController.getAllPemeriksaan);

// Mendapatkan pemeriksaan berdasarkan ID
router.get('/:id', pemeriksaanController.getPemeriksaanById);

// Mendapatkan pemeriksaan berdasarkan ID pasien
router.get('/pasien/:pasienId', pemeriksaanController.getPemeriksaanByPasienId);

// Membuat pemeriksaan baru
router.post('/', pemeriksaanController.createPemeriksaan);

// Memperbarui data pemeriksaan
router.put('/:id', pemeriksaanController.updatePemeriksaan);

// Menghapus pemeriksaan
router.delete('/:id', pemeriksaanController.deletePemeriksaan);

module.exports = router;