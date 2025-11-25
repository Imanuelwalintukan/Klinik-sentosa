// Routes untuk laporan
const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');

// Laporan ringkasan umum
router.get('/summary', reportsController.getSummaryReport);

// Laporan bulanan
router.get('/monthly', reportsController.getMonthlyReport);

// Laporan stok obat
router.get('/medication-stock', reportsController.getMedicationStockReport);

// Laporan riwayat pemeriksaan pasien
router.get('/patient-history', reportsController.getPatientHistoryReport);

// Laporan obat paling banyak diresepkan berdasarkan rentang tanggal (melalui query parameter)
router.get('/medicines/most-prescribed', reportsController.getMostPrescribedMedicines);

module.exports = router;