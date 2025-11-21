// Routes untuk modul dokter
const express = require('express');
const router = express.Router();
const dokterController = require('../controllers/dokterController');

// Mendapatkan semua dokter
router.get('/', dokterController.getAllDokter);

// Mendapatkan dokter berdasarkan ID
router.get('/:id', dokterController.getDokterById);

// Membuat dokter baru
router.post('/', dokterController.createDokter);

// Memperbarui data dokter
router.put('/:id', dokterController.updateDokter);

// Menghapus dokter
router.delete('/:id', dokterController.deleteDokter);

module.exports = router;