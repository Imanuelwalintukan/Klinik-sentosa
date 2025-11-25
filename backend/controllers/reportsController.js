// reportsController.js
const db = require('../config/database');

// Laporan ringkasan umum
const getSummaryReport = async (req, res) => {
  try {
    // Ambil jumlah total dari setiap entitas
    const [totalPatients, totalDoctors, totalExaminations, totalMedications] = await Promise.all([
      db.query('SELECT COUNT(*) as count FROM pasien'),
      db.query('SELECT COUNT(*) as count FROM dokter'),
      db.query('SELECT COUNT(*) as count FROM pemeriksaan'),
      db.query('SELECT COUNT(*) as count FROM obat')
    ]);

    res.json({
      success: true,
      data: {
        totalPatients: parseInt(totalPatients.rows[0].count),
        totalDoctors: parseInt(totalDoctors.rows[0].count),
        totalExaminations: parseInt(totalExaminations.rows[0].count),
        totalMedications: parseInt(totalMedications.rows[0].count),
        // Data bulan depan bisa ditambahkan di sini
        monthlyData: []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Laporan bulanan
const getMonthlyReport = async (req, res) => {
  try {
    // Ambil data pemeriksaan per bulan
    const result = await db.query(`
      SELECT
        EXTRACT(YEAR FROM tanggal_pemeriksaan) as year,
        EXTRACT(MONTH FROM tanggal_pemeriksaan) as month,
        COUNT(*) as examination_count
      FROM pemeriksaan
      GROUP BY EXTRACT(YEAR FROM tanggal_pemeriksaan), EXTRACT(MONTH FROM tanggal_pemeriksaan)
      ORDER BY year DESC, month DESC
    `);

    // Format data
    const monthlyData = result.rows.map(row => ({
      month: `${row.year}-${String(row.month).padStart(2, '0')}`,
      examinationCount: parseInt(row.examination_count)
    }));

    res.json({
      success: true,
      data: {
        monthlyData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Laporan stok obat
const getMedicationStockReport = async (req, res) => {
  try {
    // Ambil semua data obat
    const result = await db.query(`
      SELECT id, nama_obat, stok, harga
      FROM obat
      ORDER BY nama_obat
    `);

    res.json({
      success: true,
      data: {
        stockData: result.rows
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Laporan riwayat pemeriksaan pasien
const getPatientHistoryReport = async (req, res) => {
  try {
    // Ambil data pasien dengan jumlah pemeriksaan
    const result = await pool.query(`
      SELECT
        p.id as id_pasien,
        p.nama as nama_pasien,
        COUNT(pe.id) as examination_count
      FROM pasien p
      LEFT JOIN pemeriksaan pe ON p.id = pe.id_pasien
      GROUP BY p.id, p.nama
      ORDER BY examination_count DESC
    `);

    res.json({
      success: true,
      data: {
        patientHistory: result.rows
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Laporan obat paling banyak diresepkan
const getMostPrescribedMedicines = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Menentukan query berdasarkan adanya filter tanggal
    let baseQuery = `
      SELECT
        o.nama_obat,
        COUNT(r.id) as prescription_count
      FROM resep r
      JOIN obat o ON r.id_obat = o.id
      JOIN pemeriksaan p ON r.id_pemeriksaan = p.id
    `;

    if (startDate && endDate) {
      baseQuery += `WHERE p.tanggal_pemeriksaan BETWEEN $1 AND $2 `;
    }

    baseQuery += `GROUP BY o.id, o.nama_obat ORDER BY prescription_count DESC`;

    let result;
    if (startDate && endDate) {
      result = await db.query(baseQuery, [startDate, endDate]);
    } else {
      result = await db.query(baseQuery);
    }

    res.json({
      success: true,
      data: {
        medicines: result.rows
      }
    });
  } catch (error) {
    console.error('Error getting most prescribed medicines:', error.message);
    console.error('Stack trace:', error.stack);

    // Kirim error yang lebih informatif dalam mode development
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' ? error.message : 'Terjadi kesalahan saat mengambil data laporan obat',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};

module.exports = {
  getSummaryReport,
  getMonthlyReport,
  getMedicationStockReport,
  getPatientHistoryReport,
  getMostPrescribedMedicines
};