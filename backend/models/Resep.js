// Model untuk tabel resep
const db = require('../config/database');

// Fungsi untuk mendapatkan semua resep
const getAllResep = async () => {
  const result = await db.query(`
    SELECT r.*, p.nama_obat, pemer.tanggal_pemeriksaan, pas.nama AS nama_pasien
    FROM resep r
    LEFT JOIN obat p ON r.id_obat = p.id
    LEFT JOIN pemeriksaan pemer ON r.id_pemeriksaan = pemer.id
    LEFT JOIN pasien pas ON pemer.id_pasien = pas.id
    ORDER BY r.created_at DESC
  `);
  return result.rows;
};

// Fungsi untuk mendapatkan resep berdasarkan ID
const getResepById = async (id) => {
  const result = await db.query(`
    SELECT r.*, p.nama_obat, pemer.tanggal_pemeriksaan, pas.nama AS nama_pasien
    FROM resep r
    LEFT JOIN obat p ON r.id_obat = p.id
    LEFT JOIN pemeriksaan pemer ON r.id_pemeriksaan = pemer.id
    LEFT JOIN pasien pas ON pemer.id_pasien = pas.id
    WHERE r.id = $1
  `);
  return result.rows[0];
};

// Fungsi untuk mendapatkan resep berdasarkan ID pemeriksaan
const getResepByPemeriksaanId = async (pemeriksaanId) => {
  const result = await db.query(`
    SELECT r.*, p.nama_obat, p.harga
    FROM resep r
    LEFT JOIN obat p ON r.id_obat = p.id
    WHERE r.id_pemeriksaan = $1
  `, [pemeriksaanId]);
  return result.rows;
};

// Fungsi untuk menambahkan resep baru
const createResep = async (resepData) => {
  const { id_pemeriksaan, id_obat, jumlah, aturan_pakai } = resepData;
  const result = await db.query(
    'INSERT INTO resep (id_pemeriksaan, id_obat, jumlah, aturan_pakai) VALUES ($1, $2, $3, $4) RETURNING *',
    [id_pemeriksaan, id_obat, jumlah, aturan_pakai]
  );
  return result.rows[0];
};

// Fungsi untuk memperbarui data resep
const updateResep = async (id, resepData) => {
  const { id_pemeriksaan, id_obat, jumlah, aturan_pakai } = resepData;
  const result = await db.query(
    'UPDATE resep SET id_pemeriksaan = $1, id_obat = $2, jumlah = $3, aturan_pakai = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
    [id_pemeriksaan, id_obat, jumlah, aturan_pakai, id]
  );
  return result.rows[0];
};

// Fungsi untuk menghapus resep
const deleteResep = async (id) => {
  await db.query('DELETE FROM resep WHERE id = $1', [id]);
  return true;
};

module.exports = {
  getAllResep,
  getResepById,
  getResepByPemeriksaanId,
  createResep,
  updateResep,
  deleteResep
};