// Routes untuk modul obat
const express = require('express');
const router = express.Router();
const obatController = require('../controllers/obatController');

// Mendapatkan semua obat
router.get('/', obatController.getAllObat);

// Mendapatkan obat berdasarkan ID
router.get('/:id', obatController.getObatById);

// Membuat obat baru
router.post('/', obatController.createObat);

// Memperbarui data obat
router.put('/:id', obatController.updateObat);

// Menghapus obat
router.delete('/:id', obatController.deleteObat);

module.exports = router;