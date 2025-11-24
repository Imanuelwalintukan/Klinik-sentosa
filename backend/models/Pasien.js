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
  const {
    nama,
    tanggal_lahir,
    jenis_kelamin,
    alamat,
    nomor_telepon, // menggunakan nama field yang sesuai dengan form lama
    no_hp, // atau no_hp dari form baru
    pekerjaan,
    agama,
    status_perkawinan,
    nomor_bpjs,
    riwayat_alergi
  } = pasienData;

  // Gunakan no_hp jika tersedia, jika tidak gunakan nomor_telepon
  const phoneNumber = no_hp || nomor_telepon;

  const result = await db.query(
    `INSERT INTO pasien (
      nama,
      tanggal_lahir,
      jenis_kelamin,
      alamat,
      nomor_telepon,
      pekerjaan,
      agama,
      status_perkawinan,
      nomor_bpjs,
      riwayat_alergi
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
    [nama, tanggal_lahir, jenis_kelamin, alamat, phoneNumber, pekerjaan, agama, status_perkawinan, nomor_bpjs, riwayat_alergi]
  );
  return result.rows[0];
};

// Fungsi untuk memperbarui data pasien
const updatePasien = async (id, pasienData) => {
  const {
    nama,
    tanggal_lahir,
    jenis_kelamin,
    alamat,
    nomor_telepon,
    pekerjaan,
    agama,
    status_perkawinan,
    nomor_bpjs,
    riwayat_alergi
  } = pasienData;

  const result = await db.query(
    `UPDATE pasien
     SET
       nama = $1,
       tanggal_lahir = $2,
       jenis_kelamin = $3,
       alamat = $4,
       nomor_telepon = $5,
       pekerjaan = $6,
       agama = $7,
       status_perkawinan = $8,
       nomor_bpjs = $9,
       riwayat_alergi = $10,
       updated_at = CURRENT_TIMESTAMP
     WHERE id = $11
     RETURNING *`,
    [nama, tanggal_lahir, jenis_kelamin, alamat, nomor_telepon, pekerjaan, agama, status_perkawinan, nomor_bpjs, riwayat_alergi, id]
  );
  return result.rows[0];
};

// Fungsi untuk menghapus pasien
const deletePasien = async (id) => {
  await db.query('DELETE FROM pasien WHERE id = $1', [id]);
  return true;
};

// Fungsi untuk mendaftarkan pasien baru (khusus untuk pendaftaran online)
const registerPasien = async (pasienData) => {
  const {
    nama,
    tanggal_lahir,
    jenis_kelamin,
    alamat,
    no_hp,
    pekerjaan,
    agama,
    status_perkawinan,
    nomor_bpjs,
    riwayat_alergi
  } = pasienData;

  // Validasi data yang wajib diisi
  if (!nama || !tanggal_lahir || !jenis_kelamin || !alamat || !no_hp) {
    throw new Error('Data yang diperlukan tidak lengkap');
  }

  const result = await db.query(
    `INSERT INTO pasien (
      nama,
      tanggal_lahir,
      jenis_kelamin,
      alamat,
      nomor_telepon,
      pekerjaan,
      agama,
      status_perkawinan,
      nomor_bpjs,
      riwayat_alergi
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
    [nama, tanggal_lahir, jenis_kelamin, alamat, no_hp, pekerjaan, agama, status_perkawinan, nomor_bpjs, riwayat_alergi]
  );
  return result.rows[0];
};

module.exports = {
  getAllPasien,
  getPasienById,
  createPasien,
  updatePasien,
  deletePasien,
  registerPasien
};