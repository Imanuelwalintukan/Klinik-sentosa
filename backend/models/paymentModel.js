// paymentModel.js - Model untuk modul pembayaran
const db = require('../config/database');

// Model untuk metode pembayaran
const getAllPaymentMethods = async () => {
  try {
    // Cek apakah tabel metode_pembayaran sudah ada
    const tableCheckResult = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'metode_pembayaran'
      ) as table_exists;
    `);
    
    const tableExists = tableCheckResult.rows[0].table_exists;
    
    // Jika tabel belum ada, buat tabelnya
    if (!tableExists) {
      await createPaymentMethodTable();
    }
    
    // Ambil semua metode pembayaran
    const result = await db.query(`
      SELECT id, nama_metode, deskripsi, jenis_pembayaran, is_active, created_at, updated_at
      FROM metode_pembayaran
      ORDER BY created_at DESC
    `);
    
    return result.rows;
  } catch (error) {
    console.error('Error fetching payment methods:', error.message);
    throw error;
  }
};

// Fungsi untuk membuat tabel metode_pembayaran jika belum ada
const createPaymentMethodTable = async () => {
  console.log('Membuat tabel metode_pembayaran...');
  
  // Buat struktur tabel
  await db.query(`
    CREATE TABLE IF NOT EXISTS metode_pembayaran (
      id SERIAL PRIMARY KEY,
      nama_metode VARCHAR(100) NOT NULL UNIQUE,
      deskripsi TEXT,
      jenis_pembayaran VARCHAR(50) CHECK (jenis_pembayaran IN ('tunai', 'non_tunai', 'jaminan')),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Tambahkan data default jika tabel baru dibuat
  const defaultMethods = [
    {nama: 'Tunai', desc: 'Pembayaran dengan uang tunai', type: 'tunai'},
    {nama: 'Transfer Bank', desc: 'Pembayaran melalui transfer antar bank', type: 'non_tunai'},
    {nama: 'Kartu Debit', desc: 'Pembayaran menggunakan kartu debit', type: 'non_tunai'},
    {nama: 'Kartu Kredit', desc: 'Pembayaran menggunakan kartu kredit', type: 'non_tunai'},
    {nama: 'BPJS Kesehatan', desc: 'Pembayaran melalui program BPJS Kesehatan', type: 'jaminan'},
    {nama: 'Asuransi Swasta', desc: 'Pembayaran melalui asuransi kesehatan swasta', type: 'jaminan'}
  ];
  
  for (const method of defaultMethods) {
    try {
      await db.query(`
        INSERT INTO metode_pembayaran (nama_metode, deskripsi, jenis_pembayaran, is_active)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (nama_metode) DO NOTHING
      `, [method.nama, method.desc, method.type, true]);
    } catch (insertError) {
      console.error('Error inserting default payment method:', insertError.message);
    }
  }
};

const getPaymentMethodById = async (id) => {
  const result = await db.query(`
    SELECT id, nama_metode, deskripsi, jenis_pembayaran, is_active, created_at, updated_at
    FROM metode_pembayaran 
    WHERE id = $1
  `, [id]);
  return result.rows[0];
};

const createPaymentMethod = async (methodData) => {
  const { nama_metode, deskripsi, jenis_pembayaran } = methodData;
  const result = await db.query(`
    INSERT INTO metode_pembayaran (nama_metode, deskripsi, jenis_pembayaran, is_active)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [nama_metode, deskripsi, jenis_pembayaran, true]);
  return result.rows[0];
};

const updatePaymentMethod = async (id, methodData) => {
  const { nama_metode, deskripsi, jenis_pembayaran, is_active } = methodData;
  const result = await db.query(`
    UPDATE metode_pembayaran
    SET nama_metode = $2, deskripsi = $3, jenis_pembayaran = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `, [id, nama_metode, deskripsi, jenis_pembayaran, is_active]);
  return result.rows[0];
};

const deletePaymentMethod = async (id) => {
  // Hanya non-aktifkan, bukan hapus
  const result = await db.query(`
    UPDATE metode_pembayaran
    SET is_active = $2
    WHERE id = $1
    RETURNING *
  `, [id, false]);
  return result.rows[0];
};

// Model untuk pembayaran
const getAllPayments = async () => {
  const result = await db.query(`
    SELECT p.*, mp.nama_metode
    FROM pembayaran p
    LEFT JOIN metode_pembayaran mp ON p.id_metode_pembayaran = mp.id
    ORDER BY p.created_at DESC
  `);
  return result.rows;
};

const getPaymentById = async (id) => {
  const result = await db.query(`
    SELECT p.*, mp.nama_metode
    FROM pembayaran p
    LEFT JOIN metode_pembayaran mp ON p.id_metode_pembayaran = mp.id
    WHERE p.id = $1
  `, [id]);
  return result.rows[0];
};

const createPayment = async (paymentData) => {
  const {
    id_resep,
    id_metode_pembayaran,
    jumlah_pembayaran,
    jumlah_dibayarkan = 0,
    jumlah_kembalian = 0,
    status_pembayaran = 'belum_lunas',
    keterangan = ''
  } = paymentData;

  try {
    // Pastikan tabel pembayaran ada
    await db.query(`
      CREATE TABLE IF NOT EXISTS pembayaran (
        id SERIAL PRIMARY KEY,
        id_resep INTEGER REFERENCES resep(id) ON DELETE CASCADE,
        id_metode_pembayaran INTEGER REFERENCES metode_pembayaran(id),
        jumlah_pembayaran DECIMAL(10,2) NOT NULL,
        jumlah_dibayarkan DECIMAL(10,2) DEFAULT 0,
        jumlah_kembalian DECIMAL(10,2) DEFAULT 0,
        status_pembayaran VARCHAR(50) DEFAULT 'belum_lunas',
        keterangan TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Validasi bahwa resep dan metode pembayaran ada
    if (id_resep) {
      const resepCheck = await db.query('SELECT id FROM resep WHERE id = $1', [id_resep]);
      if (resepCheck.rows.length === 0) {
        throw new Error(`Resep dengan ID ${id_resep} tidak ditemukan`);
      }
    }

    if (id_metode_pembayaran) {
      const paymentMethodCheck = await db.query('SELECT id FROM metode_pembayaran WHERE id = $1', [id_metode_pembayaran]);
      if (paymentMethodCheck.rows.length === 0) {
        throw new Error(`Metode pembayaran dengan ID ${id_metode_pembayaran} tidak ditemukan`);
      }
    }

    // Konversi jumlah ke tipe data yang benar
    const convertedJumlahPembayaran = parseFloat(jumlah_pembayaran) || 0;
    const convertedJumlahDibayarkan = parseFloat(jumlah_dibayarkan) || 0;
    const convertedJumlahKembalian = parseFloat(jumlah_kembalian) || 0;

    const result = await db.query(`
      INSERT INTO pembayaran (
        id_resep, id_metode_pembayaran, jumlah_pembayaran,
        jumlah_dibayarkan, jumlah_kembalian, status_pembayaran, keterangan
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      id_resep,
      id_metode_pembayaran,
      convertedJumlahPembayaran,
      convertedJumlahDibayarkan,
      convertedJumlahKembalian,
      status_pembayaran,
      keterangan
    ]);

    return result.rows[0];
  } catch (error) {
    console.error('Error creating payment:', error.message);
    throw error;
  }
};

const updatePayment = async (id, paymentData) => {
  const { id_resep, id_metode_pembayaran, jumlah_pembayaran, jumlah_dibayarkan, jumlah_kembalian, status_pembayaran, keterangan } = paymentData;
  const result = await db.query(`
    UPDATE pembayaran
    SET id_resep = $2, id_metode_pembayaran = $3, jumlah_pembayaran = $4,
        jumlah_dibayarkan = $5, jumlah_kembalian = $6, status_pembayaran = $7, keterangan = $8, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `, [id, id_resep, id_metode_pembayaran, jumlah_pembayaran, jumlah_dibayarkan, jumlah_kembalian, status_pembayaran, keterangan]);
  return result.rows[0];
};

module.exports = {
  getAllPaymentMethods,
  getPaymentMethodById,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment
};