// Routes untuk manajemen diagnosa
const express = require('express');
const router = express.Router();
const diagnosisController = require('../controllers/DiagnosisController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Mendapatkan semua diagnosa - Dokter (untuk memilih) dan Admin (untuk manajemen)
router.get('/', protect, authorize('dokter', 'admin'), diagnosisController.getAllDiagnoses);

// Mendapatkan diagnosa berdasarkan ID
router.get('/:id', protect, authorize('dokter', 'admin'), diagnosisController.getDiagnosisById);

// Mendapatkan diagnosa berdasarkan kode diagnosa
router.get('/kode/:code', protect, authorize('dokter', 'admin'), diagnosisController.getDiagnosisByCode);

// Mendapatkan diagnosa berdasarkan spesialisasi
router.get('/spesialisasi/:specialization', protect, authorize('dokter', 'admin'), diagnosisController.getDiagnosesBySpecialization);

// Mendapatkan diagnosa umum
router.get('/umum', protect, authorize('dokter', 'admin'), diagnosisController.getGeneralDiagnoses);

// Mendapatkan diagnosa yang sering digunakan oleh dokter tertentu
router.get('/dokter/:doctorId/frequent', protect, authorize('dokter'), diagnosisController.getFrequentDiagnosesForDoctor);

// Menambahkan diagnosa baru - Hanya Admin
router.post('/', protect, authorize('admin'), diagnosisController.createDiagnosis);

// Memperbarui data diagnosa - Hanya Admin
router.put('/:id', protect, authorize('admin'), diagnosisController.updateDiagnosis);

// Menghapus diagnosa - Hanya Admin
router.delete('/:id', protect, authorize('admin'), diagnosisController.deleteDiagnosis);

module.exports = router;