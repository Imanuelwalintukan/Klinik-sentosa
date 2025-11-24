// Model untuk rekam medis elektronik (EMR)
const db = require('../config/database');

// Fungsi untuk mendapatkan rekam medis pasien
const getRekamMedisByPasienId = async (id_pasien) => {
  const result = await db.query(`
    SELECT rm.*, d.nama as nama_dokter
    FROM rekam_medis rm
    LEFT JOIN dokter d ON rm.id_dokter = d.id
    WHERE rm.id_pasien = $1
    ORDER BY rm.tanggal_pemeriksaan DESC
  `, [id_pasien]);
  return result.rows;
};

// Fungsi untuk mendapatkan rekam medis berdasarkan ID
const getRekamMedisById = async (id) => {
  const result = await db.query(`
    SELECT rm.*, d.nama as nama_dokter, p.nama as nama_pasien
    FROM rekam_medis rm
    LEFT JOIN dokter d ON rm.id_dokter = d.id
    LEFT JOIN pasien p ON rm.id_pasien = p.id
    WHERE rm.id = $1
  `, [id]);
  return result.rows[0];
};

// Fungsi untuk membuat rekam medis baru
const createRekamMedis = async (rekamMedisData) => {
  const { 
    id_pasien, 
    id_dokter, 
    tanggal_pemeriksaan, 
    riwayat_penyakit_keluarga, 
    riwayat_pengobatan_sebelumnya, 
    catatan_klinis, 
    ringkasan_kondisi_pasien 
  } = rekamMedisData;
  
  const result = await db.query(
    `INSERT INTO rekam_medis (
      id_pasien, 
      id_dokter, 
      tanggal_pemeriksaan, 
      riwayat_penyakit_keluarga, 
      riwayat_pengobatan_sebelumnya, 
      catatan_klinis, 
      ringkasan_kondisi_pasien
    ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [
      id_pasien, 
      id_dokter, 
      tanggal_pemeriksaan, 
      riwayat_penyakit_keluarga, 
      riwayat_pengobatan_sebelumnya, 
      catatan_klinis, 
      ringkasan_kondisi_pasien
    ]
  );
  
  return result.rows[0];
};

// Fungsi untuk memperbarui rekam medis
const updateRekamMedis = async (id, rekamMedisData) => {
  const { 
    id_dokter, 
    tanggal_pemeriksaan, 
    riwayat_penyakit_keluarga, 
    riwayat_pengobatan_sebelumnya, 
    catatan_klinis, 
    ringkasan_kondisi_pasien 
  } = rekamMedisData;
  
  const result = await db.query(
    `UPDATE rekam_medis SET 
      id_dokter = $1, 
      tanggal_pemeriksaan = $2, 
      riwayat_penyakit_keluarga = $3, 
      riwayat_pengobatan_sebelumnya = $4, 
      catatan_klinis = $5, 
      ringkasan_kondisi_pasien = $6,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $7 RETURNING *`,
    [
      id_dokter, 
      tanggal_pemeriksaan, 
      riwayat_penyakit_keluarga, 
      riwayat_pengobatan_sebelumnya, 
      catatan_klinis, 
      ringkasan_kondisi_pasien,
      id
    ]
  );
  
  return result.rows[0];
};

// Fungsi untuk mendapatkan semua riwayat alergi pasien
const getRiwayatAlergiByPasienId = async (id_pasien) => {
  const result = await db.query(
    'SELECT * FROM riwayat_alergi WHERE id_pasien = $1 ORDER BY tanggal_konfirmasi DESC',
    [id_pasien]
  );
  return result.rows;
};

// Fungsi untuk menambahkan riwayat alergi
const createRiwayatAlergi = async (alergiData) => {
  const { 
    id_pasien, 
    jenis_alergi, 
    nama_alergen, 
    tingkat_keparahan, 
    tanggal_konfirmasi, 
    gejala_yang_muncul, 
    catatan_tambahan 
  } = alergiData;
  
  const result = await db.query(
    `INSERT INTO riwayat_alergi (
      id_pasien, 
      jenis_alergi, 
      nama_alergen, 
      tingkat_keparahan, 
      tanggal_konfirmasi, 
      gejala_yang_muncul, 
      catatan_tambahan
    ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [
      id_pasien, 
      jenis_alergi, 
      nama_alergen, 
      tingkat_keparahan, 
      tanggal_konfirmasi, 
      gejala_yang_muncul, 
      catatan_tambahan
    ]
  );
  
  return result.rows[0];
};

// Fungsi untuk mendapatkan pemeriksaan penunjang berdasarkan ID pasien
const getPemeriksaanPenunjangByPasienId = async (id_pasien) => {
  const result = await db.query(
    'SELECT * FROM pemeriksaan_penunjang WHERE id_pasien = $1 ORDER BY tanggal_pemeriksaan DESC',
    [id_pasien]
  );
  return result.rows;
};

// Fungsi untuk mendapatkan semua riwayat imunisasi pasien
const getRiwayatImunisasiByPasienId = async (id_pasien) => {
  const result = await db.query(
    'SELECT * FROM riwayat_imunisasi WHERE id_pasien = $1 ORDER BY tanggal_imunisasi DESC',
    [id_pasien]
  );
  return result.rows;
};

// Fungsi untuk mendapatkan pemeriksaan-pemeriksaan sebelumnya untuk pasien (riwayat diagnosa)
const getRiwayatPemeriksaanByPasienId = async (id_pasien) => {
  const result = await db.query(`
    SELECT
      p.id,
      p.tanggal_pemeriksaan,
      p.keluhan,
      p.diagnosa,
      p.rekomendasi_pengobatan,
      d.nama AS nama_dokter,
      d.spesialis AS spesialis_dokter
    FROM pemeriksaan p
    LEFT JOIN dokter d ON p.id_dokter = d.id
    WHERE p.id_pasien = $1
    ORDER BY p.tanggal_pemeriksaan DESC
  `, [id_pasien]);
  return result.rows;
};

// Fungsi untuk mendapatkan pemeriksaan awal terbaru untuk pasien
const getLatestPemeriksaanAwalByPasienId = async (id_pasien) => {
  const result = await db.query(`
    SELECT
      pa.*,
      p.nama as nama_pasien,
      perawat.nama as nama_perawat
    FROM pemeriksaan_awal pa
    LEFT JOIN pasien p ON pa.id_pasien = p.id
    LEFT JOIN perawat ON pa.id_perawat = perawat.id
    WHERE pa.id_pasien = $1
    ORDER BY pa.tanggal_pemeriksaan DESC
    LIMIT 1
  `, [id_pasien]);
  return result.rows[0];
};

// Fungsi untuk mendapatkan semua pemeriksaan awal untuk pasien
const getPemeriksaanAwalByPasienId = async (id_pasien) => {
  const result = await db.query(`
    SELECT
      pa.*,
      p.nama as nama_pasien,
      perawat.nama as nama_perawat
    FROM pemeriksaan_awal pa
    LEFT JOIN pasien p ON pa.id_pasien = p.id
    LEFT JOIN perawat ON pa.id_perawat = perawat.id
    WHERE pa.id_pasien = $1
    ORDER BY pa.tanggal_pemeriksaan DESC
  `, [id_pasien]);
  return result.rows;
};

module.exports = {
  getRekamMedisByPasienId,
  getRekamMedisById,
  createRekamMedis,
  updateRekamMedis,
  getRiwayatAlergiByPasienId,
  createRiwayatAlergi,
  getPemeriksaanPenunjangByPasienId,
  getRiwayatImunisasiByPasienId,
  getLatestPemeriksaanAwalByPasienId,
  getPemeriksaanAwalByPasienId,
  getRiwayatPemeriksaanByPasienId
};