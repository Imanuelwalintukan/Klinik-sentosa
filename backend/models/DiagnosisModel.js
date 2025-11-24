// Model untuk manajemen diagnosa
const db = require('../config/database');

// Fungsi untuk mendapatkan semua diagnosa
const getAllDiagnoses = async () => {
  const result = await db.query(`
    SELECT * FROM diagnosa_spesialis
    ORDER BY spesialisasi_berlaku, nama_diagnosa
  `);
  return result.rows;
};

// Fungsi untuk mendapatkan diagnosa berdasarkan ID
const getDiagnosisById = async (id) => {
  const result = await db.query('SELECT * FROM diagnosa_spesialis WHERE id = $1', [id]);
  return result.rows[0];
};

// Fungsi untuk mendapatkan diagnosa berdasarkan kode
const getDiagnosisByCode = async (kode) => {
  const result = await db.query('SELECT * FROM diagnosa_spesialis WHERE kode_diagnosa = $1', [kode]);
  return result.rows[0];
};

// Fungsi untuk mendapatkan diagnosa berdasarkan spesialisasi
const getDiagnosesBySpecialization = async (spesialisasi) => {
  const result = await db.query(
    'SELECT * FROM diagnosa_spesialis WHERE spesialisasi_berlaku = $1 OR spesialisasi_berlaku = \'Umum\' ORDER BY nama_diagnosa',
    [spesialisasi]
  );
  return result.rows;
};

// Fungsi untuk mendapatkan diagnosa umum (untuk semua spesialisasi)
const getGeneralDiagnoses = async () => {
  const result = await db.query(
    'SELECT * FROM diagnosa_spesialis WHERE spesialisasi_berlaku = \'Umum\' OR spesialisasi_berlaku = \'umum\' ORDER BY nama_diagnosa'
  );
  return result.rows;
};

// Fungsi untuk menambahkan diagnosa baru
const createDiagnosis = async (diagnosaData) => {
  const { kode_diagnosa, nama_diagnosa, deskripsi, spesialisasi_berlaku } = diagnosaData;
  
  const result = await db.query(
    `INSERT INTO diagnosa_spesialis (
      kode_diagnosa, 
      nama_diagnosa, 
      deskripsi, 
      spesialisasi_berlaku
    ) VALUES ($1, $2, $3, $4) RETURNING *`,
    [kode_diagnosa, nama_diagnosa, deskripsi, spesialisasi_berlaku]
  );
  
  return result.rows[0];
};

// Fungsi untuk memperbarui diagnosa
const updateDiagnosis = async (id, diagnosaData) => {
  const { kode_diagnosa, nama_diagnosa, deskripsi, spesialisasi_berlaku } = diagnosaData;
  
  const result = await db.query(
    `UPDATE diagnosa_spesialis SET
      kode_diagnosa = $1,
      nama_diagnosa = $2,
      deskripsi = $3,
      spesialisasi_berlaku = $4,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $5 RETURNING *`,
    [kode_diagnosa, nama_diagnosa, deskripsi, spesialisasi_berlaku, id]
  );
  
  return result.rows[0];
};

// Fungsi untuk menghapus diagnosa
const deleteDiagnosis = async (id) => {
  await db.query('DELETE FROM diagnosa_spesialis WHERE id = $1', [id]);
  return true;
};

// Fungsi untuk mendapatkan diagnosa yang sering digunakan oleh dokter tertentu
const getFrequentDiagnosesForDoctor = async (dokterId) => {
  const result = await db.query(`
    SELECT dd.kode_diagnosa, dd.nama_diagnosa, dd.digunakan_sebanyak
    FROM diagnosa_dokter dd
    WHERE dd.id_dokter = $1
    ORDER BY dd.digunakan_sebanyak DESC
    LIMIT 10
  `, [dokterId]);
  return result.rows;
};

// Fungsi untuk menambahkan/memperbarui diagnosa yang digunakan oleh dokter
const addDoctorDiagnosis = async (dokterId, diagnosaData) => {
  const { kode_diagnosa, nama_diagnosa } = diagnosaData;
  
  const existingDiagnosis = await db.query(
    'SELECT id, digunakan_sebanyak FROM diagnosa_dokter WHERE id_dokter = $1 AND kode_diagnosa = $2',
    [dokterId, kode_diagnosa]
  );
  
  if (existingDiagnosis.rows.length > 0) {
    // Jika diagnosa sudah pernah digunakan, tambahkan counter
    const result = await db.query(
      'UPDATE diagnosa_dokter SET digunakan_sebanyak = digunakan_sebanyak + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [existingDiagnosis.rows[0].id]
    );
    return result.rows[0];
  } else {
    // Jika belum pernah digunakan, tambahkan baru
    const result = await db.query(
      'INSERT INTO diagnosa_dokter (id_dokter, kode_diagnosa, nama_diagnosa) VALUES ($1, $2, $3) RETURNING *',
      [dokterId, kode_diagnosa, nama_diagnosa]
    );
    return result.rows[0];
  }
};

module.exports = {
  getAllDiagnoses,
  getDiagnosisById,
  getDiagnosisByCode,
  getDiagnosesBySpecialization,
  getGeneralDiagnoses,
  createDiagnosis,
  updateDiagnosis,
  deleteDiagnosis,
  getFrequentDiagnosesForDoctor,
  addDoctorDiagnosis
};