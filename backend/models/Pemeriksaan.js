// Model untuk tabel pemeriksaan
const db = require('../config/database');

// Fungsi untuk mendapatkan semua pemeriksaan
const getAllPemeriksaan = async () => {
  const result = await db.query(`
    SELECT p.*, pas.nama AS nama_pasien, d.nama AS nama_dokter
    FROM pemeriksaan p
    LEFT JOIN pasien pas ON p.id_pasien = pas.id
    LEFT JOIN dokter d ON p.id_dokter = d.id
    ORDER BY p.tanggal_pemeriksaan DESC
  `);
  return result.rows;
};

// Fungsi untuk mendapatkan pemeriksaan berdasarkan ID
const getPemeriksaanById = async (id) => {
  const result = await db.query(`
    SELECT p.*, pas.nama AS nama_pasien, d.nama AS nama_dokter
    FROM pemeriksaan p
    LEFT JOIN pasien pas ON p.id_pasien = pas.id
    LEFT JOIN dokter d ON p.id_dokter = d.id
    WHERE p.id = $1
  `);
  return result.rows[0];
};

// Fungsi untuk mendapatkan pemeriksaan berdasarkan ID pasien
const getPemeriksaanByPasienId = async (pasienId) => {
  const result = await db.query(`
    SELECT p.*, pas.nama AS nama_pasien, d.nama AS nama_dokter
    FROM pemeriksaan p
    LEFT JOIN pasien pas ON p.id_pasien = pas.id
    LEFT JOIN dokter d ON p.id_dokter = d.id
    WHERE p.id_pasien = $1
    ORDER BY p.tanggal_pemeriksaan DESC
  `, [pasienId]);
  return result.rows;
};

// Fungsi untuk menambahkan pemeriksaan baru
const createPemeriksaan = async (pemeriksaanData) => {
  const { id_pasien, id_dokter, tanggal_pemeriksaan, keluhan, diagnosa, rekomendasi_pengobatan } = pemeriksaanData;
  const result = await db.query(
    'INSERT INTO pemeriksaan (id_pasien, id_dokter, tanggal_pemeriksaan, keluhan, diagnosa, rekomendasi_pengobatan) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [id_pasien, id_dokter, tanggal_pemeriksaan, keluhan, diagnosa, rekomendasi_pengobatan]
  );
  return result.rows[0];
};

// Fungsi untuk memperbarui data pemeriksaan
const updatePemeriksaan = async (id, pemeriksaanData) => {
  const { id_pasien, id_dokter, tanggal_pemeriksaan, keluhan, diagnosa, rekomendasi_pengobatan } = pemeriksaanData;
  const result = await db.query(
    'UPDATE pemeriksaan SET id_pasien = $1, id_dokter = $2, tanggal_pemeriksaan = $3, keluhan = $4, diagnosa = $5, rekomendasi_pengobatan = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
    [id_pasien, id_dokter, tanggal_pemeriksaan, keluhan, diagnosa, rekomendasi_pengobatan, id]
  );
  return result.rows[0];
};

// Fungsi untuk menghapus pemeriksaan
const deletePemeriksaan = async (id) => {
  await db.query('DELETE FROM pemeriksaan WHERE id = $1', [id]);
  return true;
};

module.exports = {
  getAllPemeriksaan,
  getPemeriksaanById,
  getPemeriksaanByPasienId,
  createPemeriksaan,
  updatePemeriksaan,
  deletePemeriksaan
};