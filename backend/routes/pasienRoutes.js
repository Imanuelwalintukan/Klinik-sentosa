// Routes untuk modul pasien
const express = require('express');
const router = express.Router();
const pasienController = require('../controllers/pasienController');

// Mendapatkan semua pasien
router.get('/', pasienController.getAllPasien);

// Mendapatkan pasien berdasarkan ID
router.get('/:id', pasienController.getPasienById);

// Membuat pasien baru
router.post('/', pasienController.createPasien);

// Memperbarui data pasien
router.put('/:id', pasienController.updatePasien);

// Menghapus pasien
router.delete('/:id', pasienController.deletePasien);

module.exports = router;