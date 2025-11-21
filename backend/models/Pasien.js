// Model untuk tabel pasien
const db = require('../config/database');

// Fungsi untuk mendapatkan semua pasien
const getAllPasien = async () => {
  const result = await db.query('SELECT * FROM pasien ORDER BY created_at DESC');
  return result.rows;
};

// Fungsi untuk mendapatkan pasien berdasarkan ID
const getPasienById = async (id) => {
  const result = await db.query('SELECT * FROM pasien WHERE id = $1', [id]);
  return result.rows[0];
};

// Fungsi untuk menambahkan pasien baru
const createPasien = async (pasienData) => {
  const { nama, tanggal_lahir, jenis_kelamin, alamat, nomor_telepon } = pasienData;
  const result = await db.query(
    'INSERT INTO pasien (nama, tanggal_lahir, jenis_kelamin, alamat, nomor_telepon) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [nama, tanggal_lahir, jenis_kelamin, alamat, nomor_telepon]
  );
  return result.rows[0];
};

// Fungsi untuk memperbarui data pasien
const updatePasien = async (id, pasienData) => {
  const { nama, tanggal_lahir, jenis_kelamin, alamat, nomor_telepon } = pasienData;
  const result = await db.query(
    'UPDATE pasien SET nama = $1, tanggal_lahir = $2, jenis_kelamin = $3, alamat = $4, nomor_telepon = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
    [nama, tanggal_lahir, jenis_kelamin, alamat, nomor_telepon, id]
  );
  return result.rows[0];
};

// Fungsi untuk menghapus pasien
const deletePasien = async (id) => {
  await db.query('DELETE FROM pasien WHERE id = $1', [id]);
  return true;
};

module.exports = {
  getAllPasien,
  getPasienById,
  createPasien,
  updatePasien,
  deletePasien
};