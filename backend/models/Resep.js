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

// Fungsi untuk menambahkan beberapa resep sekaligus dalam satu transaksi
const createBulkResep = async (examinationId, items) => {
  const client = await db.pool.connect(); // Dapatkan client dari pool
  try {
    await client.query('BEGIN'); // Mulai transaksi

    const createdReseps = [];
    for (const item of items) {
      const { id_obat, jumlah, aturan_pakai } = item;
      const result = await client.query(
        'INSERT INTO resep (id_pemeriksaan, id_obat, jumlah, aturan_pakai) VALUES ($1, $2, $3, $4) RETURNING *',
        [examinationId, id_obat, jumlah, aturan_pakai]
      );
      createdReseps.push(result.rows[0]);
    }

    await client.query('COMMIT'); // Commit transaksi
    return createdReseps;
  } catch (e) {
    await client.query('ROLLBACK'); // Rollback jika terjadi error
    throw e; // Lemparkan error ke controller
  } finally {
    client.release(); // Lepaskan client kembali ke pool
  }
};

// Fungsi untuk dispense resep
const dispense = async (pemeriksaanId) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Ambil semua item resep
    const resepItemsResult = await client.query('SELECT * FROM resep WHERE id_pemeriksaan = $1', [pemeriksaanId]);
    const resepItems = resepItemsResult.rows;

    if (resepItems.length === 0) {
      throw new Error('Tidak ada item resep untuk pemeriksaan ini.');
    }

    // 2. Cek status, pastikan belum 'Selesai'
    const pemStatus = await client.query('SELECT status_resep FROM pemeriksaan WHERE id = $1', [pemeriksaanId]);
    if(pemStatus.rows[0].status_resep === 'Selesai'){
      throw new Error('Resep ini sudah pernah diberikan.');
    }

    // 3. Cek stok untuk semua obat
    for (const item of resepItems) {
      const obatResult = await client.query('SELECT stok, nama_obat FROM obat WHERE id = $1', [item.id_obat]);
      const obat = obatResult.rows[0];
      if (!obat || obat.stok < item.jumlah) {
        throw new Error(`Stok tidak mencukupi untuk obat: ${obat ? obat.nama_obat : 'ID ' + item.id_obat}. Stok tersisa: ${obat ? obat.stok : 0}, dibutuhkan: ${item.jumlah}`);
      }
    }

    // 4. Jika stok cukup, kurangi stok
    for (const item of resepItems) {
      await client.query(
        'UPDATE obat SET stok = stok - $1 WHERE id = $2',
        [item.jumlah, item.id_obat]
      );
    }

    // 5. Update status pemeriksaan menjadi 'Selesai'
    await client.query(
      "UPDATE pemeriksaan SET status_resep = 'Selesai' WHERE id = $1",
      [pemeriksaanId]
    );

    await client.query('COMMIT');
    return { success: true, message: 'Resep berhasil diberikan dan stok obat telah diperbarui.' };

  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

module.exports = {
  getAllResep,
  getResepById,
  getResepByPemeriksaanId,
  createResep,
  updateResep,
  deleteResep,
  createBulkResep,
  dispense
};