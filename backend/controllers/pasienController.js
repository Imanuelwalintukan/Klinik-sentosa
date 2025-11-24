// backend/controllers/pasienController.js

const db = require('../config/database');

// Mendapatkan semua data pasien
exports.getAllPasien = async (req, res) => {
  try {
    const query = `
      SELECT
        p.id,
        p.nama,
        p.nomor_telepon,
        p.alamat,
        to_char(p.tanggal_lahir, 'YYYY-MM-DD') as tanggal_lahir,
        p.jenis_kelamin,
        p.nomor_bpjs,
        CASE
          WHEN EXISTS (
            SELECT 1
            FROM pemeriksaan pem
            WHERE pem.id_pasien = p.id
            AND pem.tanggal_pemeriksaan >= date_trunc('day', CURRENT_TIMESTAMP)
            AND pem.tanggal_pemeriksaan < date_trunc('day', CURRENT_TIMESTAMP) + interval '1 day'
          ) THEN 'Sudah Diperiksa'
          ELSE 'Belum Diperiksa'
        END AS status_pemeriksaan
      FROM
        pasien p
      ORDER BY
        p.nama ASC
    `;
    const { rows } = await db.query(query);
    res.status(200).json({
      success: true,
      message: 'Data semua pasien berhasil diambil.',
      data: rows,
    });
  } catch (error) {
    console.error('Error getting all pasien:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data pasien. Terjadi kesalahan server.',
      error: error.message,
    });
  }
};

// Mendapatkan data pasien berdasarkan ID
exports.getPasienById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query('SELECT id, nama, nomor_telepon, alamat, to_char(tanggal_lahir, \'YYYY-MM-DD\') as tanggal_lahir, jenis_kelamin, nomor_bpjs FROM pasien WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pasien tidak ditemukan.' });
    }
    res.status(200).json({
      success: true,
      message: 'Data pasien berhasil ditemukan.',
      data: rows[0],
    });
  } catch (error) {
    console.error(`Error getting pasien by ID ${id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data pasien. Terjadi kesalahan server.',
      error: error.message,
    });
  }
};

// Membuat data pasien baru
exports.createPasien = async (req, res) => {
  const { nama, nomor_telepon, alamat, tanggal_lahir, jenis_kelamin, nomor_bpjs } = req.body;

  // Validasi dasar
  if (!nama || !nomor_telepon || !alamat || !tanggal_lahir || !jenis_kelamin) {
    return res.status(400).json({ success: false, message: 'Semua field wajib diisi kecuali Nomor BPJS.' });
  }

  try {
    const { rows } = await db.query(
      'INSERT INTO pasien (nama, nomor_telepon, alamat, tanggal_lahir, jenis_kelamin, nomor_bpjs) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nama, nomor_telepon',
      [nama, nomor_telepon, alamat, tanggal_lahir, jenis_kelamin, nomor_bpjs]
    );
    res.status(201).json({
      success: true,
      message: 'Pasien baru berhasil ditambahkan.',
      data: rows[0],
    });
  } catch (error) {
    console.error('Error creating pasien:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan pasien. Terjadi kesalahan server.',
      error: error.message,
    });
  }
};

// Memperbarui data pasien
exports.updatePasien = async (req, res) => {
  const { id } = req.params;
  const { nama, nomor_telepon, alamat, tanggal_lahir, jenis_kelamin, nomor_bpjs } = req.body;

  if (!nama || !nomor_telepon || !alamat || !tanggal_lahir || !jenis_kelamin) {
    return res.status(400).json({ success: false, message: 'Semua field wajib diisi kecuali Nomor BPJS.' });
  }

  try {
    const { rows } = await db.query(
      'UPDATE pasien SET nama = $1, nomor_telepon = $2, alamat = $3, tanggal_lahir = $4, jenis_kelamin = $5, nomor_bpjs = $6 WHERE id = $7 RETURNING id, nama',
      [nama, nomor_telepon, alamat, tanggal_lahir, jenis_kelamin, nomor_bpjs, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pasien tidak ditemukan.' });
    }
    res.status(200).json({
      success: true,
      message: 'Data pasien berhasil diperbarui.',
      data: rows[0],
    });
  } catch (error) {
    console.error(`Error updating pasien by ID ${id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui data pasien. Terjadi kesalahan server.',
      error: error.message,
    });
  }
};

// Menghapus data pasien
exports.deletePasien = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM pasien WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Pasien tidak ditemukan.' });
    }
    res.status(200).json({
      success: true,
      message: 'Pasien berhasil dihapus.',
    });
  } catch (error) {
    console.error(`Error deleting pasien by ID ${id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus pasien. Terjadi kesalahan server.',
      error: error.message,
    });
  }
};

// Mendaftarkan pasien baru (dari form registrasi publik)
exports.registerPasien = async (req, res) => {
  const { nama, nomor_telepon, alamat, tanggal_lahir, jenis_kelamin, nomor_bpjs } = req.body;

  if (!nama || !nomor_telepon || !alamat || !tanggal_lahir || !jenis_kelamin) {
    return res.status(400).json({ success: false, message: 'Semua field wajib diisi kecuali Nomor BPJS.' });
  }

  try {
    const { rows } = await db.query(
      'INSERT INTO pasien (nama, nomor_telepon, alamat, tanggal_lahir, jenis_kelamin, nomor_bpjs) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nama, nomor_telepon',
      [nama, nomor_telepon, alamat, tanggal_lahir, jenis_kelamin, nomor_bpjs]
    );
    res.status(201).json({
      success: true,
      message: 'Pendaftaran Anda sebagai pasien baru berhasil!',
      data: rows[0],
    });
  } catch (error) {
    // Tangani error spesifik jika nomor telepon sudah terdaftar (jika ada unique constraint)
    if (error.code === '23505') { // Asumsi kode untuk unique violation di PostgreSQL
      return res.status(409).json({
        success: false,
        message: 'Gagal mendaftar. Nomor telepon sudah digunakan.',
        error: error.message,
      });
    }
    console.error('Error registering pasien:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mendaftar. Terjadi kesalahan server.',
      error: error.message,
    });
  }
};
