// Models untuk modul perawat
const db = require('../config/database');

// Fungsi untuk mendapatkan semua perawat
const getAllPerawat = async () => {
  const result = await db.query('SELECT * FROM perawat ORDER BY created_at DESC');
  return result.rows;
};

// Fungsi untuk mendapatkan perawat berdasarkan ID
const getPerawatById = async (id) => {
  const result = await db.query('SELECT * FROM perawat WHERE id = $1', [id]);
  return result.rows[0];
};

// Fungsi untuk menambahkan perawat baru
const createPerawat = async (perawatData) => {
  const { nama, nomor_telepon, alamat } = perawatData;
  const result = await db.query(
    'INSERT INTO perawat (nama, nomor_telepon, alamat) VALUES ($1, $2, $3) RETURNING *',
    [nama, nomor_telepon, alamat]
  );
  return result.rows[0];
};

// Fungsi untuk memperbarui data perawat
const updatePerawat = async (id, perawatData) => {
  const { nama, nomor_telepon, alamat } = perawatData;
  const result = await db.query(
    'UPDATE perawat SET nama = $1, nomor_telepon = $2, alamat = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
    [nama, nomor_telepon, alamat, id]
  );
  return result.rows[0];
};

// Fungsi untuk menghapus perawat
const deletePerawat = async (id) => {
  await db.query('DELETE FROM perawat WHERE id = $1', [id]);
  return true;
};

// Fungsi untuk mendapatkan semua pemeriksaan awal
const getAllPemeriksaanAwal = async () => {
  const result = await db.query(`
    SELECT 
      pa.*, 
      p.nama as nama_pasien,
      perawat.nama as nama_perawat
    FROM pemeriksaan_awal pa
    LEFT JOIN pasien p ON pa.id_pasien = p.id
    LEFT JOIN perawat ON pa.id_perawat = perawat.id
    ORDER BY pa.tanggal_pemeriksaan DESC
  `);
  return result.rows;
};

// Fungsi untuk mendapatkan pemeriksaan awal berdasarkan ID
const getPemeriksaanAwalById = async (id) => {
  const result = await db.query(`
    SELECT 
      pa.*, 
      p.nama as nama_pasien,
      perawat.nama as nama_perawat
    FROM pemeriksaan_awal pa
    LEFT JOIN pasien p ON pa.id_pasien = p.id
    LEFT JOIN perawat ON pa.id_perawat = perawat.id
    WHERE pa.id = $1
  `, [id]);
  return result.rows[0];
};

// Fungsi untuk mendapatkan pemeriksaan awal berdasarkan ID pasien
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

// Fungsi untuk mendapatkan pemeriksaan awal terbaru berdasarkan ID pasien
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

// Fungsi untuk menambahkan pemeriksaan awal
const createPemeriksaanAwal = async (pemeriksaanData) => {
  const {
    id_pasien,
    id_perawat,
    berat_badan,
    tinggi_badan,
    tensi_sistolik,
    tensi_diastolik,
    suhu_tubuh,
    denyut_nadi,
    saturasi_oksigen,
    riwayat_singkat
  } = pemeriksaanData;

  const result = await db.query(
    `INSERT INTO pemeriksaan_awal (
      id_pasien, 
      id_perawat, 
      berat_badan, 
      tinggi_badan, 
      tensi_sistolik, 
      tensi_diastolik, 
      suhu_tubuh, 
      denyut_nadi, 
      saturasi_oksigen, 
      riwayat_singkat
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
    [
      id_pasien,
      id_perawat,
      berat_badan,
      tinggi_badan,
      tensi_sistolik,
      tensi_diastolik,
      suhu_tubuh,
      denyut_nadi,
      saturasi_oksigen,
      riwayat_singkat
    ]
  );
  return result.rows[0];
};

// Fungsi untuk memperbarui data pemeriksaan awal
const updatePemeriksaanAwal = async (id, pemeriksaanData) => {
  const {
    id_pasien,
    id_perawat,
    berat_badan,
    tinggi_badan,
    tensi_sistolik,
    tensi_diastolik,
    suhu_tubuh,
    denyut_nadi,
    saturasi_oksigen,
    riwayat_singkat
  } = pemeriksaanData;

  const result = await db.query(
    `UPDATE pemeriksaan_awal SET
      id_pasien = $1,
      id_perawat = $2,
      berat_badan = $3,
      tinggi_badan = $4,
      tensi_sistolik = $5,
      tensi_diastolik = $6,
      suhu_tubuh = $7,
      denyut_nadi = $8,
      saturasi_oksigen = $9,
      riwayat_singkat = $10,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $11 RETURNING *`,
    [
      id_pasien,
      id_perawat,
      berat_badan,
      tinggi_badan,
      tensi_sistolik,
      tensi_diastolik,
      suhu_tubuh,
      denyut_nadi,
      saturasi_oksigen,
      riwayat_singkat,
      id
    ]
  );
  return result.rows[0];
};

// Fungsi untuk menghapus pemeriksaan awal
const deletePemeriksaanAwal = async (id) => {
  await db.query('DELETE FROM pemeriksaan_awal WHERE id = $1', [id]);
  return true;
};

module.exports = {
  getAllPerawat,
  getPerawatById,
  createPerawat,
  updatePerawat,
  deletePerawat,
  getAllPemeriksaanAwal,
  getPemeriksaanAwalById,
  getPemeriksaanAwalByPasienId,
  getLatestPemeriksaanAwalByPasienId,
  createPemeriksaanAwal,
  updatePemeriksaanAwal,
  deletePemeriksaanAwal
};