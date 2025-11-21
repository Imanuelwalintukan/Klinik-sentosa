// Routes untuk modul resep
const express = require('express');
const router = express.Router();
const resepController = require('../controllers/resepController');

// Mendapatkan semua resep
router.get('/', resepController.getAllResep);

// Mendapatkan resep berdasarkan ID
router.get('/:id', resepController.getResepById);

// Mendapatkan resep berdasarkan ID pemeriksaan
router.get('/pemeriksaan/:pemeriksaanId', resepController.getResepByPemeriksaanId);

// Membuat resep baru
router.post('/', resepController.createResep);

// Memperbarui data resep
router.put('/:id', resepController.updateResep);

// Menghapus resep
router.delete('/:id', resepController.deleteResep);

module.exports = router;