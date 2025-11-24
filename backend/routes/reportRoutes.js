// Routes untuk sistem pelaporan
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/ReportController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Semua rute laporan hanya dapat diakses oleh Admin
const adminOnly = authorize('admin');

// Rute untuk ringkasan pemeriksaan
router.get('/summary', protect, adminOnly, reportController.getExaminationSummary);

// Rute untuk laporan pemeriksaan per periode
router.get('/examinations/period', protect, adminOnly, reportController.getExaminationsByPeriod);

// Rute untuk laporan pemeriksaan per dokter
router.get('/examinations/doctor', protect, adminOnly, reportController.getExaminationsByDoctor);

// Rute untuk tren diagnosa
router.get('/diagnosis/trends', protect, adminOnly, reportController.getDiagnosisTrends);

// Rute untuk laporan pasien per kategori usia
router.get('/patients/age-category', protect, adminOnly, reportController.getPatientsByAgeCategory);

// Rute untuk obat yang paling sering diresepkan
router.get('/medicines/most-prescribed', protect, adminOnly, reportController.getMostPrescribedMedicines);

// Rute untuk laporan keuangan
router.get('/financial', protect, adminOnly, reportController.getFinancialReport);

// Rute untuk laporan bulanan
router.get('/monthly', protect, adminOnly, reportController.getMonthlyReport);

module.exports = router;