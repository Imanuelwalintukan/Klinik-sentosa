// Model untuk tabel obat
const db = require('../config/database');

// Fungsi untuk mendapatkan semua obat
const getAllObat = async () => {
  const result = await db.query('SELECT * FROM obat ORDER BY created_at DESC');
  return result.rows;
};

// Fungsi untuk mendapatkan obat berdasarkan ID
const getObatById = async (id) => {
  const result = await db.query('SELECT * FROM obat WHERE id = $1', [id]);
  return result.rows[0];
};

// Fungsi untuk menambahkan obat baru
const createObat = async (obatData) => {
  const { nama_obat, deskripsi, stok, harga } = obatData;
  const result = await db.query(
    'INSERT INTO obat (nama_obat, deskripsi, stok, harga) VALUES ($1, $2, $3, $4) RETURNING *',
    [nama_obat, deskripsi, stok, harga]
  );
  return result.rows[0];
};

// Fungsi untuk memperbarui data obat
const updateObat = async (id, obatData) => {
  const { nama_obat, deskripsi, stok, harga } = obatData;
  const result = await db.query(
    'UPDATE obat SET nama_obat = $1, deskripsi = $2, stok = $3, harga = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
    [nama_obat, deskripsi, stok, harga, id]
  );
  return result.rows[0];
};

// Fungsi untuk menghapus obat
const deleteObat = async (id) => {
  await db.query('DELETE FROM obat WHERE id = $1', [id]);
  return true;
};

module.exports = {
  getAllObat,
  getObatById,
  createObat,
  updateObat,
  deleteObat
};