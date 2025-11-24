// Model untuk sistem pelaporan
const db = require('../config/database');

// Fungsi untuk mendapatkan ringkasan pemeriksaan
const getExaminationSummary = async (startDate, endDate) => {
  const query = `
    SELECT 
      COUNT(*) as total_pemeriksaan,
      COUNT(CASE WHEN EXTRACT(YEAR FROM tanggal_pemeriksaan) = EXTRACT(YEAR FROM CURRENT_DATE) THEN 1 END) as pemeriksaan_tahun_ini,
      COUNT(CASE WHEN EXTRACT(MONTH FROM tanggal_pemeriksaan) = EXTRACT(MONTH FROM CURRENT_DATE) THEN 1 END) as pemeriksaan_bulan_ini,
      COUNT(CASE WHEN jenis_kelamin_pasien = 'Laki-laki' THEN 1 END) as jumlah_pasien_laki,
      COUNT(CASE WHEN jenis_kelamin_pasien = 'Perempuan' THEN 1 END) as jumlah_pasien_perempuan,
      AVG(usia_pasien_tahun) as rata_rata_usia_pasien
    FROM view_laporan_pemeriksaan
    WHERE tanggal_pemeriksaan BETWEEN $1 AND $2
  `;
  
  const result = await db.query(query, [startDate, endDate]);
  return result.rows[0];
};

// Fungsi untuk mendapatkan laporan pemeriksaan per periode
const getExaminationsByPeriod = async (startDate, endDate) => {
  const query = `
    SELECT 
      tanggal_pemeriksaan::date as tanggal,
      COUNT(*) as jumlah_pemeriksaan,
      COUNT(CASE WHEN jenis_kelamin_pasien = 'Laki-laki' THEN 1 END) as pria,
      COUNT(CASE WHEN jenis_kelamin_pasien = 'Perempuan' THEN 1 END) as wanita
    FROM view_laporan_pemeriksaan
    WHERE tanggal_pemeriksaan BETWEEN $1 AND $2
    GROUP BY tanggal_pemeriksaan::date
    ORDER BY tanggal_pemeriksaan::date
  `;
  
  const result = await db.query(query, [startDate, endDate]);
  return result.rows;
};

// Fungsi untuk mendapatkan laporan pemeriksaan per dokter
const getExaminationsByDoctor = async (startDate, endDate) => {
  const query = `
    SELECT 
      nama_dokter,
      spesialis_dokter,
      COUNT(*) as jumlah_pemeriksaan
    FROM view_laporan_pemeriksaan
    WHERE tanggal_pemeriksaan BETWEEN $1 AND $2
    GROUP BY id_dokter, nama_dokter, spesialis_dokter
    ORDER BY jumlah_pemeriksaan DESC
  `;
  
  const result = await db.query(query, [startDate, endDate]);
  return result.rows;
};

// Fungsi untuk mendapatkan tren diagnosa
const getDiagnosisTrends = async (startDate, endDate) => {
  const query = `
    SELECT 
      diagnosa,
      COUNT(*) as frekuensi
    FROM view_laporan_pemeriksaan
    WHERE tanggal_pemeriksaan BETWEEN $1 AND $2
    GROUP BY diagnosa
    ORDER BY frekuensi DESC
    LIMIT 10
  `;
  
  const result = await db.query(query, [startDate, endDate]);
  return result.rows;
};

// Fungsi untuk mendapatkan laporan pasien per kategori usia
const getPatientsByAgeCategory = async (startDate, endDate) => {
  const query = `
    SELECT 
      kategori_usia,
      COUNT(*) as jumlah_pasien
    FROM view_laporan_pemeriksaan
    WHERE tanggal_pemeriksaan BETWEEN $1 AND $2
    GROUP BY kategori_usia
    ORDER BY 
      CASE kategori_usia
        WHEN 'Anak-anak' THEN 1
        WHEN 'Dewasa' THEN 2
        WHEN 'Lansia' THEN 3
        ELSE 4
      END
  `;
  
  const result = await db.query(query, [startDate, endDate]);
  return result.rows;
};

// Fungsi untuk mendapatkan laporan obat yang sering diresepkan
const getMostPrescribedMedicines = async (startDate, endDate) => {
  const query = `
    SELECT 
      nama_obat,
      SUM(jumlah) as total_jumlah,
      COUNT(*) as jumlah_resep
    FROM view_laporan_resep
    WHERE tanggal_pemeriksaan BETWEEN $1 AND $2
    GROUP BY id_obat, nama_obat
    ORDER BY total_jumlah DESC
    LIMIT 10
  `;
  
  const result = await db.query(query, [startDate, endDate]);
  return result.rows;
};

// Fungsi untuk mendapatkan laporan keuangan
const getFinancialReport = async (startDate, endDate) => {
  const query = `
    SELECT 
      SUM(total_pembayaran) as total_pendapatan,
      COUNT(DISTINCT id_pasien) as jumlah_pasien_berobat,
      AVG(total_pembayaran) as rata_rata_pembayaran_per_pasien,
      SUM(jumlah_resep) as total_resep_dibuat
    FROM view_laporan_keuangan
    WHERE tanggal_pembayaran BETWEEN $1 AND $2
  `;
  
  const result = await db.query(query, [startDate, endDate]);
  return result.rows[0];
};

// Fungsi untuk mendapatkan laporan bulanan untuk grafik
const getMonthlyReport = async (tahun) => {
  const query = `
    SELECT 
      bulan,
      COUNT(*) as jumlah_pemeriksaan,
      SUM(CASE WHEN jenis_kelamin_pasien = 'Laki-laki' THEN 1 ELSE 0 END) as pria,
      SUM(CASE WHEN jenis_kelamin_pasien = 'Perempuan' THEN 1 ELSE 0 END) as wanita
    FROM view_laporan_pemeriksaan
    WHERE tahun = $1
    GROUP BY bulan
    ORDER BY bulan
  `;
  
  const result = await db.query(query, [tahun]);
  return result.rows;
};

module.exports = {
  getExaminationSummary,
  getExaminationsByPeriod,
  getExaminationsByDoctor,
  getDiagnosisTrends,
  getPatientsByAgeCategory,
  getMostPrescribedMedicines,
  getFinancialReport,
  getMonthlyReport
};