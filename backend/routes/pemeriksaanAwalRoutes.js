// Routes untuk pemeriksaan awal yang dilakukan oleh perawat
const express = require('express');
const router = express.Router();
const perawatController = require('../controllers/PerawatController');

// Routes untuk pemeriksaan awal
router.get('/', perawatController.getAllPemeriksaanAwal);
router.get('/:id', perawatController.getPemeriksaanAwalById);
router.get('/pasien/:pasienId', perawatController.getPemeriksaanAwalByPasienId);
router.get('/pasien/:pasienId/latest', perawatController.getLatestPemeriksaanAwalByPasienId);
router.post('/', perawatController.createPemeriksaanAwal);
router.put('/:id', perawatController.updatePemeriksaanAwal);
router.delete('/:id', perawatController.deletePemeriksaanAwal);

module.exports = router;