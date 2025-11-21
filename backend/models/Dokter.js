// Model untuk tabel dokter
const db = require('../config/database');

// Fungsi untuk mendapatkan semua dokter
const getAllDokter = async () => {
  const result = await db.query('SELECT * FROM dokter ORDER BY created_at DESC');
  return result.rows;
};

// Fungsi untuk mendapatkan dokter berdasarkan ID
const getDokterById = async (id) => {
  const result = await db.query('SELECT * FROM dokter WHERE id = $1', [id]);
  return result.rows[0];
};

// Fungsi untuk menambahkan dokter baru
const createDokter = async (dokterData) => {
  const { nama, spesialis, nomor_telepon, alamat } = dokterData;
  const result = await db.query(
    'INSERT INTO dokter (nama, spesialis, nomor_telepon, alamat) VALUES ($1, $2, $3, $4) RETURNING *',
    [nama, spesialis, nomor_telepon, alamat]
  );
  return result.rows[0];
};

// Fungsi untuk memperbarui data dokter
const updateDokter = async (id, dokterData) => {
  const { nama, spesialis, nomor_telepon, alamat } = dokterData;
  const result = await db.query(
    'UPDATE dokter SET nama = $1, spesialis = $2, nomor_telepon = $3, alamat = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
    [nama, spesialis, nomor_telepon, alamat, id]
  );
  return result.rows[0];
};

// Fungsi untuk menghapus dokter
const deleteDokter = async (id) => {
  await db.query('DELETE FROM dokter WHERE id = $1', [id]);
  return true;
};

module.exports = {
  getAllDokter,
  getDokterById,
  createDokter,
  updateDokter,
  deleteDokter
};