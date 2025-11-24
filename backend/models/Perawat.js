// Model untuk tabel perawat
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

module.exports = {
  getAllPerawat,
  getPerawatById,
  createPerawat,
  updatePerawat,
  deletePerawat
};