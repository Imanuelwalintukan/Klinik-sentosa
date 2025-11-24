// Routes untuk Electronic Medical Records (EMR)
const express = require('express');
const router = express.Router();
const emrController = require('../controllers/EMRController');
const { protect, authorize } = require('../middleware/authMiddleware');

const readAccess = authorize('dokter', 'perawat', 'admin');
const writeAccess = authorize('dokter', 'perawat');

// Rekam Medis routes
router.get('/rekam-medis/pasien/:id_pasien', protect, readAccess, emrController.getRekamMedisByPasienId);
router.get('/rekam-medis/:id', protect, readAccess, emrController.getRekamMedisById);
router.post('/rekam-medis', protect, writeAccess, emrController.createRekamMedis);
router.put('/rekam-medis/:id', protect, writeAccess, emrController.updateRekamMedis);

// Riwayat Alergi routes
router.get('/alergi/pasien/:id_pasien', protect, readAccess, emrController.getRiwayatAlergiByPasienId);
router.post('/alergi', protect, writeAccess, emrController.createRiwayatAlergi);

// Pemeriksaan Penunjang routes
router.get('/pemeriksaan-penunjang/pasien/:id_pasien', protect, readAccess, emrController.getPemeriksaanPenunjangByPasienId);

// Riwayat Imunisasi routes
router.get('/imunisasi/pasien/:id_pasien', protect, readAccess, emrController.getRiwayatImunisasiByPasienId);

// Riwayat Pemeriksaan Dokter routes
router.get('/pemeriksaan-dokter/pasien/:id_pasien', protect, readAccess, emrController.getRiwayatPemeriksaanByPasienId);

// Pemeriksaan Awal (oleh perawat) routes
router.get('/pemeriksaan-awal/pasien/:id_pasien', protect, readAccess, emrController.getPemeriksaanAwalByPasienId);
router.get('/pemeriksaan-awal/pasien/:id_pasien/latest', protect, readAccess, emrController.getLatestPemeriksaanAwalByPasienId);

module.exports = router;